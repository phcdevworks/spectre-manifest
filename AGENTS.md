# AGENTS.md - spectre-manifest

## Repository Snapshot

| Field | Value |
|-------|-------|
| Project team | `project-shell` |
| Repository role | Spectre manifest schema and contract tooling |
| Package/artifact | `@phcdevworks/spectre-manifest` |
| Validation gate | `npm run check` (wraps `corepack pnpm verify`) |

## Standard Authority Model

| Agent | Role | Authority |
|-------|------|-----------|
| Claude Code | Lead implementation and validation | [CLAUDE.md](CLAUDE.md) |
| OpenAI Codex | Documentation, release readiness, stabilization, and repo hygiene | [CODEX.md](CODEX.md) |
| ChatGPT | Strategy, coordination, prompt design, and external review | Support only |
| GitHub Copilot | Development assistance | [COPILOT.md](COPILOT.md) |
| Google Jules | Bounded automated maintenance | [JULES.md](JULES.md) |

Bradley Potts holds final authority for commits, merges, tags, publishing, and
releases.

## Standard Handoff

Every AI-prepared change should report files changed, validation performed,
public behavior or contract impact, and unresolved risks. Do not edit generated
outputs directly. Do not update [CHANGELOG.md](CHANGELOG.md) unless the change
is release-relevant.

## Instruction Map

| File                              | Audience                     | Purpose                                                            |
| --------------------------------- | ---------------------------- | ------------------------------------------------------------------ |
| `AGENTS.md`                       | All agents, especially Codex | Central role model, coordination rules, verification gate          |
| `CLAUDE.md`                       | Claude Code                  | Lead-development guide for implementation, architecture, and tests |
| `CODEX.md`                        | OpenAI Codex                 | Release-readiness, production stabilization, and config posture    |
| `JULES.md`                        | Google Jules                 | Bounded automated maintenance guidance                             |
| `.codex/`                         | OpenAI Codex                 | Release checklist, review playbook, reusable handoff prompt        |
| `COPILOT.md`                      | GitHub Copilot               | Role summary and development boundaries for GitHub Copilot         |
| `.github/copilot-instructions.md` | GitHub Copilot               | In-editor suggestion boundaries                                    |
| `.claude/settings.json`           | Claude Code runtime          | Local command denies for commit, push, tag, merge, and publish     |
| `.coderabbit.yaml`                | CodeRabbit                   | Automated review checks aligned with package boundaries            |
| `.github/dependabot.yml`          | Dependabot / Jules handoff   | Dependency-update cadence for automated maintenance                |

## OpenAI Codex - Documentation & Releases

**OpenAI Codex** is the documentation, release-readiness, production
stabilization, repo-hygiene, and config-standardization agent for this
repository. Codex works from `AGENTS.md`, `CODEX.md`, and the supporting files
under `.codex/`.

When Codex is active in this repo:

- Claude Code remains the primary AI developer and implementation lead.
- Codex checks public contract impact, release risk, documentation coverage, and
  validation results.
- Codex may perform focused refactors when required for correctness,
  maintainability, documentation standardization, or release-risk reduction.
- Codex does not create commits, tags, pushes, merges, publishes, or releases
  unless Bradley explicitly requests that action.
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
automated maintenance workflows, config standardization ownership, or commit
authority.

## Google Jules Maintenance Agent

Google Jules handles narrowly-scoped automated maintenance only:

- small fix PRs
- dependency updates
- micro-updates

Jules does not own architecture, implementation leadership, feature work,
public contract changes, large refactors, release coordination, or publishing.

## Coordination Rules

- When instructions conflict, follow this priority: direct human request,
  `AGENTS.md`, agent-specific file, then tool suggestions.
- Claude Code leads any change that alters schema behavior, validator
  semantics, package exports, CLI behavior, tests, or the manifest public
  contract.
- Codex keeps production readiness in check and leads documentation, release
  notes, release preparation, stabilization review, repo hygiene, and AI/config
  cleanup.
- Copilot output is advisory only; accepted suggestions still follow the owning
  agent or human reviewer.
- Jules and Dependabot changes should stay mechanical and easy to review.
  Escalate behavior changes to Claude Code and release/changelog questions to
  Codex.
- Keep handoffs short: summarize changed files, validation status, contract
  impact, and unresolved risk.

## Pull Request Creation

Every agent that opens a PR must populate every section of the repo's PR
template (`.github/pull_request_template.md`):

- **Summary** - linked issue (or `N/A`), what changed, why it was needed.
- **Type of Change** - check every box that applies.
- **Package Boundary Check** - confirm the change stays within manifest
  contract and tooling scope, with no drift into downstream runtime behavior.
- **Public API Impact** - state whether the schema, types, validator, or CLI
  contract changed, and whether a `schemaVersion` rationale is required.
- **Validation** - record the command run (`corepack pnpm verify` /
  `npm run check`) and its result.
- **Documentation Updated**, **Release Impact**, **Codex Review Needed**, and
  **Claude Code Implementation Notes** - complete each checklist item.

Never submit a PR with an empty body or only the template headings left
unfilled.

## Upstream Requests and Roadmap Self-Expansion

Full directive: project-team [AGENTS.md](../AGENTS.md) "Upstream Requests and
Roadmap Self-Expansion." Applied to this repo:

- This repo is cross-cutting infrastructure — it has no upstream dependency
  on any other `project-shell` repo within this workspace; do not invent one.
- Downstream repos `spectre-shell`, `spectre-shell-router`,
  `spectre-shell-signals`, and `spectre-init` all consume this package as a
  devDependency for `check:ecosystem`. They may append schema or validator
  requests (e.g. a new manifest field, layer, or dependency-target selector)
  to this repo's own `TODO.md` under `## Requested by Downstream`, dated and
  linked back to the requesting repo's TODO.md/ROADMAP.md. Keep that section
  visible and separate from self-planned schema work.
- This repo's own `ROADMAP.md` may be proactively expanded with new or
  reordered phases by the agent's own analysis — but never mark a phase
  delivered without `corepack pnpm verify` (exposed as `npm run check`)
  passing, and never ship a breaking schema/validator change without a
  `schemaVersion` bump rationale (see "What Constitutes Contract-Breaking
  Change" in `CLAUDE.md`).
- Surface any new TODO request or roadmap expansion in the handoff for Bradley
  Potts in the same change it was made, and reflect cross-repo-relevant
  changes in the project-team's own ROADMAP.md/TODO.md.

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
7. All workspace-root `scripts/` tooling is TypeScript (`.ts`), run via
   `node --experimental-strip-types`; never add a new `.js`/`.mjs` script.

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
