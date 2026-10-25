-- ALL AUTO TT
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- Safe to run again: policies are replaced, catalog rows are inserted only if missing.
--
-- The app writes with the service role, which bypasses these policies.
-- The policies are the backstop when the anon or authenticated key is used directly.
--
-- Admin
--   profiles.role = 'admin' is the admin role. is_admin() is what every policy checks.
--   Signing up creates a dealer profile. After that person exists, run:
--     select public.grant_admin('you@example.com');
--   grant_admin is not callable by dealers or the public anon key.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null default '',
  phone text not null default '',
  role text not null default 'dealer' check (role in ('admin', 'dealer')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  slug text not null unique,
  seo_name text not null,
  icon text not null default 'Package',
  sort integer not null default 0
);

create table if not exists public.makes (
  id text primary key,
  name text not null unique,
  slug text not null unique,
  sort integer not null default 0
);

create table if not exists public.models (
  id text primary key,
  make text not null references public.makes (name) on update cascade on delete cascade,
  name text not null,
  unique (make, name)
);

create table if not exists public.dealers (
  id text primary key,
  owner_user_id text,
  business_name text not null,
  slug text not null unique,
  contact_name text not null,
  phone text not null,
  whatsapp text not null,
  email text not null,
  region text not null,
  address text not null default '',
  lat double precision,
  lng double precision,
  hours text not null default '',
  logo text,
  cover text,
  about text not null default '',
  registration_number text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'suspended', 'removed')),
  verified boolean not null default false,
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  plan_expires_at timestamptz,
  plan_reminder_for text,
  rating_avg double precision not null default 0,
  rating_count integer not null default 0,
  example boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.parts (
  id text primary key,
  title text not null,
  slug text not null unique,
  category text not null,
  make text not null,
  model text not null default '',
  year_from integer,
  year_to integer,
  engine_code text not null default '',
  transmission_type text not null default 'Unknown',
  condition text not null,
  price_ttd integer not null check (price_ttd >= 0),
  negotiable boolean not null default false,
  description text not null default '',
  photos text[] not null default '{}',
  location text not null,
  status text not null default 'available' check (status in ('available', 'reserved', 'sold', 'removed')),
  featured boolean not null default false,
  featured_until timestamptz,
  dealer_id text not null references public.dealers (id) on delete cascade,
  views integer not null default 0,
  whatsapp_clicks integer not null default 0,
  call_clicks integer not null default 0,
  inquiry_count integer not null default 0,
  expires_at timestamptz not null,
  sold_at timestamptz,
  renewed_at timestamptz,
  expiry_reminder_for text,
  example boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists parts_dealer_idx on public.parts (dealer_id);
create index if not exists parts_make_idx on public.parts (make);
create index if not exists parts_status_idx on public.parts (status);
create index if not exists dealers_owner_idx on public.dealers (owner_user_id);

create table if not exists public.payments (
  id text primary key,
  dealer_id text not null references public.dealers (id) on delete cascade,
  plan text not null,
  amount_ttd integer not null,
  method text not null check (method in ('bank_transfer', 'wipay')),
  receipt_url text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'rejected')),
  period_start timestamptz,
  period_end timestamptz,
  kind text not null check (kind in ('subscription', 'featured', 'extra')),
  part_id text,
  extra_type text check (extra_type in ('upload_stock', 'photo_service')),
  fulfillment text check (fulfillment in ('new', 'in_progress', 'done')),
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id text primary key,
  dealer_id text not null references public.dealers (id) on delete cascade,
  name text not null,
  phone text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (dealer_id, phone)
);

create table if not exists public.reports (
  id text primary key,
  part_id text not null,
  reason text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'dismissed', 'actioned')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id text primary key,
  part_id text not null,
  dealer_id text not null,
  type text not null check (type in ('whatsapp', 'call', 'form')),
  created_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id text primary key,
  part_id text not null,
  dealer_id text not null,
  name text not null,
  phone text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists inquiries_dealer_idx on public.inquiries (dealer_id);
