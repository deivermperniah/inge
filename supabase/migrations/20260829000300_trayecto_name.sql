-- Los trayectos tienen nombre (ej: III) además del año
alter table public.trayectos add column if not exists name text;

update public.trayectos
set name = 'III'
where year = 2026 and name is null;

alter table public.trayectos
alter column name set not null;