import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

type ChangeClassification = 'additive' | 'semantic change' | 'breaking'

type PackageJsonWithVersion = {
  version: string
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const changelogPath = join(repoRoot, 'CHANGELOG.md')
const packagePath = join(repoRoot, 'package.json')

const CLASSIFICATION_PREFIX = 'Contract change type:'
const ALLOWED: ChangeClassification[] = ['additive', 'semantic change', 'breaking']

const changelog = readFileSync(changelogPath, 'utf8')
const unreleasedSection = changelog.split('## [Unreleased]')[1]?.split('\n## [')[0] ?? ''

const classificationPattern = new RegExp(
  `${CLASSIFICATION_PREFIX}\\s*(${ALLOWED.join('|')})`,
  'i'
)
const match = unreleasedSection.match(classificationPattern)

if (!match) {
  const hasContent = unreleasedSection.trim().length > 0
  if (!hasContent) {
    console.log('No unreleased changes. No version bump needed.')
    process.exit(0)
  }
  throw new Error(
    [
      'Unreleased section has content but is missing a contract change classification.',
      `Expected: ${CLASSIFICATION_PREFIX} <${ALLOWED.join(' | ')}>`,
      'Add a classification line to CHANGELOG.md [Unreleased] before proposing a version.'
    ].join('\n')
  )
}

const classification = match[1].toLowerCase() as ChangeClassification
const pkg = JSON.parse(readFileSync(packagePath, 'utf8')) as PackageJsonWithVersion
const current = pkg.version
const [majorStr, minorStr, patchStr] = current.split('.')
const major = parseInt(majorStr, 10)
const minor = parseInt(minorStr, 10)
const patch = parseInt(patchStr, 10)

let proposed: string
let bumpType: 'major' | 'minor' | 'patch'

if (classification === 'breaking') {
  proposed = `${major + 1}.0.0`
  bumpType = 'major'
} else if (classification === 'additive' || classification === 'semantic change') {
  proposed = `${major}.${minor + 1}.0`
  bumpType = 'minor'
} else {
  proposed = `${major}.${minor}.${patch + 1}`
  bumpType = 'patch'
}

console.log(`Current version : ${current}`)
console.log(`Classification  : ${classification}`)
console.log(`Bump type       : ${bumpType}`)
console.log(`Proposed version: ${proposed}`)
