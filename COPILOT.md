# COPILOT.md - spectre-manifest

## Copilot Role

GitHub Copilot is a support assistant for implementation help, inline
suggestions, docs support, and small refactors. Copilot does not own release
control or architecture.

## Authority Boundaries

- Claude Code remains lead implementation owner (`CLAUDE.md`).
- Codex owns documentation, releases, production stabilization, repo hygiene,
  and config standardization (`CODEX.md`).
- Jules owns bounded automated maintenance (`JULES.md`).
- Bradley Potts holds final authority for all commits, merges, tags, and
  releases.

Shared repo boundaries and the full agent roster live in `AGENTS.md`.

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
- Do not publish, merge, tag, or release.
- Do not broaden scope beyond manifest contract management.

## Validation Expectations

Primary gate: `corepack pnpm verify`.

If verification fails, report the failing command and likely cause, then propose
the smallest safe fix.

## Documentation Expectations

Keep `README.md`, `CHANGELOG.md`, schema/API documentation, and GitHub templates
consistent with the implemented contract.

## PR and Issue Support

PRs should include contract impact, validation result, package-boundary check,
and release impact to support Codex handoff.
