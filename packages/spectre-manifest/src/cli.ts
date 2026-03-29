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

if (!validation.valid) {
  if (jsonOutput) {
    console.error(
      JSON.stringify(
        {
          valid: validation.valid,
          absolutePath,
          issues: validation.issues,
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  } else {
    console.error(`Spectre manifest is invalid: ${absolutePath}`);

    for (const issue of formatManifestValidationIssues(validation.issues)) {
      console.error(`- ${issue}`);
    }

    process.exitCode = 1;
  }
} else {
  if (jsonOutput) {
    console.log(
      JSON.stringify(
        {
          valid: validation.valid,
          absolutePath,
          issues: validation.issues,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`Spectre manifest is valid: ${absolutePath}`);
  }
}
