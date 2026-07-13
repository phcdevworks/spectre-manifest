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

- [x] Add `spectre-wordpress-themes` to the manifest
  - `spectre-wordpress-themes` was renamed to `@phcdevworks/spectre-base`
    (<https://github.com/phcdevworks/spectre-base>) and is already registered
    in `spectre.manifest.json` with role `wordpress-theme-foundation`
  - Full package coverage achieved — no remaining gap

- [x] Build downstream consumer validation tooling
  - `spectre-manifest-check` CLI (`packages/spectre-manifest/src/check-cli.ts`,
    `checker.ts`) validates a downstream package's `package.json` against its
    manifest entry (registration, exports, dependency declarations)
  - Validation flow documented in `README.md` and `CONTRIBUTING.md`
  - Wired into `spectre-init` scaffolding via its `check:ecosystem` script
    (`spectre-manifest-validate ... && spectre-manifest-check ...`)

### P1: Controlled Improvement

- [x] Build automated contract diff tooling
  - `spectre-manifest-diff` CLI (`packages/spectre-manifest/src/diff-cli.ts`,
    `differ.ts`) compares two manifest files and classifies every change as
    additive, semantic, or breaking; exits non-zero on breaking changes
  - `diffManifests` / `formatManifestDiff` exported from the package's public
    API for programmatic use
  - Covered by `test/differ.test.mjs` (unit + CLI integration)

- [x] Evaluate publishing manifest to npm
  - Decision recorded in `DECISION-manifest-distribution.md`: ship
    `spectre.manifest.json` from the existing `@phcdevworks/spectre-manifest`
    package via a new `./manifest` export (mirrors `./schema`), rather than
    reference-by-URL — keeps schema and manifest versioned together and
    pinnable through the existing npm dependency
  - Follow-up implemented: `./manifest` export added, `spectre.manifest.json`
    copied into the package during `pnpm build` and included in the npm
    tarball via `files`, documented in `README.md`

## Recommended Execution Order

1. ~~Full package coverage~~ ✓ (`spectre-wordpress-themes` renamed to
   `spectre-base` and registered)
2. ~~Downstream consumer validation tooling~~ ✓ (`spectre-manifest-check`)
3. ~~Contract diff tooling~~ ✓ (`spectre-manifest-diff` CLI)
4. ~~npm publish evaluation~~ ✓ (`./manifest` export shipped)

## Explicitly Out of Scope

- Do not define UI behavior or component logic here
- Do not absorb token generation or CSS output
- Do not add package-specific runtime code

## Requested by Downstream

None yet.
