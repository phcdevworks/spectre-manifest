# Spectre Manifest Execution Todo

Scoped to contract authority, schema versioning, package coverage, CI, and downstream validation tooling. Aligned to `ROADMAP.md`.

## P0: Contract Authority / Must-Do

- [x] Add schema version to `spectre.manifest.json`
  - `"schemaVersion": "0.1"` present in manifest
  - Schema rejects missing or unrecognized `schemaVersion`
  - Version semantics documented in `README.md`

- [x] Add CI pipeline — `.github/workflows/ci.yml` runs `pnpm verify` on push and PR across Node 22 and 24. Add README badge when repository is public.

- [ ] Add `spectre-wordpress-themes` to the manifest
  - Remaining gap from P0.2 full package coverage
  - Requires: package role, layer assignment, dependency/consumer declarations from the package owner
  - File targets: `spectre.manifest.json`

- [ ] Build downstream consumer validation tooling
  - CLI or script for downstream packages to validate themselves against their manifest entry
  - Document validation flow in `README.md` and `CONTRIBUTING.md`
  - Reference from `spectre-init` scaffolding
  - File targets: `packages/` (new validation package or script), `README.md`, `CONTRIBUTING.md`

## P1: Maintainer and Consumer Clarity

- [ ] Document manifest entry structure for contributors
  - Template entry for new packages in `CONTRIBUTING.md` or `README.md`
  - Validation instructions included
  - New package self-registration process clear

- [ ] Add `CHANGELOG.md`
  - Keep a Changelog format
  - Documents package contract additions, updates, and deprecations

## P2: Later / Controlled Improvement

- [ ] Build automated contract diff tooling
  - Script compares two manifest versions and classifies changes as additive, semantic, or breaking
  - Implement when downstream consumer count justifies automation

- [ ] Evaluate publishing manifest to npm
  - Decision document weighing publish-to-npm vs. reference-by-URL
  - Implement only when external consumer demand is proven

## Explicitly Out of Scope

- Do not define UI behavior or component logic here
- Do not absorb token generation or CSS output
- Do not add package-specific runtime code

## Execution Order

1. ~~Schema versioning~~ ✓
2. Full package coverage (only `spectre-wordpress-themes` remaining)
3. ~~CI pipeline~~ ✓
4. Downstream consumer validation tooling
5. Contributor documentation
6. CHANGELOG
7. Contract diff tooling (scale-driven)
8. npm publish evaluation (demand-driven)
