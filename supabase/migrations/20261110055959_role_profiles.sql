create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null,
 role text not null check (role in ('student','driver')),
 student_id uuid unique references public.transport_students(id) on delete set null,
 driver_id uuid unique references public.transport_drivers(id) on delete set null,
 created_at timestamptz not null default now(),
 check ((role = 'student' and driver_id is null) or (role = 'driver' and student_id is null))
);
alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
create policy profile_self_read on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profile_admin_manage on public.profiles for all to authenticated using ((select public.is_transport_admin())) with check ((select public.is_transport_admin()));
-- Return only the signed-in person's assignment; do not grant direct access to fleet tables.
create function public.my_transport_context() returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare p public.profiles%rowtype; result jsonb;
begin
 if auth.uid() is null then raise exception 'Not authenticated' using errcode='42501'; end if;
 if public.is_transport_admin() then return jsonb_build_object('role','admin'); end if;
 select * into p from public.profiles where id=auth.uid();
 if not found then return null; end if;
 result := jsonb_build_object('role',p.role,'full_name',p.full_name,'email',auth.jwt()->>'email');
 if p.role='student' then
   select result || jsonb_build_object('student_code',s.student_code,'bus',b.bus_number,'stop',st.name,'route',r.name)
   into result from (select 1) x left join public.transport_students s on s.id=p.student_id
   left join public.transport_assignments a on a.student_id=s.id
   left join public.transport_buses b on b.id=a.bus_id left join public.transport_stops st on st.id=a.pickup_stop_id
   left join public.transport_routes r on r.id=b.route_id;
 else
   select result || jsonb_build_object('driver_code',d.driver_code,'bus',b.bus_number,'route',r.name,'driver_status',d.status)
   into result from (select 1) x left join public.transport_drivers d on d.id=p.driver_id
   left join lateral (select * from public.transport_buses where driver_id=d.id order by created_at limit 1) b on true
   left join public.transport_routes r on r.id=b.route_id;
   if result->>'driver_status' = 'disabled' then return null; end if;
 end if;
 return result;
end $$;
revoke all on function public.my_transport_context() from public, anon;
grant execute on function public.my_transport_context() to authenticated;
