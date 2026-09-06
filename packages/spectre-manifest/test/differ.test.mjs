import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { diffManifests, formatManifestDiff, validateManifest } from "../dist/index.js";

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


for (const unrestricted of [undefined, []]) {
  test(`classifies ${JSON.stringify(unrestricted)} targets becoming restricted as breaking`, () => {
    const before = clone(rootManifest);
    const key = "@phcdevworks/spectre-ui";
    before.packages[key].allowedTargets = unrestricted;
    const after = clone(before);
    after.packages[key].allowedTargets = ["external"];
    assert.equal(validateManifest(before).valid, true);
    assert.equal(validateManifest(after).valid, false);
    const result = diffManifests(before, after);
    assert.equal(result.classification, "breaking");
    assert.equal(result.changes.length, 1);
    assert.equal(result.changes[0].path, `packages.${key}.allowedTargets`);
    assert.equal(diffManifests(after, before).classification, "additive");
  });
}

test("treats absent and empty allowedTargets as equivalent", () => {
  const before = clone(rootManifest);
  const key = firstPackageKey(before);
  delete before.packages[key].allowedTargets;
  const after = clone(before);
  after.packages[key].allowedTargets = [];
  assert.deepEqual(diffManifests(before, after).changes, []);
  assert.deepEqual(diffManifests(after, before).changes, []);
});

test("retains classifications for changes between non-empty target lists", () => {
  const before = clone(rootManifest);
  const key = firstPackageKey(before);
  before.packages[key].allowedTargets = ["external"];
  const after = clone(before);
  after.packages[key].allowedTargets.push("layer:build");
  assert.equal(diffManifests(before, after).classification, "additive");
  assert.equal(diffManifests(after, before).classification, "breaking");
});

