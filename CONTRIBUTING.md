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

## Adding a New Package

To register a new Spectre package in the manifest:

**1. Add an entry to `spectre.manifest.json`** under `packages`:

```json
"@phcdevworks/your-package-name": {
  "role": "your-role",
  "layer": "foundation",
  "stability": "experimental",
  "description": "One-sentence description of what this package does.",
  "exports": ["."],
  "dependencies": [],
  "consumers": [],
  "allowedTargets": ["external"]
}
```

Field reference:

| Field | Required | Values | Notes |
| --- | --- | --- | --- |
| `role` | yes | free string | e.g. `"design-tokens"`, `"composed-ui"`, `"shell-routing"` |
| `layer` | yes | `"foundation"`, `"build"`, `"governance"` | Must match a key in `layers` |
| `stability` | yes | `"experimental"`, `"beta"`, `"stable"`, `"deprecated"` | Default new packages to `"experimental"` |
| `description` | yes | string | One sentence |
| `exports` | yes | array of strings | Mirrors `package.json` `exports` keys |
| `dependencies` | no | array of package names | Only other packages registered in this manifest |
| `consumers` | no | array of package names | Packages that declare this package in their `dependencies` |
| `allowedTargets` | no | `"external"`, `"layer:<id>"`, `"package:<name>"` | Required when you want finer-grained dependency control |
| `notes` | no | array of strings | Context for maintainers and tooling |

**2. Wire up bidirectional relationships.**

`dependencies` and `consumers` must be consistent across both sides:

- If `A` lists `B` in `dependencies`, then `B` must list `A` in `consumers`.
- If `B` lists `A` in `consumers`, then `A` must list `B` in `dependencies`.

**3. Respect `dependencyDirection` rules.**

Check `rules.dependencyDirection` before adding a dependency. A `build` package may depend on `foundation`, but a `foundation` package may not depend on `build`.

**4. Validate.**

```bash
corepack pnpm validate:manifest
```

This must pass before opening a pull request. If it fails, the error output shows the exact path and rule that was violated.

## Validating a downstream package

Once a package is registered in the manifest, it can validate itself against its own entry:

```bash
npx spectre-manifest-check /path/to/spectre.manifest.json .
```

Run this from the package directory (`.`) or supply the path explicitly. The check confirms:

- The package is registered in the manifest.
- All declared `@phcdevworks/*` manifest dependencies are present in `package.json` `dependencies` or `peerDependencies`.
- No undeclared `@phcdevworks/*` dependencies exist in `package.json`.
- All declared manifest `exports` are present in the `package.json` `exports` map (when an `exports` object is defined).

Use `--json` for machine-readable output, e.g. in CI.

## Checks

```bash
pnpm build
pnpm typecheck
pnpm test
pnpm validate:manifest
pnpm test:package
pnpm verify
```

`pnpm typecheck` includes the root TypeScript scripts as well as package source.
`pnpm verify` also checks README version parity and installs a packed tarball in
a temporary consumer to exercise public imports, declarations, bundled data,
and the installed CLIs. This install needs registry access and disables lifecycle
scripts. CI runs the full gate on Node 22.13.0, current Node 22, and Node 24.

## Pull Requests

Describe the contract change, call out migration concerns, and include the commands you ran. Populate all sections of the PR template.

## Code of Conduct

By participating in this project, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
