# Contributing

Thanks for helping improve `@phcdevworks/spectre-manifest`. This workspace owns the Spectre architecture contract, so changes should keep schema, validation, and documentation aligned.

## Workflow

1. Install dependencies with `corepack pnpm install`.
2. Make the smallest focused change that solves the problem.
3. Update README, schema docs, or manifest notes when contract behavior changes.
4. Run `pnpm verify` before opening a pull request.

## Project Standards

- Treat schema and validation behavior as public contract surface.
- Prefer additive, backward-compatible changes when possible.
- Keep package, layer, dependency, and AI guidance terminology consistent.
- Validate `spectre.manifest.json` whenever manifest rules or package metadata change.

## Checks

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm validate:manifest
pnpm verify
```

## Pull Requests

Describe the contract change, call out migration concerns, and include the commands you ran.
