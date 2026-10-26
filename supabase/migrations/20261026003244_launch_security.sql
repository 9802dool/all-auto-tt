-- Pre-launch security fixes for ALL AUTO TT
-- This migration:
-- 1. Creates a private 'receipts' bucket for payment receipts
-- 2. Adds storage policies for receipts (dealer + admin only)
-- 3. Adds size/type limits to the media bucket
-- 4. Revokes EXECUTE from public/anon/authenticated for security definer functions

-- ---------------------------------------------------------------------------
-- 1. Create private receipts bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 10485760, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

-- Receipts: uploading dealer and admins can read their receipts
drop policy if exists receipts_owner_insert on storage.objects;
drop policy if exists receipts_owner_read on storage.objects;
drop policy if exists receipts_admin_read on storage.objects;

create policy receipts_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and exists (
      select 1 from public.payments p
      join public.dealers d on d.id = p.dealer_id
      where p.id = (storage.foldername(name))[1]
      and d.owner_user_id = auth.uid()::text
    )
  );

create policy receipts_owner_read on storage.objects
  for select using (
    bucket_id = 'receipts'
    and (
      public.is_admin()
      or exists (
        select 1 from public.payments p
        join public.dealers d on d.id = p.dealer_id
        where p.id = (storage.foldername(name))[1]
        and d.owner_user_id = auth.uid()::text
      )
    )
  );

create policy receipts_admin_read on storage.objects
  for select using (bucket_id = 'receipts' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Add size/type limits to media bucket
-- ---------------------------------------------------------------------------

update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
where id = 'media';

-- ---------------------------------------------------------------------------
-- 3. Revoke EXECUTE from anon/authenticated for security definer functions
-- ---------------------------------------------------------------------------

-- These functions are only meant to be called by triggers or used internally by RLS policies.
-- Revoking execute prevents them from being called directly via the API (/rest/v1/rpc/...).

revoke execute on function public.is_admin() from anon, authenticated, public;
grant execute on function public.is_admin() to service_role;

revoke execute on function public.owns_dealer(text) from anon, authenticated, public;
grant execute on function public.owns_dealer(text) to service_role;

revoke execute on function public.protect_dealer_fields() from anon, authenticated, public;
grant execute on function public.protect_dealer_fields() to service_role;

revoke execute on function public.protect_part_fields() from anon, authenticated, public;
grant execute on function public.protect_part_fields() to service_role;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
grant execute on function public.handle_new_user() to service_role;

-- Note: RLS policies can still call these functions internally because they run
-- with elevated privileges. Only direct API calls via /rest/v1/rpc/... are blocked.
