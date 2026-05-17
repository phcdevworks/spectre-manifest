# Spectre Manifest Agent Guide

## Agent Boundaries (Source of Truth)

- **Claude Code**: lead developer and primary implementation owner.
- **Codex**: documentation, releases, production stabilization, repo hygiene,
  and config standardization.
- **GitHub Copilot**: general development support assistant.
- **Google Jules**: automated maintenance for small fixes, dependency updates,
  and micro-updates.

These roles are intentionally non-competing. If guidance appears to conflict,
follow this order: `AGENTS.md` -> `CLAUDE.md` for implementation direction ->
`CODEX.md` for release/readiness direction.

## Primary AI Developer

**Claude Code** (`claude-sonnet-4-6`) is the designated primary AI developer for
this repository, maintained on behalf of Bradley Potts
(brad.potts@coastdigitalgroup.com) at PHCDevworks. All development is driven
through Claude Code operating from `CLAUDE.md` as the authoritative working
guide. Human final review and commit authority rests with Bradley Potts.

Claude Code does not create git commits. Changes are prepared and validated,
then handed off for human review and commit.

When Claude Code is active in this repo:

- It owns the full development cycle: schema, types, validator, tests, CLI, and
  docs.
- It runs `corepack pnpm verify` (or the step-by-step equivalent) before
  marking any change done.
- It treats `spectre.manifest.json` as always-valid — the manifest must pass
  `validate:manifest` at every commit.
- It does not introduce new runtime dependencies without explicit approval.

## Codex Release Agent

**Codex** is available as the release readiness and production safety agent for
this repository. Codex works from `CODEX.md` and supports Claude Code by keeping
changes reviewable, contract-safe, documented, and ready for Bradley's final
human review.

When Codex is active in this repo:

- Claude Code remains the primary AI developer and implementation lead.
- Codex checks public contract impact, release risk, documentation coverage, and
  validation results.
- Codex may perform focused refactors when required for correctness,
  maintainability, or documentation standardization.
- Codex does not create commits, tags, pushes, or releases unless Bradley
  explicitly requests that action.
- Codex tracks existing uncommitted work and does not revert changes it did not
  make.

## GitHub Copilot Support Assistant

GitHub Copilot is the default in-IDE support layer for fast, local developer
productivity. It provides:

- inline code completion
- small code suggestions
- test suggestions
- TypeScript assistance
- API usage hints
- refactor suggestions
- pattern-aware implementation help

Copilot does not own implementation leadership, architecture direction, release
coordination, production stabilization ownership, repository-wide AI governance,
or automated maintenance workflows.

## Google Jules Maintenance Agent

Google Jules handles narrowly-scoped automated maintenance only:

- small fix PRs
- dependency updates
- micro-updates

Jules does not own architecture, implementation leadership, or release
coordination.

## Mission

Keep the Spectre manifest accurate, versionable, and safe for people and tools
to consume. Schema and validation behavior are the public contract surface of
this repository — treat them accordingly.

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
