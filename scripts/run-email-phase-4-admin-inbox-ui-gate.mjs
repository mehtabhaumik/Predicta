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
  'apps/web/app/dashboard/admin/page.tsx',
  'apps/web/components/WebAdminSupportInboxPanel.tsx',
  'apps/web/app/api/email/admin/tickets/route.ts',
  'apps/web/app/api/email/admin/tickets/[ticketId]/route.ts',
  'apps/web/lib/email/admin-support-inbox.ts',
  'apps/web/lib/email/support-ticket-thread.ts',
  'apps/web/app/globals.css',
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
];

for (const file of requiredFiles) {
  assert.doesNotThrow(() => readFileSync(file, 'utf8'), `Missing Phase 4 file: ${file}`);
}

const roadmap = readFileSync(
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
  'utf8',
);
for (const phrase of [
  'PREDICTA_EMAIL_PHASE_4_ADMIN_INBOX_UI',
  'Add admin-only inbox route or section.',
  'Add ticket list with filters and search.',
  'Add thread detail panel.',
  'Add customer context panel.',
  'Add status, priority, category, and assignment controls.',
  'Add private notes display.',
  'Add delivery status display.',
  'responsive desktop/tablet/mobile behavior',
]) {
  assert(roadmap.includes(phrase), `Email roadmap missing Phase 4 phrase: ${phrase}`);
}

const adminPage = readFileSync('apps/web/app/dashboard/admin/page.tsx', 'utf8');
assert(adminPage.includes('isOwnerConsoleEnabled'), 'Admin page must keep owner guard');
assert(
  adminPage.includes('WebAdminSupportInboxPanel'),
  'Admin page must render support inbox panel',
);
assert(
  adminPage.indexOf('<WebAdminSupportInboxPanel') <
    adminPage.indexOf('<WebAdminGuestPassPanel'),
  'Support inbox should appear before older owner tooling',
);

const component = readFileSync(
  'apps/web/components/WebAdminSupportInboxPanel.tsx',
  'utf8',
);
for (const phrase of [
  'Search tickets',
  'statusFilter',
  'priorityFilter',
  'categoryFilter',
  'ThreadDetail',
  'ContextBlock',
  'Private note · never emailed',
  'Delivery',
  'Assigned to',
  'Open Inbox',
  '/api/email/admin/tickets',
  'x-pridicta-admin-token',
]) {
  assert(component.includes(phrase), `Support inbox component missing: ${phrase}`);
}
assert(
  !component.includes('dangerouslySetInnerHTML'),
  'Admin inbox must not render raw inbound HTML',
);

const listRoute = readFileSync('apps/web/app/api/email/admin/tickets/route.ts', 'utf8');
const detailRoute = readFileSync(
  'apps/web/app/api/email/admin/tickets/[ticketId]/route.ts',
  'utf8',
);
for (const [label, source] of [
  ['list route', listRoute],
  ['detail route', detailRoute],
]) {
  assert(source.includes('requireSupportInboxAdmin'), `${label} must require admin auth`);
}
assert(listRoute.includes('listAdminSupportInboxThreads'), 'List route must list threads');
assert(detailRoute.includes('getAdminSupportInboxThread'), 'Detail route must get thread');
assert(detailRoute.includes('updateAdminSupportInboxThread'), 'Detail route must update thread');

const bridge = readFileSync('apps/web/lib/email/admin-support-inbox.ts', 'utf8');
for (const phrase of [
  'ownerConsoleUnavailableResponse',
  'x-pridicta-admin-token',
  'PREDICTA_SUPPORT_ADMIN_TOKEN',
  'PREDICTA_OWNER_ADMIN_TOKEN',
  'PRIDICTA_ADMIN_TOKEN',
  'listThreads',
  'updateStatus',
  'updatePriority',
  'assignTicket',
  "process.env.NODE_ENV === 'production'",
  'internal_private_note',
  '.invalid',
]) {
  assert(bridge.includes(phrase), `Admin support bridge missing: ${phrase}`);
}

