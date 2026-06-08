#!/usr/bin/env node

import { resolve } from "node:path";
import { diffManifests, formatManifestDiff } from "./differ.js";
import { formatManifestValidationIssues, validateManifestFile } from "./validator.js";

const args = process.argv.slice(2);
const jsonOutput = args.includes("--json");
const positional = args.filter((arg) => !arg.startsWith("--"));
const [beforePath, afterPath] = positional;

if (beforePath === undefined || afterPath === undefined) {
  console.error(
    "Usage: spectre-manifest-diff <before-manifest-path> <after-manifest-path> [--json]",
  );
  process.exitCode = 1;
  process.exit();
}

async function loadManifestOrExit(path: string) {
  const result = await validateManifestFile(path);

  if (!result.valid || result.manifest === undefined) {
    if (jsonOutput) {
      console.error(
        JSON.stringify(
          {
            valid: false,
            error: `Invalid manifest at ${resolve(path)}`,
            issues: result.issues,
          },
          null,
          2,
        ),
      );
    } else {
      console.error(`Cannot diff: manifest is invalid at ${resolve(path)}`);

      for (const issue of formatManifestValidationIssues(result.issues)) {
        console.error(`  ${issue}`);
      }
    }

    process.exitCode = 1;
    process.exit();
  }

  return result.manifest;
}

const before = await loadManifestOrExit(beforePath);
const after = await loadManifestOrExit(afterPath);

const result = diffManifests(before, after);

const payload = JSON.stringify(
  { classification: result.classification, changes: result.changes },
  null,
  2,
);

if (jsonOutput) {
  console.log(payload);
} else if (result.changes.length === 0) {
  console.log("No differences detected between the two manifests.");
} else {
  console.log(
    `Manifest diff: ${beforePath} -> ${afterPath} (overall classification: ${result.classification})`,
  );

  for (const line of formatManifestDiff(result)) {
    console.log(`  - ${line}`);
  }
}

if (result.classification === "breaking") {
  process.exitCode = 1;
}
