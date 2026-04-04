alter table public.places
  alter column slug drop not null;

alter table public.places
  add column if not exists headline text,
  add column if not exists short_description text,
  add column if not exists long_description text,
  add column if not exists primary_source_name text,
  add column if not exists primary_source_id text,
  add column if not exists source_url text,
  add column if not exists imported_at timestamptz,
  add column if not exists grid_key text,
  add column if not exists cell_id text,
  add column if not exists google_maps_uri text,
  add column if not exists review_reason text,
  add column if not exists review_notes text,
  add column if not exists review_score numeric(5, 2),
  add column if not exists merge_target_place_id uuid,
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists source_records jsonb not null default '[]'::jsonb,
  add column if not exists raw_snapshot jsonb not null default '{}'::jsonb;

alter table public.places
  drop constraint if exists places_status_check;

alter table public.places
  add constraint places_status_check
  check (status in ('pending', 'review', 'admin', 'published', 'archived', 'rejected', 'merged', 'error'));

alter table public.places
  alter column status set default 'admin';

alter table public.places
  drop constraint if exists places_slug_key;

drop index if exists public.places_slug_unique_idx;
create unique index if not exists places_slug_unique_idx
  on public.places (slug)
  where slug is not null;

alter table public.places
  drop constraint if exists places_merge_target_place_id_fkey;

alter table public.places
  add constraint places_merge_target_place_id_fkey
  foreign key (merge_target_place_id) references public.places(id) on delete set null;

create index if not exists places_merge_target_place_id_idx
  on public.places (merge_target_place_id);

create unique index if not exists places_primary_source_unique_idx
  on public.places (primary_source_name, primary_source_id)
  where primary_source_name is not null and primary_source_id is not null;

create index if not exists places_imported_at_idx
  on public.places (imported_at desc nulls last);

update public.places p
set
  headline = coalesce(nullif(pc.headline, ''), p.headline, p.name),
  short_description = coalesce(nullif(pc.short_text, ''), p.short_description),
  long_description = coalesce(nullif(pc.long_text, ''), p.long_description)
from public.place_content pc
where pc.place_id = p.id;

update public.places p
set
  primary_source_name = src.source_name,
  primary_source_id = src.source_id,
  source_url = src.source_url,
  imported_at = coalesce(p.imported_at, src.first_seen_at),
  source_records = coalesce(src.records, '[]'::jsonb)
from (
  select
    ps.place_id,
    max(ps.source_name) filter (where ps.is_primary) as source_name,
    max(ps.source_id) filter (where ps.is_primary) as source_id,
    max(ps.source_url) filter (where ps.is_primary) as source_url,
    min(ps.first_seen_at) as first_seen_at,
    jsonb_agg(
      jsonb_strip_nulls(
        jsonb_build_object(
          'source_name', ps.source_name,
          'source_id', ps.source_id,
          'source_url', ps.source_url,
          'is_primary', ps.is_primary,
          'first_seen_at', ps.first_seen_at,
          'last_seen_at', ps.last_seen_at,
          'raw_place_id', ps.raw_place_id
        )
      )
      order by ps.is_primary desc, ps.created_at asc
    ) as records
  from public.place_sources ps
  group by ps.place_id
) src
where src.place_id = p.id;

update public.places p
set images = coalesce(img.records, '[]'::jsonb)
from (
  select
    pi.place_id,
    jsonb_agg(
      jsonb_strip_nulls(
        jsonb_build_object(
          'url', coalesce(pi.public_url, pi.storage_path),
          'alt_text', pi.alt_text,
          'source_name', pi.source_name,
          'is_cover', pi.is_cover,
          'sort_order', pi.sort_order
        )
      )
      order by pi.sort_order asc, pi.created_at asc
    ) as records
  from public.place_images pi
  group by pi.place_id
) img
where img.place_id = p.id;

update public.places
set
  headline = coalesce(nullif(headline, ''), name),
  short_description = coalesce(nullif(short_description, ''), name || ' Kas Guide yayin listesinde yer aliyor.'),
  long_description = coalesce(nullif(long_description, ''), short_description, name || ' icin detayli icerik yakinda eklenecek.'),
  images = coalesce(images, '[]'::jsonb),
  source_records = coalesce(source_records, '[]'::jsonb),
  raw_snapshot = coalesce(raw_snapshot, '{}'::jsonb);

