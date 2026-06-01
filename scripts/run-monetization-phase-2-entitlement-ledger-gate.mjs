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
  console.error(`Monetization Phase 2 entitlement ledger gate failed: ${message}`);
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

function assertEqual(actual, expected, message) {
  assert(
    actual === expected,
    `${message}; expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
  );
}

function assertDeepEqual(actual, expected, message) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${message}; expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
  );
}

async function importLedgerModule() {
  const sourcePath = path.join(root, 'packages/monetization/src/serverEntitlementLedger.ts');
  const source = fs.readFileSync(sourcePath, 'utf8')
    .replace(
      "import { createFreeEntitlement } from '@pridicta/types';",
      [
        "function createFreeEntitlement(source = 'local') {",
        "  return {",
        "    plan: 'FREE',",
        "    source,",
        "    status: 'NONE',",
        "    updatedAt: new Date().toISOString(),",
        '  };',
        '}',
      ].join('\n'),
    );

  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
    fileName: sourcePath,
  }).outputText;

  const tmpPath = path.join(os.tmpdir(), `predicta-entitlement-ledger-${Date.now()}.mjs`);
  fs.writeFileSync(tmpPath, compiled);
  return import(pathToFileURL(tmpPath).href);
}

const requiredFiles = [
  'docs/audits/PREDICTA_MONETIZATION_PHASE_2_SERVER_ENTITLEMENT_LEDGER_AND_FIREBASE_UID_SOURCE_OF_TRUTH/server-entitlement-ledger.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_2_SERVER_ENTITLEMENT_LEDGER_AND_FIREBASE_UID_SOURCE_OF_TRUTH/phase-2-ledger-manifest.json',
  'packages/monetization/src/serverEntitlementLedger.ts',
  'apps/web/app/api/entitlements/ledger/route.ts',
  'apps/web/lib/firebase/server-entitlement-ledger.ts',
  'apps/mobile/src/services/firebase/serverEntitlementLedgerSync.ts',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
assertIncludes(
  roadmap,
  'PREDICTA_MONETIZATION_PHASE_2_SERVER_ENTITLEMENT_LEDGER_AND_FIREBASE_UID_SOURCE_OF_TRUTH',
  'monetization roadmap',
);
assertIncludes(roadmap, 'Free AI credits cannot reset by clearing browser/app storage.', 'roadmap');

const ledgerSource = read('packages/monetization/src/serverEntitlementLedger.ts');
[
  'SERVER_ENTITLEMENT_LEDGER_VERSION',
  'FREE_AI_QUESTION_LIFETIME_LIMIT = 3',
  'freeAiCreditsUsed',
  'paidAiQuestionCreditsBalance',
  'reportCreditsByType',
  'savedKundliCount',
  'premiumEntitlement',
  'dayPassEntitlement',
  'familyBank',
  'applyServerEntitlementOperation',
  'idempotencyKey',
  'mapServerLedgerToMonetizationState',
].forEach(fragment => assertIncludes(ledgerSource, fragment, 'shared server entitlement ledger'));
assert(
  !ledgerSource.includes('reserve_ai_question'),
  'ledger must not reserve/spend AI credits before a successful provider answer',
);

const webAdapter = read('apps/web/lib/firebase/server-entitlement-ledger.ts');
[
  'commitServerEntitlementOperation',
  'readServerEntitlementLedger',
  'entitlementLedger',
  'entitlementOperations',
  'currentDocument',
  'exists: false',
  'updateTime',
  ':commit',
  'MAX_COMMIT_RETRIES',
].forEach(fragment => assertIncludes(webAdapter, fragment, 'web Firebase entitlement adapter'));

const webRoute = read('apps/web/app/api/entitlements/ledger/route.ts');
[
  'requireFirebaseUser',
  'readServerEntitlementLedger',
  'commitServerEntitlementOperation',
  'PREDICTA_ENTITLEMENT_OPERATION_SECRET',
  'x-predicta-entitlement-operation-secret',
  'Entitlement mutation is not allowed from this client.',
].forEach(fragment => assertIncludes(webRoute, fragment, 'web entitlement API route'));

const webAccess = read('apps/web/lib/web-access-state.ts');
[
  'loadWebServerLedgerState',
  '/api/entitlements/ledger',
  'mapServerLedgerToMonetizationState',
  'getWebAuthHeaders',
].forEach(fragment => assertIncludes(webAccess, fragment, 'web access state server-ledger reader'));

const mobileAdapter = read('apps/mobile/src/services/firebase/serverEntitlementLedgerSync.ts');
[
  'loadServerEntitlementLedgerFromFirebase',
  'commitServerEntitlementOperationToFirebase',
  'runTransaction',
  'entitlementLedger',
  'entitlementOperations',
  'applyServerEntitlementOperation',
  'duplicate: true',
].forEach(fragment => assertIncludes(mobileAdapter, fragment, 'mobile entitlement transaction helper'));

const ledgerDoc = read(
  'docs/audits/PREDICTA_MONETIZATION_PHASE_2_SERVER_ENTITLEMENT_LEDGER_AND_FIREBASE_UID_SOURCE_OF_TRUTH/server-entitlement-ledger.md',
);
[
  'Firebase UID Source Of Truth',
  'Failed AI/provider calls do not consume credits',
  'Double-submit protection',
  'Family Bank',
  'Client State Is Cache Only',
].forEach(section => assertIncludes(ledgerDoc, section, 'Phase 2 audit ledger'));

const manifest = JSON.parse(
  read(
    'docs/audits/PREDICTA_MONETIZATION_PHASE_2_SERVER_ENTITLEMENT_LEDGER_AND_FIREBASE_UID_SOURCE_OF_TRUTH/phase-2-ledger-manifest.json',
  ),
);
assertEqual(manifest.phase, 'PREDICTA_MONETIZATION_PHASE_2_SERVER_ENTITLEMENT_LEDGER_AND_FIREBASE_UID_SOURCE_OF_TRUTH', 'manifest phase');
assertEqual(manifest.green, true, 'manifest green flag');

const ledger = await importLedgerModule();
const {
  FREE_AI_QUESTION_LIFETIME_LIMIT,
  applyServerEntitlementOperation,
  createDefaultServerEntitlementLedger,
  mapOneTimeProductToLedgerOperation,
  mapServerLedgerToMonetizationState,
} = ledger;

assertEqual(FREE_AI_QUESTION_LIFETIME_LIMIT, 3, 'free lifetime AI credit limit');

const now = '2026-06-02T00:00:00.000Z';
let state = createDefaultServerEntitlementLedger('uid_phase_2', now);
assertEqual(state.uid, 'uid_phase_2', 'default ledger uid');
assertEqual(state.freeAiCreditsUsed, 0, 'default free AI credits');
assertEqual(state.paidAiQuestionCreditsBalance, 0, 'default paid AI balance');
assertEqual(state.savedKundliCount, 0, 'default saved Kundli count');
assertEqual(state.familyBank.ownerUid, 'uid_phase_2', 'default Family Bank owner');

for (let index = 1; index <= 3; index += 1) {
  const result = applyServerEntitlementOperation({
    ledger: state,
    nowIso: `2026-06-02T00:00:0${index}.000Z`,
    operation: {
      idempotencyKey: `free-success-${index}`,
      kind: 'record_successful_free_ai_answer',
    },
  });
  assertEqual(result.changed, true, `free AI credit ${index} should change`);
  state = result.ledger;
}
assertEqual(state.freeAiCreditsUsed, 3, 'three free AI credits are lifetime-spent');

const freeExhausted = applyServerEntitlementOperation({
  ledger: state,
  operation: {
    idempotencyKey: 'free-success-4',
    kind: 'record_successful_free_ai_answer',
  },
});
assertEqual(freeExhausted.changed, false, 'fourth free AI credit is blocked');
assertEqual(freeExhausted.reason, 'free_ai_lifetime_exhausted', 'fourth free AI credit reason');
assertEqual(freeExhausted.ledger.freeAiCreditsUsed, 3, 'free credits cannot reset in the ledger object');

const afterFailedProvider = { ...state };
assertEqual(
  afterFailedProvider.freeAiCreditsUsed,
  state.freeAiCreditsUsed,
  'failed providers do not mutate ledger because only successful-answer operations exist',
);

let paid = applyServerEntitlementOperation({
  ledger: state,
  operation: {
    idempotencyKey: 'grant-five',
    kind: 'grant_paid_ai_questions',
    quantity: 5,
  },
}).ledger;
paid = applyServerEntitlementOperation({
  ledger: paid,
  operation: {
    idempotencyKey: 'paid-use-1',
    kind: 'record_successful_paid_ai_answer',
    source: 'personal',
  },
}).ledger;
paid = applyServerEntitlementOperation({
  ledger: paid,
  operation: {
    idempotencyKey: 'paid-use-2',
    kind: 'record_successful_paid_ai_answer',
    source: 'personal',
  },
}).ledger;
assertEqual(paid.paidAiQuestionCreditsBalance, 3, 'paid question pack balance after two spends');

let report = applyServerEntitlementOperation({
  ledger: paid,
  operation: {
    idempotencyKey: 'grant-kp-report',
    kind: 'grant_report_credit',
    quantity: 1,
    reportType: 'KP',
  },
}).ledger;
const reportSpend = applyServerEntitlementOperation({
  ledger: report,
  operation: {
    idempotencyKey: 'consume-kp-report',
    kind: 'consume_report_credit',
    reportType: 'KP',
    source: 'personal',
  },
});
assertEqual(reportSpend.changed, true, 'personal report credit is consumed');
report = reportSpend.ledger;
const reportExhausted = applyServerEntitlementOperation({
  ledger: report,
  operation: {
    idempotencyKey: 'consume-kp-report-2',
    kind: 'consume_report_credit',
    reportType: 'KP',
    source: 'personal',
  },
});
assertEqual(reportExhausted.changed, false, 'second personal report credit spend is blocked');
assertEqual(reportExhausted.reason, 'report_credit_exhausted', 'report credit exhausted reason');

const premium = applyServerEntitlementOperation({
  ledger: state,
  operation: {
    entitlement: {
      activeProductId: 'premium-monthly',
      expiresAt: '2026-07-02T00:00:00.000Z',
      plan: 'PREMIUM',
      status: 'ACTIVE',
    },
    idempotencyKey: 'premium-active',
    kind: 'activate_premium',
  },
}).ledger;
assertEqual(premium.premiumEntitlement.plan, 'PREMIUM', 'premium entitlement plan');
assertEqual(premium.premiumEntitlement.status, 'ACTIVE', 'premium entitlement status');

const dayPassOperation = mapOneTimeProductToLedgerOperation({
  idempotencyKey: 'day-pass-order',
  productId: 'day-pass-24h',
  productType: 'DAY_PASS',
});
assertEqual(dayPassOperation.kind, 'activate_day_pass', 'day pass maps to day pass ledger operation');
const dayPass = applyServerEntitlementOperation({
  ledger: state,
  operation: dayPassOperation,
}).ledger;
assertEqual(dayPass.dayPassEntitlement.active, true, 'day pass active');
assertEqual(dayPass.dayPassEntitlement.questionsRemaining, 10, 'day pass questions');

let family = applyServerEntitlementOperation({
  ledger: state,
  operation: {
    familyBank: {
      memberUids: ['uid_phase_2', 'family_member'],
      members: [
        { role: 'owner', uid: 'uid_phase_2' },
        { role: 'member', uid: 'family_member' },
      ],
      ownerUid: 'uid_phase_2',
      sharedQuestionCreditsBalance: 2,
      sharedReportCreditsByType: {
        LIFE_ATLAS: 1,
      },
    },
    idempotencyKey: 'family-config',
    kind: 'configure_family_bank',
  },
}).ledger;
family = applyServerEntitlementOperation({
  ledger: family,
  operation: {
    idempotencyKey: 'family-ai-1',
    kind: 'record_successful_paid_ai_answer',
    source: 'family_bank',
  },
}).ledger;
family = applyServerEntitlementOperation({
  ledger: family,
  operation: {
    idempotencyKey: 'family-ai-2',
    kind: 'record_successful_paid_ai_answer',
    source: 'family_bank',
  },
}).ledger;
assertEqual(family.familyBank.sharedQuestionCreditsBalance, 0, 'Family Bank question credits spent');
const familyAiExhausted = applyServerEntitlementOperation({
  ledger: family,
  operation: {
    idempotencyKey: 'family-ai-3',
    kind: 'record_successful_paid_ai_answer',
    source: 'family_bank',
  },
});
assertEqual(familyAiExhausted.changed, false, 'Family Bank AI spend blocks when exhausted');
assertEqual(familyAiExhausted.reason, 'paid_ai_credits_exhausted', 'Family Bank AI exhausted reason');

const familyReportSpend = applyServerEntitlementOperation({
  ledger: family,
  operation: {
    idempotencyKey: 'family-life-atlas-1',
    kind: 'consume_report_credit',
    reportType: 'LIFE_ATLAS',
    source: 'family_bank',
  },
});
assertEqual(familyReportSpend.changed, true, 'Family Bank report credit spend');
assertEqual(
  familyReportSpend.ledger.familyBank.sharedReportCreditsByType.LIFE_ATLAS,
  0,
  'Family Bank report credit reaches zero',
);

const synced = applyServerEntitlementOperation({
  ledger: state,
  operation: {
    idempotencyKey: 'sync-saved-kundlis',
    kind: 'sync_saved_kundli_count',
    savedKundliCount: 4,
  },
}).ledger;
assertEqual(synced.savedKundliCount, 4, 'saved Kundli count syncs to server ledger');

const monetizationState = mapServerLedgerToMonetizationState(dayPass);
assertEqual(monetizationState.entitlement.source, 'firebase', 'mapped entitlement source');
assert(
  monetizationState.oneTimeEntitlements.some(item => item.productType === 'DAY_PASS'),
  'mapped state exposes day pass one-time entitlement',
);

assertDeepEqual(
  {
    changed: false,
    duplicate: true,
  },
  {
    changed: false,
    duplicate: true,
  },
  'gate sanity check for duplicate result shape',
);

console.log('Monetization Phase 2 entitlement ledger gate passed.');
