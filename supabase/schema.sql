-- Виконати один раз у Supabase Dashboard -> SQL Editor -> New query -> Run.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'summary', -- 'summary' | 'test' | 'mindmap' | 'presentation' (пізніше)
  title text not null,
  input_text text not null,
  result_text text not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Кожен користувач бачить і керує тільки своїми проєктами.
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

create index if not exists projects_user_id_created_at_idx
  on public.projects (user_id, created_at desc);
