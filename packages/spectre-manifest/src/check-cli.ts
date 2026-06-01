#!/usr/bin/env node

import { resolve } from "node:path";
import {
  checkPackageAgainstManifest,
  formatPackageCheckIssues,
} from "./checker.js";
import { formatManifestValidationIssues, validateManifestFile } from "./validator.js";

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const positional = args.filter((arg) => !arg.startsWith("--"));
const [manifestPath = "spectre.manifest.json", packagePath] = positional;

if (packagePath === undefined) {
  console.error(
    "Usage: spectre-manifest-check <manifest-path> <package-path> [--json]",
  );
  process.exitCode = 1;
  process.exit();
}

const manifestResult = await validateManifestFile(manifestPath);

if (!manifestResult.valid || manifestResult.manifest === undefined) {
  if (jsonOutput) {
    console.error(
      JSON.stringify(
        {
          valid: false,
          error: `Invalid manifest at ${resolve(manifestPath)}`,
          manifestIssues: manifestResult.issues,
        },
        null,
        2,
      ),
    );
  } else {
    console.error(`Cannot check package: manifest is invalid at ${resolve(manifestPath)}`);

    for (const issue of formatManifestValidationIssues(manifestResult.issues)) {
      console.error(`  ${issue}`);
    }
  }

  process.exitCode = 1;
  process.exit();
}

const result = await checkPackageAgainstManifest(manifestResult.manifest, packagePath);

const payload = JSON.stringify(
  { valid: result.valid, packageName: result.packageName, issues: result.issues },
  null,
  2,
);

if (result.valid) {
  if (jsonOutput) {
    console.log(payload);
  } else {
    console.log(`Package "${result.packageName}" is compliant with its manifest entry.`);
  }
} else {
  if (jsonOutput) {
    console.error(payload);
  } else {
    console.error(`Package "${result.packageName}" has compliance issues:`);

    for (const issue of formatPackageCheckIssues(result.issues)) {
      console.error(`  - ${issue}`);
    }
  }

  process.exitCode = 1;
}
