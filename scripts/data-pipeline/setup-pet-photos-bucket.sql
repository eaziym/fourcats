-- Creates a public "pet-photos" storage bucket and RLS policies so each
-- authenticated user can manage only files under their own `<uid>/...` prefix.
-- Reads are public (we serve public URLs); writes are owner-scoped.
-- Safe to run multiple times.

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do update set public = excluded.public;

-- Public read access for objects in the bucket.
drop policy if exists "pet_photos_public_read" on storage.objects;
create policy "pet_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'pet-photos');

-- Authenticated users can upload into their own folder (<uid>/...).
drop policy if exists "pet_photos_owner_insert" on storage.objects;
create policy "pet_photos_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update their own files.
drop policy if exists "pet_photos_owner_update" on storage.objects;
create policy "pet_photos_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete their own files.
drop policy if exists "pet_photos_owner_delete" on storage.objects;
create policy "pet_photos_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
