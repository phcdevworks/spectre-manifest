# Decision: Distributing `spectre.manifest.json`

Status: **Decided — publish via the existing npm package**
Date: 2026-06-09
Owner: Bradley Potts (final authority); prepared by Claude Code

## Context

`@phcdevworks/spectre-manifest` is already published to npm. It currently
ships the JSON Schema (`./schema` export) and the validation/type/CLI surface
that operates *on* a manifest file. The open question (tracked in `TODO.md`
Phase 2 / P1 and `ROADMAP.md`) is how downstream consumers should obtain the
**manifest contract document itself** (`spectre.manifest.json`) — the living
architecture data, not just the tools that validate it.

Two options were on the table:

1. **Publish the manifest to npm** — bundle `spectre.manifest.json` as a file
   in the existing `@phcdevworks/spectre-manifest` package (or a dedicated
   `./manifest` export), so consumers get it via `npm install` alongside the
   schema and validators they already depend on.
2. **Reference by URL** — point consumers at a raw GitHub URL (or a future
   CDN/registry) for the manifest, keeping the npm package limited to
   schema + tooling.

## Decision

**Publish the manifest as part of the existing `@phcdevworks/spectre-manifest`
package**, alongside the schema it already exports. Concretely: add the
manifest JSON to the package's `files` array and expose it via a `./manifest`
subpath export (mirroring the existing `./schema` export), versioned together
with the package.

## Rationale

- **No new publish surface.** The package is already on npm with
  `publishConfig.access: public`. Adding a file + export entry is a small,
  low-risk addition to infrastructure that already exists — there's no new
  package to name, version, or maintain.
- **Schema and manifest travel together.** The schema (`./schema`) and the
  manifest it validates are tightly coupled — a manifest is only meaningful
  alongside the `schemaVersion` it declares conformance to. Shipping both from
  one versioned package guarantees a consumer always has a schema/manifest
  pair that are mutually compatible, which a URL reference cannot guarantee
  (the URL can drift independently of any pinned dependency version).
- **npm gives consumers what they already expect.** Downstream packages
  already do `npm install @phcdevworks/spectre-manifest` for types, the
  validator CLI, and `spectre-manifest-check`. Adding the manifest to that
  same install means one dependency, one lockfile entry, one version to pin —
  rather than asking consumers to also manage a separate fetch-by-URL step
  (with its own caching, offline-build, and integrity concerns).
- **Reproducible builds.** A URL reference requires network access at build
  or install time and has no built-in integrity guarantee beyond whatever the
  fetch layer provides. An npm-published file is content-addressed by the
  package's lockfile entry (integrity hash), works offline once installed,
  and is reproducible in CI without extra fetch/cache plumbing.
- **Cost is low.** This does not require a new release pipeline, a new
  package name, or new npm org permissions — it's an additive change to an
  existing, already-public package.

## Why not reference-by-URL

URL references were considered primarily for their simplicity (no build step,
always "latest"), but that "always latest" property is precisely the problem:
consumers validating against a manifest need a **pinned, versioned** snapshot
that matches the schema version they're coded against. A URL either has to
encode a git ref/tag (pushing the versioning problem onto the consumer) or
serves a moving target that can break consumers without a version bump. npm
already solves this versioning/pinning problem for us.

## Follow-up

- Add `spectre.manifest.json` to `packages/spectre-manifest/package.json`
  `files` and add a `./manifest` entry under `exports` pointing at it.
- Document the `./manifest` export in `README.md` alongside the existing
  `./schema` export documentation.
- No `schemaVersion` bump is required — this is an additive packaging change,
  not a contract change.
