import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Monetization Phase 4 zero-credit chat gate failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

function assertNotIncludes(source, needle, label) {
  assert(!source.includes(needle), `${label} must not include ${needle}`);
}

function assertBefore(source, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert(firstIndex >= 0, `${label} is missing ${first}`);
  assert(secondIndex >= 0, `${label} is missing ${second}`);
  assert(firstIndex < secondIndex, `${label} must put ${first} before ${second}`);
}

const requiredFiles = [
  'docs/audits/PREDICTA_MONETIZATION_PHASE_4_ZERO_CREDIT_DETERMINISTIC_CHAT_MODE/zero-credit-deterministic-chat.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_4_ZERO_CREDIT_DETERMINISTIC_CHAT_MODE/phase-4-zero-credit-manifest.json',
  'apps/web/app/api/extract-birth-details/route.ts',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/web/lib/pridicta-ai.ts',
  'apps/web/lib/zero-credit-telemetry.ts',
  'apps/mobile/src/services/ai/birthDetailsExtractor.ts',
  'apps/mobile/src/screens/ChatScreen.tsx',
  'apps/mobile/src/services/analytics/analyticsService.ts',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
assertIncludes(
  roadmap,
  'PREDICTA_MONETIZATION_PHASE_4_ZERO_CREDIT_DETERMINISTIC_CHAT_MODE',
  'monetization roadmap',
);
assertIncludes(roadmap, 'Provider call logs prove no OpenAI/Gemini calls for deterministic actions.', 'roadmap');

const webExtractRoute = read('apps/web/app/api/extract-birth-details/route.ts');
[
  'allowProviderFallback',
  'rulesOnly',
  'isDeterministicBirthExtractionComplete',
  "extractionMode: 'rules'",
  "extractionMode: 'rules_plus_provider'",
].forEach(fragment => assertIncludes(webExtractRoute, fragment, 'web birth extraction route'));
assertBefore(webExtractRoute, 'if (!allowProviderFallback', "proxyAstroApiRequest(\n      '/extract-birth-details'", 'web extraction must return rules before provider fallback');

const webClient = read('apps/web/lib/pridicta-ai.ts');
[
  'allowProviderFallback: options.allowProviderFallback === true',
  'rulesOnly: options.allowProviderFallback !== true',
].forEach(fragment => assertIncludes(webClient, fragment, 'web birth extraction client'));

const webChat = read('apps/web/components/WebPridictaChat.tsx');
[
  'recordWebZeroCreditDeterministicAction',
  'labelDeterministicChatReply',
  'Calculation-engine reply:',
  "recordWebZeroCreditDeterministicAction('kundli_command')",
  "recordWebZeroCreditDeterministicAction('chart_snapshot')",
  "recordWebZeroCreditDeterministicAction('birth_intake')",
  "recordWebZeroCreditDeterministicAction('kundli_created_from_chat')",
  'buildPredictaActionReply',
  'resolveChatChartReply',
  'handleBirthIntake',
].forEach(fragment => assertIncludes(webChat, fragment, 'web zero-credit chat routing'));
assertBefore(webChat, 'resolveChatChartReply(', 'askWithProof(', 'web chat must attempt chart deterministic route before provider proof');
assertBefore(
  webChat,
  'const actionReply = buildPredictaActionReply({',
  [
    '    return askWithProof(',
    '      text,',
    '      activeKundli,',
    '      responseLanguage,',
    '      languageContext.acknowledgement,',
    '      messageContext,',
    '    );',
  ].join('\n'),
  'web chat must attempt deterministic app action before final open-ended provider fallback',
);

const webTelemetry = read('apps/web/lib/zero-credit-telemetry.ts');
[
  'predicta.zeroCreditDeterministicEvents.v1',
  'predicta:zero-credit-deterministic-action',
  'recordWebZeroCreditDeterministicAction',
].forEach(fragment => assertIncludes(webTelemetry, fragment, 'web zero-credit telemetry'));

const mobileExtractor = read('apps/mobile/src/services/ai/birthDetailsExtractor.ts');
[
  'options: { allowProviderFallback?: boolean } = {}',
  'const rulesResult = extractWithRules(input)',
  'isDeterministicBirthExtractionComplete',
  'options.allowProviderFallback === true',
].forEach(fragment => assertIncludes(mobileExtractor, fragment, 'mobile rules-first birth extraction'));
assertBefore(mobileExtractor, 'const rulesResult = extractWithRules(input)', 'extractWithBackendAI(input)', 'mobile extraction must run rules before provider');

const mobileChat = read('apps/mobile/src/screens/ChatScreen.tsx');
[
  'recordMobileZeroCreditDeterministicAction',
  'zero_credit_deterministic_action',
  'labelMobileDeterministicReply',
  'Calculation-engine reply:',
  "recordMobileZeroCreditDeterministicAction('kundli_command')",
  "recordMobileZeroCreditDeterministicAction('chart_snapshot')",
  "recordMobileZeroCreditDeterministicAction('kundli_created_from_chat')",
  'buildPredictaActionReply',
  'detectChatChartIntent',
].forEach(fragment => assertIncludes(mobileChat, fragment, 'mobile zero-credit chat routing'));
assertBefore(mobileChat, 'if (chartIntent && !wantsDeepChartAnswer)', 'const response = await askPredicta({', 'mobile chart deterministic route before provider');
assertBefore(mobileChat, 'const actionReply = buildPredictaActionReply({', 'const response = await askPredicta({', 'mobile app action deterministic route before provider');

const mobileAnalytics = read('apps/mobile/src/services/analytics/analyticsService.ts');
assertIncludes(mobileAnalytics, "'zero_credit_deterministic_action'", 'mobile analytics event contract');

const askRoute = read('apps/web/app/api/ask-pridicta/route.ts');
assertIncludes(askRoute, 'buildFreeAiUpsellResponse', 'web blocked purchase path');
assertIncludes(askRoute, "provider: 'deterministic'", 'web blocked purchase path');
assertIncludes(askRoute, "response.provider === 'openai' || response.provider === 'gemini'", 'web provider-only credit spend');

const mobileService = read('apps/mobile/src/services/ai/pridictaService.ts');
assertIncludes(mobileService, 'buildFreeAiUpsellResponse', 'mobile blocked purchase path');
assertIncludes(mobileService, "provider: 'deterministic'", 'mobile blocked purchase path');
assertIncludes(mobileService, "response.provider === 'openai' || response.provider === 'gemini'", 'mobile provider-only credit spend');

const manifest = JSON.parse(
  read(
    'docs/audits/PREDICTA_MONETIZATION_PHASE_4_ZERO_CREDIT_DETERMINISTIC_CHAT_MODE/phase-4-zero-credit-manifest.json',
  ),
);
assert(
  manifest.phase === 'PREDICTA_MONETIZATION_PHASE_4_ZERO_CREDIT_DETERMINISTIC_CHAT_MODE',
  'manifest phase mismatch',
);
assert(manifest.green === true, 'manifest must be green after strict audit');
assert(manifest.providerCallsForDeterministicActions === false, 'manifest must block provider calls for deterministic actions');

console.log('Monetization Phase 4 zero-credit deterministic chat gate passed.');
