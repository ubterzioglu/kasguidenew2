create table if not exists public.news_scraper_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  feed_url text not null,
  source_type text not null default 'rss'
    check (source_type in ('rss', 'atom', 'gdelt_query')),
  is_enabled boolean not null default true,
  last_run_at timestamptz,
  last_run_status text
    check (last_run_status in ('success', 'error', 'partial')),
  last_run_found_count integer,
  last_run_inserted_count integer,
  last_run_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists news_scraper_sources_feed_url_idx
  on public.news_scraper_sources (feed_url);

create index if not exists news_scraper_sources_enabled_idx
  on public.news_scraper_sources (is_enabled);

drop trigger if exists news_scraper_sources_set_updated_at on public.news_scraper_sources;
create trigger news_scraper_sources_set_updated_at
before update on public.news_scraper_sources
for each row
execute function public.set_updated_at();

alter table public.news_scraper_sources enable row level security;
-- Admin-only tablo: public select/insert/update policy yok. Tum erisim
-- service-role client (getSupabaseAdminClient()) uzerinden, news/announcements
-- admin yazmalariyla ayni sekilde.
