export type ManifestVersion = "0.1";

export type PackageStability = "experimental" | "beta" | "stable" | "deprecated";

export type ManifestSelector = `layer:${string}` | `package:${string}`;

export type DependencyTargetSelector = ManifestSelector | "external";

export type AiEntrypointKind = "package" | "file" | "command";

export interface SpectreManifest {
  $schema?: string;
  $id?: string;
  schemaVersion: ManifestVersion;
  system: SpectreSystemMetadata;
  layers: LayerRegistry;
  packages: PackageRegistry;
  rules: ManifestRules;
  ai: ManifestAiGuidance;
}

export interface SpectreSystemMetadata {
  name: string;
  version: string;
  manifestVersion: ManifestVersion;
  summary?: string;
  packageManager?: string;
  repository?: string;
  notes?: string[];
}

export type LayerRegistry = Record<string, SpectreLayerDefinition>;

export interface SpectreLayerDefinition {
  title: string;
  description: string;
  order: number;
  dependsOn?: string[];
  notes?: string[];
}

export type PackageRegistry = Record<string, SpectrePackageDefinition>;

export interface SpectrePackageDefinition {
  role: string;
  layer: string;
  stability: PackageStability;
  description: string;
  exports: string[];
  dependencies?: string[];
  consumers?: string[];
  allowedTargets?: DependencyTargetSelector[];
  notes?: string[];
}

export interface ManifestRules {
  dependencyDirection: LayerDependencyRule[];
  forbiddenImports: ForbiddenImportRule[];
  boundaryConstraints: BoundaryConstraint[];
}

export interface LayerDependencyRule {
  fromLayer: string;
  allowedLayers: string[];
  notes?: string[];
}

export interface ForbiddenImportRule {
  source: ManifestSelector;
  target: ManifestSelector;
  reason: string;
}

export interface BoundaryConstraint {
  scope: ManifestSelector;
  rule: string;
  reason: string;
}

export interface ManifestAiGuidance {
  preferredEntrypoints: AiEntrypoint[];
  generationRules: string[];
  usageGuidance: string[];
  safeDefaults: string[];
}

export interface AiEntrypoint {
  task: string;
  kind: AiEntrypointKind;
  entrypoint: string;
  notes?: string[];
}
