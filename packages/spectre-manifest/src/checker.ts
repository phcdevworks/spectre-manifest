import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { SpectreManifest, SpectrePackageDefinition } from "./types.js";

export type PackageCheckIssueKind =
  | "missing-registration"
  | "missing-export"
  | "undeclared-dependency"
  | "missing-declared-dependency";

export interface PackageCheckIssue {
  kind: PackageCheckIssueKind;
  path: string;
  message: string;
}

export interface PackageCheckResult {
  valid: boolean;
  packageName: string;
  issues: PackageCheckIssue[];
  entry?: SpectrePackageDefinition;
}

interface PackageJson {
  name?: string;
  exports?: unknown;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export async function checkPackageAgainstManifest(
  manifest: SpectreManifest,
  packagePath: string,
): Promise<PackageCheckResult> {
  const absolutePackagePath = resolve(packagePath);
  const packageJsonPath = join(absolutePackagePath, "package.json");

  let packageJson: PackageJson;

  try {
    const raw = await readFile(packageJsonPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      throw new Error("Expected a JSON object.");
    }
    if (
      parsed.name !== undefined &&
      (typeof parsed.name !== "string" || parsed.name.trim().length === 0)
    ) {
      throw new Error("Expected name to be a non-empty string.");
    }
    for (const field of ["dependencies", "peerDependencies"] as const) {
      const dependencies = parsed[field];
      if (
        dependencies !== undefined &&
        (!isRecord(dependencies) ||
          !Object.values(dependencies).every((version) => typeof version === "string"))
      ) {
        throw new Error(`Expected ${field} to be an object of version strings.`);
      }
    }
    packageJson = parsed as PackageJson;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      valid: false,
      packageName: absolutePackagePath,
      issues: [
        {
          kind: "missing-registration",
          path: packageJsonPath,
          message: `Unable to read package.json: ${message}`,
        },
      ],
    };
  }

  const packageName = packageJson.name ?? absolutePackagePath;
  const entry = Object.hasOwn(manifest.packages, packageName)
    ? manifest.packages[packageName]
    : undefined;

  if (entry === undefined) {
    return {
      valid: false,
      packageName,
      issues: [
        {
          kind: "missing-registration",
          path: packageName,
          message: `Package "${packageName}" is not registered in the manifest.`,
        },
      ],
    };
  }

  const issues: PackageCheckIssue[] = [];

  // Packages without exports retain the legacy package layout check behavior.
  if (packageJson.exports !== undefined) {
    const exports = packageJson.exports;
    const subpaths =
      isRecord(exports) && Object.keys(exports).some((key) => key.startsWith("."))
        ? exports
        : { ".": exports };

    for (const declaredExport of entry.exports) {
      if (
        !Object.hasOwn(subpaths, declaredExport) ||
        !hasExportTarget(subpaths[declaredExport])
      ) {
        issues.push({
          kind: "missing-export",
          path: `${packageName} exports`,
          message: `Manifest declares export "${declaredExport}" but it is absent from package.json exports.`,
        });
      }
    }
  }

  const actualDeps = new Set([
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.peerDependencies ?? {}),
  ]);

  const spectreDepsInPackage = [...actualDeps].filter((dep) =>
    dep.startsWith("@phcdevworks/"),
  );
  const manifestDeps = new Set(
    (entry.dependencies ?? []).filter((dep) => dep.startsWith("@phcdevworks/")),
  );

  for (const dep of spectreDepsInPackage) {
    if (!manifestDeps.has(dep)) {
      issues.push({
        kind: "undeclared-dependency",
        path: `${packageName} dependencies`,
        message: `Spectre dependency "${dep}" is present in package.json but not declared in the manifest entry.`,
      });
    }
  }

  for (const dep of manifestDeps) {
    if (!actualDeps.has(dep)) {
      issues.push({
        kind: "missing-declared-dependency",
        path: `${packageName} dependencies`,
        message: `Manifest declares dependency "${dep}" but it is absent from package.json dependencies and peerDependencies.`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    packageName,
    issues,
    entry,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Check declared availability across conditions, without choosing a runtime condition.
function hasExportTarget(value: unknown): boolean {
  return inspectExportTarget(value).available;
}

// An unmatched condition can fall through to the next condition. A null target
// blocks resolution instead. Arrays may try another entry after a null target.
function inspectExportTarget(value: unknown): { available: boolean; unmatched: boolean } {
  if (typeof value === "string") {
    return { available: value.startsWith("./"), unmatched: false };
  }
  if (Array.isArray(value)) {
    let unmatched = value.length > 0;
    for (const target of value) {
      const result = inspectExportTarget(target);
      if (result.available) return result;
      unmatched &&= result.unmatched;
    }
    return { available: false, unmatched };
  }
  if (isRecord(value)) {
    for (const [condition, target] of Object.entries(value)) {
      const result = inspectExportTarget(target);
      if (result.available) return result;
      if (condition === "default" && !result.unmatched) return result;
    }
    return { available: false, unmatched: true };
  }
  return { available: false, unmatched: false };
}

export function formatPackageCheckIssues(issues: PackageCheckIssue[]): string[] {
  return issues.map((issue) => `[${issue.kind}] ${issue.path}: ${issue.message}`);
}
