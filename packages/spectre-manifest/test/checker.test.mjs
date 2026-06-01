import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  checkPackageAgainstManifest,
  formatPackageCheckIssues,
} from "../dist/index.js";

const execFileAsync = promisify(execFile);
const rootManifestPath = resolve(process.cwd(), "../../spectre.manifest.json");
const rootManifest = JSON.parse(await readFile(rootManifestPath, "utf8"));
const cliPath = resolve(process.cwd(), "dist/check-cli.js");

async function makeTempPackage(packageJson) {
  const dir = await mkdtemp(join(tmpdir(), "spectre-checker-test-"));
  await writeFile(join(dir, "package.json"), JSON.stringify(packageJson, null, 2));
  return dir;
}

// --- happy path ---

test("accepts a registered package with correct dependencies", async () => {
  const dir = await makeTempPackage({
    name: "@phcdevworks/spectre-ui",
    exports: { ".": "./dist/index.js", "./tailwind": "./tailwind.js", "./index.css": "./index.css", "./base.css": "./base.css", "./components.css": "./components.css", "./utilities.css": "./utilities.css" },
    dependencies: { "@phcdevworks/spectre-tokens": "^2.0.0" },
  });
  const result = await checkPackageAgainstManifest(rootManifest, dir);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
  assert.equal(result.packageName, "@phcdevworks/spectre-ui");
});

test("accepts peerDependencies as satisfying manifest dependencies", async () => {
  const dir = await makeTempPackage({
    name: "@phcdevworks/spectre-ui-astro",
    exports: { ".": "./dist/index.js", "./components/SpBadge.astro": "./components/SpBadge.astro", "./components/SpButton.astro": "./components/SpButton.astro", "./components/SpCard.astro": "./components/SpCard.astro", "./components/SpIconBox.astro": "./components/SpIconBox.astro", "./components/SpInput.astro": "./components/SpInput.astro", "./components/SpPricingCard.astro": "./components/SpPricingCard.astro", "./components/SpRating.astro": "./components/SpRating.astro", "./components/SpTestimonial.astro": "./components/SpTestimonial.astro" },
    peerDependencies: {
      "@phcdevworks/spectre-tokens": "^2.0.0",
      "@phcdevworks/spectre-ui": "^1.0.0",
    },
  });
  const result = await checkPackageAgainstManifest(rootManifest, dir);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

// --- missing registration ---

test("reports missing registration for unknown package", async () => {
  const dir = await makeTempPackage({ name: "@phcdevworks/spectre-unknown" });
  const result = await checkPackageAgainstManifest(rootManifest, dir);

  assert.equal(result.valid, false);
  assert.equal(result.issues[0]?.kind, "missing-registration");
  assert.match(result.issues[0]?.message ?? "", /not registered in the manifest/);
});

test("reports missing registration when package.json is unreadable", async () => {
  const result = await checkPackageAgainstManifest(rootManifest, "/nonexistent/path");

  assert.equal(result.valid, false);
  assert.equal(result.issues[0]?.kind, "missing-registration");
  assert.match(result.issues[0]?.message ?? "", /Unable to read package\.json/);
});

// --- exports ---

test("reports missing export declared in manifest", async () => {
  const dir = await makeTempPackage({
    name: "@phcdevworks/spectre-manifest",
    exports: { ".": "./dist/index.js" }, // missing "./schema"
  });
  const result = await checkPackageAgainstManifest(rootManifest, dir);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((i) => i.kind === "missing-export" && i.message.includes('"./schema"')));
});

test("skips export check when package.json has no exports object", async () => {
  const dir = await makeTempPackage({
    name: "@phcdevworks/spectre-shell-router",
    // no exports field — older package style
  });
  const result = await checkPackageAgainstManifest(rootManifest, dir);

  assert.ok(!result.issues.some((i) => i.kind === "missing-export"));
});

// --- dependencies ---

test("reports undeclared Spectre dependency", async () => {
  const dir = await makeTempPackage({
    name: "@phcdevworks/spectre-ui",
    exports: { ".": "./dist/index.js" },
    dependencies: {
      "@phcdevworks/spectre-tokens": "^2.0.0",
      "@phcdevworks/spectre-components": "^1.0.0", // not in manifest entry
    },
  });
  const result = await checkPackageAgainstManifest(rootManifest, dir);

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some(
      (i) => i.kind === "undeclared-dependency" && i.message.includes("spectre-components"),
    ),
  );
});

test("reports missing declared dependency", async () => {
  const dir = await makeTempPackage({
    name: "@phcdevworks/spectre-ui",
    exports: { ".": "./dist/index.js" },
    dependencies: {}, // spectre-tokens is missing
  });
  const result = await checkPackageAgainstManifest(rootManifest, dir);

  assert.equal(result.valid, false);
  assert.ok(
    result.issues.some(
      (i) => i.kind === "missing-declared-dependency" && i.message.includes("spectre-tokens"),
    ),
  );
});

test("ignores non-Spectre dependencies", async () => {
  const dir = await makeTempPackage({
    name: "@phcdevworks/spectre-components",
    exports: { ".": "./dist/index.js" },
    dependencies: {
      "@phcdevworks/spectre-tokens": "^2.0.0",
      "@phcdevworks/spectre-ui": "^1.0.0",
      lit: "^3.0.0",
      "some-random-lib": "^1.0.0",
    },
  });
  const result = await checkPackageAgainstManifest(rootManifest, dir);

  assert.ok(!result.issues.some((i) => i.message.includes("lit")));
  assert.ok(!result.issues.some((i) => i.message.includes("some-random-lib")));
});

// --- formatPackageCheckIssues ---

test("formatPackageCheckIssues formats issues as tagged strings", () => {
  const issues = [
    { kind: "missing-registration", path: "pkg", message: "not registered" },
    { kind: "undeclared-dependency", path: "pkg deps", message: "unexpected dep" },
  ];
  const formatted = formatPackageCheckIssues(issues);

  assert.equal(formatted.length, 2);
  assert.equal(formatted[0], "[missing-registration] pkg: not registered");
  assert.equal(formatted[1], "[undeclared-dependency] pkg deps: unexpected dep");
});

// --- CLI ---

test("CLI reports compliant package via --json", async () => {
  const dir = await makeTempPackage({
    name: "@phcdevworks/spectre-shell-router",
    exports: { ".": "./dist/index.js" },
  });

  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    rootManifestPath,
    dir,
    "--json",
  ]);

  const result = JSON.parse(stdout);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("CLI exits non-zero and reports issues via --json for non-compliant package", async () => {
  const dir = await makeTempPackage({ name: "@phcdevworks/spectre-unknown" });

  await assert.rejects(
    execFileAsync(process.execPath, [cliPath, rootManifestPath, dir, "--json"]),
    (error) => {
      assert.equal(error.code, 1);
      const result = JSON.parse(error.stderr);
      assert.equal(result.valid, false);
      assert.ok(result.issues.length > 0);
      return true;
    },
  );
});

test("CLI exits non-zero when no package path is provided", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [cliPath, rootManifestPath]),
    (error) => {
      assert.equal(error.code, 1);
      return true;
    },
  );
});
