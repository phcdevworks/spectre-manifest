# Spectre Manifest Roadmap

`spectre-manifest` is the infrastructure layer that defines the machine-readable contract system for the Spectre ecosystem. It owns schema definitions, manifest validation tooling, and the contract authority that downstream packages reference to prove they are correctly wired into the Spectre system.

Its job is to make contracts enforceable, not to define UI behavior or package logic.

## 1. Current Repo Assessment

### Strengths

- `spectre.manifest.json` is in place as the root machine-readable contract anchor with `schemaVersion: "0.1"`.
- Full JSON Schema (draft 2020-12) with AJV validation covering structural and semantic rules.
- TypeScript types, validator, checker, and CLIs (`spectre-manifest-validate`, `spectre-manifest-check`) published as `@phcdevworks/spectre-manifest`.
- Passing test suite covering manifest validation (happy path, parse errors, schema errors, semantic checks) and downstream package compliance checks.
- CI pipeline on GitHub Actions running `pnpm verify` across Node 22 and 24.
- `CHANGELOG.md` documents contract releases in Keep a Changelog format.
- All core Spectre packages registered, including `@phcdevworks/spectre-base`
  (the renamed `spectre-wordpress-themes`).
- `spectre-manifest-diff` CLI classifies manifest changes as additive,
  semantic, or breaking.
- `spectre.manifest.json` is published via a `./manifest` export alongside
  the existing `./schema` export.

### Remaining gaps

None. All phases are complete; future work is demand-driven only.

## 2. Roadmap

## P0: Contract Authority / Must-Do

### P0.1 Manifest Schema Versioning ✓ Complete

`schemaVersion: "0.1"` is declared in both `spectre.manifest.json` and the JSON Schema. Validation fails on missing or unrecognized versions.

### P0.2 Full Package Coverage in the Manifest ✓ Complete

All active Spectre packages are registered. `spectre-wordpress-themes` was renamed to `@phcdevworks/spectre-base` (<https://github.com/phcdevworks/spectre-base>) and is registered with role `wordpress-theme-foundation`.

### P0.3 CI Pipeline ✓ Complete

GitHub Actions workflow at `.github/workflows/ci.yml` runs `pnpm verify` (build, typecheck, test, validate:manifest) on every push and pull request against Node 22 and 24. Add a CI badge to `README.md` when the repository is public.

### P0.4 Downstream Consumer Validation Tooling ✓ Complete

The `spectre-manifest-check` CLI (backed by `checkPackageAgainstManifest` in `src/checker.ts`) lets a downstream package validate its `package.json` against its manifest entry — checking registration, declared exports, and Spectre dependency declarations. The validation flow is documented in `README.md` and `CONTRIBUTING.md`, and `@phcdevworks/spectre-init` wires it into its `check:ecosystem` script alongside `spectre-manifest-validate`.

## P1: Maintainer and Consumer Clarity

### P1.1 Document Manifest Structure for Contributors ✓ Complete

Manifest entry structure, a template entry, and validation instructions are documented in `README.md` and `CONTRIBUTING.md`.

### P1.2 Manifest Changelog ✓ Complete

`CHANGELOG.md` is in place in Keep a Changelog format, documenting contract additions, updates, and deprecations starting with the 1.0.0 release.

## P2: Controlled Improvement — Complete

### P2.1 Automated Package Contract Diffing ✓ Complete

`spectre-manifest-diff` CLI (`packages/spectre-manifest/src/diff-cli.ts`, `differ.ts`)
compares two manifest files and classifies every change as additive, semantic, or breaking.
Exits non-zero on breaking changes. `diffManifests` / `formatManifestDiff` exported from
the public API for programmatic use. Covered by `test/differ.test.mjs`.

### P2.2 Public Manifest Registry Evaluation ✓ Complete

Decision recorded in `DECISION-manifest-distribution.md`: ship `spectre.manifest.json`
from the existing `@phcdevworks/spectre-manifest` package via a new `./manifest` export
(mirrors `./schema`). Keeps schema and manifest versioned together and pinnable through
the existing npm dependency. Follow-up implemented: the `./manifest` export is live,
`spectre.manifest.json` is copied into the package during `pnpm build` and shipped in the
npm tarball via `files`, and usage is documented in `README.md`.

## 3. Explicitly Out of Scope

- Do not define UI behavior or component structure here
- Do not add package-specific logic here — this is schema and validation infrastructure only
- Do not absorb token generation or CSS output into this repository

## 4. Recommended Execution Order

1. ~~Schema versioning~~ ✓
2. ~~Full package coverage~~ ✓
3. ~~CI pipeline~~ ✓
4. ~~Downstream consumer validation tooling~~ ✓
5. ~~Document manifest structure for contributors~~ ✓
6. ~~Manifest changelog~~ ✓
7. ~~Contract diffing tooling~~ ✓ (`spectre-manifest-diff` CLI)
8. ~~Evaluate public registry~~ ✓ (decision: `./manifest` export from existing package)

All phases complete. No active roadmap items. Future work is demand-driven only.
