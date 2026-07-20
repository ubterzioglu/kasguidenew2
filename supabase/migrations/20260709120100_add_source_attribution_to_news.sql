alter table public.news
  add column if not exists source_url text,
  add column if not exists source_name text;

create index if not exists news_source_name_idx
  on public.news (source_name);
