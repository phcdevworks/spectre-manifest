# @phcdevworks/spectre-manifest

[![npm version](https://img.shields.io/npm/v/@phcdevworks/spectre-manifest)](https://www.npmjs.com/package/@phcdevworks/spectre-manifest)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933.svg)](https://nodejs.org/)

`@phcdevworks/spectre-manifest` is the machine-readable contract layer for the Spectre ecosystem. It describes system metadata, official package and layer boundaries, dependency rules, and tooling guidance so scaffolding, validation, documentation, and AI-assisted workflows can consume Spectre consistently without becoming part of the application runtime.

[Contributing](../../CONTRIBUTING.md) | [Changelog](https://github.com/phcdevworks/spectre-manifest/releases) | [Security Policy](../../SECURITY.md)

## Key capabilities

- Defines the machine-readable contract for the Spectre ecosystem
- Describes official package roles, layers, and boundaries
- Supports validation, scaffolding, AI/tooling, and docs workflows
- Provides schema, types, and utilities for manifest authoring and validation
- Helps reduce architectural drift across the suite

## Installation

```sh
npm install @phcdevworks/spectre-manifest
```

## Quick start

Import the package when you need to read, validate, or reason about a Spectre manifest in tooling, CI, or code generation workflows.

```ts
import type { SpectreManifest } from "@phcdevworks/spectre-manifest";
import { validateManifest } from "@phcdevworks/spectre-manifest";
import manifest from "./spectre.manifest.json" with { type: "json" };

const typedManifest = manifest as SpectreManifest;

const result = validateManifest(typedManifest);

if (!result.valid) {
  console.error(result.issues);
}
```

Validate a manifest file in CI or local tooling:

```ts
import { validateManifestFile } from "@phcdevworks/spectre-manifest";

const result = await validateManifestFile("spectre.manifest.json");

if (!result.valid) {
  process.exitCode = 1;
  console.error(result.issues);
}
```

Read top-level contract sections after validation:

```ts
import { validateManifestFile } from "@phcdevworks/spectre-manifest";

const result = await validateManifestFile("spectre.manifest.json");

if (result.valid && result.manifest) {
  console.log(result.manifest.system.name);
  console.log(Object.keys(result.manifest.packages));
  console.log(result.manifest.rules.dependencyDirection);
}
```

## What this package owns

- Machine-readable ecosystem metadata
- System, package, and layer contract definitions
- Boundary and dependency rules metadata
- AI and tooling guidance metadata
- Validation schema, types, and utilities

## What this package does not own

- Visual tokens
- Styling implementation
- Framework-specific adapters
- Runtime shell behavior
- Component structure
- Full application state or app-level configuration

## Package exports / API surface

The initial public surface is intentionally small and focused on contract authoring and validation.

- `SpectreManifest` and related TypeScript contract types from the root package
- `validateManifest(manifest)` for in-memory validation
- `validateManifestFile(path)` for file-based validation
- `formatManifestValidationIssues(issues)` for readable validator output
- `loadManifestSchema()` and `manifestSchemaPath` for schema-aware tooling
- `@phcdevworks/spectre-manifest/schema` for direct schema consumers

## Relationship to the rest of Spectre

Spectre packages have distinct responsibilities, and this package exists to document those boundaries rather than replace them.

- `@phcdevworks/spectre-tokens` defines the visual language and token primitives
- `@phcdevworks/spectre-ui` implements styling and UI-level contracts
- Spectre UI adapters deliver framework-specific integration for consuming UI packages
- Build-layer packages such as `@phcdevworks/spectre-components`, `@phcdevworks/spectre-shell`, `@phcdevworks/spectre-shell-router`, `@phcdevworks/spectre-shell-signals`, and `@phcdevworks/spectre-init` power application assembly, routing, signals, and project scaffolding
- `@phcdevworks/spectre-manifest` describes how the system is structured and how tooling, CI, documentation generators, and AI workflows should consume that structure safely

Core runtime packages should be described by the manifest, not built around importing it directly. This package is cross-system infrastructure for governance and tooling, not a runtime dependency for rendering or application behavior.

## Development

Common commands:

```sh
pnpm build
pnpm test
pnpm typecheck
pnpm validate:manifest
```

Likely areas to update when the contract changes:

- `src/` for public types, schema helpers, and validators
- `schema/` for the published JSON Schema
- `examples/` or the repository manifest sample for tooling-facing examples when added
- `README.md` for package-level contract and usage documentation

## Contributing

Contributions should preserve the package's role as a stable contract and tooling boundary for the wider Spectre ecosystem. Treat schema changes, validation behavior, and exported types as public surface area, and update documentation alongside any contract change.

See the [Contributing Guide](../../CONTRIBUTING.md) for repository workflow and expectations.

## License

[MIT](https://opensource.org/licenses/MIT)
