import type {
  CustomerVisibleSupportTicketMessage,
  SupportEmailDeliveryEvent,
  SupportTicketActor,
  SupportTicketAuditEvent,
  SupportTicketCategory,
  SupportTicketMessage,
  SupportTicketPriority,
  SupportTicketRecord,
  SupportTicketStatus,
  SupportTicketThread,
} from '@pridicta/types';

export type CreateSupportTicketThreadInput = {
  actor?: SupportTicketActor;
  category: SupportTicketCategory;
  customerEmail?: string;
  customerName?: string;
  id?: string;
  initialMessage: string;
  language?: string;
  now?: string;
  priority?: SupportTicketPriority;
  related?: SupportTicketRecord['related'];
  route?: string;
  sourceSurface?: string;
  subject: string;
  ticketNumber: string;
  userId?: string;
};

export type AddSupportTicketMessageInput = {
  actor: SupportTicketActor;
  body: string;
  id?: string;
  kind: SupportTicketMessage['kind'];
  now?: string;
  templateId?: string;
};

export class SupportTicketThreadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupportTicketThreadError';
  }
}

export function createSupportTicketThread(
  input: CreateSupportTicketThreadInput,
): SupportTicketThread {
  const now = input.now ?? new Date().toISOString();
  const ticketId = input.id ?? createStableId('support-ticket', input.ticketNumber);
  const actor =
    input.actor ??
    ({
      displayName: input.customerName,
      email: input.customerEmail,
      role: 'customer',
      userId: input.userId,
    } satisfies SupportTicketActor);
  const ticket: SupportTicketRecord = {
    category: input.category,
    createdAt: now,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    id: ticketId,
    language: input.language,
    latestCustomerReplyAt: now,
    latestMessagePreview: preview(input.initialMessage),
    priority: input.priority ?? 'NORMAL',
    related: input.related,
    route: input.route,
    sourceSurface: input.sourceSurface,
    status: 'NEW',
    subject: input.subject,
    ticketNumber: input.ticketNumber,
    updatedAt: now,
    userId: input.userId,
  };
  const message: SupportTicketMessage = {
    body: input.initialMessage,
    createdAt: now,
    id: createStableId('support-message', `${input.ticketNumber}-initial`),
    kind: 'customer_inbound',
    sender: actor,
    ticketId,
    ticketNumber: input.ticketNumber,
    visibility: 'customer_visible',
  };

  return {
    auditEvents: [
      createAuditEvent({
        actor,
        at: now,
        kind: 'ticket_created',
        ticket,
      }),
      createAuditEvent({
        actor,
        at: now,
        kind: 'message_added',
        messageId: message.id,
        ticket,
      }),
    ],
    deliveryEvents: [],
    messages: [message],
    ticket,
  };
}

export function addSupportTicketMessage(
  thread: SupportTicketThread,
  input: AddSupportTicketMessageInput,
): SupportTicketThread {
  const now = input.now ?? new Date().toISOString();
  const message = buildSupportTicketMessage(thread.ticket, input, now);
  const updatedTicket = updateTicketForMessage(thread.ticket, message, now);

  return {
    ...thread,
    auditEvents: [
      ...thread.auditEvents,
      createAuditEvent({
        actor: input.actor,
        at: now,
        kind: 'message_added',
        messageId: message.id,
        ticket: updatedTicket,
      }),
    ],
    messages: [...thread.messages, message],
    ticket: updatedTicket,
  };
}

export function updateSupportTicketStatus(
  thread: SupportTicketThread,
  input: {
    actor: SupportTicketActor;
    now?: string;
    status: SupportTicketStatus;
  },
): SupportTicketThread {
  const now = input.now ?? new Date().toISOString();
  const previous = thread.ticket.status;
  const ticket = {
    ...thread.ticket,
    status: input.status,
    updatedAt: now,
  };

  return {
    ...thread,
    auditEvents: [
      ...thread.auditEvents,
      createAuditEvent({
        actor: input.actor,
        at: now,
        from: previous,
        kind: 'status_changed',
        ticket,
        to: input.status,
      }),
    ],
    ticket,
  };
}

export function updateSupportTicketPriority(
  thread: SupportTicketThread,
  input: {
    actor: SupportTicketActor;
    now?: string;
    priority: SupportTicketPriority;
  },
): SupportTicketThread {
  const now = input.now ?? new Date().toISOString();
  const previous = thread.ticket.priority;
  const ticket = {
    ...thread.ticket,
    priority: input.priority,
    updatedAt: now,
  };

  return {
    ...thread,
    auditEvents: [
      ...thread.auditEvents,
      createAuditEvent({
        actor: input.actor,
        at: now,
        from: previous,
        kind: 'priority_changed',
        ticket,
        to: input.priority,
      }),
    ],
    ticket,
  };
}

