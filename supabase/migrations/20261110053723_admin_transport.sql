-- LIETTrack admin data. Admin grants are managed only by a trusted database operator.
create table public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_members enable row level security;
revoke all on public.admin_members from anon, authenticated;
grant select on public.admin_members to authenticated;
create policy "read own admin membership" on public.admin_members for select to authenticated using (user_id = (select auth.uid()));

create function public.is_transport_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admin_members where user_id = (select auth.uid())) $$;
revoke all on function public.is_transport_admin() from public, anon;
grant execute on function public.is_transport_admin() to authenticated;

create table public.transport_routes (id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name)) > 0), code text not null unique, color text not null default '#145C43' check (color ~ '^#[0-9A-Fa-f]{6}$'), status text not null default 'active' check(status in ('active','inactive')), created_at timestamptz not null default now());
create table public.transport_stops (id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) > 0), latitude double precision check(latitude between -90 and 90), longitude double precision check(longitude between -180 and 180), created_at timestamptz not null default now(), check ((latitude is null) = (longitude is null)));
create table public.transport_route_stops (route_id uuid not null references public.transport_routes(id) on delete cascade, stop_id uuid not null references public.transport_stops(id) on delete restrict, position integer not null check(position >= 0), primary key(route_id,stop_id), unique(route_id,position) deferrable initially deferred);
create table public.transport_drivers (id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) > 0), driver_code text not null unique, contact text, status text not null default 'available' check(status in ('available','unavailable','disabled')), created_at timestamptz not null default now());
create table public.transport_buses (id uuid primary key default gen_random_uuid(), bus_number text not null unique, registration text unique, capacity integer check(capacity > 0), driver_id uuid references public.transport_drivers(id) on delete set null, route_id uuid references public.transport_routes(id) on delete set null, status text not null default 'available' check(status in ('available','maintenance','inactive')), created_at timestamptz not null default now());
create table public.transport_students (id uuid primary key default gen_random_uuid(), student_code text not null unique, name text not null check(length(trim(name)) > 0), department text, academic_year text, created_at timestamptz not null default now());
create table public.transport_assignments (id uuid primary key default gen_random_uuid(), student_id uuid not null unique references public.transport_students(id) on delete cascade, bus_id uuid references public.transport_buses(id) on delete set null, pickup_stop_id uuid references public.transport_stops(id) on delete set null, created_at timestamptz not null default now());
create table public.transport_schedules (id uuid primary key default gen_random_uuid(), route_id uuid not null references public.transport_routes(id) on delete cascade, service_period text not null check(service_period in ('morning','evening')), departure_time time not null, notes text, created_at timestamptz not null default now());
create table public.transport_trips (id uuid primary key default gen_random_uuid(), bus_id uuid references public.transport_buses(id) on delete set null, driver_id uuid references public.transport_drivers(id) on delete set null, route_id uuid references public.transport_routes(id) on delete set null, started_at timestamptz not null, ended_at timestamptz, status text not null check(status in ('active','completed','cancelled')), check (ended_at is null or ended_at >= started_at));
create table public.transport_gps (bus_id uuid primary key references public.transport_buses(id) on delete cascade, latitude double precision not null check(latitude between -90 and 90), longitude double precision not null check(longitude between -180 and 180), recorded_at timestamptz not null, source text not null check(source in ('live','simulated','offline')));
create table public.transport_notices (id uuid primary key default gen_random_uuid(), title text not null check(length(trim(title)) > 0), message text not null check(length(trim(message)) > 0), created_at timestamptz not null default now());

do $$ declare t text; begin
  foreach t in array array['transport_routes','transport_stops','transport_route_stops','transport_drivers','transport_buses','transport_students','transport_assignments','transport_schedules','transport_trips','transport_gps','transport_notices'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy admin_only on public.%I for all to authenticated using ((select public.is_transport_admin())) with check ((select public.is_transport_admin()))', t);
  end loop;
end $$;
