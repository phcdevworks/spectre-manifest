# JULES.md - spectre-manifest

## Role

Google Jules is the scheduled maintenance agent for
`@phcdevworks/spectre-manifest`. Jules handles small, bounded maintenance that
keeps the manifest workspace clean without taking over schema, validation, or
release ownership.

Claude Code remains the lead implementation agent. Codex owns documentation,
release readiness, production stabilization, repo hygiene, contract review, and
config standardization. Bradley Potts remains the final release and merge
authority.

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
