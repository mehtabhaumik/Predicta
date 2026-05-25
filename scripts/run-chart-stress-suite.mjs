import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const tempRoot = await mkdtemp(path.join(tmpdir(), 'predicta-chart-stress-'));
const tempConfig = path.join(tempRoot, 'tsconfig.json');
const outDir = path.join(tempRoot, 'dist');

await writeFile(
  tempConfig,
  JSON.stringify(
    {
      extends: path.join(repoRoot, 'packages/astrology/tsconfig.json'),
      compilerOptions: {
        declaration: false,
        module: 'CommonJS',
        moduleResolution: 'Node',
        noEmit: false,
        outDir,
        rootDir: repoRoot,
      },
      include: [
        path.join(repoRoot, 'packages/astrology/src/**/*.ts'),
        path.join(repoRoot, 'packages/config/src/**/*.ts'),
        path.join(repoRoot, 'packages/types/src/**/*.ts'),
      ],
    },
    null,
    2,
  ),
);

try {
  const compile = spawnSync('corepack', ['pnpm', 'exec', 'tsc', '-p', tempConfig], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (compile.status !== 0) {
    process.stderr.write(compile.stdout);
    process.stderr.write(compile.stderr);
    process.exit(compile.status ?? 1);
  }

  await writeWorkspacePackageRedirect({
    main: '../../../packages/config/src/index.js',
    name: '@pridicta/config',
  });
  await writeWorkspacePackageRedirect({
    main: '../../../packages/types/src/index.js',
    name: '@pridicta/types',
  });

  const suitePath = path.join(
    outDir,
    'packages/astrology/src/chartStressSuite.js',
  );
  const { runChartStressSuite } = await import(pathToFileURL(suitePath).href);
  const result = runChartStressSuite();

  for (const item of result.cases) {
    const label = item.passed ? 'PASS' : 'FAIL';
    console.log(`${label} ${item.name}`);
    if (!item.passed && item.message) {
      console.error(item.message);
    }
  }

  if (!result.passed) {
    console.error('Chart stress suite failed.');
    process.exit(1);
  }

  console.log(`Chart stress suite passed: ${result.cases.length} cases.`);
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}

async function writeWorkspacePackageRedirect({ main, name }) {
  const packageDir = path.join(outDir, 'node_modules', ...name.split('/'));

  await mkdir(packageDir, { recursive: true });
  await writeFile(
    path.join(packageDir, 'package.json'),
    JSON.stringify({ main, name }, null, 2),
  );
}
