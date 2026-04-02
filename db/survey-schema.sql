-- Survey System Schema
-- Anket sistemi için database tabloları

-- ============================================================================
-- SURVEYS TABLE - Anketler
-- ============================================================================
CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,           -- "Kaş'ta En Sevdiğiniz Mekan?"
  description TEXT,                       -- Opsiyonel açıklama
  is_active BOOLEAN DEFAULT true,        -- Aktif/pasif
  allow_user_options BOOLEAN DEFAULT true, -- Kullanıcı şık ekleyebilir mi?
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,                     -- NULL = sınırsız
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- SURVEY OPTIONS TABLE - Anket Seçenekleri
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_options (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  option_text VARCHAR(255) NOT NULL,     -- "Demeti Kaş"
  option_order INTEGER DEFAULT 0,        -- Sıralama için

  -- Kullanıcı/Admin ayrımı
  submitted_by VARCHAR(20) DEFAULT 'admin', -- 'admin' veya 'user'
  submitted_ip VARCHAR(45),              -- Hangi IP ekledi

  -- Moderasyon
  is_reviewed BOOLEAN DEFAULT false,     -- Admin baktı mı?
  reviewed_by VARCHAR(100),              -- Hangi admin baktı
  reviewed_at TIMESTAMP,                 -- Ne zaman baktı

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_survey_options_survey_id ON survey_options(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_options_submitted_by ON survey_options(submitted_by);

-- ============================================================================
-- SURVEY VOTES TABLE - Oylar
-- ============================================================================
CREATE TABLE IF NOT EXISTS survey_votes (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  option_id INTEGER REFERENCES survey_options(id) ON DELETE CASCADE,

  -- IP kontrolü için
  ip_address VARCHAR(45) NOT NULL,       -- IPv4/IPv6
  user_agent TEXT,                       -- Opsiyonel (spam analizi için)

  voted_at TIMESTAMP DEFAULT NOW(),

  -- Her IP, her ankete sadece 1 oy verebilir
  UNIQUE(survey_id, ip_address)
);

-- Indexes for faster vote counting
CREATE INDEX IF NOT EXISTS idx_survey_votes_survey_id ON survey_votes(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_votes_option_id ON survey_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_survey_votes_ip ON survey_votes(ip_address);

-- ============================================================================
-- USER OPTION LIMITS - Kullanıcı öneri limiti kontrolü
-- ============================================================================
-- Her IP, her ankete max 3 seçenek ekleyebilir
CREATE OR REPLACE FUNCTION check_user_option_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.submitted_by = 'user' THEN
    IF (
      SELECT COUNT(*)
      FROM survey_options
      WHERE survey_id = NEW.survey_id
        AND submitted_ip = NEW.submitted_ip
        AND submitted_by = 'user'
    ) >= 3 THEN
      RAISE EXCEPTION 'Bu ankete maksimum 3 seçenek ekleyebilirsiniz';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER survey_option_limit_trigger
  BEFORE INSERT ON survey_options
  FOR EACH ROW
  EXECUTE FUNCTION check_user_option_limit();

-- ============================================================================
-- HELPER VIEWS - Yardımcı View'ler
-- ============================================================================

-- Aktif anketler ve oy sayıları
CREATE OR REPLACE VIEW active_surveys_summary AS
SELECT
  s.id,
  s.title,
  s.description,
  s.is_active,
  s.allow_user_options,
  COUNT(DISTINCT sv.id) as total_votes,
  COUNT(DISTINCT CASE WHEN so.submitted_by = 'user' THEN so.id END) as user_options_count,
  COUNT(DISTINCT CASE WHEN so.submitted_by = 'user' AND NOT so.is_reviewed THEN so.id END) as unreviewed_options_count,
  s.created_at
FROM surveys s
LEFT JOIN survey_votes sv ON s.id = sv.survey_id
LEFT JOIN survey_options so ON s.id = so.survey_id
WHERE s.is_active = true
  AND (s.end_date IS NULL OR s.end_date > NOW())
GROUP BY s.id, s.title, s.description, s.is_active, s.allow_user_options, s.created_at
ORDER BY s.created_at DESC;

-- Anket sonuçları (oy sayıları ile)
CREATE OR REPLACE VIEW survey_results AS
SELECT
  so.id as option_id,
  so.survey_id,
  so.option_text,
  so.option_order,
  so.submitted_by,
  so.is_reviewed,
  COUNT(sv.id) as vote_count,
  ROUND(
    COUNT(sv.id)::numeric * 100.0 /
    NULLIF((SELECT COUNT(*) FROM survey_votes WHERE survey_id = so.survey_id), 0),
    1
  ) as percentage
FROM survey_options so
LEFT JOIN survey_votes sv ON so.id = sv.option_id
GROUP BY so.id, so.survey_id, so.option_text, so.option_order, so.submitted_by, so.is_reviewed
ORDER BY so.survey_id, so.option_order, vote_count DESC;

-- ============================================================================
-- SAMPLE DATA (Opsiyonel - test için)
-- ============================================================================

-- Örnek anket
INSERT INTO surveys (title, description, allow_user_options) VALUES
('Kaş''ta En Sevdiğiniz Mekan Hangisi?', 'Kaş''ın en popüler mekanlarından favorinizi seçin!', true);

-- Örnek seçenekler
INSERT INTO survey_options (survey_id, option_text, option_order, submitted_by) VALUES
(1, 'Demeti Kaş', 1, 'admin'),
(1, 'Zühtü', 2, 'admin'),
(1, 'Hi Jazz', 3, 'admin'),
(1, 'Dragoman Bahçe', 4, 'admin'),
(1, 'Ruhibey Meyhanesi Kaş', 5, 'admin');
