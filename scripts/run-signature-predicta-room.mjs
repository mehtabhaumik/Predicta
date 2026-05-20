import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const tempRoot = await mkdtemp(path.join(tmpdir(), 'predicta-signature-room-'));
const tempConfig = path.join(tempRoot, 'tsconfig.json');
const outDir = path.join(tempRoot, 'dist');
const devanagari = /[\u0900-\u097F]/;
const gujarati = /[\u0A80-\u0AFF]/;

function assertNoOldRomanizedSpecialistCopy(label, value) {
  const banned = [
    /Signature Predicta mode:/i,
    /visual traits/i,
    /Observed traits/i,
    /Writing rhythm/i,
    /Confidence expression/i,
    /Improvement plan/i,
    /guesswork/i,
  ];

  for (const pattern of banned) {
    assert.doesNotMatch(value, pattern, `${label} leaked old romanized copy`);
  }
}

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
    'packages/astrology/src/predictaChatActions.js',
  );
  const { buildPredictaActionReply } = await import(pathToFileURL(modulePath).href);

  const handoff = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'PARASHARI',
    text: 'Can you analyze my signature and suggest improvements?',
  });
  assert.equal(handoff.handled, true);
  assert.equal(handoff.action, 'signature-handoff');
  assert.match(handoff.text, /belongs to Signature Predicta/i);
  assert.match(handoff.text, /not casually mix/i);

  const room = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'SIGNATURE',
    text: 'Open Signature Predicta. Use these confirmed signature traits. Signature Predicta context: Observed traits: Baseline upward; Pressure heavy.',
  });
  assert.equal(room.handled, true);
  assert.equal(room.action, 'signature-predicta');
  assert.match(room.text, /Signature Predicta mode/i);
  assert.match(room.text, /confirmed signature traits/i);
  assert.match(room.text, /Writing rhythm/i);
  assert.match(room.text, /Confidence expression/i);
  assert.match(room.text, /Improvement plan/i);
  assert.match(room.text, /identity verification/i);
  assert.doesNotMatch(room.text, /send date of birth/i);

  const hindiRoom = buildPredictaActionReply({
    language: 'hi',
    predictaSchool: 'SIGNATURE',
    text: 'Meri signature reading karo',
  });
  assert.equal(hindiRoom.handled, true);
  assert.equal(hindiRoom.action, 'signature-predicta');
  assert.match(hindiRoom.text, devanagari);
  assert.match(hindiRoom.text, /हस्ताक्षर प्रेडिक्टा मोड/);
  assertNoOldRomanizedSpecialistCopy('Hindi signature reply', hindiRoom.text);

  const gujaratiRoom = buildPredictaActionReply({
    language: 'gu',
    predictaSchool: 'SIGNATURE',
    text: 'Signature Predicta context observed traits large size upward baseline heavy pressure',
  });
  assert.equal(gujaratiRoom.handled, true);
  assert.equal(gujaratiRoom.action, 'signature-predicta');
  assert.match(gujaratiRoom.text, gujarati);
  assert.match(gujaratiRoom.text, /હસ્તાક્ષર પ્રેડિક્ટા મોડ/);
  assertNoOldRomanizedSpecialistCopy('Gujarati signature reply', gujaratiRoom.text);

  console.log('Signature Predicta room passed: deterministic handoff, interpretation, and native-script checks.');
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}
