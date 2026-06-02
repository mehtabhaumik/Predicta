import assert from 'node:assert/strict';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
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
  'apps/web/lib/email/admin-support-inbox.ts',
  'apps/web/components/WebAdminSupportInboxPanel.tsx',
  'apps/web/app/api/email/admin/tickets/[ticketId]/reply/route.ts',
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
];

for (const file of requiredFiles) {
  assert.doesNotThrow(() => readFileSync(file, 'utf8'), `Missing Phase 5 file: ${file}`);
}

const roadmap = readFileSync(
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
  'utf8',
);
for (const phrase of [
  'PREDICTA_EMAIL_PHASE_5_ADMIN_REPLY_COMPOSER_AND_TEMPLATE_SYSTEM',
  'Add dedicated template source files.',
  'Add the complete customer auto-reply template catalog.',
  'Add the complete admin reply template catalog.',
  'Add the complete system-triggered email template catalog.',
  'send and mark waiting',
  'send and resolve',
  'send and escalate',
]) {
  assert(roadmap.includes(phrase), `Email roadmap missing Phase 5 phrase: ${phrase}`);
}

const catalogPath = 'apps/web/lib/email/support-email-template-catalog.json';
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const templates = catalog.templates;
assert(Array.isArray(templates), 'Template catalog must expose templates array');

const requiredCustomerTemplates = [
  'support.customer.auto_reply.received.v1',
  'support.customer.auto_reply.payment_help_received.v1',
  'support.customer.auto_reply.report_download_issue_received.v1',
  'support.customer.auto_reply.kundli_help_received.v1',
  'support.customer.auto_reply.signature_help_received.v1',
  'support.customer.auto_reply.account_login_help_received.v1',
  'support.customer.auto_reply.premium_access_help_received.v1',
  'support.customer.auto_reply.bug_report_received.v1',
  'support.customer.auto_reply.refund_billing_request_received.v1',
  'support.customer.auto_reply.general_contact_received.v1',
];
const requiredAdminTemplates = [
  'support.admin.notification.received.v1',
  'support.admin.reply.need_more_details.v1',
  'support.admin.reply.birth_details_missing.v1',
  'support.admin.reply.report_regeneration_shared.v1',
  'support.admin.reply.payment_link_razorpay_help.v1',
  'support.admin.reply.premium_access_activated.v1',
  'support.admin.reply.issue_acknowledged.v1',
  'support.admin.reply.bug_escalated.v1',
  'support.admin.reply.refund_under_review.v1',
  'support.admin.reply.resolved_closing.v1',
  'support.admin.reply.friendly_follow_up.v1',
];
const requiredSystemTemplates = [
  'support.system.welcome_to_predicta.v1',
  'support.system.google_sign_in_confirmation.v1',
  'support.system.report_ready.v1',
  'support.system.report_download_link.v1',
  'support.system.premium_purchase_confirmation.v1',
  'support.system.question_pack_purchase_confirmation.v1',
  'support.system.report_pack_purchase_confirmation.v1',
  'support.system.ai_credits_exhausted.v1',
  'support.system.kundli_limit_reached.v1',
  'support.system.family_vault_invite.v1',
  'support.system.admin_reply_notification.v1',
  'support.system.security_account_alert.v1',
];

for (const id of [
  ...requiredCustomerTemplates,
  ...requiredAdminTemplates,
  ...requiredSystemTemplates,
]) {
  const template = templates.find(item => item.id === id);
  assert(template, `Missing required template: ${id}`);
  for (const field of [
    'audience',
    'bodyParagraphs',
    'categoryHints',
    'cta',
    'footer',
    'group',
    'heading',
    'locale',
    'previewText',
    'requiredVariables',
    'subject',
  ]) {
    assert(template[field], `Template ${id} missing field: ${field}`);
  }
}

assert.equal(
  templates.filter(item => item.audience === 'customer').length,
  requiredCustomerTemplates.length,
  'Customer auto-reply catalog count mismatch',
);
assert(
  templates.filter(item => item.audience === 'admin').length >= requiredAdminTemplates.length,
  'Admin reply catalog count mismatch',
);
assert.equal(
  templates.filter(item => item.audience === 'system').length,
  requiredSystemTemplates.length,
  'System-triggered template catalog count mismatch',
);

