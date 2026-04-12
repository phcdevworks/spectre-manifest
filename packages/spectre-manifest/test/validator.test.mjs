import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateManifest, validateManifestFile } from "../dist/index.js";

const rootManifestPath = resolve(process.cwd(), "../../spectre.manifest.json");
const rootManifest = JSON.parse(await readFile(rootManifestPath, "utf8"));

test("accepts the repository sample manifest", async () => {
  const result = await validateManifestFile(rootManifestPath);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("rejects consumer relationships that are not backed by dependencies", () => {
  const manifest = structuredClone(rootManifest);

  manifest.packages["@phcdevworks/spectre-ui"].consumers = [
    "@phcdevworks/spectre-shell-router",
  ];

  const result = validateManifest(manifest);

  assert.equal(result.valid, false);
  assert.match(
    result.issues[0]?.message ?? "",
    /does not declare a matching dependency/,
  );
});

test("rejects duplicate layer order values", () => {
  const manifest = structuredClone(rootManifest);

  manifest.layers.governance.order = manifest.layers.build.order;

  const result = validateManifest(manifest);

  assert.equal(result.valid, false);
  assert.match(result.issues[0]?.message ?? "", /Duplicate layer order/);
});

test("rejects package dependency cycles", () => {
  const manifest = structuredClone(rootManifest);

  manifest.packages["@phcdevworks/spectre-components"].dependencies = [
    "@phcdevworks/spectre-ui",
    "@phcdevworks/spectre-shell",
  ];

  const result = validateManifest(manifest);

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some((issue) =>
      issue.message.includes("Package dependency cycle detected"),
    ),
  );
});
