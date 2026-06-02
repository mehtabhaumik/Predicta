import assert from 'node:assert/strict';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const sourceFiles = [
  'apps/web/lib/email/resend-outbound.ts',
  'apps/web/lib/email/support-email-template-renderer.ts',
  'apps/web/lib/email/support-email-templates.ts',
  'apps/web/lib/email/support-outbound-notifications.ts',
];

for (const file of sourceFiles) {
  assert.doesNotThrow(() => readFileSync(file, 'utf8'), `Missing Phase 1 source file: ${file}`);
}

const roadmap = readFileSync(
  'docs/PREDICTA_EMAIL_SUPPORT_INBOX_RESEND_STRICT_PHASES.md',
  'utf8',
);
assert(
  roadmap.includes('PREDICTA_EMAIL_PHASE_1_RESEND_OUTBOUND_CUSTOMER_ADMIN_NOTIFICATIONS'),
  'Email roadmap must include Phase 1 keyword',
);
assert(
  roadmap.includes('PREDICTA_RESEND_API_KEY@1'),
  'Email roadmap must lock PREDICTA_RESEND_API_KEY@1 for Phase 1',
);

const appHosting = readFileSync('apps/web/apphosting.yaml', 'utf8');
assert(
  appHosting.includes('secret: PREDICTA_RESEND_API_KEY@1'),
  'App Hosting must expose PREDICTA_RESEND_API_KEY@1 at runtime',
);

const resendSource = readFileSync('apps/web/lib/email/resend-outbound.ts', 'utf8');
assert(
  resendSource.includes("env.PREDICTA_RESEND_API_KEY"),
  'Resend outbound config must read PREDICTA_RESEND_API_KEY',
);
assert(
  !resendSource.includes('NEXT_PUBLIC'),
  'Resend outbound source must not read NEXT_PUBLIC secrets',
);
assert(
  resendSource.includes('https://api.resend.com/emails'),
  'Resend outbound source must use Resend send email API endpoint',
);

const templateSource = readFileSync(
  'apps/web/lib/email/support-email-templates.ts',
  'utf8',
);
const templateCatalog = readFileSync(
  'apps/web/lib/email/support-email-template-catalog.json',
  'utf8',
);
for (const phrase of [
  'support.customer.auto_reply.received.v1',
  'support.admin.notification.received.v1',
  'We have received your message',
  'Predicta support uses your message only to help with your request',
  'Internal Predicta note',
]) {
  assert(
    templateSource.includes(phrase) || templateCatalog.includes(phrase),
    `Template source/catalog missing required phrase: ${phrase}`,
  );
}

assertNoClientSideResendLeaks();

