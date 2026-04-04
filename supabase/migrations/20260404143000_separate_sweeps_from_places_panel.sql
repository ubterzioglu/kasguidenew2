alter table public.places
  add column if not exists intake_channel text not null default 'manual',
  add column if not exists is_sweeped boolean not null default false,
  add column if not exists source_sweep_id uuid;

alter table public.places
  drop constraint if exists places_intake_channel_check;

alter table public.places
  add constraint places_intake_channel_check
  check (intake_channel in ('sweep', 'manual', 'import', 'migrated'));

alter table public.places
  drop constraint if exists places_source_sweep_id_fkey;

alter table public.places
  add constraint places_source_sweep_id_fkey
  foreign key (source_sweep_id) references public.grid_sweeps(id) on delete set null;

create index if not exists places_is_sweeped_idx
  on public.places (is_sweeped, status, updated_at desc);

create index if not exists places_source_sweep_id_idx
  on public.places (source_sweep_id);

update public.places
set
  intake_channel = case
    when primary_source_name in ('google_places', 'osm_overpass') then 'sweep'
    when primary_source_name is null then 'manual'
    else 'import'
  end,
  is_sweeped = case
    when primary_source_name in ('google_places', 'osm_overpass') then true
    when raw_snapshot ? 'google' then true
    when raw_snapshot ? 'osm' then true
    else false
  end
where intake_channel = 'manual'
   or is_sweeped = false;

update public.places p
set source_sweep_id = (
  select gs.id
  from public.grid_sweeps gs
  where gs.region_name ilike '%' || p.grid_key || '%'
  order by gs.started_at desc
  limit 1
)
where p.source_sweep_id is null
  and p.is_sweeped = true
  and p.grid_key is not null;
