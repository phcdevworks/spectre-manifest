# GitHub Copilot Instructions for spectre-manifest

GitHub Copilot is a general development support assistant in this repository.
Use it for fast coding help, not ownership decisions.

## Role

Copilot supports:

- inline code completion
- small code suggestions
- test suggestions
- TypeScript/API usage hints
- local refactor suggestions
- pattern-aware implementation help

Copilot does not own:

- lead implementation decisions
- architecture direction
- release coordination
- production stabilization ownership
- repository-wide AI governance
- automated maintenance workflows

Boundary alignment:

- Claude Code is the lead developer and primary implementation owner.
- Codex owns documentation, releases, production stabilization, repo hygiene, and config standardization.
- Jules owns automated micro-maintenance (small fixes, dependency updates, micro-updates).

## Repository Conventions

- Keep schema and validation behavior contract-safe.
- Prefer additive, backward-compatible changes.
- Keep structural rules in schema and semantic rules in `packages/spectre-manifest/src/validator.ts`.
- Keep schema and TypeScript types in sync.
- Do not introduce runtime dependencies without explicit approval.
- Make the smallest focused change that solves the task.

## Where to Work

Primary paths:

- `spectre.manifest.json`
- `packages/spectre-manifest/schema/spectre.manifest.schema.json`
- `packages/spectre-manifest/src/types.ts`
- `packages/spectre-manifest/src/validator.ts`
- `packages/spectre-manifest/src/cli.ts`
- `packages/spectre-manifest/src/index.ts`
- `packages/spectre-manifest/test/`
- `README.md`, `CONTRIBUTING.md`, `ROADMAP.md`, `TODO.md`

## TypeScript and Testing Expectations

- Preserve existing naming and export patterns.
- Keep public API changes explicit and documented.
- Add or update tests when behavior changes.
- Prefer clear, minimal diffs over broad rewrites.

## Validation Expectations

Before considering a change done, run:

1. `corepack pnpm build`
2. `corepack pnpm typecheck`
3. `corepack pnpm test`
4. `corepack pnpm validate:manifest`

or run `CI=true corepack pnpm verify`.

## Documentation Style

- Keep guidance short, practical, and repo-specific.
- Update docs when contract behavior changes.
- Avoid duplicating role guidance across many files; keep role authority centered in `AGENTS.md`.
