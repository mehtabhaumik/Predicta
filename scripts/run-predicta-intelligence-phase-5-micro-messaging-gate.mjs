import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const phaseName =
  'PREDICTA_INTELLIGENCE_PHASE_5_MICRO_DETAILING_AND_MICRO_MESSAGING';
const auditDir = path.join(root, 'docs/audits', phaseName);

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function assertIncludes(source, needle, label) {
  assert.equal(
    source.includes(needle),
    true,
    `${label} must include ${needle}`,
  );
}

function assertNotIncludes(source, needle, label) {
  assert.equal(
    source.includes(needle),
    false,
    `${label} must not include ${needle}`,
  );
}

const requiredIds = [
  'careerTimingFocus',
  'checkingTimingFirst',
  'deterministicModeActive',
  'elegantFunSpark',
  'kpUsefulEventQuestion',
  'kundliSelected',
  'needBirthPlacePrecision',
  'passNearingExhaustion',
  'reportReady',
  'signatureReady',
];

const roadmap = read('docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md');
assertIncludes(roadmap, `Phase 5: \`${phaseName}\``, 'roadmap');
assertIncludes(roadmap, 'Micro confirmations after actions', 'roadmap');
assertIncludes(roadmap, 'Short progress messaging', 'roadmap');
assertIncludes(roadmap, 'translation-backed', 'roadmap');

const translations = readJson('packages/config/src/translations/predictaUx.json');
for (const language of ['en', 'hi', 'gu']) {
  const copy = translations.copy[language];
  assert.ok(copy, `${language} copy must exist`);
  assert.ok(
    Array.isArray(copy.listeningMicrocopy) && copy.listeningMicrocopy.length >= 7,
    `${language} listening microcopy must include short progress messages`,
  );

  for (const id of requiredIds) {
    assert.equal(typeof copy.microMessages[id], 'string', `${language}.${id}`);
    assert.ok(copy.microMessages[id].length > 0, `${language}.${id} empty`);
    assert.ok(
      copy.microMessages[id].length <= 130,
      `${language}.${id} must stay short`,
    );
  }
}

const bannedNoisyPhrases = [
  'fortune cookie',
  'mind-blowing',
  'ultimate cosmic',
  'guaranteed',
  '100%',
  'Signature ready locally',
  'ready hai',
  'ready chhe',
];

const predictaUx = read('packages/config/src/predictaUx.ts');
assertIncludes(predictaUx, 'export type PredictaMicroMessageId', 'predictaUx');
assertIncludes(predictaUx, 'getPredictaMicroMessage', 'predictaUx');
assertIncludes(predictaUx, 'copy.microMessages[id]', 'predictaUx');

const chatActions = read('packages/astrology/src/predictaChatActions.ts');
assertIncludes(chatActions, 'getPredictaMicroMessage', 'predictaChatActions');
assertIncludes(chatActions, 'function buildMicroPrelude', 'predictaChatActions');
const chatActionIds = [
  'careerTimingFocus',
  'checkingTimingFirst',
  'deterministicModeActive',
  'kpUsefulEventQuestion',
  'kundliSelected',
  'needBirthPlacePrecision',
  'passNearingExhaustion',
  'reportReady',
];
for (const id of chatActionIds) {
  assertIncludes(chatActions, `'${id}'`, 'predictaChatActions');
}
assertIncludes(chatActions, 'mergeUnique([], messages, 2)', 'predictaChatActions');

const webChat = read('apps/web/components/WebPridictaChat.tsx');
assertIncludes(webChat, 'getPredictaMicroMessage', 'WebPridictaChat');
assertIncludes(webChat, "passCostDisplay.tone === 'careful'", 'WebPridictaChat');
assertIncludes(webChat, "'passNearingExhaustion'", 'WebPridictaChat');

const signatureFlow = read('apps/web/components/WebSignatureAnalysisInputFlow.tsx');
assertIncludes(signatureFlow, 'getPredictaMicroMessage', 'WebSignatureAnalysisInputFlow');
assertIncludes(signatureFlow, "'signatureReady'", 'WebSignatureAnalysisInputFlow');
assertNotIncludes(signatureFlow, 'Signature ready locally', 'WebSignatureAnalysisInputFlow');

const css = read('apps/web/app/globals.css');
assertIncludes(css, '.pass-cost-meter small', 'globals.css');
assertIncludes(css, 'flex-wrap: wrap;', 'globals.css');

const microcopyPayload = ['en', 'hi', 'gu']
  .map(language =>
    [
      ...translations.copy[language].listeningMicrocopy,
      ...Object.values(translations.copy[language].microMessages),
    ].join('\n'),
  )
  .join('\n');

for (const phrase of bannedNoisyPhrases) {
  assertNotIncludes(microcopyPayload, phrase, 'Phase 5 microcopy payload');
}

if (!existsSync(auditDir)) {
  await import('node:fs/promises').then(({ mkdir }) =>
    mkdir(auditDir, { recursive: true }),
  );
}

writeFileSync(
  path.join(auditDir, 'phase-5-manifest.json'),
  `${JSON.stringify(
    {
      phase: phaseName,
      status: 'green',
      requiredIds,
      strictAudit: true,
      verified: [
        'translation-backed microcopy ids',
        'short progress messages',
        'careful pass exhaustion nudge',
        'signature ready shared microcopy',
        'deterministic action micro-prelude capped at two lines',
        'no noisy banned phrases',
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(`${phaseName}: passed`);
