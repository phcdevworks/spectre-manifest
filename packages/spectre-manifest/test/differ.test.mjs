import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { diffManifests, formatManifestDiff } from "../dist/index.js";

const execFileAsync = promisify(execFile);
const rootManifestPath = resolve(process.cwd(), "../../spectre.manifest.json");
const rootManifest = JSON.parse(await readFile(rootManifestPath, "utf8"));
const cliPath = resolve(process.cwd(), "dist/diff-cli.js");

function clone(manifest) {
  return JSON.parse(JSON.stringify(manifest));
}

function firstPackageKey(manifest) {
  return Object.keys(manifest.packages)[0];
}

async function writeManifest(manifest) {
  const dir = await mkdtemp(join(tmpdir(), "spectre-differ-test-"));
  const path = join(dir, "manifest.json");
  await writeFile(path, JSON.stringify(manifest, null, 2));
  return path;
}

// --- no changes ---

test("reports no changes for an identical manifest", () => {
  const result = diffManifests(rootManifest, clone(rootManifest));

  assert.equal(result.classification, "additive");
  assert.deepEqual(result.changes, []);
});

// --- additive ---

test("classifies a newly registered package as additive", () => {
  const after = clone(rootManifest);
  after.packages["@phcdevworks/spectre-new-thing"] = {
    role: "example",
    layer: firstPackageKey(rootManifest)
      ? rootManifest.packages[firstPackageKey(rootManifest)].layer
      : "core",
    stability: "experimental",
    description: "A new example package.",
    exports: ["."],
  };

  const result = diffManifests(rootManifest, after);

  assert.equal(result.classification, "additive");
  assert.ok(
    result.changes.some(
      (change) =>
        change.classification === "additive" &&
        change.path === "packages.@phcdevworks/spectre-new-thing",
    ),
  );
});

test("classifies a new export as additive", () => {
  const key = firstPackageKey(rootManifest);
  const after = clone(rootManifest);
  after.packages[key].exports = [...after.packages[key].exports, "./new-export"];

  const result = diffManifests(rootManifest, after);

  assert.equal(result.classification, "additive");
  assert.ok(
    result.changes.some(
      (change) =>
        change.classification === "additive" &&
        change.path === `packages.${key}.exports` &&
        change.message.includes("./new-export"),
    ),
  );
});

// --- semantic ---

test("classifies a stability change as semantic", () => {
  const key = firstPackageKey(rootManifest);
  const after = clone(rootManifest);
  after.packages[key].stability =
    after.packages[key].stability === "stable" ? "beta" : "stable";

  const result = diffManifests(rootManifest, after);

  assert.equal(result.classification, "semantic");
  assert.ok(
    result.changes.some(
      (change) =>
        change.classification === "semantic" &&
        change.path === `packages.${key}.stability`,
    ),
  );
});

// --- breaking ---

test("classifies a removed package as breaking", () => {
  const key = firstPackageKey(rootManifest);
  const after = clone(rootManifest);
  delete after.packages[key];

  const result = diffManifests(rootManifest, after);

  assert.equal(result.classification, "breaking");
  assert.ok(
    result.changes.some(
      (change) =>
        change.classification === "breaking" &&
        change.path === `packages.${key}` &&
        change.message.includes("removed"),
    ),
  );
});

test("classifies a removed export as breaking", () => {
  const key = firstPackageKey(rootManifest);
  const after = clone(rootManifest);
  const [removedExport, ...rest] = after.packages[key].exports;
  after.packages[key].exports = rest;

  const result = diffManifests(rootManifest, after);

  assert.equal(result.classification, "breaking");
  assert.ok(
    result.changes.some(
      (change) =>
        change.classification === "breaking" &&
        change.path === `packages.${key}.exports` &&
        change.message.includes(removedExport),
    ),
  );
});

test("classifies a package layer move as breaking", () => {
  const key = firstPackageKey(rootManifest);
  const layers = Object.keys(rootManifest.layers);
  const otherLayer = layers.find((layer) => layer !== rootManifest.packages[key].layer);
  const after = clone(rootManifest);
  after.packages[key].layer = otherLayer;

  const result = diffManifests(rootManifest, after);

  assert.equal(result.classification, "breaking");
  assert.ok(
    result.changes.some(
      (change) =>
        change.classification === "breaking" && change.path === `packages.${key}.layer`,
    ),
  );
});

test("classifies a schemaVersion change as breaking", () => {
  const after = clone(rootManifest);
  after.schemaVersion = "9.9";

  const result = diffManifests(rootManifest, after);

  assert.equal(result.classification, "breaking");
  assert.ok(
    result.changes.some(
      (change) => change.classification === "breaking" && change.path === "schemaVersion",
    ),
  );
});

// --- formatting ---

test("formatManifestDiff renders one line per change", () => {
  const after = clone(rootManifest);
  after.schemaVersion = "9.9";

  const result = diffManifests(rootManifest, after);
  const lines = formatManifestDiff(result);

  assert.equal(lines.length, result.changes.length);
  assert.match(lines[0], /^\[breaking\] schemaVersion: /);
});

// --- CLI ---

test("CLI reports no differences for an identical manifest", async () => {
  const path = await writeManifest(rootManifest);
  const { stdout } = await execFileAsync("node", [cliPath, path, path]);

  assert.match(stdout, /No differences detected/);
});

test("CLI exits non-zero and prints breaking changes for a removed export", async () => {
  // Removing an export (rather than a whole package) keeps the manifest
  // semantically valid, so both sides still pass validateManifestFile.
  const key = firstPackageKey(rootManifest);
  const after = clone(rootManifest);
  const [removedExport, ...rest] = after.packages[key].exports;
  after.packages[key].exports = rest;

  const beforePath = await writeManifest(rootManifest);
  const afterPath = await writeManifest(after);

  await assert.rejects(
    execFileAsync("node", [cliPath, beforePath, afterPath]),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stdout, /breaking/);
      assert.match(
        error.stdout,
        new RegExp(`lost export "${removedExport.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`),
      );
      return true;
    },
  );
});

test("CLI --json emits machine-readable diff payload", async () => {
  // Removing an export (rather than reassigning a layer) keeps both manifests
  // semantically valid, so loadManifestOrExit succeeds and the diff runs.
  const key = firstPackageKey(rootManifest);
  const after = clone(rootManifest);
  const [removedExport, ...rest] = after.packages[key].exports;
  after.packages[key].exports = rest;

  const beforePath = await writeManifest(rootManifest);
  const afterPath = await writeManifest(after);

  await assert.rejects(
    execFileAsync("node", [cliPath, beforePath, afterPath, "--json"]),
    (error) => {
      const payload = JSON.parse(error.stdout);
      assert.equal(payload.classification, "breaking");
      assert.ok(Array.isArray(payload.changes));
      assert.ok(
        payload.changes.some(
          (change) =>
            change.path === `packages.${key}.exports` &&
            change.message.includes(removedExport),
        ),
      );
      return true;
    },
  );
});
