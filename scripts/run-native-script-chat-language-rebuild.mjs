import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const tempRoot = await mkdtemp(path.join(tmpdir(), 'predicta-native-script-'));
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
        path.join(repoRoot, 'packages/types/src/**/*.ts'),
      ],
    },
    null,
    2,
  ),
);

function assertNativeScript(label, value, pattern) {
  assert.match(value, pattern, `${label} should contain native script`);
}

function assertNoOldChatOutput(label, value) {
  const banned = [
    /Hinglish tone/i,
    /Gujarati tone/i,
    /ready hai/i,
    /ready chhe/i,
    /Ask dabaiye/i,
    /Ask dabavo/i,
    /context carry/i,
    /Yeh KP/i,
    /Aa KP/i,
    /Signature Predicta mode: main/i,
    /Signature Predicta mode: hu/i,
    /Mujhe abhi/i,
    /Mane haju/i,
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

  const modulePath = path.join(
    outDir,
    'packages/astrology/src/predictaChatActions.js',
  );
  const {
    buildEnglishSwitchDecisionReply,
    buildEnglishSwitchPrompt,
    buildPredictaActionReply,
  } = await import(pathToFileURL(modulePath).href);

  const hiPrompt = buildEnglishSwitchPrompt('hi');
  assertNativeScript('Hindi English-switch prompt', hiPrompt, devanagari);
  assertNoOldChatOutput('Hindi English-switch prompt', hiPrompt);

  const guPrompt = buildEnglishSwitchPrompt('gu');
  assertNativeScript('Gujarati English-switch prompt', guPrompt, gujarati);
  assertNoOldChatOutput('Gujarati English-switch prompt', guPrompt);

  const hiReject = buildEnglishSwitchDecisionReply({
    currentLanguage: 'hi',
    decision: 'reject',
  });
  assertNativeScript('Hindi English-switch reject reply', hiReject, devanagari);

  const guReject = buildEnglishSwitchDecisionReply({
    currentLanguage: 'gu',
    decision: 'reject',
  });
  assertNativeScript('Gujarati English-switch reject reply', guReject, gujarati);

  const hiKpHandoff = buildPredictaActionReply({
    language: 'hi',
    predictaSchool: 'PARASHARI',
    text: 'KP sub lord se job change batao',
  });
  assert.equal(hiKpHandoff.handled, true);
  assertNativeScript('Hindi KP handoff', hiKpHandoff.text, devanagari);
  assertNoOldChatOutput('Hindi KP handoff', hiKpHandoff.text);

  const guSignature = buildPredictaActionReply({
    language: 'gu',
    predictaSchool: 'SIGNATURE',
    text: 'Signature Predicta context observed traits large size upward slant',
  });
  assert.equal(guSignature.handled, true);
  assertNativeScript('Gujarati signature reply', guSignature.text, gujarati);
  assertNoOldChatOutput('Gujarati signature reply', guSignature.text);

  const hiNeedKundli = buildPredictaActionReply({
    language: 'hi',
    predictaSchool: 'PARASHARI',
    text: 'Read my mahadasha timing',
  });
  assert.equal(hiNeedKundli.handled, true);
  assertNativeScript('Hindi needs-Kundli reply', hiNeedKundli.text, devanagari);

  const sourceChecks = [
    'packages/astrology/src/predictaChatActions.ts',
    'apps/web/components/WebPridictaChat.tsx',
    'apps/mobile/src/screens/ChatScreen.tsx',
  ];
  const bannedSourceFragments = [
    'I can feel the Hinglish tone',
    'ready hai.',
    'ready chhe.',
    'Ask dabaiye',
    'Ask dabavo',
    'context carry',
    'Yeh KP Predicta',
    'Aa KP Predicta',
    'Signature Predicta mode: main',
    'Signature Predicta mode: hu',
  ];

  for (const relativePath of sourceChecks) {
    const source = await readFile(path.join(repoRoot, relativePath), 'utf8');
    for (const fragment of bannedSourceFragments) {
      assert.equal(
        source.includes(fragment),
        false,
        `${relativePath} still contains old romanized chat copy: ${fragment}`,
      );
    }
  }

  const backendAi = await readFile(path.join(repoRoot, 'backend/astro_api/ai.py'), 'utf8');
  assert.equal(
    backendAi.includes('Answer in Hinglish'),
    false,
    'backend AI prompt should not instruct Hinglish output',
  );
  assert.equal(
    backendAi.includes('Gujarati/Hinglish-style'),
    false,
    'backend AI prompt should not instruct Gujlish output',
  );
  assert.equal(
    backendAi.includes('Roman/Hindi-friendly'),
    false,
    'backend AI prompt should not instruct romanized Hindi output',
  );

  console.log('Native-script Predicta chat language checks passed.');
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}
