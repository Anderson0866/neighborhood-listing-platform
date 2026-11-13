-- Server-only code needs table permissions.
-- The service key must never be sent to the browser or committed to Git.

grant select, insert, update, delete on
  public.profiles,
  public.properties,
  public.sponsors,
  public.property_sponsors,
  public.inquiries
to service_role;