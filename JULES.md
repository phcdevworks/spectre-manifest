# JULES.md - spectre-manifest

## Role

Google Jules is the scheduled maintenance agent for
`@phcdevworks/spectre-manifest`. Jules handles small, bounded maintenance that
keeps the manifest workspace clean without taking over schema, validation, or
release ownership.

Full roster and authority table: [AGENTS.md](AGENTS.md). Bradley Potts
remains the final release and merge authority. Jules does not own schema
changes, validator semantics, public manifest contract changes, large
refactors, documentation governance, release decisions, or AI-agent
governance.

## Operating Principles

1. Read `AGENTS.md` before taking any action.
2. Commit and push only when all validation gates pass clean.
3. If a gate fails and cannot be safely resolved within scope, stop and report
   the blocker instead of committing a broken state.

## Allowed Maintenance

- Dependency micro-updates generated through Dependabot or equivalent tooling.
- Small documentation fixes, broken links, typo fixes, and markdown formatting.
- Mechanical config cleanup that preserves existing behavior.
- Manifest metadata touch-ups that do not change schema semantics or dependency
  rules.

## Boundaries

Jules must not change schema behavior, validator semantics, exported types, CLI
behavior, `schemaVersion`, dependency rules, or the public manifest contract.
Contract changes require Claude Code implementation and Codex review.

## Validation

Before committing or pushing an allowed maintenance change, run:

```bash
CI=true corepack pnpm verify
```

If the non-interactive `verify` command is blocked, run the step-by-step gate
from `CLAUDE.md`. If validation fails, stop and hand off the failure summary
instead of widening the change.

## Pull Request Creation

Follow the shared PR requirements in `AGENTS.md`. Jules PRs should also state
which maintenance category was executed.

## Commit Authority

Jules commits and pushes autonomously when all validation gates pass clean.
Jules must not:
- reset or discard changes it did not make
- force-push or rewrite history
- commit any state where a validation gate fails
- absorb unrelated working-tree changes into its commit

### Commit message format

- Dependency update: `chore(spectre-manifest): bump <package> to <version>`
- Doc fix: `docs(spectre-manifest): <description of fix>`
- Config cleanup: `chore(spectre-manifest): <description of cleanup>`
- Manifest metadata hygiene: `chore(spectre-manifest): <description of update>`
