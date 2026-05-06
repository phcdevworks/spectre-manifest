import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  formatManifestValidationIssues,
  validateManifest,
  validateManifestFile,
} from "../dist/index.js";

const rootManifestPath = resolve(process.cwd(), "../../spectre.manifest.json");
const rootManifest = JSON.parse(await readFile(rootManifestPath, "utf8"));

// --- happy path ---

test("accepts the repository sample manifest", async () => {
  const result = await validateManifestFile(rootManifestPath);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("validateManifest returns the typed manifest on success", async () => {
  const result = await validateManifestFile(rootManifestPath);

  assert.ok(result.manifest !== undefined);
  assert.equal(result.manifest?.system.name, "Spectre");
});

// --- parse errors ---

test("validateManifestFile rejects a nonexistent file", async () => {
  const result = await validateManifestFile("/nonexistent/path/manifest.json");

  assert.equal(result.valid, false);
  assert.equal(result.issues[0]?.kind, "parse");
  assert.match(result.issues[0]?.message ?? "", /Unable to read manifest file/);
});

test("validateManifestFile rejects invalid JSON", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "spectre-manifest-test-"));
  const badJsonPath = join(tempDir, "bad.json");
  await writeFile(badJsonPath, "{ not valid json }");

  const result = await validateManifestFile(badJsonPath);

  assert.equal(result.valid, false);
  assert.equal(result.issues[0]?.kind, "parse");
  assert.match(result.issues[0]?.message ?? "", /Invalid JSON/);
});

// --- schema errors ---

test("rejects manifest with missing required top-level fields", () => {
  const result = validateManifest({
    system: { name: "Test", version: "0.1.0", manifestVersion: "0.1" },
  });

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((i) => i.kind === "schema"));
});

test("rejects unrecognized schemaVersion values", () => {
  const manifest = structuredClone(rootManifest);

  manifest.schemaVersion = "999.0";

  const result = validateManifest(manifest);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((i) => i.kind === "schema"));
});

// --- semantic errors: layers ---

test("rejects duplicate layer order values", () => {
  const manifest = structuredClone(rootManifest);

  manifest.layers.governance.order = manifest.layers.build.order;

  const result = validateManifest(manifest);

  assert.equal(result.valid, false);
  assert.match(result.issues[0]?.message ?? "", /Duplicate layer order/);
});

test("rejects layer dependency cycles", () => {
  const manifest = structuredClone(rootManifest);

  manifest.layers.foundation.dependsOn = ["build"];

  const result = validateManifest(manifest);

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some((i) => i.message.includes("Layer dependency cycle detected")),
  );
});

// --- semantic errors: packages ---

test("rejects unknown layer in package.layer", () => {
  const manifest = structuredClone(rootManifest);

  manifest.packages["@phcdevworks/spectre-tokens"].layer = "nonexistent";

  const result = validateManifest(manifest);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((i) => i.message.includes('Unknown layer "nonexistent"')));
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

test("rejects dependency that violates dependencyDirection rules", () => {
  const manifest = structuredClone(rootManifest);

  // foundation → build is forbidden by dependencyDirection
  manifest.packages["@phcdevworks/spectre-tokens"].dependencies = [
    "@phcdevworks/spectre-components",
  ];
  manifest.packages["@phcdevworks/spectre-components"].consumers = [
    ...(manifest.packages["@phcdevworks/spectre-components"].consumers ?? []),
    "@phcdevworks/spectre-tokens",
  ];

  const result = validateManifest(manifest);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((i) => i.message.includes("disallowed layer")));
});

test("rejects dependency not covered by allowedTargets", () => {
  const manifest = structuredClone(rootManifest);

  // spectre-shell-router allowedTargets = ["package:@phcdevworks/spectre-shell", "external"]
  // spectre-ui is not covered by either selector
  manifest.packages["@phcdevworks/spectre-shell-router"].dependencies = [
    "@phcdevworks/spectre-shell",
    "@phcdevworks/spectre-ui",
  ];
  manifest.packages["@phcdevworks/spectre-ui"].consumers = [
    ...(manifest.packages["@phcdevworks/spectre-ui"].consumers ?? []),
    "@phcdevworks/spectre-shell-router",
  ];

  const result = validateManifest(manifest);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((i) => i.message.includes("not covered by allowedTargets")));
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

// --- formatManifestValidationIssues ---

test("formatManifestValidationIssues formats issues as tagged strings", () => {
  const issues = [
    { kind: "schema", path: "/system", message: "missing field" },
    { kind: "semantic", path: "packages.foo.layer", message: "unknown layer" },
    { kind: "parse", path: "/manifest.json", message: "Invalid JSON" },
  ];
  const formatted = formatManifestValidationIssues(issues);

  assert.equal(formatted.length, 3);
  assert.equal(formatted[0], "[schema] /system: missing field");
  assert.equal(formatted[1], "[semantic] packages.foo.layer: unknown layer");
  assert.equal(formatted[2], "[parse] /manifest.json: Invalid JSON");
});
