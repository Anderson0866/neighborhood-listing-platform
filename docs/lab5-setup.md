\# Lab 5 database setup



\## Tables



\- profiles: user ID and application role; linked to Supabase Auth.

\- properties: property details, owner, and approval status.

\- sponsors: sponsor details and active status.

\- property\_sponsors: links properties to sponsors.

\- inquiries: messages about a property.



\## Local configuration



Copy `.env.example` to `.env.local` and enter the development project's

URL and publishable key. `.env.local` is ignored by Git. The current

GET, POST, and PATCH routes use the publishable key and database access

rules; no secret or service-role key is used by these routes.



\## Migration limit



These five tables and their original row-level policies existed in the

Supabase project before this branch. The versioned Lab 5 migrations add

website fields and tighten grants. They apply to that existing project,

but they do not yet rebuild the original five tables in an empty project.



\## Demo data



`supabase/seed.sql` adds made-up records for development. It uses an

existing property-owner profile, so that profile must exist before the

seed is run.