const component = readFileSync('apps/web/components/WebAdminSupportInboxPanel.tsx', 'utf8');
for (const phrase of [
  'REPLY COMPOSER',
  'Search templates',
  'renderSupportEmailTemplateBodyText',
  'suggestSupportReplyTemplate',
  'Send and mark waiting',
  'Send and resolve',
  'Send and escalate',
  '/api/email/admin/tickets/${encodeURIComponent(ticketId)}/reply',
]) {
  assert(component.includes(phrase), `Composer source missing: ${phrase}`);
}
assert(
  !component.includes('support.customer.auto_reply.received.v1'),
  'Composer must not hardcode template ids or customer templates directly',
);

const supportEmailTemplates = readFileSync(
  'apps/web/lib/email/support-email-templates.ts',
  'utf8',
);
assert(
  supportEmailTemplates.includes('renderSupportEmailTemplate'),
  'Legacy email-template adapters must delegate to catalog renderer',
);
for (const hardcodedPhrase of [
  'We have received your message and the Predicta team will review it carefully.',
  'Recommended action: Open the Predicta admin inbox',
]) {
  assert(
    !supportEmailTemplates.includes(hardcodedPhrase),
    `Template copy must not remain hardcoded in adapter: ${hardcodedPhrase}`,
  );
}

const replyRoute = readFileSync(
  'apps/web/app/api/email/admin/tickets/[ticketId]/reply/route.ts',
  'utf8',
);
for (const phrase of [
  'requireSupportInboxAdmin',
  'sendAdminSupportReply',
  'AdminReplySendAction',
  'normalizeAction',
]) {
  assert(replyRoute.includes(phrase), `Reply route missing: ${phrase}`);
}

