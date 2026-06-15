import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import Module from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_INTELLIGENCE_PHASE_2_LOCAL_MEMORY_AND_DETERMINISTIC_ROUTER';
const failures = [];

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveWorkspaceAlias(
  request,
  parent,
  isMain,
  options,
) {
  const aliases = {
    '@pridicta/ai': 'packages/ai/src/index.ts',
    '@pridicta/astrology': 'packages/astrology/src/index.ts',
    '@pridicta/config': 'packages/config/src/index.ts',
    '@pridicta/config/uiTranslations': 'packages/config/src/uiTranslations.ts',
    '@pridicta/types': 'packages/types/src/index.ts',
  };
  if (aliases[request]) {
    return path.join(repoRoot, aliases[request]);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertBefore(source, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assertGate(firstIndex >= 0, `${label}: missing ${first}`);
  assertGate(secondIndex >= 0, `${label}: missing ${second}`);
  assertGate(firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex, `${label}: ${first} must appear before ${second}`);
}

[
  'docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md',
  'docs/audits/PREDICTA_INTELLIGENCE_PHASE_1_MASTER_ASTROLOGER_RESPONSE_CONTRACT/verification.txt',
  'packages/astrology/src/predictaChatActions.ts',
  'packages/astrology/src/index.ts',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/mobile/src/screens/ChatScreen.tsx',
  'apps/web/app/api/ask-pridicta/route.ts',
  'apps/web/lib/pridicta-ai.ts',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md');
[
  phaseName,
  'Intent classification before provider calls',
  'local_memory_answer',
  'deterministic_action',
  'missing_data_question',
  'ai_required',
  'blocked_needs_credit',
  'Provider logs prove no OpenAI/Gemini calls for deterministic actions.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'intelligence roadmap phase 2'));

const {
  buildPredictaActionReply,
  classifyPredictaRouterDecision,
  normalizePredictaIntentText,
} = require('../packages/astrology/src/predictaChatActions.ts');

function classify({ action, exhausted = false, kundli = undefined, text }) {
  return classifyPredictaRouterDecision({
    action,
    aiCreditsExhausted: exhausted,
    kundli,
    normalizedText: normalizePredictaIntentText(text),
  });
}

const fakeKundli = { id: 'router-kundli', birthDetails: { name: 'Router Fixture' } };

const routerCases = [
  {
    expected: ['missing_data_question', false, 'empty_input'],
    label: 'empty input',
    request: { text: '' },
  },
  {
    expected: ['ai_required', true, 'open_ended_ai_required'],
    label: 'open-ended AI required',
    request: { text: 'Tell me everything about my future' },
  },
  {
    expected: ['blocked_needs_credit', false, 'open_ended_blocked_needs_credit'],
    label: 'open-ended blocked after credits',
    request: { exhausted: true, text: 'Tell me everything about my future' },
  },
  {
    expected: ['missing_data_question', false, 'missing_kundli'],
    label: 'mahadasha missing Kundli',
    request: { action: 'mahadasha', text: 'explain mahadasha' },
  },
  {
    expected: ['deterministic_action', false, 'deterministic_action_available'],
    label: 'mahadasha with Kundli',
    request: { action: 'mahadasha', kundli: fakeKundli, text: 'explain mahadasha' },
  },
  {
    expected: ['local_memory_answer', false, 'local_memory_available'],
    label: 'Kundli Karma definition without Kundli',
    request: { action: 'kundli-karma', text: 'what is kundli karma' },
  },
  {
    expected: ['deterministic_action', false, 'deterministic_action_available'],
    label: 'pricing without Kundli',
    request: { action: 'pricing', text: 'show pricing' },
  },
  {
    expected: ['deterministic_action', false, 'deterministic_action_available'],
    label: 'saved Kundlis without Kundli',
    request: { action: 'saved-kundlis', text: 'show saved profiles' },
  },
];

for (const item of routerCases) {
  const decision = classify(item.request);
  const [providerDecision, shouldCallProvider, reason] = item.expected;
  assert.equal(
    decision.providerDecision,
    providerDecision,
    `${item.label}: providerDecision`,
  );
  assert.equal(
    decision.shouldCallProvider,
    shouldCallProvider,
    `${item.label}: shouldCallProvider`,
  );
  assert.equal(decision.reason, reason, `${item.label}: reason`);
}

const definitionReply = buildPredictaActionReply({
  language: 'en',
  text: 'What is Kundli Karma?',
});
assert.equal(definitionReply.handled, true, 'definition reply handled locally');
assert.equal(
  definitionReply.providerDecision,
  'local_memory_answer',
  'definition reply stays local memory',
);
assert.match(definitionReply.text, /No AI credit is needed/i);
assert.doesNotMatch(definitionReply.text, /Provider decision/i);

const missingKundliReply = buildPredictaActionReply({
  language: 'en',
  text: 'Explain my Mahadasha',
});
assert.equal(missingKundliReply.handled, true, 'missing Kundli reply handled');
assert.equal(
  missingKundliReply.providerDecision,
  'missing_data_question',
  'missing Kundli asks data instead of provider',
);

const blockedReply = buildPredictaActionReply({
  aiCreditsExhausted: true,
  language: 'en',
  text: 'Give me a complete future synthesis',
});
assert.equal(blockedReply.handled, false, 'blocked open-ended reply is not faked');
assert.equal(blockedReply.providerDecision, 'blocked_needs_credit');

const source = read('packages/astrology/src/predictaChatActions.ts');
[
  'export type PredictaRouterDecision',
  'export function classifyPredictaRouterDecision',
  'shouldCallProvider: false',
  "'local_memory_available'",
  "'deterministic_action_available'",
  "'open_ended_ai_required'",
  "'open_ended_blocked_needs_credit'",
  "reason: 'missing_kundli'",
].forEach(fragment => assertIncludes(source, fragment, 'shared router source'));

const indexSource = read('packages/astrology/src/index.ts');
assertIncludes(indexSource, "export * from './predictaChatActions';", 'astrology export');

const webChat = read('apps/web/components/WebPridictaChat.tsx');
assertBefore(
  webChat,
  'const actionReply = buildPredictaActionReply({',
  'return askWithProof(\n      text,\n      activeKundli',
  'web action router before final provider fallback',
);
assertBefore(
  webChat,
  'if (looksLikeBirthDetails(text))',
  'return askWithProof(',
  'web birth intake before provider',
);
assertBefore(
  webChat,
  'resolveChatChartReply(',
  'askWithProof(',
  'web chart deterministic route before provider proof',
);

const mobileChat = read('apps/mobile/src/screens/ChatScreen.tsx');
assertBefore(
  mobileChat,
  'const actionReply = buildPredictaActionReply({',
  'const response = await askPredicta({',
  'mobile action router before provider',
);
assertBefore(
  mobileChat,
  'const chartIntent = detectChatChartIntent(trimmedInput);',
  'const response = await askPredicta({',
  'mobile chart route before provider',
);
assertIncludes(
  mobileChat,
  'recordMobileZeroCreditDeterministicAction',
  'mobile deterministic telemetry',
);

const askRoute = read('apps/web/app/api/ask-pridicta/route.ts');
[
  'evaluateAiCreditEntitlement',
  'buildFreeAiUpsellResponse',
  "provider: 'deterministic'",
  "response.provider === 'openai' || response.provider === 'gemini'",
].forEach(fragment => assertIncludes(askRoute, fragment, 'server entitlement/provider gate'));

const webClient = read('apps/web/lib/pridicta-ai.ts');
[
  'allowProviderFallback: options.allowProviderFallback === true',
  'rulesOnly: options.allowProviderFallback !== true',
].forEach(fragment => assertIncludes(webClient, fragment, 'web rules-first birth extraction'));

if (failures.length) {
  console.error(`${phaseName} failed`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName}: GREEN`);
