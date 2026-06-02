import assert from 'node:assert/strict';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const requiredFiles = [
  'apps/web/lib/email/support-email-template-catalog.json',
  'apps/web/lib/email/support-email-template-renderer.ts',
  'apps/web/lib/email/support-email-templates.ts',
  'apps/web/lib/email/support-html-sanitizer.ts',
  'apps/web/lib/email/resend-outbound.ts',
  'apps/web/lib/email/resend-webhook.ts',
  'apps/web/lib/email/admin-support-inbox.ts',
  'apps/web/components/WebAdminSupportInboxPanel.tsx',
  'apps/web/app/api/email/admin/tickets/[ticketId]/reply/route.ts',
  'apps/web/app/api/email/resend/webhook/route.ts',
  'docs/audits/PREDICTA_EMAIL_PHASE_6_SECURITY_PRIVACY_LOCALIZATION_AND_AUDIT/security-privacy-localization-audit.md',
  'docs/audits/PREDICTA_EMAIL_PHASE_6_SECURITY_PRIVACY_LOCALIZATION_AND_AUDIT/phase-6-email-security-privacy-localization-manifest.json',
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
];

for (const file of requiredFiles) {
  assert(existsSync(file), `Missing Phase 6 file: ${file}`);
}

const roadmap = readFileSync(
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
  'utf8',
);
for (const phrase of [
  'PREDICTA_EMAIL_PHASE_6_SECURITY_PRIVACY_LOCALIZATION_AND_AUDIT',
  'Verify server-only Resend usage.',
  'Verify webhook security.',
  'Verify no raw HTML rendering.',
  'Verify no private-note leakage.',
  'Verify localization readiness.',
  'Verify payment/refund/access audit trail behavior.',
  'Verify no unsupported astrology predictions are sent through support email.',
  'Verify duplicate send/idempotency protection.',
]) {
  assert(roadmap.includes(phrase), `Email roadmap missing Phase 6 phrase: ${phrase}`);
}

const manifest = JSON.parse(
  readFileSync(
    'docs/audits/PREDICTA_EMAIL_PHASE_6_SECURITY_PRIVACY_LOCALIZATION_AND_AUDIT/phase-6-email-security-privacy-localization-manifest.json',
    'utf8',
  ),
);
for (const key of [
  'phase',
  'serverOnlyResend',
  'webhookSecurity',
  'privateNoteLeakage',
  'localizationReadiness',
  'adminOnlyAccess',
  'unsupportedPredictionPolicy',
  'duplicateSendProtection',
]) {
  assert.equal(manifest[key], true, `Phase 6 manifest must mark ${key} true`);
}

const component = readFileSync('apps/web/components/WebAdminSupportInboxPanel.tsx', 'utf8');
assert(
  !component.includes('dangerouslySetInnerHTML'),
  'Admin inbox UI must never render raw HTML.',
);
for (const phrase of [
  'Private note · never emailed',
  'createSupportReplyIdempotencyKey',
  'idempotencyKey',
  'Private notes are',
]) {
  assert(component.includes(phrase), `Admin inbox UI missing privacy/idempotency phrase: ${phrase}`);
}

const replyRoute = readFileSync(
  'apps/web/app/api/email/admin/tickets/[ticketId]/reply/route.ts',
  'utf8',
);
for (const phrase of [
  'requireSupportInboxAdmin',
  'sendAdminSupportReply',
  'idempotencyKey',
]) {
  assert(replyRoute.includes(phrase), `Admin reply route missing security phrase: ${phrase}`);
}

const adminInboxSource = readFileSync(
  'apps/web/lib/email/admin-support-inbox.ts',
  'utf8',
);
for (const phrase of [
  'SupportInboxAdminError',
  'Only admin reply templates',
  'Private notes cannot be sent',
  'getAdminReplyIdempotencyStore',
  'createAdminReplyIdempotencyKey',
  'duplicate: true',
]) {
  assert(adminInboxSource.includes(phrase), `Admin inbox source missing: ${phrase}`);
}

