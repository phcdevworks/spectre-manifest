# Spectre Manifest Roadmap

This roadmap is grounded in the current repository shape and public contract of
`spectre-manifest` as it exists today.

`spectre-manifest` is the infrastructure layer that defines the machine-readable
contract system for the Spectre ecosystem. It owns schema definitions, manifest
validation tooling, and the contract authority that downstream packages reference
to prove they are correctly wired into the Spectre system.

Its job is to make contracts enforceable, not to define UI behavior or package
logic.

## 1. Current Repo Assessment

### Current strengths

- `spectre.manifest.json` is in place as the root machine-readable contract
  anchor.
- The workspace is structured with `packages/` for modular contract tooling.
- `tsconfig.base.json` provides a shared TypeScript foundation for packages.
- pnpm workspace configuration ensures consistent dependency management.
- Validation scripts (`validate:manifest`, `verify`) are already part of the
  check flow.

### Current gaps to harden

- Manifest schema versioning is not yet formalized — there is no declared schema
  version that downstream consumers can reference to confirm compatibility.
- Contract coverage is not yet complete across all Spectre packages —
  `spectre-shell`, `spectre-shell-router`, and `spectre-shell-signals` are not
  yet represented in the manifest.
- There is no CI pipeline enforcing manifest validation on every push.
- Downstream consumers have no tooling to validate themselves against the
  manifest contract without manual coordination.
- No ROADMAP.md or TODO.md has existed until now, making prioritization opaque.

## 2. Roadmap

## P0: Contract Authority / Must-Do

### P0.1 Manifest Schema Versioning

Objective Add a declared schema version to `spectre.manifest.json` so downstream
consumers can confirm compatibility.

Why it matters Contracts without versioning cannot evolve safely. Downstream
packages need to know which manifest version they were validated against so
breaking changes can be signaled explicitly.

Suggested deliverables

- Add `"schemaVersion"` field to `spectre.manifest.json`
- Document version semantics (additive, semantic, breaking) in `README.md`
- Ensure validation fails if schema version is missing or unrecognized

Dependency notes

- This is the first move because all downstream validation work depends on it

Risk if skipped

- Contract evolution cannot be tracked or communicated cleanly

### P0.2 Full Package Coverage in the Manifest

Objective Extend `spectre.manifest.json` to represent all active Spectre packages
including the shell system.

Why it matters The manifest is only authoritative if it is complete. Packages
missing from the manifest are invisible to contract enforcement.

Suggested deliverables

- Add entries for: `@phcdevworks/spectre-shell`, `@phcdevworks/spectre-shell-router`,
  `@phcdevworks/spectre-shell-signals`, `@phcdevworks/spectre-components`,
  `@phcdevworks/spectre-wordpress-themes`, `@phcdevworks/spectre-init`
- Document each package's declared public contract surface
- Validate that all entries are structurally correct against the schema

Dependency notes

- Depends on schema versioning being in place

Risk if skipped

- Shell and component packages operate outside the contract system

### P0.3 CI Pipeline

Objective Add a CI pipeline that runs manifest validation on every push.

Why it matters Without CI, manifest drift goes undetected until a release-time
audit.

Suggested deliverables

- GitHub Actions workflow running `npm run validate:manifest` and `npm run verify`
- Badge in `README.md`

Dependency notes

- No blocking dependencies

Risk if skipped

- Manifest drift accumulates silently between releases

### P0.4 Downstream Consumer Validation Tooling

Objective Provide tooling or documentation that lets downstream packages validate
themselves against the manifest.

Why it matters The manifest is only useful if consumers can check their own
compliance. Without tooling, validation requires manual audit.

Suggested deliverables

- CLI or script that a downstream package can run to validate its public API
  against its manifest entry
- Document the validation flow in `README.md` and `CONTRIBUTING.md`
- Integrate the validation path into `@phcdevworks/spectre-init` scaffolding

Dependency notes

- Depends on full package coverage in the manifest

Risk if skipped

- Downstream packages cannot self-validate; compliance is informal

## P1: Maintainer and Consumer Clarity

### P1.1 Document Manifest Structure for Contributors

Objective Make the manifest schema and contribution process clear for anyone
adding a new Spectre package.

Why it matters As the Spectre ecosystem grows, new packages should be able to
self-register without requiring manual coordination.

Suggested deliverables

- Document manifest entry structure in `CONTRIBUTING.md` or `README.md`
- Provide a template entry for new packages
- Include validation instructions

Dependency notes

- Best after schema versioning is stable

### P1.2 Manifest Changelog

Objective Track meaningful changes to `spectre.manifest.json` in a structured
changelog.

Why it matters Downstream consumers need to understand when the manifest changed
and what the impact is.

Suggested deliverables

- Add `CHANGELOG.md` to the manifest repository
- Document entries when package contracts are added, updated, or deprecated

Dependency notes

- Low dependency; can run alongside P0

## P2: Later / Controlled Improvement

### P2.1 Automated Package Contract Diffing

Objective Build tooling that diffs manifest versions and identifies additive vs.
breaking changes automatically.

Suggested deliverables

- Script that compares two manifest versions and reports contract change
  classification
- Implement when the schema is stable and downstream consumer count is large
  enough to justify automation

### P2.2 Public Manifest Registry Evaluation

Objective Evaluate whether `spectre.manifest.json` should be published as a
versioned artifact to npm for downstream consumption.

Suggested deliverables

- Decision document weighing publish-to-npm vs. reference-by-URL approaches
- Implement only if multiple external consumers prove the need

## 3. Explicitly Out of Scope

- Do not define UI behavior or component structure here
- Do not add package-specific logic here — this is schema and validation
  infrastructure only
- Do not absorb token generation or CSS output into this repository

## 4. Recommended Execution Order

1. Schema versioning
2. Full package coverage in manifest
3. CI pipeline
4. Downstream consumer validation tooling
5. Document manifest structure for contributors
6. Manifest changelog
7. Contract diffing tooling (when scale demands it)
8. Evaluate public registry (when external consumers prove the need)
