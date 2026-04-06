alter table public.places
  add column if not exists category_ids text[] not null default '{}'::text[],
  add column if not exists kasguide_badges text[] not null default '{}'::text[];

update public.places
set category_ids = case
  when coalesce(array_length(category_ids, 1), 0) > 0 then category_ids
  when nullif(category_primary, '') is not null then array[category_primary]
  else '{}'::text[]
end
where category_ids is null
   or coalesce(array_length(category_ids, 1), 0) = 0;

update public.places
set kasguide_badges = case
  when coalesce(array_length(kasguide_badges, 1), 0) > 0 then kasguide_badges
  when nullif(kasguide_badge, '') is not null then array[kasguide_badge]
  else '{}'::text[]
end
where kasguide_badges is null
   or coalesce(array_length(kasguide_badges, 1), 0) = 0;

update public.places
set category_primary = coalesce(nullif(category_primary, ''), category_ids[1])
where coalesce(array_length(category_ids, 1), 0) > 0;

update public.places
set kasguide_badge = coalesce(nullif(kasguide_badge, ''), kasguide_badges[1])
where coalesce(array_length(kasguide_badges, 1), 0) > 0;

create index if not exists idx_places_category_ids_gin on public.places using gin (category_ids);
create index if not exists idx_places_kasguide_badges_gin on public.places using gin (kasguide_badges);
