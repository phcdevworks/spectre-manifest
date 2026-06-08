import type {
  AiEntrypoint,
  ForbiddenImportRule,
  LayerDependencyRule,
  BoundaryConstraint,
  SpectreManifest,
  SpectreLayerDefinition,
  SpectrePackageDefinition,
} from "./types.js";

export type ManifestChangeClassification = "additive" | "semantic" | "breaking";

export interface ManifestChange {
  classification: ManifestChangeClassification;
  path: string;
  message: string;
}

export interface ManifestDiffResult {
  classification: ManifestChangeClassification;
  changes: ManifestChange[];
}

const SEVERITY_ORDER: Record<ManifestChangeClassification, number> = {
  additive: 0,
  semantic: 1,
  breaking: 2,
};

export function diffManifests(
  before: SpectreManifest,
  after: SpectreManifest,
): ManifestDiffResult {
  const changes: ManifestChange[] = [];

  diffSchemaVersion(before, after, changes);
  diffSystem(before, after, changes);
  diffLayers(before, after, changes);
  diffPackages(before, after, changes);
  diffRules(before, after, changes);
  diffAiGuidance(before, after, changes);

  const classification = changes.reduce<ManifestChangeClassification>(
    (highest, change) =>
      SEVERITY_ORDER[change.classification] > SEVERITY_ORDER[highest]
        ? change.classification
        : highest,
    "additive",
  );

  return { classification, changes };
}

export function formatManifestDiff(result: ManifestDiffResult): string[] {
  return result.changes.map(
    (change) => `[${change.classification}] ${change.path}: ${change.message}`,
  );
}

function diffSchemaVersion(
  before: SpectreManifest,
  after: SpectreManifest,
  changes: ManifestChange[],
): void {
  if (before.schemaVersion !== after.schemaVersion) {
    changes.push({
      classification: "breaking",
      path: "schemaVersion",
      message: `Schema version changed from "${before.schemaVersion}" to "${after.schemaVersion}".`,
    });
  }
}

function diffSystem(
  before: SpectreManifest,
  after: SpectreManifest,
  changes: ManifestChange[],
): void {
  const path = "system";

  if (before.system.name !== after.system.name) {
    changes.push({
      classification: "breaking",
      path: `${path}.name`,
      message: `System name changed from "${before.system.name}" to "${after.system.name}".`,
    });
  }

  if (before.system.manifestVersion !== after.system.manifestVersion) {
    changes.push({
      classification: "breaking",
      path: `${path}.manifestVersion`,
      message: `Manifest version changed from "${before.system.manifestVersion}" to "${after.system.manifestVersion}".`,
    });
  }

  if (before.system.version !== after.system.version) {
    changes.push({
      classification: "semantic",
      path: `${path}.version`,
      message: `System version changed from "${before.system.version}" to "${after.system.version}".`,
    });
  }

  if (before.system.summary !== after.system.summary) {
    changes.push({
      classification: "semantic",
      path: `${path}.summary`,
      message: "System summary changed.",
    });
  }
}

function diffLayers(
  before: SpectreManifest,
  after: SpectreManifest,
  changes: ManifestChange[],
): void {
  const beforeKeys = Object.keys(before.layers);
  const afterKeys = Object.keys(after.layers);

  for (const key of afterKeys) {
    if (!(key in before.layers)) {
      changes.push({
        classification: "additive",
        path: `layers.${key}`,
        message: `Layer "${key}" was added.`,
      });
    }
  }

  for (const key of beforeKeys) {
    if (!(key in after.layers)) {
      changes.push({
        classification: "breaking",
        path: `layers.${key}`,
        message: `Layer "${key}" was removed.`,
      });
      continue;
    }

    diffLayerDefinition(key, before.layers[key]!, after.layers[key]!, changes);
  }
}

function diffLayerDefinition(
  key: string,
  before: SpectreLayerDefinition,
  after: SpectreLayerDefinition,
  changes: ManifestChange[],
): void {
  const path = `layers.${key}`;

  if (before.order !== after.order) {
    changes.push({
      classification: "semantic",
      path: `${path}.order`,
      message: `Layer "${key}" order changed from ${before.order} to ${after.order}.`,
    });
  }

  diffStringArray(
    `${path}.dependsOn`,
    before.dependsOn ?? [],
    after.dependsOn ?? [],
    changes,
    {
      added: (value) => ({
        classification: "semantic",
        message: `Layer "${key}" now depends on "${value}".`,
      }),
      removed: (value) => ({
        classification: "breaking",
        message: `Layer "${key}" no longer depends on "${value}".`,
      }),
    },
  );

  if (before.title !== after.title || before.description !== after.description) {
    changes.push({
      classification: "semantic",
      path: `${path}`,
      message: `Layer "${key}" title or description changed.`,
    });
  }
}

