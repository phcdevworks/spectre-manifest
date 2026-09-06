import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');
const packageRoot = join(repoRoot, 'packages/spectre-manifest');
const consumer = mkdtempSync(join(tmpdir(), 'spectre-packed-consumer-'));
const manifest = JSON.parse(readFileSync(join(repoRoot, 'spectre.manifest.json'), 'utf8'));

function run(command: string, args: string[], cwd = consumer): string {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 120_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function cli(name: string, args: string[], expectedStatus = 0): unknown {
  const result = spawnSync(join(consumer, 'node_modules/.bin', name), args, {
    cwd: consumer,
    encoding: 'utf8',
    timeout: 30_000,
  });
  assert.ifError(result.error);
  assert.equal(result.status, expectedStatus, `${name}: ${result.stderr}`);
  return JSON.parse(result.stdout || result.stderr);
}

try {
  // Pack the build exactly as it will be distributed, without publishing it.
  run('pnpm', ['pack', '--pack-destination', consumer], packageRoot);
  const archives = readdirSync(consumer).filter((name) => name.endsWith('.tgz'));
  assert.equal(archives.length, 1, 'Expected one package tarball');
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({
    name: 'spectre-package-smoke-consumer',
    private: true,
    type: 'module',
  }));
  run('npm', [
    'install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false',
    join(consumer, archives[0]!),
  ]);

  // Bare specifiers force resolution through the installed package's exports map.
  writeFileSync(join(consumer, 'smoke.mjs'), `
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as api from '@phcdevworks/spectre-manifest';
import schema from '@phcdevworks/spectre-manifest/schema' with { type: 'json' };
import manifest from '@phcdevworks/spectre-manifest/manifest' with { type: 'json' };
for (const name of [
  'loadManifestSchema', 'validateManifest', 'validateManifestFile',
  'formatManifestValidationIssues', 'checkPackageAgainstManifest',
  'formatPackageCheckIssues', 'diffManifests', 'formatManifestDiff',
]) assert.equal(typeof api[name], 'function', name);
assert.deepEqual(api.loadManifestSchema(), schema);
assert.deepEqual(JSON.parse(readFileSync(api.manifestSchemaPath, 'utf8')), schema);
assert.equal(api.validateManifest(manifest).valid, true);
assert.deepEqual(api.diffManifests(manifest, manifest).changes, []);
console.log(JSON.stringify(manifest));
`);
  assert.deepEqual(JSON.parse(run(process.execPath, ['smoke.mjs'])), manifest,
    'The distributed manifest must match the repository source');

  writeFileSync(join(consumer, 'types.mts'), `
import {
  validateManifest, checkPackageAgainstManifest, diffManifests,
  type SpectreManifest, type PackageCheckResult, type ManifestDiffResult,
} from '@phcdevworks/spectre-manifest';
declare const manifest: SpectreManifest;
const valid: boolean = validateManifest(manifest).valid;
const checked: Promise<PackageCheckResult> = checkPackageAgainstManifest(manifest, '.');
const diff: ManifestDiffResult = diffManifests(manifest, manifest);
// @ts-expect-error Package paths must be strings in the published declarations.
checkPackageAgainstManifest(manifest, 42);
`);
  writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext',
      strict: true, noEmit: true, skipLibCheck: true, types: [],
    },
    files: ['types.mts'],
  }));
  run('pnpm', ['exec', 'tsc', '-p', join(consumer, 'tsconfig.json')], packageRoot);

  const installed = join(consumer, 'node_modules/@phcdevworks/spectre-manifest');
  const manifestPath = join(installed, 'spectre.manifest.json');
  assert.equal((cli('spectre-manifest-validate', [manifestPath, '--json']) as { valid: boolean }).valid, true);
  assert.equal((cli('spectre-manifest-check', [manifestPath, installed, '--json']) as { valid: boolean }).valid, true);
  assert.deepEqual(cli('spectre-manifest-diff', [manifestPath, manifestPath, '--json']), {
    classification: 'additive', changes: [],
  });

  const changed = structuredClone(manifest);
  changed.packages['@phcdevworks/spectre-manifest'].exports = ['.'];
  const changedPath = join(consumer, 'changed.manifest.json');
  writeFileSync(changedPath, JSON.stringify(changed));
  assert.equal((cli('spectre-manifest-diff', [manifestPath, changedPath, '--json'], 1) as {
    classification: string;
  }).classification, 'breaking');

  console.log('Packed package: imports, declarations, bundled data, and all three installed CLIs passed.');
} finally {
  rmSync(consumer, { recursive: true, force: true });
}
