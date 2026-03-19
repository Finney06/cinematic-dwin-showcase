-- 1) Project table
create table if not exists public.projects (
  id text primary key,
  title text not null,
  category text not null check (category in ('films', 'commercials', 'music-videos')),
  category_label text not null,
  year text not null,
  role text not null,
  description text not null default '',
  thumbnail text not null default '/placeholder.svg',
  stills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Keep updated_at fresh
create or replace function public.update_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;

create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.update_timestamp();

-- 3) Turn on row-level security
alter table public.projects enable row level security;

-- 4) Read access for the public site
create policy if not exists "Public can read projects"
on public.projects
for select
to anon, authenticated
using (true);

-- 5) Write access only for logged-in users
create policy if not exists "Authenticated users can insert projects"
on public.projects
for insert
to authenticated
with check (true);

create policy if not exists "Authenticated users can update projects"
on public.projects
for update
to authenticated
using (true)
with check (true);

create policy if not exists "Authenticated users can delete projects"
on public.projects
for delete
to authenticated
using (true);

-- 6) Optional starter rows
insert into public.projects (id, title, category, category_label, year, role, description, thumbnail)
values
  ('echoes-of-light', 'Echoes of Light', 'films', 'Film', '2025', 'Director / Cinematographer', 'Project description here.', '/placeholder.svg'),
  ('atlas-motors', 'Atlas Motors', 'commercials', 'Commercial', '2024', 'Director / Creative Director', 'Project description here.', '/placeholder.svg')
on conflict (id) do nothing;
