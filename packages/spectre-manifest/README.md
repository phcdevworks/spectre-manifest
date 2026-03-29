# @phcdevworks/spectre-manifest [![GitHub issues](https://img.shields.io/github/issues/phcdevworks/spectre-manifest)](https://github.com/phcdevworks/spectre-manifest/issues) [![GitHub pulls](https://img.shields.io/github/issues-pr/phcdevworks/spectre-manifest)](https://github.com/phcdevworks/spectre-manifest/pulls) [![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

`@phcdevworks/spectre-manifest` is the machine-readable contract package for the Spectre system for tooling, validation, scaffolding, documentation, and architecture workflows.

Maintained by PHCDevworks, it describes system metadata, official package roles, layer boundaries, dependency rules, AI guidance, and preferred tooling entrypoints consumed across the Spectre ecosystem. It keeps architecture intent explicit so `spectre-init`, CI, docs generation, and AI-assisted workflows can reason about Spectre safely without becoming part of the core runtime.

[Contributing](../../CONTRIBUTING.md) | [Changelog](https://github.com/phcdevworks/spectre-manifest/releases) | [Security Policy](../../SECURITY.md)

## Key capabilities

- Defines the machine-readable contract for the Spectre ecosystem
- Describes official package roles, layers, and boundaries
- Supports validation, scaffolding, AI/tooling, and docs workflows
- Provides schema, types, and utilities for manifest authoring and validation
- Helps reduce architectural drift across the suite

## Installation

```bash
npm install @phcdevworks/spectre-manifest
```

## Quick start

### Manifest usage

Load a manifest object in JavaScript or TypeScript:

```ts
import type { SpectreManifest } from "@phcdevworks/spectre-manifest";
import manifest from "./spectre.manifest.json" with { type: "json" };

const spectreManifest = manifest as SpectreManifest;
```

### Validation usage

Validate a manifest object or manifest file:

```ts
import { validateManifest, validateManifestFile } from "@phcdevworks/spectre-manifest";
import manifest from "./spectre.manifest.json" with { type: "json" };

const objectResult = validateManifest(manifest);
const fileResult = await validateManifestFile("spectre.manifest.json");

if (!objectResult.valid || !fileResult.valid) {
  console.error(objectResult.issues, fileResult.issues);
}
```

### Contract inspection

Read top-level sections when you need system metadata, package registry data, or rules for downstream tooling:

```ts
import { validateManifestFile } from "@phcdevworks/spectre-manifest";

const result = await validateManifestFile("spectre.manifest.json");

if (result.valid && result.manifest) {
  console.log(result.manifest.system);
  console.log(result.manifest.packages["@phcdevworks/spectre-ui"]);
  console.log(result.manifest.rules);
}
```

Use the manifest when you need package and layer metadata, dependency constraints, or AI/tooling guidance. Do not treat it as a runtime source for UI rendering, styling, or application behavior.

## What this package owns

- Machine-readable ecosystem metadata
- System, package, and layer contract definitions
- Boundary and dependency rules metadata
- AI and tooling guidance metadata
- Validation schema, types, and utilities

### Contract model

The manifest is organized around these top-level sections:

- `system`
- `layers`
- `packages`
- `rules`
- `ai`

### Primary consumers

This package is intended for:

- `@phcdevworks/spectre-init`
- CI validation and repository checks
- Documentation generation
- AI and code generation workflows
- Architecture and governance tooling

## What this package does not own

- Visual tokens
  Those belong in [`@phcdevworks/spectre-tokens`](https://github.com/phcdevworks/spectre-tokens).
- Styling implementation
  That belongs in [`@phcdevworks/spectre-ui`](https://github.com/phcdevworks/spectre-ui) and related downstream packages.
- Framework-specific adapters
  Adapter packages translate Spectre contracts for specific frameworks and runtimes.
- Runtime shell behavior
  That belongs in shell and application-layer packages.
- Component structure or implementation
  Component composition belongs in downstream UI and build packages.
- Full application state, routing, or app-specific configuration
  The manifest describes ecosystem structure, not every runtime detail in an application.

## Package exports / API surface

### Root package

`@phcdevworks/spectre-manifest` exports:

- `validateManifest()`
- `validateManifestFile()`
- `formatManifestValidationIssues()`
- `loadManifestSchema()`
- `manifestSchemaPath`
- TypeScript types including `SpectreManifest`, `SpectreSystemMetadata`, `SpectrePackageDefinition`, `SpectreLayerDefinition`, `ManifestRules`, and `ManifestAiGuidance`

Example:

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

### Schema export

- `@phcdevworks/spectre-manifest/schema`

## Relationship to the rest of Spectre

Spectre keeps responsibilities separate:

- [`@phcdevworks/spectre-tokens`](https://github.com/phcdevworks/spectre-tokens) defines visual language, semantic roles, and token contracts
- [`@phcdevworks/spectre-ui`](https://github.com/phcdevworks/spectre-ui) implements shared styling contracts and reusable UI-level behavior
- Spectre UI adapters deliver framework-specific usage for those contracts
- Build-layer packages such as `@phcdevworks/spectre-components`, `@phcdevworks/spectre-shell`, `@phcdevworks/spectre-shell-router`, `@phcdevworks/spectre-shell-signals`, and `@phcdevworks/spectre-init` power application assembly and delivery
- [`@phcdevworks/spectre-manifest`](https://github.com/phcdevworks/spectre-manifest) describes how the system is structured and how tooling, CI, docs generators, and AI workflows should consume that structure safely

That separation keeps package responsibilities explicit while letting Spectre tooling reason about boundaries, allowed dependencies, and preferred entrypoints without moving those concerns into runtime packages.

## Development

Build the package:

```bash
pnpm build
```

Run validation and checks:

```bash
pnpm test
pnpm typecheck
pnpm validate:manifest
```

Key source areas:

- `src/` for public types, schema helpers, validators, and package entry points
- `schema/` for the published JSON Schema
- `examples/` for manifest usage examples when present
- `README.md` for package documentation

## Contributing

PHCDevworks maintains this package as part of the Spectre system.

When contributing:

- treat schema, validation behavior, and exported types as public contract surface
- keep terminology aligned with the rest of the Spectre suite
- prefer additive, backward-compatible contract evolution when possible
- update documentation whenever contract behavior changes
- run `pnpm build`, `pnpm typecheck`, and `pnpm validate:manifest` before opening a pull request

See [../../CONTRIBUTING.md](../../CONTRIBUTING.md) for the full workflow.

## License

MIT © PHCDevworks. See [MIT License](https://opensource.org/licenses/MIT).
