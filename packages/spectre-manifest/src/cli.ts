#!/usr/bin/env node

import { resolve } from "node:path";
import {
  formatManifestValidationIssues,
  validateManifestFile,
} from "./validator.js";

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const manifestPath =
  args.find((argument) => argument !== "--json") ?? "spectre.manifest.json";
const validation = await validateManifestFile(manifestPath);
const absolutePath = validation.absolutePath ?? resolve(manifestPath);

const payload = JSON.stringify(
  { valid: validation.valid, absolutePath, issues: validation.issues },
  null,
  2,
);

if (validation.valid) {
  if (jsonOutput) {
    console.log(payload);
  } else {
    console.log(`Spectre manifest is valid: ${absolutePath}`);
  }
} else {
  if (jsonOutput) {
    console.error(payload);
  } else {
    console.error(`Spectre manifest is invalid: ${absolutePath}`);

    for (const issue of formatManifestValidationIssues(validation.issues)) {
      console.error(`- ${issue}`);
    }
  }

  process.exitCode = 1;
}