function diffPackages(
  before: SpectreManifest,
  after: SpectreManifest,
  changes: ManifestChange[],
): void {
  const beforeKeys = Object.keys(before.packages);
  const afterKeys = Object.keys(after.packages);

  for (const key of afterKeys) {
    if (!(key in before.packages)) {
      changes.push({
        classification: "additive",
        path: `packages.${key}`,
        message: `Package "${key}" was registered.`,
      });
    }
  }

  for (const key of beforeKeys) {
    if (!(key in after.packages)) {
      changes.push({
        classification: "breaking",
        path: `packages.${key}`,
        message: `Package "${key}" was removed from the manifest.`,
      });
      continue;
    }

    diffPackageDefinition(key, before.packages[key]!, after.packages[key]!, changes);
  }
}

function diffPackageDefinition(
  key: string,
  before: SpectrePackageDefinition,
  after: SpectrePackageDefinition,
  changes: ManifestChange[],
): void {
  const path = `packages.${key}`;

  if (before.layer !== after.layer) {
    changes.push({
      classification: "breaking",
      path: `${path}.layer`,
      message: `Package "${key}" moved from layer "${before.layer}" to "${after.layer}".`,
    });
  }

  if (before.role !== after.role) {
    changes.push({
      classification: "semantic",
      path: `${path}.role`,
      message: `Package "${key}" role changed from "${before.role}" to "${after.role}".`,
    });
  }

  if (before.stability !== after.stability) {
    changes.push({
      classification: "semantic",
      path: `${path}.stability`,
      message: `Package "${key}" stability changed from "${before.stability}" to "${after.stability}".`,
    });
  }

  diffStringArray(`${path}.exports`, before.exports, after.exports, changes, {
    added: (value) => ({
      classification: "additive",
      message: `Package "${key}" gained export "${value}".`,
    }),
    removed: (value) => ({
      classification: "breaking",
      message: `Package "${key}" lost export "${value}".`,
    }),
  });

  diffStringArray(
    `${path}.dependencies`,
    before.dependencies ?? [],
    after.dependencies ?? [],
    changes,
    {
      added: (value) => ({
        classification: "semantic",
        message: `Package "${key}" gained dependency "${value}".`,
      }),
      removed: (value) => ({
        classification: "semantic",
        message: `Package "${key}" dropped dependency "${value}".`,
      }),
    },
  );

  diffStringArray(
    `${path}.consumers`,
    before.consumers ?? [],
    after.consumers ?? [],
    changes,
    {
      added: (value) => ({
        classification: "additive",
        message: `Package "${key}" gained consumer "${value}".`,
      }),
      removed: (value) => ({
        classification: "semantic",
        message: `Package "${key}" lost consumer "${value}".`,
      }),
    },
  );

  diffStringArray(
    `${path}.allowedTargets`,
    before.allowedTargets ?? [],
    after.allowedTargets ?? [],
    changes,
    {
      added: (value) => ({
        classification: "additive",
        message: `Package "${key}" gained allowed dependency target "${value}".`,
      }),
      removed: (value) => ({
        classification: "breaking",
        message: `Package "${key}" lost allowed dependency target "${value}", which may invalidate existing dependencies.`,
      }),
    },
  );

  if (before.description !== after.description) {
    changes.push({
      classification: "semantic",
      path: `${path}.description`,
      message: `Package "${key}" description changed.`,
    });
  }
}

function diffRules(
  before: SpectreManifest,
  after: SpectreManifest,
  changes: ManifestChange[],
): void {
  diffDependencyDirectionRules(
    before.rules.dependencyDirection,
    after.rules.dependencyDirection,
    changes,
  );
  diffForbiddenImportRules(
    before.rules.forbiddenImports,
    after.rules.forbiddenImports,
    changes,
  );
  diffBoundaryConstraints(
    before.rules.boundaryConstraints,
    after.rules.boundaryConstraints,
    changes,
  );
}

function diffDependencyDirectionRules(
  before: LayerDependencyRule[],
  after: LayerDependencyRule[],
  changes: ManifestChange[],
): void {
  const path = "rules.dependencyDirection";
  const beforeByLayer = new Map(before.map((rule) => [rule.fromLayer, rule]));
  const afterByLayer = new Map(after.map((rule) => [rule.fromLayer, rule]));

  for (const [fromLayer, afterRule] of afterByLayer) {
    const beforeRule = beforeByLayer.get(fromLayer);

    if (beforeRule === undefined) {
      changes.push({
        classification: "semantic",
        path: `${path}[${fromLayer}]`,
        message: `New dependency direction rule added for layer "${fromLayer}".`,
      });
      continue;
    }

    const beforeAllowed = new Set(beforeRule.allowedLayers);
    const afterAllowed = new Set(afterRule.allowedLayers);

    for (const layer of afterAllowed) {
      if (!beforeAllowed.has(layer)) {
        changes.push({
          classification: "additive",
          path: `${path}[${fromLayer}].allowedLayers`,
          message: `Layer "${fromLayer}" may now depend on "${layer}".`,
        });
      }
    }

    for (const layer of beforeAllowed) {
      if (!afterAllowed.has(layer)) {
        changes.push({
          classification: "breaking",
          path: `${path}[${fromLayer}].allowedLayers`,
          message: `Layer "${fromLayer}" may no longer depend on "${layer}", which may invalidate existing dependencies.`,
        });
      }
    }
  }

  for (const fromLayer of beforeByLayer.keys()) {
    if (!afterByLayer.has(fromLayer)) {
      changes.push({
        classification: "breaking",
        path: `${path}[${fromLayer}]`,
        message: `Dependency direction rule for layer "${fromLayer}" was removed.`,
      });
    }
  }
}

