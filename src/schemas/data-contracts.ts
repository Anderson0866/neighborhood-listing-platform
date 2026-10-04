import { z } from "zod";

const IdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const ZipCodeSchema = z
  .string()
  .regex(/^[0-9]{5}$/);

export const PropertySchema = z.strictObject({
  property_id: IdSchema,
  title: z.string().min(3),
  property_type: z.enum(["Apartment", "Condo", "House"]),
  description: z.string().min(10),

  street_address: z.string().min(3),
  city: z.string().min(2),
  state: z.literal("CA"),
  zip_code: ZipCodeSchema,

  price: z.number().nonnegative(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().nonnegative().multipleOf(0.5),
  square_feet: z.number().int().positive(),

  amenities: z.array(
    z.enum([
      "parking",
      "laundry",
      "balcony",
      "air_conditioning",
      "pool",
      "gym",
    ])
  ),

  local_sponsors: z.array(IdSchema),

  image_path: z.enum([
    "/properties/apartment.jpg",
    "/properties/condo.jpg",
    "/properties/house.jpg",
  ]),
  image_alt_text: z.string().min(10),
});

export const SponsorSchema = z.strictObject({
  sponsor_id: IdSchema,
  business_name: z.string().min(2),
  category: z.enum(["Mortgage", "Moving", "Insurance"]),
  message: z.string().min(5),
  website: z.url().regex(/^https:\/\//),
  service_zip_codes: z.array(ZipCodeSchema).min(1),
});

export const PropertySponsorSchema = z.strictObject({
  property_id: IdSchema,
  sponsor_id: IdSchema,
});

export const GeneratedDataSchema = z.strictObject({
  synthetic: z.literal(true),
  properties: z.array(PropertySchema).length(5),
  sponsors: z.array(SponsorSchema).min(1),
});

export type PropertyRecord = z.infer<typeof PropertySchema>;
export type SponsorRecord = z.infer<typeof SponsorSchema>;
export type PropertySponsorRecord =
  z.infer<typeof PropertySponsorSchema>;
export type GeneratedData = z.infer<typeof GeneratedDataSchema>;