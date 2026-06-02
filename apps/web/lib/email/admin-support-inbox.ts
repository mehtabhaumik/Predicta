import type {
  SupportEmailDeliveryStatus,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketThread,
} from '@pridicta/types';

import {
  getDefaultResendWebhookRepository,
} from './resend-webhook';
import {
  createEmailDeliveryEvent,
  resolveResendOutboundConfig,
  sendResendEmail,
  type ResendFetch,
} from './resend-outbound';
import {
  type SupportTicketThreadRepository,
} from './support-ticket-thread';
import {
  buildTemplateVariablesForThread,
  getSupportEmailTemplate,
  renderSupportEmailTemplate,
} from './support-email-template-renderer';
import {
  isOwnerConsoleEnabled,
  ownerConsoleUnavailableResponse,
} from '../owner-surface';

export type AdminSupportInboxThread = SupportTicketThread;

export type AdminSupportInboxSummary = {
  counts: {
    open: number;
    urgent: number;
    waiting: number;
  };
  threads: AdminSupportInboxThread[];
};

export type SupportInboxAdminAuth =
  | {
      ok: true;
      adminEmail?: string;
      token: string;
    }
  | {
      ok: false;
      response: Response;
    };

export type AdminReplySendAction = 'escalate' | 'resolve' | 'waiting';

const VALID_SUPPORT_STATUSES: SupportTicketStatus[] = [
  'NEW',
  'ACKNOWLEDGED',
  'IN_REVIEW',
  'WAITING_ON_USER',
  'RESOLVED',
  'ESCALATED',
  'CLOSED',
];
const VALID_SUPPORT_PRIORITIES: SupportTicketPriority[] = [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
];

export function requireSupportInboxAdmin(request: Request): SupportInboxAdminAuth {
  if (!isOwnerConsoleEnabled()) {
    return {
      ok: false,
      response: ownerConsoleUnavailableResponse(),
    };
  }

  const token = request.headers.get('x-pridicta-admin-token')?.trim() ?? '';

  if (!token) {
    return {
      ok: false,
      response: Response.json(
        {
          detail: 'Owner key is required before support inbox data can be opened.',
        },
        { status: 401 },
      ),
    };
  }

  const expected =
    process.env.PREDICTA_SUPPORT_ADMIN_TOKEN?.trim() ||
    process.env.PREDICTA_OWNER_ADMIN_TOKEN?.trim() ||
    process.env.PRIDICTA_ADMIN_TOKEN?.trim();

  if (expected && token !== expected) {
    return {
      ok: false,
      response: Response.json(
        {
          detail: 'Owner key was not accepted for the support inbox.',
        },
        { status: 403 },
      ),
    };
  }

  return {
    adminEmail: request.headers.get('x-pridicta-admin-email')?.trim() || undefined,
    ok: true,
    token,
  };
}

export async function listAdminSupportInboxThreads(
  repository: SupportTicketThreadRepository = getDefaultResendWebhookRepository(),
): Promise<AdminSupportInboxSummary> {
  await ensureSupportInboxPreviewThreads(repository);
  const threads = await repository.listThreads();

  return {
    counts: {
      open: threads.filter(thread => !['RESOLVED', 'CLOSED'].includes(thread.ticket.status))
        .length,
      urgent: threads.filter(thread => thread.ticket.priority === 'URGENT').length,
      waiting: threads.filter(thread => thread.ticket.status === 'WAITING_ON_USER').length,
    },
    threads,
  };
}

export async function getAdminSupportInboxThread(
  ticketId: string,
  repository: SupportTicketThreadRepository = getDefaultResendWebhookRepository(),
): Promise<SupportTicketThread | undefined> {
  await ensureSupportInboxPreviewThreads(repository);

  return repository.getThread(ticketId);
}

export async function updateAdminSupportInboxThread(
  ticketId: string,
  input: {
    assignedTo?: string;
    priority?: SupportTicketPriority;
    status?: SupportTicketStatus;
  },
  repository: SupportTicketThreadRepository = getDefaultResendWebhookRepository(),
): Promise<SupportTicketThread> {
  const actor = {
    displayName: 'Predicta owner',
    role: 'admin' as const,
  };
  let thread = await getAdminSupportInboxThread(ticketId, repository);

  if (!thread) {
    throw new SupportInboxAdminError(`Support ticket not found: ${ticketId}`);
  }

  if (input.status) {
    assertSupportStatus(input.status);
    thread = await repository.updateStatus(thread.ticket.id, {
      actor,
      status: input.status,
    });
  }

  if (input.priority) {
    assertSupportPriority(input.priority);
    thread = await repository.updatePriority(thread.ticket.id, {
      actor,
      priority: input.priority,
    });
  }

  if (Object.prototype.hasOwnProperty.call(input, 'assignedTo')) {
    thread = await repository.assignTicket(thread.ticket.id, {
      actor,
      assignedTo: input.assignedTo?.trim() || undefined,
    });
  }

  return thread;
}

