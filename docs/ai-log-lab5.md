\# Lab 5 AI collaboration log



\## AI Studio prompt



Review this student Supabase design as a defensive database engineer. Five existing tables are profiles, properties, sponsors, property\_sponsors, and inquiries. All have RLS. Visitors can read approved properties and active sponsors. Owners can read and edit their own unapproved properties; column grants prevent them from updating owner\_id or status. A Next.js GET route uses a publishable key. POST and PATCH verify a Supabase Auth token and use the caller's JWT so RLS applies. A server role has table grants. The original five tables predate the versioned migrations, which currently only extend them.



Identify the three most important security or reproducibility risks. For each, suggest a concrete check. Mark anything you cannot confirm from this description as uncertain. Do not request credentials or private data.



\## Useful output and verification



1\. AI Studio identified the missing versioned baseline. Confirmed: the first attempted migration failed because `profiles` already existed, while the remote migration list had no baseline. The current migrations extend the existing database. This remains a limitation and is documented in `docs/lab5-setup.md`.

2\. AI Studio recommended checking table and column grants. Confirmed: authenticated users originally had table-wide UPDATE. We added a migration restricting UPDATE to listing-detail columns. A follow-up query returned `false` for table-wide UPDATE, `true` for price UPDATE, and `false` for status and owner\_id UPDATE.

3\. AI Studio recommended role-based tests. We tested anonymous, owner, other identity, and service-role reads; anonymous and other-user writes were denied. Results are in `docs/lab5-tests.md`.



\## Suggestions not adopted as facts



\- AI Studio warned that owners might insert `status = 'approved'` or change `owner\_id`. The existing owner INSERT policy requires the caller's ID and `status = 'draft'`; the owner UPDATE policy has ownership and unapproved-status checks. We have not yet run an authenticated HTTP test of those attempts.

\- AI Studio said the policies for profiles, inquiries, and property\_sponsors were unknown from its prompt. We inspected their existing policies. In particular, public property-sponsor links require an approved property and active sponsor. The routes written for this lab use the publishable key with the caller's JWT for writes, not a service key.

\- A clean-database rebuild was suggested but has not been performed. Do not claim it passed.



\## ChatGPT contribution



ChatGPT reviewed the AI-generated initial SQL against the live schema, identified incompatible table names and IDs, guided the additive migrations and access checks, and drafted the GET, POST, and PATCH routes. Suggestions were checked through migration results, SQL role tests, TypeScript, and a successful Next.js build.



\## Commit



Add the Lab 5 commit hash here after committing.