const compiledDir = mkdtempSync(path.join(tmpdir(), 'predicta-email-phase-5-'));
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
  const legacyTemplates = require(
    path.join(compiledDir, 'apps/web/lib/email/support-email-templates.js'),
  );

  assert.equal(
    renderer.listSupportEmailTemplates('customer').length,
    requiredCustomerTemplates.length,
    'Renderer must list every customer template',
  );
  assert.equal(
    renderer.listSupportEmailTemplates('system').length,
    requiredSystemTemplates.length,
    'Renderer must list every system template',
  );
  assert(
    renderer.searchSupportEmailTemplates({ audience: 'admin', query: 'payment' })
      .templates.length > 0,
    'Template search must find admin payment templates',
  );

  assert.throws(
    () =>
      renderer.renderSupportEmailTemplate({
        templateId: 'support.admin.reply.payment_link_razorpay_help.v1',
        variables: {
          customerName: 'Bhaumik',
          ticketNumber: 'PRD-20260602-0010',
        },
      }),
    /Missing required template variables/,
    'Renderer must reject missing required variables',
  );

  const repository = new threadModel.InMemorySupportTicketThreadRepository();
  const thread = await repository.createThread({
    actor: {
      displayName: 'Priya Shah',
      email: 'priya@example.invalid',
      role: 'customer',
    },
    category: 'billing',
    customerEmail: 'priya@example.invalid',
    customerName: 'Priya Shah',
    initialMessage: 'Payment did not unlock premium report.',
    now: '2026-06-02T11:00:00.000Z',
    priority: 'URGENT',
    route: '/checkout',
    sourceSurface: 'web-checkout',
    subject: 'Payment problem',
    ticketNumber: 'PRD-20260602-0010',
  });
  const suggested = renderer.suggestSupportReplyTemplate(thread);
  assert.equal(
    suggested.id,
    'support.admin.reply.payment_link_razorpay_help.v1',
    'Billing tickets should suggest payment/Razorpay template',
  );

  const variables = renderer.buildTemplateVariablesForThread(thread, {
    resolutionSummary: 'we verified the purchase context and refreshed access',
  });
  const rendered = renderer.renderSupportEmailTemplate({
    templateId: suggested.id,
    variables,
  });
  assert(rendered.text.includes('Priya Shah'));
  assert(rendered.html.includes('Predicta'));

  const legacyCustomer = legacyTemplates.renderCustomerAutoReplyTemplate({
    category: 'billing',
    createdAt: '2026-06-02T11:00:00.000Z',
    customerEmail: 'priya@example.invalid',
    customerName: 'Priya Shah',
    language: 'en',
    message: 'Payment problem',
    priority: 'URGENT',
    status: 'NEW',
    subject: 'Payment problem',
    ticketNumber: 'PRD-20260602-0010',
  });
  assert.equal(
    legacyCustomer.templateId,
    'support.customer.auto_reply.received.v1',
    'Legacy customer auto-reply adapter must preserve template id',
  );

  const waiting = await adminInbox.sendAdminSupportReply(
    thread.ticket.id,
    {
      action: 'waiting',
      body: rendered.text,
      env: {},
      templateId: suggested.id,
      variables,
    },
    repository,
  );
  assert.equal(waiting.thread.ticket.status, 'WAITING_ON_USER');
  assert.equal(waiting.deliveryStatus, 'failed');
  assert.equal(waiting.thread.messages.at(-1).kind, 'admin_outbound');
  assert.equal(waiting.thread.deliveryEvents.at(-1).status, 'failed');

  await assert.rejects(
    () =>
      adminInbox.sendAdminSupportReply(
        thread.ticket.id,
        {
          action: 'waiting',
          body: 'Private note: do not send this.',
          env: {},
          templateId: suggested.id,
          variables,
        },
        repository,
      ),
    /Private notes cannot be sent/,
    'Private notes cannot be sent through customer reply composer',
  );

  await assert.rejects(
    () =>
      adminInbox.sendAdminSupportReply(
        thread.ticket.id,
        {
          action: 'waiting',
          body: 'Customer-facing body',
          env: {},
          templateId: 'support.customer.auto_reply.received.v1',
          variables,
        },
        repository,
      ),
    /Only admin reply templates/,
    'Customer auto-reply templates cannot be sent from admin reply composer',
  );

  const resolve = await adminInbox.sendAdminSupportReply(
    thread.ticket.id,
    {
      action: 'resolve',
      body: 'Hi Priya, we verified your payment and refreshed access.',
      env: { PREDICTA_RESEND_API_KEY: 'phase-5-key' },
      fetchImpl: async () =>
        Response.json({ id: 'resend-phase-5-ok' }, { status: 200 }),
      templateId: 'support.admin.reply.resolved_closing.v1',
      variables: {
        ...variables,
        resolutionSummary: 'we verified your payment and refreshed access',
      },
    },
    repository,
  );
  assert.equal(resolve.thread.ticket.status, 'RESOLVED');
  assert.equal(resolve.deliveryStatus, 'accepted');
  assert.equal(resolve.thread.deliveryEvents.at(-1).status, 'accepted');

  const escalate = await adminInbox.sendAdminSupportReply(
    thread.ticket.id,
    {
      action: 'escalate',
      body: 'Hi Priya, we escalated this to the billing owner.',
      env: {},
      templateId: 'support.admin.reply.bug_escalated.v1',
      variables: {
        ...variables,
        resolutionSummary: 'we escalated this to the billing owner',
      },
    },
    repository,
  );
  assert.equal(escalate.thread.ticket.status, 'ESCALATED');
} finally {
  rmSync(compiledDir, { force: true, recursive: true });
}

console.log(
  'Email Phase 5 passed: complete template catalog, catalog-backed renderer, missing-variable validation, template search/suggestion, admin composer source, send actions, status transitions, delivery recording, and private-note send blocking are locked.',
);

function compileTs(sourcePath, outputRoot) {
  const source = readFileSync(sourcePath, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourcePath,
    reportDiagnostics: true,
  });
  const errors = output.diagnostics?.filter(
    diagnostic => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  assert.equal(errors?.length ?? 0, 0, `${sourcePath} transpile errors`);
  const outputPath = path.join(outputRoot, sourcePath.replace(/\.ts$/, '.js'));
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, output.outputText);
}