export async function sendAdminSupportReply(
  ticketId: string,
  input: {
    action: AdminReplySendAction;
    body: string;
    env?: NodeJS.ProcessEnv;
    fetchImpl?: ResendFetch;
    templateId: string;
    variables?: Record<string, string>;
  },
  repository: SupportTicketThreadRepository = getDefaultResendWebhookRepository(),
): Promise<{
  deliveryStatus: SupportEmailDeliveryStatus;
  emailConfigured: boolean;
  thread: SupportTicketThread;
}> {
  let thread = await getAdminSupportInboxThread(ticketId, repository);

  if (!thread) {
    throw new SupportInboxAdminError(`Support ticket not found: ${ticketId}`);
  }

  const template = getSupportEmailTemplate(input.templateId);

  if (template.audience !== 'admin') {
    throw new SupportInboxAdminError(
      'Only admin reply templates can be sent from the customer reply composer.',
    );
  }

  const body = input.body.trim();

  if (!body) {
    throw new SupportInboxAdminError('Admin reply body is required before sending.');
  }

  if (/private\s+note/i.test(body)) {
    throw new SupportInboxAdminError(
      'Private notes cannot be sent through the customer reply composer.',
    );
  }

  const variables = buildTemplateVariablesForThread(thread, {
    ...input.variables,
    resolutionSummary: input.variables?.resolutionSummary || body,
  });
  const rendered = renderSupportEmailTemplate({
    templateId: template.id,
    variables,
  });
  thread = await repository.appendMessage(thread.ticket.id, {
    actor: {
      displayName: 'Predicta Support',
      email: process.env.PREDICTA_SUPPORT_FROM_EMAIL ?? 'care@predicta.rudraix.com',
      role: 'admin',
    },
    body,
    kind: 'admin_outbound',
    templateId: template.id,
  });

  const config = resolveResendOutboundConfig(input.env);
  let deliveryStatus: SupportEmailDeliveryStatus = 'failed';

  if (config && thread.ticket.customerEmail) {
    const result = await sendResendEmail(
      config,
      {
        from: config.from,
        headers: {
          'X-Predicta-Template': template.id,
          'X-Predicta-Ticket': thread.ticket.ticketNumber,
        },
        html: renderAdminEditedReplyHtml({
          body,
          previewText: rendered.previewText,
          title: rendered.subject,
        }),
        replyTo: [config.replyTo],
        subject: rendered.subject,
        tags: [
          { name: 'predicta_ticket', value: thread.ticket.ticketNumber },
          { name: 'predicta_template', value: template.id },
        ],
        text: body,
        to: [thread.ticket.customerEmail],
      },
      input.fetchImpl,
    );
    const event = createEmailDeliveryEvent({
      recipient: thread.ticket.customerEmail,
      result,
      templateId: template.id,
      ticketNumber: thread.ticket.ticketNumber,
    });
    deliveryStatus = event.status;
    thread = await repository.recordDeliveryEvent(thread.ticket.id, {
      attemptedAt: event.attemptedAt,
      error: event.error,
      messageId: thread.messages.at(-1)?.id,
      provider: event.provider,
      providerMessageId: event.providerMessageId,
      recipient: event.recipient,
      status: event.status,
      statusCode: event.statusCode,
      templateId: event.templateId,
    });
  } else {
    thread = await repository.recordDeliveryEvent(thread.ticket.id, {
      attemptedAt: new Date().toISOString(),
      error: config ? 'Customer email is missing.' : 'Resend is not configured.',
      messageId: thread.messages.at(-1)?.id,
      provider: 'resend',
      recipient: thread.ticket.customerEmail ?? 'missing-customer-email',
      status: 'failed',
      statusCode: 0,
      templateId: template.id,
    });
  }

  thread = await repository.updateStatus(thread.ticket.id, {
    actor: {
      displayName: 'Predicta Support',
      role: 'admin',
    },
    status: mapReplyActionToStatus(input.action),
  });

  return {
    deliveryStatus,
    emailConfigured: Boolean(config),
    thread,
  };
}

export class SupportInboxAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupportInboxAdminError';
  }
}

function assertSupportStatus(status: SupportTicketStatus): void {
  if (!VALID_SUPPORT_STATUSES.includes(status)) {
    throw new SupportInboxAdminError(`Invalid support status: ${status}`);
  }
}

function assertSupportPriority(priority: SupportTicketPriority): void {
  if (!VALID_SUPPORT_PRIORITIES.includes(priority)) {
    throw new SupportInboxAdminError(`Invalid support priority: ${priority}`);
  }
}

function mapReplyActionToStatus(action: AdminReplySendAction): SupportTicketStatus {
  switch (action) {
    case 'escalate':
      return 'ESCALATED';
    case 'resolve':
      return 'RESOLVED';
    case 'waiting':
      return 'WAITING_ON_USER';
  }
}

