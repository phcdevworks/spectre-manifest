# Spectre Manifest Execution Todo

This todo list is aligned to the current repository and the roadmap in
`ROADMAP.md`. It is scoped to contract authority, schema versioning, package
coverage, CI, and downstream validation tooling.

## P0: Contract Authority / Must-Do

- Add schema version to `spectre.manifest.json` File targets:
  - `spectre.manifest.json`
  - schema validation scripts under `packages/`
  - `README.md` Acceptance criteria:
  - `"schemaVersion"` field is present in `spectre.manifest.json`
  - Validation fails if `schemaVersion` is missing or unrecognized
  - Version semantics (additive / semantic change / breaking) are documented

- Add manifest entries for all active Spectre packages File targets:
  - `spectre.manifest.json` Acceptance criteria:
  - Entries exist for: `spectre-shell`, `spectre-shell-router`,
    `spectre-shell-signals`, `spectre-components`, `spectre-wordpress-themes`,
    `spectre-init`
  - Each entry declares the package's public contract surface
  - Validation confirms all entries are structurally correct

- Add GitHub Actions CI pipeline File targets:
  - `.github/workflows/ci.yml`
  - `README.md` (badge) Acceptance criteria:
  - CI runs `npm run validate:manifest` and `npm run verify` on push and PR
  - Badge visible in README

- Build downstream consumer validation tooling File targets:
  - `packages/` (new validation package or script)
  - `README.md`
  - `CONTRIBUTING.md` Acceptance criteria:
  - Downstream packages can run a script to validate themselves against their
    manifest entry
  - Validation flow is documented in README
  - Flow is referenced in `spectre-init` scaffolding

## P1: Maintainer and Consumer Clarity

- Document manifest entry structure for contributors File targets:
  - `CONTRIBUTING.md` or `README.md` Acceptance criteria:
  - Manifest entry structure is documented with a template
  - Validation instructions are included
  - New package self-registration process is clear

- Add `CHANGELOG.md` File targets:
  - `CHANGELOG.md` Acceptance criteria:
  - Follows Keep a Changelog format
  - Documents package contract additions, updates, and deprecations

## P2: Later / Controlled Improvement

- Build automated contract diff tooling File targets:
  - `packages/` or `scripts/` Acceptance criteria:
  - Script compares two manifest versions and classifies changes as additive,
    semantic, or breaking
  - Implement when downstream consumer count justifies automation

- Evaluate publishing manifest to npm File targets:
  - planning docs Acceptance criteria:
  - Decision document weighing publish-to-npm vs. reference-by-URL
  - Implement only when external consumer demand is proven

## Explicitly Out of Scope

- Do not define UI behavior or component logic here
- Do not absorb token generation or CSS output
- Do not add package-specific runtime code

## Recommended Execution Order

1. Schema versioning
2. Full package coverage in manifest
3. CI pipeline
4. Downstream consumer validation tooling
5. Contributor documentation
6. CHANGELOG
7. Contract diff tooling (scale-driven)
8. npm publish evaluation (demand-driven)