const threadRepo = readFileSync('apps/web/lib/email/support-ticket-thread.ts', 'utf8');
for (const phrase of [
  'listThreads',
  'findThreadByTicketNumber',
  'updatePriority',
  'assignTicket',
]) {
  assert(threadRepo.includes(phrase), `Support repository missing: ${phrase}`);
}

const css = readFileSync('apps/web/app/globals.css', 'utf8');
for (const phrase of [
  '.admin-support-inbox-panel',
  '.admin-support-layout',
  '.admin-support-toolbar',
  '.admin-support-ticket-card',
  '.admin-support-thread-panel',
  '.admin-support-message--internal_private_note',
  '.admin-support-context-panel',
  '@media (max-width: 1180px)',
  '@media (max-width: 560px)',
  '.admin-support-token-row',
]) {
  assert(css.includes(phrase), `Admin support CSS missing: ${phrase}`);
}
assert(
  /admin-support-layout[\s\S]*grid-template-columns:\s*minmax\(280px,\s*0\.42fr\)\s*minmax\(0,\s*1fr\)/.test(
    css,
  ),
  'Desktop admin inbox must use a ticket-list/detail desk layout',
);
assert(
  /admin-support-token-row,\s*\n\s*\.admin-support-metrics[\s\S]*grid-template-columns:\s*1fr/.test(
    css,
  ),
  'Narrow mobile must stack owner-key row and metrics',
);

