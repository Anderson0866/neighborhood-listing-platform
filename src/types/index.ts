export interface Property {
  id: string;
  title: string;
  propertyType: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  imagePath: string;
  imageAltText: string;
  destinationLink: string;
}

export interface Sponsor {
  businessName: string;
  message: string;
  destinationLink: string;
}

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