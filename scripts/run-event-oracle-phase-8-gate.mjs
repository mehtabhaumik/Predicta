import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const Module = require('module');
const root = process.cwd();
const aliasMap = new Map([
  ['@pridicta/config/usageLimits', path.join(root, 'packages/config/src/usageLimits.ts')],
  ['@pridicta/types', path.join(root, 'packages/types/src/index.ts')],
]);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveWorkspaceAlias(request, parent, isMain, options) {
  if (aliasMap.has(request)) {
    return aliasMap.get(request);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

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

const phaseName =
  'PREDICTA_EVENT_ORACLE_PHASE_8_PRECISION_READING_MONETIZATION_AND_ENTITLEMENTS';
const auditDir = path.join(root, 'docs/audits', phaseName);
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return existsSync(path.join(root, relativePath));
}

function assertGate(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

[
  'docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md',
  'packages/types/src/subscription.ts',
  'packages/types/src/productBank.ts',
  'packages/config/src/pricing.ts',
  'packages/config/src/translations/eventOracle.json',
  'packages/config/src/translations/monetization.json',
  'packages/monetization/src/serverEntitlementLedger.ts',
  'packages/monetization/src/entitlementParity.ts',
  'backend/astro_api/ai_routing_policy.py',
  'backend/astro_api/ai_cost_governance.py',
  'backend/astro_api/ai_telemetry.py',
  'backend/astro_api/models.py',
  'apps/web/components/WebEventQuestionComposer.tsx',
  'apps/web/app/globals.css',
  `${path.relative(root, auditDir)}/phase-8-manifest.json`,
  `${path.relative(root, auditDir)}/phase-8-entitlement-audit.md`,
  `${path.relative(root, auditDir)}/browser-smoke.json`,
  `${path.relative(root, auditDir)}/verification.txt`,
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'Product: `Predicta Precision Reading`',
  'Free preview: short answer or readiness preview',
  'Paid reading: full timing, trigger, contradictions, action plan, evidence',
  'Follow-up pack tied to the same prediction thread',
  'Report credit integration only if a PDF is generated',
  'Cost telemetry records feature, model, tokens, plan, and product',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 8 roadmap'));

const subscriptionSource = read('packages/types/src/subscription.ts');
assertIncludes(subscriptionSource, "| 'PRECISION_READING'", 'subscription type');
assertIncludes(subscriptionSource, "| 'PRECISION_FOLLOW_UP_PACK'", 'subscription type');

const productBankSource = read('packages/types/src/productBank.ts');
[
  'PRODUCT_BANK_PRECISION_READING_USES',
  'PRODUCT_BANK_PRECISION_FOLLOW_UP_USES',
  'PRECISION_READING: 1',
  'PRECISION_FOLLOW_UP_PACK: 3',
  'isPrecisionReadingProduct',
  'isPrecisionFollowUpProduct',
].forEach(fragment => assertIncludes(productBankSource, fragment, 'product bank'));

const pricingSource = read('packages/config/src/pricing.ts');
[
  'precisionReading: 399',
  'precisionFollowUpPack: 149',
  "PRECISION_READING: 'pridicta_precision_reading'",
  "PRECISION_FOLLOW_UP_PACK: 'pridicta_precision_follow_up_pack'",
  "id: 'PRECISION_READING'",
  "id: 'PRECISION_FOLLOW_UP_PACK'",
].forEach(fragment => assertIncludes(pricingSource, fragment, 'pricing'));

const eventOracleCopy = readJson('packages/config/src/translations/eventOracle.json');
for (const language of ['en', 'hi', 'gu']) {
  const copy = eventOracleCopy.copy[language].precisionReading;
  for (const key of [
    'costGuardrail',
    'followUp',
    'freePreviewBody',
    'freePreviewTitle',
    'paidBody',
    'paidCta',
    'paidTitle',
    'productLabel',
    'reportSeparation',
    'telemetry',
  ]) {
    assertGate(Boolean(copy?.[key]), `missing ${language}.precisionReading.${key}`);
  }
}

const monetizationCopy = read('packages/config/src/translations/monetization.json');
[
  '"PRECISION_READING"',
  '"PRECISION_FOLLOW_UP_PACK"',
  '"checkoutPrecisionReading"',
  '"checkoutPrecisionFollowUpPack"',
].forEach(fragment => assertIncludes(monetizationCopy, fragment, 'monetization copy'));

const {
  applyServerEntitlementOperation,
  createDefaultServerEntitlementLedger,
  mapOneTimeProductToLedgerOperation,
} = require('../packages/monetization/src/serverEntitlementLedger.ts');
const {
  evaluatePrecisionReadingEntitlement,
  shouldConsumeDayPassPrecisionCredit,
  shouldConsumePrecisionFollowUpCredit,
  shouldConsumePrecisionReadingCredit,
} = require('../packages/monetization/src/entitlementParity.ts');
const { getOneTimeProduct } = require('../packages/config/src/pricing.ts');

let ledger = createDefaultServerEntitlementLedger('phase8-user', '2026-06-10T00:00:00.000Z');
assert.equal(ledger.precisionReadingCreditsBalance, 0);
assert.equal(ledger.precisionFollowUpCreditsBalance, 0);
assert.equal(ledger.familyBank.sharedPrecisionReadingCreditsBalance, 0);

const previewDecision = evaluatePrecisionReadingEntitlement({
  ledger,
  mode: 'FREE_PREVIEW',
  userPlan: 'FREE',
});
assert.deepEqual(previewDecision, {
  allowed: true,
  creditSource: 'free_deterministic_preview',
  mode: 'FREE_PREVIEW',
  product: 'predicta_precision_preview',
});

const blockedPaidDecision = evaluatePrecisionReadingEntitlement({
  ledger,
  mode: 'PAID_READING',
  userPlan: 'FREE',
});
assert.equal(blockedPaidDecision.allowed, false);
assert.equal(blockedPaidDecision.reason, 'precision_reading_credit_required');

const precisionProduct = getOneTimeProduct('PRECISION_READING');
const grantPrecision = mapOneTimeProductToLedgerOperation({
  idempotencyKey: 'phase8-grant-precision',
  productId: precisionProduct.productId,
  productType: 'PRECISION_READING',
});
assert.equal(grantPrecision.kind, 'grant_precision_reading_credit');
ledger = applyServerEntitlementOperation({ ledger, operation: grantPrecision }).ledger;
assert.equal(ledger.precisionReadingCreditsBalance, 1);

const paidCreditDecision = evaluatePrecisionReadingEntitlement({
  ledger,
  mode: 'PAID_READING',
  userPlan: 'FREE',
});
assert.equal(paidCreditDecision.allowed, true);
assert.equal(paidCreditDecision.creditSource, 'personal');
assert.equal(shouldConsumePrecisionReadingCredit(paidCreditDecision), true);
ledger = applyServerEntitlementOperation({
  ledger,
  operation: {
    idempotencyKey: 'phase8-consume-precision',
    kind: 'consume_precision_reading_credit',
    source: paidCreditDecision.creditSource,
  },
}).ledger;
assert.equal(ledger.precisionReadingCreditsBalance, 0);

const followUpProduct = getOneTimeProduct('PRECISION_FOLLOW_UP_PACK');
const grantFollowUp = mapOneTimeProductToLedgerOperation({
  idempotencyKey: 'phase8-grant-follow-up',
  productId: followUpProduct.productId,
  productType: 'PRECISION_FOLLOW_UP_PACK',
});
assert.equal(grantFollowUp.kind, 'grant_precision_follow_up_credit');
ledger = applyServerEntitlementOperation({ ledger, operation: grantFollowUp }).ledger;
assert.equal(ledger.precisionFollowUpCreditsBalance, 3);
const followUpDecision = evaluatePrecisionReadingEntitlement({
  ledger,
  mode: 'FOLLOW_UP',
  userPlan: 'FREE',
});
assert.equal(followUpDecision.allowed, true);
assert.equal(shouldConsumePrecisionFollowUpCredit(followUpDecision), true);

const passLedger = {
  ...createDefaultServerEntitlementLedger('phase8-pass', '2026-06-10T00:00:00.000Z'),
  dayPassEntitlement: {
    active: true,
    deepCallsRemaining: 1,
    pdfsRemaining: 0,
    questionsRemaining: 0,
  },
};
const passDecision = evaluatePrecisionReadingEntitlement({
  ledger: passLedger,
  mode: 'PAID_READING',
  userPlan: 'FREE',
});
assert.equal(passDecision.allowed, true);
assert.equal(passDecision.creditSource, 'day_pass');
assert.equal(shouldConsumeDayPassPrecisionCredit(passDecision), true);
const passConsumed = applyServerEntitlementOperation({
  ledger: passLedger,
  operation: {
    idempotencyKey: 'phase8-pass-consume',
    kind: 'consume_day_pass_precision_reading',
  },
}).ledger;
assert.equal(passConsumed.dayPassEntitlement.deepCallsRemaining, 0);

const premiumDecision = evaluatePrecisionReadingEntitlement({
  ledger: createDefaultServerEntitlementLedger('phase8-premium', '2026-06-10T00:00:00.000Z'),
  mode: 'PAID_READING',
  userPlan: 'PREMIUM',
});
assert.equal(premiumDecision.allowed, true);
assert.equal(premiumDecision.creditSource, 'premium_subscription');

const familyLedger = {
  ...createDefaultServerEntitlementLedger('phase8-family', '2026-06-10T00:00:00.000Z'),
  familyBank: {
    ...createDefaultServerEntitlementLedger('phase8-family', '2026-06-10T00:00:00.000Z').familyBank,
    sharedPrecisionReadingCreditsBalance: 1,
  },
};
const familyDecision = evaluatePrecisionReadingEntitlement({
  ledger: familyLedger,
  mode: 'PAID_READING',
  userPlan: 'FREE',
});
assert.equal(familyDecision.allowed, true);
assert.equal(familyDecision.creditSource, 'family_bank');

const reportGrant = mapOneTimeProductToLedgerOperation({
  idempotencyKey: 'phase8-report-grant',
  productId: 'pridicta_single_report',
  productType: 'REPORT_SINGLE',
});
assert.equal(reportGrant.kind, 'grant_report_credit');
assert.equal(reportGrant.reportType, 'PREMIUM_PDF');

const ledgerSource = read('packages/monetization/src/serverEntitlementLedger.ts');
[
  'precisionReadingCreditsBalance',
  'precisionFollowUpCreditsBalance',
  'consume_day_pass_precision_reading',
  'precision_reading_credit_exhausted',
  'precision_follow_up_credit_exhausted',
].forEach(fragment => assertIncludes(ledgerSource, fragment, 'server ledger'));

const paritySource = read('packages/monetization/src/entitlementParity.ts');
[
  'evaluatePrecisionReadingEntitlement',
  "'free_deterministic_preview'",
  "'premium_subscription'",
  "'day_pass'",
  "'precision_reading_credit_required'",
  'shouldConsumePrecisionReadingCredit',
  'shouldConsumePrecisionFollowUpCredit',
].forEach(fragment => assertIncludes(paritySource, fragment, 'entitlement parity'));

const routingSource = read('backend/astro_api/ai_routing_policy.py');
[
  '"precision_reading"',
  '"paid-precision-reading-uses-entitled-premium-depth-without-report-validator"',
  '"precisionReading"',
].forEach(fragment => assertIncludes(routingSource, fragment, 'AI routing'));

const costSource = read('backend/astro_api/ai_cost_governance.py');
assertIncludes(costSource, '"precision_reading": {"alertAt": 0.06, "stopAt": 0.18}', 'AI cost governance');

const telemetrySource = read('backend/astro_api/ai_telemetry.py');
const modelSource = read('backend/astro_api/models.py');
assertIncludes(telemetrySource, 'product_type: Optional[str] = None', 'AI telemetry');
assertIncludes(telemetrySource, 'productType=product_type', 'AI telemetry');
assertIncludes(modelSource, 'productType: Optional[str] = None', 'AI telemetry model');

const composerSource = read('apps/web/components/WebEventQuestionComposer.tsx');
[
  "getOneTimeProduct('PRECISION_READING')",
  'copy.precisionReading.freePreviewTitle',
  'copy.precisionReading.paidTitle',
  'copy.precisionReading.costGuardrail',
  'copy.precisionReading.reportSeparation',
  'rememberRecentThread(refinement)',
  'productId=${PRECISION_READING_PRODUCT.productId}',
].forEach(fragment => assertIncludes(composerSource, fragment, 'Event Oracle composer precision UI'));

const cssSource = read('apps/web/app/globals.css');
[
  '.event-question-precision-panel',
  'grid-column: 1 / -1',
  'overflow-wrap: anywhere',
].forEach(fragment => assertIncludes(cssSource, fragment, 'Event Oracle precision CSS'));

const manifest = readJson(`${path.relative(root, auditDir)}/phase-8-manifest.json`);
assert.equal(manifest.phase, phaseName);
assert.equal(manifest.status, 'GREEN');
assert.equal(manifest.product, 'Predicta Precision Reading');
assert.equal(manifest.freePreview, 'deterministic_no_ai');
assert.equal(manifest.paidCreditProductId, 'pridicta_precision_reading');
assert.equal(manifest.followUpProductId, 'pridicta_precision_follow_up_pack');

const browserSmoke = readJson(`${path.relative(root, auditDir)}/browser-smoke.json`);
assert.equal(browserSmoke.result, 'PASS');
assert.equal(browserSmoke.documentScrollWidth, browserSmoke.viewportWidth);
assert.equal(browserSmoke.precisionPanel.ctaHref, '/checkout?productId=pridicta_precision_reading');
assert.equal(browserSmoke.precisionPanel.hasPaidPrecision, true);

if (failures.length) {
  console.error(`\n${phaseName} failed:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`${phaseName}: GREEN`);
