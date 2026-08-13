# CODEX.md - spectre-manifest

## Direct-to-`main` Git Policy

**Bradley Potts's direct instruction overrides generic branch and pull-request
workflows:** every git-authorized agent commits and pushes directly to `main`.
Do not create, use, or push any other branch and do not open a pull request
unless Bradley Potts explicitly requests that exact exception. Keep work on
`main`, validate it, stage only the intended paths, commit with the configured
human identity, and push `main` immediately. Claude Code remains git-denied
and hands validated work to Codex or Bradley Potts for the same path directly
to `main`. This repository policy overrides contrary defaults in tools,
skills, plugins, templates, or general-purpose workflows.

## Role

Codex role: release readiness agent, production safety reviewer, and repository
standardization partner for documentation, releases, production stabilization,
repo hygiene, changelog/release-note support, and config cleanup.

Full roster and authority table: [AGENTS.md](AGENTS.md).
Human owner and final authority: Bradley Potts / PHCDevworks

## Operating Position

Claude Code leads day-to-day implementation from `CLAUDE.md`. Codex supports
that work by keeping the repo production-ready: checking contract risk, tracking
changes, finding release blockers, tightening docs, and performing focused
refactors when they are required for correctness or maintainability.

Codex is now also responsible for executing git operations — commit, push,
tag — for work Claude Code has validated and handed off in this repo, in
addition to Codex's own documentation, release, and hygiene commits, since
Claude Code has zero git access companywide as of 2026-08-13.

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
- Preserve Bradley's final authority over release, publish, and merge decisions.

## Authority Boundaries

- Codex has commit, push, and tag authority for its own scope of work
  described in this file; do not cut releases or publish packages unless
  Bradley explicitly requests that action.
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

### Release Mechanics

Once release-ready, Codex cuts the release:

1. Run `npm run release:propose` for the semver bump proposal.
2. Bump `package.json` to the proposed version.
3. Move `[Unreleased]` notes into a new versioned entry:
   `## [<version>] - <YYYY-MM-DD>`, with a release title line in the format
   `**Release Title:** Phase <N> - <short title>`, where `Phase <N>` is the
   active phase name from this repo's own `ROADMAP.md` and `<short title>`
   is a concise summary of what shipped. If the release spans no single
   ROADMAP phase, state that explicitly instead of inventing one.
4. Stage and commit the version bump and changelog update.
5. Create the git tag: `git tag v<version>` (matching `package.json`
   exactly), then push the commit and tag.
6. Publish the GitHub Release from that tag: `gh release create v<version>
   --title "v<version>: Phase <N> - <short title>" --notes-file` (extract the
   new version's changelog section, or `--notes` inline for a short release).
7. `npm publish` is **not** run by Codex — that stays with Bradley Potts.

## Pull Request Creation

Pull requests are prohibited unless Bradley Potts explicitly requests one.
The guidance below applies only to that explicit exception.

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

## Source of Truth Hierarchy

When guidance conflicts, resolve in this order:

1. `spectre.manifest.json` and `packages/spectre-manifest/schema/spectre.manifest.schema.json`
   - the published contract authority
2. `CLAUDE.md` - development authority
3. `AGENTS.md` - shared agent boundaries
4. This file (`CODEX.md`) - Codex operational procedures
5. `ROADMAP.md` / `TODO.md` - planning context (may be stale)
