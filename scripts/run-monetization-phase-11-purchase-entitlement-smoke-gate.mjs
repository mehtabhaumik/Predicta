import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(
    `Monetization Phase 11 purchase/entitlement smoke gate failed: ${message}`,
  );
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

async function importTsModule(relativePath, transform = source => source) {
  const sourcePath = path.join(root, relativePath);
  const compiled = ts.transpileModule(transform(fs.readFileSync(sourcePath, 'utf8')), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
    fileName: sourcePath,
  }).outputText;
  const tmpPath = path.join(
    os.tmpdir(),
    `predicta-phase-11-${path.basename(relativePath).replace(/\W+/g, '-')}-${Date.now()}.mjs`,
  );
  fs.writeFileSync(tmpPath, compiled);
  return import(pathToFileURL(tmpPath).href);
}

function ledgerTransform(source) {
  return source.replace(
    /import \{\s*createFreeEntitlement,\s*getQuestionCreditQuantity,\s*getReportCreditQuantity,\s*isQuestionPackProduct,\s*\} from '@pridicta\/types';/,
    [
      "function createFreeEntitlement(source = 'local') {",
      "  return { plan: 'FREE', source, status: 'NONE', updatedAt: new Date().toISOString() };",
      '}',
      'function getQuestionCreditQuantity(productType) {',
      "  return productType === 'AI_QUESTIONS_100' ? 100 : productType === 'AI_QUESTIONS_25' ? 25 : productType === 'AI_QUESTIONS_10' ? 10 : productType === 'FIVE_QUESTIONS' ? 5 : 0;",
      '}',
      'function getReportCreditQuantity(productType) {',
      "  return productType === 'REPORT_BUNDLE' ? 5 : productType === 'REPORT_SINGLE' || productType === 'PREMIUM_PDF' || productType === 'JAIMINI_REPORT' || productType === 'DETAILED_KUNDLI_REPORT' || productType === 'MARRIAGE_COMPATIBILITY_REPORT' ? 1 : 0;",
      '}',
      'function isQuestionPackProduct(productType) {',
      '  return getQuestionCreditQuantity(productType) > 0;',
      '}',
    ].join('\n'),
  );
}

function parityTransform(source) {
  return source
    .replace(
      "import { FREE_AI_QUESTION_LIFETIME_LIMIT } from './serverEntitlementLedger';",
      'const FREE_AI_QUESTION_LIFETIME_LIMIT = 3;',
    )
    .replace("import type { ServerEntitlementLedger } from './serverEntitlementLedger';", '')
    .replace("import type { ReportCreditType } from './serverEntitlementLedger';", '');
}

