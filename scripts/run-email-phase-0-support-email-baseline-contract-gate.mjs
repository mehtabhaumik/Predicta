import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const readJson = path => JSON.parse(read(path));

const roadmapPath = 'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md';
const supportRoadmapPath = 'docs/PREDICTA_SUPPORT_CONFIRMATION_SYSTEM_PHASES.md';
const auditPath =
  'docs/audits/PREDICTA_EMAIL_PHASE_0_SUPPORT_EMAIL_BASELINE_AND_CONTRACT/support-email-baseline-contract.md';
const manifestPath =
  'docs/audits/PREDICTA_EMAIL_PHASE_0_SUPPORT_EMAIL_BASELINE_AND_CONTRACT/phase-0-support-email-manifest.json';
const appHostingPath = 'apps/web/apphosting.yaml';

for (const path of [roadmapPath, supportRoadmapPath, auditPath, manifestPath, appHostingPath]) {
  assert(existsSync(path), `Required Phase 0 file is missing: ${path}`);
}

const roadmap = read(roadmapPath);
const supportRoadmap = read(supportRoadmapPath);
const audit = read(auditPath);
const appHosting = read(appHostingPath);
const manifest = readJson(manifestPath);

const requiredRoadmapPhrases = [
  'PREDICTA_EMAIL_PHASE_0_SUPPORT_EMAIL_BASELINE_AND_CONTRACT',
  'PREDICTA_EMAIL_PHASE_1_RESEND_OUTBOUND_CUSTOMER_ADMIN_NOTIFICATIONS',
  'PREDICTA_EMAIL_PHASE_2_SUPPORT_TICKET_THREAD_DATA_MODEL',
  'PREDICTA_EMAIL_PHASE_3_RESEND_INBOUND_WEBHOOK_AND_THREADING',
  'PREDICTA_EMAIL_PHASE_4_ADMIN_INBOX_UI',
  'PREDICTA_EMAIL_PHASE_5_ADMIN_REPLY_COMPOSER_AND_TEMPLATE_SYSTEM',
  'PREDICTA_EMAIL_PHASE_6_SECURITY_PRIVACY_LOCALIZATION_AND_AUDIT',
  'PREDICTA_EMAIL_PHASE_7_END_TO_END_EMAIL_SMOKE_AND_RELEASE_GATE',
  'https://predicta.rudraix.com/api/email/resend/webhook',
  'PREDICTA_RESEND_API_KEY@1',
  'PREDICTA_RESEND_WEBHOOK_SECRET@1',
  'Do not create a parallel support-ticket model.',
  'Do not create another email roadmap unless this file is explicitly retired.',
  'No phase may be called green from code review alone.',
];

for (const phrase of requiredRoadmapPhrases) {
  assert(roadmap.includes(phrase), `Email roadmap is missing required phrase: ${phrase}`);
}

const requiredSupportFoundationPhrases = [
  'Do not overload the existing `/api/safety/report` seam for normal support',
  'All normal user contact must persist in one canonical backend-owned record.',
  'Customer emails and internal ops emails must be different templates.',
  'Do not start mail orchestration before the intake record and template system',
];

for (const phrase of requiredSupportFoundationPhrases) {
  assert(
    supportRoadmap.includes(phrase),
    `Support foundation roadmap is missing expected support-intake rule: ${phrase}`,
  );
}

const requiredAuditPhrases = [
  'Green for Phase 0 only.',
  'no canonical support ticket is created',
  'no customer auto-reply is sent',
  'no admin notification email is sent',
  'normal support still rides the safety proxy path',
  'Do not create a parallel support model.',
  'Do not add a second email roadmap.',
  'Template Source-Of-Truth Contract',
  'First Audit Artifacts Required By Later Phases',
];

for (const phrase of requiredAuditPhrases) {
  assert(audit.includes(phrase), `Phase 0 audit is missing required evidence: ${phrase}`);
}

for (const secretPhrase of [
  'variable: PREDICTA_RESEND_API_KEY',
  'secret: PREDICTA_RESEND_API_KEY@1',
  'variable: PREDICTA_RESEND_WEBHOOK_SECRET',
  'secret: PREDICTA_RESEND_WEBHOOK_SECRET@1',
]) {
  assert(appHosting.includes(secretPhrase), `App Hosting secret contract missing: ${secretPhrase}`);
}

assert.equal(
  manifest.phase,
  'PREDICTA_EMAIL_PHASE_0_SUPPORT_EMAIL_BASELINE_AND_CONTRACT',
  'Manifest phase keyword mismatch',
);
assert.equal(
  manifest.status,
  'green-for-phase-0-baseline-only',
  'Manifest must mark Phase 0 green for baseline only',
);
assert.equal(
  manifest.brandedWebhookUrl,
  'https://predicta.rudraix.com/api/email/resend/webhook',
  'Manifest webhook URL must use branded public domain',
);

assert.equal(
  manifest.runtimeSecrets.apiKey.secretManagerReference,
  'PREDICTA_RESEND_API_KEY@1',
  'Manifest API key secret version mismatch',
);
assert.equal(
  manifest.runtimeSecrets.webhookSecret.secretManagerReference,
  'PREDICTA_RESEND_WEBHOOK_SECRET@1',
  'Manifest webhook secret version mismatch',
);

assert.equal(
  manifest.currentBaseline.resendClientExists,
  false,
  'Phase 0 must not claim a Resend client exists',
);
assert.equal(
  manifest.currentBaseline.resendWebhookRouteExists,
  false,
  'Phase 0 must not claim the Resend webhook route exists',
);
assert.equal(
  manifest.currentBaseline.adminSupportInboxExists,
  false,
  'Phase 0 must not claim admin support inbox exists',
);

for (const event of [
  'email.received',
  'email.sent',
  'email.delivered',
  'email.delivery_delayed',
  'email.bounced',
  'email.failed',
  'email.complained',
  'email.suppressed',
]) {
  assert(
    manifest.requiredWebhookEvents.includes(event),
    `Manifest missing required webhook event: ${event}`,
  );
}

for (const event of ['email.opened', 'email.clicked']) {
  assert(
    manifest.excludedInitialWebhookEvents.includes(event),
    `Manifest must explicitly exclude initial event: ${event}`,
  );
}

for (const template of [
  'Support Request Received',
  'Payment / Checkout Help Received',
  'Premium Access Activated',
  'Admin Reply Notification',
  'Security / Account Alert',
]) {
  const existsInTaxonomy =
    manifest.requiredCustomerAutoReplyTemplates.includes(template) ||
    manifest.requiredAdminReplyTemplates.includes(template) ||
    manifest.requiredSystemTriggeredTemplates.includes(template);
  assert(existsInTaxonomy, `Manifest template taxonomy missing: ${template}`);
}

console.log(
  'Email Phase 0 passed: support/email baseline, no-collision contract, template taxonomy, branded webhook URL, and pinned Resend runtime secret contract are locked.',
);
