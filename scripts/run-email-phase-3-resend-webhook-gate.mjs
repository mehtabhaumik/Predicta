import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const requiredFiles = [
  'apps/web/app/api/email/resend/webhook/route.ts',
  'apps/web/lib/email/resend-webhook.ts',
  'apps/web/lib/email/support-html-sanitizer.ts',
  'apps/web/lib/email/support-ticket-thread.ts',
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
  'apps/web/apphosting.yaml',
];

for (const file of requiredFiles) {
  assert.doesNotThrow(() => readFileSync(file, 'utf8'), `Missing Phase 3 file: ${file}`);
}

const roadmap = readFileSync(
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
  'utf8',
);
for (const phrase of [
  'PREDICTA_EMAIL_PHASE_3_RESEND_INBOUND_WEBHOOK_AND_THREADING',
  'https://predicta.rudraix.com/api/email/resend/webhook',
  'email.received',
  'email.sent',
  'email.delivered',
  'email.delivery_delayed',
  'email.bounced',
  'email.failed',
  'email.complained',
  'email.suppressed',
  'Do not enable `email.opened` or `email.clicked`',
  'PREDICTA_RESEND_WEBHOOK_SECRET@1',
]) {
  assert(roadmap.includes(phrase), `Phase 3 roadmap missing: ${phrase}`);
}

const appHosting = readFileSync('apps/web/apphosting.yaml', 'utf8');
assert(
  appHosting.includes('variable: PREDICTA_RESEND_WEBHOOK_SECRET') &&
    appHosting.includes('secret: PREDICTA_RESEND_WEBHOOK_SECRET@1'),
  'App Hosting must expose PREDICTA_RESEND_WEBHOOK_SECRET@1 at runtime',
);

const routeSource = readFileSync(
  'apps/web/app/api/email/resend/webhook/route.ts',
  'utf8',
);
for (const phrase of [
  'request.text()',
  "request.headers.get('svix-signature')",
  "request.headers.get('svix-timestamp')",
  "request.headers.get('svix-id')",
  'getResendWebhookSecret',
  'verifyResendWebhookSignature',
  'processVerifiedResendWebhook',
  "export const runtime = 'nodejs'",
]) {
  assert(routeSource.includes(phrase), `Webhook route missing: ${phrase}`);
}
assert(
  !routeSource.includes('request.json()'),
  'Webhook route must not parse JSON before signature verification',
);

const webhookSource = readFileSync('apps/web/lib/email/resend-webhook.ts', 'utf8');
for (const phrase of [
  'RESEND_SUPPORT_WEBHOOK_EVENTS',
  'RESEND_SUPPORT_WEBHOOK_EVENTS_NOT_ENABLED',
  'email.received',
  'email.delivery_delayed',
  'email.opened',
  'email.clicked',
  'PREDICTA_RESEND_WEBHOOK_SECRET',
  'decodeResendWebhookSecret',
  'timingSafeEqual',
  'quarantineInboundEmail',
  'quarantineDeliveryEvent',
  'findThreadByTicketNumber',
  'fetchResendReceivedEmailContent',
  'https://api.resend.com/emails/receiving',
]) {
  assert(webhookSource.includes(phrase), `Webhook processor missing: ${phrase}`);
}

const sanitizerSource = readFileSync(
  'apps/web/lib/email/support-html-sanitizer.ts',
  'utf8',
);
for (const phrase of [
  'sanitizeSupportEmailHtml',
  'supportEmailHtmlToPlainText',
  'javascript',
  'data',
  'on[a-z]+',
  'script',
]) {
  assert(sanitizerSource.includes(phrase), `Sanitizer source missing: ${phrase}`);
}

