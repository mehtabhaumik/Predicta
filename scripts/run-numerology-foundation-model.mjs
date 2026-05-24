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
  assert.equal(
    profile.identityDashboard.lifeThemeSentence,
    'Your number pattern asks you to turn structure into expression while keeping structure steady.',
  );
  assert.equal(profile.identityDashboard.nameScanner.compound, 40);
  assert.equal(profile.identityDashboard.nameScanner.root, 4);
  assert.equal(profile.identityDashboard.nameScanner.steps.length, 12);
  assert.equal(
    profile.identityDashboard.nameScanner.reducedExpression,
    '2 + 5 + 1 + 6 + 4 + 1 + 2 + 4 + 5 + 5 + 4 + 1 -> 40/4',
  );
  assert.deepEqual(profile.identityDashboard.missingNumbers, [3, 7]);
  assert.deepEqual(profile.identityDashboard.strongNumbers, [1, 2, 4, 5]);
  assert.equal(profile.identityDashboard.frequencyMap.length, 9);
  assert.equal(profile.identityDashboard.frequencyMap[0].count, 4);
  assert.equal(profile.identityDashboard.frequencyMap[2].tone, 'missing');
  assert.equal(profile.identityDashboard.personalYearTimeline.length, 12);
  assert.equal(profile.identityDashboard.personalYearTimeline[0].keyword, 'Explore');
  assert.equal(profile.identityDashboard.personalYearTimeline[4].keyword, 'Close');
  assert.equal(
    profile.identityDashboard.nameRefinement.currentNameFit.score,
    84,
  );
  assert.equal(profile.identityDashboard.compatibilityLens.status, 'pending');
  assert.match(
    profile.identityDashboard.supportiveToolkit.framing,
    /not as guaranteed lucky rules/,
  );

  const hindiProfile = composeNumerologyFoundationModel(
    {
      birthDate: '1980-08-22',
      name: 'Bhaumik Mehta',
      targetDate: '2026-05-19',
    },
    'hi',
  );
  assert.equal(hindiProfile.nameNumber.label, 'निर्माता');
  assert.match(hindiProfile.summary, /भाग्य अंक 3/);
  assert.match(hindiProfile.guidance, /निजी वर्ष 4/);
  assert.match(hindiProfile.evidence[0], /नाम अंक 4/);
  assert.match(hindiProfile.identityDashboard.lifeThemeSentence, /अंक पैटर्न/);

  const gujaratiProfile = composeNumerologyFoundationModel(
    {
      birthDate: '1980-08-22',
      name: 'Bhaumik Mehta',
      targetDate: '2026-05-19',
    },
    'gu',
  );
  assert.equal(gujaratiProfile.nameNumber.label, 'નિર્માતા');
  assert.match(gujaratiProfile.summary, /ભાગ્ય અંક 3/);
  assert.match(gujaratiProfile.guidance, /વ્યક્તિગત વર્ષ 4/);
  assert.match(gujaratiProfile.evidence[0], /નામ અંક 4/);
  assert.match(gujaratiProfile.identityDashboard.lifeThemeSentence, /અંક પેટર્ન/);

  assert.throws(
    () => calculateDestinyNumber('1980-22-08'),
    /valid calendar date/,
  );

  console.log('Numerology foundation model passed: deterministic English, Hindi, and Gujarati assertions.');
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}
