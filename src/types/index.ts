import type {
  PropertyRecord,
  SponsorRecord,
} from "../schemas/data-contracts";

export type Property = Pick<
  PropertyRecord,
  "title" | "price" | "bedrooms" | "bathrooms"
> & {
  id: PropertyRecord["property_id"];
  propertyType: PropertyRecord["property_type"];
  address: string;
  imagePath: PropertyRecord["image_path"];
  imageAltText: PropertyRecord["image_alt_text"];
  destinationLink: string;
};

export type Sponsor = Pick<SponsorRecord, "message"> & {
  businessName: SponsorRecord["business_name"];
  destinationLink: SponsorRecord["website"];
};

export interface PropertyCardProps {
  property: Property;
}

export interface SponsorBannerProps {
  sponsor: Sponsor;
}

export interface SearchFiltersProps {
  propertyTypes: string[];
  maxPriceOptions: number[];
  selectedPropertyType?: string;
  selectedMaxPrice?: number;
  action?: string;
}
