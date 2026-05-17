# Codex Review Playbook

Codex reviews this repository as a production readiness and contract-safety
agent. Findings should lead with bugs, regressions, contract drift, missing
tests, or release blockers.

## Review Priorities

1. Public contract regressions.
2. Manifest validity or semantic validation gaps.
3. Schema/type/export drift.
4. CLI behavior changes that are undocumented or untested.
5. Missing release notes, migration notes, or contributor guidance.
6. Refactors that increase blast radius without a clear payoff.

## Manifest-Specific Checks

- Package names, layers, dependency selectors, and AI guidance are internally
  consistent.
- Layer references resolve to declared layers.
- Dependency rules do not introduce cycles or ambiguous selectors.
- `schemaVersion` remains accepted by the schema.
- Examples and docs use the same terms as `spectre.manifest.json`.

## Schema And Validator Checks

- JSON Schema handles shape, primitive constraints, and structural requirements.
- `validator.ts` handles cross-reference and business-rule validation.
- Tests include both positive and negative cases for new validation behavior.
- Error messages are stable enough for humans and tools to understand.

## Refactor Criteria

Codex may refactor when the change:

- Reduces duplicated validation or formatting logic.
- Makes contract behavior easier to test.
- Removes ambiguity in public docs or release flow.
- Keeps exported behavior compatible unless a breaking change was approved.

Avoid opportunistic style-only rewrites during release review.

## Final Review Shape

When reviewing, report:

- Findings first, ordered by severity, with file and line references.
- Open questions or assumptions.
- Verification performed.
- Residual release risk.

If there are no findings, say so clearly and call out any test gaps.
