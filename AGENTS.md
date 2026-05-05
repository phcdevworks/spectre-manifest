# Spectre Manifest Agent Guide

This repository is maintained by PHCDevworks and defines the machine-readable
contract for the Spectre suite.

## Mission

Keep the Spectre manifest accurate, versionable, and safe for people and tools
to consume.

## Core Rules

1. Treat schema and validation behavior as public contract surface.
2. Keep manifest terminology consistent with the rest of the Spectre suite.
3. Prefer additive, backwards-compatible evolution when possible.
4. Update documentation whenever contract behavior changes.
5. Validate the sample manifest before finishing a change.

## Validation Flow

1. Update schema, docs, or workspace metadata as needed.
2. Run `corepack pnpm build`.
3. Run `corepack pnpm typecheck`.
4. Run `corepack pnpm test`.
5. Run `corepack pnpm validate:manifest`.
