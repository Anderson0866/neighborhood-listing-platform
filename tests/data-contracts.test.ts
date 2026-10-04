import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  GeneratedDataSchema,
  PropertySchema,
} from "../src/schemas/data-contracts";

const rawData: unknown = JSON.parse(
  readFileSync("data/generated/listings-01.raw.json", "utf8")
);

const generated = GeneratedDataSchema.parse(rawData);
const validProperty = generated.properties[0];

assert.ok(validProperty, "A property is needed for these tests.");

function expectFieldError(
  candidate: unknown,
  field: string,
  code: string
) {
  const result = PropertySchema.safeParse(candidate);

  if (result.success) {
    assert.fail(`Expected rejection for ${field}.`);
  }

  assert.ok(
    result.error.issues.some(
      (issue) =>
        issue.path.join(".") === field && issue.code === code
    ),
    JSON.stringify(result.error.issues, null, 2)
  );
}

test("Valid generated data and property are accepted", () => {
  assert.equal(GeneratedDataSchema.safeParse(rawData).success, true);
  assert.equal(PropertySchema.safeParse(validProperty).success, true);
});

test("A missing property ID is rejected", () => {
  const candidate: Record<string, unknown> = { ...validProperty };
  delete candidate.property_id;

  expectFieldError(candidate, "property_id", "invalid_type");
});

test("A negative price is rejected", () => {
  const candidate = { ...validProperty, price: -1 };

  expectFieldError(candidate, "price", "too_small");
});

test("An invalid ZIP code is rejected", () => {
  const candidate = { ...validProperty, zip_code: "ABCDE" };

  expectFieldError(candidate, "zip_code", "invalid_format");
});

test("An unknown property field is rejected", () => {
  const candidate = { ...validProperty, unexpected_field: true };
  const result = PropertySchema.safeParse(candidate);

  if (result.success) {
    assert.fail("Expected rejection of the unknown field.");
  }

  assert.ok(
    result.error.issues.some(
      (issue) =>
        issue.code === "unrecognized_keys" &&
        issue.keys.includes("unexpected_field")
    ),
    JSON.stringify(result.error.issues, null, 2)
  );
});
