# COPILOT.md - spectre-manifest

## Copilot Role

GitHub Copilot is a support assistant for implementation help, inline
suggestions, docs support, and small refactors. Copilot does not own release
control or architecture.

## Team Relationship

- Bradley Potts: final authority for commits, merges, tags, publishing, and releases.
- Claude Code: lead implementation and architecture owner.
- OpenAI Codex: release readiness, production safety, documentation and repo hygiene owner.
- GitHub Copilot: supporting development assistant.
- Google Jules: automated micro-maintenance only (`JULES.md`).

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
