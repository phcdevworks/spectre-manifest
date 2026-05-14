# Spectre Manifest Roadmap

`spectre-manifest` is the infrastructure layer that defines the machine-readable contract system for the Spectre ecosystem. It owns schema definitions, manifest validation tooling, and the contract authority that downstream packages reference to prove they are correctly wired into the Spectre system.

Its job is to make contracts enforceable, not to define UI behavior or package logic.

## 1. Current Repo Assessment

### Strengths

- `spectre.manifest.json` is in place as the root machine-readable contract anchor with `schemaVersion: "0.1"`.
- Full JSON Schema (draft 2020-12) with AJV validation covering structural and semantic rules.
- TypeScript types, validator, and CLI published as `@phcdevworks/spectre-manifest`.
- 16 passing tests covering happy path, parse errors, schema errors, and all semantic checks.
- CI pipeline on GitHub Actions running `pnpm verify` across Node 22 and 24.
- All core Spectre packages registered (except `spectre-wordpress-themes`).

### Remaining gaps

- `spectre-wordpress-themes` not yet in the manifest.
- No downstream consumer validation tooling.
- No CHANGELOG.

## 2. Roadmap

## P0: Contract Authority / Must-Do

### P0.1 Manifest Schema Versioning ✓ Complete

`schemaVersion: "0.1"` is declared in both `spectre.manifest.json` and the JSON Schema. Validation fails on missing or unrecognized versions.

### P0.2 Full Package Coverage in the Manifest — Partial

All active Spectre packages except `spectre-wordpress-themes` are registered. That package requires role, layer, and dependency details from the package owner before it can be added correctly.

### P0.3 CI Pipeline ✓ Complete

GitHub Actions workflow at `.github/workflows/ci.yml` runs `pnpm verify` (build, typecheck, test, validate:manifest) on every push and pull request against Node 22 and 24. Add a CI badge to `README.md` when the repository is public.

### P0.4 Downstream Consumer Validation Tooling

Objective: Provide tooling or documentation that lets downstream packages validate themselves against the manifest.

Why it matters: The manifest is only useful if consumers can check their own compliance. Without tooling, validation requires manual audit.

Suggested deliverables:
- CLI or script that a downstream package can run to validate its public API against its manifest entry
- Document the validation flow in `README.md` and `CONTRIBUTING.md`
- Integrate the validation path into `@phcdevworks/spectre-init` scaffolding

Risk if skipped: Downstream packages cannot self-validate; compliance is informal.

## P1: Maintainer and Consumer Clarity

### P1.1 Document Manifest Structure for Contributors

Objective: Make the manifest schema and contribution process clear for anyone adding a new Spectre package.

Suggested deliverables:
- Document manifest entry structure in `CONTRIBUTING.md` or `README.md`
- Provide a template entry for new packages
- Include validation instructions

### P1.2 Manifest Changelog

Objective: Track meaningful changes to `spectre.manifest.json` in a structured changelog.

Suggested deliverables:
- Add `CHANGELOG.md` to the manifest repository
- Document entries when package contracts are added, updated, or deprecated

## P2: Later / Controlled Improvement

### P2.1 Automated Package Contract Diffing

Objective: Build tooling that diffs manifest versions and identifies additive vs. breaking changes automatically.

Implement when the schema is stable and downstream consumer count is large enough to justify automation.

### P2.2 Public Manifest Registry Evaluation

Objective: Evaluate whether `spectre.manifest.json` should be published as a versioned artifact to npm for downstream consumption.

Implement only if multiple external consumers prove the need.

## 3. Explicitly Out of Scope

- Do not define UI behavior or component structure here
- Do not add package-specific logic here — this is schema and validation infrastructure only
- Do not absorb token generation or CSS output into this repository

## 4. Recommended Execution Order

1. ~~Schema versioning~~ ✓
2. Full package coverage (only `spectre-wordpress-themes` remaining)
3. ~~CI pipeline~~ ✓
4. Downstream consumer validation tooling
5. Document manifest structure for contributors
6. Manifest changelog
7. Contract diffing tooling (when scale demands it)
8. Evaluate public registry (when external consumers prove the need)
