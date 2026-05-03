-- placeholder-batch.sql
-- Amac: public.places tablosuna TOPLU placeholder mekan ekleyip ANINDA yayina almak.
-- Her satir: (slug, name, category_primary, kasguide_badge)
-- Diger tum alanlar (aciklamalar, images, timestamps, raw_snapshot) otomatik doldurulur.
--
-- Idempotent: WHERE NOT EXISTS (SELECT ... WHERE slug=...) → ayni slug varsa satir atlanir.
-- Guvenli:   WHERE kategori whitelist → gecersiz kategori gelirse o satir atlanir.
-- Izlenebilir: raw_snapshot->>'source' = 'manual_placeholder' → sonra tek SQL ile listelenir.
--
-- AKIS:
--   1) Asagidaki `input` CTE'sindeki VALUES bloguna yeni satirlar ekle.
--   2) Supabase SQL editor → Run.
--   3) En alttaki SELECT bloku kac satir eklendigini gosterir.
--   4) Icerigi doldurmak icin: UPDATE public.places SET short_description=..., long_description=...
--      WHERE slug = 'xxx';
--
-- Whitelist (category_primary):
--   bar, meyhane, restoran, cafe, kahvalti, oteller, tarih, doga, plaj,
--   carsi, gezi, dalis, aktivite, patililer
--
-- Rozet (kasguide_badge):
--   recommend | must-see | hidden-gem | local-favorite

WITH input(slug, name, category_primary, badge) AS (
  VALUES
    -- === ORNEK SATIRLAR (silebilir / degistirebilirsin) ===
('nur-pansiyon-restoran-kas', 'Nur Pansiyon restoran', 'restoran', 'local-favorite'),
('derya-beach-restoran-kas', 'Derya Beach restoran', 'restoran', 'recommend'),
('lukka-dining-kas', 'Lukka Dining', 'restoran', 'must-see'),
('olea-nova-restoran-kas', 'Olea Nova restoran', 'restoran', 'recommend'),
('peninsula-gardens-restoran-kas', 'Peninsula Gardens restoran', 'restoran', 'must-see'),
('hotel-club-phellos-restoran-kas', 'Club Phellos restoran', 'restoran', 'local-favorite'),
('suna-s-in-place-kas', 'Suna s In Place', 'restoran', 'hidden-gem'),
('isik-restoran-kas', 'Işık restoran', 'restoran', 'local-favorite'),
('cafe-de-kas-restoran-kas', 'Cafe de Kaş restoran', 'restoran', 'recommend'),
('dostlar-lokantasi-kas', 'Dostlar Lokantası', 'restoran', 'local-favorite'),
('bi-lokma-breakfast-kas', 'Bi Lokma Breakfast', 'restoran', 'local-favorite'),
('kas-kahvalti-dunyasi-kas', 'Kaş Kahvaltı Dünyası', 'restoran', 'local-favorite'),
('leyla-restoran-kas', 'Leyla restoran', 'restoran', 'hidden-gem'),
('pinarbasi-restoran-kas', 'Pınarbaşı restoran', 'restoran', 'local-favorite'),
('yakamoz-restoran-kas', 'Yakamoz restoran Kaş', 'restoran', 'recommend'),
('green-beach-restoran-kas', 'Green Beach restoran', 'restoran', 'recommend'),
('antiphellos-restoran-kas', 'Antiphellos restoran', 'restoran', 'must-see'),
('kas-marina-restoran-kas', 'Kaş Marina restoran', 'restoran', 'recommend'),
('sailors-restoran-kas', 'Sailors restoran', 'restoran', 'hidden-gem'),
('white-house-restoran-kas', 'White House restoran', 'restoran', 'hidden-gem'),
('blue-island-restoran-kas', 'Blue Island restoran', 'restoran', 'hidden-gem'),
('limanaagzi-restoran-kas', 'Limanağzı restoran', 'restoran', 'must-see'),
('nar-beach-restoran-kas', 'Nar Beach restoran', 'restoran', 'recommend'),
('capa-balIk-restoran-kas', 'Çapa Balık restoran', 'restoran', 'must-see'),
('gokkusagi-balIk-kas', 'Gökkuşağı Balık', 'restoran', 'local-favorite'),
('ada-balIk-restoran-kas', 'Ada Balık restoran', 'restoran', 'recommend'),
('deniz-feneri-restoran-kas', 'Deniz Feneri restoran', 'restoran', 'hidden-gem'),
('kalkan-fish-house-kalkan', 'Kalkan Fish House', 'restoran', 'must-see'),
('sandal-restoran-kalkan', 'Sandal restoran', 'restoran', 'recommend'),
('aqua-bistro-restoran-kalkan', 'Aqua Bistro restoran', 'restoran', 'recommend'),
('johnnys-restoran-kalkan', 'Johnny s restoran', 'restoran', 'local-favorite'),
('cafe-vita-restoran-kalkan', 'Cafe Vita restoran', 'restoran', 'must-see'),
('gurus-restoran-kalkan', 'Guru s restoran', 'restoran', 'recommend'),
('rose-restoran-kalkan', 'Rose restoran', 'restoran', 'hidden-gem'),
('likya-restoran-kalkan', 'Likya restoran', 'restoran', 'local-favorite'),
('symphony-restoran-kalkan', 'Symphony restoran', 'restoran', 'hidden-gem'),
('begonvil-restoran-kalkan', 'Begonvil restoran', 'restoran', 'hidden-gem'),
('sunset-lounge-restoran-kalkan', 'Sunset Lounge restoran', 'restoran', 'must-see'),
('elite-restoran-kalkan', 'Elite restoran', 'restoran', 'hidden-gem'),
('dream-restoran-kalkan', 'Dream restoran', 'restoran', 'hidden-gem'),
('mediteran-restoran-kalkan', 'Mediterranean restoran', 'restoran', 'recommend'),
('marleys-restoran-kalkan', 'Marleys restoran', 'restoran', 'hidden-gem'),
('escape-restoran-kalkan', 'Escape restoran', 'restoran', 'hidden-gem'),
('harbour-restoran-kalkan', 'Harbour restoran', 'restoran', 'must-see'),
('oasis-restoran-kalkan', 'Oasis restoran', 'restoran', 'hidden-gem'),
('vista-restoran-kalkan', 'Vista restoran', 'restoran', 'recommend'),
('gardenia-restoran-kalkan', 'Gardenia restoran', 'restoran', 'hidden-gem'),
('blue-note-restoran-kalkan', 'Blue Note restoran', 'restoran', 'hidden-gem'),
('amber-restoran-kalkan', 'Amber restoran', 'restoran', 'recommend')
    -- , ('yeni-slug',            'Yeni Mekan Adı',         'restoran',  'recommend')
)
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
  i.slug,
  i.name,
  i.name,                                                                        -- headline = name
  'Detaylı bilgiler yakında eklenecektir.',                                      -- short_description (placeholder)
  i.name || ' için kapsamlı rehber içeriği yakında eklenecektir. Kaş Guide ekibi olarak detayları düzenli olarak güncelliyoruz.',
  i.category_primary,
  ARRAY[i.category_primary]::text[],
  i.badge,
  ARRAY[i.badge]::text[],
  'published',                                                                   -- ANINDA YAYIN
  'verified',
  '[]'::jsonb,
  '[]'::jsonb,
  jsonb_build_object(
    'source', 'manual_placeholder',
    'batch_added_at', now(),
    'note', 'Batch placeholder; icerik daha sonra doldurulacak.'
  ),
  now(),
  now()
