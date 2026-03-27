# Contributing to Spectre Manifest

Thanks for helping improve Spectre Manifest. This repository is maintained by
PHCDevworks and provides the contract and schema tooling that keep the Spectre
suite aligned.

## Repository Role

This workspace exists to define and validate the machine-readable architecture
contract for Spectre.

- Package boundaries and relationships
- Schema validation and semantic validation
- Tooling defaults for CI, docs generation, and coding agents

It does not own design tokens, UI implementation, or framework adapters.

## Development Setup

1. Install dependencies with `pnpm install`.
2. Build the package with `pnpm build`.
3. Type-check with `pnpm typecheck`.
4. Validate the root manifest with `pnpm validate:manifest`.

## Contribution Guidelines

1. Keep contract changes explicit and documented.
2. Prefer additive evolution over breaking schema changes unless versioned
   intentionally.
3. Update validation logic, schema, and README guidance together when the public
   contract changes.
4. Keep wording aligned with the rest of the Spectre suite and PHCDevworks
   ownership.

## Pull Request Checklist

1. Keep the change focused.
2. Run `pnpm build`.
3. Run `pnpm typecheck`.
4. Run `pnpm validate:manifest`.
5. Update docs when public contract behavior changes.

## Code of Conduct

By participating in this project, you agree to follow the
[Code of Conduct](CODE_OF_CONDUCT.md).
