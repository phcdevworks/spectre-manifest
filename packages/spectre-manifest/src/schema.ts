import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AnySchemaObject } from "ajv";
import schemaJson from "../schema/spectre.manifest.schema.json" with { type: "json" };

const moduleDirectory = dirname(fileURLToPath(import.meta.url));

export const manifestSchemaPath = resolve(
  moduleDirectory,
  "../schema/spectre.manifest.schema.json",
);

export function loadManifestSchema(): AnySchemaObject {
  return schemaJson as unknown as AnySchemaObject;
}
