# Changelog

All notable changes to this project will be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versioning reflects schema and contract releases.

## [Unreleased]

## [1.0.0] - 2026-06-04

Release Title: Initial Contract Authority Release

### Added

- **Schema**: Published JSON Schema (draft 2020-12) for `spectre.manifest.json` — defines package roles, layer membership, and dependency rules across the Spectre ecosystem.
- **Schema Versioning**: Added `schemaVersion` field (`"0.1"`) to manifest and schema, with validation rejecting missing or unrecognized versions.
- **TypeScript Types**: Added `SpectreManifest` and related types in `src/types.ts` as the public TypeScript contract surface.
- **Validator**: Added schema and semantic validation in `src/validator.ts` — structural validation via ajv, cross-reference checks (unknown layers, cycles) via `collectSemanticIssues`.
- **CLI**: Added `spectre-manifest-validate` binary for validating `spectre.manifest.json` in consuming repositories.
- **Tests**: Added 16 Node test suite tests covering schema validation, semantic checks, and CLI integration.
- **CI**: Added `.github/workflows/ci.yml` — runs `pnpm verify` on Node 22 and 24 across push and PR events.
- **Manifest Coverage**: Added manifest entries for all current Spectre packages across layers 1–7.

[unreleased]: https://github.com/phcdevworks/spectre-manifest/compare/1.0.0...HEAD
[1.0.0]: https://github.com/phcdevworks/spectre-manifest/tree/1.0.0
