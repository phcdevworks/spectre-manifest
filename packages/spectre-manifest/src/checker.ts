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
  exports?: Record<string, unknown> | string;
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
    packageJson = JSON.parse(raw) as PackageJson;
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
  const entry = manifest.packages[packageName];

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

  if (
    typeof packageJson.exports === "object" &&
    packageJson.exports !== null &&
    !Array.isArray(packageJson.exports)
  ) {
    const actualExportKeys = new Set(Object.keys(packageJson.exports));

    for (const declaredExport of entry.exports) {
      if (!actualExportKeys.has(declaredExport)) {
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

export function formatPackageCheckIssues(issues: PackageCheckIssue[]): string[] {
  return issues.map((issue) => `[${issue.kind}] ${issue.path}: ${issue.message}`);
}
