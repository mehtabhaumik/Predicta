import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Monetization Phase 3 free AI credit gate failed: ${message}`);
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
  assert(firstIndex < secondIndex, `${label} must place ${first} before ${second}`);
}

function assertAfter(source, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert(firstIndex >= 0, `${label} is missing ${first}`);
  assert(secondIndex >= 0, `${label} is missing ${second}`);
  assert(firstIndex > secondIndex, `${label} must place ${first} after ${second}`);
}

const requiredFiles = [
  'docs/audits/PREDICTA_MONETIZATION_PHASE_3_FREE_THREE_LIFETIME_AI_CREDITS_AND_PRESERVED_UPSELL/free-ai-credit-upsell.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_3_FREE_THREE_LIFETIME_AI_CREDITS_AND_PRESERVED_UPSELL/phase-3-free-ai-manifest.json',
  'apps/web/app/api/ask-pridicta/route.ts',
  'apps/web/lib/pridicta-ai.ts',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/web/components/WebProfileSettings.tsx',
  'apps/mobile/src/services/ai/pridictaService.ts',
  'apps/mobile/src/screens/ChatScreen.tsx',
  'apps/mobile/src/screens/SettingsScreen.tsx',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
assertIncludes(
  roadmap,
  'PREDICTA_MONETIZATION_PHASE_3_FREE_THREE_LIFETIME_AI_CREDITS_AND_PRESERVED_UPSELL',
  'monetization roadmap',
);
assertIncludes(roadmap, 'Free users receive exactly `3` lifetime Predicta AI questions.', 'roadmap');

const sharedTypes = read('packages/types/src/astrology.ts');
[
  'clientRequestId?: string',
  'freeAiCreditsRemaining?: number',
  'freeAiCreditsTotal?: number',
  'freeAiUpsell?:',
  'preservedQuestion: string',
  "'10 questions' | '25 questions' | '100 questions' | 'Premium'",
].forEach(fragment => assertIncludes(sharedTypes, fragment, 'shared Pridicta chat types'));

const mobileTypes = read('apps/mobile/src/types/astrology.ts');
[
  'clientRequestId?: string',
  'freeAiCreditsRemaining?: number',
  'freeAiCreditsTotal?: number',
  'freeAiUpsell?:',
  'preservedQuestion: string',
].forEach(fragment => assertIncludes(mobileTypes, fragment, 'mobile Pridicta chat types'));

const webRoute = read('apps/web/app/api/ask-pridicta/route.ts');
[
  'readServerEntitlementLedger',
  'commitServerEntitlementOperation',
  'evaluateAiCreditEntitlement',
  'shouldConsumeFreeAiCredit',
  'buildFreeAiUpsellResponse',
  'record_successful_free_ai_answer',
  'record_successful_paid_ai_answer',
  'record_successful_day_pass_ai_answer',
  'free_ai_lifetime_exhausted',
  'FREE_AI_QUESTION_LIFETIME_LIMIT',
  'preservedQuestion',
  'purchaseOptions: [',
].forEach(fragment => assertIncludes(webRoute, fragment, 'web ask-pridicta entitlement route'));
assertBefore(webRoute, 'if (!aiEntitlement.allowed)', "fetch(`${getAstroApiUrl()}/ask-pridicta`", 'web route blocks before provider fetch');
assertAfter(webRoute, 'record_successful_free_ai_answer', "fetch(`${getAstroApiUrl()}/ask-pridicta`", 'web route spends only after provider fetch');
assertIncludes(webRoute, "response.provider === 'openai' || response.provider === 'gemini'", 'web route provider-only spend');

const webClient = read('apps/web/lib/pridicta-ai.ts');
[
  'clientRequestId: request.clientRequestId ?? createClientRequestId()',
  'loadWebFreeAiBalance',
  '/api/entitlements/ledger',
  'FREE_AI_QUESTION_LIFETIME_LIMIT',
].forEach(fragment => assertIncludes(webClient, fragment, 'web Predicta AI client'));

const webChat = read('apps/web/components/WebPridictaChat.tsx');
[
  'loadWebFreeAiBalance',
  'refreshFreeAiBalance',
  'getMonetizationReportRequirementCopy',
  'starterWithProductBankLabel',
  'starterAiLabel',
  'response.freeAiUpsell?.blocked',
  'buildFreeAiUpsellSuggestions',
  '10 questions',
  '25 questions',
  '100 questions',
  'Premium',
].forEach(fragment => assertIncludes(webChat, fragment, 'web chat free AI balance and upsell'));
assertNotIncludes(webChat, 'consumeWebAiBudget(', 'web chat must not locally spend free AI credits');
assertNotIncludes(webChat, 'buildPassCostGuardrailReply', 'web chat old local budget guardrail');

const webAccount = read('apps/web/components/WebProfileSettings.tsx');
[
  'loadWebFreeAiBalance',
  'freeAiBalance',
  'getMonetizationReportRequirementCopy',
  'starterAiLabel',
  'starterBalanceBody',
].forEach(fragment => assertIncludes(webAccount, fragment, 'web account free AI balance'));

const mobileService = read('apps/mobile/src/services/ai/pridictaService.ts');
[
  'loadServerEntitlementLedgerFromFirebase',
  'commitServerEntitlementOperationToFirebase',
  'evaluateAiCreditEntitlement',
  'shouldConsumeFreeAiCredit',
  'buildFreeAiUpsellResponse',
  'record_successful_free_ai_answer',
  'record_successful_paid_ai_answer',
  'record_successful_day_pass_ai_answer',
  'freeAiCreditsRemaining',
  'FREE_AI_QUESTION_LIFETIME_LIMIT',
].forEach(fragment => assertIncludes(mobileService, fragment, 'mobile Predicta AI service'));
assertBefore(mobileService, 'if (ledger && aiEntitlement && !aiEntitlement.allowed)', 'requestBackendReading({', 'mobile service blocks before backend');
assertAfter(mobileService, 'record_successful_free_ai_answer', 'requestBackendReading({', 'mobile service spends after backend response');
assertIncludes(mobileService, "response.provider === 'openai' || response.provider === 'gemini'", 'mobile service provider-only spend');

const mobileChat = read('apps/mobile/src/screens/ChatScreen.tsx');
[
  'loadServerEntitlementLedgerFromFirebase',
  'STARTER AI QUESTIONS',
  'freeAiBalance',
  'response.freeAiUpsell?.blocked',
  'buildMobileFreeAiUpsellSuggestions',
  'routes.Paywall',
  'routes.Kundli',
  'routes.Charts',
  'routes.Report',
].forEach(fragment => assertIncludes(mobileChat, fragment, 'mobile chat free AI balance and upsell'));
assertNotIncludes(mobileChat, 'const canAskQuestion =', 'mobile chat old local canAskQuestion selector');
assertNotIncludes(mobileChat, 'const recordQuestion =', 'mobile chat old local recordQuestion selector');
assertNotIncludes(mobileChat, 'recordQuestion();', 'mobile chat must not locally spend free AI credits');

const mobileSettings = read('apps/mobile/src/screens/SettingsScreen.tsx');
[
  'loadServerEntitlementLedgerFromFirebase',
  'getMonetizationReportRequirementCopy',
  'starterAiLabel',
  'starterRemainingTemplate',
  'freeAiBalance',
  'FREE_AI_QUESTION_LIFETIME_LIMIT',
].forEach(fragment => assertIncludes(mobileSettings, fragment, 'mobile settings free AI balance'));

const manifest = JSON.parse(
  read(
    'docs/audits/PREDICTA_MONETIZATION_PHASE_3_FREE_THREE_LIFETIME_AI_CREDITS_AND_PRESERVED_UPSELL/phase-3-free-ai-manifest.json',
  ),
);
assert(
  manifest.phase === 'PREDICTA_MONETIZATION_PHASE_3_FREE_THREE_LIFETIME_AI_CREDITS_AND_PRESERVED_UPSELL',
  'manifest phase mismatch',
);
assert(manifest.green === true, 'manifest must mark phase green after strict audit');
assert(manifest.freeAiQuestionsLifetime === 3, 'manifest must lock three lifetime free AI questions');

console.log('Monetization Phase 3 free AI credit gate passed.');
