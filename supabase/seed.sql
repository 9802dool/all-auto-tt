-- Catalog rows for a fresh Supabase project.
-- The 4 sample dealers and 24 sample parts are created by the app the first time it
-- runs without Supabase keys (see lib/seed.ts). Demo logins are local-only because
-- they are not Supabase Auth users.

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