const compiledDir = mkdtempSync(path.join(tmpdir(), 'predicta-email-phase-3-'));
try {
  compileTs(
    'apps/web/lib/email/support-ticket-thread.ts',
    path.join(compiledDir, 'support-ticket-thread.js'),
  );
  compileTs(
    'apps/web/lib/email/support-html-sanitizer.ts',
    path.join(compiledDir, 'support-html-sanitizer.js'),
  );
  compileTs(
    'apps/web/lib/email/resend-webhook.ts',
    path.join(compiledDir, 'resend-webhook.js'),
  );

  const threadModel = require(path.join(compiledDir, 'support-ticket-thread.js'));
  const webhook = require(path.join(compiledDir, 'resend-webhook.js'));
  const sanitizer = require(path.join(compiledDir, 'support-html-sanitizer.js'));

  const secret = `whsec_${Buffer.from('phase-3-secret').toString('base64')}`;
  const now = new Date('2026-06-02T10:00:00.000Z');
  const timestamp = `${Math.floor(now.getTime() / 1000)}`;
  const rawReceived = JSON.stringify({
    created_at: '2026-06-02T10:00:00.000Z',
    data: {
      email_id: 'recv-1',
      from: 'bhaumik@example.com',
      message_id: '<customer-reply-1@example.com>',
      subject: 'Re: Report issue PRD-20260602-0004',
      to: ['support+PRD-20260602-0004@predicta.rudraix.com'],
    },
    type: 'email.received',
  });
  const signature = webhook.buildWebhookSignatureForTest({
    rawBody: rawReceived,
    secret,
    timestamp,
    webhookId: 'msg_phase_3_received',
  });
  const headers = {
    signature,
    timestamp,
    webhookId: 'msg_phase_3_received',
  };

  assert.doesNotThrow(() =>
    webhook.verifyResendWebhookSignature({
      headers,
      now,
      rawBody: rawReceived,
      secret,
    }),
  );
  assert.throws(
    () =>
      webhook.verifyResendWebhookSignature({
        headers: {
          ...headers,
          signature: 'v1,invalid',
        },
        now,
        rawBody: rawReceived,
        secret,
      }),
    /Invalid Resend webhook signature/,
    'Invalid signatures must be rejected',
  );
  assert.throws(
    () =>
      webhook.verifyResendWebhookSignature({
        headers: {
          ...headers,
          timestamp: `${Number(timestamp) - 999}`,
        },
        now,
        rawBody: rawReceived,
        secret,
      }),
    /timestamp is too old/,
    'Stale webhook timestamps must be rejected',
  );

  const unsafeHtml =
    '<div onclick="steal()">Hello <strong>Bhaumik</strong><script>alert(1)</script><a href="javascript:evil()">bad</a><img src="data:image/png;base64,abc" onerror="bad()"></div>';
  const sanitized = sanitizer.sanitizeSupportEmailHtml(unsafeHtml);
  assert(!sanitized.includes('onclick'), 'Sanitizer must strip event handlers');
  assert(!sanitized.includes('<script'), 'Sanitizer must strip script tags');
  assert(!sanitized.includes('javascript:'), 'Sanitizer must strip javascript URLs');
  assert(!sanitized.includes('data:image'), 'Sanitizer must strip data URLs');
  const text = sanitizer.supportEmailHtmlToPlainText(unsafeHtml);
  assert(text.includes('Hello Bhaumik'), 'Sanitizer must preserve safe text');

  const repository = new threadModel.InMemorySupportTicketThreadRepository();
  const store = new webhook.InMemoryResendWebhookProcessingStore();
  const thread = await repository.createThread({
    actor: {
      displayName: 'Bhaumik Mehta',
      email: 'bhaumik@example.com',
      role: 'customer',
    },
    category: 'report',
    customerEmail: 'bhaumik@example.com',
    customerName: 'Bhaumik Mehta',
    initialMessage: 'My report did not download.',
    now: '2026-06-02T09:55:00.000Z',
    subject: 'Report issue',
    ticketNumber: 'PRD-20260602-0004',
  });

  const threaded = await webhook.processVerifiedResendWebhook(
    {
      headers,
      rawBody: rawReceived,
    },
    {
      now,
      receivedEmailFetcher: async emailId => {
        assert.equal(emailId, 'recv-1');
        return {
          attachments: [
            {
              filename: 'screenshot.png',
              id: 'attachment-1',
            },
          ],
          from: 'Bhaumik Mehta <bhaumik@example.com>',
          headers: {
            from: 'Bhaumik Mehta <bhaumik@example.com>',
            'x-predicta-ticket': 'PRD-20260602-0004',
          },
          html: unsafeHtml,
          message_id: '<customer-reply-1@example.com>',
          subject: 'Re: Report issue PRD-20260602-0004',
          text: null,
          to: ['support+PRD-20260602-0004@predicta.rudraix.com'],
        };
      },
      repository,
      store,
    },
  );
  assert.equal(threaded.status, 'threaded');
  assert.equal(threaded.ticketNumber, 'PRD-20260602-0004');
  const updatedThread = await repository.getThread(thread.ticket.id);
  assert.equal(updatedThread.messages.length, 2, 'Inbound reply must append one message');
  assert.equal(updatedThread.messages[1].kind, 'customer_inbound');
  assert(updatedThread.messages[1].body.includes('Hello Bhaumik'));
  assert(updatedThread.messages[1].body.includes('Attachments received: screenshot.png'));
  assert(!updatedThread.messages[1].body.includes('script'));

  const duplicate = await webhook.processVerifiedResendWebhook(
    {
      headers,
      rawBody: rawReceived,
    },
    {
      now,
      receivedEmailFetcher: async () => {
        throw new Error('Duplicate webhook must not fetch content again.');
      },
      repository,
      store,
    },
  );
  assert.equal(duplicate.status, 'duplicate');
  assert.equal((await repository.getThread(thread.ticket.id)).messages.length, 2);

  const rawUnthreaded = JSON.stringify({
    created_at: '2026-06-02T10:01:00.000Z',
    data: {
      email_id: 'recv-2',
      from: 'unknown@example.com',
      subject: 'I need help',
      to: ['support@predicta.rudraix.com'],
    },
    type: 'email.received',
  });
  const unthreadedHeaders = signHeaders(webhook, {
    rawBody: rawUnthreaded,
    secret,
    timestamp,
    webhookId: 'msg_phase_3_unthreaded',
  });
  const unthreaded = await webhook.processVerifiedResendWebhook(
    {
      headers: unthreadedHeaders,
      rawBody: rawUnthreaded,
    },
    {
      now,
      receivedEmailFetcher: async () => ({
        from: 'unknown@example.com',
        html: '<p>No ticket number here</p>',
        subject: 'I need help',
        text: null,
        to: ['support@predicta.rudraix.com'],
      }),
      repository,
      store,
    },
  );
  assert.equal(unthreaded.status, 'quarantined');
  assert.equal(store.unthreadedInboundEmails.length, 1);
  assert.equal(store.unthreadedInboundEmails[0].reason.includes('No support ticket'), true);

  const rawDelivered = JSON.stringify({
    created_at: '2026-06-02T10:02:00.000Z',
    data: {
      email_id: 'sent-1',
      message_id: updatedThread.messages[1].id,
      subject: 'Report issue PRD-20260602-0004',
      tags: {
        predicta_ticket: 'PRD-20260602-0004',
      },
      template_id: 'support.admin.reply.issue_acknowledged.v1',
      to: ['bhaumik@example.com'],
    },
    type: 'email.delivered',
  });
  const delivered = await webhook.processVerifiedResendWebhook(
    {
      headers: signHeaders(webhook, {
        rawBody: rawDelivered,
        secret,
        timestamp,
        webhookId: 'msg_phase_3_delivered',
      }),
      rawBody: rawDelivered,
    },
    {
      repository,
      store,
    },
  );
  assert.equal(delivered.status, 'recorded');
  const deliveredThread = await repository.getThread(thread.ticket.id);
  assert.equal(deliveredThread.deliveryEvents.length, 1);
  assert.equal(deliveredThread.deliveryEvents[0].status, 'delivered');

  const rawOpened = JSON.stringify({
    created_at: '2026-06-02T10:03:00.000Z',
    data: {
      email_id: 'sent-1',
    },
    type: 'email.opened',
  });
  const ignored = await webhook.processVerifiedResendWebhook(
    {
      headers: signHeaders(webhook, {
        rawBody: rawOpened,
        secret,
        timestamp,
        webhookId: 'msg_phase_3_opened',
      }),
      rawBody: rawOpened,
    },
    {
      repository,
      store,
    },
  );
  assert.equal(ignored.status, 'ignored');

  const fetchedCalls = [];
  const fetched = await webhook.fetchResendReceivedEmailContent('recv-fetch-1', {
    apiKey: 'phase-3-api-key',
    fetchImpl: async (url, init) => {
      fetchedCalls.push({ init, url: String(url) });
      return new Response(
        JSON.stringify({
          id: 'recv-fetch-1',
          html: '<p>Fetched safely</p>',
          text: null,
          headers: {
            from: 'Customer <customer@example.com>',
          },
          to: ['support@predicta.rudraix.com'],
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    },
  });
  assert.equal(fetched.html, '<p>Fetched safely</p>');
  assert.equal(fetchedCalls.length, 1);
  assert(
    fetchedCalls[0].url.includes('/emails/receiving/recv-fetch-1?html_format=cid'),
    'Receiving API fetch must use Resend received-email endpoint',
  );
  assert.equal(
    fetchedCalls[0].init.headers.Authorization,
    'Bearer phase-3-api-key',
    'Receiving API fetch must use server-side Resend API key',
  );
} finally {
  rmSync(compiledDir, { force: true, recursive: true });
}

console.log(
  'Email Phase 3 passed: verified Resend inbound webhook route, raw-body signature validation, supported events, opened/clicked exclusion, duplicate idempotency, inbound threading, delivery recording, unthreaded quarantine, and HTML sanitizer are locked.',
);

function compileTs(sourcePath, outputPath) {
  const output = ts.transpileModule(readFileSync(sourcePath, 'utf8'), {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourcePath,
    reportDiagnostics: true,
  });
  const errors = output.diagnostics?.filter(
    diagnostic => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  assert.equal(errors?.length ?? 0, 0, `${sourcePath} transpile errors`);
  writeFileSync(outputPath, output.outputText);
}

function signHeaders(webhook, input) {
  return {
    signature: webhook.buildWebhookSignatureForTest(input),
    timestamp: input.timestamp,
    webhookId: input.webhookId,
  };
}
