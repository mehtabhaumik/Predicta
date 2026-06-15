import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const tempRoot = await mkdtemp(path.join(tmpdir(), 'predicta-numerology-room-'));
const tempConfig = path.join(tempRoot, 'tsconfig.json');
const outDir = path.join(tempRoot, 'dist');
const devanagari = /[\u0900-\u097F]/;
const gujarati = /[\u0A80-\u0AFF]/;

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
        path.join(repoRoot, 'packages/config/src/translations/**/*.json'),
        path.join(repoRoot, 'packages/types/src/**/*.ts'),
      ],
    },
    null,
    2,
  ),
);

function buildKundliStub() {
  return {
    id: 'numerology-test',
    birthDetails: {
      date: '1980-08-22',
      name: 'Bhaumik Mehta',
      place: 'Petlad, Gujarat, India',
      time: '06:30',
    },
    dasha: {
      current: {
        antardasha: 'Saturn',
        mahadasha: 'Venus',
      },
    },
    houses: [],
    lagna: 'Leo',
    moonSign: 'Sagittarius',
    nakshatra: 'Mula',
    planets: [],
  };
}

function assertNativeScript(label, value, pattern) {
  assert.match(value, pattern, `${label} should use native script`);
}

function assertNoOldRomanizedSpecialistCopy(label, value) {
  const banned = [
    /Numerology Predicta mode:/i,
    /Numerology Predicta ready/i,
    /ready hai/i,
    /ready chhe/i,
    /name number/i,
    /birth number/i,
    /destiny number/i,
    /Current rhythm/i,
    /Useful insight/i,
    /Strengths:/i,
    /Care points:/i,
    /Number proof:/i,
    /logic mix/i,
  ];

  for (const pattern of banned) {
    assert.doesNotMatch(value, pattern, `${label} leaked old romanized copy`);
  }
}

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
    subpaths: ['uiTranslations'],
  });
  await writeWorkspacePackageRedirect({
    main: '../../../packages/types/src/index.js',
    name: '@pridicta/types',
  });

  const modulePath = path.join(
    outDir,
    'packages/astrology/src/predictaChatActions.js',
  );
  const { buildPredictaActionReply } = await import(pathToFileURL(modulePath).href);

  const handoff = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'PARASHARI',
    text: 'Can numerology compare my name number?',
  });
  assert.equal(handoff.handled, true);
  assert.equal(handoff.action, 'numerology-handoff');
  assert.match(handoff.text, /belongs to Numerology Predicta/i);
  assert.match(handoff.text, /not casually mix/i);

  const missingProfile = buildPredictaActionReply({
    language: 'hi',
    predictaSchool: 'NUMEROLOGY',
    text: 'Numerology Predicta se name reading karo',
  });
  assert.equal(missingProfile.handled, true);
  assert.equal(missingProfile.action, 'numerology-predicta');
  assertNativeScript('Hindi missing-profile numerology reply', missingProfile.text, devanagari);
  assertNoOldRomanizedSpecialistCopy('Hindi missing-profile numerology reply', missingProfile.text);

  const hindiRoom = buildPredictaActionReply({
    kundli: buildKundliStub(),
    language: 'hi',
    predictaSchool: 'NUMEROLOGY',
    text: 'Numerology Predicta se name number, destiny number aur personal year batao',
  });
  assert.equal(hindiRoom.handled, true);
  assert.equal(hindiRoom.action, 'numerology-predicta');
  assertNativeScript('Hindi numerology room reply', hindiRoom.text, devanagari);
  assert.match(hindiRoom.text, /अंक प्रेडिक्टा मोड/);
  assert.match(hindiRoom.text, /नाम अंक/);
  assert.match(hindiRoom.text, /जन्म अंक/);
  assert.match(hindiRoom.text, /भाग्य अंक/);
  assertNoOldRomanizedSpecialistCopy('Hindi numerology room reply', hindiRoom.text);

  const gujaratiRoom = buildPredictaActionReply({
    kundli: buildKundliStub(),
    language: 'gu',
    predictaSchool: 'NUMEROLOGY',
    text: 'Numerology Predicta name number destiny number personal year',
  });
  assert.equal(gujaratiRoom.handled, true);
  assert.equal(gujaratiRoom.action, 'numerology-predicta');
  assertNativeScript('Gujarati numerology room reply', gujaratiRoom.text, gujarati);
  assert.match(gujaratiRoom.text, /અંક પ્રેડિક્ટા મોડ/);
  assert.match(gujaratiRoom.text, /નામ અંક/);
  assert.match(gujaratiRoom.text, /જન્મ અંક/);
  assert.match(gujaratiRoom.text, /ભાગ્ય અંક/);
  assertNoOldRomanizedSpecialistCopy('Gujarati numerology room reply', gujaratiRoom.text);

  console.log('Numerology Predicta room passed: handoff, missing profile, native-script, and ready-profile checks.');
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}

async function writeWorkspacePackageRedirect({ main, name, subpaths = [] }) {
  const packageDir = path.join(outDir, 'node_modules', ...name.split('/'));

  await mkdir(packageDir, { recursive: true });
  await writeFile(
    path.join(packageDir, 'package.json'),
    JSON.stringify({ main, name }, null, 2),
  );
  await Promise.all(
    subpaths.map(subpath =>
      writeFile(
        path.join(packageDir, `${subpath}.js`),
        `module.exports = require('../../../packages/config/src/${subpath}.js');\n`,
      ),
    ),
  );
}
