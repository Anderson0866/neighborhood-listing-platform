import type { Property, Sponsor } from "../types";
import type {
  PropertyRecord,
  SponsorRecord,
  PropertySponsorRecord,
} from "../schemas/data-contracts";
import {
  ValidatedListingsSchema,
  createPropertySponsorLinks,
} from "./validate-listings";

export type ListingData = {
  properties: Property[];
  propertyRecords: PropertyRecord[];
  sponsorRecords: SponsorRecord[];
  propertySponsorLinks: PropertySponsorRecord[];
};

export function loadListings(input: unknown) {
  const result = ValidatedListingsSchema.safeParse(input);

  if (!result.success) {
    return result;
  }

  const properties: Property[] = result.data.properties.map(
    (property) => ({
      id: property.property_id,
      title: property.title,
      propertyType: property.property_type,
      address: `${property.street_address}, ${property.city}, ${property.state} ${property.zip_code}`,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      imagePath: property.image_path,
      imageAltText: property.image_alt_text,
      destinationLink: `/properties/${property.property_id}`,
    })
  );

  const data: ListingData = {
    properties,
    propertyRecords: result.data.properties,
    sponsorRecords: result.data.sponsors,
    propertySponsorLinks: createPropertySponsorLinks(result.data),
  };

  return { success: true as const, data };
}

export function selectSponsorForProperties(
  data: ListingData,
  propertyIds: readonly string[]
): Sponsor | undefined {
  const visiblePropertyIds = new Set(propertyIds);

  const linkedSponsorIds = new Set(
    data.propertySponsorLinks
      .filter((link) => visiblePropertyIds.has(link.property_id))
      .map((link) => link.sponsor_id)
  );

  const sponsor = data.sponsorRecords.find((record) =>
    linkedSponsorIds.has(record.sponsor_id)
  );

  if (!sponsor) {
    return undefined;
  }

  return {
    businessName: sponsor.business_name,
    message: sponsor.message,
    destinationLink: sponsor.website,
  };
}
