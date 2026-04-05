-- Kaş Guide / TEKİL MEKAN EKLEME ŞABLONU
-- Kullanım:
-- 1) Agent aşağıdaki __PLACEHOLDER__ alanlarını doldursun
-- 2) Bu sorguyu Supabase SQL Editor'de çalıştır
-- 3) Kayıt direkt onaylı/yayında olarak eklensin

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
)
values (
  '__SLUG__',
  '__NAME__',
  '__CATEGORY_PRIMARY__',
  '__ADDRESS__',
  __LAT__,
  __LNG__,
  '__PHONE__',
  '__WEBSITE__',
  '__OPENING_HOURS__',
  'published',
  'verified',
  '__HEADLINE__',
  '__SHORT_DESCRIPTION__',
  '__LONG_DESCRIPTION__',
  '__KASGUIDE_BADGE__',
  '__PRIMARY_SOURCE_NAME__',
  '__PRIMARY_SOURCE_ID__',
  '__SOURCE_URL__',
  timezone('utc', now()),
  'import',
  false,
  null,
  null,
  null,
  '__GOOGLE_MAPS_URI__',
  'Dış agent tarafından tekil mekan girişi yapıldı.',
  'Kayıt onaylı olarak eklendi.',
  null,
  null,
  jsonb_build_array(
    jsonb_build_object(
      'url', '__IMAGE_URL_1__',
      'alt_text', '__IMAGE_ALT_1__',
      'source_name', '__PRIMARY_SOURCE_NAME__',
      'is_cover', true,
      'sort_order', 0
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'source_name', '__PRIMARY_SOURCE_NAME__',
      'source_id', '__PRIMARY_SOURCE_ID__',
      'source_url', '__SOURCE_URL__',
      'is_primary', true,
      'first_seen_at', timezone('utc', now()),
      'last_seen_at', timezone('utc', now()),
      'raw_place_id', null
    )
  ),
  jsonb_build_object(
    'import_method', 'single_sql',
    'agent_name', '__AGENT_NAME__',
    'name_raw', '__NAME__',
    'address_raw', '__ADDRESS__',
    'phone_raw', '__PHONE__',
    'website_raw', '__WEBSITE__',
    'category_raw', '__CATEGORY_PRIMARY__',
    'notes', '__RAW_NOTES__'
  )
)
on conflict (primary_source_name, primary_source_id)
where primary_source_name is not null and primary_source_id is not null
do update set
  slug = excluded.slug,
  name = excluded.name,
  category_primary = excluded.category_primary,
  address = excluded.address,
  lat = excluded.lat,
  lng = excluded.lng,
  phone = excluded.phone,
  website = excluded.website,
  opening_hours = excluded.opening_hours,
  status = 'published',
  verification_status = 'verified',
  headline = excluded.headline,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  kasguide_badge = excluded.kasguide_badge,
  source_url = excluded.source_url,
  imported_at = excluded.imported_at,
  intake_channel = 'import',
  is_sweeped = false,
  google_maps_uri = excluded.google_maps_uri,
  review_reason = excluded.review_reason,
  review_notes = excluded.review_notes,
  review_score = excluded.review_score,
  images = excluded.images,
  source_records = excluded.source_records,
  raw_snapshot = coalesce(public.places.raw_snapshot, '{}'::jsonb) || excluded.raw_snapshot,
  updated_at = timezone('utc', now());

