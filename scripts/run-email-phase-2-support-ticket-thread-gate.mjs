import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const requiredFiles = [
  'packages/types/src/support.ts',
  'packages/types/src/index.ts',
  'apps/web/lib/email/support-ticket-thread.ts',
  'backend/astro_api/models.py',
  'docs/audits/PREDICTA_EMAIL_PHASE_2_SUPPORT_TICKET_THREAD_DATA_MODEL/support-thread-migration-backfill-plan.md',
];

for (const file of requiredFiles) {
  assert.doesNotThrow(() => readFileSync(file, 'utf8'), `Missing Phase 2 file: ${file}`);
}

const roadmap = readFileSync(
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
  'utf8',
);
assert(
  roadmap.includes('PREDICTA_EMAIL_PHASE_2_SUPPORT_TICKET_THREAD_DATA_MODEL'),
  'Email roadmap must include Phase 2 keyword',
);
assert(
  roadmap.includes('Private notes must be impossible to leak as customer messages.'),
  'Email roadmap must lock private-note non-leak requirement',
);

const typeSource = readFileSync('packages/types/src/support.ts', 'utf8');
for (const phrase of [
  "export type SupportTicketCategory",
  "'customer_inbound'",
  "'admin_outbound'",
  "'system_auto_reply'",
  "'internal_private_note'",
  "visibility: 'internal_only'",
  'SupportEmailDeliveryEvent',
  'SupportTicketAuditEvent',
  'SupportTicketThread',
]) {
  assert(typeSource.includes(phrase), `Shared support type source missing: ${phrase}`);
}
assert(
  readFileSync('packages/types/src/index.ts', 'utf8').includes("export * from './support';"),
  'Shared support types must be exported from @pridicta/types',
);

const backendModels = readFileSync('backend/astro_api/models.py', 'utf8');
for (const phrase of [
  'SupportTicketCategory',
  'SupportTicketStatus',
  'SupportTicketPriority',
  'SupportTicketRecord',
  'SupportTicketMessage',
  'SupportEmailDeliveryEvent',
  'SupportTicketAuditEvent',
  'SupportTicketThread',
  'internal_private_note cannot be delivery eligible',
  'internal_private_note must stay internal_only',
]) {
  assert(backendModels.includes(phrase), `Backend support model missing: ${phrase}`);
}

const migrationPlan = readFileSync(
  'docs/audits/PREDICTA_EMAIL_PHASE_2_SUPPORT_TICKET_THREAD_DATA_MODEL/support-thread-migration-backfill-plan.md',
  'utf8',
);
for (const phrase of [
  'Do not silently import every local/browser-only feedback draft',
  'Backfill should only happen from backend-owned records.',
  'Do not backfill browser `localStorage` entries automatically.',
  'visibility: internal_only',
  'deliveryEligible: false',
]) {
  assert(migrationPlan.includes(phrase), `Migration/backfill plan missing: ${phrase}`);
}

