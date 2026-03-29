# Spectre Manifest Workspace

Spectre Manifest is a PHCDevworks-maintained workspace for the machine-readable
contract that describes Spectre package boundaries, architecture rules, and
tooling expectations.

This repository complements the rest of the Spectre suite by defining the
system-level contract that humans, CI pipelines, documentation tooling, and
coding agents can all share.

## Workspace Structure

- `packages/spectre-manifest/`: publishable package with schema, validator, and
  CLI entrypoints
- `spectre.manifest.json`: root manifest example for the current package map
- `tsconfig.base.json`: shared TypeScript baseline for workspace packages

## Quick Start

```sh
corepack pnpm install
corepack pnpm verify
```

## Related Spectre Packages

- `@phcdevworks/spectre-tokens`: design token source of truth
- `@phcdevworks/spectre-ui`: framework-agnostic UI layer
- `@phcdevworks/spectre-ui-astro`: Astro adapter for Spectre UI
- `@phcdevworks/spectre-manifest`: architecture contract, schema, and validation

## Documentation

- [Package README](packages/spectre-manifest/README.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
