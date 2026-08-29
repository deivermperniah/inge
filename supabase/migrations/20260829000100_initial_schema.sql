create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  trimestre smallint not null default 1,
  created_at timestamptz not null default now()
);

alter table public.subjects enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "users manage own subjects" on public.subjects;
create policy "users manage own subjects"
  on public.subjects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users manage own tasks" on public.tasks;
create policy "users manage own tasks"
  on public.tasks for all
  using (auth.uid() = (select user_id from public.subjects where id = subject_id))
  with check (auth.uid() = (select user_id from public.subjects where id = subject_id));