const compiledDir = mkdtempSync(path.join(tmpdir(), 'predicta-email-phase-1-'));
try {
  for (const file of sourceFiles) {
    const source = readFileSync(file, 'utf8');
    const output = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: file,
      reportDiagnostics: true,
    });

    const errors = output.diagnostics?.filter(
      diagnostic => diagnostic.category === ts.DiagnosticCategory.Error,
    );
    assert.equal(errors?.length ?? 0, 0, `Transpile errors in ${file}`);
    const outputPath = path.join(compiledDir, file.replace(/\.ts$/, '.js'));
    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, output.outputText);
  }
  copyFileSync(
    'apps/web/lib/email/support-email-template-catalog.json',
    path.join(compiledDir, 'apps/web/lib/email/support-email-template-catalog.json'),
  );

  const resend = require(path.join(compiledDir, 'apps/web/lib/email/resend-outbound.js'));
  const notifications = require(
    path.join(compiledDir, 'apps/web/lib/email/support-outbound-notifications.js'),
  );
  const templates = require(path.join(compiledDir, 'apps/web/lib/email/support-email-templates.js'));

  assert.equal(
    resend.resolveResendOutboundConfig({}, { liveRequired: false }),
    undefined,
    'Missing Resend key should be non-fatal when live delivery is not required',
  );
  assert.throws(
    () => resend.resolveResendOutboundConfig({}, { liveRequired: true }),
    /PREDICTA_RESEND_API_KEY is required/,
    'Missing Resend key must fail clearly in live-required mode',
  );

  const ticket = {
    category: 'billing',
    createdAt: '2026-06-02T00:00:00.000Z',
    customerEmail: 'customer@example.com',
    customerName: 'Bhaumik',
    language: 'en',
    message: 'I need help with report payment.',
    priority: 'normal',
    sourceRoute: '/checkout',
    status: 'NEW',
    subject: 'Payment help',
    ticketNumber: 'PRD-20260602-0001',
  };

  const customerTemplate = templates.renderCustomerAutoReplyTemplate(ticket);
  const adminTemplate = templates.renderAdminNotificationTemplate(ticket);
  assert.notEqual(
    customerTemplate.templateId,
    adminTemplate.templateId,
    'Customer/admin emails must use distinct template IDs',
  );
  assert.match(customerTemplate.html, /We received your message/);
  assert.match(adminTemplate.text, /Recommended action/);

  const successCalls = [];
  const successEvents = [];
  const successFetch = async (url, init) => {
    successCalls.push({ init, url });
    return Response.json({ id: `resend-${successCalls.length}` }, { status: 200 });
  };
  const successResult = await notifications.sendSupportOutboundNotifications(ticket, {
    env: {
      PREDICTA_RESEND_API_KEY: 'phase-1-test-key',
      PREDICTA_SUPPORT_ADMIN_EMAIL: 'admin@predicta.test',
      PREDICTA_SUPPORT_FROM_EMAIL: 'Predicta Care <care@predicta.rudraix.com>',
      PREDICTA_SUPPORT_REPLY_TO_EMAIL: 'predicta@rudraix.com',
    },
    fetchImpl: successFetch,
    liveRequired: true,
    recordDeliveryEvent: event => successEvents.push(event),
  });

  assert.equal(successResult.configReady, true);
  assert.equal(successResult.sentCustomerAutoReply, true);
  assert.equal(successResult.sentAdminNotification, true);
  assert.equal(successCalls.length, 2, 'Success path must send customer and admin email');
  assert.equal(successEvents.length, 2, 'Success path must record two delivery events');
  assert(
    successEvents.every(event => event.status === 'accepted'),
    'Success path delivery events must be accepted',
  );
  assert(
    successCalls.every(call =>
      String(call.init.headers.Authorization).startsWith('Bearer phase-1-test-key'),
    ),
    'Provider calls must include Resend bearer token',
  );

  const failureEvents = [];
  let failureCall = 0;
  const failureFetch = async () => {
    failureCall += 1;
    if (failureCall === 1) {
      return Response.json({ message: 'invalid recipient' }, { status: 422 });
    }

    return Response.json({ id: 'admin-ok' }, { status: 200 });
  };
  const failureResult = await notifications.sendSupportOutboundNotifications(ticket, {
    env: { PREDICTA_RESEND_API_KEY: 'phase-1-test-key' },
    fetchImpl: failureFetch,
    recordDeliveryEvent: event => failureEvents.push(event),
  });
  assert.equal(
    failureResult.ticketNumber,
    ticket.ticketNumber,
    'Provider failure must not lose persisted ticket identity',
  );
  assert.equal(failureResult.deliveryEvents[0].status, 'failed');
  assert.equal(failureResult.deliveryEvents[0].statusCode, 422);
  assert.equal(failureResult.deliveryEvents[1].status, 'accepted');
  assert.equal(failureEvents.length, 2, 'Provider failure path must still record events');

  const thrownResult = await notifications.sendSupportOutboundNotifications(ticket, {
    env: { PREDICTA_RESEND_API_KEY: 'phase-1-test-key' },
    fetchImpl: async () => {
      throw new Error('network unavailable');
    },
  });
  assert.equal(thrownResult.deliveryEvents[0].status, 'failed');
  assert.equal(thrownResult.deliveryEvents[0].statusCode, 0);
  assert.match(thrownResult.deliveryEvents[0].error, /network unavailable/);

  const adminOnlyCalls = [];
  const adminOnlyResult = await notifications.sendSupportOutboundNotifications(
    { ...ticket, customerEmail: undefined },
    {
      env: { PREDICTA_RESEND_API_KEY: 'phase-1-test-key' },
      fetchImpl: async (url, init) => {
        adminOnlyCalls.push({ init, url });
        return Response.json({ id: 'admin-only' }, { status: 200 });
      },
    },
  );
  assert.equal(adminOnlyCalls.length, 1, 'No customer email should send only admin notification');
  assert.equal(adminOnlyResult.sentCustomerAutoReply, false);
  assert.equal(adminOnlyResult.sentAdminNotification, true);
} finally {
  rmSync(compiledDir, { force: true, recursive: true });
}

console.log(
  'Email Phase 1 passed: server-only Resend outbound config, customer/admin templates, mocked provider success/failure, and delivery-event behavior are locked.',
);

function assertNoClientSideResendLeaks() {
  const disallowedRoots = [
    'apps/web/app',
    'apps/web/components',
    'apps/mobile/src',
  ];

  for (const root of disallowedRoots) {
    for (const file of walkFiles(root)) {
      if (!/\.(ts|tsx)$/.test(file)) {
        continue;
      }

      const source = readFileSync(file, 'utf8');
      assert(
        !source.includes('PREDICTA_RESEND_API_KEY') &&
          !source.includes('PREDICTA_RESEND_WEBHOOK_SECRET') &&
          !source.includes('api.resend.com'),
        `Client or route surface must not access Resend secrets directly: ${file}`,
      );
    }
  }
}

function walkFiles(root) {
  const entries = [];

  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') {
        continue;
      }
      entries.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      entries.push(fullPath);
    }
  }

  return entries;
}
