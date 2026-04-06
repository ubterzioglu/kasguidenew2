-- Kaş Guide / public.places örnek ekleme sorguları
-- Amaç: dış bir agent doğrudan places tablosuna yazabilsin.
-- Not:
-- 1) Manuel ekleme için basit INSERT kullan.
-- 2) Harici kaynak (Google / OSM / custom scraper) için UPSERT kullan.
-- 3) JSONB alanları geçerli JSON olmalı.

-- =========================================================
-- 1) MANUEL / ADMIN EKLEME ÖRNEĞİ
-- =========================================================
insert into public.places (
  slug,
  name,
  category_primary,
  address,
  lat,
  lng,
  phone,
  website,
  opening_hours,
  status,
  verification_status,
  headline,
  short_description,
  long_description,
  kasguide_badge,
  primary_source_name,
  primary_source_id,
  source_url,
  imported_at,
  intake_channel,
  is_sweeped,
  source_sweep_id,
  grid_key,
  cell_id,
  google_maps_uri,
  review_reason,
  review_notes,
  review_score,
  merge_target_place_id,
  images,
  source_records,
  raw_snapshot
) values (
  'mavi-kose-bar',
  'Mavi Kose Bar',
  'bar',
  'Andifli Mah. Liman Sok. No:12, Kas / Antalya',
  36.201245,
  29.637810,
  '+90 242 123 45 67',
  'https://mavikosebar.example.com',
  'Her gun 16:00-01:00',
  'admin',
  'reviewed',
  'Kas merkezde gun batimi icin sakin bir teras bari',
  'Mavi Kose Bar, kokteyl ve gun batimi manzarasi icin one cikan sakin bir bulusma noktasi.',
  'Mavi Kose Bar, Kas merkezde gun batimini izlemek isteyenler icin sakin bir teras deneyimi sunar. Kokteyl menusu, merkezi konumu ve rahat atmosferiyle aksama yumusak bir baslangic yapmak isteyenler icin uygundur.',
  'Kas Guide Onerir',
  'manual_admin',
  'manual-mavi-kose-bar-001',
  null,
  timezone('utc', now()),
  'manual',
  false,
  null,
  null,
  null,
  null,
  'Admin panel disindan manuel eklendi.',
  'Ilk kayit.',
  null,
  null,
  jsonb_build_array(
    jsonb_build_object(
      'url', 'https://images.example.com/mavi-kose-1.jpg',
      'alt_text', 'Mavi Kose Bar teras gorunumu',
      'source_name', 'admin_manual',
      'is_cover', true,
      'sort_order', 0
    ),
    jsonb_build_object(
      'url', 'https://images.example.com/mavi-kose-2.jpg',
      'alt_text', 'Mavi Kose Bar aksam ambiyansi',
      'source_name', 'admin_manual',
      'is_cover', false,
      'sort_order', 1
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'source_name', 'manual_admin',
      'source_id', 'manual-mavi-kose-bar-001',
      'source_url', null,
      'is_primary', true,
      'first_seen_at', timezone('utc', now()),
      'last_seen_at', timezone('utc', now()),
      'raw_place_id', null
    )
  ),
  jsonb_build_object(
    'import_method', 'manual_sql',
    'created_by', 'external-agent',
    'notes', 'Bu kayit ornek SQL ile eklendi.'
  )
);


