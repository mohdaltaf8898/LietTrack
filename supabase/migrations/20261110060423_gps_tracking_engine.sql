alter table public.transport_gps add column trip_id uuid references public.transport_trips(id) on delete set null, add column accuracy double precision, add column speed double precision, add column heading double precision;
create unique index transport_one_active_trip_per_bus on public.transport_trips(bus_id) where status='active';
create unique index transport_one_active_trip_per_driver on public.transport_trips(driver_id) where status='active';
create function public.can_read_assigned_gps(p_bus uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join public.transport_assignments a on a.student_id=p.student_id where p.id=auth.uid() and p.role='student' and a.bus_id=p_bus)
 or exists(select 1 from public.profiles p join public.transport_drivers d on d.id=p.driver_id join public.transport_buses b on b.driver_id=d.id where p.id=auth.uid() and p.role='driver' and d.status <> 'disabled' and b.id=p_bus)
$$;
revoke all on function public.can_read_assigned_gps(uuid) from public, anon;
grant execute on function public.can_read_assigned_gps(uuid) to authenticated;
create policy assigned_gps_read on public.transport_gps for select to authenticated using (public.can_read_assigned_gps(bus_id));
create function public.start_driver_trip() returns uuid language plpgsql security definer set search_path='' as $$
declare d uuid; b public.transport_buses%rowtype; t uuid;
begin
 select p.driver_id into d from public.profiles p join public.transport_drivers dr on dr.id=p.driver_id where p.id=auth.uid() and p.role='driver' and dr.status <> 'disabled';
 if d is null then raise exception 'Driver access is not approved' using errcode='42501'; end if;
 if (select count(*) from public.transport_buses where driver_id=d and status='available' and route_id is not null) <> 1 then raise exception 'Exactly one available bus with a route must be assigned'; end if;
 select * into b from public.transport_buses where driver_id=d and status='available' and route_id is not null for update;
 if not exists(select 1 from public.transport_routes where id=b.route_id and status='active') then raise exception 'Assigned route is inactive'; end if;
 insert into public.transport_trips(bus_id,driver_id,route_id,started_at,status) values(b.id,d,b.route_id,now(),'active') returning id into t;
 update public.transport_gps set source='offline' where bus_id=b.id;
 return t;
exception when unique_violation then raise exception 'A trip is already active for this bus or driver';
end $$;
create function public.my_active_trip() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',t.id,'bus_id',t.bus_id,'started_at',t.started_at) from public.transport_trips t join public.profiles p on p.driver_id=t.driver_id join public.transport_drivers d on d.id=t.driver_id where p.id=auth.uid() and p.role='driver' and d.status <> 'disabled' and t.status='active' order by t.started_at desc limit 1
$$;
create function public.end_driver_trip(p_trip uuid) returns void language plpgsql security definer set search_path='' as $$
declare t public.transport_trips%rowtype;
begin
 select tr.* into t from public.transport_trips tr join public.profiles p on p.driver_id=tr.driver_id where tr.id=p_trip and p.id=auth.uid() and p.role='driver' and tr.status='active' for update of tr;
 if not found then raise exception 'Active trip not found or not authorized' using errcode='42501'; end if;
 update public.transport_trips set status='completed',ended_at=now() where id=t.id;
 update public.transport_gps set source='offline' where bus_id=t.bus_id and trip_id=t.id;
end $$;
create function public.record_driver_location(p_trip uuid,p_lat double precision,p_lon double precision,p_accuracy double precision,p_speed double precision,p_heading double precision,p_recorded_at timestamptz) returns boolean language plpgsql security definer set search_path='' as $$
declare t public.transport_trips%rowtype; previous public.transport_gps%rowtype;
begin
 select tr.* into t from public.transport_trips tr join public.profiles p on p.driver_id=tr.driver_id join public.transport_drivers d on d.id=tr.driver_id join public.transport_buses b on b.id=tr.bus_id and b.driver_id=d.id and b.route_id=tr.route_id where tr.id=p_trip and tr.status='active' and p.id=auth.uid() and p.role='driver' and d.status <> 'disabled' and b.status='available' for update of tr;
 if not found then raise exception 'Active assigned trip required' using errcode='42501'; end if;
 if p_lat is null or p_lon is null or p_accuracy is null or p_recorded_at is null or not (p_lat between -90 and 90 and p_lon between -180 and 180 and p_accuracy between 0 and 100) or (p_speed is not null and not p_speed between 0 and 80) or (p_heading is not null and not (p_heading >= 0 and p_heading < 360)) or p_recorded_at < t.started_at or p_recorded_at < now()-interval '90 seconds' or p_recorded_at > now()+interval '15 seconds' then raise exception 'Invalid or inaccurate location'; end if;
 select * into previous from public.transport_gps where bus_id=t.bus_id for update;
 if found and previous.trip_id=t.id and (p_recorded_at <= previous.recorded_at or p_recorded_at < previous.recorded_at+interval '5 seconds') then return false; end if;
 insert into public.transport_gps(bus_id,trip_id,latitude,longitude,accuracy,speed,heading,recorded_at,source) values(t.bus_id,t.id,p_lat,p_lon,p_accuracy,p_speed,p_heading,p_recorded_at,'live') on conflict(bus_id) do update set trip_id=excluded.trip_id,latitude=excluded.latitude,longitude=excluded.longitude,accuracy=excluded.accuracy,speed=excluded.speed,heading=excluded.heading,recorded_at=excluded.recorded_at,source='live';
 return true;
end $$;
create function public.student_tracking_context() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('bus_id',b.id,'bus_number',b.bus_number,'route',r.name,'pickup_stop_id',a.pickup_stop_id,'stops',coalesce((select jsonb_agg(jsonb_build_object('id',s.id,'name',s.name,'latitude',s.latitude,'longitude',s.longitude) order by rs.position) from public.transport_route_stops rs join public.transport_stops s on s.id=rs.stop_id where rs.route_id=r.id),'[]'::jsonb)) from public.profiles p join public.transport_assignments a on a.student_id=p.student_id join public.transport_buses b on b.id=a.bus_id left join public.transport_routes r on r.id=b.route_id where p.id=auth.uid() and p.role='student'
$$;
revoke all on function public.start_driver_trip(),public.my_active_trip(),public.end_driver_trip(uuid),public.record_driver_location(uuid,double precision,double precision,double precision,double precision,double precision,timestamptz),public.student_tracking_context() from public,anon;
grant execute on function public.start_driver_trip(),public.my_active_trip(),public.end_driver_trip(uuid),public.record_driver_location(uuid,double precision,double precision,double precision,double precision,double precision,timestamptz),public.student_tracking_context() to authenticated;
alter publication supabase_realtime add table public.transport_gps, public.transport_trips;
