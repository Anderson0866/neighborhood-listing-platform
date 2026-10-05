import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { GeneratedDataSchema } from "../src/schemas/data-contracts";
import {
  loadListings,
  selectSponsorForProperties,
} from "../src/lib/load-listings";

const original = GeneratedDataSchema.parse(
  JSON.parse(readFileSync("data/generated/listings-01.raw.json", "utf8")),
);

function fixture() {
  return structuredClone(original);
}

function expectRejected(input: unknown, expectedPath: string) {
  const result = loadListings(input);

  if (result.success) {
    assert.fail("Invalid data must not be loaded.");
  }

  assert.equal("data" in result, false);
  assert.ok(
    result.error.issues.some(
      (issue) => issue.path.join(".") === expectedPath,
    ),
    JSON.stringify(result.error.issues),
  );
}

test("valid generated data loads all five cards", () => {
  const result = loadListings(fixture());

  if (!result.success) {
    assert.fail(JSON.stringify(result.error.issues));
  }

  assert.equal(result.data.properties.length, 5);
  assert.equal(
    result.data.properties[0]!.id,
    original.properties[0]!.property_id,
  );
  assert.ok(
    result.data.properties[0]!.address.includes(
      original.properties[0]!.zip_code,
    ),
  );
});

test("a negative price prevents data from reaching the page", () => {
  const input = fixture();
  input.properties[0]!.price = -1;
  expectRejected(input, "properties.0.price");
});

test("an unknown sponsor reference is rejected", () => {
  const input = fixture();
  input.properties[0]!.local_sponsors = ["missing-sponsor"];
  expectRejected(input, "properties.0.local_sponsors.0");
});

test("a sponsor must serve the property's ZIP code", () => {
  const input = fixture();
  const property = input.properties[0]!;
  const sponsor = input.sponsors[0]!;

  property.local_sponsors = [sponsor.sponsor_id];
  sponsor.service_zip_codes = [
    property.zip_code === "00000" ? "00001" : "00000",
  ];

  expectRejected(input, "properties.0.local_sponsors.0");
});

test("duplicate property IDs are rejected", () => {
  const input = fixture();
  input.properties[1]!.property_id = input.properties[0]!.property_id;
  expectRejected(input, "properties.1.property_id");
});

test("duplicate sponsor IDs are rejected", () => {
  const input = fixture();
  input.sponsors[1]!.sponsor_id = input.sponsors[0]!.sponsor_id;
  expectRejected(input, "sponsors.1.sponsor_id");
});

test("duplicate sponsor links are rejected", () => {
  const input = fixture();
  const property = input.properties[0]!;
  const sponsor = input.sponsors[0]!;

  if (!sponsor.service_zip_codes.includes(property.zip_code)) {
    sponsor.service_zip_codes.push(property.zip_code);
  }

  property.local_sponsors = [sponsor.sponsor_id, sponsor.sponsor_id];
  expectRejected(input, "properties.0.local_sponsors.1");
});

test("sponsor selection follows visible property links", () => {
  const input = fixture();

  for (const property of input.properties) {
    property.local_sponsors = [];
  }

  const visibleProperty = input.properties[0]!;
  const unlinkedProperty = input.properties[1]!;
  const sponsor = input.sponsors[1]!;

  if (!sponsor.service_zip_codes.includes(visibleProperty.zip_code)) {
    sponsor.service_zip_codes.push(visibleProperty.zip_code);
  }

  visibleProperty.local_sponsors = [sponsor.sponsor_id];

  const result = loadListings(input);

  if (!result.success) {
    assert.fail(JSON.stringify(result.error.issues));
  }

  assert.deepEqual(
    selectSponsorForProperties(result.data, [visibleProperty.property_id]),
    {
      businessName: sponsor.business_name,
      message: sponsor.message,
      destinationLink: sponsor.website,
    },
  );

  assert.equal(
    selectSponsorForProperties(result.data, [unlinkedProperty.property_id]),
    undefined,
  );

  assert.equal(selectSponsorForProperties(result.data, []), undefined);
});
