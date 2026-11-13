-- Owners may edit listing details, but not ownership or approval status.
-- Existing row-level policies still decide which rows they can edit.

revoke update on public.properties from authenticated;

grant update (
  address,
  price,
  bedrooms,
  bathrooms,
  square_feet,
  title,
  property_type,
  description,
  street_address,
  city,
  state,
  zip_code,
  amenities,
  image_path,
  image_alt_text
) on public.properties to authenticated;