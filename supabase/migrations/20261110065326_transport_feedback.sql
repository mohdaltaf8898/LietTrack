create table public.transport_feedback (
 id uuid primary key default gen_random_uuid(),
 student_user_id uuid not null references auth.users(id) on delete cascade,
 category text not null check (category in ('general','delay','overcrowding','cleanliness','driver_concern','lost_item','bus_route_issue')),
 message text not null check (length(trim(message)) between 10 and 2000),
 status text not null default 'submitted' check (status in ('submitted','reviewing','resolved')),
 response text check (response is null or length(response) <= 2000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.transport_feedback enable row level security;
revoke all on public.transport_feedback from public, anon, authenticated;
grant select on public.transport_feedback to authenticated;
grant insert (student_user_id, category, message) on public.transport_feedback to authenticated;
grant update (status, response, updated_at) on public.transport_feedback to authenticated;
create policy feedback_own_read on public.transport_feedback for select to authenticated using (student_user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='student'));
create policy feedback_student_insert on public.transport_feedback for insert to authenticated with check (student_user_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='student' and p.student_id is not null));
create policy feedback_admin_read on public.transport_feedback for select to authenticated using ((select public.is_transport_admin()));
create policy feedback_admin_update on public.transport_feedback for update to authenticated using ((select public.is_transport_admin())) with check ((select public.is_transport_admin()));
create index transport_feedback_student_created on public.transport_feedback (student_user_id,created_at desc);
