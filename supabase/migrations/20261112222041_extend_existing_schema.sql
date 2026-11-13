-- Lab 5: add website fields to the tables already in this project.
-- New fields are nullable so existing records remain valid.

alter table public.properties
  add column title text,
  add column property_type text
    check (property_type in ('Apartment', 'Condo', 'House')),
  add column description text,
  add column street_address text,
  add column city text,
  add column state text
    check (state = 'CA'),
  add column zip_code text
    check (zip_code ~ '^[0-9]{5}$'),
  add column amenities text[] not null default '{}',
  add column image_path text,
  add column image_alt_text text,
  add column updated_at timestamptz not null default now();

alter table public.sponsors
  add column category text
    check (category in ('Mortgage', 'Moving', 'Insurance')),
  add column message text,
  add column website text
    check (website is null or website ~ '^https://'),
  add column service_zip_codes text[] not null default '{}',
  add column updated_at timestamptz not null default now();