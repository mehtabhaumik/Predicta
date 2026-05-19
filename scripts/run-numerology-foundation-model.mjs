import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const tempRoot = await mkdtemp(path.join(tmpdir(), 'predicta-numerology-'));
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

  const modulePath = path.join(
    outDir,
    'packages/astrology/src/numerologyFoundationModel.js',
  );
  const {
    calculateBirthNumber,
    calculateDestinyNumber,
    calculateNameNumber,
    calculatePersonalCycles,
    composeNumerologyFoundationModel,
    normalizeNumerologyName,
  } = await import(pathToFileURL(modulePath).href);

  assert.equal(normalizeNumerologyName('Bhaumik Mehta'), 'BHAUMIKMEHTA');
  assert.deepEqual(calculateNameNumber('Bhaumik Mehta'), {
    compound: 40,
    keywords: ['structure', 'discipline', 'foundation'],
    label: 'Builder',
    root: 4,
    simpleMeaning: 'order, practical discipline, systems, and steady foundations',
  });
  assert.equal(calculateNameNumber('Bhaumik Mehta', 'PYTHAGOREAN').compound, 49);
  assert.equal(calculateBirthNumber('1980-08-22').root, 4);
  assert.equal(calculateBirthNumber('1980-08-22').compound, 22);
  assert.equal(calculateDestinyNumber('1980-08-22').root, 3);
  assert.equal(calculateDestinyNumber('1980-08-22').compound, 30);

  const cycles = calculatePersonalCycles('1980-08-22', '2026-05-19');
  assert.equal(cycles.personalYear.compound, 22);
  assert.equal(cycles.personalYear.root, 4);
  assert.equal(cycles.personalMonth.compound, 9);
  assert.equal(cycles.personalMonth.root, 9);
  assert.equal(cycles.personalDay.compound, 28);
  assert.equal(cycles.personalDay.root, 1);

  const profile = composeNumerologyFoundationModel({
    birthDate: '1980-08-22',
    name: 'Bhaumik Mehta',
    targetDate: '2026-05-19',
  });
  assert.equal(profile.status, 'ready');
  assert.equal(profile.method.nameNumber, 'CHALDEAN');
  assert.equal(profile.nameNumber.root, 4);
  assert.equal(profile.birthNumber.root, 4);
  assert.equal(profile.destinyNumber.root, 3);
  assert.equal(profile.personalDay.root, 1);
  assert.ok(profile.evidence.length >= 4);

  assert.throws(
    () => calculateDestinyNumber('1980-22-08'),
    /valid calendar date/,
  );

  console.log('Numerology foundation model passed: 10 deterministic assertions.');
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}
