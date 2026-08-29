-- Perfiles con rol (admin gestiona materias/tareas, user solo marca progreso)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: ¿el usuario actual es admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Trayectos anuales
create table if not exists public.trayectos (
  id uuid primary key default gen_random_uuid(),
  year smallint not null unique,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- Materias (globales, cuelgan del trayecto)
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  trayecto_id uuid not null references public.trayectos(id) on delete cascade,
  name text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tareas (globales, trimestre 1-3)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  text text not null,
  trimestre smallint not null default 1 check (trimestre between 1 and 3),
  created_at timestamptz not null default now()
);

-- Progreso por usuario (el usuario solo tacha si hizo la tarea)
create table if not exists public.task_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);

alter table public.profiles enable row level security;
alter table public.trayectos enable row level security;
alter table public.subjects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_progress enable row level security;

-- Profiles: cada usuario lee el suyo
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Trayectos: lectura para autenticados, escritura solo admin
drop policy if exists "authenticated read trayectos" on public.trayectos;
create policy "authenticated read trayectos"
  on public.trayectos for select
  using (auth.role() = 'authenticated');

drop policy if exists "admin manage trayectos" on public.trayectos;
create policy "admin manage trayectos"
  on public.trayectos for all
  using (public.is_admin())
  with check (public.is_admin());

-- Subjects: lectura de visibles (admin ve todas), escritura solo admin
drop policy if exists "read visible subjects" on public.subjects;
create policy "read visible subjects"
  on public.subjects for select
  using (not hidden or public.is_admin());

drop policy if exists "admin manage subjects" on public.subjects;
create policy "admin manage subjects"
  on public.subjects for all
  using (public.is_admin())
  with check (public.is_admin());

-- Tasks: lectura para autenticados, escritura solo admin
drop policy if exists "authenticated read tasks" on public.tasks;
create policy "authenticated read tasks"
  on public.tasks for select
  using (auth.role() = 'authenticated');

drop policy if exists "admin manage tasks" on public.tasks;
create policy "admin manage tasks"
  on public.tasks for all
  using (public.is_admin())
  with check (public.is_admin());

-- Task progress: cada usuario gestiona el suyo
drop policy if exists "users manage own progress" on public.task_progress;
create policy "users manage own progress"
  on public.task_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);