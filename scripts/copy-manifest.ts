import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '..');

const source = resolve(repoRoot, 'spectre.manifest.json');
const destination = resolve(repoRoot, 'packages/spectre-manifest/spectre.manifest.json');

copyFileSync(source, destination);
