import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const requiredFiles = [
  'docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_0_BASELINE_AND_CONTRACT_LOCK/baseline-ledger.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_0_BASELINE_AND_CONTRACT_LOCK/phase-0-baseline-manifest.json',
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Monetization Phase 0 baseline gate failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
assert(
  roadmap.includes('PREDICTA_MONETIZATION_PHASE_0_BASELINE_AND_CONTRACT_LOCK'),
  'roadmap does not contain the Phase 0 contract',
);

const ledger = read(
  'docs/audits/PREDICTA_MONETIZATION_PHASE_0_BASELINE_AND_CONTRACT_LOCK/baseline-ledger.md',
);
const normalizedLedger = ledger.toLowerCase();

[
  'Critical Findings',
  'Major Findings',
  'Medium Findings',
  'Minor Findings',
  'Client-Side Quota Authority Ledger',
  'Deterministic Chat Blocked By AI Budget',
  'No Entitlement Implementation Started',
  'Razorpay-Disabled Checkout Baseline',
].forEach((heading) => {
  assert(ledger.includes(heading), `baseline ledger missing section: ${heading}`);
});

[
  'server-side entitlement authority does not exist',
  'Personalized generation is not sign-in hard-gated',
  'Free AI quota is not the required 3 lifetime questions',
  "consumeWebAiBudget('question')",
  'PDF API has no auth/entitlement enforcement',
  'Free signed-in users are not limited to 4 saved Kundlis',
  'minimum 2 and maximum 4 Kundlis',
].forEach((evidence) => {
  assert(normalizedLedger.includes(evidence.toLowerCase()), `baseline ledger missing evidence: ${evidence}`);
});

const manifest = JSON.parse(
  read('docs/audits/PREDICTA_MONETIZATION_PHASE_0_BASELINE_AND_CONTRACT_LOCK/phase-0-baseline-manifest.json'),
);
assert(
  manifest.phase === 'PREDICTA_MONETIZATION_PHASE_0_BASELINE_AND_CONTRACT_LOCK',
  'manifest phase mismatch',
);
assert(manifest.implementationStarted === false, 'Phase 0 manifest must not start implementation');

const webBudget = read('apps/web/lib/web-pass-cost-guardrails.ts');
assert(webBudget.includes('FREE_DAILY_LIMITS'), 'web free daily limits were not found');
assert(webBudget.includes('FREE_USAGE_KEY'), 'web free localStorage key was not found');
assert(webBudget.includes('consumeWebAiBudget'), 'web AI budget consumer was not found');

const webChat = read('apps/web/components/WebPridictaChat.tsx');
assert(
  webChat.includes("consumeWebAiBudget('question'") && webChat.includes('extractBirthDetailsFromWeb'),
  'web chat no longer matches the locked deterministic-budget baseline',
);

const mobileStore = read('apps/mobile/src/store/useAppStore.ts');
assert(
  mobileStore.includes('questionsToday < limits.questionsPerDay') ||
    mobileStore.includes('usage.questionsToday') ||
    mobileStore.includes('recordQuestion'),
  'mobile local usage counter baseline was not found',
);

const webKundliStorage = read('apps/web/lib/web-kundli-storage.ts');
assert(
  webKundliStorage.includes('WEB_GUEST_KUNDLI_LIMIT = 1'),
  'web guest Kundli local limit baseline was not found',
);

const mobileKundliStorage = read('apps/mobile/src/services/kundli/kundliRepository.ts');
assert(
  mobileKundliStorage.includes('GUEST_KUNDLI_LIMIT = 1'),
  'mobile guest Kundli local limit baseline was not found',
);

const mobileEntitlements = read('apps/mobile/src/services/subscription/entitlementService.ts');
assert(
  mobileEntitlements.includes('MONETIZATION_STORAGE_KEY'),
  'mobile AsyncStorage monetization baseline was not found',
);

const askRoute = read('apps/web/app/api/ask-pridicta/route.ts');
assert(
  !askRoute.includes('verifyIdToken') && !askRoute.includes('Authorization'),
  'ask-pridicta route now contains auth enforcement; update the Phase 0 ledger before continuing',
);

const kundliRoute = read('apps/web/app/api/generate-kundli/route.ts');
assert(
  !kundliRoute.includes('verifyIdToken') && !kundliRoute.includes('Authorization'),
  'generate-kundli route now contains auth enforcement; update the Phase 0 ledger before continuing',
);

const pdfRoute = read('apps/web/app/api/report/pdf/route.ts');
assert(
  pdfRoute.includes("payload.reportFocus === 'SIGNATURE'") &&
    !pdfRoute.includes('verifyIdToken') &&
    !pdfRoute.includes('Authorization'),
  'report PDF route no longer matches the locked signature-only enforcement baseline',
);

const familyKarmaMap = read('apps/web/components/WebFamilyKarmaMap.tsx');
assert(
  familyKarmaMap.includes('current.length >= profiles.length'),
  'family Karma Map max-selection baseline was not found',
);

const checkout = read('apps/web/app/checkout/page.tsx');
assert(
  checkout.includes('NEXT_PUBLIC_PREDICTA_RAZORPAY_ENABLED') && checkout.includes('gateway_disabled'),
  'Razorpay-disabled checkout baseline was not found',
);

console.log('Monetization Phase 0 baseline gate passed.');
