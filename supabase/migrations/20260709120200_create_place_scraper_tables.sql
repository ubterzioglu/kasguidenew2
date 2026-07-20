create table if not exists public.place_scraper_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'queued'
    check (status in ('queued', 'running', 'completed', 'failed', 'budget_stopped', 'cancelled')),
  location_label text not null,
  country_code text not null default 'TR',
  region text,
  city text not null default 'Kaş',
  profession_label text not null,
  category_slug text,
  language_terms text[] not null default '{}',
  query_templates text[] not null default '{}',
  max_queries integer not null default 6,
  max_source_urls integer not null default 15,
  max_extract_urls integer not null default 10,
  max_candidates integer not null default 10,
  soft_cap_usd numeric(8,4) not null default 0.50,
  hard_cap_usd numeric(8,4) not null default 2.00,
  cost_total_usd numeric(8,4) not null default 0,
  queries_log jsonb not null default '[]'::jsonb,
  sources_log jsonb not null default '[]'::jsonb,
  events_log jsonb not null default '[]'::jsonb,
  error_message text,
  created_by text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists place_scraper_jobs_status_idx
  on public.place_scraper_jobs (status, created_at desc);

create table if not exists public.place_scraper_candidates (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.place_scraper_jobs(id) on delete cascade,
  canonical_name text not null,
  organization_name text,
  category_slug text,
  languages text[] not null default '{}',
  services text[] not null default '{}',
  contacts jsonb not null default '[]'::jsonb,
  website_url text,
  address_text text,
  lat numeric,
  lng numeric,
  source_urls text[] not null default '{}',
  evidence jsonb not null default '[]'::jsonb,
  confidence_score numeric(5,2),
  duplicate_key text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'promoted', 'rejected', 'duplicate')),
  promoted_place_id uuid references public.places(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists place_scraper_candidates_job_id_idx
  on public.place_scraper_candidates (job_id);

create index if not exists place_scraper_candidates_review_status_idx
  on public.place_scraper_candidates (review_status);

create unique index if not exists place_scraper_candidates_duplicate_key_idx
  on public.place_scraper_candidates (duplicate_key)
  where duplicate_key is not null;

drop trigger if exists place_scraper_jobs_set_updated_at on public.place_scraper_jobs;
create trigger place_scraper_jobs_set_updated_at
before update on public.place_scraper_jobs
for each row execute function public.set_updated_at();

drop trigger if exists place_scraper_candidates_set_updated_at on public.place_scraper_candidates;
create trigger place_scraper_candidates_set_updated_at
before update on public.place_scraper_candidates
for each row execute function public.set_updated_at();

alter table public.place_scraper_jobs enable row level security;
alter table public.place_scraper_candidates enable row level security;
-- Admin-only tablolar: public select/insert/update policy yok (yalnizca service-role client).
