import type {
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketThread,
} from '@pridicta/types';

import {
  getDefaultResendWebhookRepository,
} from './resend-webhook';
import {
  type SupportTicketThreadRepository,
} from './support-ticket-thread';
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
