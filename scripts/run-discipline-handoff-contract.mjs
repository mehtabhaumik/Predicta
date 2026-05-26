import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const tempRoot = await mkdtemp(path.join(tmpdir(), 'predicta-discipline-contract-'));
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
        path.join(repoRoot, 'packages/config/src/translations/**/*.json'),
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

  const modulePath = path.join(
    outDir,
    'packages/astrology/src/predictaChatActions.js',
  );
  const { buildPredictaActionReply } = await import(pathToFileURL(modulePath).href);

  const parashariToKp = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'PARASHARI',
    text: 'Will KP sub lord show my job change?',
  });
  assert.equal(parashariToKp.handled, true);
  assert.equal(parashariToKp.action, 'kp-handoff');
  assert.match(parashariToKp.text, /belongs to KP Predicta/i);
  assert.match(parashariToKp.text, /will not mix KP with D1\/Varga/i);

  const kpRoomOwnMethod = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'KP',
    text: 'In KP Predicta, will my job change happen?',
  });
  assert.equal(kpRoomOwnMethod.handled, true);
  assert.equal(kpRoomOwnMethod.action, 'kp-predicta');
  assert.doesNotMatch(kpRoomOwnMethod.text, /Open KP Predicta/i);

  const kpRoomParashariTrigger = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'KP',
    text: 'Show my D9 chart and mahadasha timing.',
  });
  assert.equal(kpRoomParashariTrigger.handled, true);
  assert.equal(kpRoomParashariTrigger.action, 'vedic-handoff');
  assert.match(kpRoomParashariTrigger.text, /belongs to Vedic Predicta/i);
  assert.match(kpRoomParashariTrigger.text, /will carry your question and active Kundli/i);

  const parashariToNadi = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'PARASHARI',
    text: 'Use Nadi Predicta for this repeated life pattern.',
  });
  assert.equal(parashariToNadi.handled, true);
  assert.equal(parashariToNadi.action, 'nadi-handoff');
  assert.match(parashariToNadi.text, /belongs to Nadi Predicta/i);
  assert.match(parashariToNadi.text, /does not claim real palm-leaf manuscript access/i);

  const nadiRoomOwnMethod = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'NADI',
    text: 'Nadi Predicta should read this pattern.',
  });
  assert.equal(nadiRoomOwnMethod.handled, true);
  assert.equal(nadiRoomOwnMethod.action, 'nadi-predicta');
  assert.doesNotMatch(nadiRoomOwnMethod.text, /Open Nadi Predicta/i);

  const nadiRoomParashariTrigger = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'NADI',
    text: 'Show my mahadasha and chart proof.',
  });
  assert.equal(nadiRoomParashariTrigger.handled, true);
  assert.equal(nadiRoomParashariTrigger.action, 'vedic-handoff');
  assert.match(nadiRoomParashariTrigger.text, /wrong specialist room/i);

  const numerologyRoomParashariTrigger = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'NUMEROLOGY',
    text: 'Show my dasha and chart proof.',
  });
  assert.equal(numerologyRoomParashariTrigger.handled, true);
  assert.equal(numerologyRoomParashariTrigger.action, 'vedic-handoff');

  const signatureRoomParashariTrigger = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'SIGNATURE',
    text: 'Show my dasha and report.',
  });
  assert.equal(signatureRoomParashariTrigger.handled, true);
  assert.equal(signatureRoomParashariTrigger.action, 'vedic-handoff');

  const signatureToNumerology = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'SIGNATURE',
    text: 'Can numerology compare my name number?',
  });
  assert.equal(signatureToNumerology.handled, true);
  assert.equal(signatureToNumerology.action, 'numerology-handoff');

  const numerologyToSignature = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'NUMEROLOGY',
    text: 'Read my signature improvement from the uploaded sample.',
  });
  assert.equal(numerologyToSignature.handled, true);
  assert.equal(numerologyToSignature.action, 'signature-handoff');

  const kpToNadi = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'KP',
    text: 'Use Nadi story links for this repeating pattern.',
  });
  assert.equal(kpToNadi.handled, true);
  assert.equal(kpToNadi.action, 'nadi-handoff');

  const nadiToKp = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'NADI',
    text: 'Use KP sub lord for this job change event.',
  });
  assert.equal(nadiToKp.handled, true);
  assert.equal(nadiToKp.action, 'kp-handoff');

  const parashariOwnMethod = buildPredictaActionReply({
    language: 'en',
    predictaSchool: 'PARASHARI',
    text: 'Read my D1 and mahadasha timing.',
  });
  assert.equal(parashariOwnMethod.handled, true);
  assert.equal(parashariOwnMethod.action, 'mahadasha');

  const webChat = await readFile(
    path.join(repoRoot, 'apps/web/components/WebPridictaChat.tsx'),
    'utf8',
  );
  assert.match(webChat, /Context was carried from/);
  assert.match(webChat, /The method will not be mixed/);
  assert.match(webChat, /function parsePredictaSchool/);

  const mobileChat = await readFile(
    path.join(repoRoot, 'apps/mobile/src/screens/ChatScreen.tsx'),
    'utf8',
  );
  assert.match(mobileChat, /Context was carried from/);
  assert.match(mobileChat, /The method will not be mixed/);

  const backendAi = await readFile(
    path.join(repoRoot, 'backend/astro_api/ai.py'),
    'utf8',
  );
  assert.match(backendAi, /Signature Predicta is a separate signature-analysis room/);
  assert.match(backendAi, /If activeContext\.predictaSchool is SIGNATURE/);
  assert.match(backendAi, /disciplineHandoff\.requiresHandoff is true/);
  assert.match(backendAi, /build_discipline_handoff_context/);

  console.log('Discipline handoff contract passed: 42 deterministic assertions.');
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
