# @phcdevworks/spectre-manifest

[![npm version](https://img.shields.io/npm/v/@phcdevworks/spectre-manifest.svg)](https://www.npmjs.com/package/@phcdevworks/spectre-manifest)
[![CI](https://img.shields.io/github/actions/workflow/status/phcdevworks/spectre-manifest/ci.yml?branch=main&label=CI)](https://github.com/phcdevworks/spectre-manifest/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/phcdevworks/spectre-manifest)](LICENSE)
[![Node](https://img.shields.io/node/v/@phcdevworks/spectre-manifest)](https://nodejs.org)

Workspace for the Spectre manifest package and ecosystem contract. The manifest records package roles, layers, ownership boundaries, dependency rules, and AI/tooling guidance in one machine-readable source of truth.

[Contributing](CONTRIBUTING.md) | [Changelog](CHANGELOG.md) |
[Roadmap](ROADMAP.md) | [Security Policy](SECURITY.md)

## When to use this package

- You need a machine-readable contract describing Spectre package roles, layer membership, and dependency rules.
- You are writing tooling, CI scripts, AI agent docs, or scaffolding that needs to understand the Spectre ecosystem structure programmatically.
- You want to validate a `spectre.manifest.json` file against the published schema.

## When not to use this package

- You need runtime reactive state, routing, styling, or component logic — those belong in other Spectre packages.
- You need a generic JSON schema library — this package is purpose-built for Spectre architecture contracts only.

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

AI-agent coordination starts in [AGENTS.md](./AGENTS.md), with companion
guidance in [CLAUDE.md](./CLAUDE.md), [CODEX.md](./CODEX.md),
[COPILOT.md](./COPILOT.md), [JULES.md](./JULES.md), and
[.github/copilot-instructions.md](./.github/copilot-instructions.md).

### Troubleshooting

| Problem                                   | Likely cause                                                     | Fix                                                                     |
| ----------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm verify` fails with TTY error        | Running in non-interactive shell without `CI=true`               | Prefix with `CI=true pnpm verify`                                       |
| `validate:manifest` reports unknown layer | `spectre.manifest.json` references a layer not defined in schema | Add the layer to the manifest or fix the reference                      |
| Type errors after schema change           | TypeScript types and schema are out of sync                      | Update `packages/spectre-manifest/src/types.ts` to match schema changes |
| Tests fail after schema change            | Tests import from `dist/` which is stale                         | Run `pnpm build` before `pnpm test`                                     |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). The gate is `CI=true corepack pnpm verify`. Schema and validation behavior are public contract surface — breaking changes require a `schemaVersion` rationale. See [AGENTS.md](./AGENTS.md) for boundaries.

## Release Notes

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT. See [LICENSE](./LICENSE).
