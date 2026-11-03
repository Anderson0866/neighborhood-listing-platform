import rawData from "../../data/generated/listings-01.raw.json";
import { PropertySchema } from "../schemas/data-contracts";
import {
  loadListings,
  selectSponsorForProperties,
} from "../lib/load-listings";

const result = loadListings(rawData);

export const properties = result.success ? result.data.properties : [];

export const listingError = result.success
  ? null
  : "Property listings are temporarily unavailable. Please try again later.";

export const propertyTypes: string[] = [
  ...PropertySchema.shape.property_type.options,
];

export const maxPriceOptions = [500000, 650000, 850000];

export function selectSponsor(propertyIds: readonly string[]) {
  return result.success
    ? selectSponsorForProperties(result.data, propertyIds)
    : undefined;
}
