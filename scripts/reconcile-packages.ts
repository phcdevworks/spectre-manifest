import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// Types (inline — avoids importing from the package build)
// ---------------------------------------------------------------------------

interface PackageEntry {
  role: string
  layer: string
  stability: string
  description?: string
  exports: string[]
  dependencies?: string[]
  allowedTargets?: string[]
  notes?: string[]
}

interface SpectreManifest {
  packages: Record<string, PackageEntry>
}

interface DriftField {
  field: string
  central: unknown
  satellite: unknown
}

interface PackageResult {
  name: string
  repoName: string
  status: 'ok' | 'drift' | 'fetch-error' | 'missing-entry'
  drift: DriftField[]
  error?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sortedArray(arr: string[] | undefined): string[] {
  return [...(arr ?? [])].sort()
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

function compareEntries(
  central: PackageEntry,
  satellite: PackageEntry,
): DriftField[] {
  const drift: DriftField[] = []

  if (central.role !== satellite.role) {
    drift.push({ field: 'role', central: central.role, satellite: satellite.role })
  }

  if (central.layer !== satellite.layer) {
    drift.push({ field: 'layer', central: central.layer, satellite: satellite.layer })
  }

  if (central.stability !== satellite.stability) {
    drift.push({ field: 'stability', central: central.stability, satellite: satellite.stability })
  }

  const centralExports = sortedArray(central.exports)
  const satelliteExports = sortedArray(satellite.exports)
  if (!arraysEqual(centralExports, satelliteExports)) {
    drift.push({ field: 'exports', central: centralExports, satellite: satelliteExports })
  }

  const centralDeps = sortedArray(
    (central.dependencies ?? []).filter(d => d.startsWith('@phcdevworks/')),
  )
  const satelliteDeps = sortedArray(
    (satellite.dependencies ?? []).filter(d => d.startsWith('@phcdevworks/')),
  )
  if (!arraysEqual(centralDeps, satelliteDeps)) {
    drift.push({ field: 'dependencies', central: centralDeps, satellite: satelliteDeps })
  }

  return drift
}

function rawUrl(repoName: string): string {
  return `https://raw.githubusercontent.com/phcdevworks/${repoName}/main/spectre.manifest.json`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const centralPath = join(repoRoot, 'spectre.manifest.json')

const central = JSON.parse(readFileSync(centralPath, 'utf8')) as SpectreManifest

// Skip governance package — it has no satellite manifest to compare
const SKIP = new Set(['@phcdevworks/spectre-manifest'])

const packageNames = Object.keys(central.packages).filter(n => !SKIP.has(n))

console.log(`Reconciling ${packageNames.length} packages against central manifest...\n`)

const results: PackageResult[] = await Promise.all(
  packageNames.map(async (pkgName): Promise<PackageResult> => {
    const repoName = pkgName.replace('@phcdevworks/', '')
    const url = rawUrl(repoName)

    let satellite: SpectreManifest
    try {
      const res = await fetch(url)
      if (!res.ok) {
        return {
          name: pkgName,
          repoName,
          status: 'fetch-error',
          drift: [],
          error: `HTTP ${res.status} from ${url}`,
        }
      }
      satellite = (await res.json()) as SpectreManifest
    } catch (err) {
      return {
        name: pkgName,
        repoName,
        status: 'fetch-error',
        drift: [],
        error: err instanceof Error ? err.message : String(err),
      }
    }

    const satelliteEntry = satellite.packages[pkgName]
    if (satelliteEntry === undefined) {
      return {
        name: pkgName,
        repoName,
        status: 'missing-entry',
        drift: [],
        error: `Package "${pkgName}" not found in satellite packages registry`,
      }
    }

    const centralEntry = central.packages[pkgName]
    const drift = compareEntries(centralEntry, satelliteEntry)

    return {
      name: pkgName,
      repoName,
      status: drift.length === 0 ? 'ok' : 'drift',
      drift,
    }
  }),
)

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

let hasIssues = false

for (const result of results) {
  if (result.status === 'ok') {
    console.log(`✓  ${result.name}`)
    continue
  }

  hasIssues = true

  if (result.status === 'fetch-error' || result.status === 'missing-entry') {
    console.log(`✗  ${result.name}`)
    console.log(`   ${result.status}: ${result.error}`)
    continue
  }

  // drift
  console.log(`△  ${result.name}`)
  for (const d of result.drift) {
    const centralStr = JSON.stringify(d.central)
    const satelliteStr = JSON.stringify(d.satellite)
    console.log(`   ${d.field}:`)
    console.log(`     central  : ${centralStr}`)
    console.log(`     satellite: ${satelliteStr}`)
  }
}

console.log()

if (hasIssues) {
  const driftCount = results.filter(r => r.status === 'drift').length
  const errorCount = results.filter(r => r.status === 'fetch-error' || r.status === 'missing-entry').length
  console.log(`${driftCount} package(s) with drift, ${errorCount} error(s).`)
  console.log('Update spectre.manifest.json to match the satellite manifests, or vice versa.')
  process.exit(1)
} else {
  console.log('All packages in sync.')
}
