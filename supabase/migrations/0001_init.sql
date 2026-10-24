-- ALL AUTO TT schema. Service-role writes from the app bypass RLS.
-- Direct client access: a dealer edits only their shop and listings. An admin edits everything.

create extension if not exists pgcrypto;

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

create or replace function public.protect_dealer_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or current_user = 'service_role' then
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

create or replace function public.protect_part_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() or current_user = 'service_role' then
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

create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_admin_write on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy categories_read on public.categories for select using (true);
create policy categories_admin on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy makes_read on public.makes for select using (true);
create policy makes_admin on public.makes for all using (public.is_admin()) with check (public.is_admin());
create policy models_read on public.models for select using (true);
create policy models_admin on public.models for all using (public.is_admin()) with check (public.is_admin());

create policy dealers_public_read on public.dealers for select using (status = 'approved' or owner_user_id = auth.uid()::text or public.is_admin());
create policy dealers_owner_update on public.dealers for update using (owner_user_id = auth.uid()::text or public.is_admin()) with check (owner_user_id = auth.uid()::text or public.is_admin());
create policy dealers_admin_insert on public.dealers for insert with check (public.is_admin());
create policy dealers_admin_delete on public.dealers for delete using (public.is_admin());

create policy parts_public_read on public.parts for select using (
  public.is_admin()
  or public.owns_dealer(dealer_id)
  or (
    status in ('available', 'reserved', 'sold')
    and (status = 'sold' or expires_at > now())
    and (status <> 'sold' or sold_at is null or sold_at > now() - interval '7 days')
    and exists (select 1 from public.dealers d where d.id = dealer_id and d.status = 'approved')
  )
);
create policy parts_owner_write on public.parts for insert with check (public.owns_dealer(dealer_id) or public.is_admin());
create policy parts_owner_update on public.parts for update using (public.owns_dealer(dealer_id) or public.is_admin()) with check (public.owns_dealer(dealer_id) or public.is_admin());
create policy parts_owner_delete on public.parts for delete using (public.owns_dealer(dealer_id) or public.is_admin());

create policy payments_owner_read on public.payments for select using (public.owns_dealer(dealer_id) or public.is_admin());
create policy payments_owner_insert on public.payments for insert with check (public.owns_dealer(dealer_id) or public.is_admin());
create policy payments_admin_update on public.payments for update using (public.is_admin()) with check (public.is_admin());

create policy reviews_read on public.reviews for select using (true);
create policy reviews_insert on public.reviews for insert with check (true);
create policy reviews_admin on public.reviews for update using (public.is_admin()) with check (public.is_admin());
create policy reviews_admin_delete on public.reviews for delete using (public.is_admin());

create policy reports_insert on public.reports for insert with check (true);
create policy reports_admin on public.reports for select using (public.is_admin());
create policy reports_admin_update on public.reports for update using (public.is_admin()) with check (public.is_admin());

create policy leads_owner on public.leads for select using (public.owns_dealer(dealer_id) or public.is_admin());
create policy inquiries_owner on public.inquiries for select using (public.owns_dealer(dealer_id) or public.is_admin());
create policy inquiries_owner_update on public.inquiries for update using (public.owns_dealer(dealer_id) or public.is_admin()) with check (public.owns_dealer(dealer_id) or public.is_admin());

create policy requests_read on public.part_requests for select using (auth.uid() is not null);
create policy requests_insert on public.part_requests for insert with check (true);
create policy requests_admin on public.part_requests for all using (public.is_admin()) with check (public.is_admin());

create policy ads_read on public.ads for select using (active = true or public.is_admin());
create policy ads_admin on public.ads for all using (public.is_admin()) with check (public.is_admin());
create policy ad_events_admin on public.ad_events for select using (public.is_admin());
create policy spotlights_read on public.spotlights for select using (true);
create policy spotlights_admin on public.spotlights for all using (public.is_admin()) with check (public.is_admin());
create policy emails_admin on public.emails for select using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_public_read on storage.objects for select using (bucket_id = 'media');
create policy media_auth_insert on storage.objects for insert to authenticated with check (bucket_id = 'media');
create policy media_auth_update on storage.objects for update to authenticated using (bucket_id = 'media');
create policy media_admin_delete on storage.objects for delete using (bucket_id = 'media' and public.is_admin());
