import assert from "node:assert/strict";
import test from "node:test";
import { propertyInputSchema } from "../src/schemas/property";

const validProperty = {
  address: "123 Maple Street",
  price: 325000,
  bedrooms: 3,
  bathrooms: 2.5,
  square_feet: 1800,
};

test("accepts a valid exam property payload", () => {
  const result = propertyInputSchema.safeParse(validProperty);

  assert.equal(result.success, true);
});

test("rejects a missing required field", () => {
  const withoutAddress: Partial<typeof validProperty> = { ...validProperty };
  delete withoutAddress.address;
  const result = propertyInputSchema.safeParse(withoutAddress);

  assert.equal(result.success, false);
});

test("rejects negative numeric values", () => {
  for (const candidate of [
    { ...validProperty, price: -1 },
    { ...validProperty, bedrooms: -1 },
    { ...validProperty, bathrooms: -0.5 },
    { ...validProperty, square_feet: 0 },
  ]) {
    assert.equal(propertyInputSchema.safeParse(candidate).success, false);
  }
});

test("rejects a non-integer bedroom count", () => {
  const result = propertyInputSchema.safeParse({
    ...validProperty,
    bedrooms: 2.5,
  });

  assert.equal(result.success, false);
});

test("rejects unknown properties", () => {
  const result = propertyInputSchema.safeParse({
    ...validProperty,
    status: "approved",
  });

  assert.equal(result.success, false);
  if (result.success) {
    assert.fail("Expected an unknown property to be rejected.");
  }

  assert.ok(
    result.error.issues.some((issue) => issue.code === "unrecognized_keys"),
    JSON.stringify(result.error.issues, null, 2),
  );
});