const requiredFiles = [
  'docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md',
  'packages/monetization/src/paymentWorkflow.ts',
  'packages/monetization/src/serverEntitlementLedger.ts',
  'packages/monetization/src/entitlementParity.ts',
  'packages/monetization/src/kundliLibraryEntitlement.ts',
  'packages/astrology/src/familyVaultComparisonLimits.ts',
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/api/ask-pridicta/route.ts',
  'apps/web/app/api/report/pdf/route.ts',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/lib/web-kundli-storage.ts',
  'apps/web/components/WebKundliWizard.tsx',
  'apps/web/app/dashboard/family/page.tsx',
  'apps/web/components/WebFamilyKarmaMap.tsx',
  'apps/mobile/src/screens/PaywallScreen.tsx',
  'apps/mobile/src/screens/ReportScreen.tsx',
  'apps/mobile/src/services/ai/pridictaService.ts',
  'apps/mobile/src/services/billing/billingService.ts',
  'apps/mobile/src/services/billing/disabledBillingProvider.ts',
  'apps/mobile/src/services/billing/mockBillingProvider.ts',
  'apps/mobile/src/services/kundli/kundliRepository.ts',
  'apps/mobile/src/screens/FamilyKarmaMapScreen.tsx',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
[
  'PREDICTA_MONETIZATION_PHASE_11_WEB_MOBILE_END_TO_END_PURCHASE_AND_ENTITLEMENT_SMOKE',
  'use three free AI questions',
  'attempt fourth AI question',
  'buy or simulate question pack through approved non-fake test path',
  'resume preserved question',
  'create four Kundlis',
  'attempt fifth Kundli',
  'assign Family Vault',
  'compare `2-4` Kundlis',
  'block `5+` Kundlis',
  'generate free deterministic report',
  'generate paid/premium report where entitlement allows',
  'Razorpay-disabled smoke remains honest',
  'Razorpay-enabled sandbox smoke must pass once keys are added',
  'No fake payment success exists',
  'No deterministic action spends AI credit',
].forEach(fragment => assertIncludes(roadmap, fragment, 'monetization roadmap Phase 11 contract'));

const packageJson = read('package.json');
assertIncludes(
  packageJson,
  'test:monetization-phase-11',
  'package script registry',
);

const checkout = read('apps/web/app/checkout/page.tsx');
[
  'NEXT_PUBLIC_PREDICTA_RAZORPAY_ENABLED',
  "state: gatewayReady ? 'gateway_ready' : 'gateway_disabled'",
  'data-payment-gateway-state={visibleIntent.state}',
  "state: 'manual_support_requested'",
  'checkoutRazorpayDisabled',
].forEach(fragment => assertIncludes(checkout, fragment, 'web checkout disabled-gateway smoke'));
assertNotIncludes(checkout, "state: 'entitlement_active'", 'web checkout page');
assertNotIncludes(checkout, "status: 'SUCCESS'", 'web checkout page');

const webAsk = read('apps/web/app/api/ask-pridicta/route.ts');
[
  'evaluateAiCreditEntitlement',
  "kind: 'record_successful_free_ai_answer'",
  "kind: 'record_successful_paid_ai_answer'",
  "kind: 'record_successful_day_pass_ai_answer'",
  'const preservedQuestion',
  'freeAiUpsell',
  "provider: 'deterministic'",
  'I preserved your question',
].forEach(fragment => assertIncludes(webAsk, fragment, 'web AI credit and preserved-question smoke'));

const mobileAsk = read('apps/mobile/src/services/ai/pridictaService.ts');
[
  'evaluateAiCreditEntitlement',
  "kind: 'record_successful_free_ai_answer'",
  "kind: 'record_successful_paid_ai_answer'",
  "kind: 'record_successful_day_pass_ai_answer'",
  'const preservedQuestion',
  'freeAiUpsell',
  "provider: 'deterministic'",
  'I preserved your question',
].forEach(fragment => assertIncludes(mobileAsk, fragment, 'mobile AI credit and preserved-question smoke'));

const webReport = read('apps/web/app/api/report/pdf/route.ts');
[
  'evaluateReportEntitlement',
  "kind: 'consume_report_credit'",
  "kind: 'consume_day_pass_report_pdf'",
  'const pdfBuffer = await renderToBuffer',
].forEach(fragment => assertIncludes(webReport, fragment, 'web report entitlement smoke'));

const mobileReport = read('apps/mobile/src/screens/ReportScreen.tsx');
[
  'evaluateReportEntitlement',
  "kind: 'consume_report_credit'",
  "kind: 'consume_day_pass_report_pdf'",
  'const result = await generateHoroscopePdf',
].forEach(fragment => assertIncludes(mobileReport, fragment, 'mobile report entitlement smoke'));

const disabledBilling = read('apps/mobile/src/services/billing/disabledBillingProvider.ts');
[
  'Secure checkout is being connected. No payment was taken and no premium access was activated.',
  "state: 'gateway_disabled'",
  "state: 'payment_pending'",
  "status: 'PENDING'",
].forEach(fragment => assertIncludes(disabledBilling, fragment, 'mobile disabled billing smoke'));
assertNotIncludes(disabledBilling, "status: 'SUCCESS'", 'mobile disabled billing provider');
assertNotIncludes(disabledBilling, 'entitlement:', 'mobile disabled billing provider');
assertNotIncludes(disabledBilling, 'oneTimeEntitlement:', 'mobile disabled billing provider');

const billingService = read('apps/mobile/src/services/billing/billingService.ts');
[
  'if (isDev)',
  'return mockBillingProvider',
  'if (enableMockBilling)',
  'return disabledBillingProvider',
].forEach(fragment => assertIncludes(billingService, fragment, 'mobile billing provider resolution'));

const paywallScreen = read('apps/mobile/src/screens/PaywallScreen.tsx');
[
  "result.status === 'SUCCESS' || result.status === 'RESTORED'",
  'setEntitlement(result.entitlement)',
  'addOneTimeEntitlement(result.oneTimeEntitlement)',
  'syncEntitlementToFirebase',
  "result.status === 'CANCELED'",
  "eventName: 'purchase_failed'",
].forEach(fragment => assertIncludes(paywallScreen, fragment, 'mobile paywall purchase smoke'));

const mockBilling = read('apps/mobile/src/services/billing/mockBillingProvider.ts');
[
  "status: 'SUCCESS'",
  "source: 'mock'",
  "case 'AI_QUESTIONS_10':",
  "case 'REPORT_BUNDLE':",
].forEach(fragment => assertIncludes(mockBilling, fragment, 'approved mobile dev mock smoke'));

const webKundli = read('apps/web/lib/web-kundli-storage.ts');
const mobileKundli = read('apps/mobile/src/services/kundli/kundliRepository.ts');
['evaluateKundliLibraryEntitlement', 'reason: decision.reason'].forEach(fragment =>
  assertIncludes(webKundli, fragment, 'web Kundli storage'),
);
['evaluateKundliLibraryEntitlement', 'gate.reason', 'KundliStorageLimitError'].forEach(
  fragment => assertIncludes(mobileKundli, fragment, 'mobile Kundli repository'),
);
[
  ['web Kundli wizard', read('apps/web/components/WebKundliWizard.tsx')],
  ['web Predicta chat Kundli gate', read('apps/web/components/WebPridictaChat.tsx')],
  ['mobile Kundli repository copy', mobileKundli],
].forEach(([label, source]) =>
  assertIncludes(source, 'FREE_KUNDLI_LIMIT_REACHED', label),
);

const webDossier = read('apps/web/components/WebDossierPreview.tsx');
[
  "'freeNoSpend'",
  'hasServerReportCreditForFocus',
  'productBankBalance',
  'familyReportCreditsByType',
].forEach(fragment => assertIncludes(webDossier, fragment, 'web report composer entitlement surface'));

const webFamily = read('apps/web/app/dashboard/family/page.tsx');
[
  'updateWebKundliFamilyRelationship',
  'Assign saved Kundlis',
  'Family Bank',
].forEach(fragment => assertIncludes(webFamily, fragment, 'web Family Vault assignment surface'));

for (const [file, source] of [
  ['web Family comparison', read('apps/web/components/WebFamilyKarmaMap.tsx')],
  ['mobile Family comparison', read('apps/mobile/src/screens/FamilyKarmaMapScreen.tsx')],
]) {
  [
    'evaluateFamilyComparisonEligibility',
    'FAMILY_COMPARISON_MIN_KUNDLIS',
    'FAMILY_COMPARISON_MAX_KUNDLIS',
    'selectedIds.length >= FAMILY_COMPARISON_MAX_KUNDLIS',
  ].forEach(fragment => assertIncludes(source, fragment, file));
}

const payment = await importTsModule('packages/monetization/src/paymentWorkflow.ts');
const ledger = await importTsModule(
  'packages/monetization/src/serverEntitlementLedger.ts',
  ledgerTransform,
);
const parity = await importTsModule(
  'packages/monetization/src/entitlementParity.ts',
  parityTransform,
);
const kundli = await importTsModule(
  'packages/monetization/src/kundliLibraryEntitlement.ts',
);
const family = await importTsModule(
  'packages/astrology/src/familyVaultComparisonLimits.ts',
);

const disabledIntent = payment.createPaymentWorkflowIntent({
  amountInr: 199,
  kind: 'ONE_TIME',
  productId: 'pridicta_10_questions',
  productType: 'AI_QUESTIONS_10',
  state: 'gateway_disabled',
  userId: 'phase11-user',
});
assert(payment.isGatewayDisabled(disabledIntent.state), 'disabled gateway intent must be disabled');
assert(payment.assertNoPaymentSecrets(disabledIntent), 'payment intent must not contain secrets');
const pendingDisabledIntent = payment.transitionPaymentWorkflowIntent(disabledIntent, {
  state: 'payment_pending',
});
assert(
  pendingDisabledIntent.state === 'payment_pending' && !pendingDisabledIntent.entitlementId,
  'disabled gateway smoke can become pending but must not activate entitlement',
);

let userLedger = ledger.createDefaultServerEntitlementLedger(
  'phase11-user',
  '2026-06-02T00:00:00.000Z',
);

for (let index = 1; index <= 3; index += 1) {
  const before = parity.evaluateAiCreditEntitlement(userLedger);
  assert(before.allowed, `free AI question ${index} must be allowed`);
  assert(
    before.creditSource === 'free_lifetime_ai_credit',
    `free AI question ${index} must spend lifetime free credit`,
  );
  const result = ledger.applyServerEntitlementOperation({
    ledger: userLedger,
    operation: {
      idempotencyKey: `phase11-free-ai-${index}`,
      kind: 'record_successful_free_ai_answer',
    },
  });
  assert(result.changed, `free AI question ${index} must mutate ledger after success`);
  userLedger = result.ledger;
}

const fourthDecision = parity.evaluateAiCreditEntitlement(userLedger);
assert(!fourthDecision.allowed, 'fourth free AI question must be blocked before purchase');
assert(
  fourthDecision.reason === 'free_ai_lifetime_exhausted',
  'fourth free AI question must preserve upsell reason',
);
const fourthSpend = ledger.applyServerEntitlementOperation({
  ledger: userLedger,
  operation: {
    idempotencyKey: 'phase11-free-ai-4',
    kind: 'record_successful_free_ai_answer',
  },
});
assert(!fourthSpend.changed, 'ledger must reject a fourth lifetime free AI spend');
assert(
  fourthSpend.reason === 'free_ai_lifetime_exhausted',
  'ledger rejection must be explicit',
);

const questionPackOperation = ledger.mapOneTimeProductToLedgerOperation({
  idempotencyKey: 'phase11-approved-question-pack',
  productId: 'pridicta_10_questions',
  productType: 'AI_QUESTIONS_10',
});
assert(
  questionPackOperation.kind === 'grant_paid_ai_questions' &&
    questionPackOperation.quantity === 10,
  'approved question-pack simulation must grant exactly 10 paid AI questions',
);
userLedger = ledger.applyServerEntitlementOperation({
  ledger: userLedger,
  operation: questionPackOperation,
}).ledger;
const resumedQuestionDecision = parity.evaluateAiCreditEntitlement(userLedger);
assert(
  resumedQuestionDecision.allowed && resumedQuestionDecision.creditSource === 'personal',
  'preserved fourth question must resume through paid personal credits after approved purchase simulation',
);
userLedger = ledger.applyServerEntitlementOperation({
  ledger: userLedger,
  operation: {
    idempotencyKey: 'phase11-resumed-paid-question',
    kind: 'record_successful_paid_ai_answer',
    source: 'personal',
  },
}).ledger;
assert(userLedger.paidAiQuestionCreditsBalance === 9, 'resumed paid question must leave 9 credits');

for (let count = 0; count <= 3; count += 1) {
  const decision = kundli.evaluateKundliLibraryEntitlement({
    savedKundliCount: count,
    signedIn: true,
  });
  assert(decision.allowed, `free signed-in user must be able to save Kundli ${count + 1}`);
}
const fifthKundli = kundli.evaluateKundliLibraryEntitlement({
  savedKundliCount: 4,
  signedIn: true,
});
assert(!fifthKundli.allowed, 'free signed-in user fifth Kundli must be blocked');
assert(
  fifthKundli.reason === 'FREE_KUNDLI_LIMIT_REACHED',
  'fifth Kundli must return the free-limit reason',
);
const premiumKundli = kundli.evaluateKundliLibraryEntitlement({
  hasPremiumAccess: true,
  savedKundliCount: 99,
  signedIn: true,
});
assert(premiumKundli.allowed, 'premium user must have unlimited Kundli library access');
const premiumSoftLimit = kundli.evaluateKundliLibraryEntitlement({
  generatedKundlisToday: 30,
  hasPremiumAccess: true,
  savedKundliCount: 99,
  signedIn: true,
});
assert(!premiumSoftLimit.allowed, 'premium abuse soft limit must still block excessive daily Kundli generation');

userLedger = ledger.applyServerEntitlementOperation({
  ledger: userLedger,
  operation: {
    idempotencyKey: 'phase11-sync-four-kundlis',
    kind: 'sync_saved_kundli_count',
    savedKundliCount: 4,
  },
}).ledger;
assert(userLedger.savedKundliCount === 4, 'server ledger must carry four saved Kundlis');

for (const count of [0, 1]) {
  assert(
    !family.evaluateFamilyComparisonEligibility(count).allowed,
    `${count} selected Kundlis must not run Family comparison`,
  );
}
for (const count of [2, 3, 4]) {
  assert(
    family.evaluateFamilyComparisonEligibility(count).allowed,
    `${count} selected Kundlis must run Family comparison`,
  );
}
assert(
  !family.evaluateFamilyComparisonEligibility(5).allowed &&
    family.evaluateFamilyComparisonEligibility(5).reason === 'too_many',
  '5+ Kundlis must be blocked from one Family comparison',
);

userLedger = ledger.applyServerEntitlementOperation({
  ledger: userLedger,
  operation: {
    familyBank: {
      memberUids: ['phase11-user', 'phase11-family-member'],
      members: [
        { role: 'owner', uid: 'phase11-user' },
        { role: 'member', uid: 'phase11-family-member' },
      ],
      ownerUid: 'phase11-user',
      sharedQuestionCreditsBalance: 2,
      sharedReportCreditsByType: { JAIMINI: 1 },
    },
    idempotencyKey: 'phase11-family-bank',
    kind: 'configure_family_bank',
  },
}).ledger;
assert(
  userLedger.familyBank.memberUids.includes('phase11-family-member'),
  'Family Bank assignment must preserve member UID',
);

const freeReport = parity.evaluateReportEntitlement({
  ledger: userLedger,
  mode: 'FREE',
  reportFocus: 'JAIMINI',
});
assert(
  freeReport.allowed && freeReport.creditSource === 'free_deterministic_report',
  'free deterministic Jaimini report must not spend AI/report credit',
);

const premiumReportWithoutCredit = parity.evaluateReportEntitlement({
  ledger: ledger.createDefaultServerEntitlementLedger('no-credit-user'),
  mode: 'PREMIUM',
  reportFocus: 'KP',
});
assert(!premiumReportWithoutCredit.allowed, 'premium KP report must block without entitlement or credit');

let reportLedger = ledger.createDefaultServerEntitlementLedger('report-user');
const reportCreditOperation = ledger.mapOneTimeProductToLedgerOperation({
  idempotencyKey: 'phase11-approved-report-credit',
  productId: 'pridicta_single_report',
  productType: 'REPORT_SINGLE',
});
assert(
  reportCreditOperation.kind === 'grant_report_credit' &&
    reportCreditOperation.reportType === 'PREMIUM_PDF',
  'approved report-credit simulation must grant generic Premium PDF credit',
);
reportLedger = ledger.applyServerEntitlementOperation({
  ledger: reportLedger,
  operation: reportCreditOperation,
}).ledger;
const premiumReport = parity.evaluateReportEntitlement({
  ledger: reportLedger,
  mode: 'PREMIUM',
  reportFocus: 'KP',
});
assert(
  premiumReport.allowed && premiumReport.creditSource === 'personal',
  'premium report must unlock with personal generic report credit',
);
reportLedger = ledger.applyServerEntitlementOperation({
  ledger: reportLedger,
  operation: {
    idempotencyKey: 'phase11-consume-report-credit-after-render',
    kind: 'consume_report_credit',
    reportType: premiumReport.paidReportCredit.reportType,
    source: premiumReport.paidReportCredit.source,
  },
}).ledger;
assert(
  (reportLedger.reportCreditsByType.PREMIUM_PDF ?? 0) === 0,
  'premium report credit must be consumed exactly once after generation succeeds',
);

const sandboxKeyId = process.env.PREDICTA_RAZORPAY_SANDBOX_KEY_ID;
const sandboxSecret = process.env.PREDICTA_RAZORPAY_SANDBOX_KEY_SECRET;
const sandboxSmokeStatus =
  sandboxKeyId && sandboxSecret ? 'required-by-env' : 'skipped-missing-keys';
if (sandboxSmokeStatus === 'required-by-env') {
  assert(
    checkout.includes('gatewayReady') &&
      checkout.includes('Razorpay order creation') &&
      checkout.includes('signature verification'),
    'Razorpay sandbox env is present, so checkout must advertise order and signature readiness',
  );
}

console.log(
  JSON.stringify(
    {
      disabledGateway: 'honest-no-entitlement',
      familyComparison: '2-4-allowed-5-blocked',
      freeAiQuestions: `${userLedger.freeAiCreditsUsed}/3 used`,
      phase: 'PREDICTA_MONETIZATION_PHASE_11_WEB_MOBILE_END_TO_END_PURCHASE_AND_ENTITLEMENT_SMOKE',
      premiumReportCredit: 'granted-and-consumed-once',
      questionPack: `${userLedger.paidAiQuestionCreditsBalance} credits remain after preserved question`,
      razorpaySandbox: sandboxSmokeStatus,
      status: 'GREEN',
      webMobileSourceParity: 'checked',
    },
    null,
    2,
  ),
);
