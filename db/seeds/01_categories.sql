-- Seed Categories
-- Based on analysis of categories.js

INSERT INTO categories (slug, name, icon_code, color_code) VALUES
-- İlk Sıra - Yeme İçme
('bar', 'Bar', '🍸', '#FF6B35'),
('meyhane', 'Meyhane', '🍷', '#9B59B6'),
('restoran', 'Restoran', '🍽️', '#E74C3C'),
('cafe', 'Cafe', '☕', '#16A085'),
('kahvalti', 'Kahvaltı', '🥐', '#F39C12'),
-- İkinci Sıra - Aktivite & Kültür
('tarih', 'Tarih', '🏛️', '#5D4E37'),
('doga', 'Doğa', '🌿', '#2ECC71'),
('dalis', 'Dalış', '🤿', '#00BCD4'),
 ('aktivite', 'Aktivite', '🏄', '#F59E0B'),
  ('sergi', 'Sergi', '🖼️', '#EC4899'),
  -- Son Sıra - Diğer
('carsi', 'Çarşı', '🛍️', '#6B7280'),
('articles', 'Yazılar', '📝', '#64748B'),
('faqspecial', 'Özel Soru Serileri', '❓', '#8B5CF6'),
('places', 'Gezi', '🗺️', '#3B82F6'),
('plaj', 'Plaj', '🏖️', '#06B6D4'),
('roportaj', 'Röportaj', '🎙️', '#8B5CF6'),
('fotograf', 'Fotoğraf', '📷', '#6366F1'),
('acildurum', 'Acil Durum', '🚨', '#EF4444')
ON CONFLICT (slug) DO NOTHING;
