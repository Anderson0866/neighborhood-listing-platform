import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { GeneratedDataSchema } from "../src/schemas/data-contracts";

const inputPath = "data/generated/listings-01.raw.json";
const reportPath = "data/validation/listings-01.validation.txt";

let passed = false;
let report: string;

try {
  const rawData: unknown = JSON.parse(
    readFileSync(inputPath, "utf8")
  );

  const result = GeneratedDataSchema.safeParse(rawData);

  if (result.success) {
    passed = true;
    report = [
      `Input: ${inputPath}`,
      "PASS: All records satisfy the Zod data contract.",
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