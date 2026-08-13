# COPILOT.md - spectre-manifest

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

## Role Summary

GitHub Copilot is a support assistant for implementation help, inline
suggestions, docs support, and small refactors. Copilot does not own release
control or architecture.

## Authority Boundaries

Full roster and authority table: [AGENTS.md](AGENTS.md). Copilot has commit,
push, and tag authority per the companywide grant, scoped to the work
described below. Bradley Potts holds final authority for merges, publishing,
and releases.

## Package Boundary

Keep work inside manifest contract scope: schema, validator semantics, manifest
types, CLI validation behavior, and supporting docs/tests.

Do not add downstream package runtime behavior here.

## Allowed Work

- Small and medium implementation support tasks.
- Focused refactors for clarity/correctness.
- Documentation and README updates tied to behavior/export changes.
- PR and issue workflow quality support.

## Restricted Work

- Do not replace Claude Code as lead implementation owner.
- Do not override Codex release-readiness decisions.
- Do not publish packages, merge PRs, or cut releases.
- Do not broaden scope beyond manifest contract management.

## Validation

Primary gate: `corepack pnpm verify`.

If verification fails, report the failing command and likely cause, then propose
the smallest safe fix.

## Documentation Expectations

Keep `README.md`, `CHANGELOG.md`, schema/API documentation, and GitHub templates
consistent with the implemented contract.

## Pull Request Creation

Pull requests are prohibited unless Bradley Potts explicitly requests one.
The guidance below applies only to that explicit exception.

Follow the shared PR requirements in `AGENTS.md`.

## PR and Issue Support

PRs should include contract impact, validation result, package-boundary check,
and release impact to support Codex handoff.

## Source of Detailed Guidance

Primary Copilot guidance lives in `.github/copilot-instructions.md`.
Shared repo boundaries live in `AGENTS.md`.