-- =========================================================
-- 2) HARİCİ AGENT / SCRAPER İÇİN UPSERT ÖRNEĞİ
--    Aynı source_name + source_id gelirse duplicate oluşturmaz.
-- =========================================================
insert into public.places (
  slug,
  name,
  category_primary,
  address,
  lat,
  lng,
  phone,
  website,
  opening_hours,
  status,
  verification_status,
  headline,
  short_description,
  long_description,
  kasguide_badge,
  primary_source_name,
  primary_source_id,
  source_url,
  imported_at,
  intake_channel,
  is_sweeped,
  source_sweep_id,
  grid_key,
  cell_id,
  google_maps_uri,
  review_reason,
  review_notes,
  review_score,
  merge_target_place_id,
  images,
  source_records,
  raw_snapshot
) values (
  null,
  'Kas Marina Cafe',
  'kafe',
  'Andifli Mah. Marina Yolu No:4, Kas / Antalya',
  36.198765,
  29.640321,
  '+90 242 555 11 22',
  'https://kasmarinacafe.example.com',
  null,
  'pending',
  'pending',
  'Marina yakininda kahve ve kahvalti duragi',
  'Kas Marina Cafe, marina cevresinde kahve ve hafif kahvalti secenekleri sunan bir mekandir.',
  '',
  '',
  'custom_scraper',
  'custom-kas-marina-cafe-001',
  'https://source.example.com/kas-marina-cafe',
  timezone('utc', now()),
  'import',
  false,
  null,
  null,
  null,
  null,
  'Dis agent scraper sonucu eklendi.',
  'Admin kontrolu bekliyor.',
  null,
  null,
  jsonb_build_array(
    jsonb_build_object(
      'url', 'https://images.example.com/kas-marina-cafe-1.jpg',
      'alt_text', 'Kas Marina Cafe dis cephe',
      'source_name', 'custom_scraper',
      'is_cover', true,
      'sort_order', 0
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'source_name', 'custom_scraper',
      'source_id', 'custom-kas-marina-cafe-001',
      'source_url', 'https://source.example.com/kas-marina-cafe',
      'is_primary', true,
      'first_seen_at', timezone('utc', now()),
      'last_seen_at', timezone('utc', now()),
      'raw_place_id', null
    )
  ),
  jsonb_build_object(
    'import_method', 'external_agent',
    'agent_name', 'research-agent',
    'scraped_name', 'Kas Marina Cafe',
    'scraped_category', 'kafe'
  )
)
on conflict (primary_source_name, primary_source_id)
where primary_source_name is not null and primary_source_id is not null
do update set
  name = excluded.name,
  category_primary = excluded.category_primary,
  address = excluded.address,
  lat = excluded.lat,
  lng = excluded.lng,
  phone = excluded.phone,
  website = excluded.website,
  headline = excluded.headline,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  source_url = excluded.source_url,
  imported_at = excluded.imported_at,
  intake_channel = excluded.intake_channel,
  is_sweeped = excluded.is_sweeped,
  grid_key = excluded.grid_key,
  cell_id = excluded.cell_id,
  google_maps_uri = excluded.google_maps_uri,
  review_reason = excluded.review_reason,
  review_notes = excluded.review_notes,
  review_score = excluded.review_score,
  images = excluded.images,
  source_records = excluded.source_records,
  raw_snapshot = coalesce(public.places.raw_snapshot, '{}'::jsonb) || excluded.raw_snapshot,
  updated_at = timezone('utc', now());


-- =========================================================
-- 3) SWEEP KAYDI GİBİ EKLEME ÖRNEĞİ
--    Sweep panelinde görünmesi için:
--    intake_channel = 'sweep'
--    is_sweeped = true
-- =========================================================
insert into public.places (
  slug,
  name,
  category_primary,
  address,
  lat,
  lng,
  phone,
  website,
  status,
  verification_status,
  headline,
  short_description,
  long_description,
  primary_source_name,
  primary_source_id,
  source_url,
  imported_at,
  intake_channel,
  is_sweeped,
  source_sweep_id,
  grid_key,
  cell_id,
  google_maps_uri,
  images,
  source_records,
  raw_snapshot
) values (
  null,
  'Kas Harbor Breakfast',
  'kahvalti',
  'Andifli Mah. Liman Caddesi No:8, Kas / Antalya',
  36.201001,
  29.638901,
  '+90 242 777 00 11',
  'https://kasharborbreakfast.example.com',
  'pending',
  'pending',
  'Liman tarafinda kahvalti duragi',
  'Kas Harbor Breakfast, liman bolgesinde kahvalti icin one cikan bir aday mekandir.',
  '',
  'google_places',
  'google-place-abc123',
  'https://maps.google.com/?cid=example',
  timezone('utc', now()),
  'sweep',
  true,
  null,
  'X4Y7',
  'kas-google-grid-x4-y7',
  'https://maps.google.com/?cid=example',
  '[]'::jsonb,
  jsonb_build_array(
    jsonb_build_object(
      'source_name', 'google_places',
      'source_id', 'google-place-abc123',
      'source_url', 'https://maps.google.com/?cid=example',
      'is_primary', true,
      'first_seen_at', timezone('utc', now()),
      'last_seen_at', timezone('utc', now()),
      'raw_place_id', null
    )
  ),
  jsonb_build_object(
    'import_method', 'sweep_sql',
    'name_raw', 'Kas Harbor Breakfast',
    'address_raw', 'Andifli Mah. Liman Caddesi No:8, Kas / Antalya',
    'phone_raw', '+90 242 777 00 11',
    'website_raw', 'https://kasharborbreakfast.example.com',
    'category_raw', 'kahvalti'
  )
);