FROM input i
WHERE i.category_primary IN (
  'bar','meyhane','restoran','cafe','kahvalti','oteller',
  'tarih','doga','plaj','carsi','gezi','dalis','aktivite','patililer'
)
AND i.badge IN ('recommend','must-see','hidden-gem','local-favorite')
-- Idempotent: ayni slug varsa satir atlanir. NOT EXISTS, slug partial unique index
-- (WHERE slug IS NOT NULL) durumunda da evrensel calisir.
AND NOT EXISTS (
  SELECT 1 FROM public.places p WHERE p.slug = i.slug
);

-- ============================================================================
-- DOGRULAMA & YONETIM SORGULARI
-- ============================================================================

-- 1) Bu batch'te eklenmis (ya da daha onceden eklenmis) tum placeholder'lar:
SELECT
  slug,
  name,
  category_primary,
  kasguide_badge,
  status,
  updated_at
FROM public.places
WHERE raw_snapshot->>'source' = 'manual_placeholder'
ORDER BY updated_at DESC
LIMIT 100;

-- 2) Kategori dagilimi (placeholder'larda):
-- SELECT category_primary, count(*)
-- FROM public.places
-- WHERE raw_snapshot->>'source' = 'manual_placeholder'
-- GROUP BY category_primary
-- ORDER BY count(*) DESC;

-- 3) Icerik hala placeholder olan kayitlari bulmak (doldurma listesi):
-- SELECT slug, name, category_primary
-- FROM public.places
-- WHERE raw_snapshot->>'source' = 'manual_placeholder'
--   AND long_description LIKE '%yakında eklenecektir%'
-- ORDER BY created_at ASC;

-- 4) Belirli bir placeholder'in icerigini doldurma ornegi:
-- UPDATE public.places
-- SET short_description = 'Gercek kisa aciklama burada.',
--     long_description  = 'Gercek uzun aciklama burada. 300+ kelime editoryal icerik.',
--     updated_at        = now()
-- WHERE slug = 'bahce-restaurant-kas';

-- 5) Bir placeholder'i yayindan kaldirmak (silmeden):
-- UPDATE public.places SET status = 'archived', updated_at = now()
-- WHERE slug = 'xxx' AND raw_snapshot->>'source' = 'manual_placeholder';

-- 6) Tum placeholder'lari toplu silme (DIKKATLI):
-- DELETE FROM public.places
-- WHERE raw_snapshot->>'source' = 'manual_placeholder';
