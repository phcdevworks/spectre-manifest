import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { ErrorObject } from "ajv";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { loadManifestSchema } from "./schema.js";
import type {
  DependencyTargetSelector,
  ManifestSelector,
  SpectreManifest,
} from "./types.js";

export type ManifestValidationIssueKind = "parse" | "schema" | "semantic";

export interface ManifestValidationIssue {
  kind: ManifestValidationIssueKind;
  path: string;
  message: string;
}

export interface ManifestValidationResult {
  valid: boolean;
  issues: ManifestValidationIssue[];
  manifest?: SpectreManifest;
  absolutePath?: string;
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
});

addFormats(ajv);

const validateAgainstSchema = ajv.compile<SpectreManifest>(loadManifestSchema());

export function validateManifest(manifest: unknown): ManifestValidationResult {
  const schemaIsValid = validateAgainstSchema(manifest);

  if (!schemaIsValid) {
    return {
      valid: false,
      issues: schemaIssuesFrom(validateAgainstSchema.errors),
    };
  }

  const typedManifest = manifest as SpectreManifest;
  const semanticIssues = collectSemanticIssues(typedManifest);

  return {
    valid: semanticIssues.length === 0,
    issues: semanticIssues,
    manifest: typedManifest,
  };
}

export async function validateManifestFile(
  filePath: string,
): Promise<ManifestValidationResult> {
  const absolutePath = resolve(filePath);

  let rawManifest: string;

  try {
    rawManifest = await readFile(absolutePath, "utf8");
  } catch (error) {
    return {
      valid: false,
      issues: [
        {
          kind: "parse",
          path: absolutePath,
          message: `Unable to read manifest file: ${toErrorMessage(error)}`,
        },
      ],
      absolutePath,
    };
  }

  let parsedManifest: unknown;

  try {
    parsedManifest = JSON.parse(rawManifest) as unknown;
  } catch (error) {
    return {
      valid: false,
      issues: [
        {
          kind: "parse",
          path: absolutePath,
          message: `Invalid JSON: ${toErrorMessage(error)}`,
        },
      ],
      absolutePath,
    };
  }

  return {
    ...validateManifest(parsedManifest),
    absolutePath,
  };
}

export function formatManifestValidationIssues(
  issues: ManifestValidationIssue[],
): string[] {
  return issues.map((issue) => `[${issue.kind}] ${issue.path}: ${issue.message}`);
}

