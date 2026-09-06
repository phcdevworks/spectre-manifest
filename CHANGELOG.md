# Changelog

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versioning reflects schema and contract releases.

## [Unreleased]

## [1.3.0] - 2026-09-06

**Release Title:** Toolchain and Packed Package Verification

Contract change type: additive

### Changed

- Upgraded the pinned package manager to pnpm 12.3.4 and regenerated its lockfile; removed the obsolete Node 26 types release-age exception.
- Pinned CI actions to reviewed release commits for checkout v7.0.1, setup-node v7.0.0, and pnpm/action-setup v6.1.0.
- Aligned development type definitions with Node 22 and expanded CI to Node 22.13.0, current Node 22, and Node 24.

### Added

- Added a packed-install validation gate that checks public imports, TypeScript declarations, bundled schema and manifest data, and all three installed CLI commands from a temporary consumer.
- Included root TypeScript tooling scripts in typechecking and documented the expanded verification gate.

### Compatibility

- `schemaVersion` remains `0.1`; runtime dependencies, public exports, manifest validation semantics, and supported Node versions are unchanged. These additions strengthen development and release validation. The packed-install gate requires registry access and runs without install lifecycle scripts.

## [1.2.0] - 2026-09-06

**Release Title:** Package Check and Contract Diff Corrections

Contract change type: semantic change

### Fixed

- Package export checks recognize string, array, and conditional root exports, report missing declared subpaths, and reject null targets as unavailable.
- Package checks return structured diagnostics for malformed package metadata instead of throwing, and require an own manifest entry for registration.
- Manifest diffs classify introducing `allowedTargets` restrictions as breaking and removing all restrictions as additive, matching the validator's treatment of absent and empty lists.

### Validation and compatibility

- Added regression tests for export forms, malformed metadata, target restriction transitions, and CLI JSON output and exit codes.
- `schemaVersion` remains `0.1`: schema, exported types, and manifest validation semantics are unchanged. These are checker and diff correctness fixes; downstream compliance and diff gates may now fail for missing exports or newly introduced restrictions that previously passed incorrectly.

## [1.1.0] - 2026-07-08

Release Title: Phase 2 - Manifest Distribution Export

Contract change type: additive

### Added

- **Manifest Export**: Added `./manifest` subpath export shipping `spectre.manifest.json` from the published package (mirrors the existing `./schema` export), per `DECISION-manifest-distribution.md`. The manifest is copied into the package directory as part of `pnpm build` and included in the npm tarball via `files`.

## [1.0.0] - 2026-06-04

Release Title: Phase 0 - Initial Contract Authority Release

### Added

- **Schema**: Published JSON Schema (draft 2020-12) for `spectre.manifest.json` — defines package roles, layer membership, and dependency rules across the Spectre ecosystem.
- **Schema Versioning**: Added `schemaVersion` field (`"0.1"`) to manifest and schema, with validation rejecting missing or unrecognized versions.
- **TypeScript Types**: Added `SpectreManifest` and related types in `src/types.ts` as the public TypeScript contract surface.
- **Validator**: Added schema and semantic validation in `src/validator.ts` — structural validation via ajv, cross-reference checks (unknown layers, cycles) via `collectSemanticIssues`.
- **CLI**: Added `spectre-manifest-validate` binary for validating `spectre.manifest.json` in consuming repositories.
- **Tests**: Added 16 Node test suite tests covering schema validation, semantic checks, and CLI integration.
- **CI**: Added `.github/workflows/ci.yml` — runs `pnpm verify` on Node 22 and 24 across push and PR events.
- **Manifest Coverage**: Added manifest entries for all current Spectre packages across layers 1–7.

[unreleased]: https://github.com/phcdevworks/spectre-manifest/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/phcdevworks/spectre-manifest/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/phcdevworks/spectre-manifest/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/phcdevworks/spectre-manifest/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/phcdevworks/spectre-manifest/tree/1.0.0
