create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  content text not null default '',
  image_url text,
  published_at timestamptz,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  content text not null default '',
  image_url text,
  priority text not null default 'normal'
    check (priority in ('urgent', 'normal', 'info')),
  is_pinned boolean not null default false,
  is_active boolean not null default true,
  start_date timestamptz,
  end_date timestamptz,
  published_at timestamptz,
  sort_order integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists news_status_published_idx
  on public.news (status, is_active, published_at desc);

create index if not exists news_sort_order_idx
  on public.news (sort_order asc, published_at desc);

create index if not exists announcements_status_dates_idx
  on public.announcements (status, is_active, start_date desc, end_date asc);

create index if not exists announcements_priority_idx
  on public.announcements (is_pinned desc, priority, sort_order asc, published_at desc);

drop trigger if exists news_set_updated_at on public.news;
create trigger news_set_updated_at
before update on public.news
for each row
execute function public.set_updated_at();

drop trigger if exists announcements_set_updated_at on public.announcements;
create trigger announcements_set_updated_at
before update on public.announcements
for each row
execute function public.set_updated_at();

alter table public.news enable row level security;
alter table public.announcements enable row level security;

drop policy if exists "Public can read published news" on public.news;
create policy "Public can read published news"
on public.news
for select
to anon, authenticated
using (
  status = 'published'
  and is_active = true
  and coalesce(published_at, timezone('utc', now())) <= timezone('utc', now())
);

drop policy if exists "Public can read active announcements" on public.announcements;
create policy "Public can read active announcements"
on public.announcements
for select
to anon, authenticated
using (
  status = 'published'
  and is_active = true
  and coalesce(start_date, timezone('utc', now())) <= timezone('utc', now())
  and coalesce(end_date, timezone('utc', now()) + interval '100 years') >= timezone('utc', now())
);