const compiledDir = mkdtempSync(path.join(tmpdir(), 'predicta-email-phase-4-'));
try {
  compileTs('apps/web/lib/owner-surface.ts', compiledDir);
  compileTs('apps/web/lib/email/resend-outbound.ts', compiledDir);
  compileTs('apps/web/lib/email/support-ticket-thread.ts', compiledDir);
  compileTs('apps/web/lib/email/support-html-sanitizer.ts', compiledDir);
  compileTs('apps/web/lib/email/resend-webhook.ts', compiledDir);
  compileTs('apps/web/lib/email/support-email-template-renderer.ts', compiledDir);
  compileTs('apps/web/lib/email/admin-support-inbox.ts', compiledDir);
  copyFileSync(
    'apps/web/lib/email/support-email-template-catalog.json',
    path.join(compiledDir, 'apps/web/lib/email/support-email-template-catalog.json'),
  );

  const adminInbox = require(
    path.join(compiledDir, 'apps/web/lib/email/admin-support-inbox.js'),
  );
  const threadModel = require(
    path.join(compiledDir, 'apps/web/lib/email/support-ticket-thread.js'),
  );

  const originalOwnerFlag = process.env.PREDICTA_ENABLE_OWNER_CONSOLE;
  const originalSupportToken = process.env.PREDICTA_SUPPORT_ADMIN_TOKEN;
  const originalOwnerToken = process.env.PREDICTA_OWNER_ADMIN_TOKEN;
  const originalLegacyToken = process.env.PRIDICTA_ADMIN_TOKEN;
  const originalNodeEnv = process.env.NODE_ENV;

  try {
    delete process.env.PREDICTA_ENABLE_OWNER_CONSOLE;
    let auth = adminInbox.requireSupportInboxAdmin(new Request('https://predicta.test'));
    assert.equal(auth.ok, false);
    assert.equal(auth.response.status, 404, 'Public owner-disabled inbox must be hidden');

    process.env.PREDICTA_ENABLE_OWNER_CONSOLE = 'true';
    auth = adminInbox.requireSupportInboxAdmin(new Request('https://predicta.test'));
    assert.equal(auth.ok, false);
    assert.equal(auth.response.status, 401, 'Missing owner key must be rejected');

    process.env.PREDICTA_SUPPORT_ADMIN_TOKEN = 'phase-4-token';
    auth = adminInbox.requireSupportInboxAdmin(
      new Request('https://predicta.test', {
        headers: { 'x-pridicta-admin-token': 'wrong-token' },
      }),
    );
    assert.equal(auth.ok, false);
    assert.equal(auth.response.status, 403, 'Wrong owner key must be rejected');

    auth = adminInbox.requireSupportInboxAdmin(
      new Request('https://predicta.test', {
        headers: {
          'x-pridicta-admin-email': 'owner@predicta.test',
          'x-pridicta-admin-token': 'phase-4-token',
        },
      }),
    );
    assert.equal(auth.ok, true, 'Correct owner key should pass');
    assert.equal(auth.adminEmail, 'owner@predicta.test');

    process.env.NODE_ENV = 'development';
    const repository = new threadModel.InMemorySupportTicketThreadRepository();
    const summary = await adminInbox.listAdminSupportInboxThreads(repository);
    assert.equal(summary.threads.length, 3, 'Dev inbox should seed safe preview threads');
    assert.equal(summary.counts.open, 3);
    assert.equal(summary.counts.urgent, 1);
    assert.equal(summary.counts.waiting, 1);
    assert(
      summary.threads.every(thread => thread.ticket.customerEmail?.endsWith('.invalid')),
      'Preview support threads must use non-real .invalid emails',
    );

    const first = summary.threads.find(thread =>
      thread.messages.some(message => message.kind === 'internal_private_note'),
    );
    assert(first, 'At least one preview thread must show private note handling');
    assert(
      first.messages.some(
        message =>
          message.kind === 'internal_private_note' &&
          message.visibility === 'internal_only' &&
          message.deliveryEligible === false,
      ),
      'Private notes must remain internal_only and not delivery eligible',
    );
    assert(
      first.deliveryEvents.some(event => event.status === 'delivered'),
      'Inbox preview must include delivery event display data',
    );

    const updated = await adminInbox.updateAdminSupportInboxThread(
      first.ticket.id,
      {
        assignedTo: 'support-owner',
        priority: 'URGENT',
        status: 'WAITING_ON_USER',
      },
      repository,
    );
    assert.equal(updated.ticket.assignedTo, 'support-owner');
    assert.equal(updated.ticket.priority, 'URGENT');
    assert.equal(updated.ticket.status, 'WAITING_ON_USER');

    await assert.rejects(
      () =>
        adminInbox.updateAdminSupportInboxThread(
          'missing-ticket',
          { status: 'IN_REVIEW' },
          repository,
        ),
      /Support ticket not found/,
      'Missing tickets must not update silently',
    );

    process.env.NODE_ENV = 'production';
    const productionRepository = new threadModel.InMemorySupportTicketThreadRepository();
    const productionSummary =
      await adminInbox.listAdminSupportInboxThreads(productionRepository);
    assert.equal(
      productionSummary.threads.length,
      0,
      'Production inbox must not seed preview support threads',
    );
  } finally {
    restoreEnv('PREDICTA_ENABLE_OWNER_CONSOLE', originalOwnerFlag);
    restoreEnv('PREDICTA_SUPPORT_ADMIN_TOKEN', originalSupportToken);
    restoreEnv('PREDICTA_OWNER_ADMIN_TOKEN', originalOwnerToken);
    restoreEnv('PRIDICTA_ADMIN_TOKEN', originalLegacyToken);
    restoreEnv('NODE_ENV', originalNodeEnv);
  }
} finally {
  rmSync(compiledDir, { force: true, recursive: true });
}

console.log(
  'Email Phase 4 passed: admin inbox UI, owner/token data gate, ticket search/filter source, thread detail, customer context, private-note visibility, delivery state, status/priority/assignment controls, and responsive layout contract are locked.',
);

function compileTs(sourcePath, outputRoot) {
  const source = readFileSync(sourcePath, 'utf8');
  const output = ts.transpileModule(source, {
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
  const outputPath = path.join(outputRoot, sourcePath.replace(/\.ts$/, '.js'));
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, output.outputText);
}

function restoreEnv(key, value) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}