function renderAdminEditedReplyHtml(input: {
  body: string;
  previewText: string;
  title: string;
}): string {
  return [
    '<!doctype html>',
    '<html>',
    '<body style="margin:0;background:#f6f5f0;color:#151925;font-family:Georgia,serif;">',
    `<span style="display:none;opacity:0;overflow:hidden;">${escapeHtml(input.previewText)}</span>`,
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f5f0;padding:28px 12px;">',
    '<tr><td align="center">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border-radius:28px;overflow:hidden;background:#fffdf7;border:1px solid #d8c28a;">',
    '<tr><td style="background:#151925;color:#ffffff;padding:28px 30px;">',
    '<div style="letter-spacing:0.22em;text-transform:uppercase;color:#7ddfc9;font-size:12px;">Predicta</div>',
    `<h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;">${escapeHtml(input.title)}</h1>`,
    '</td></tr>',
    `<tr><td style="padding:30px;font-size:16px;line-height:1.65;">${escapeHtml(input.body).replace(/\n/g, '<br>')}</td></tr>`,
    '<tr><td style="border-top:1px solid #e4d6b1;padding:20px 30px;color:#536070;font-size:13px;line-height:1.55;">Predicta support uses this message only to help with your request.<br>Prepared by Predicta.</td></tr>',
    '</table>',
    '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function ensureSupportInboxPreviewThreads(
  repository: SupportTicketThreadRepository,
): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const existing = await repository.listThreads();

  if (existing.length) {
    return;
  }

  const first = await repository.createThread({
    actor: {
      displayName: 'Bhaumik Mehta',
      email: 'bhaumik@example.invalid',
      role: 'customer',
      userId: 'preview-user-1',
    },
    category: 'report',
    customerEmail: 'bhaumik@example.invalid',
    customerName: 'Bhaumik Mehta',
    initialMessage:
      'My Life Atlas report downloaded, but it does not feel personal enough. Please review the latest version.',
    language: 'en',
    now: '2026-06-02T08:10:00.000Z',
    priority: 'HIGH',
    related: {
      reportType: 'life_atlas',
    },
    route: '/dashboard/report',
    sourceSurface: 'web-report',
    subject: 'Life Atlas report needs review',
    ticketNumber: 'PRD-20260602-0007',
    userId: 'preview-user-1',
  });
  await repository.appendMessage(first.ticket.id, {
    actor: {
      displayName: 'Predicta Support',
      email: 'care@predicta.rudraix.com',
      role: 'system',
    },
    body: 'Auto-reply sent to customer. Admin should verify report type, account email, and latest generated PDF before replying.',
    kind: 'system_auto_reply',
    now: '2026-06-02T08:10:03.000Z',
    templateId: 'support.customer.auto_reply.received.v1',
  });
  await repository.appendMessage(first.ticket.id, {
    actor: {
      displayName: 'Owner review',
      role: 'admin',
    },
    body: 'Private note: check whether this came after the final report rebuild gate. Do not mention internal phase names to the customer.',
    kind: 'internal_private_note',
    now: '2026-06-02T08:16:00.000Z',
  });
  await repository.recordDeliveryEvent(first.ticket.id, {
    attemptedAt: '2026-06-02T08:10:05.000Z',
    messageId: first.messages[0].id,
    provider: 'resend',
    providerMessageId: 'resend-preview-1',
    recipient: 'bhaumik@example.invalid',
    status: 'delivered',
    statusCode: 200,
    templateId: 'support.customer.auto_reply.received.v1',
  });

  const second = await repository.createThread({
    actor: {
      displayName: 'Priya Shah',
      email: 'priya@example.invalid',
      role: 'customer',
      userId: 'preview-user-2',
    },
    category: 'billing',
    customerEmail: 'priya@example.invalid',
    customerName: 'Priya Shah',
    initialMessage:
      'I tried to buy a premium report pack and need help confirming whether the payment completed.',
    language: 'en',
    now: '2026-06-02T07:45:00.000Z',
    priority: 'URGENT',
    route: '/checkout',
    sourceSurface: 'web-checkout',
    subject: 'Payment confirmation needed',
    ticketNumber: 'PRD-20260602-0008',
    userId: 'preview-user-2',
  });
  await repository.updateStatus(second.ticket.id, {
    actor: { role: 'admin' },
    now: '2026-06-02T07:50:00.000Z',
    status: 'IN_REVIEW',
  });

  const third = await repository.createThread({
    actor: {
      displayName: 'Arjun Patel',
      email: 'arjun@example.invalid',
      role: 'customer',
      userId: 'preview-user-3',
    },
    category: 'signature',
    customerEmail: 'arjun@example.invalid',
    customerName: 'Arjun Patel',
    initialMessage:
      'I uploaded my signature and want to know whether Predicta stores the image after the session.',
    language: 'en',
    now: '2026-06-02T06:20:00.000Z',
    priority: 'NORMAL',
    route: '/dashboard/signature',
    sourceSurface: 'web-signature',
    subject: 'Signature privacy question',
    ticketNumber: 'PRD-20260602-0009',
    userId: 'preview-user-3',
  });
  await repository.updateStatus(third.ticket.id, {
    actor: { role: 'admin' },
    now: '2026-06-02T06:30:00.000Z',
    status: 'WAITING_ON_USER',
  });
}
