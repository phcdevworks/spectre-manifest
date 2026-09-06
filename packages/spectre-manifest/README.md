# @phcdevworks/spectre-manifest

Machine-readable contract package for the Spectre ecosystem. It records package roles, layers, ownership boundaries, dependency rules, and AI/tooling guidance in one source of truth.

[Issues](https://github.com/phcdevworks/spectre-manifest/issues) | [Pull requests](https://github.com/phcdevworks/spectre-manifest/pulls) | [Security](../../SECURITY.md) | [Contributing](../../CONTRIBUTING.md)

## Capabilities

- Defines the official Spectre package and layer map.
- Requires a root `schemaVersion` so tools know which manifest contract they validated.
- Models allowed and forbidden dependency relationships.
- Publishes a JSON schema and TypeScript validation utilities.
- Validates schema rules plus semantic concerns such as duplicate layer order and dependency cycles.
- Gives humans, CI, scaffolding, docs, and AI workflows the same architecture contract.

## Install

```bash
npm install @phcdevworks/spectre-manifest
```

## Quick Start

Validate a manifest object:

```ts
import { validateManifest } from '@phcdevworks/spectre-manifest'
import manifest from './spectre.manifest.json' with { type: 'json' }

const result = validateManifest(manifest)

if (!result.valid) {
  console.error(result.issues)
}
```

Validate a manifest file:

```ts
import { formatManifestValidationIssues, validateManifestFile } from '@phcdevworks/spectre-manifest'

const result = await validateManifestFile('spectre.manifest.json')

if (!result.valid) {
  console.error(formatManifestValidationIssues(result.issues))
}
```

Use the validate CLI:

```bash
npx spectre-manifest-validate spectre.manifest.json
npx spectre-manifest-validate spectre.manifest.json --json
```

Check a downstream package against its manifest entry:

```bash
npx spectre-manifest-check spectre.manifest.json ./path/to/your-package
npx spectre-manifest-check spectre.manifest.json ./path/to/your-package --json
```

The checker validates package metadata before inspecting it; malformed data returns
structured issues, including with `--json`. When `exports` is present, declared
exports must have a non-null target. String, array, and conditional root exports
represent `.`; subpath maps are checked by their declared keys. Conditional targets
are checked for declared availability, without selecting runtime conditions or
checking files on disk. Packages without `exports` retain the legacy behavior of
skipping export checks.

Diff two manifests and classify every change as additive, semantic, or breaking:

```bash
npx spectre-manifest-diff old.manifest.json new.manifest.json
npx spectre-manifest-diff old.manifest.json new.manifest.json --json
```

An absent or empty `allowedTargets` list imposes no target restriction. Changing
it to a non-empty list is breaking; clearing the list is additive. The diff CLI
exits with code 1 for breaking changes.

Import the published manifest document directly:

```ts
import manifest from '@phcdevworks/spectre-manifest/manifest' with { type: 'json' }
```

## API

Runtime exports:

- `validateManifest`
- `validateManifestFile`
- `formatManifestValidationIssues`
- `loadManifestSchema`
- `manifestSchemaPath`
- `checkPackageAgainstManifest`
- `formatPackageCheckIssues`
- `diffManifests`
- `formatManifestDiff`

Published schema export:

- `@phcdevworks/spectre-manifest/schema`

Published manifest export:

- `@phcdevworks/spectre-manifest/manifest`

Type exports include `SpectreManifest`, `SpectrePackageDefinition`, `SpectreLayerDefinition`, `ManifestRules`, `ManifestAiGuidance`, `PackageCheckResult`, `PackageCheckIssue`, `ManifestChange`, `ManifestChangeClassification`, and `ManifestDiffResult`.

## Boundaries

This package owns architecture metadata, schema, and validation. It does not own rendering, styling, routing, reactive state, component implementation, or framework adapters.

## Development

```bash
corepack pnpm install
corepack pnpm --filter @phcdevworks/spectre-manifest build
corepack pnpm --filter @phcdevworks/spectre-manifest test
```

## Release Notes

See the project releases on GitHub.

## License

MIT. See [LICENSE](../../LICENSE).
