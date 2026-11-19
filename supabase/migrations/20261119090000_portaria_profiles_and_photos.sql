-- Talk Marista: administração segura de perfis e fotos.
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $
  select role from public.profiles where id = auth.uid()
$;

alter table public.profiles add column if not exists avatar_path text;

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

drop policy if exists "portaria manage profiles" on public.profiles;
create policy "portaria manage profiles" on public.profiles
for all to authenticated
using (public.current_role() = 'portaria')
with check (public.current_role() = 'portaria');

drop policy if exists "portaria manage visitors" on public.visitors;
create policy "portaria manage visitors" on public.visitors
for all to authenticated using (public.current_role() = 'portaria')
with check (public.current_role() = 'portaria');

drop policy if exists "portaria manage workers" on public.workers;
create policy "portaria manage workers" on public.workers
for all to authenticated using (public.current_role() = 'portaria')
with check (public.current_role() = 'portaria');

drop policy if exists "portaria manage reservations" on public.reservations;
create policy "portaria manage reservations" on public.reservations
for all to authenticated using (public.current_role() = 'portaria')
with check (public.current_role() = 'portaria');

drop policy if exists "portaria manage packages" on public.packages;
create policy "portaria manage packages" on public.packages
for all to authenticated using (public.current_role() = 'portaria')
with check (public.current_role() = 'portaria');

drop policy if exists "profile photos read" on storage.objects;
create policy "profile photos read" on storage.objects
for select to authenticated using (bucket_id = 'profile-photos');

drop policy if exists "profile photos upload" on storage.objects;
create policy "profile photos upload" on storage.objects
for insert to authenticated with check (
  bucket_id = 'profile-photos'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'portaria')
);

drop policy if exists "profile photos update" on storage.objects;
create policy "profile photos update" on storage.objects
for update to authenticated using (
  bucket_id = 'profile-photos'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'portaria')
) with check (
  bucket_id = 'profile-photos'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'portaria')
);

drop policy if exists "profile photos delete" on storage.objects;
create policy "profile photos delete" on storage.objects
for delete to authenticated using (
  bucket_id = 'profile-photos'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'portaria')
);
