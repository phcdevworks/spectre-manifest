import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const cliPath = resolve(process.cwd(), "dist/cli.js");
const validManifestPath = resolve(process.cwd(), "../../spectre.manifest.json");

test("CLI prints JSON output for a valid manifest", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    cliPath,
    "--json",
    validManifestPath,
  ]);

  const result = JSON.parse(stdout);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("CLI returns non-zero and JSON issues for an invalid manifest", async () => {
  const tempDirectory = await mkdtemp(join(tmpdir(), "spectre-manifest-cli-"));
  const invalidManifestPath = join(tempDirectory, "invalid.manifest.json");

  await writeFile(
    invalidManifestPath,
    JSON.stringify(
      {
        $schema: "./packages/spectre-manifest/schema/spectre.manifest.schema.json",
        system: {
          name: "Broken Spectre",
          version: "0.1.0",
          manifestVersion: "0.1",
        },
        layers: {
          foundation: {
            title: "Foundation",
            description: "Base layer",
            order: 10,
          },
        },
        packages: {},
        rules: {
          dependencyDirection: [
            {
              fromLayer: "foundation",
              allowedLayers: ["foundation"],
            },
          ],
          forbiddenImports: [],
          boundaryConstraints: [],
        },
        ai: {
          preferredEntrypoints: [
            {
              task: "Validate",
              kind: "command",
              entrypoint: "spectre-manifest-validate",
            },
          ],
          generationRules: ["Keep it valid."],
          usageGuidance: ["Use the validator."],
          safeDefaults: ["Do not ship invalid manifests."],
        },
      },
      null,
      2,
    ),
  );

  await assert.rejects(
    execFileAsync(process.execPath, [cliPath, "--json", invalidManifestPath]),
    (error) => {
      assert.equal(error.code, 1);

      const result = JSON.parse(error.stderr);

      assert.equal(result.valid, false);
      assert.ok(result.issues.length > 0);
      return true;
    },
  );
});
