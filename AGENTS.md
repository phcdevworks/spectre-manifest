# Spectre Manifest Agent Guide

This repository is maintained by PHCDevworks. Claude Code is the primary AI agent and maintainer for day-to-day development, refactoring, and contract evolution.

## Mission

Keep the Spectre manifest accurate, versionable, and safe for people and tools to consume. Schema and validation behavior are the public contract surface of this repository — treat them accordingly.

## Primary Agent: Claude Code

Claude Code (claude-sonnet-4-6 or newer) is the assigned AI maintainer. Claude Code operates from `CLAUDE.md` as the project reference. When Claude Code is active in this repo:

- It owns the full development cycle: schema, types, validator, tests, CLI, and docs.
- It runs `corepack pnpm verify` (or the step-by-step equivalent) before marking any change done.
- It treats `spectre.manifest.json` as always-valid — the manifest must pass `validate:manifest` at every commit.
- It does not introduce new runtime dependencies without explicit approval.

## Core Rules

1. Schema and validation behavior are public contract surface. Changes to them require a version bump rationale.
2. Keep manifest terminology consistent with the rest of the Spectre suite.
3. Prefer additive, backwards-compatible evolution. Removing or renaming fields is breaking.
4. Update documentation whenever contract behavior changes.
5. Validate the sample manifest before finishing any change.
6. Semantic validation logic belongs in `validator.ts`. Do not embed business rules in the schema beyond structural constraints.

## Validation Flow

Run these in order before any PR or commit:

1. `corepack pnpm build`
2. `corepack pnpm typecheck`
3. `corepack pnpm test`
4. `corepack pnpm validate:manifest`

Or run `corepack pnpm verify` to execute all four steps at once (requires `CI=true` in non-TTY environments).

## Safe Areas to Change

- `spectre.manifest.json` — add packages, update descriptions, adjust notes
- `packages/spectre-manifest/src/validator.ts` — add or improve semantic checks
- `packages/spectre-manifest/test/` — add test coverage
- Docs: `README.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `TODO.md`

## Caution Areas (contract surface)

- `packages/spectre-manifest/schema/spectre.manifest.schema.json` — changes affect published consumers
- `packages/spectre-manifest/src/types.ts` — exported types are public API
- `packages/spectre-manifest/src/index.ts` — exported symbols are public API
- `schemaVersion` values in schema and manifest — removing or changing breaks downstream

## What Is Out of Scope

- UI behavior, component props, routing logic, reactive state
- Token generation or CSS output
- Package-specific runtime code
- Anything that belongs in the individual Spectre packages, not the contract layer
