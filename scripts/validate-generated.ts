import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { ValidatedListingsSchema } from "../src/lib/validate-listings";

const inputPath = "data/generated/listings-01.raw.json";
const reportPath = "data/validation/listings-01.relationship-validation.txt";

let passed = false;
let report: string;

try {
  const rawData: unknown = JSON.parse(
    readFileSync(inputPath, "utf8")
  );

  const result = ValidatedListingsSchema.safeParse(rawData);

  if (result.success) {
    passed = true;
    report = [
      `Input: ${inputPath}`,
      "PASS: Field rules and sponsor relationship checks passed.",
      `Properties: ${result.data.properties.length}`,
      `Sponsors: ${result.data.sponsors.length}`,
    ].join("\n");
  } else {
    report = [
      `Input: ${inputPath}`,
      "FAIL: Data contract validation failed.",
      ...result.error.issues.map(
        (issue) =>
          `${issue.path.join(".") || "(root)"}: ${issue.message}`
      ),
    ].join("\n");
  }
} catch (error) {
  report = [
    `Input: ${inputPath}`,
    "FAIL: Could not read or parse the JSON file.",
    error instanceof Error ? error.message : String(error),
  ].join("\n");
}

mkdirSync("data/validation", { recursive: true });
writeFileSync(reportPath, report + "\n", "utf8");

console.log(report);
console.log(`Report saved to ${reportPath}`);

if (!passed) {
  process.exitCode = 1;
}
