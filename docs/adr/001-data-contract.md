# ADR 001: Property and Sponsor Data Contracts

Date: October 5, 2026
Status: Accepted for the classroom project

## Context

My project displays property listings and information about local sponsors. I needed a consistent way to organize this information and validate the data Gemini generates before displaying it on the website.

The data model also needs to support property details, sponsor selection, and possible voice responses. These requirements helped determine which fields to include.

Property cards need a title, address, price, bedrooms, bathrooms, image, and alternative text. Property details also need a description, square footage, and amenities. Sponsor selection needs sponsor references and service ZIP codes. A voice response would use the relevant property information to answer a user's question.

## Decision

I used Zod to define the data contracts. These schemas check the data at runtime and provide the TypeScript record types. The component types are derived from those record types, which helps keep the components and validation rules consistent.

The model separates Property, Sponsor, and PropertySponsor. Property uses `property_id` as its identifier, and Sponsor uses `sponsor_id`. PropertySponsor connects them using both IDs. Together, those IDs identify a unique relationship.

The generated JSON stores sponsor information in a separate collection. Each property's `local_sponsors` array contains sponsor IDs. After validation, the application turns these references into PropertySponsor records in memory.

I kept amenities as a controlled list: parking, laundry, balcony, air conditioning, pool, and gym. The schema uses consistent values such as `air_conditioning`. This prevents spelling differences and keeps validation manageable for the current project.

The validation rules reject missing required fields, unknown fields, negative prices, invalid ZIP formats, and unsupported values. Additional checks reject duplicate IDs, duplicate amenities, repeated sponsor links, unknown sponsor references, and sponsors that do not serve the property's ZIP code.

Google AI Studio rejected the `const` keyword in the original exported schema. A compatible version was created for structured output. Some constraints were represented as descriptions in that version, so the application still checks the complete rules locally with Zod.

The website displays listings only after the entire dataset passes validation. If validation fails, it displays an unavailable message. Sponsor selection follows the links for the displayed properties. If there are no matching properties, the sponsor banner is hidden.

## Alternatives Considered

Free-text amenities would allow more flexibility, but users could describe the same amenity differently. This would make consistent validation and filtering harder.

Separate Amenity and PropertyAmenity tables would support additional information, such as display labels and icons. I kept the controlled list because the current project only has six predefined amenities.

Repeating sponsor information inside each property would make individual records convenient to read, but it would duplicate business information. Keeping sponsors separate reduces the chance of inconsistent details.

Maintaining TypeScript interfaces separately from the validation schemas could cause the two definitions to drift apart. Deriving the types from Zod helps avoid that problem.

## Consequences and Limitations

The current approach keeps validation, types, and components connected. It also checks relationships that cannot be verified by looking at individual fields alone.

Adding an amenity requires updating the schema and exporting the JSON Schemas again. The current model supports California addresses, five-digit ZIP codes, and one image per listing. Sponsorship expiration dates are outside the current scope.

ZIP validation checks the format and whether a sponsor lists that ZIP as a service area. It does not verify that an address or business exists.

Prices are expressed in USD. The generated examples use whole-dollar amounts, while the schema allows nonnegative numbers. Future monetary calculations would need a clearly defined approach, such as exact decimal storage or integer cents.

The project currently uses JSON files and records in memory. A future relational database would use separate tables for properties, sponsors, and their relationships. Sponsor service areas could also have a separate table. Checking whether the entire database satisfies 3NF would require examining its field dependencies.

## Generation Experiment and Verification

I preserved both generation prompts, both raw responses, and their validation reports.

The first generation passed validation. For the second generation, I added clearer instructions about unique IDs, valid sponsor references, service ZIP codes, and duplicate entries. The second generation also passed. This was a prompt refinement; there was no observed AI field-validation error to correct.

All 13 automated tests passed. These included missing property IDs, negative prices, invalid ZIP codes, unknown fields, invalid sponsor relationships, and sponsor selection.

I also checked the website manually. It displayed five properties without filters, two condos with a maximum price of $650,000, and no matching properties or sponsor banner when searching for houses under $500,000.

## AI Review

ChatGPT and Gemini both recommended keeping amenities as a controlled list for this project. Gemini also suggested possible future improvements, including separate records for sponsor service areas, multiple property images, and sponsorship dates.

I accepted the controlled-list recommendation. I qualified Gemini's claim that adding a junction table automatically makes the entire database satisfy 3NF. The junction table handles the many-to-many relationship, while normalization also depends on the rest of the database design.

The AI review and the advice accepted or qualified are recorded in `docs/model-review.md`.