export function assignSupportTicket(
  thread: SupportTicketThread,
  input: {
    actor: SupportTicketActor;
    assignedTo?: string;
    now?: string;
  },
): SupportTicketThread {
  const now = input.now ?? new Date().toISOString();
  const previous = thread.ticket.assignedTo;
  const ticket = {
    ...thread.ticket,
    assignedTo: input.assignedTo,
    updatedAt: now,
  };

  return {
    ...thread,
    auditEvents: [
      ...thread.auditEvents,
      createAuditEvent({
        actor: input.actor,
        at: now,
        from: previous,
        kind: 'assignment_changed',
        ticket,
        to: input.assignedTo,
      }),
    ],
    ticket,
  };
}

export function recordSupportEmailDeliveryEvent(
  thread: SupportTicketThread,
  input: Omit<SupportEmailDeliveryEvent, 'id' | 'ticketId' | 'ticketNumber'> & {
    id?: string;
  },
): SupportTicketThread {
  const event: SupportEmailDeliveryEvent = {
    ...input,
    id:
      input.id ??
      createStableId(
        'support-delivery',
        `${thread.ticket.ticketNumber}-${input.templateId}-${input.recipient}-${input.attemptedAt}`,
      ),
    ticketId: thread.ticket.id,
    ticketNumber: thread.ticket.ticketNumber,
  };

  return {
    ...thread,
    auditEvents: [
      ...thread.auditEvents,
      createAuditEvent({
        actor: { role: 'system' },
        at: event.attemptedAt,
        kind: 'delivery_recorded',
        messageId: event.messageId,
        ticket: thread.ticket,
        to: event.status,
      }),
    ],
    deliveryEvents: [...thread.deliveryEvents, event],
  };
}

export function assertCustomerDeliverableMessage(
  message: SupportTicketMessage,
): CustomerVisibleSupportTicketMessage {
  if (message.visibility !== 'customer_visible') {
    throw new SupportTicketThreadError(
      'Internal private notes cannot be sent as customer-visible email.',
    );
  }

  return message;
}

export function getCustomerVisibleSupportMessages(
  thread: SupportTicketThread,
): CustomerVisibleSupportTicketMessage[] {
  return thread.messages.filter(
    (message): message is CustomerVisibleSupportTicketMessage =>
      message.visibility === 'customer_visible',
  );
}

export interface SupportTicketThreadRepository {
  assignTicket(
    ticketId: string,
    input: { actor: SupportTicketActor; assignedTo?: string; now?: string },
  ): Promise<SupportTicketThread>;
  appendMessage(
    ticketId: string,
    input: AddSupportTicketMessageInput,
  ): Promise<SupportTicketThread>;
  createThread(input: CreateSupportTicketThreadInput): Promise<SupportTicketThread>;
  findThreadByTicketNumber(
    ticketNumber: string,
  ): Promise<SupportTicketThread | undefined>;
  getThread(ticketId: string): Promise<SupportTicketThread | undefined>;
  listThreads(): Promise<SupportTicketThread[]>;
  recordDeliveryEvent(
    ticketId: string,
    event: Omit<SupportEmailDeliveryEvent, 'id' | 'ticketId' | 'ticketNumber'> & {
      id?: string;
    },
  ): Promise<SupportTicketThread>;
  saveThread(thread: SupportTicketThread): Promise<SupportTicketThread>;
  updateStatus(
    ticketId: string,
    input: { actor: SupportTicketActor; now?: string; status: SupportTicketStatus },
  ): Promise<SupportTicketThread>;
  updatePriority(
    ticketId: string,
    input: {
      actor: SupportTicketActor;
      now?: string;
      priority: SupportTicketPriority;
    },
  ): Promise<SupportTicketThread>;
}

