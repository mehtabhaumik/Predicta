import assert from 'node:assert/strict';
import {
  copyFileSync,
  existsSync,
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

const auditDir =
  'docs/audits/PREDICTA_EMAIL_PHASE_7_END_TO_END_EMAIL_SMOKE_AND_RELEASE_GATE';
const artifactPath = `${auditDir}/phase-7-email-e2e-smoke-artifact.json`;

const requiredFiles = [
  'apps/web/app/api/email/support/route.ts',
  'apps/web/app/api/email/admin/tickets/route.ts',
  'apps/web/app/api/email/admin/tickets/[ticketId]/route.ts',
  'apps/web/app/api/email/admin/tickets/[ticketId]/reply/route.ts',
  'apps/web/app/api/email/resend/webhook/route.ts',
  'apps/web/lib/email/support-ticket-submission.ts',
  'apps/web/lib/email/support-outbound-notifications.ts',
  'apps/web/lib/email/support-ticket-thread.ts',
  'apps/web/lib/email/resend-webhook.ts',
  'apps/web/lib/email/admin-support-inbox.ts',
  `${auditDir}/phase-7-email-e2e-release-manifest.json`,
  `${auditDir}/end-to-end-email-smoke-audit.md`,
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
];

for (const file of requiredFiles) {
  assert(existsSync(file), `Missing Phase 7 file: ${file}`);
}

const roadmap = readFileSync(
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
  'utf8',
);
for (const phrase of [
  'PREDICTA_EMAIL_PHASE_7_END_TO_END_EMAIL_SMOKE_AND_RELEASE_GATE',
  'Submit customer support request.',
  'Send customer auto-reply.',
  'Send admin notification.',
  'Receive inbound customer reply.',
  'Admin edits and sends reply.',
  'Delivery events and audit events appear.',
  'Smoke missing-provider and provider-failure paths.',
]) {
  assert(roadmap.includes(phrase), `Email roadmap missing Phase 7 phrase: ${phrase}`);
}

const manifest = JSON.parse(
  readFileSync(`${auditDir}/phase-7-email-e2e-release-manifest.json`, 'utf8'),
);
for (const key of [
  'phase',
  'customerSupportSubmissionRoute',
  'mockedEndToEndSmoke',
  'customerEmailArtifact',
  'adminNotificationArtifact',
  'inboundReplyThreadingArtifact',
  'adminReplyArtifact',
  'auditTrailArtifact',
  'missingProviderSmoke',
  'providerFailureSmoke',
]) {
  assert.equal(manifest[key], true, `Phase 7 manifest must mark ${key} true`);
}

const supportRoute = readFileSync('apps/web/app/api/email/support/route.ts', 'utf8');
for (const phrase of [
  'submitSupportTicket',
  'readJsonBody',
  'customerEmail',
  'sourceSurface',
]) {
  assert(supportRoute.includes(phrase), `Support submission route missing: ${phrase}`);
}
assert(
  !supportRoute.includes('requireSupportInboxAdmin'),
  'Customer support submission route must not require admin inbox token.',
);

const submissionSource = readFileSync(
  'apps/web/lib/email/support-ticket-submission.ts',
  'utf8',
);
for (const phrase of [
  'sendSupportOutboundNotifications',
  'renderCustomerAutoReplyTemplate',
  'system_auto_reply',
  'recordDeliveryEvent',
  'createSupportTicketNumber',
]) {
  assert(submissionSource.includes(phrase), `Support submission source missing: ${phrase}`);
}

const compiledDir = mkdtempSync(path.join(tmpdir(), 'predicta-email-phase-7-'));
try {
  for (const sourcePath of [
    'apps/web/lib/astro-api.ts',
    'apps/web/lib/owner-surface.ts',
    'apps/web/lib/email/resend-outbound.ts',
    'apps/web/lib/email/support-ticket-thread.ts',
    'apps/web/lib/email/support-html-sanitizer.ts',
    'apps/web/lib/email/resend-webhook.ts',
    'apps/web/lib/email/support-email-template-renderer.ts',
    'apps/web/lib/email/support-email-templates.ts',
    'apps/web/lib/email/support-outbound-notifications.ts',
    'apps/web/lib/email/admin-support-inbox.ts',
    'apps/web/lib/email/support-ticket-submission.ts',
    'apps/web/app/api/email/support/route.ts',
  ]) {
    compileTs(sourcePath, compiledDir);
  }
  copyFileSync(
    'apps/web/lib/email/support-email-template-catalog.json',
    path.join(compiledDir, 'apps/web/lib/email/support-email-template-catalog.json'),
  );

  const threadModel = require(
    path.join(compiledDir, 'apps/web/lib/email/support-ticket-thread.js'),
  );
  const webhook = require(
    path.join(compiledDir, 'apps/web/lib/email/resend-webhook.js'),
  );
  const adminInbox = require(
    path.join(compiledDir, 'apps/web/lib/email/admin-support-inbox.js'),
  );
  const renderer = require(
    path.join(compiledDir, 'apps/web/lib/email/support-email-template-renderer.js'),
  );
  const submission = require(
    path.join(compiledDir, 'apps/web/lib/email/support-ticket-submission.js'),
  );
  const supportRouteModule = require(
    path.join(compiledDir, 'apps/web/app/api/email/support/route.js'),
  );

  const repository = new threadModel.InMemorySupportTicketThreadRepository();
  const store = new webhook.InMemoryResendWebhookProcessingStore();
  const sentPayloads = [];
  const fetchImpl = async (_url, init) => {
    sentPayloads.push(JSON.parse(init.body));

    return Response.json({ id: `resend-phase-7-${sentPayloads.length}` }, { status: 200 });
  };
  const request = new Request('https://predicta.rudraix.com/api/email/support', {
    body: JSON.stringify({
      category: 'billing',
      customerEmail: 'bhaumik@example.invalid',
      customerName: 'Bhaumik Mehta',
      language: 'en',
      message: 'I paid for Premium but my Life Atlas report is still locked.',
      priority: 'urgent',
      related: {
        purchaseId: 'pay_phase_7',
        reportType: 'life_atlas',
      },
      route: '/checkout',
      sourceSurface: 'web-checkout',
      subject: 'Premium report did not unlock',
      userId: 'phase-7-user',
    }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  const routeResponse = await supportRouteModule.POST(request);
  assert.equal(routeResponse.status, 201, 'Customer support route must create ticket');
  const routeJson = await routeResponse.json();
  assert(routeJson.ticket.ticketNumber.startsWith('PRD-20260602-'));

  const submitResult = await submission.submitSupportTicket(
    {
      category: 'billing',
      customerEmail: 'bhaumik@example.invalid',
      customerName: 'Bhaumik Mehta',
      language: 'en',
      message: 'I paid for Premium but my Life Atlas report is still locked.',
      priority: 'urgent',
      related: {
        purchaseId: 'pay_phase_7',
        reportType: 'life_atlas',
      },
      route: '/checkout',
      sourceSurface: 'web-checkout',
      subject: 'Premium report did not unlock',
      userId: 'phase-7-user',
    },
    {
      env: {
        PREDICTA_RESEND_API_KEY: 'phase-7-key',
        PREDICTA_SUPPORT_ADMIN_EMAIL: 'admin@example.invalid',
        PREDICTA_SUPPORT_FROM_EMAIL: 'Predicta Care <care@example.invalid>',
        PREDICTA_SUPPORT_REPLY_TO_EMAIL: 'care@example.invalid',
      },
      fetchImpl,
      now: new Date('2026-06-02T13:00:00.000Z'),
      repository,
    },
  );
  const ticketNumber = submitResult.thread.ticket.ticketNumber;
  assert.equal(sentPayloads.length, 2, 'Submission must send customer and admin emails');
  assert.equal(submitResult.notifications.sentCustomerAutoReply, true);
  assert.equal(submitResult.notifications.sentAdminNotification, true);
  assert.equal(submitResult.thread.messages.length, 2);
  assert.equal(submitResult.thread.messages[1].kind, 'system_auto_reply');
  assert.equal(submitResult.thread.deliveryEvents.length, 2);
  assert(
    submitResult.thread.auditEvents.some(event => event.kind === 'delivery_recorded'),
    'Submission must record delivery audit events',
  );

  const customerEmailPayload = sentPayloads.find(payload =>
    payload.to.includes('bhaumik@example.invalid'),
  );
  const adminEmailPayload = sentPayloads.find(payload =>
    payload.to.includes('admin@example.invalid'),
  );
  assert(customerEmailPayload, 'Customer auto-reply artifact must be captured');
  assert(adminEmailPayload, 'Admin notification artifact must be captured');
  assert.equal(customerEmailPayload.headers['X-Predicta-Ticket'], ticketNumber);
  assert.equal(adminEmailPayload.headers['X-Predicta-Ticket'], ticketNumber);
  assert(
    customerEmailPayload.text.includes(ticketNumber),
    'Customer email must include ticket number',
  );
  assert(
    adminEmailPayload.text.includes('Premium report did not unlock'),
    'Admin email must include support subject',
  );

  const inboundRawBody = JSON.stringify({
    created_at: '2026-06-02T13:05:00.000Z',
    data: {
      email_id: 'recv-phase-7-1',
      from: 'bhaumik@example.invalid',
      message_id: '<phase-7-customer-reply@example.invalid>',
      subject: `Re: Premium report did not unlock ${ticketNumber}`,
      to: [`support+${ticketNumber}@predicta.rudraix.com`],
    },
    type: 'email.received',
  });
  const inbound = await webhook.processVerifiedResendWebhook(
    {
      headers: {
        signature: 'phase-7-not-used-after-verification',
        timestamp: '1780395900',
        webhookId: 'phase-7-inbound-reply',
      },
      rawBody: inboundRawBody,
    },
    {
      receivedEmailFetcher: async () => ({
        from: 'Bhaumik Mehta <bhaumik@example.invalid>',
        headers: {
          from: 'Bhaumik Mehta <bhaumik@example.invalid>',
          'x-predicta-ticket': ticketNumber,
        },
        html:
          '<p>I can still see locked report access.</p><script>alert("bad")</script>',
        message_id: '<phase-7-customer-reply@example.invalid>',
        subject: `Re: Premium report did not unlock ${ticketNumber}`,
        text: null,
        to: [`support+${ticketNumber}@predicta.rudraix.com`],
      }),
      repository,
      store,
    },
  );
  assert.equal(inbound.status, 'threaded');
  const threaded = await repository.getThread(submitResult.thread.ticket.id);
  assert.equal(threaded.messages.at(-1).kind, 'customer_inbound');
  assert(threaded.messages.at(-1).body.includes('locked report access'));
  assert(!threaded.messages.at(-1).body.includes('script'));

  const inbox = await adminInbox.listAdminSupportInboxThreads(repository);
  assert(
    inbox.threads.some(thread => thread.ticket.ticketNumber === ticketNumber),
    'Admin inbox must list submitted ticket',
  );
  const opened = await adminInbox.getAdminSupportInboxThread(
    submitResult.thread.ticket.id,
    repository,
  );
  assert.equal(opened.ticket.ticketNumber, ticketNumber);
  const suggested = renderer.suggestSupportReplyTemplate(opened);
  assert.equal(suggested.id, 'support.admin.reply.payment_link_razorpay_help.v1');
  const variables = renderer.buildTemplateVariablesForThread(opened, {
    resolutionSummary:
      'we verified the checkout context and refreshed the Premium report access state',
  });
  const renderedReply = renderer.renderSupportEmailTemplate({
    templateId: suggested.id,
    variables,
  });
  const adminReply = await adminInbox.sendAdminSupportReply(
    opened.ticket.id,
    {
      action: 'waiting',
      body: renderedReply.text,
      env: {
        PREDICTA_RESEND_API_KEY: 'phase-7-key',
        PREDICTA_SUPPORT_FROM_EMAIL: 'Predicta Care <care@example.invalid>',
        PREDICTA_SUPPORT_REPLY_TO_EMAIL: 'care@example.invalid',
      },
      fetchImpl,
      idempotencyKey: 'phase-7-admin-reply',
      templateId: suggested.id,
      variables,
    },
    repository,
  );
  assert.equal(adminReply.duplicate, false);
  assert.equal(adminReply.deliveryStatus, 'accepted');
  assert.equal(adminReply.thread.ticket.status, 'WAITING_ON_USER');
  assert.equal(sentPayloads.length, 3, 'Admin reply must send one customer email');
  assert.equal(sentPayloads[2].to[0], 'bhaumik@example.invalid');
  assert(sentPayloads[2].text.includes('Premium report access state'));

  const missingProviderRepository = new threadModel.InMemorySupportTicketThreadRepository();
  const missingProvider = await submission.submitSupportTicket(
    {
      customerEmail: 'missing-provider@example.invalid',
      message: 'I need support but provider is not configured.',
      subject: 'Missing provider smoke',
    },
    {
      env: {},
      now: new Date('2026-06-02T13:10:00.000Z'),
      repository: missingProviderRepository,
    },
  );
  assert.equal(missingProvider.notifications.configReady, false);
  assert.equal(missingProvider.notifications.deliveryEvents.length, 0);
  assert.equal(missingProvider.thread.deliveryEvents.length, 0);

  const failureRepository = new threadModel.InMemorySupportTicketThreadRepository();
  const failure = await submission.submitSupportTicket(
    {
      customerEmail: 'failure@example.invalid',
      message: 'Provider failure smoke.',
      subject: 'Provider failure smoke',
    },
    {
      env: { PREDICTA_RESEND_API_KEY: 'phase-7-key' },
      fetchImpl: async () =>
        Response.json({ message: 'Provider rejected smoke delivery.' }, { status: 502 }),
      now: new Date('2026-06-02T13:15:00.000Z'),
      repository: failureRepository,
    },
  );
  assert.equal(failure.notifications.configReady, true);
  assert.equal(failure.notifications.sentCustomerAutoReply, false);
  assert.equal(failure.notifications.sentAdminNotification, false);
  assert.deepEqual(
    failure.thread.deliveryEvents.map(event => event.status),
    ['failed', 'failed'],
  );

  const liveSmoke = await maybeRunLiveSmoke();
  const finalThread = await repository.getThread(submitResult.thread.ticket.id);
  const artifact = {
    adminNotificationArtifact: {
      subject: adminEmailPayload.subject,
      template: adminEmailPayload.tags.find(tag => tag.name === 'predicta_template')?.value,
      ticketHeader: adminEmailPayload.headers['X-Predicta-Ticket'],
      to: adminEmailPayload.to,
    },
    adminReplyArtifact: {
      deliveryStatus: adminReply.deliveryStatus,
      duplicate: adminReply.duplicate,
      status: adminReply.thread.ticket.status,
      template: suggested.id,
      to: sentPayloads[2].to,
    },
    auditTrailArtifact: {
      auditKinds: Array.from(new Set(finalThread.auditEvents.map(event => event.kind))).sort(),
      deliveryCount: finalThread.deliveryEvents.length,
      messageCount: finalThread.messages.length,
      privateNoteLeaked: finalThread.messages.some(
        message =>
          message.visibility === 'customer_visible' && /private\s+note/i.test(message.body),
      ),
    },
    customerEmailArtifact: {
      subject: customerEmailPayload.subject,
      template: customerEmailPayload.tags.find(tag => tag.name === 'predicta_template')?.value,
      ticketHeader: customerEmailPayload.headers['X-Predicta-Ticket'],
      to: customerEmailPayload.to,
    },
    inboundReplyThreadingArtifact: {
      bodySanitized: !finalThread.messages
        .filter(message => message.kind === 'customer_inbound')
        .some(message => message.body.includes('script')),
      status: inbound.status,
      ticketNumber: inbound.ticketNumber,
    },
    liveSmoke,
    missingProviderSmoke: {
      configReady: missingProvider.notifications.configReady,
      deliveryCount: missingProvider.thread.deliveryEvents.length,
    },
    phase: 'PREDICTA_EMAIL_PHASE_7_END_TO_END_EMAIL_SMOKE_AND_RELEASE_GATE',
    providerFailureSmoke: {
      configReady: failure.notifications.configReady,
      deliveryStatuses: failure.thread.deliveryEvents.map(event => event.status),
    },
    supportRouteArtifact: {
      status: routeResponse.status,
      ticketCreated: typeof routeJson.ticket.ticketNumber === 'string',
    },
    ticketNumber,
  };

  assert.equal(artifact.auditTrailArtifact.privateNoteLeaked, false);
  assert(artifact.auditTrailArtifact.auditKinds.includes('ticket_created'));
  assert(artifact.auditTrailArtifact.auditKinds.includes('message_added'));
  assert(artifact.auditTrailArtifact.auditKinds.includes('delivery_recorded'));
  assert(artifact.auditTrailArtifact.auditKinds.includes('status_changed'));
  writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
} finally {
  rmSync(compiledDir, { force: true, recursive: true });
}

console.log(
  'Email Phase 7 passed: public support submission, ticket persistence, mocked customer/admin outbound, inbound reply threading, protected admin inbox read, suggested-template admin reply, status/delivery/audit artifacts, missing-provider path, provider-failure path, and live-smoke policy are locked.',
);

async function maybeRunLiveSmoke() {
  if (
    process.env.PREDICTA_EMAIL_PHASE_7_LIVE_SMOKE !== '1' ||
    !process.env.PREDICTA_RESEND_API_KEY?.trim()
  ) {
    return {
      reason:
        'Skipped because PREDICTA_EMAIL_PHASE_7_LIVE_SMOKE=1 and PREDICTA_RESEND_API_KEY were not both present.',
      status: 'skipped',
    };
  }

  return {
    reason:
      'Live smoke is enabled by environment, but this gate keeps Phase 7 local-safe unless a dedicated live recipient workflow is added.',
    status: 'skipped-live-recipient-not-configured',
  };
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
  const relativeTypes = path.relative(
    outputDir,
    path.join(process.cwd(), 'packages/types/src/index.ts'),
  );
  const shimmed = output.replace(
    /require\(["']@pridicta\/types["']\)/g,
    `require("${relativeTypes.replace(/\\/g, '/')}")`,
  );

  writeFileSync(outputPath, shimmed);
}
