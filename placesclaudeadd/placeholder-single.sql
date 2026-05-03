-- placeholder-single.sql
-- Amaç: public.places tablosuna TEK bir placeholder mekan ekleyip ANINDA yayına almak.
-- short_description / long_description "yakında eklenecektir" placeholder içerir;
-- gerçek içerik daha sonra admin panelinden veya ayrı UPDATE ile doldurulur.
--
-- Hedef tablo  : public.places  (UUID PK, Supabase)
-- Zorunlu alan : name, category_primary, status
-- Tekrarlı run : WHERE NOT EXISTS guard'i → aynı slug varsa yeni kayıt eklemez (idempotent).
--
-- Kullanım:
--   1) Aşağıdaki dört değeri düzenle: slug, name, category_primary, kasguide_badge.
--   2) Supabase SQL editörüne yapıştır → Run.
--   3) Alttaki SELECT bloku eklenen satırı doğrular.
--
-- Whitelist (category_primary için geçerli ID'ler, src/lib/categories.ts ile aynı):
--   bar, meyhane, restoran, cafe, kahvalti, oteller, tarih, doga, plaj,
--   carsi, gezi, dalis, aktivite, patililer
--
-- Rozet (kasguide_badge) önerileri: recommend | must-see | hidden-gem | local-favorite

-- Idempotent: WHERE NOT EXISTS guard → ayni slug varsa yeni kayit eklemez.
-- (slug icin partial unique index var: WHERE slug IS NOT NULL; NOT EXISTS evrensel calisir.)

INSERT INTO public.places (
  slug,
  name,
  headline,
  short_description,
  long_description,
  category_primary,
  category_ids,
  kasguide_badge,
  kasguide_badges,
  status,
  verification_status,
  images,
  source_records,
  raw_snapshot,
  created_at,
  updated_at
)
SELECT
  'ornek-kafe-kas',                                                             -- slug
  'Örnek Kafe',                                                                 -- name
  'Örnek Kafe',                                                                 -- headline
  'Detaylı bilgiler yakında eklenecektir.',                                     -- short_description
  'Bu mekan için kapsamlı rehber içeriği yakında eklenecektir. Kaş Guide ekibi olarak detayları düzenli olarak güncelliyoruz.',
  'cafe',                                                                        -- category_primary
  ARRAY['cafe']::text[],                                                         -- category_ids (multi-category desteği)
  'recommend',                                                                   -- kasguide_badge
  ARRAY['recommend']::text[],                                                    -- kasguide_badges (multi)
  'published',                                                                   -- ANINDA YAYIN
  'verified',
  '[]'::jsonb,
  '[]'::jsonb,
  jsonb_build_object(
    'source', 'manual_placeholder',
    'added_at', now(),
    'note', 'Placeholder kayit; icerik daha sonra doldurulacak.'
  ),
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.places p WHERE p.slug = 'ornek-kafe-kas'
);

-- Dogrulama: son eklenen placeholder kayitlari goster
SELECT
  id,
  slug,
  name,
  category_primary,
  status,
  updated_at
FROM public.places
WHERE raw_snapshot->>'source' = 'manual_placeholder'
ORDER BY updated_at DESC
LIMIT 10;
