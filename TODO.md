# Spectre Manifest Execution Todo

Scoped to contract authority, schema versioning, package coverage, CI, and
downstream validation tooling. Aligned to `ROADMAP.md`.

## Phase 1 - Contract Foundation: Completed

All Phase 1 items were delivered during the initial release cycle.

### P0: Contract Authority

- [x] Add schema version to `spectre.manifest.json`
  - `"schemaVersion": "0.1"` present in manifest
  - Schema rejects missing or unrecognized `schemaVersion`
  - Version semantics documented in `README.md`

- [x] Add CI pipeline
  - `.github/workflows/ci.yml` runs `pnpm verify` on push and PR across
    Node 22 and 24

### P1: Maintainer and Consumer Clarity

- [x] Document manifest entry structure for contributors
  - Template entry for new packages in `CONTRIBUTING.md` or `README.md`
  - Validation instructions included
  - New package self-registration process clear

- [x] Add `CHANGELOG.md`
  - Keep a Changelog format
  - Documents package contract additions, updates, and deprecations

---

## Phase 2 - Mature Contract Operations

All items below are forward-looking. This phase starts from the stable
foundation and focuses on full package coverage, downstream consumer tooling,
and contract automation.

### P0: Package Coverage and Consumer Tooling

- [ ] Add `spectre-wordpress-themes` to the manifest
  - Remaining gap from full package coverage
  - Requires: package role, layer assignment, dependency/consumer declarations
    from the package owner
  - File targets: `spectre.manifest.json`

- [ ] Build downstream consumer validation tooling
  - CLI or script for downstream packages to validate themselves against their
    manifest entry
  - Document validation flow in `README.md` and `CONTRIBUTING.md`
  - Reference from `spectre-init` scaffolding
  - File targets: `packages/` (new validation package or script), `README.md`,
    `CONTRIBUTING.md`

### P2: Controlled Improvement

- [ ] Build automated contract diff tooling
  - Script compares two manifest versions and classifies changes as additive,
    semantic, or breaking
  - Implement when downstream consumer count justifies automation

- [ ] Evaluate publishing manifest to npm
  - Decision document weighing publish-to-npm vs. reference-by-URL
  - Implement only when external consumer demand is proven

## Recommended Execution Order

1. Full package coverage (`spectre-wordpress-themes` is the only remaining gap)
2. Downstream consumer validation tooling
3. Contract diff tooling (scale-driven)
4. npm publish evaluation (demand-driven)

## Explicitly Out of Scope

- Do not define UI behavior or component logic here
- Do not absorb token generation or CSS output
- Do not add package-specific runtime code
