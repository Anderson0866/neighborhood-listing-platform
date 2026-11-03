import {
  GeneratedDataSchema,
  PropertySponsorSchema,
  type GeneratedData,
  type PropertySponsorRecord,
} from "../schemas/data-contracts";

export const ValidatedListingsSchema =
  GeneratedDataSchema.superRefine((data, ctx) => {
    const propertyIds = new Set<string>();
    const sponsorIds = new Set<string>();

    data.sponsors.forEach((sponsor, index) => {
      if (sponsorIds.has(sponsor.sponsor_id)) {
        ctx.addIssue({
          code: "custom",
          path: ["sponsors", index, "sponsor_id"],
          message: "Sponsor IDs must be unique.",
        });
      }
      sponsorIds.add(sponsor.sponsor_id);
    });

    const sponsorsById = new Map(
      data.sponsors.map((sponsor) => [sponsor.sponsor_id, sponsor])
    );

    data.properties.forEach((property, index) => {
      if (propertyIds.has(property.property_id)) {
        ctx.addIssue({
          code: "custom",
          path: ["properties", index, "property_id"],
          message: "Property IDs must be unique.",
        });
      }
      propertyIds.add(property.property_id);

      if (
        new Set(property.amenities).size !==
        property.amenities.length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["properties", index, "amenities"],
          message: "Amenities must not contain duplicates.",
        });
      }

      const linkedSponsorIds = new Set<string>();

      property.local_sponsors.forEach((sponsorId, linkIndex) => {
        const path = [
          "properties",
          index,
          "local_sponsors",
          linkIndex,
        ];

        if (linkedSponsorIds.has(sponsorId)) {
          ctx.addIssue({
            code: "custom",
            path,
            message: "A sponsor may be linked only once per property.",
          });
        }
        linkedSponsorIds.add(sponsorId);

        const sponsor = sponsorsById.get(sponsorId);

        if (!sponsor) {
          ctx.addIssue({
            code: "custom",
            path,
            message: `Unknown sponsor ID: ${sponsorId}.`,
          });
        } else if (
          !sponsor.service_zip_codes.includes(property.zip_code)
        ) {
          ctx.addIssue({
            code: "custom",
            path,
            message: `Sponsor ${sponsorId} does not serve ZIP ${property.zip_code}.`,
          });
        }
      });
    });
  });

export function createPropertySponsorLinks(
  data: GeneratedData
): PropertySponsorRecord[] {
  return data.properties.flatMap((property) =>
    property.local_sponsors.map((sponsorId) =>
      PropertySponsorSchema.parse({
        property_id: property.property_id,
        sponsor_id: sponsorId,
      })
    )
  );
}
