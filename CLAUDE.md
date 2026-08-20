# CLAUDE.md - spectre-manifest

## Verified TODO Completion Workflow

For every TODO item Claude Code completes, use this sequence in the same change:

1. Keep the item in `TODO.md` while implementation or verification is in progress.
2. Confirm every acceptance criterion is met and the repository's required tests and validation gate pass.
3. Only after verification passes, remove the completed item from `TODO.md` immediately; do not leave it active or checked off.
4. Update `CHANGELOG.md` under `[Unreleased]` as usual, update the applicable `ROADMAP.md` shipped/status table and phase text, and update every other affected status or dependency reference.

If implementation is incomplete or any required check fails, keep the TODO item open and do not describe the work as shipped.

Primary AI maintainer: **Claude Code** (claude-sonnet-4-6, Anthropic)
Human owner: PHCDevworks / brad.potts@coastdigitalgroup.com

## Git Access — Denied

**Claude Code has zero git access in this repo, as part of a companywide
policy.** Claude Code must not run `git commit`, `git push`, `git tag`, or
any other git command — read-only or mutating — here. This supersedes the
prior commit/push/tag grant described in [AGENTS.md](AGENTS.md). OpenAI
Codex now executes all git operations for this repo; see
[AGENTS.md](AGENTS.md) and [CODEX.md](CODEX.md).

When work is ready, Claude Code runs the validation flow below, then stops
short of any git command and hands off to Codex (or Bradley Potts) with a
summary of files changed and validation performed.

## Multi-Agent Team

Full roster, authority table, and PR requirements: [AGENTS.md](AGENTS.md).
Claude Code remains the lead implementation authority for schema, validation
logic, types, CLI, and tests. Resolve implementation conflicts by referencing
this file and `spectre.manifest.json`.

## Pull Request Creation

Claude Code prepares changes and, where the repo's workflow calls for a PR
rather than a direct push, hands off the branch/diff to Codex (or Bradley
Potts) to open it — Claude Code does not create commits, tags, or PRs
directly. PR creation still follows the process in `AGENTS.md`.

---

This file is Claude Code's primary reference for working in this repository.

## What This Repo Is

`@phcdevworks/spectre-manifest` is the machine-readable architecture contract for the Spectre ecosystem. It defines package roles, layer membership, dependency rules, and AI/tooling guidance in a single validated JSON file (`spectre.manifest.json`). The TypeScript package at `packages/spectre-manifest/` owns the JSON schema and all validation logic.

**Schema and validation behavior are public contract surface. Breaking changes require a new `schemaVersion`.**

## Development Commands

All commands run from the workspace root:

```bash
CI=true corepack pnpm install     # install (CI=true skips TTY prompt)
corepack pnpm build               # compile TypeScript
corepack pnpm typecheck           # type-check without emit
corepack pnpm test                # build + run Node test suite (cli, validator, checker, differ)
corepack pnpm validate:manifest   # build + validate spectre.manifest.json
corepack pnpm verify              # build + typecheck + test + validate (full suite)
```

> `pnpm verify` will fail in a non-TTY shell without `CI=true`. Use `corepack pnpm build && corepack pnpm typecheck && corepack pnpm test && corepack pnpm validate:manifest` as a workaround when needed.

The workspace root `package.json` also exposes `npm run check`, which wraps
`corepack pnpm verify` (`"check": "corepack pnpm verify"`). This is the
companywide-standard validation entry point — use it when a unified
`npm run check` is expected, and use the `corepack pnpm` commands above when
working step-by-step or debugging a single gate.

## File Map

| Path                                                            | Purpose                                          |
| --------------------------------------------------------------- | ------------------------------------------------ |
| `spectre.manifest.json`                                         | Root manifest — the living architecture contract |
| `packages/spectre-manifest/src/types.ts`                        | TypeScript types for the manifest                |
| `packages/spectre-manifest/src/schema.ts`                       | Schema loader (reads the JSON schema file)       |
| `packages/spectre-manifest/src/validator.ts`                    | Schema + semantic validation logic               |
| `packages/spectre-manifest/src/cli.ts`                          | CLI entrypoint (`spectre-manifest-validate`)     |
| `packages/spectre-manifest/src/index.ts`                        | Public API re-exports                            |
| `packages/spectre-manifest/schema/spectre.manifest.schema.json` | JSON Schema (draft 2020-12)                      |
| `packages/spectre-manifest/test/validator.test.mjs`             | Validator unit tests                             |
| `packages/spectre-manifest/test/cli.test.mjs`                   | CLI integration tests                            |
| `.github/workflows/ci.yml`                                      | CI — runs `pnpm verify` on Node 22 and 24        |

## Architecture Rules (don't violate these)

- **Schema and types must stay in sync.** Every field in `SpectreManifest` must map to a schema definition.
- **Semantic validation lives only in `validator.ts`.** Schema handles structural correctness; `collectSemanticIssues` handles cross-reference correctness (unknown layers, cycles, etc.).
- **The schema is a public export** (`@phcdevworks/spectre-manifest/schema`). Never restructure `$defs` in a way that breaks external references.
- **No new runtime dependencies** unless unavoidable — ajv and ajv-formats are the only runtime deps and that's intentional.
- **`spectre.manifest.json` must always pass `validate:manifest`** before a PR lands.

## What Constitutes Contract-Breaking Change

- Removing or renaming a top-level manifest field
- Changing `schemaVersion` enum values
- Changing the `ManifestSelector` or `DependencyTargetSelector` type patterns
- Removing exported types or functions from `src/index.ts`

Additive changes (new optional fields, new exported types) are backwards-compatible.

## Testing Approach

Tests are plain Node `node:test` assertions — no framework. Tests import from `dist/` so the build must be current. `corepack pnpm test` rebuilds automatically before running.

Always run `corepack pnpm validate:manifest` after editing `spectre.manifest.json`.

## Current Work Queue

See `TODO.md` for the current open P0/P1/P2 task queue; shipped status belongs
in `ROADMAP.md` and `CHANGELOG.md`.
See `ROADMAP.md` for the full strategic roadmap with context and acceptance criteria.

## What This Package Does Not Own

Shared ownership boundaries live in `AGENTS.md`. Claude Code must keep this
package focused on schema, validation, manifest contract enforcement, and
supporting tooling — not UI behavior, token generation, or downstream package
runtime code.
