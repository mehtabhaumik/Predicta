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
    /Numerology Predicta mode:/i,
    /Numerology Predicta ready/i,
    /Signature Predicta mode:/i,
    /name number/i,
    /birth number/i,
    /destiny number/i,
    /Current rhythm/i,
    /Useful insight/i,
    /Number proof/i,
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
    preparePredictaLanguageContext,
    buildEnglishSwitchDecisionReply,
    buildEnglishSwitchPrompt,
    buildPredictaActionReply,
  } = await import(pathToFileURL(modulePath).href);

  const hiPrompt = buildEnglishSwitchPrompt('hi');
  assert.match(
    hiPrompt,
    /continue in English/i,
    'Hindi English-switch prompt should no longer ask permission loops',
  );
  assert.doesNotMatch(
    hiPrompt,
    /क्या मैं यह conversation/i,
    'Hindi English-switch prompt must not ask permission to switch',
  );

  const guPrompt = buildEnglishSwitchPrompt('gu');
  assert.match(
    guPrompt,
    /continue in English/i,
    'Gujarati English-switch prompt should no longer ask permission loops',
  );
  assert.doesNotMatch(
    guPrompt,
    /શું હું આ conversation/i,
    'Gujarati English-switch prompt must not ask permission to switch',
  );

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

  const staleHindiContext = preparePredictaLanguageContext({
    memory: { preferredLanguageStyle: 'hi' },
    selectedLanguage: 'hi',
    text: 'What timing activates House 8 in D2 with D1 anchoring?',
  });
  assert.equal(
    staleHindiContext.responseLanguage,
    'en',
    'English chart questions must stay English even if the stored reply language was Hindi.',
  );
  assert.equal(
    staleHindiContext.acknowledgement,
    undefined,
    'English chart questions must not trigger a language negotiation acknowledgement.',
  );

  const staleGujaratiContext = preparePredictaLanguageContext({
    memory: { preferredLanguageStyle: 'gu' },
    selectedLanguage: 'gu',
    text: 'Explain House 8 simply.',
  });
  assert.equal(
    staleGujaratiContext.responseLanguage,
    'en',
    'English questions must stay English even if the stored reply language was Gujarati.',
  );
  assert.equal(
    staleGujaratiContext.acknowledgement,
    undefined,
    'English questions must not trigger a Gujarati language negotiation acknowledgement.',
  );

  const explicitHindiContext = preparePredictaLanguageContext({
    selectedLanguage: 'en',
    text: 'Reply in Hindi please',
  });
  assert.equal(
    explicitHindiContext.responseLanguage,
    'hi',
    'Explicit Hindi requests must still switch to Hindi.',
  );

  const scriptHindiContext = preparePredictaLanguageContext({
    selectedLanguage: 'en',
    text: 'मुझे करियर के बारे में बताओ',
  });
  assert.equal(
    scriptHindiContext.responseLanguage,
    'hi',
    'Native Hindi script input must still route to Hindi.',
  );
  assert.equal(
    scriptHindiContext.acknowledgement,
    undefined,
    'Native Hindi script input should answer directly instead of starting a meta language conversation.',
  );

  const scriptGujaratiContext = preparePredictaLanguageContext({
    selectedLanguage: 'en',
    text: 'મને કારકિર્દી વિશે કહો',
  });
  assert.equal(
    scriptGujaratiContext.responseLanguage,
    'gu',
    'Native Gujarati script input must still route to Gujarati.',
  );
  assert.equal(
    scriptGujaratiContext.acknowledgement,
    undefined,
    'Native Gujarati script input should answer directly instead of starting a meta language conversation.',
  );

  const hiKpHandoff = buildPredictaActionReply({
    language: 'hi',
    predictaSchool: 'PARASHARI',
    text: 'KP sub lord se job change batao',
  });
  assert.equal(hiKpHandoff.handled, true);
  assert.match(
    hiKpHandoff.text,
    /KP Predicta|English/i,
    'English-script KP handoff should stay readable and avoid forced Hindi switching.',
  );
  assert.doesNotMatch(
    hiKpHandoff.text,
    /क्या मैं यह conversation|switch to English/i,
    'English-script KP handoff must not trigger a language-switch loop.',
  );

  const guSignature = buildPredictaActionReply({
    language: 'gu',
    predictaSchool: 'SIGNATURE',
    text: 'Signature Predicta context observed traits large size upward slant',
  });
  assert.equal(guSignature.handled, true);
  assert.match(
    guSignature.text,
    /Signature Predicta|English/i,
    'English-script signature replies should stay readable and avoid forced Gujarati switching.',
  );
  assert.doesNotMatch(
    guSignature.text,
    /શું હું આ conversation|switch to English/i,
    'English-script signature replies must not trigger a language-switch loop.',
  );

  const hiNeedKundli = buildPredictaActionReply({
    language: 'hi',
    predictaSchool: 'PARASHARI',
    text: 'Read my mahadasha timing',
  });
  assert.equal(hiNeedKundli.handled, true);
  assert.match(
    hiNeedKundli.text,
    /Kundli|English/i,
    'English needs-Kundli reply should stay in English instead of forcing Hindi.',
  );

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
    'Numerology Predicta mode: मैं',
    'Numerology Predicta mode: હું',
    'Numerology Predicta ready है',
    'Numerology Predicta ready છે',
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
