import type { Property } from "../types";

export const properties: Property[] = [
  {
    id: "maple-apartment",
    title: "Willow Terrace Apartment",
    propertyType: "Apartment",
    address: "184 Willow Lane, Pasadena, CA",
    price: 415000,
    bedrooms: 2,
    bathrooms: 1,
    imagePath: "/properties/apartment.jpg",
    imageAltText: "Photo of apartment buildings with balconies and brick facades",
    destinationLink: "/properties/maple-apartment",
  },
  {
    id: "cedar-condo",
    title: "Harborview Condo",
    propertyType: "Condo",
    address: "220 Oceanview Avenue, Long Beach, CA",
    price: 585000,
    bedrooms: 2,
    bathrooms: 2,
    imagePath: "/properties/condo.jpg",
    imageAltText: "Photo of residential buildings beside a waterfront",
    destinationLink: "/properties/cedar-condo",
  },
  {
    id: "parkside-house",
    title: "Oakridge House",
    propertyType: "House",
    address: "318 Oakridge Drive, San Diego, CA",
    price: 785000,
    bedrooms: 3,
    bathrooms: 2,
    imagePath: "/properties/house.jpg",
    imageAltText: "Photo of a suburban house with a lawn and trees",
    destinationLink: "/properties/parkside-house",
  },
];

export const propertyTypes = ["Apartment", "Condo", "House"];
export const maxPriceOptions = [500000, 650000, 850000];