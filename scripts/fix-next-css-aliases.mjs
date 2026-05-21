import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const repoRoot = resolve(new URL('..', import.meta.url).pathname);
const webRoot = join(repoRoot, 'apps', 'web');
const nextRoot = join(webRoot, '.next');
const manifestPath = join(nextRoot, 'app-build-manifest.json');
const staticCssRoot = join(nextRoot, 'static', 'css');

if (!existsSync(manifestPath) || !existsSync(staticCssRoot)) {
  process.exit(0);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const aliasTargets = new Set();

for (const files of Object.values(manifest.pages ?? {})) {
  for (const file of files) {
    if (typeof file === 'string' && file.startsWith('static/css/app/') && file.endsWith('.css')) {
      aliasTargets.add(file);
    }
  }
}

if (!aliasTargets.size) {
  process.exit(0);
}

const topLevelCssFiles = readdirSync(staticCssRoot)
  .filter(entry => entry.endsWith('.css'))
  .map(entry => {
    const filePath = join(staticCssRoot, entry);
    return {
      filePath,
      size: statSync(filePath).size,
    };
  })
  .sort((left, right) => right.size - left.size);

const sourceCss = topLevelCssFiles[0]?.filePath;

if (!sourceCss) {
  throw new Error('No emitted Next CSS bundle was found to satisfy app CSS aliases.');
}

for (const aliasTarget of aliasTargets) {
  const destination = join(nextRoot, aliasTarget);

  if (existsSync(destination)) {
    continue;
  }

  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(sourceCss, destination);
  console.log(`Created Next CSS alias: ${aliasTarget} -> ${sourceCss.replace(`${nextRoot}/`, '')}`);
}
