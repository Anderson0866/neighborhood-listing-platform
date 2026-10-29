import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import {
  PropertySchema,
  SponsorSchema,
  PropertySponsorSchema,
  GeneratedDataSchema,
} from "../src/schemas/data-contracts";

const outputDirectory = resolve("data", "schemas");

mkdirSync(outputDirectory, { recursive: true });

const schemas = {
  "property.schema.json": PropertySchema,
  "sponsor.schema.json": SponsorSchema,
  "property-sponsor.schema.json": PropertySponsorSchema,
  "generated-data.schema.json": GeneratedDataSchema,
};

for (const [filename, schema] of Object.entries(schemas)) {
  const jsonSchema = z.toJSONSchema(schema);

  writeFileSync(
    resolve(outputDirectory, filename),
    JSON.stringify(jsonSchema, null, 2) + "\n",
    "utf8"
  );

  console.log(`Created data/schemas/${filename}`);
}
// Create a separate schema for AI Studio's limited editor.
function toAiStudioSchema(
  node: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  const supportedKeys = [
    "type",
    "title",
    "description",
    "enum",
    "minimum",
    "maximum",
    "minItems",
    "maxItems",
    "required",
  ];

  for (const key of supportedKeys) {
    if (key in node) {
      result[key] = node[key];
    }
  }

  if (node.properties) {
    const properties = node.properties as Record<
      string,
      Record<string, unknown>
    >;

    result.properties = Object.fromEntries(
      Object.entries(properties).map(([name, schema]) => [
        name,
        toAiStudioSchema(schema),
      ])
    );
  }

  if (node.items) {
    result.items = toAiStudioSchema(
      node.items as Record<string, unknown>
    );
  }

  if (typeof node.const === "string") {
    result.enum = [node.const];
  }

  const instructions: string[] = [];

  if ("const" in node && typeof node.const !== "string") {
    instructions.push(`Must equal ${JSON.stringify(node.const)}.`);
  }

  for (const key of [
    "minLength",
    "pattern",
    "multipleOf",
    "exclusiveMinimum",
    "additionalProperties",
  ]) {
    if (key in node) {
      instructions.push(`${key}: ${JSON.stringify(node[key])}.`);
    }
  }

  if (instructions.length > 0) {
    result.description = [
      typeof result.description === "string"
        ? result.description
        : "",
      ...instructions,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return result;
}

const aiStudioSchema = toAiStudioSchema(
  z.toJSONSchema(GeneratedDataSchema)
);

writeFileSync(
  resolve(outputDirectory, "generated-data.ai-studio.schema.json"),
  JSON.stringify(aiStudioSchema, null, 2) + "\n",
  "utf8"
);

console.log("Created data/schemas/generated-data.ai-studio.schema.json");