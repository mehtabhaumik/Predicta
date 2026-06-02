import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Monetization Phase 6 Product Bank gate failed: ${message}`);
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

function assertBefore(source, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert(firstIndex >= 0, `${label} is missing ${first}`);
  assert(secondIndex >= 0, `${label} is missing ${second}`);
  assert(firstIndex < secondIndex, `${label} must put ${first} before ${second}`);
}

const requiredFiles = [
  'docs/audits/PREDICTA_MONETIZATION_PHASE_6_PRODUCT_BANK_QUESTION_PACKS_REPORT_PACKS_AND_FAMILY_BANK/product-bank-audit.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_6_PRODUCT_BANK_QUESTION_PACKS_REPORT_PACKS_AND_FAMILY_BANK/phase-6-product-bank-manifest.json',
  'packages/types/src/productBank.ts',
  'packages/config/src/pricing.ts',
  'packages/monetization/src/serverEntitlementLedger.ts',
  'packages/monetization/src/entitlementService.ts',
  'apps/web/app/api/ask-pridicta/route.ts',
  'apps/web/app/api/report/pdf/route.ts',
  'apps/web/lib/pridicta-ai.ts',
  'apps/web/components/WebProfileSettings.tsx',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/dashboard/family/page.tsx',
  'apps/mobile/src/services/ai/pridictaService.ts',
  'apps/mobile/src/screens/ReportScreen.tsx',
  'apps/mobile/src/services/billing/mockBillingProvider.ts',
  'apps/mobile/src/services/subscription/entitlementService.ts',
  'packages/monetization/src/entitlementParity.ts',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
assertIncludes(
  roadmap,
  'PREDICTA_MONETIZATION_PHASE_6_PRODUCT_BANK_QUESTION_PACKS_REPORT_PACKS_AND_FAMILY_BANK',
  'monetization roadmap',
);
assertIncludes(roadmap, 'Paid credits do not expire.', 'roadmap');
assertIncludes(roadmap, 'Family Bank can share purchased credits', 'roadmap');

const productBank = read('packages/types/src/productBank.ts');
[
  'AI_QUESTIONS_10: 10',
  'AI_QUESTIONS_25: 25',
  'AI_QUESTIONS_100: 100',
  'REPORT_SINGLE: 1',
  'REPORT_BUNDLE: 5',
  'isQuestionPackProduct',
  'isReportPackProduct',
].forEach(fragment => assertIncludes(productBank, fragment, 'shared Product Bank contract'));

const pricing = read('packages/config/src/pricing.ts');
[
  "AI_QUESTIONS_10: 'pridicta_10_questions'",
  "AI_QUESTIONS_25: 'pridicta_25_questions'",
  "AI_QUESTIONS_100: 'pridicta_100_questions'",
  "REPORT_SINGLE: 'pridicta_single_report'",
  "REPORT_BUNDLE: 'pridicta_report_bundle'",
  "label: getEnglishOneTimeProductCopy('AI_QUESTIONS_10').label",
  "label: getEnglishOneTimeProductCopy('AI_QUESTIONS_25').label",
  "label: getEnglishOneTimeProductCopy('AI_QUESTIONS_100').label",
  "label: getEnglishOneTimeProductCopy('REPORT_SINGLE').label",
  "label: getEnglishOneTimeProductCopy('REPORT_BUNDLE').label",
  "return getOneTimeProduct('REPORT_SINGLE')",
].forEach(fragment => assertIncludes(pricing, fragment, 'pricing Product Bank catalog'));
const monetizationCopy = read('packages/config/src/translations/monetization.json');
[
  '"AI_QUESTIONS_10"',
  '"10 AI Questions"',
  '"AI_QUESTIONS_25"',
  '"25 AI Questions"',
  '"AI_QUESTIONS_100"',
  '"100 AI Questions"',
  '"REPORT_SINGLE"',
  '"Single Report Credit"',
  '"REPORT_BUNDLE"',
  '"Report Bundle"',
].forEach(fragment => assertIncludes(monetizationCopy, fragment, 'Product Bank translation catalog'));

const ledger = read('packages/monetization/src/serverEntitlementLedger.ts');
[
  'isQuestionPackProduct(productType)',
  'quantity: getQuestionCreditQuantity(productType)',
  'quantity: getReportCreditQuantity(productType) || 1',
  "productType: 'AI_QUESTIONS_10'",
  "return 'REPORT_SINGLE'",
  "operation.source === 'family_bank'",
  'sharedQuestionCreditsBalance',
  'sharedReportCreditsByType',
].forEach(fragment => assertIncludes(ledger, fragment, 'server entitlement ledger Product Bank mapping'));

const webAsk = read('apps/web/app/api/ask-pridicta/route.ts');
[
  'evaluateAiCreditEntitlement',
  'selectPaidAiCreditSpendSource',
  "kind: 'record_successful_paid_ai_answer'",
  "source: paidCreditSource",
].forEach(fragment => assertIncludes(webAsk, fragment, 'web paid AI question consumption'));
assertBefore(
  webAsk,
  'const response = parseChatResponse(text);',
  "kind: 'record_successful_paid_ai_answer'",
  'web paid question spend must happen after provider response parse',
);

const mobileAsk = read('apps/mobile/src/services/ai/pridictaService.ts');
[
  'evaluateAiCreditEntitlement',
  'selectPaidAiCreditSpendSource',
  "kind: 'record_successful_paid_ai_answer'",
  "source: paidCreditSource",
].forEach(fragment => assertIncludes(mobileAsk, fragment, 'mobile paid AI question consumption'));

const webReportRoute = read('apps/web/app/api/report/pdf/route.ts');
[
  'evaluateReportEntitlement',
  'reportEntitlement.paidReportCredit',
  "status: 402",
  "kind: 'consume_report_credit'",
  'const pdfBuffer = await renderToBuffer',
].forEach(fragment => assertIncludes(webReportRoute, fragment, 'web report credit consumption'));
assertBefore(
  webReportRoute,
  'const pdfBuffer = await renderToBuffer',
  "kind: 'consume_report_credit'",
  'web report credit must consume only after PDF render succeeds',
);

const mobileReport = read('apps/mobile/src/screens/ReportScreen.tsx');
[
  'evaluateReportEntitlement',
  'reportEntitlement.paidReportCredit',
  "kind: 'consume_report_credit'",
  'const result = await generateHoroscopePdf',
  'loadServerEntitlementLedgerFromFirebase',
].forEach(fragment => assertIncludes(mobileReport, fragment, 'mobile report credit consumption'));
assertBefore(
  mobileReport,
  'const result = await generateHoroscopePdf',
  "kind: 'consume_report_credit'",
  'mobile report credit must consume only after PDF generation succeeds',
);

const productBankLoader = read('apps/web/lib/pridicta-ai.ts');
[
  'loadWebProductBankBalance',
  'paidQuestionCredits',
  'reportCredits',
  'reportCreditsByType',
  'familyQuestionCredits',
  'familyReportCredits',
  'familyReportCreditsByType',
  'familySharingEnabled',
].forEach(fragment => assertIncludes(productBankLoader, fragment, 'web Product Bank balance loader'));

const entitlementParity = read('packages/monetization/src/entitlementParity.ts');
[
  'export function evaluateAiCreditEntitlement',
  'export function selectPaidAiCreditSpendSource',
  'export function evaluateReportEntitlement',
  'export function selectPaidReportCreditSpend',
  'export function getReportCreditCandidates',
  'ledger.paidAiQuestionCreditsBalance > 0',
  'ledger.familyBank.sharedQuestionCreditsBalance > 0',
  'ledger.reportCreditsByType',
  'ledger.familyBank.sharedReportCreditsByType',
].forEach(fragment =>
  assertIncludes(entitlementParity, fragment, 'shared entitlement parity contract'),
);

[
  ['apps/web/components/WebProfileSettings.tsx', ['getMonetizationReportRequirementCopy', 'paidQuestionCredits', 'reportCredits']],
  ['apps/web/components/WebPridictaChat.tsx', ['starterWithProductBankLabel', 'loadWebProductBankBalance']],
  ['apps/web/components/WebDossierPreview.tsx', ['productBankBalance', 'familyReportCreditsByType']],
  ['apps/web/app/checkout/page.tsx', ['getProductBankCheckoutCopy', 'checkoutRazorpayDisabled']],
  ['apps/web/app/dashboard/family/page.tsx', ['Family Bank', 'private chats, reports, and personal']],
].forEach(([file, fragments]) => {
  const source = read(file);
  fragments.forEach(fragment => assertIncludes(source, fragment, `${file} Product Bank surface`));
});

const mockBilling = read('apps/mobile/src/services/billing/mockBillingProvider.ts');
[
  "case 'AI_QUESTIONS_10':",
  'return 10',
  "case 'AI_QUESTIONS_25':",
  'return 25',
  "case 'AI_QUESTIONS_100':",
  'return 100',
  "case 'REPORT_BUNDLE':",
  'return 5',
].forEach(fragment => assertIncludes(mockBilling, fragment, 'mobile mock billing quantities'));

const disabledBilling = read('apps/mobile/src/services/billing/disabledBillingProvider.ts');
assertIncludes(disabledBilling, "status: 'PENDING'", 'disabled billing must not fake success');
assert(!disabledBilling.includes("status: 'SUCCESS'"), 'disabled billing must not return SUCCESS');

console.log(
  'Monetization Phase 6 Product Bank gate passed: product packs, report packs, Family Bank visibility, success-only consumption, and Razorpay-disabled honesty are locked.',
);
