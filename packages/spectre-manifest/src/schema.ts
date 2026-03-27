import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AnySchemaObject } from "ajv";

const moduleDirectory = dirname(fileURLToPath(import.meta.url));

export const manifestSchemaPath = resolve(
  moduleDirectory,
  "../schema/spectre.manifest.schema.json",
);

let cachedSchema: AnySchemaObject | undefined;

export function loadManifestSchema(): AnySchemaObject {
  cachedSchema ??= JSON.parse(
    readFileSync(manifestSchemaPath, "utf8"),
  ) as AnySchemaObject;

  return cachedSchema;
}