function diffForbiddenImportRules(
  before: ForbiddenImportRule[],
  after: ForbiddenImportRule[],
  changes: ManifestChange[],
): void {
  const path = "rules.forbiddenImports";
  const key = (rule: ForbiddenImportRule) => `${rule.source} -> ${rule.target}`;
  const beforeKeys = new Set(before.map(key));
  const afterKeys = new Set(after.map(key));

  for (const rule of after) {
    if (!beforeKeys.has(key(rule))) {
      changes.push({
        classification: "breaking",
        path,
        message: `New forbidden import rule added: "${rule.source}" may no longer import "${rule.target}".`,
      });
    }
  }

  for (const rule of before) {
    if (!afterKeys.has(key(rule))) {
      changes.push({
        classification: "additive",
        path,
        message: `Forbidden import rule removed: "${rule.source}" may now import "${rule.target}".`,
      });
    }
  }
}

function diffBoundaryConstraints(
  before: BoundaryConstraint[],
  after: BoundaryConstraint[],
  changes: ManifestChange[],
): void {
  const path = "rules.boundaryConstraints";
  const key = (constraint: BoundaryConstraint) => `${constraint.scope}::${constraint.rule}`;
  const beforeKeys = new Set(before.map(key));
  const afterKeys = new Set(after.map(key));

  for (const constraint of after) {
    if (!beforeKeys.has(key(constraint))) {
      changes.push({
        classification: "semantic",
        path,
        message: `New boundary constraint added for "${constraint.scope}": ${constraint.rule}`,
      });
    }
  }

  for (const constraint of before) {
    if (!afterKeys.has(key(constraint))) {
      changes.push({
        classification: "semantic",
        path,
        message: `Boundary constraint removed for "${constraint.scope}": ${constraint.rule}`,
      });
    }
  }
}

function diffAiGuidance(
  before: SpectreManifest,
  after: SpectreManifest,
  changes: ManifestChange[],
): void {
  const path = "ai.preferredEntrypoints";
  const key = (entrypoint: AiEntrypoint) => `${entrypoint.task}::${entrypoint.kind}::${entrypoint.entrypoint}`;
  const beforeKeys = new Set(before.ai.preferredEntrypoints.map(key));
  const afterKeys = new Set(after.ai.preferredEntrypoints.map(key));

  for (const entrypoint of after.ai.preferredEntrypoints) {
    if (!beforeKeys.has(key(entrypoint))) {
      changes.push({
        classification: "additive",
        path,
        message: `New AI entrypoint added for task "${entrypoint.task}".`,
      });
    }
  }

  for (const entrypoint of before.ai.preferredEntrypoints) {
    if (!afterKeys.has(key(entrypoint))) {
      changes.push({
        classification: "breaking",
        path,
        message: `AI entrypoint for task "${entrypoint.task}" was removed.`,
      });
    }
  }

  diffStringArray(
    "ai.generationRules",
    before.ai.generationRules,
    after.ai.generationRules,
    changes,
    {
      added: () => ({ classification: "additive", message: "New AI generation rule added." }),
      removed: () => ({ classification: "semantic", message: "AI generation rule removed." }),
    },
  );

  diffStringArray("ai.usageGuidance", before.ai.usageGuidance, after.ai.usageGuidance, changes, {
    added: () => ({ classification: "additive", message: "New AI usage guidance added." }),
    removed: () => ({ classification: "semantic", message: "AI usage guidance removed." }),
  });

  diffStringArray("ai.safeDefaults", before.ai.safeDefaults, after.ai.safeDefaults, changes, {
    added: () => ({ classification: "additive", message: "New AI safe default added." }),
    removed: () => ({ classification: "semantic", message: "AI safe default removed." }),
  });
}

interface StringArrayChangeDescriptors {
  added: (value: string) => Pick<ManifestChange, "classification" | "message">;
  removed: (value: string) => Pick<ManifestChange, "classification" | "message">;
}

function diffStringArray(
  path: string,
  before: string[],
  after: string[],
  changes: ManifestChange[],
  describe: StringArrayChangeDescriptors,
): void {
  const beforeSet = new Set(before);
  const afterSet = new Set(after);

  for (const value of after) {
    if (!beforeSet.has(value)) {
      const { classification, message } = describe.added(value);
      changes.push({ classification, path, message });
    }
  }

  for (const value of before) {
    if (!afterSet.has(value)) {
      const { classification, message } = describe.removed(value);
      changes.push({ classification, path, message });
    }
  }
}
