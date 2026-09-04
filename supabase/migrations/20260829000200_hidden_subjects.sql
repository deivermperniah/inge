-- Visibilidad personal: cada usuario oculta materias solo para sí mismo
create table if not exists public.hidden_subjects (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, subject_id)
);

alter table public.hidden_subjects enable row level security;

drop policy if exists "users manage own hidden subjects" on public.hidden_subjects;
create policy "users manage own hidden subjects"
  on public.hidden_subjects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);