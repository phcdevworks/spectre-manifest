import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import type { ErrorObject } from "ajv";
import { loadManifestSchema } from "./schema.js";
import type {
  DependencyTargetSelector,
  ManifestSelector,
  SpectreManifest,
} from "./types.js";

const require = createRequire(import.meta.url);
const { default: Ajv2020 } = require("ajv/dist/2020.js") as {
  default: typeof import("ajv/dist/2020.js").default;
};
const { default: addFormats } = require("ajv-formats") as {
  default: typeof import("ajv-formats").default;
};

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
  const layerOrderOwners = new Map<number, string>();

  for (const [layerId, layer] of Object.entries(manifest.layers)) {
    const existingOrderOwner = layerOrderOwners.get(layer.order);

    if (existingOrderOwner !== undefined) {
      issues.push({
        kind: "semantic",
        path: `layers.${layerId}.order`,
        message: `Duplicate layer order "${layer.order}" already used by "${existingOrderOwner}".`,
      });
    } else {
      layerOrderOwners.set(layer.order, layerId);
    }

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

  for (const layerId of layerIds) {
    if (!dependencyRules.has(layerId)) {
      issues.push({
        kind: "semantic",
        path: "rules.dependencyDirection",
        message: `No dependencyDirection rule exists for layer "${layerId}".`,
      });
    }
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

      const declaredConsumers = manifest.packages[dependencyName]?.consumers;

      if (
        declaredConsumers !== undefined &&
        !declaredConsumers.includes(packageName)
      ) {
        issues.push({
          kind: "semantic",
          path: dependencyPath,
          message: `Dependency "${dependencyName}" does not declare "${packageName}" as a matching consumer.`,
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
        continue;
      }

      const consumerDependencies = manifest.packages[consumerName]?.dependencies ?? [];

      if (!consumerDependencies.includes(packageName)) {
        issues.push({
          kind: "semantic",
          path: `${packagePath}.consumers[${index}]`,
          message: `Consumer "${consumerName}" does not declare a matching dependency on "${packageName}".`,
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

  issues.push(
    ...findCycles(
      "layers",
      manifest.layers,
      (layer) => layer.dependsOn ?? [],
      (layerId) => `layers.${layerId}.dependsOn`,
      "Layer dependency cycle detected",
    ),
  );
  issues.push(
    ...findCycles(
      "packages",
      manifest.packages,
      (packageDefinition) => packageDefinition.dependencies ?? [],
      (packageName) => `packages["${packageName}"].dependencies`,
      "Package dependency cycle detected",
    ),
  );

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

function findCycles<TNode>(
  graphName: string,
  nodes: Record<string, TNode>,
  getDependencies: (node: TNode) => string[],
  pathForNode: (nodeId: string) => string,
  messagePrefix: string,
): ManifestValidationIssue[] {
  const issues: ManifestValidationIssue[] = [];
  const visited = new Set<string>();
  const active = new Set<string>();
  const pathStack: string[] = [];
  const reportedCycles = new Set<string>();

  function visit(nodeId: string): void {
    if (visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);
    active.add(nodeId);
    pathStack.push(nodeId);

    const node = nodes[nodeId];

    if (node !== undefined) {
      for (const dependencyId of getDependencies(node)) {
        if (!(dependencyId in nodes)) {
          continue;
        }

        if (active.has(dependencyId)) {
          const cycleStartIndex = pathStack.indexOf(dependencyId);
          const cycle = [...pathStack.slice(cycleStartIndex), dependencyId];
          const cycleKey = `${graphName}:${cycle.join("->")}`;

          if (!reportedCycles.has(cycleKey)) {
            reportedCycles.add(cycleKey);
            issues.push({
              kind: "semantic",
              path: pathForNode(nodeId),
              message: `${messagePrefix}: ${cycle.join(" -> ")}.`,
            });
          }

          continue;
        }

        visit(dependencyId);
      }
    }

    pathStack.pop();
    active.delete(nodeId);
  }

  for (const nodeId of Object.keys(nodes)) {
    visit(nodeId);
  }

  return issues;
}