const webhookRoute = readFileSync(
  'apps/web/app/api/email/resend/webhook/route.ts',
  'utf8',
);
for (const phrase of [
  "request.text()",
  "request.headers.get('svix-id')",
  "request.headers.get('svix-timestamp')",
  "request.headers.get('svix-signature')",
  'verifyResendWebhookSignature',
]) {
  assert(webhookRoute.includes(phrase), `Webhook route missing security phrase: ${phrase}`);
}
assert(
  !webhookRoute.includes('request.json()'),
  'Webhook route must use raw text body, not request.json().',
);

const webhookSource = readFileSync('apps/web/lib/email/resend-webhook.ts', 'utf8');
for (const phrase of [
  'PREDICTA_RESEND_WEBHOOK_SECRET',
  'supportEmailHtmlToPlainText',
  'RESEND_SUPPORT_WEBHOOK_EVENTS_NOT_ENABLED',
  'markProcessed',
  'Invalid Resend webhook signature',
  'Privacy-noise webhook event intentionally not enabled.',
]) {
  assert(webhookSource.includes(phrase), `Webhook processor missing: ${phrase}`);
}

const sanitizerSource = readFileSync('apps/web/lib/email/support-html-sanitizer.ts', 'utf8');
for (const phrase of ['sanitizeSupportEmailHtml', 'script', 'iframe', 'style', 'on[a-z]+', 'javascript']) {
  assert(sanitizerSource.includes(phrase), `HTML sanitizer missing guard: ${phrase}`);
}

assertNoClientResendSecrets();
assertNoClientRawHtmlRendering();
assertTemplateCatalog();

const compiledDir = mkdtempSync(path.join(tmpdir(), 'predicta-email-phase-6-'));
try {
  for (const sourcePath of [
    'apps/web/lib/owner-surface.ts',
    'apps/web/lib/email/resend-outbound.ts',
    'apps/web/lib/email/support-ticket-thread.ts',
    'apps/web/lib/email/support-html-sanitizer.ts',
    'apps/web/lib/email/resend-webhook.ts',
    'apps/web/lib/email/support-email-template-renderer.ts',
    'apps/web/lib/email/support-email-templates.ts',
    'apps/web/lib/email/admin-support-inbox.ts',
  ]) {
    compileTs(sourcePath, compiledDir);
  }
  copyFileSync(
    'apps/web/lib/email/support-email-template-catalog.json',
    path.join(compiledDir, 'apps/web/lib/email/support-email-template-catalog.json'),
  );

  const renderer = require(
    path.join(compiledDir, 'apps/web/lib/email/support-email-template-renderer.js'),
  );
  const adminInbox = require(
    path.join(compiledDir, 'apps/web/lib/email/admin-support-inbox.js'),
  );
  const threadModel = require(
    path.join(compiledDir, 'apps/web/lib/email/support-ticket-thread.js'),
  );

  const repository = new threadModel.InMemorySupportTicketThreadRepository();
  const thread = await repository.createThread({
    actor: {
      displayName: 'Bhaumik Mehta',
      email: 'bhaumik@example.invalid',
      role: 'customer',
    },
    category: 'billing',
    customerEmail: 'bhaumik@example.invalid',
    customerName: 'Bhaumik Mehta',
    initialMessage: 'Payment completed but Premium report did not unlock.',
    now: '2026-06-02T12:00:00.000Z',
    priority: 'URGENT',
    route: '/checkout',
    sourceSurface: 'web-checkout',
    subject: 'Premium access did not unlock',
    ticketNumber: 'PRD-20260602-0060',
  });
  const variables = renderer.buildTemplateVariablesForThread(thread, {
    resolutionSummary:
      'we verified the payment context and refreshed the Premium access state',
  });
  let fetchCalls = 0;
  const fetchImpl = async () => {
    fetchCalls += 1;

    return Response.json({ id: `resend-phase-6-${fetchCalls}` }, { status: 200 });
  };
  const firstSend = await adminInbox.sendAdminSupportReply(
    thread.ticket.id,
    {
      action: 'waiting',
      body: 'Hi Bhaumik, we verified the payment context and refreshed the Premium access state.',
      env: { PREDICTA_RESEND_API_KEY: 'phase-6-key' },
      fetchImpl,
      idempotencyKey: 'phase-6-stable-reply-key',
      templateId: 'support.admin.reply.payment_link_razorpay_help.v1',
      variables,
    },
    repository,
  );
  assert.equal(firstSend.duplicate, false, 'First admin reply must not be duplicate');
  assert.equal(firstSend.deliveryStatus, 'accepted');
  assert.equal(firstSend.thread.ticket.status, 'WAITING_ON_USER');
  assert.equal(fetchCalls, 1, 'First admin reply should send exactly one email');

  const messageCount = firstSend.thread.messages.length;
  const deliveryCount = firstSend.thread.deliveryEvents.length;
  const auditKinds = firstSend.thread.auditEvents.map(event => event.kind);
  assert(auditKinds.includes('message_added'), 'Admin reply must record message audit');
  assert(auditKinds.includes('delivery_recorded'), 'Admin reply must record delivery audit');
  assert(auditKinds.includes('status_changed'), 'Admin reply must record status audit');

  const duplicateSend = await adminInbox.sendAdminSupportReply(
    thread.ticket.id,
    {
      action: 'waiting',
      body: 'Hi Bhaumik, we verified the payment context and refreshed the Premium access state.',
      env: { PREDICTA_RESEND_API_KEY: 'phase-6-key' },
      fetchImpl,
      idempotencyKey: 'phase-6-stable-reply-key',
      templateId: 'support.admin.reply.payment_link_razorpay_help.v1',
      variables,
    },
    repository,
  );
  assert.equal(duplicateSend.duplicate, true, 'Duplicate admin reply must be flagged');
  assert.equal(fetchCalls, 1, 'Duplicate admin reply must not call Resend again');
  assert.equal(
    duplicateSend.thread.messages.length,
    messageCount,
    'Duplicate admin reply must not append another customer-visible message',
  );
  assert.equal(
    duplicateSend.thread.deliveryEvents.length,
    deliveryCount,
    'Duplicate admin reply must not record another delivery event',
  );

  await assert.rejects(
    () =>
      adminInbox.sendAdminSupportReply(
        thread.ticket.id,
        {
          action: 'waiting',
          body: 'Private note: refund looks suspicious.',
          env: {},
          templateId: 'support.admin.reply.refund_under_review.v1',
          variables,
        },
        repository,
      ),
    /Private notes cannot be sent/,
    'Private note wording must not pass through the customer reply composer',
  );

  await assert.rejects(
    () =>
      adminInbox.sendAdminSupportReply(
        thread.ticket.id,
        {
          action: 'waiting',
          body: 'Customer-facing reply',
          env: {},
          templateId: 'support.system.security_account_alert.v1',
          variables,
        },
        repository,
      ),
    /Only admin reply templates/,
    'System templates must not be sent through the admin customer reply composer',
  );
} finally {
  rmSync(compiledDir, { force: true, recursive: true });
}