create index if not exists leads_dealer_idx on public.leads (dealer_id);

create table if not exists public.part_requests (
  id text primary key,
  name text not null,
  phone text not null,
  make text not null,
  model text not null default '',
  year text not null default '',
  part text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.ads (
  id text primary key,
  title text not null,
  image text not null,
  link text not null,
  placement text not null check (placement in ('homepage', 'search_sidebar', 'search_inline', 'part_page')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  impressions integer not null default 0,
  clicks integer not null default 0,
  advertiser text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.ad_events (
  id text primary key,
  ad_id text not null,
  type text not null check (type in ('impression', 'click')),
  created_at timestamptz not null default now()
);

create table if not exists public.spotlights (
  id text primary key,
  dealer_id text not null,
  kind text not null check (kind in ('month', 'homepage')),
  label text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.emails (
  id text primary key,
  "to" text not null,
  subject text not null,
  body text not null,
  kind text not null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'logged')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin role and ownership helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.owns_dealer(target text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.dealers
    where id = target and owner_user_id = auth.uid()::text
  );
$$;

-- Run in the SQL Editor after the person has signed up. Not exposed to the API.
create or replace function public.grant_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = 'admin'
  where lower(email) = lower(target_email);
  if not found then
    raise exception 'No profile for %. Sign up first, then grant admin.', target_email;
  end if;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'dealer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Dealers cannot change plan, verification, status, or ratings.
create or replace function public.protect_dealer_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  new.status := old.status;
  new.verified := old.verified;
  new.plan := old.plan;
  new.plan_expires_at := old.plan_expires_at;
  new.plan_reminder_for := old.plan_reminder_for;
  new.rating_avg := old.rating_avg;
  new.rating_count := old.rating_count;
  new.owner_user_id := old.owner_user_id;
  new.example := old.example;
  return new;
end;
$$;

drop trigger if exists dealers_protect on public.dealers;
create trigger dealers_protect
  before update on public.dealers
  for each row execute function public.protect_dealer_fields();

-- Dealers cannot change featured flags, lead counters, or which shop owns the part.
create or replace function public.protect_part_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  new.featured := old.featured;
  new.featured_until := old.featured_until;
  new.views := old.views;
  new.whatsapp_clicks := old.whatsapp_clicks;
  new.call_clicks := old.call_clicks;
  new.inquiry_count := old.inquiry_count;
  new.dealer_id := old.dealer_id;
  new.example := old.example;
  return new;
end;
$$;

drop trigger if exists parts_protect on public.parts;
create trigger parts_protect
  before update on public.parts
  for each row execute function public.protect_part_fields();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.makes enable row level security;
alter table public.models enable row level security;
alter table public.dealers enable row level security;
alter table public.parts enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.leads enable row level security;
alter table public.inquiries enable row level security;
alter table public.part_requests enable row level security;
alter table public.ads enable row level security;
alter table public.ad_events enable row level security;
alter table public.spotlights enable row level security;
alter table public.emails enable row level security;

drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists categories_read on public.categories;
drop policy if exists categories_admin on public.categories;
create policy categories_read on public.categories for select using (true);
create policy categories_admin on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists makes_read on public.makes;
drop policy if exists makes_admin on public.makes;
create policy makes_read on public.makes for select using (true);
create policy makes_admin on public.makes
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists models_read on public.models;
drop policy if exists models_admin on public.models;
create policy models_read on public.models for select using (true);
create policy models_admin on public.models
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists dealers_public_read on public.dealers;
drop policy if exists dealers_owner_update on public.dealers;
drop policy if exists dealers_admin_insert on public.dealers;
drop policy if exists dealers_admin_delete on public.dealers;
create policy dealers_public_read on public.dealers
  for select using (status = 'approved' or owner_user_id = auth.uid()::text or public.is_admin());
create policy dealers_owner_update on public.dealers
  for update
  using (owner_user_id = auth.uid()::text or public.is_admin())
  with check (owner_user_id = auth.uid()::text or public.is_admin());
create policy dealers_admin_insert on public.dealers
  for insert with check (public.is_admin());
create policy dealers_admin_delete on public.dealers
  for delete using (public.is_admin());

drop policy if exists parts_public_read on public.parts;
drop policy if exists parts_owner_write on public.parts;
drop policy if exists parts_owner_update on public.parts;
drop policy if exists parts_owner_delete on public.parts;
create policy parts_public_read on public.parts
  for select using (
    public.is_admin()
    or public.owns_dealer(dealer_id)
    or (
      status in ('available', 'reserved', 'sold')
      and (status = 'sold' or expires_at > now())
      and (status <> 'sold' or sold_at is null or sold_at > now() - interval '7 days')
      and exists (select 1 from public.dealers d where d.id = dealer_id and d.status = 'approved')
    )
  );
create policy parts_owner_write on public.parts
  for insert with check (public.owns_dealer(dealer_id) or public.is_admin());
create policy parts_owner_update on public.parts
  for update
  using (public.owns_dealer(dealer_id) or public.is_admin())
  with check (public.owns_dealer(dealer_id) or public.is_admin());
create policy parts_owner_delete on public.parts
  for delete using (public.owns_dealer(dealer_id) or public.is_admin());

drop policy if exists payments_owner_read on public.payments;
drop policy if exists payments_owner_insert on public.payments;
drop policy if exists payments_admin_update on public.payments;
create policy payments_owner_read on public.payments
  for select using (public.owns_dealer(dealer_id) or public.is_admin());
create policy payments_owner_insert on public.payments
  for insert with check (public.owns_dealer(dealer_id) or public.is_admin());
create policy payments_admin_update on public.payments
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists reviews_read on public.reviews;
drop policy if exists reviews_insert on public.reviews;
drop policy if exists reviews_admin on public.reviews;
drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_read on public.reviews for select using (true);
create policy reviews_insert on public.reviews for insert with check (true);
create policy reviews_admin on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());
create policy reviews_admin_delete on public.reviews
  for delete using (public.is_admin());

drop policy if exists reports_insert on public.reports;
drop policy if exists reports_admin on public.reports;
drop policy if exists reports_admin_update on public.reports;
create policy reports_insert on public.reports for insert with check (true);
create policy reports_admin on public.reports for select using (public.is_admin());
create policy reports_admin_update on public.reports
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists leads_owner on public.leads;
create policy leads_owner on public.leads
  for select using (public.owns_dealer(dealer_id) or public.is_admin());

drop policy if exists inquiries_owner on public.inquiries;
drop policy if exists inquiries_owner_update on public.inquiries;
create policy inquiries_owner on public.inquiries
  for select using (public.owns_dealer(dealer_id) or public.is_admin());
create policy inquiries_owner_update on public.inquiries
  for update
  using (public.owns_dealer(dealer_id) or public.is_admin())
  with check (public.owns_dealer(dealer_id) or public.is_admin());

drop policy if exists requests_read on public.part_requests;
drop policy if exists requests_insert on public.part_requests;
drop policy if exists requests_admin on public.part_requests;
create policy requests_read on public.part_requests
  for select using (auth.uid() is not null);
create policy requests_insert on public.part_requests
  for insert with check (true);
create policy requests_admin on public.part_requests
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists ads_read on public.ads;
drop policy if exists ads_admin on public.ads;
create policy ads_read on public.ads
  for select using (active = true or public.is_admin());
create policy ads_admin on public.ads
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists ad_events_admin on public.ad_events;
create policy ad_events_admin on public.ad_events
  for select using (public.is_admin());

drop policy if exists spotlights_read on public.spotlights;
drop policy if exists spotlights_admin on public.spotlights;
create policy spotlights_read on public.spotlights for select using (true);
create policy spotlights_admin on public.spotlights
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists emails_admin on public.emails;
create policy emails_admin on public.emails
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Grants. RLS still applies to anon and authenticated.
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;
grant execute on function public.owns_dealer(text) to anon, authenticated, service_role;

revoke all on function public.grant_admin(text) from public, anon, authenticated;
grant execute on function public.grant_admin(text) to service_role;

-- ---------------------------------------------------------------------------
-- Storage: public media bucket for listing photos, logos, covers, and receipts
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists media_public_read on storage.objects;
drop policy if exists media_auth_insert on storage.objects;
drop policy if exists media_auth_update on storage.objects;
drop policy if exists media_admin_delete on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');
create policy media_auth_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy media_auth_update on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy media_admin_delete on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Catalog. Sample dealers and parts are not included: demo logins are local only.
-- ---------------------------------------------------------------------------

insert into public.categories (id, name, slug, seo_name, icon, sort) values
  ('cat_engine', 'Engine', 'engines', 'Engines', 'Cog', 1),
  ('cat_gearbox', 'Gearbox/Transmission', 'gearboxes', 'Gearboxes', 'Settings2', 2),
  ('cat_body', 'Body Parts', 'body-parts', 'Body Parts', 'Car', 3),
  ('cat_suspension', 'Suspension', 'suspension', 'Suspension Parts', 'MoveVertical', 4),
  ('cat_electrical', 'Electrical', 'electrical', 'Electrical Parts', 'Zap', 5),
  ('cat_interior', 'Interior', 'interior', 'Interior Parts', 'Armchair', 6),
  ('cat_wheels', 'Wheels & Tyres', 'wheels-tyres', 'Wheels and Tyres', 'CircleDot', 7),
  ('cat_lights', 'Lights', 'lights', 'Lights', 'Lightbulb', 8),
  ('cat_other', 'Other', 'other', 'Parts', 'Package', 9)
on conflict (id) do nothing;

insert into public.makes (id, name, slug, sort) values
  ('make_toyota', 'Toyota', 'toyota', 1),
  ('make_nissan', 'Nissan', 'nissan', 2),
  ('make_honda', 'Honda', 'honda', 3),
  ('make_mazda', 'Mazda', 'mazda', 4),
  ('make_mitsubishi', 'Mitsubishi', 'mitsubishi', 5),
  ('make_suzuki', 'Suzuki', 'suzuki', 6),
  ('make_hyundai', 'Hyundai', 'hyundai', 7),
  ('make_kia', 'Kia', 'kia', 8)
on conflict (id) do nothing;

insert into public.models (id, make, name) values
  ('mdl_toyota_axio', 'Toyota', 'Axio'),
  ('mdl_toyota_fielder', 'Toyota', 'Fielder'),
  ('mdl_toyota_premio', 'Toyota', 'Premio'),
  ('mdl_toyota_vitz', 'Toyota', 'Vitz'),
  ('mdl_nissan_note', 'Nissan', 'Note'),
  ('mdl_nissan_tiida', 'Nissan', 'Tiida'),
  ('mdl_nissan_ad', 'Nissan', 'AD Wagon'),
  ('mdl_honda_fit', 'Honda', 'Fit'),
  ('mdl_honda_civic', 'Honda', 'Civic'),
  ('mdl_honda_stream', 'Honda', 'Stream'),
  ('mdl_mazda_demio', 'Mazda', 'Demio'),
  ('mdl_mazda_axela', 'Mazda', 'Axela'),
  ('mdl_mitsubishi_lancer', 'Mitsubishi', 'Lancer'),
  ('mdl_mitsubishi_asx', 'Mitsubishi', 'ASX'),
  ('mdl_suzuki_swift', 'Suzuki', 'Swift'),
  ('mdl_suzuki_alto', 'Suzuki', 'Alto'),
  ('mdl_hyundai_tucson', 'Hyundai', 'Tucson'),
  ('mdl_hyundai_elantra', 'Hyundai', 'Elantra'),
  ('mdl_kia_sportage', 'Kia', 'Sportage'),
  ('mdl_kia_rio', 'Kia', 'Rio')
on conflict (id) do nothing;
