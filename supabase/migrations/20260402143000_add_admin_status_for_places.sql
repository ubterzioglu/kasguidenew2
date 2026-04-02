alter table public.places
  drop constraint if exists places_status_check;

alter table public.places
  add constraint places_status_check
  check (status in ('draft', 'review', 'admin', 'published', 'archived'));

alter table public.places
  alter column status set default 'admin';

update public.places
set status = 'admin'
where status <> 'admin';
