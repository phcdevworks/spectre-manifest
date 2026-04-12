# @phcdevworks/spectre-manifest [![GitHub issues](https://img.shields.io/github/issues/phcdevworks/spectre-manifest)](https://github.com/phcdevworks/spectre-manifest/issues) [![GitHub pull requests](https://img.shields.io/github/issues-pr/phcdevworks/spectre-manifest)](https://github.com/phcdevworks/spectre-manifest/pulls) [![License](https://img.shields.io/github/license/phcdevworks/spectre-manifest)](LICENSE)

`@phcdevworks/spectre-manifest` is the machine-readable contract package for the Spectre ecosystem. It defines the official system map for packages, layers, ownership boundaries, dependency rules, and AI/tooling guidance used by validation, scaffolding, documentation, and code generation workflows across Spectre.

Maintained by PHCDevworks as part of the Spectre suite, this package acts as cross-system infrastructure rather than a runtime dependency. It exists to describe and validate ecosystem structure so humans, CI, scaffolding, documentation generators, and AI systems can work from the same contract without pushing architecture metadata into UI or shell packages.

This package is published as `@phcdevworks/spectre-manifest`. Its source repository is hosted at [`phcdevworks/spectre-manifest`](https://github.com/phcdevworks/spectre-manifest). See [Contributing](./CONTRIBUTING.md), [Changelog](https://github.com/phcdevworks/spectre-manifest/releases), and the [Security Policy](./SECURITY.md).

## Key capabilities

- Defines the machine-readable contract for the Spectre ecosystem
- Describes official package roles, layers, and ownership boundaries
- Models allowed and forbidden dependency relationships
- Supports validation, scaffolding, docs generation, and AI/tooling workflows
- Provides schema, types, and utilities for manifest authoring and validation

## Installation

```bash
npm install @phcdevworks/spectre-manifest
```

## Quick start

Validate a manifest object:

```ts
import { validateManifest } from "@phcdevworks/spectre-manifest";
import manifest from "./spectre.manifest.json" with { type: "json" };

const result = validateManifest(manifest);

if (!result.valid) {
  console.error(result.issues);
}
```

Validate a manifest file and format issues for terminal output:

```ts
import {
  formatManifestValidationIssues,
  validateManifestFile,
} from "@phcdevworks/spectre-manifest";

const result = await validateManifestFile("spectre.manifest.json");

if (!result.valid) {
  console.error(formatManifestValidationIssues(result.issues));
}
```

Use the CLI:

```bash
npx spectre-manifest-validate spectre.manifest.json
```

For machine-readable output:

```bash
npx spectre-manifest-validate spectre.manifest.json --json
```

## What this package owns

- The official Spectre package map
- Layer ordering, package roles, and ownership metadata
- Allowed and forbidden dependency relationships
- Boundary and governance metadata
- AI-readable guidance for safe entrypoints and generation workflows
- Schema and validation utilities for manifest authoring

The manifest is organized around the top-level sections `system`, `layers`, `packages`, `rules`, and `ai`. Together, those sections define package ownership, layer ordering, dependency direction, forbidden relationships, boundary constraints, and preferred tooling entrypoints.

## What this package does not own

- Visual tokens or styling implementation
- Framework adapters or component implementation
- Runtime shell behavior
- Application routing or state management
- Any rendering-layer responsibility

It should not be presented or consumed as a UI package, styling package, component library, framework adapter, or runtime application shell.

## Package exports / API surface

Runtime exports:

- `validateManifest`
- `validateManifestFile`
- `formatManifestValidationIssues`
- `loadManifestSchema`
- `manifestSchemaPath`

Type exports include:

- `SpectreManifest`
- `SpectreSystemMetadata`
- `SpectrePackageDefinition`
- `SpectreLayerDefinition`
- `ManifestRules`
- `ManifestAiGuidance`

Published schema export:

- `@phcdevworks/spectre-manifest/schema`

## Relationship to the rest of Spectre

Spectre keeps repository responsibilities explicit:

- `@phcdevworks/spectre-tokens` defines token contracts and design-language primitives
- `@phcdevworks/spectre-ui` defines the foundation UI layer
- Spectre UI adapters provide framework-specific integration
- `@phcdevworks/spectre-components`, `@phcdevworks/spectre-shell`, `@phcdevworks/spectre-shell-router`, `@phcdevworks/spectre-shell-signals`, and `@phcdevworks/spectre-init` operate in the build layer
- `@phcdevworks/spectre-manifest` defines the governance and tooling contract that describes how those packages relate to each other

That separation keeps architecture metadata out of runtime packages while still making it available to validation, scaffolding, documentation, and code generation workflows.

## Primary consumers

- `@phcdevworks/spectre-init`
- CI validation and repository checks
- Documentation generation
- AI and code generation workflows
- Architecture and governance tooling

Runtime packages should not depend on this package unless that relationship is explicitly modeled and justified by the manifest contract itself.

## Development

Install dependencies, then run the repository validation flow:

```bash
corepack pnpm install
pnpm build
pnpm typecheck
pnpm validate:manifest
```

## Contributing

When contributing:

- Treat schema and validation behavior as public contract surface
- Keep terminology aligned with the rest of the Spectre suite
- Prefer additive, backward-compatible evolution when possible
- Update documentation whenever contract behavior changes
- Validate the sample manifest before finishing a change

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

## License

MIT © PHCDevworks. See [LICENSE](LICENSE).
