# @phcdevworks/spectre-manifest

`@phcdevworks/spectre-manifest` is the machine-readable contract layer for the Spectre ecosystem. It captures system structure, package boundaries, dependency rules, and AI/tooling guidance so humans, CLIs, CI, docs generators, and coding agents can work from the same source of truth.

## Scope

- system metadata and manifest versioning
- official layer registry and package registry
- package-level dependency and boundary governance
- AI/tooling entrypoints, generation rules, and safe defaults
- JSON Schema validation plus light semantic validation

## Non-goals

- UI rendering or runtime visualization
- component prop, token, or route-level modeling
- framework adapters
- runtime orchestration behavior

## Package Layout

- `src/types.ts`: TypeScript-first contract definitions
- `src/validator.ts`: schema + semantic validator
- `src/cli.ts`: CLI entrypoint for CI and local checks
- `schema/spectre.manifest.schema.json`: JSON Schema for editor and tool validation
- repository root `spectre.manifest.json`: example manifest for the current Spectre package map

## Usage

```sh
pnpm install
pnpm build
pnpm validate:manifest
```

Programmatic usage:

```ts
import { validateManifestFile } from "@phcdevworks/spectre-manifest";

const result = await validateManifestFile("spectre.manifest.json");

if (!result.valid) {
  console.error(result.issues);
}
```

## Future Use Cases

- `spectre-init`: bootstrap new workspaces and packages from manifest-aware defaults
- CI validation: block invalid dependency direction, bad layer assignments, and malformed contract changes
- AI/codegen: choose preferred package entrypoints and apply safe defaults before generating code
- docs generation: derive package maps, layer diagrams, and usage guidance from one source