console.log(
  'Email Phase 6 passed: server-only Resend use, webhook security, sanitizer, no client raw HTML, no private-note leakage, localization-ready JSON templates, billing/access audit trail, unsupported prediction guardrails, admin-only reply path, and duplicate-send idempotency are locked.',
);

function assertTemplateCatalog() {
  const catalogPath = 'apps/web/lib/email/support-email-template-catalog.json';
  const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const templates = catalog.templates;
  assert(Array.isArray(templates), 'Template catalog must expose templates array');
  assert(
    String(catalog.version).includes('phase5'),
    'Template catalog must remain a versioned JSON source of truth.',
  );

  const ids = new Set();
  const requiredSafeFooters = [
    /Predicta/i,
    /support|account|payment|report|privacy|secure|verification|trust|email|records|credits|refund|password|card|forensic|deterministic/i,
  ];

  for (const template of templates) {
    assert.equal(typeof template.id, 'string', 'Every template needs an id');
    assert(!ids.has(template.id), `Duplicate template id: ${template.id}`);
    ids.add(template.id);
    assert.equal(template.locale, 'en', `Template ${template.id} must declare locale en`);
    assert(
      ['admin', 'customer', 'system'].includes(template.audience),
      `Template ${template.id} has invalid audience`,
    );
    assert(Array.isArray(template.requiredVariables), `Template ${template.id} needs requiredVariables`);
    assert(template.footer?.trim(), `Template ${template.id} needs privacy/trust footer`);
    for (const regex of requiredSafeFooters) {
      assert(regex.test(template.footer), `Template ${template.id} footer is not trust/privacy ready`);
    }

    const templateText = [
      template.subject,
      template.previewText,
      template.heading,
      ...template.bodyParagraphs,
      template.cta?.label,
      template.cta?.url,
      template.footer,
    ].join('\n');
    const placeholders = Array.from(
      templateText.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g),
      match => match[1],
    );
    const required = new Set(template.requiredVariables);

    for (const placeholder of placeholders) {
      assert(
        required.has(placeholder),
        `Template ${template.id} uses {{${placeholder}}} without requiredVariables entry`,
      );
    }
    for (const variable of required) {
      assert(
        placeholders.includes(variable),
        `Template ${template.id} declares unused required variable: ${variable}`,
      );
    }

    assertNoUnsupportedPredictionClaims(template.id, templateText);
  }

  for (const id of [
    'support.admin.reply.payment_link_razorpay_help.v1',
    'support.admin.reply.premium_access_activated.v1',
    'support.admin.reply.refund_under_review.v1',
    'support.system.security_account_alert.v1',
  ]) {
    assert(ids.has(id), `Audit-sensitive template missing: ${id}`);
  }
}