export class InMemorySupportTicketThreadRepository
  implements SupportTicketThreadRepository
{
  private readonly threads = new Map<string, SupportTicketThread>();

  async assignTicket(
    ticketId: string,
    input: { actor: SupportTicketActor; assignedTo?: string; now?: string },
  ): Promise<SupportTicketThread> {
    return this.saveExisting(ticketId, thread =>
      assignSupportTicket(thread, input),
    );
  }

  async appendMessage(
    ticketId: string,
    input: AddSupportTicketMessageInput,
  ): Promise<SupportTicketThread> {
    return this.saveExisting(ticketId, thread =>
      addSupportTicketMessage(thread, input),
    );
  }

  async createThread(
    input: CreateSupportTicketThreadInput,
  ): Promise<SupportTicketThread> {
    const thread = createSupportTicketThread(input);
    this.threads.set(thread.ticket.id, thread);

    return thread;
  }

  async findThreadByTicketNumber(
    ticketNumber: string,
  ): Promise<SupportTicketThread | undefined> {
    const normalizedTicketNumber = ticketNumber.trim().toUpperCase();

    for (const thread of this.threads.values()) {
      if (thread.ticket.ticketNumber.toUpperCase() === normalizedTicketNumber) {
        return thread;
      }
    }

    return undefined;
  }

  async getThread(ticketId: string): Promise<SupportTicketThread | undefined> {
    return this.threads.get(ticketId);
  }

  async listThreads(): Promise<SupportTicketThread[]> {
    return Array.from(this.threads.values()).sort((left, right) =>
      right.ticket.updatedAt.localeCompare(left.ticket.updatedAt),
    );
  }

  async recordDeliveryEvent(
    ticketId: string,
    event: Omit<SupportEmailDeliveryEvent, 'id' | 'ticketId' | 'ticketNumber'> & {
      id?: string;
    },
  ): Promise<SupportTicketThread> {
    return this.saveExisting(ticketId, thread =>
      recordSupportEmailDeliveryEvent(thread, event),
    );
  }

  async saveThread(thread: SupportTicketThread): Promise<SupportTicketThread> {
    this.threads.set(thread.ticket.id, thread);

    return thread;
  }

  async updateStatus(
    ticketId: string,
    input: { actor: SupportTicketActor; now?: string; status: SupportTicketStatus },
  ): Promise<SupportTicketThread> {
    return this.saveExisting(ticketId, thread =>
      updateSupportTicketStatus(thread, input),
    );
  }

  async updatePriority(
    ticketId: string,
    input: {
      actor: SupportTicketActor;
      now?: string;
      priority: SupportTicketPriority;
    },
  ): Promise<SupportTicketThread> {
    return this.saveExisting(ticketId, thread =>
      updateSupportTicketPriority(thread, input),
    );
  }

  private async saveExisting(
    ticketId: string,
    update: (thread: SupportTicketThread) => SupportTicketThread,
  ): Promise<SupportTicketThread> {
    const thread = this.threads.get(ticketId);

    if (!thread) {
      throw new SupportTicketThreadError(`Support ticket thread not found: ${ticketId}`);
    }

    const updated = update(thread);
    this.threads.set(ticketId, updated);

    return updated;
  }
}

function buildSupportTicketMessage(
  ticket: SupportTicketRecord,
  input: AddSupportTicketMessageInput,
  now: string,
): SupportTicketMessage {
  const base = {
    body: input.body,
    createdAt: now,
    id:
      input.id ??
      createStableId(
        'support-message',
        `${ticket.ticketNumber}-${input.kind}-${now}-${input.body}`,
      ),
    sender: input.actor,
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
  };

  switch (input.kind) {
    case 'customer_inbound':
      return {
        ...base,
        kind: input.kind,
        visibility: 'customer_visible',
      };
    case 'admin_outbound':
      return {
        ...base,
        deliveryEligible: true,
        kind: input.kind,
        templateId: input.templateId,
        visibility: 'customer_visible',
      };
    case 'system_auto_reply':
      if (!input.templateId) {
        throw new SupportTicketThreadError(
          'System auto-reply messages must include a templateId.',
        );
      }

      return {
        ...base,
        deliveryEligible: true,
        kind: input.kind,
        templateId: input.templateId,
        visibility: 'customer_visible',
      };
    case 'internal_private_note':
      return {
        ...base,
        deliveryEligible: false,
        kind: input.kind,
        visibility: 'internal_only',
      };
  }
}

function updateTicketForMessage(
  ticket: SupportTicketRecord,
  message: SupportTicketMessage,
  now: string,
): SupportTicketRecord {
  return {
    ...ticket,
    latestAdminReplyAt:
      message.kind === 'admin_outbound' ? now : ticket.latestAdminReplyAt,
    latestCustomerReplyAt:
      message.kind === 'customer_inbound' ? now : ticket.latestCustomerReplyAt,
    latestMessagePreview:
      message.visibility === 'customer_visible'
        ? preview(message.body)
        : ticket.latestMessagePreview,
    updatedAt: now,
  };
}

function createAuditEvent(input: {
  actor: SupportTicketActor;
  at: string;
  from?: string;
  kind: SupportTicketAuditEvent['kind'];
  messageId?: string;
  ticket: SupportTicketRecord;
  to?: string;
}): SupportTicketAuditEvent {
  return {
    actor: input.actor,
    at: input.at,
    from: input.from,
    id: createStableId(
      'support-audit',
      `${input.ticket.ticketNumber}-${input.kind}-${input.messageId ?? ''}-${input.at}-${input.to ?? ''}`,
    ),
    kind: input.kind,
    messageId: input.messageId,
    ticketId: input.ticket.id,
    ticketNumber: input.ticket.ticketNumber,
    to: input.to,
  };
}

function createStableId(prefix: string, value: string): string {
  return `${prefix}-${Buffer.from(value).toString('base64url').slice(0, 24)}`;
}

function preview(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized.length > 140 ? `${normalized.slice(0, 137)}...` : normalized;
}
