# Data-model AI review

Date: 2026-10-05

These notes summarize the actual ChatGPT advice and the Gemini review
supplied during this assignment. They are summaries, not verbatim transcripts.

## Prompt used for Gemini

Review my data model for a beginner classroom property-listing project.

Property contains:
property_id, title, property_type, description, street_address, city,
state, zip_code, price, bedrooms, bathrooms, square_feet, amenities,
local_sponsors, image_path, and image_alt_text.

Sponsor contains:
sponsor_id, business_name, category, message, website, and service_zip_codes.

PropertySponsor contains:
property_id and sponsor_id. Together they identify a unique relationship.

The generated JSON stores properties and sponsors separately. Each property's
local_sponsors array contains sponsor IDs. After validation, the application
derives PropertySponsor records from those IDs.

Validation rejects duplicate property IDs, duplicate sponsor IDs, repeated
sponsor links, unknown sponsor references, and links to sponsors that do not
serve the property's ZIP code.

Amenities currently use a controlled list:
parking, laundry, balcony, air_conditioning, pool, gym.

Please:
1. Review the normalization and the many-to-many sponsor relationship.
2. Distinguish the JSON transport format from a normalized database design.
3. Compare free-text amenities, a controlled list, and an Amenity table with
   a PropertyAmenity join table.
4. Recommend an approach for this small project and explain its tradeoffs.
5. Identify limitations or improvements I should document.

Explain in beginner-friendly language. Return a written review, not JSON.

## ChatGPT advice

Store sponsor information once and connect properties to sponsors by ID.
Keep amenities as a controlled list for this small project. Separate Amenity
and PropertyAmenity tables would become useful if amenities need metadata
or administration independent of code changes.

## Gemini advice

Gemini supported the PropertySponsor junction model and its composite key.
It distinguished JSON arrays used for transport from normalized database rows.
It recommended the controlled amenities list for the current scope.

Gemini identified possible future improvements:
- SponsorZipCode records for service areas in a relational database.
- PropertyImage records for multiple photos.
- Sponsorship start and end dates.
- Exact monetary storage and text ZIP codes.

## Advice accepted

Keep the controlled amenities list. It prevents spelling variants and keeps
validation simple. Adding an allowed amenity requires a schema update.

Keep sponsor details separate from property details. Derive PropertySponsor
links after validating IDs, uniqueness, and sponsor service areas.

Document the difference between JSON transport and relational storage.
Current links exist in memory; this project does not implement database tables.

## Advice qualified

A junction table alone does not prove that the whole database is in 3NF.
That requires examining keys and dependencies throughout the design.

Gemini's statement that every amenities search or fetch requires three
tables was too broad. The required tables depend on the requested fields.

Free-text amenities are difficult to query consistently, rather than
literally impossible to query.

Current prices are expressed in USD, with whole-dollar values in the samples.
The schema permits nonnegative numbers. A future database should use exact
decimal storage or explicitly defined integer cents for monetary calculations.
The existing sample values must not be silently reinterpreted as cents.

## Verification

Both generated datasets passed field and sponsor relationship validation.
All 13 automated tests passed.
Browser checks passed for five unfiltered cards, two condos under $650,000,
and no matching house under $500,000 with no sponsor banner.

## References checked

Microsoft: Database design basics
https://support.microsoft.com/en-us/access/database-design-basics

PostgreSQL: Numeric types
https://www.postgresql.org/docs/current/datatype-numeric.html
