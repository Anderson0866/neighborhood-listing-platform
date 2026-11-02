# Row-level security audit

Migration: `supabase/migrations/20261029140000_exam_schema_persistence.sql`.

The user applied the migration in Supabase SQL Editor and reported `Success. No rows returned`. A follow-up query against `pg_tables` returned `rowsecurity = true` for `inquiries`, `profiles`, `properties`, `property_sponsors`, and `sponsors` (November 2, 2026). A `pg_policies` count query returned 3, 2, 6, 2, and 2 policies for those tables respectively. The role checks below used `SET LOCAL ROLE` and a test user's UID in `request.jwt.claim.sub`; remaining untested cases are marked Pending or PARTIAL.

A `has_table_privilege` query for the `anon` role returned `true` for SELECT on `properties`, `false` for SELECT on `inquiries`, and `true` for INSERT on `inquiries`. This verifies table grants; row-specific policy behavior was checked separately with sample records.

The Next.js production build passed on November 2, 2026. A request to the locally running `GET /api/properties` returned HTTP 200 with `[]` from the new, empty Supabase project. This confirms the public API route can reach the database, but it does not prove approved-only filtering until sample records exist.

After sample records were added, a public Supabase REST query selecting approved properties and nested sponsor name/tier returned HTTP 200 with exactly one row: `200 Exam Test Lane`, `Exam Test Sponsor`, `gold`. The route handler now uses this same public query shape and flattens its sponsor list in the API response. The direct REST result verifies the query and RLS; the final route response was not retested in this session.

The user created two sample properties: `100 Exam Test Lane` (`draft`) and `200 Exam Test Lane` (`approved`). In Supabase SQL Editor, `BEGIN; SET LOCAL ROLE anon; SELECT address, status FROM public.properties ORDER BY address; ROLLBACK;` returned only `200 Exam Test Lane` with `approved` status. This is an observed positive public read and negative draft read under the anonymous role.

The user submitted an inquiry for the approved sample property with `SET LOCAL ROLE anon`; SQL Editor reported success. A follow-up administrator count query returned one row for `audit@example.com`. This verifies anonymous inquiry insertion and persistence.

An anonymous read attempt (`SET LOCAL ROLE anon; SELECT * FROM public.inquiries`) failed with PostgreSQL error `42501: permission denied for table inquiries`. The generic hint to grant SELECT was not followed because denying public reads is the requirement.

With `request.jwt.claim.sub` set to the test owner's ID and `SET LOCAL ROLE authenticated`, an UPDATE of the owner's draft listing returned `100 Exam Test Lane` with price `310000.00`. The transaction was rolled back, so the change was only a permission test.

With the same owner identity, an UPDATE of the approved sample listing returned no rows. This confirms that an owner cannot edit a live approved listing under the current policy.

With the test owner's identity and the authenticated role, `SELECT count(*) FROM public.inquiries` returned one row for the inquiry linked to their property. This is an observed owner inquiry-read success.

The user created a second authenticated owner profile and a draft property at `300 Exam Test Lane` owned by that profile. An UPDATE of that draft under the first owner's identity returned no rows, confirming cross-owner edit isolation.

The user created an authenticated admin profile. With its UID in `request.jwt.claim.sub` and `SET LOCAL ROLE authenticated`, a read across all five tables returned 3 profiles, 0 sponsors, 3 properties, 0 property-sponsor links, and 1 inquiry. This verifies admin read access to each table.

Under the admin identity, an INSERT into `sponsors` and `property_sponsors` created the active gold-tier `Exam Test Sponsor` and one link to the approved property. The transaction committed and reported `links_created = 1`, verifying admin write access to both tables.

With `SET LOCAL ROLE anon`, a join across `property_sponsors`, `properties`, and `sponsors` returned one row: approved `200 Exam Test Lane`, active `Exam Test Sponsor`, tier `gold`. This verifies the public sponsor relationship for an approved property.

After changing the sample sponsor to `active_status = false`, the same anonymous join returned no rows. This verifies that an inactive sponsor and its link are hidden from visitors. The user restored the sample sponsor to `active_status = true` after the audit.

| Role | Operation | Expected | Live result |
| :--- | :--- | :--- | :--- |
| Anonymous | Read approved property | PASS | PASS: approved sample returned |
| Anonymous | Read draft property | DENIED (zero rows) | DENIED: draft sample absent |
| Anonymous | Read active sponsor and approved property link | PASS | PASS: gold-tier sponsor linked to approved property |
| Anonymous | Read inactive sponsor or draft property link | DENIED (zero rows) | DENIED: inactive sponsor link returned no rows; draft link not separately tested |
| Owner A | Insert own draft listing | PASS | Pending |
| Owner A | Update own draft listing | PASS | PASS: draft UPDATE returned one row |
| Owner A | Update Owner B listing | DENIED (zero rows) | DENIED: UPDATE returned no rows |
| Owner A | Update own approved listing | DENIED (zero rows) | DENIED: UPDATE returned no rows |
| Inquirer | Insert inquiry for approved property | PASS | PASS: one test inquiry persisted |
| Inquirer | Select prior inquiries | DENIED | DENIED: SQLSTATE 42501 permission denied |
| Property owner | Select inquiries for own property | PASS | PASS: one linked inquiry visible |
| Admin | Read/write all five tables with admin session | PASS | PARTIAL: reads across all five tables and writes to sponsors/link table passed |
| Trusted server | Read/write all five tables with service role | PASS | Pending |

## Live verification procedure

1. Apply the migration in Supabase SQL Editor or with `supabase db push`. Record the execution result.
2. Create one admin and two owner users. Insert their `profiles` rows using SQL Editor. Create draft and approved properties, one active and one inactive sponsor, their links, and one inquiry.
3. Run each operation with the **anon key** or the corresponding user's session token through Supabase REST. An empty array on SELECT is the expected denied result; INSERT/UPDATE/DELETE denial may be a permission error or affect zero rows. Do not treat a service-role request as proof that RLS works, because the service role bypasses RLS.
4. Replace each Pending entry with observed PASS or DENIED and record the test date and redacted request/response. Never paste tokens or keys into this document.
