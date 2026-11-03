# Sponsor-Backed Property Listing & Inquiry Subsystem

The backend roles are `anon` (visitor), `property_owner`, and `admin` (from `profiles.role`). Public users may browse approved listings and active sponsors; inquiry contents are private.

## Story 1 — Property owner (Medium)

As a registered property owner, I want to submit listing drafts so that prospective buyers can review them once administrative staff verify them.

- **Given** an authenticated user with the `property_owner` role, **when** they submit a valid listing payload to `POST /api/properties`, **then** the new property is saved with `status = 'draft'` and `owner_id = auth.uid()`, and the response is `201 Created`.
- **Given** an unauthenticated user or a payload with missing, invalid, or extra fields, **when** they submit the same request, **then** no property is inserted and the API returns `401` or structured `400` validation details, respectively.
- **Given** a property owner, **when** they update a listing, **then** they may change only their own draft or rejected listing; changes to approved or other owners' listings are denied.

**Traceability:** `supabase/migrations/20261029140000_exam_schema_persistence.sql` (`profiles`, `properties`, owner policies); `src/app/api/properties/route.ts` (POST); `src/schemas/property.ts` (payload contract).

## Story 2 — Public inquirer (Medium)

As a prospective neighborhood resident, I want to view approved properties alongside their tier-level sponsors and submit an inquiry without seeing prior inquiries from other users.

- **Given** an anonymous visitor, **when** they request listings, **then** only `approved` properties and linked sponsors with `active_status = true` are visible, including each sponsor's tier.
- **Given** any visitor, **when** they submit an inquiry with a valid email, a message of at least 10 characters, and an approved property ID, **then** it is stored and the visitor receives confirmation.
- **Given** an anonymous visitor or an inquirer, **when** they try to read existing inquiries, **then** the database returns no rows; only the property's owner and admins may read them.

**Traceability:** `supabase/migrations/20261029140000_exam_schema_persistence.sql` (`sponsors`, `property_sponsors`, `inquiries`, public and inquiry policies); `src/app/api/properties/route.ts` (GET); `src/app/api/inquiries/route.ts` (POST).

## Story 3 — Platform admin (Large)

As a platform administrator, I want full override authority across all records and tables to conduct compliance audits.

- **Given** an authenticated profile with `role = 'admin'`, **when** they query or modify any of the five subsystem tables, **then** the operation succeeds subject to table constraints.
- **Given** an authenticated non-admin, **when** they attempt the same unrestricted operation, **then** row-level security denies records outside their permitted scope.
- **Given** a trusted server process using the service role key, **when** it performs a compliance audit, **then** it can read and write across the five tables; the key remains server-only.

**Traceability:** `supabase/migrations/20261029140000_exam_schema_persistence.sql` (admin policies on all five tables); `src/lib/supabaseServer.ts` (server-only privileged client); `src/app/api/properties/route.ts` (public and owner operations).
