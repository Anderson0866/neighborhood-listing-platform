import { z } from "zod";

export const propertyInputSchema = z.strictObject({
  address: z.string().trim().min(5),
  price: z.number().nonnegative(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().nonnegative(),
  square_feet: z.number().int().positive(),
});

export type PropertyInput = z.infer<typeof propertyInputSchema>;