function assertNoUnsupportedPredictionClaims(templateId, templateText) {
  const bannedPhrases = [
    /this will definitely happen/i,
    /guaranteed success/i,
    /is a guaranteed prediction/i,
    /your future is fixed/i,
    /your planet proves/i,
    /your dasha proves/i,
    /your kundli guarantees/i,
    /we predict your/i,
  ];
  for (const regex of bannedPhrases) {
    assert(
      !regex.test(templateText),
      `Template ${templateId} contains unsupported prediction claim: ${regex}`,
    );
  }

  const predictionMentions = templateText.match(/prediction|predictions/gi) ?? [];
  if (predictionMentions.length) {
    assert(
      /not a place for new astrology predictions|not forensic handwriting analysis or guaranteed prediction/i.test(
        templateText,
      ),
      `Template ${templateId} mentions prediction without a support guardrail`,
    );
  }
}

function assertNoClientResendSecrets() {
  const clientFiles = [
    ...listFiles('apps/web/components'),
    ...listFiles('apps/web/app').filter(file => !file.includes('/api/')),
    ...listFiles('apps/mobile/src'),
  ].filter(file => /\.(tsx?|jsx?)$/.test(file));

  for (const file of clientFiles) {
    const source = readFileSync(file, 'utf8');
    assert(
      !source.includes('PREDICTA_RESEND_API_KEY') &&
        !source.includes('PREDICTA_RESEND_WEBHOOK_SECRET') &&
        !source.includes('resend-outbound') &&
        !source.includes('resend-webhook'),
      `Client/mobile surface must not import Resend secrets or server email transports: ${file}`,
    );
  }
}

function assertNoClientRawHtmlRendering() {
  const uiFiles = [
    ...listFiles('apps/web/components'),
    ...listFiles('apps/web/app').filter(file => !file.includes('/api/')),
  ].filter(file => /\.(tsx?|jsx?)$/.test(file));

  for (const file of uiFiles) {
    const source = readFileSync(file, 'utf8');
    assert(
      !source.includes('dangerouslySetInnerHTML'),
      `Client UI must not render support email HTML directly: ${file}`,
    );
  }
}

function listFiles(root) {
  if (!existsSync(root)) {
    return [];
  }

  const entries = readdirSync(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);

    if (
      entry.name === 'node_modules' ||
      entry.name === '.next' ||
      entry.name === 'dist'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

function compileTs(sourcePath, outputRoot) {
  const source = readFileSync(sourcePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      resolveJsonModule: true,
      skipLibCheck: true,
      strict: false,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourcePath,
  }).outputText;
  const outputPath = path.join(outputRoot, sourcePath.replace(/\.ts$/, '.js'));

  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeShimmedModule(outputPath, output);
}

function writeShimmedModule(outputPath, output) {
  const outputDir = path.dirname(outputPath);
  const relativeTypes = path.relative(outputDir, path.join(process.cwd(), 'packages/types/src/index.ts'));
  const shimmed = output.replace(
    /require\(["']@pridicta\/types["']\)/g,
    `require("${relativeTypes.replace(/\\/g, '/')}")`,
  );

  mkdirSync(path.dirname(outputPath), { recursive: true });
  require('node:fs').writeFileSync(outputPath, shimmed);
}
