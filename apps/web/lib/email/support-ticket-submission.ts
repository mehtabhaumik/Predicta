import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketThread,
} from '@pridicta/types';

import {
  getDefaultResendWebhookRepository,
} from './resend-webhook';
import {
  SUPPORT_CUSTOMER_AUTO_REPLY_TEMPLATE_ID,
  renderCustomerAutoReplyTemplate,
  type PersistedSupportTicketForEmail,
} from './support-email-templates';
import {
  sendSupportOutboundNotifications,
  type SupportOutboundNotificationResult,
} from './support-outbound-notifications';
import {
  type SupportTicketThreadRepository,
} from './support-ticket-thread';
import type { ResendFetch } from './resend-outbound';

export type SubmitSupportTicketInput = {
  category?: string;
  customerEmail?: string;
  customerName?: string;
  language?: string;
  message: string;
  priority?: string;
  related?: {
    kundliId?: string;
    purchaseId?: string;
    reportId?: string;
    reportType?: string;
  };
  route?: string;
  sourceSurface?: string;
  subject: string;
  userId?: string;
};

export type SubmitSupportTicketOptions = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: ResendFetch;
  now?: Date;
  repository?: SupportTicketThreadRepository;
};

export type SubmitSupportTicketResult = {
  notifications: SupportOutboundNotificationResult;
  thread: SupportTicketThread;
};

const SUPPORT_CATEGORIES: SupportTicketCategory[] = [
  'account',
  'billing',
  'bug-report',
  'complaint',
  'feature-request',
  'feedback',
  'general-contact',
  'kundli',
  'premium-access',
  'question',
  'refund',
  'report',
  'safety-concern',
  'signature',
];

const SUPPORT_PRIORITIES: SupportTicketPriority[] = [
  'HIGH',
  'LOW',
  'NORMAL',
  'URGENT',
];

export async function submitSupportTicket(
  input: SubmitSupportTicketInput,
  options: SubmitSupportTicketOptions = {},
): Promise<SubmitSupportTicketResult> {
  const repository = options.repository ?? getDefaultResendWebhookRepository();
  const now = options.now ?? new Date();
  const nowIso = now.toISOString();
  const subject = normalizeRequiredText(input.subject, 'Support subject');
  const message = normalizeRequiredText(input.message, 'Support message');
  const category = normalizeSupportCategory(input.category);
  const priority = normalizeSupportPriority(input.priority);
  const ticketNumber = createSupportTicketNumber(now, input);
  let thread = await repository.createThread({
    actor: {
      displayName: normalizeOptionalText(input.customerName),
      email: normalizeOptionalText(input.customerEmail),
      role: 'customer',
      userId: normalizeOptionalText(input.userId),
    },
    category,
    customerEmail: normalizeOptionalText(input.customerEmail),
    customerName: normalizeOptionalText(input.customerName),
    initialMessage: message,
    language: normalizeOptionalText(input.language) ?? 'en',
    now: nowIso,
    priority,
    related: input.related,
    route: normalizeOptionalText(input.route),
    sourceSurface: normalizeOptionalText(input.sourceSurface),
    subject,
    ticketNumber,
    userId: normalizeOptionalText(input.userId),
  });
  let customerAutoReplyMessageId: string | undefined;

  if (thread.ticket.customerEmail) {
    const renderedAutoReply = renderCustomerAutoReplyTemplate(
      toPersistedTicketForEmail(thread, message),
    );
    thread = await repository.appendMessage(thread.ticket.id, {
      actor: {
        displayName: 'Predicta Support',
        email: 'care@predicta.rudraix.com',
        role: 'system',
      },
      body: renderedAutoReply.text,
      kind: 'system_auto_reply',
      now: new Date(now.getTime() + 1000).toISOString(),
      templateId: SUPPORT_CUSTOMER_AUTO_REPLY_TEMPLATE_ID,
    });
    customerAutoReplyMessageId = thread.messages.at(-1)?.id;
  }

  const notifications = await sendSupportOutboundNotifications(
    toPersistedTicketForEmail(thread, message),
    {
      env: options.env,
      fetchImpl: options.fetchImpl,
      recordDeliveryEvent: async event => {
        thread = await repository.recordDeliveryEvent(thread.ticket.id, {
          attemptedAt: event.attemptedAt,
          error: event.error,
          messageId:
            event.templateId === SUPPORT_CUSTOMER_AUTO_REPLY_TEMPLATE_ID
              ? customerAutoReplyMessageId
              : undefined,
          provider: event.provider,
          providerMessageId: event.providerMessageId,
          recipient: event.recipient,
          status: event.status,
          statusCode: event.statusCode,
          templateId: event.templateId,
        });
      },
    },
  );

  return {
    notifications,
    thread,
  };
}

function toPersistedTicketForEmail(
  thread: SupportTicketThread,
  message: string,
): PersistedSupportTicketForEmail {
  return {
    category: thread.ticket.category,
    createdAt: thread.ticket.createdAt,
    customerEmail: thread.ticket.customerEmail,
    customerName: thread.ticket.customerName,
    language: thread.ticket.language,
    message,
    priority: thread.ticket.priority,
    sourceRoute: thread.ticket.route,
    status: thread.ticket.status,
    subject: thread.ticket.subject,
    ticketNumber: thread.ticket.ticketNumber,
  };
}

function normalizeRequiredText(value: string, label: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();

  if (!normalized) {
    throw new SupportTicketSubmissionError(`${label} is required.`);
  }

  return normalized;
}

function normalizeOptionalText(value?: string): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim();

  return normalized || undefined;
}

function normalizeSupportCategory(value?: string): SupportTicketCategory {
  const normalized = value?.trim() as SupportTicketCategory | undefined;

  return normalized && SUPPORT_CATEGORIES.includes(normalized)
    ? normalized
    : 'general-contact';
}

function normalizeSupportPriority(value?: string): SupportTicketPriority {
  const normalized = value?.trim().toUpperCase() as SupportTicketPriority | undefined;

  return normalized && SUPPORT_PRIORITIES.includes(normalized)
    ? normalized
    : 'NORMAL';
}

function createSupportTicketNumber(
  now: Date,
  input: SubmitSupportTicketInput,
): string {
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const entropy = [
    input.customerEmail,
    input.subject,
    input.message,
    now.toISOString(),
  ].join('|');
  const encoded = Buffer.from(entropy).toString('base64url').slice(0, 6).toUpperCase();

  return `PRD-${datePart}-${encoded}`;
}

export class SupportTicketSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupportTicketSubmissionError';
  }
}
