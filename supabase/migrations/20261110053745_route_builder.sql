create function public.set_transport_route_stops(p_route_id uuid, p_stop_ids uuid[]) returns void language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_transport_admin() then raise exception 'Not authorized' using errcode = '42501'; end if;
  if not exists (select 1 from public.transport_routes where id=p_route_id) then raise exception 'Route not found'; end if;
  if cardinality(p_stop_ids) <> (select count(distinct s) from unnest(p_stop_ids) s) then raise exception 'Duplicate stops are not allowed'; end if;
  delete from public.transport_route_stops where route_id=p_route_id;
  insert into public.transport_route_stops(route_id, stop_id, position)
  select p_route_id, stop_id, (ord - 1)::int from unnest(p_stop_ids) with ordinality as u(stop_id,ord);
end $$;
revoke all on function public.set_transport_route_stops(uuid, uuid[]) from public, anon;
grant execute on function public.set_transport_route_stops(uuid, uuid[]) to authenticated;
