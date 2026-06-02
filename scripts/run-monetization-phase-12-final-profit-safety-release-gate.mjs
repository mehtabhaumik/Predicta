import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_MONETIZATION_PHASE_12_FINAL_PROFIT_SAFETY_RELEASE_AUDIT';
const auditDir = 'docs/audits/PREDICTA_MONETIZATION_PHASE_12_FINAL_PROFIT_SAFETY_RELEASE_AUDIT';
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

function assertNotIncludes(source, needle, label) {
  assert(!source.includes(needle), `${label} must not include ${needle}`);
}

function assertAllIncludes(source, fragments, label) {
  for (const fragment of fragments) {
    assertIncludes(source, fragment, label);
  }
}

[
  'docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md',
  `${auditDir}/final-profit-safety-release-audit.md`,
  `${auditDir}/phase-12-final-profit-safety-manifest.json`,
  'docs/audits/PREDICTA_MONETIZATION_PHASE_11_WEB_MOBILE_END_TO_END_PURCHASE_AND_ENTITLEMENT_SMOKE/phase-11-purchase-entitlement-smoke-manifest.json',
  'docs/audits/PREDICTA_AI_MODEL_PHASE_7_RELEASE_GOVERNANCE_COST_PROFIT_AND_SAFETY_GATE/release-governance-report.json',
  'apps/web/app/api/ask-pridicta/route.ts',
  'apps/web/app/api/report/pdf/route.ts',
  'apps/web/app/api/generate-kundli/route.ts',
  'apps/web/app/api/extract-birth-details/route.ts',
  'apps/web/app/api/entitlements/ledger/route.ts',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/web/app/checkout/page.tsx',
  'apps/mobile/src/services/ai/pridictaService.ts',
  'apps/mobile/src/screens/ReportScreen.tsx',
  'apps/mobile/src/services/billing/disabledBillingProvider.ts',
  'packages/monetization/src/serverEntitlementLedger.ts',
  'packages/monetization/src/entitlementParity.ts',
  'packages/monetization/src/kundliLibraryEntitlement.ts',
  'packages/astrology/src/familyVaultComparisonLimits.ts',
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
assertAllIncludes(
  roadmap,
  [
    phaseName,
    'Run full public greenlight.',
    'Run AI model governance.',
    'Run payment workflow tests.',
    'Run entitlement ledger tests.',
    'Run report golden artifacts.',
    'Run mobile tests.',
    'Run localization tests.',
    'Run UI/UX audits.',
    'Zero Critical issues.',
    'Zero Major issues.',
    'No hidden unmetered AI call path.',
    'No client-only quota authority.',
    'No report entitlement bypass.',
    'No sign-in bypass for personalized actions.',
  ],
  'Phase 12 roadmap contract',
);

const audit = read(`${auditDir}/final-profit-safety-release-audit.md`);
assertAllIncludes(
  audit,
  [
    'Verdict: GREEN',
    '| Critical | 0 | Clear |',
    '| Major | 0 | Clear |',
    'Razorpay sandbox smoke was skipped because sandbox keys are not present locally.',
    'deployed production green',
  ],
  'Phase 12 audit report',
);

const manifest = readJson(`${auditDir}/phase-12-final-profit-safety-manifest.json`);
assert(manifest.phase === phaseName, 'Phase 12 manifest phase mismatch');
assert(manifest.status === 'GREEN', 'Phase 12 manifest must be GREEN');
assert(manifest.deploymentRequested === false, 'Phase 12 manifest must explicitly record no deployment request');
assert(manifest.issueLedger?.critical === 0, 'Phase 12 must have zero Critical issues');
assert(manifest.issueLedger?.major === 0, 'Phase 12 must have zero Major issues');
assert(manifest.greenCriteria?.zeroCriticalIssues === true, 'zero Critical green criterion missing');
assert(manifest.greenCriteria?.zeroMajorIssues === true, 'zero Major green criterion missing');
assert(manifest.greenCriteria?.noHiddenUnmeteredAiCallPath === true, 'AI metering green criterion missing');
assert(manifest.greenCriteria?.noClientOnlyQuotaAuthority === true, 'server quota green criterion missing');
assert(manifest.greenCriteria?.noReportEntitlementBypass === true, 'report entitlement green criterion missing');
assert(manifest.greenCriteria?.noSignInBypassForPersonalizedActions === true, 'sign-in green criterion missing');

[
  'corepack pnpm build:web',
  'PREDICTA_GREENLIGHT_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:public-greenlight',
  'python3 -m backend.astro_api.release_governance',
  'corepack pnpm test:ai-model-phase-7',
  'corepack pnpm test:mobile',
  'corepack pnpm test:pdf-golden',
  'corepack pnpm test:localization-architecture',
  'corepack pnpm test:translation-trust',
  'corepack pnpm test:native-script-chat',
  'corepack pnpm test:pre-live-phase-9',
  'corepack pnpm test:ui-personal-space',
  'corepack pnpm test:ui-text-overflow',
  'corepack pnpm test:monetization-phase-11',
  'git diff --check',
].forEach(command => {
  assert(
    manifest.completedVerification?.includes(command),
    `Phase 12 manifest is missing verification command: ${command}`,
  );
});

const phase11 = readJson(
  'docs/audits/PREDICTA_MONETIZATION_PHASE_11_WEB_MOBILE_END_TO_END_PURCHASE_AND_ENTITLEMENT_SMOKE/phase-11-purchase-entitlement-smoke-manifest.json',
);
assert(phase11.status === 'GREEN', 'Phase 11 smoke manifest must remain GREEN');
assert(
  phase11.smokeResult?.disabledGateway === 'honest-no-entitlement',
  'disabled gateway smoke must remain honest-no-entitlement',
);
assert(
  phase11.smokeResult?.familyComparison === '2-4-allowed-5-blocked',
  'family comparison smoke must enforce 2-4',
);
assert(
  phase11.razorpaySandbox?.status === 'skipped-missing-keys' &&
    phase11.razorpaySandbox?.requiredWhenKeysAreAdded === true,
  'Razorpay sandbox skip must be explicit and temporary',
);

const governance = readJson(
  'docs/audits/PREDICTA_AI_MODEL_PHASE_7_RELEASE_GOVERNANCE_COST_PROFIT_AND_SAFETY_GATE/release-governance-report.json',
);
assert(governance.releaseStatus === 'READY', 'AI release governance report must be READY');
assert(Array.isArray(governance.blockers) && governance.blockers.length === 0, 'AI governance blockers must be empty');

for (let phase = 0; phase <= 11; phase += 1) {
  const found = fs
    .readdirSync(path.join(root, 'docs/audits'))
    .some(name => name.startsWith(`PREDICTA_MONETIZATION_PHASE_${phase}_`));
  assert(found, `missing prior monetization phase audit directory for Phase ${phase}`);
}

const serverLedger = read('packages/monetization/src/serverEntitlementLedger.ts');
assertAllIncludes(
  serverLedger,
  [
    'FREE_AI_QUESTION_LIFETIME_LIMIT = 3',
    "kind: 'record_successful_free_ai_answer'",
    "kind: 'record_successful_paid_ai_answer'",
    "kind: 'record_successful_day_pass_ai_answer'",
    "kind: 'consume_report_credit'",
    "kind: 'consume_day_pass_report_pdf'",
    'savedKundliCount',
    'familyBank',
  ],
  'server entitlement ledger',
);

const parity = read('packages/monetization/src/entitlementParity.ts');
assertAllIncludes(
  parity,
  [
    'export function evaluateAiCreditEntitlement',
    'export function evaluateReportEntitlement',
    'selectPaidAiCreditSpendSource',
    'selectPaidReportCreditSpend',
    "case 'KP':",
    "case 'JAIMINI':",
    "case 'NUMEROLOGY':",
    "case 'SIGNATURE':",
    "case 'LIFE_ATLAS':",
  ],
  'shared entitlement parity',
);

const webAsk = read('apps/web/app/api/ask-pridicta/route.ts');
assertAllIncludes(
  webAsk,
  [
    'requireFirebaseUser(request)',
    'evaluateAiCreditEntitlement',
    "kind: 'record_successful_free_ai_answer'",
    "kind: 'record_successful_paid_ai_answer'",
    "kind: 'record_successful_day_pass_ai_answer'",
    'selectPaidAiCreditSpendSource',
    'preservedQuestion',
  ],
  'web ask route',
);

const mobileAsk = read('apps/mobile/src/services/ai/pridictaService.ts');
assertAllIncludes(
  mobileAsk,
  [
    'evaluateAiCreditEntitlement',
    "kind: 'record_successful_free_ai_answer'",
    "kind: 'record_successful_paid_ai_answer'",
    "kind: 'record_successful_day_pass_ai_answer'",
    'selectPaidAiCreditSpendSource',
    'preservedQuestion',
  ],
  'mobile Predicta AI service',
);

const webChat = read('apps/web/components/WebPridictaChat.tsx');
assertNotIncludes(webChat, 'consumeWebAiBudget(', 'web chat must not use client-only AI budget consumption');

const webReport = read('apps/web/app/api/report/pdf/route.ts');
assertAllIncludes(
  webReport,
  [
    'requireFirebaseUser(request)',
    'evaluateReportEntitlement',
    "kind: 'consume_report_credit'",
    "kind: 'consume_day_pass_report_pdf'",
    'hasReadySignatureAnalysis(payload.signatureAnalysis)',
    'const pdfBuffer = await renderToBuffer',
  ],
  'web report route',
);

const mobileReport = read('apps/mobile/src/screens/ReportScreen.tsx');
assertAllIncludes(
  mobileReport,
  [
    'evaluateReportEntitlement',
    "kind: 'consume_report_credit'",
    "kind: 'consume_day_pass_report_pdf'",
    'Signature reports require a confirmed signature sample',
    'const result = await generateHoroscopePdf',
  ],
  'mobile report screen',
);

[
  'apps/web/app/api/generate-kundli/route.ts',
  'apps/web/app/api/extract-birth-details/route.ts',
  'apps/web/app/api/entitlements/ledger/route.ts',
].forEach(file => {
  assertIncludes(read(file), 'requireFirebaseUser(request)', `${file} personalized API auth`);
});

const kundli = read('packages/monetization/src/kundliLibraryEntitlement.ts');
assertAllIncludes(
  kundli,
  [
    'FREE_SAVED_KUNDLI_LIMIT = 4',
    'PREMIUM_KUNDLI_DAILY_SOFT_LIMIT = 30',
    'FREE_KUNDLI_LIMIT_REACHED',
    'SIGN_IN_REQUIRED_FOR_MULTIPLE_KUNDLIS',
  ],
  'Kundli library entitlement',
);

const familyLimits = read('packages/astrology/src/familyVaultComparisonLimits.ts');
assertAllIncludes(
  familyLimits,
  [
    'FAMILY_COMPARISON_MIN_KUNDLIS = 2',
    'FAMILY_COMPARISON_MAX_KUNDLIS = 4',
    "'needs_at_least_two'",
    "'too_many'",
  ],
  'family comparison limits',
);

const checkout = read('apps/web/app/checkout/page.tsx');
assertAllIncludes(
  checkout,
  [
    'NEXT_PUBLIC_PREDICTA_RAZORPAY_ENABLED',
    "state: gatewayReady ? 'gateway_ready' : 'gateway_disabled'",
    'checkoutRazorpayDisabled',
  ],
  'web checkout honesty',
);
assertNotIncludes(checkout, "status: 'SUCCESS'", 'web checkout must not fake success');
assertNotIncludes(checkout, "state: 'entitlement_active'", 'web checkout must not fake entitlement');

const disabledBilling = read('apps/mobile/src/services/billing/disabledBillingProvider.ts');
assertAllIncludes(
  disabledBilling,
  [
    "state: 'gateway_disabled'",
    "status: 'PENDING'",
    'No payment was taken',
  ],
  'mobile disabled billing honesty',
);
assertNotIncludes(disabledBilling, "status: 'SUCCESS'", 'mobile disabled billing must not fake success');
assertNotIncludes(disabledBilling, 'entitlement:', 'mobile disabled billing must not grant entitlement');
assertNotIncludes(disabledBilling, 'oneTimeEntitlement:', 'mobile disabled billing must not grant one-time entitlement');

if (failures.length) {
  console.error('Monetization Phase 12 final profit/safety release gate failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  'Monetization Phase 12 final profit/safety release gate passed: final audit artifact is GREEN, zero Critical/Major issues are recorded, AI/report/payment entitlements are server-backed, disabled checkout is honest, public/mobile/localization/UI/report gates are evidenced, and deployed smoke is explicitly deferred until deployment is requested.',
);