function collectSemanticIssues(
  manifest: SpectreManifest,
): ManifestValidationIssue[] {
  const issues: ManifestValidationIssue[] = [];
  const layerIds = new Set(Object.keys(manifest.layers));
  const packageNames = new Set(Object.keys(manifest.packages));
  const dependencyRules = new Map<string, Set<string>>();

  for (const [layerId, layer] of Object.entries(manifest.layers)) {
    for (const [index, dependencyLayer] of (layer.dependsOn ?? []).entries()) {
      if (!layerIds.has(dependencyLayer)) {
        issues.push({
          kind: "semantic",
          path: `layers.${layerId}.dependsOn[${index}]`,
          message: `Unknown layer reference "${dependencyLayer}".`,
        });
      }
    }
  }

  for (const [index, rule] of manifest.rules.dependencyDirection.entries()) {
    if (!layerIds.has(rule.fromLayer)) {
      issues.push({
        kind: "semantic",
        path: `rules.dependencyDirection[${index}].fromLayer`,
        message: `Unknown source layer "${rule.fromLayer}".`,
      });
    }

    if (dependencyRules.has(rule.fromLayer)) {
      issues.push({
        kind: "semantic",
        path: `rules.dependencyDirection[${index}].fromLayer`,
        message: `Duplicate dependency rule for layer "${rule.fromLayer}".`,
      });
    }

    const allowedLayers = new Set<string>();

    for (const [allowedIndex, allowedLayer] of rule.allowedLayers.entries()) {
      if (!layerIds.has(allowedLayer)) {
        issues.push({
          kind: "semantic",
          path: `rules.dependencyDirection[${index}].allowedLayers[${allowedIndex}]`,
          message: `Unknown allowed layer "${allowedLayer}".`,
        });
      }

      allowedLayers.add(allowedLayer);
    }

    dependencyRules.set(rule.fromLayer, allowedLayers);
  }

  for (const [index, rule] of manifest.rules.forbiddenImports.entries()) {
    issues.push(
      ...validateManifestSelector(
        rule.source,
        layerIds,
        packageNames,
        `rules.forbiddenImports[${index}].source`,
      ),
    );
    issues.push(
      ...validateManifestSelector(
        rule.target,
        layerIds,
        packageNames,
        `rules.forbiddenImports[${index}].target`,
      ),
    );
  }

  for (const [index, constraint] of manifest.rules.boundaryConstraints.entries()) {
    issues.push(
      ...validateManifestSelector(
        constraint.scope,
        layerIds,
        packageNames,
        `rules.boundaryConstraints[${index}].scope`,
      ),
    );
  }

  for (const [packageName, packageDefinition] of Object.entries(manifest.packages)) {
    const packagePath = `packages["${packageName}"]`;

    if (!layerIds.has(packageDefinition.layer)) {
      issues.push({
        kind: "semantic",
        path: `${packagePath}.layer`,
        message: `Unknown layer "${packageDefinition.layer}".`,
      });
    }

    for (const [index, dependencyName] of (packageDefinition.dependencies ?? []).entries()) {
      const dependencyPath = `${packagePath}.dependencies[${index}]`;

      if (!packageNames.has(dependencyName)) {
        issues.push({
          kind: "semantic",
          path: dependencyPath,
          message: `Unknown package dependency "${dependencyName}".`,
        });
        continue;
      }

      const dependencyLayer = manifest.packages[dependencyName]?.layer;

      if (dependencyLayer === undefined) {
        continue;
      }

      const allowedLayers = dependencyRules.get(packageDefinition.layer);

      if (allowedLayers === undefined) {
        issues.push({
          kind: "semantic",
          path: `${packagePath}.layer`,
          message: `No dependencyDirection rule exists for layer "${packageDefinition.layer}".`,
        });
      } else if (!allowedLayers.has(dependencyLayer)) {
        issues.push({
          kind: "semantic",
          path: dependencyPath,
          message: `Dependency "${dependencyName}" lives in disallowed layer "${dependencyLayer}" for source layer "${packageDefinition.layer}".`,
        });
      }

      const allowedTargets = packageDefinition.allowedTargets ?? [];

      if (
        allowedTargets.length > 0 &&
        !matchesAllowedTarget(allowedTargets, dependencyName, dependencyLayer)
      ) {
        issues.push({
          kind: "semantic",
          path: dependencyPath,
          message: `Dependency "${dependencyName}" is not covered by allowedTargets.`,
        });
      }
    }

    for (const [index, consumerName] of (packageDefinition.consumers ?? []).entries()) {
      if (!packageNames.has(consumerName)) {
        issues.push({
          kind: "semantic",
          path: `${packagePath}.consumers[${index}]`,
          message: `Unknown consumer package "${consumerName}".`,
        });
      }
    }

    for (const [index, target] of (packageDefinition.allowedTargets ?? []).entries()) {
      issues.push(
        ...validateDependencyTargetSelector(
          target,
          layerIds,
          packageNames,
          `${packagePath}.allowedTargets[${index}]`,
        ),
      );
    }
  }

  for (const [index, entrypoint] of manifest.ai.preferredEntrypoints.entries()) {
    if (entrypoint.kind === "package" && !packageNames.has(entrypoint.entrypoint)) {
      issues.push({
        kind: "semantic",
        path: `ai.preferredEntrypoints[${index}].entrypoint`,
        message: `Unknown package entrypoint "${entrypoint.entrypoint}".`,
      });
    }
  }

  return issues;
}

function schemaIssuesFrom(
  errors: ErrorObject[] | null | undefined,
): ManifestValidationIssue[] {
  return (errors ?? []).map((error) => ({
    kind: "schema",
    path: error.instancePath || "/",
    message: error.message ?? `Schema keyword "${error.keyword}" failed.`,
  }));
}

function validateManifestSelector(
  selector: ManifestSelector,
  layerIds: Set<string>,
  packageNames: Set<string>,
  path: string,
): ManifestValidationIssue[] {
  if (selector.startsWith("layer:")) {
    const layerId = selector.slice("layer:".length);

    return layerIds.has(layerId)
      ? []
      : [
          {
            kind: "semantic",
            path,
            message: `Unknown layer selector "${selector}".`,
          },
        ];
  }

  const packageName = selector.slice("package:".length);

  return packageNames.has(packageName)
    ? []
    : [
        {
          kind: "semantic",
          path,
          message: `Unknown package selector "${selector}".`,
        },
      ];
}

function validateDependencyTargetSelector(
  selector: DependencyTargetSelector,
  layerIds: Set<string>,
  packageNames: Set<string>,
  path: string,
): ManifestValidationIssue[] {
  if (selector === "external") {
    return [];
  }

  return validateManifestSelector(selector, layerIds, packageNames, path);
}

function matchesAllowedTarget(
  allowedTargets: DependencyTargetSelector[],
  dependencyName: string,
  dependencyLayer: string,
): boolean {
  const packageSelector = `package:${dependencyName}`;
  const layerSelector = `layer:${dependencyLayer}`;

  return allowedTargets.some(
    (target) => target === packageSelector || target === layerSelector,
  );
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