const compiledDir = mkdtempSync(path.join(tmpdir(), 'predicta-email-phase-2-'));
try {
  const source = readFileSync('apps/web/lib/email/support-ticket-thread.ts', 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: 'apps/web/lib/email/support-ticket-thread.ts',
    reportDiagnostics: true,
  });
  const errors = output.diagnostics?.filter(
    diagnostic => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  assert.equal(errors?.length ?? 0, 0, 'support-ticket-thread transpile errors');
  writeFileSync(path.join(compiledDir, 'support-ticket-thread.js'), output.outputText);

  const threadModel = require(path.join(compiledDir, 'support-ticket-thread.js'));
  const customer = {
    displayName: 'Bhaumik',
    email: 'bhaumik@example.com',
    role: 'customer',
    userId: 'uid-1',
  };
  const admin = {
    displayName: 'Predicta Admin',
    email: 'predicta@rudraix.com',
    role: 'admin',
  };

  let thread = threadModel.createSupportTicketThread({
    actor: customer,
    category: 'billing',
    customerEmail: 'bhaumik@example.com',
    customerName: 'Bhaumik',
    initialMessage: 'Payment failed after I selected a report pack.',
    language: 'en',
    now: '2026-06-02T01:00:00.000Z',
    priority: 'NORMAL',
    route: '/checkout',
    sourceSurface: 'web-checkout',
    subject: 'Payment failed',
    ticketNumber: 'PRD-20260602-0002',
    userId: 'uid-1',
  });

  assert.equal(thread.ticket.status, 'NEW');
  assert.equal(thread.messages.length, 1);
  assert.equal(thread.messages[0].kind, 'customer_inbound');
  assert.equal(thread.auditEvents.length, 2);

  assert.throws(
    () =>
      threadModel.addSupportTicketMessage(thread, {
        actor: { role: 'system' },
        body: 'Auto reply without a template should fail.',
        kind: 'system_auto_reply',
        now: '2026-06-02T01:01:00.000Z',
      }),
    /templateId/,
    'System auto-reply messages must require a template id',
  );

  thread = threadModel.addSupportTicketMessage(thread, {
    actor: admin,
    body: 'Internal reviewer note: payment context needs manual verification.',
    kind: 'internal_private_note',
    now: '2026-06-02T01:02:00.000Z',
  });
  const privateNote = thread.messages.at(-1);
  assert.equal(privateNote.kind, 'internal_private_note');
  assert.equal(privateNote.visibility, 'internal_only');
  assert.equal(privateNote.deliveryEligible, false);
  assert.throws(
    () => threadModel.assertCustomerDeliverableMessage(privateNote),
    /Internal private notes cannot be sent/,
    'Private notes must not be deliverable as customer messages',
  );
  assert.equal(
    threadModel.getCustomerVisibleSupportMessages(thread).length,
    1,
    'Private note must be excluded from customer-visible messages',
  );

  thread = threadModel.addSupportTicketMessage(thread, {
    actor: admin,
    body: 'We are checking your payment and report access now.',
    kind: 'admin_outbound',
    now: '2026-06-02T01:03:00.000Z',
    templateId: 'support.admin.reply.issue_acknowledged.v1',
  });
  const adminReply = thread.messages.at(-1);
  assert.equal(adminReply.kind, 'admin_outbound');
  assert.equal(adminReply.visibility, 'customer_visible');
  assert.equal(adminReply.deliveryEligible, true);
  assert.equal(thread.ticket.latestAdminReplyAt, '2026-06-02T01:03:00.000Z');

  thread = threadModel.updateSupportTicketStatus(thread, {
    actor: admin,
    now: '2026-06-02T01:04:00.000Z',
    status: 'WAITING_ON_USER',
  });
  thread = threadModel.updateSupportTicketPriority(thread, {
    actor: admin,
    now: '2026-06-02T01:05:00.000Z',
    priority: 'HIGH',
  });
  thread = threadModel.assignSupportTicket(thread, {
    actor: admin,
    assignedTo: 'support-owner',
    now: '2026-06-02T01:06:00.000Z',
  });
  assert.equal(thread.ticket.status, 'WAITING_ON_USER');
  assert.equal(thread.ticket.priority, 'HIGH');
  assert.equal(thread.ticket.assignedTo, 'support-owner');
  assert(
    thread.auditEvents.some(event => event.kind === 'status_changed'),
    'Status update must create an audit event',
  );
  assert(
    thread.auditEvents.some(event => event.kind === 'priority_changed'),
    'Priority update must create an audit event',
  );
  assert(
    thread.auditEvents.some(event => event.kind === 'assignment_changed'),
    'Assignment update must create an audit event',
  );

  thread = threadModel.recordSupportEmailDeliveryEvent(thread, {
    attemptedAt: '2026-06-02T01:07:00.000Z',
    messageId: adminReply.id,
    provider: 'resend',
    providerMessageId: 'resend-123',
    recipient: 'bhaumik@example.com',
    status: 'accepted',
    statusCode: 200,
    templateId: 'support.admin.reply.issue_acknowledged.v1',
  });
  assert.equal(thread.deliveryEvents.length, 1);
  assert.equal(thread.deliveryEvents[0].ticketId, thread.ticket.id);
  assert.equal(thread.deliveryEvents[0].ticketNumber, thread.ticket.ticketNumber);
  assert(
    thread.auditEvents.some(event => event.kind === 'delivery_recorded'),
    'Delivery event must create an audit event',
  );

  const repository = new threadModel.InMemorySupportTicketThreadRepository();
  const created = await repository.createThread({
    actor: customer,
    category: 'report',
    customerEmail: 'bhaumik@example.com',
    initialMessage: 'Report did not download.',
    now: '2026-06-02T02:00:00.000Z',
    subject: 'Report download issue',
    ticketNumber: 'PRD-20260602-0003',
  });
  const updated = await repository.appendMessage(created.ticket.id, {
    actor: { role: 'system' },
    body: 'We received your report issue.',
    kind: 'system_auto_reply',
    now: '2026-06-02T02:01:00.000Z',
    templateId: 'support.customer.auto_reply.received.v1',
  });
  assert.equal(updated.messages.length, 2);
  assert.equal((await repository.getThread(created.ticket.id))?.ticket.id, created.ticket.id);
  await assert.rejects(
    () =>
      repository.appendMessage('missing-ticket', {
        actor: admin,
        body: 'Should fail',
        kind: 'internal_private_note',
      }),
    /not found/,
    'Repository must reject updates for unknown threads',
  );
} finally {
  rmSync(compiledDir, { force: true, recursive: true });
}

console.log(
  'Email Phase 2 passed: support ticket thread schema, message lifecycle, delivery events, audit events, repository behavior, and private-note non-leak contract are locked.',
);
