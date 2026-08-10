# Spectre Manifest Roadmap

`spectre-manifest` is the infrastructure layer that defines the
machine-readable contract system for the Spectre ecosystem. It owns schema
definitions, manifest validation tooling, and the contract authority that
downstream packages reference to prove they are correctly wired into the
Spectre system.

Its job is to make contracts enforceable, not to define UI behavior or
package logic.

This document tracks what's next. For what already shipped and why, see
[CHANGELOG.md](CHANGELOG.md) (release-by-release detail) and git history —
this file does not restate delivered work.

---

## Delivered Phases

| Phase | Summary | Shipped in |
| --- | --- | --- |
| 1 | Contract foundation — JSON Schema (draft 2020-12), `schemaVersion`, TypeScript types, validator (structural + semantic), `spectre-manifest-validate` CLI, CI on Node 22/24, full manifest coverage across layers 1–7 | 1.0.0 |
| 2 | Mature contract operations — `spectre-wordpress-themes` renamed/registered as `spectre-base`, downstream consumer validation via `spectre-manifest-check`, contract diffing via `spectre-manifest-diff`, `./manifest` npm export shipping `spectre.manifest.json` alongside `./schema` | 1.1.0 |

---

## What's Next

No active phase is currently open. New schema fields, validation rules, or
tooling open on demand, when a downstream repo surfaces a concrete gap — see
[TODO.md](TODO.md).

---

## Explicitly Out of Scope

- Component structure or composition — belongs in `spectre-shell` and
  downstream UI packages.
- Token generation or CSS output — belongs in `project-design`.
- Package-specific runtime logic — this repo is schema and validation
  infrastructure only.
