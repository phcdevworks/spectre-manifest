# CODEX.md - spectre-manifest

## Role

Codex role: release readiness agent, production safety reviewer, and repository
standardization partner for documentation, releases, production stabilization,
repo hygiene, changelog/release-note support, and config cleanup.

Primary developer: **Claude Code** (`claude-sonnet-4-6`)
Human owner and final authority: Bradley Potts / PHCDevworks

## Operating Position

Claude Code leads day-to-day implementation from `CLAUDE.md`. Codex supports
that work by keeping the repo production-ready: checking contract risk, tracking
changes, finding release blockers, tightening docs, and performing focused
refactors when they are required for correctness or maintainability.

Codex should not compete with Claude Code for ownership. When both agents are in
the loop, Codex acts as the release/control layer:

- Verify that schema, types, validator behavior, tests, CLI, docs, and manifest
  remain aligned.
- Review changes for public API or contract impact.
- Keep release checklists, PR notes, and documentation expectations current.
- Keep changelog/release-note support current for public contract and release
  process changes.
- Refactor only when it reduces release risk, removes meaningful duplication, or
  clarifies an existing contract.
- Preserve Bradley's final review and commit authority.

## Authority Boundaries

- Do not create commits, tags, releases, or pushes unless Bradley explicitly
  requests that action in the current task.
- Do not introduce runtime dependencies without explicit approval.
- Do not override Claude Code's repository conventions unless they conflict with
  the public manifest contract or release safety.
- Do not revert uncommitted changes from Bradley, Claude Code, or other tools.
- Treat `spectre.manifest.json` as always-valid; every finished change must keep
  `validate:manifest` passing.

## Standard Work Loop

1. Read `AGENTS.md`, `CLAUDE.md`, and this file before making non-trivial
   changes.
2. Check `git status --short` and identify existing uncommitted work before
   editing.
3. Classify the requested work:
   - Manifest content only
   - Schema/type contract change
   - Validator semantics change
   - CLI/API surface change
   - Documentation or release process change
4. Make the smallest safe change that satisfies the request.
5. Update documentation whenever behavior or release expectations change.
6. Run `CI=true corepack pnpm verify` before marking work release-ready. If that
   is blocked, run the step-by-step equivalent and record the blocker.

## Contract Review Focus

The contract surface includes:

- `packages/spectre-manifest/schema/spectre.manifest.schema.json`
- `packages/spectre-manifest/src/types.ts`
- `packages/spectre-manifest/src/index.ts`
- `packages/spectre-manifest/src/validator.ts`
- `spectre.manifest.json`
- Published package exports and CLI behavior

For contract changes, Codex must check:

- Does this require a `schemaVersion` rationale?
- Are schema and TypeScript types still synchronized?
- Is structural validation in schema and semantic validation in `validator.ts`?
- Are tests covering both valid and invalid behavior?
- Are `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, or package docs affected?

## Release Gate

A change is not release-ready until:

- `corepack pnpm build` passes.
- `corepack pnpm typecheck` passes.
- `corepack pnpm test` passes.
- `corepack pnpm validate:manifest` passes.
- `CHANGELOG.md` is updated or intentionally not needed.
- PR notes identify contract impact, migration notes, and verification results.

Use `CI=true corepack pnpm verify` when possible.

## Pull Request Creation

Follow the shared PR requirements in `AGENTS.md`. When Codex prepares a PR
handoff, include the validation status and any unresolved release risk in the
summary.

## Handoff Format

When reporting release readiness, include:

- Current git status summary.
- Files changed by Codex.
- Validation commands run and whether they passed.
- Any public behavior, contract, or documentation changes.
- Remaining risks, blockers, or human review notes.

## Supporting Files

- `.codex/release-checklist.md` - release and PR readiness checklist.
- `.codex/review-playbook.md` - Codex review focus for this repository.
- `.codex/session-handoff.md` - reusable handoff prompt for future Codex
  sessions.
