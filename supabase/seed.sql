-- Lab 5 fictional demo records. Safe to run again: fixed IDs prevent duplicates.

insert into public.sponsors (
  id, name, tier, active_status,
  category, message, website, service_zip_codes
)
values (
  '00000000-0000-4000-8000-000000000502',
  'Fictional Neighborhood Moving',
  'bronze',
  true,
  'Moving',
  'Fictional moving support for this class demonstration.',
  'https://example.com',
  array['90001']
)
on conflict (id) do nothing;

insert into public.properties (
  id, owner_id, address, price, bedrooms, bathrooms,
  square_feet, status, title, property_type, description,
  street_address, city, state, zip_code, amenities,
  image_path, image_alt_text
)
select
  '00000000-0000-4000-8000-000000000501',
  p.id,
  '714 Alder Lane, Los Angeles, CA 90001',
  500000,
  3,
  2,
  1200,
  'approved',
  'Alder Lane House',
  'House',
  'Three-bedroom home with parking and a spacious living area',
  '714 Alder Lane',
  'Los Angeles',
  'CA',
  '90001',
  array['parking'],
  '/properties/house.jpg',
  'Illustration of a fictional three-bedroom house'
from public.profiles p
where p.role = 'property_owner'
order by p.id
limit 1
on conflict (id) do nothing;

insert into public.property_sponsors (property_id, sponsor_id)
values (
  '00000000-0000-4000-8000-000000000501',
  '00000000-0000-4000-8000-000000000502'
)
on conflict (property_id, sponsor_id) do nothing;