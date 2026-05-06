# @phcdevworks/spectre-manifest

Workspace for the Spectre manifest package and ecosystem contract. The manifest records package roles, layers, ownership boundaries, dependency rules, and AI/tooling guidance in one machine-readable source of truth.

[Issues](https://github.com/phcdevworks/spectre-manifest/issues) | [Pull requests](https://github.com/phcdevworks/spectre-manifest/pulls) | [Security](./SECURITY.md) | [Contributing](./CONTRIBUTING.md)

## Capabilities

- Defines the official Spectre package and layer map.
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

Use the CLI:

```bash
npx spectre-manifest-validate spectre.manifest.json
npx spectre-manifest-validate spectre.manifest.json --json
```

## API

Runtime exports:

- `validateManifest`
- `validateManifestFile`
- `formatManifestValidationIssues`
- `loadManifestSchema`
- `manifestSchemaPath`

Published schema export:

- `@phcdevworks/spectre-manifest/schema`

Type exports include `SpectreManifest`, `SpectrePackageDefinition`, `SpectreLayerDefinition`, `ManifestRules`, and `ManifestAiGuidance`.

## Boundaries

This package owns architecture metadata, schema, and validation. It does not own rendering, styling, routing, reactive state, component implementation, or framework adapters.

## Development

```bash
corepack pnpm install
pnpm verify
```

Useful scripts:

- `pnpm build` builds the package.
- `pnpm typecheck` validates TypeScript without emitting files.
- `pnpm test` builds and runs the Node test suite.
- `pnpm validate:manifest` validates `spectre.manifest.json`.
- `pnpm verify` runs the standard workspace verification flow.

## Release Notes

See the project releases on GitHub.

## License

MIT. See [LICENSE](./LICENSE).
