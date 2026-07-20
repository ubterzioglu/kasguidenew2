create table if not exists public.admin_manual_tasks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  note text,
  is_done boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_manual_tasks_is_done_idx
  on public.admin_manual_tasks (is_done, created_at desc);

create or replace function public.set_admin_manual_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists admin_manual_tasks_set_updated_at on public.admin_manual_tasks;

create trigger admin_manual_tasks_set_updated_at
before update on public.admin_manual_tasks
for each row
execute function public.set_admin_manual_tasks_updated_at();

insert into public.admin_manual_tasks (label, note)
values (
  'GSC''de sitemap.xml''i yeniden gönder',
  'Search Console > Sitemaps. 15 URL''lik 404 kaynağı koddan düzeltildi (2026-07-20); bu adım ajan tarafından yapılamaz, Search Console erişimi gerekiyor.'
)
on conflict do nothing;
