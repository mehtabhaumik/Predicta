import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const Module = require('module');
const root = process.cwd();
const aliasMap = new Map([
  ['@pridicta/config', path.join(root, 'packages/config/src/index.ts')],
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
  'PREDICTA_EVENT_ORACLE_PHASE_9_OPTIONAL_HUMAN_ASTROLOGER_REVIEW_SYSTEM';
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
  'packages/astrology/src/eventOracleHumanReview.ts',
  'packages/astrology/src/index.ts',
  'packages/config/src/humanAstrologerReview.ts',
  'packages/config/src/translations/humanAstrologerReview.json',
  'packages/config/src/pricing.ts',
  'packages/config/src/translations/monetization.json',
  'packages/monetization/src/serverEntitlementLedger.ts',
  'packages/monetization/src/entitlementParity.ts',
  'apps/web/components/WebAdminHumanReviewPanel.tsx',
  'apps/web/app/dashboard/admin/page.tsx',
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/globals.css',
  `${path.relative(root, auditDir)}/phase-9-manifest.json`,
  `${path.relative(root, auditDir)}/phase-9-human-review-audit.md`,
  `${path.relative(root, auditDir)}/verification.txt`,
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'Astrologer profile model',
  'Review packet',
  'Approve/refine/send flow',
  'Refund/retry policy state',
  'Allow astrologers to overwrite evidence with fear-selling',
  'Hide whether a human reviewed the answer',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 9 roadmap'));

const engineSource = read('packages/astrology/src/eventOracleHumanReview.ts');
[
  'export type HumanAstrologerProfile',
  'export type HumanReviewPacket',
  'export type HumanReviewResponse',
  'export type HumanReviewRefundRetryPolicy',
  'createHumanReviewPacket',
  'assignHumanReviewPacket',
  'submitHumanReviewResponse',
  'markHumanReviewSent',
  'evaluateHumanReviewRefundRetry',
  'buildHumanReviewTranscript',
  'validateHumanReviewResponse',
  'FORBIDDEN_HUMAN_REVIEW_PATTERNS',
  'expensive puja',
  'must buy',
].forEach(fragment => assertIncludes(engineSource, fragment, 'human review engine'));

const {
  assignHumanReviewPacket,
  buildEventOracleEvidenceContract,
  buildEventOraclePredictionObject,
  buildHumanReviewTranscript,
  createHumanReviewPacket,
  createReadySupportLayer,
  evaluateHumanReviewRefundRetry,
  markHumanReviewSent,
  refineEventQuestion,
  submitHumanReviewResponse,
} = require('../packages/astrology/src/index.ts');
const {
  applyServerEntitlementOperation,
  createDefaultServerEntitlementLedger,
  mapOneTimeProductToLedgerOperation,
} = require('../packages/monetization/src/serverEntitlementLedger.ts');
const {
  evaluateHumanReviewEntitlement,
} = require('../packages/monetization/src/entitlementParity.ts');
const { getOneTimeProduct } = require('../packages/config/src/pricing.ts');

const refinement = refineEventQuestion(
  'Will I get a UK work opportunity this year?',
  'foreign_travel',
);
const evidenceContract = buildEventOracleEvidenceContract({
  refinement,
  layers: {
    jaimini: createReadySupportLayer('supports', 'Jaimini supports foreign work direction.'),
    kp: createReadySupportLayer('supports', 'KP supports event timing.'),
    vedic: createReadySupportLayer('supports', 'Vedic dasha supports movement.'),
  },
});
const predictaDraft = buildEventOraclePredictionObject({
  evidenceContract,
  refinement,
  trigger: {
    evidenceLayerIds: ['kp', 'vedic'],
    label: 'Workplace trigger',
    summary: 'The trigger may come through a workplace opening.',
  },
});
const packet = createHumanReviewPacket({
  deterministicEvidence: evidenceContract,
  id: 'phase9-test-packet',
  nowIso: '2026-06-10T00:00:00.000Z',
  predictaDraft,
  refinedEventQuestion: refinement,
  userQuestion: 'Will I go to the UK?',
});
assert.equal(packet.status, 'requested');
assert.equal(packet.auditTrail[0].kind, 'packet_created');

const verifiedAstrologer = {
  categoriesHandled: ['foreign_travel', 'career_move'],
  displayName: 'Verified Reviewer',
  id: 'verified-reviewer',
  languages: ['en', 'hi', 'gu'],
  methods: ['VEDIC', 'KP', 'JAIMINI'],
  ratingsByCategory: { foreign_travel: 4.8 },
  responseSlaHours: 24,
  verificationStatus: 'verified',
};
const unverifiedAstrologer = {
  ...verifiedAstrologer,
  id: 'probation-reviewer',
  verificationStatus: 'probation',
};
const mismatchAstrologer = {
  ...verifiedAstrologer,
  categoriesHandled: ['marriage_timing'],
  id: 'marriage-reviewer',
};

assert.equal(
  assignHumanReviewPacket({
    astrologer: unverifiedAstrologer,
    nowIso: '2026-06-10T00:05:00.000Z',
    packet,
  }).status,
  'rejected_safety',
);
assert.equal(
  assignHumanReviewPacket({
    astrologer: mismatchAstrologer,
    nowIso: '2026-06-10T00:05:00.000Z',
    packet,
  }).status,
  'rejected_safety',
);

const assignedPacket = assignHumanReviewPacket({
  astrologer: verifiedAstrologer,
  nowIso: '2026-06-10T00:05:00.000Z',
  packet,
});
assert.equal(assignedPacket.status, 'assigned');
assert.equal(assignedPacket.assignedAstrologerId, verifiedAstrologer.id);

const unsafeReview = submitHumanReviewResponse({
  nowIso: '2026-06-10T00:20:00.000Z',
  packet: assignedPacket,
  response: {
    actionPlan: ['You must buy an expensive puja immediately.'],
    astrologerId: verifiedAstrologer.id,
    changedFields: ['trigger'],
    evidenceAcknowledgement: 'Evidence acknowledged.',
    finalAnswer: 'This is 100% guaranteed.',
    reviewerNote: 'No evidence needed.',
    safetyBoundary: 'Boundary.',
    submittedAt: '2026-06-10T00:20:00.000Z',
    timingAndTrigger: 'Definitely this month.',
  },
});
assert.equal(unsafeReview.validation.safe, false);
assert.equal(unsafeReview.packet.status, 'rejected_safety');

const safeReview = submitHumanReviewResponse({
  nowIso: '2026-06-10T01:00:00.000Z',
  packet: assignedPacket,
  response: {
    actionPlan: [
      'Prepare your documents and internal proof.',
      'Treat the first signal as work travel or transfer before permanent settlement.',
    ],
    astrologerId: verifiedAstrologer.id,
    changedFields: ['trigger', 'actionPlan'],
    evidenceAcknowledgement: 'The response keeps the deterministic evidence intact.',
    finalAnswer:
      'Likely: a foreign work opening is supported through your current work network.',
    reviewerNote:
      'Evidence from Vedic, KP, and Jaimini supports a refined workplace trigger.',
    safetyBoundary:
      'This is guidance, not a guarantee. Wait for paperwork before making major decisions.',
    submittedAt: '2026-06-10T01:00:00.000Z',
    timingAndTrigger:
      'The trigger may be team restructuring, manager recommendation, vacancy, or colleague exit.',
  },
});
assert.equal(safeReview.validation.safe, true);
assert.equal(safeReview.packet.status, 'refined');
assert.deepEqual(safeReview.diff.changedFields, ['trigger', 'actionPlan']);

const sentPacket = markHumanReviewSent({
  nowIso: '2026-06-10T01:10:00.000Z',
  packet: safeReview.packet,
});
assert.equal(sentPacket.status, 'sent');
assert(
  buildHumanReviewTranscript({
    packet: sentPacket,
    response: {
      actionPlan: [],
      astrologerId: verifiedAstrologer.id,
      changedFields: ['wordingOnly'],
      evidenceAcknowledgement: 'Evidence acknowledged.',
      finalAnswer: 'Likely: reviewed answer.',
      reviewerNote: 'Evidence only.',
      safetyBoundary: 'No guarantee.',
      submittedAt: '2026-06-10T01:00:00.000Z',
      timingAndTrigger: 'Watch the work trigger.',
    },
  }).includes('Human reviewed answer:'),
);

const expiredPacket = evaluateHumanReviewRefundRetry({
  nowIso: '2026-06-11T02:00:00.000Z',
  packet: assignedPacket,
});
assert.equal(expiredPacket.status, 'refund_eligible');
assert.equal(expiredPacket.refundRetryPolicy.refundEligible, true);
assert.equal(expiredPacket.refundRetryPolicy.retryEligible, true);

let ledger = createDefaultServerEntitlementLedger('phase9-user', '2026-06-10T00:00:00.000Z');
assert.equal(evaluateHumanReviewEntitlement(ledger).allowed, false);
const humanReviewProduct = getOneTimeProduct('HUMAN_ASTROLOGER_REVIEW');
const grantReview = mapOneTimeProductToLedgerOperation({
  idempotencyKey: 'phase9-grant-human-review',
  productId: humanReviewProduct.productId,
  productType: 'HUMAN_ASTROLOGER_REVIEW',
});
assert.equal(grantReview.kind, 'grant_human_review_credit');
ledger = applyServerEntitlementOperation({ ledger, operation: grantReview }).ledger;
assert.equal(ledger.humanReviewCreditsBalance, 1);
const humanReviewDecision = evaluateHumanReviewEntitlement(ledger);
assert.equal(humanReviewDecision.allowed, true);
assert.equal(humanReviewDecision.creditSource, 'personal');
ledger = applyServerEntitlementOperation({
  ledger,
  operation: {
    idempotencyKey: 'phase9-consume-human-review',
    kind: 'consume_human_review_credit',
    source: 'personal',
  },
}).ledger;
assert.equal(ledger.humanReviewCreditsBalance, 0);

const familyLedger = {
  ...createDefaultServerEntitlementLedger('phase9-family', '2026-06-10T00:00:00.000Z'),
  familyBank: {
    ...createDefaultServerEntitlementLedger('phase9-family', '2026-06-10T00:00:00.000Z').familyBank,
    sharedHumanReviewCreditsBalance: 1,
  },
};
const familyDecision = evaluateHumanReviewEntitlement(familyLedger);
assert.equal(familyDecision.allowed, true);
assert.equal(familyDecision.creditSource, 'family_bank');

const pricingSource = read('packages/config/src/pricing.ts');
[
  'humanAstrologerReview: 699',
  "HUMAN_ASTROLOGER_REVIEW: 'pridicta_human_astrologer_review'",
  "id: 'HUMAN_ASTROLOGER_REVIEW'",
].forEach(fragment => assertIncludes(pricingSource, fragment, 'human review pricing'));

const ledgerSource = read('packages/monetization/src/serverEntitlementLedger.ts');
[
  'humanReviewCreditsBalance',
  'sharedHumanReviewCreditsBalance',
  'grant_human_review_credit',
  'consume_human_review_credit',
  'human_review_credit_exhausted',
].forEach(fragment => assertIncludes(ledgerSource, fragment, 'human review ledger'));

const adminPanelSource = read('apps/web/components/WebAdminHumanReviewPanel.tsx');
[
  'WebAdminHumanReviewPanel',
  'getHumanAstrologerReviewAdminCopy',
  "getOneTimeProduct('HUMAN_ASTROLOGER_REVIEW')",
  'buildSampleHumanReviewFlow',
  'buildHumanReviewTranscript',
  'sample.diff.predictaDraftSummary',
  'sample.sentPacket.auditTrail.map',
].forEach(fragment => assertIncludes(adminPanelSource, fragment, 'admin human review panel'));

const adminPageSource = read('apps/web/app/dashboard/admin/page.tsx');
assertIncludes(adminPageSource, '<WebAdminHumanReviewPanel />', 'admin page');

const checkoutSource = read('apps/web/app/checkout/page.tsx');
assertIncludes(checkoutSource, 'checkoutHumanAstrologerReview', 'checkout');
assertIncludes(checkoutSource, "case 'pridicta_human_astrologer_review'", 'checkout');

const cssSource = read('apps/web/app/globals.css');
[
  '.admin-human-review-panel',
  '.admin-human-review-grid',
  '.admin-human-review-transcript',
  'overflow-wrap: anywhere',
].forEach(fragment => assertIncludes(cssSource, fragment, 'admin human review CSS'));

const copySource = read('packages/config/src/translations/humanAstrologerReview.json');
[
  'Human astrologer review desk',
  'Predicta prepares the evidence first',
  'No fear-selling',
  'User summary and transcript',
].forEach(fragment => assertIncludes(copySource, fragment, 'human review copy'));

const monetizationCopy = read('packages/config/src/translations/monetization.json');
assertIncludes(monetizationCopy, '"HUMAN_ASTROLOGER_REVIEW"', 'monetization copy');
assertIncludes(monetizationCopy, '"checkoutHumanAstrologerReview"', 'monetization copy');

const manifest = readJson(`${path.relative(root, auditDir)}/phase-9-manifest.json`);
assert.equal(manifest.phase, phaseName);
assert.equal(manifest.status, 'GREEN');
assert.equal(manifest.productId, 'pridicta_human_astrologer_review');
assert.equal(manifest.strictReviewOrder, 'Predicta draft first, human review second');

if (failures.length) {
  console.error(`\n${phaseName} failed:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`${phaseName}: GREEN`);
