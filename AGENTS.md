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

**All AI agents in this roster** — Claude Code, OpenAI Codex, GitHub Copilot,
and Google Jules — have full commit, push, and tag authority in this
repository, effective 2026-07-25 by explicit direction from Bradley Potts —
see the Commit Policy section in each agent's own guide
([CLAUDE.md](CLAUDE.md), [CODEX.md](CODEX.md), [COPILOT.md](COPILOT.md),
[JULES.md](JULES.md)). **OpenAI Codex** additionally has release authority:
Codex cuts releases autonomously — version bump, changelog versioning,
`v<version>` git tag, and GitHub Release publish via `gh` — for every
release-ready `CHANGELOG.md [Unreleased]` section, without waiting for
per-release approval; see `CODEX.md` "Release Gate" for the full procedure.
**npm publishing remains Bradley Potts's sole authority** — no agent runs
`npm publish`. Bradley Potts retains ultimate ownership and can revoke or
narrow any of this at any time. This grant covers git and release
operations within each agent's own scope of work as defined above — it does
not expand what any agent is authorized to decide otherwise. ChatGPT has no
repository access and is excluded.

**A commit is not finished until it is pushed.** Every agent in this roster
must push immediately after committing (`git push`, including any needed
`-u`/tags) as part of the same action — never leave a commit sitting local
only. This closes a recurring gap where an agent commits and stops short of
pushing, leaving work stranded on the machine.

**Commit authorship is human-only.** No agent adds itself (or any other AI)
as a commit author or co-author — no `Co-Authored-By: Claude`/`Codex`/
`Copilot`/`Jules` trailer, no author-field changes, in this repository. The
git author/committer stays Bradley Potts (or the configured human git user)
on every commit, regardless of which agent performed the work. Push and tag
authority above does not extend to authorship attribution.


## Cross-Repo Access

This repo may be worked on standalone or alongside any combination of other
PHCDevworks repos — do not assume the company root or sibling project areas
are present. The following rules are self-contained and apply whether or not
that broader context is available.

**File access.** An agent working in this repo has full read/write access to
every file in this repo. When this repo is present alongside other
PHCDevworks repos (company root or sibling `project-*` areas), the same full
read/write access extends to those repos too — there is no per-repo access
restriction anywhere in this workspace. What differs repo-to-repo is not
*access*, it's *editorial ownership*: each repo's own `CLAUDE.md`/`AGENTS.md`
still governs what changes make sense there (design-token authority, layer
boundaries, etc.) — being able to open and edit a file is not the same as it
being this repo's job to change it.

**Cross-repo changelog and TODO/roadmap requests.** Full rules: company root
[AGENTS.md](../../AGENTS.md) § "Cross-Repo Changelog Sync" and § "Upstream
Requests and Roadmap Self-Expansion." Applied here without exception — this
repo may append `[Unreleased]` changelog entries and downstream TODO requests
to other present repos per those rules, and no AI agent creates commits, tags,
publishes packages, or merges changes in this repo or any other unless that
repo's own agent guide explicitly grants that authority.

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

## Agent-Specific Guides

- `CLAUDE.md` - primary development authority and implementation workflow.
- `CODEX.md` - documentation, release, stabilization, and repo hygiene workflow.
- `JULES.md` - bounded automated maintenance workflow.
- `COPILOT.md` and `.github/copilot-instructions.md` - support-assistant workflow.

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

## Confidential External Identities

Never record external customer, vendor, user, client-site, or private-project
identities in tracked files, git metadata, reviews, releases, issues, or
handoffs. Use anonymous role-based wording such as "a downstream integration"
or "a production consumer." Public package and platform names are allowed
only when technically required to identify a dependency or supported
integration.

**Zero tolerance, no exceptions.** This is not a case-by-case judgment call.
Every upstream vendor, customer, client, or third-party identity — regardless
of how well-known, already public, or seemingly harmless — is forbidden from
appearing in any file, commit, tag, branch name, PR, issue, roadmap, TODO, or
agent output anywhere in this repo. If a vendor name is already present
anywhere in tracked files, it must be anonymized on sight, not left in place
because it predates this rule.

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