with raw_candidates as (
  select
    rp.id as raw_place_id,
    rp.source_name,
    rp.source_id,
    rp.name_raw,
    rp.lat,
    rp.lng,
    rp.address_raw,
    rp.phone_raw,
    rp.website_raw,
    rp.category_raw,
    rp.raw_payload,
    rp.imported_at,
    rp.processing_status,
    coalesce(
      nullif(rp.raw_payload #>> '{google,gridKey}', ''),
      nullif(rp.raw_payload #>> '{osm,gridKey}', '')
    ) as grid_key,
    coalesce(
      nullif(rp.raw_payload #>> '{google,cellId}', ''),
      nullif(rp.raw_payload #>> '{osm,cellId}', '')
    ) as cell_id,
    nullif(rp.raw_payload #>> '{google,place,googleMapsUri}', '') as google_maps_uri,
    rq.reason,
    rq.notes,
    rq.score,
    rq.status as review_queue_status,
    rq.candidate_place_id,
    existing.id as existing_place_id
  from public.raw_places rp
  left join public.review_queue rq on rq.raw_place_id = rp.id
  left join public.places existing
    on existing.primary_source_name = rp.source_name
   and existing.primary_source_id = rp.source_id
  where existing.id is null
)
insert into public.places (
  slug,
  name,
  kasguide_badge,
  category_primary,
  category_secondary,
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
  primary_source_name,
  primary_source_id,
  source_url,
  imported_at,
  grid_key,
  cell_id,
  google_maps_uri,
  review_reason,
  review_notes,
  review_score,
  merge_target_place_id,
  images,
  source_records,
  raw_snapshot,
  created_at,
  updated_at
)
select
  null,
  coalesce(nullif(raw_candidates.name_raw, ''), initcap(replace(raw_candidates.source_id, '_', ' ')), 'Yeni mekan'),
  null,
  coalesce(nullif(raw_candidates.category_raw, ''), 'gezi'),
  null,
  raw_candidates.address_raw,
  raw_candidates.lat,
  raw_candidates.lng,
  raw_candidates.phone_raw,
  raw_candidates.website_raw,
  null,
  case
    when raw_candidates.processing_status = 'rejected' then 'rejected'
    when raw_candidates.processing_status = 'error' then 'error'
    when raw_candidates.review_queue_status = 'merged' then 'merged'
    when raw_candidates.review_queue_status = 'rejected' then 'rejected'
    when raw_candidates.processing_status = 'review' then 'review'
    else 'pending'
  end,
  case
    when raw_candidates.review_queue_status = 'approved' then 'reviewed'
    else 'pending'
  end,
  coalesce(nullif(raw_candidates.name_raw, ''), 'Yeni mekan'),
  coalesce(nullif(raw_candidates.name_raw, ''), 'Yeni mekan'),
  '',
  raw_candidates.source_name,
  raw_candidates.source_id,
  null,
  raw_candidates.imported_at,
  raw_candidates.grid_key,
  raw_candidates.cell_id,
  raw_candidates.google_maps_uri,
  raw_candidates.reason,
  raw_candidates.notes,
  raw_candidates.score,
  raw_candidates.candidate_place_id,
  '[]'::jsonb,
  jsonb_build_array(
    jsonb_strip_nulls(
      jsonb_build_object(
        'source_name', raw_candidates.source_name,
        'source_id', raw_candidates.source_id,
        'source_url', null,
        'is_primary', true,
        'first_seen_at', raw_candidates.imported_at,
        'last_seen_at', raw_candidates.imported_at,
        'raw_place_id', raw_candidates.raw_place_id
      )
    )
  ),
  jsonb_strip_nulls(
    jsonb_build_object(
      'raw_place_id', raw_candidates.raw_place_id,
      'source_name', raw_candidates.source_name,
      'source_id', raw_candidates.source_id,
      'name_raw', raw_candidates.name_raw,
      'address_raw', raw_candidates.address_raw,
      'phone_raw', raw_candidates.phone_raw,
      'website_raw', raw_candidates.website_raw,
      'category_raw', raw_candidates.category_raw,
      'lat', raw_candidates.lat,
      'lng', raw_candidates.lng,
      'imported_at', raw_candidates.imported_at,
      'processing_status', raw_candidates.processing_status,
      'payload', coalesce(raw_candidates.raw_payload, '{}'::jsonb)
    )
  ),
  coalesce(raw_candidates.imported_at, timezone('utc', now())),
  timezone('utc', now())
from raw_candidates
on conflict do nothing;

update public.places p
set
  review_reason = coalesce(p.review_reason, rq.reason),
  review_notes = coalesce(p.review_notes, rq.notes),
  review_score = coalesce(p.review_score, rq.score),
  merge_target_place_id = coalesce(p.merge_target_place_id, rq.candidate_place_id),
  status = case
    when p.status in ('published', 'archived', 'admin') then p.status
    when rq.status = 'merged' then 'merged'
    when rq.status = 'rejected' then 'rejected'
    when rq.status in ('approved', 'in_review') then 'review'
    else p.status
  end,
  raw_snapshot = p.raw_snapshot || jsonb_build_object('review_queue_id', rq.id)
from public.review_queue rq
where p.primary_source_name = (
    select rp.source_name from public.raw_places rp where rp.id = rq.raw_place_id
  )
  and p.primary_source_id = (
    select rp.source_id from public.raw_places rp where rp.id = rq.raw_place_id
  );

