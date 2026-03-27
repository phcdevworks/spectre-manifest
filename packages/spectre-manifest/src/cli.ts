#!/usr/bin/env node

import { resolve } from "node:path";
import {
  formatManifestValidationIssues,
  validateManifestFile,
} from "./validator.js";

const manifestPath = process.argv[2] ?? "spectre.manifest.json";
const validation = await validateManifestFile(manifestPath);
const absolutePath = validation.absolutePath ?? resolve(manifestPath);

if (!validation.valid) {
  console.error(`Spectre manifest is invalid: ${absolutePath}`);

  for (const issue of formatManifestValidationIssues(validation.issues)) {
    console.error(`- ${issue}`);
  }

  process.exitCode = 1;
} else {
  console.log(`Spectre manifest is valid: ${absolutePath}`);
}
