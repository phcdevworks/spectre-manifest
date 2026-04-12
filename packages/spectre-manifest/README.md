# @phcdevworks/spectre-manifest [![GitHub issues](https://img.shields.io/github/issues/phcdevworks/spectre-manifest)](https://github.com/phcdevworks/spectre-manifest/issues) [![GitHub pull requests](https://img.shields.io/github/issues-pr/phcdevworks/spectre-manifest)](https://github.com/phcdevworks/spectre-manifest/pulls) [![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

`@phcdevworks/spectre-manifest` is the machine-readable contract package for the Spectre ecosystem. It defines the official system map for packages, layers, ownership boundaries, dependency rules, and AI/tooling guidance used by validation, scaffolding, documentation, and code generation workflows across Spectre.

[Contributing](../../CONTRIBUTING.md) | [Changelog](https://github.com/phcdevworks/spectre-manifest/releases) | [Security Policy](../../SECURITY.md)

## Key capabilities

- Defines the machine-readable contract for the Spectre ecosystem
- Describes official package roles, layers, and boundaries
- Supports validation, scaffolding, docs generation, and AI/tooling workflows
- Provides schema, types, and utilities for manifest authoring and validation
- Helps reduce architectural drift across the Spectre suite

## Installation

```bash
npm install @phcdevworks/spectre-manifest
```

## What this package is for

Use this package when you need a single source of truth for Spectre ecosystem structure.

- Official Spectre package map
- Layer ownership and package roles
- Allowed and forbidden dependency relationships
- Boundary and governance metadata
- AI-readable guidance for safe entrypoints and generation workflows
- Validation inputs for CI, scaffolding, and documentation tooling

This package is cross-system infrastructure. It exists to describe and validate ecosystem structure, not to implement runtime UI behavior.

## What this package is not

`@phcdevworks/spectre-manifest` is not:

- a UI package
- a styling package
- a framework adapter
- a component library
- a runtime application shell

It should not be presented or consumed as a rendering layer, visual system, or application runtime dependency.

## Quick start

### Validate a manifest object

```ts
import { validateManifest } from "@phcdevworks/spectre-manifest";
import manifest from "./spectre.manifest.json" with { type: "json" };

const result = validateManifest(manifest);

if (!result.valid) {
  console.error(result.issues);
}
```

### Validate a manifest file

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

### Use the CLI

```bash
npx spectre-manifest-validate spectre.manifest.json
```

For machine-readable output:

```bash
npx spectre-manifest-validate spectre.manifest.json --json
```

## Package exports

The root package exports:

- `validateManifest()`
- `validateManifestFile()`
- `formatManifestValidationIssues()`
- `loadManifestSchema()`
- `manifestSchemaPath`
- TypeScript types including `SpectreManifest`, `SpectreSystemMetadata`, `SpectrePackageDefinition`, `SpectreLayerDefinition`, `ManifestRules`, and `ManifestAiGuidance`

Published schema export:

- `@phcdevworks/spectre-manifest/schema`

## Contract model

The manifest is organized around these top-level sections:

- `system`
- `layers`
- `packages`
- `rules`
- `ai`

Together, these sections define package ownership, layer ordering, dependency direction, forbidden relationships, boundary constraints, and preferred tooling entrypoints.

## Role in the Spectre ecosystem

Spectre keeps repository responsibilities explicit:

- `@phcdevworks/spectre-tokens` defines token contracts and design-language primitives
- `@phcdevworks/spectre-ui` defines the foundation UI layer
- Spectre UI adapters provide framework-specific integration
- `@phcdevworks/spectre-components`, `@phcdevworks/spectre-shell`, `@phcdevworks/spectre-shell-router`, `@phcdevworks/spectre-shell-signals`, and `@phcdevworks/spectre-init` operate in the build layer
- `@phcdevworks/spectre-manifest` defines the governance and tooling contract that describes how those packages relate to each other

This separation keeps architecture metadata out of runtime packages while still making it available to humans, CI, scaffolding, documentation generators, and AI systems.

## Ownership boundaries

This package owns:

- ecosystem governance metadata
- package and layer registry data
- dependency and boundary rules metadata
- AI/tooling guidance metadata
- schema and validation utilities for manifest authoring

This package does not own:

- visual tokens
- styling implementation
- framework adapters
- component implementation
- runtime shell behavior
- application routing or state management

## Primary consumers

`@phcdevworks/spectre-manifest` is intended for:

- `@phcdevworks/spectre-init`
- CI validation and repository checks
- documentation generation
- AI and code generation workflows
- architecture and governance tooling

Runtime packages should not take a dependency on this package unless that relationship is explicitly modeled and justified by the manifest contract itself.

## Development

Build the package:

```bash
pnpm build
```

Run validation and checks:

```bash
pnpm typecheck
pnpm test
pnpm validate ../../spectre.manifest.json
```

## Contributing

PHCDevworks maintains this package as part of the public Spectre ecosystem contract.

When contributing:

- treat schema and validation behavior as public contract surface
- keep terminology aligned with the rest of the Spectre suite
- prefer additive, backward-compatible evolution when possible
- update documentation whenever contract behavior changes
- validate the sample manifest before finishing a change

See [../../CONTRIBUTING.md](../../CONTRIBUTING.md) for the full workflow.

## License

MIT (c) PHCDevworks. See [MIT License](https://opensource.org/licenses/MIT).