test("CLI fails on newly restricted targets and passes when restrictions are removed", async (t) => {
  const before = clone(rootManifest);
  const key = "@phcdevworks/spectre-shell-router";
  delete before.packages[key].allowedTargets;
  const after = clone(before);
  after.packages[key].allowedTargets = ["external"];
  assert.equal(validateManifest(before).valid, true);
  assert.equal(validateManifest(after).valid, true);
  const dir = await mkdtemp(join(tmpdir(), "spectre-target-diff-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const beforePath = join(dir, "before.json");
  const afterPath = join(dir, "after.json");
  await writeFile(beforePath, JSON.stringify(before));
  await writeFile(afterPath, JSON.stringify(after));
  await assert.rejects(
    execFileAsync(process.execPath, [cliPath, beforePath, afterPath, "--json"]),
    (error) => {
      assert.equal(error.code, 1);
      assert.equal(JSON.parse(error.stdout).classification, "breaking");
      return true;
    },
  );
  const { stdout } = await execFileAsync(process.execPath, [cliPath, afterPath, beforePath, "--json"]);
  assert.equal(JSON.parse(stdout).classification, "additive");
});

for (const registry of ["packages", "layers"]) {
  test(`handles own constructor entry in ${registry}`, () => {
    const after = clone(rootManifest);
    if (registry === "packages") {
      after.packages.constructor = { role: "fixture", layer: "build", stability: "experimental", description: "Fixture", exports: ["."] };
    } else {
      after.layers.constructor = { title: "Fixture", description: "Fixture", order: 99 };
      after.rules.dependencyDirection.push({ fromLayer: "constructor", allowedLayers: ["constructor"] });
    }
    assert.equal(validateManifest(after).valid, true);
    const added = diffManifests(rootManifest, after);
    assert.ok(added.changes.some(c => c.path === `${registry}.constructor` && c.classification === "additive"));
    const removed = diffManifests(after, rootManifest);
    assert.equal(removed.classification, "breaking");
    assert.ok(removed.changes.some(c => c.path === `${registry}.constructor` && c.message.includes("removed")));
    const modified = clone(after);
    modified[registry].constructor.description = "Changed fixture";
    assert.equal(diffManifests(after, modified).classification, "semantic");
  });
}

const metadataCases = [
  ["$schema", m => m, "$schema", "urn:fixture:schema"],
  ["$id", m => m, "$id", "urn:fixture:manifest"],
  ["system.packageManager", m => m.system, "packageManager", "pnpm@12.3.4"],
  ["system.repository", m => m.system, "repository", "./fixture-repository"],
  ["system.notes", m => m.system, "notes", ["Updated system guidance"]],
  ["layer notes", m => Object.values(m.layers)[0], "notes", ["Updated layer guidance"]],
  ["package notes", m => Object.values(m.packages)[0], "notes", ["Updated package guidance"]],
  ["direction notes", m => m.rules.dependencyDirection[0], "notes", ["Updated direction guidance"]],
  ["forbidden reason", m => m.rules.forbiddenImports[0], "reason", "Updated forbidden rationale"],
  ["boundary reason", m => m.rules.boundaryConstraints[0], "reason", "Updated boundary rationale"],
  ["entrypoint notes", m => m.ai.preferredEntrypoints[0], "notes", ["Updated entrypoint guidance"]],
];
for (const [label, select, field, value] of metadataCases) {
  test(`reports ${label} changes as semantic in both directions`, () => {
    const before = clone(rootManifest);
    const after = clone(before);
    select(after)[field] = value;
    assert.equal(validateManifest(after).valid, true);
    for (const [a, b] of [[before, after], [after, before]]) {
      const result = diffManifests(a, b);
      assert.equal(result.classification, "semantic");
      assert.equal(result.changes.length, 1);
      assert.ok(result.changes[0].path.endsWith(field));
    }
    if (field !== "reason") {
      const absent = clone(after);
      delete select(absent)[field];
      assert.equal(validateManifest(absent).valid, true);
      assert.equal(diffManifests(absent, after).classification, "semantic");
      assert.equal(diffManifests(after, absent).classification, "semantic");
    }
  });
}

test("metadata matching preserves duplicate rules and ignores rule reordering", () => {
  const before = clone(rootManifest);
  const rule = clone(before.rules.forbiddenImports[0]);
  before.rules.forbiddenImports.push({ ...rule, reason: "Additional rationale" });
  const after = clone(before);
  after.rules.forbiddenImports.at(-1).reason = "Changed additional rationale";
  assert.equal(validateManifest(after).valid, true);
  assert.equal(diffManifests(before, after).classification, "semantic");
  const reordered = clone(before);
  reordered.rules.forbiddenImports.reverse();
  reordered.rules.boundaryConstraints.reverse();
  reordered.ai.preferredEntrypoints.reverse();
  assert.deepEqual(diffManifests(before, reordered).changes, []);
});

test("metadata changes do not hide a breaking export removal", () => {
  const after = clone(rootManifest);
  after.system.notes = ["Changed guidance"];
  after.packages["@phcdevworks/spectre-manifest"].exports = ["."];
  const result = diffManifests(rootManifest, after);
  assert.equal(result.classification, "breaking");
  assert.ok(result.changes.some(c => c.path === "system.notes" && c.classification === "semantic"));
});

test("CLI emits JSON for constructor removal and metadata-only changes", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "spectre-diff-regression-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const before = clone(rootManifest);
  before.packages.constructor = { role: "fixture", layer: "build", stability: "experimental", description: "Fixture", exports: ["."] };
  const beforePath = join(dir, "before.json");
  const afterPath = join(dir, "after.json");
  await writeFile(beforePath, JSON.stringify(before));
  await writeFile(afterPath, JSON.stringify(rootManifest));
  await assert.rejects(execFileAsync(process.execPath, [cliPath, beforePath, afterPath, "--json"]), error => {
    assert.equal(error.code, 1);
    const result = JSON.parse(error.stdout);
    assert.equal(result.classification, "breaking");
    assert.equal(result.changes[0].path, "packages.constructor");
    return true;
  });
  const metadata = clone(rootManifest);
  metadata.system.notes = ["Changed guidance"];
  await writeFile(beforePath, JSON.stringify(metadata));
  const { stdout } = await execFileAsync(process.execPath, [cliPath, beforePath, afterPath, "--json"]);
  assert.equal(JSON.parse(stdout).classification, "semantic");
});
