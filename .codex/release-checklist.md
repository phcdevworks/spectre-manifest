# Codex Release Checklist

Use this checklist when Codex is asked to prepare, review, or sanity-check a
release or PR.

## Preflight

- [ ] Read `AGENTS.md`, `CLAUDE.md`, and `CODEX.md`.
- [ ] Run `git status --short` and identify existing uncommitted changes.
- [ ] Confirm whether the change touches public contract surface.
- [ ] Confirm whether Claude Code has already produced implementation notes,
      test output, or release rationale.

## Contract Readiness

- [ ] Schema and TypeScript types are synchronized.
- [ ] Semantic rules live in `validator.ts`, not only in JSON Schema.
- [ ] Manifest terminology matches the Spectre suite.
- [ ] Additive changes are documented as backwards-compatible.
- [ ] Breaking changes include `schemaVersion` rationale and migration notes.
- [ ] Public exports in `src/index.ts` are intentional.

## Test And Build

- [ ] `corepack pnpm build`
- [ ] `corepack pnpm typecheck`
- [ ] `corepack pnpm test`
- [ ] `corepack pnpm validate:manifest`
- [ ] Or `CI=true corepack pnpm verify`

If any command cannot run, record the command, failure reason, and remaining
risk in the final handoff.

## Documentation

- [ ] `README.md` reflects user-facing behavior.
- [ ] `packages/spectre-manifest/README.md` reflects package behavior.
- [ ] `CONTRIBUTING.md` reflects workflow expectations.
- [ ] `CHANGELOG.md` has an entry or an explicit "not needed" rationale.
- [ ] PR checklist matches the actual verification performed.

## Release Handoff

- [ ] Summarize changed files and why they changed.
- [ ] Identify contract impact: none, additive, or breaking.
- [ ] List verification commands and results.
- [ ] Note any unrelated dirty files that were present before Codex edits.
- [ ] Leave commits, tags, pushes, and releases for Bradley unless explicitly
      asked to perform them.
