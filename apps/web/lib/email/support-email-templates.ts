import type { ResendOutboundConfig, ResendEmailPayload } from './resend-outbound';
import {
  renderSupportEmailTemplate,
  type RenderedSupportTemplate,
} from './support-email-template-renderer';

export const SUPPORT_CUSTOMER_AUTO_REPLY_TEMPLATE_ID =
  'support.customer.auto_reply.received.v1';
export const SUPPORT_ADMIN_NOTIFICATION_TEMPLATE_ID =
  'support.admin.notification.received.v1';

export type PersistedSupportTicketForEmail = {
  category: string;
  createdAt: string;
  customerEmail?: string;
  customerName?: string;
  language?: string;
  message: string;
  priority: string;
  sourceRoute?: string;
  status: string;
  subject: string;
  ticketNumber: string;
};

export function renderCustomerAutoReplyTemplate(
  ticket: PersistedSupportTicketForEmail,
): RenderedSupportTemplate {
  return renderSupportEmailTemplate({
    templateId: SUPPORT_CUSTOMER_AUTO_REPLY_TEMPLATE_ID,
    variables: buildPersistedTicketTemplateVariables(ticket),
  });
}

export function renderAdminNotificationTemplate(
  ticket: PersistedSupportTicketForEmail,
): RenderedSupportTemplate {
  return renderSupportEmailTemplate({
    templateId: SUPPORT_ADMIN_NOTIFICATION_TEMPLATE_ID,
    variables: {
      ...buildPersistedTicketTemplateVariables(ticket),
      requestedDetails: 'missing support details',
      resolutionSummary: ticket.message,
    },
  });
}

export function createCustomerAutoReplyEmail(
  config: ResendOutboundConfig,
  ticket: PersistedSupportTicketForEmail,
): ResendEmailPayload | undefined {
  if (!ticket.customerEmail) {
    return undefined;
  }

  const rendered = renderCustomerAutoReplyTemplate(ticket);

  return createTemplateEmailPayload({
    config,
    rendered,
    replyTo: [config.replyTo],
    ticket,
    to: [ticket.customerEmail],
  });
}

export function createAdminNotificationEmail(
  config: ResendOutboundConfig,
  ticket: PersistedSupportTicketForEmail,
): ResendEmailPayload {
  const rendered = renderAdminNotificationTemplate(ticket);

  return createTemplateEmailPayload({
    config,
    rendered,
    replyTo: ticket.customerEmail ? [ticket.customerEmail] : [config.replyTo],
    ticket,
    to: [config.adminInbox],
  });
}

function createTemplateEmailPayload(input: {
  config: ResendOutboundConfig;
  rendered: RenderedSupportTemplate;
  replyTo: string[];
  ticket: PersistedSupportTicketForEmail;
  to: string[];
}): ResendEmailPayload {
  return {
    from: input.config.from,
    headers: {
      'X-Predicta-Template': input.rendered.templateId,
      'X-Predicta-Ticket': input.ticket.ticketNumber,
    },
    html: input.rendered.html,
    replyTo: input.replyTo,
    subject: input.rendered.subject,
    tags: [
      { name: 'predicta_ticket', value: input.ticket.ticketNumber },
      { name: 'predicta_template', value: input.rendered.templateId },
    ],
    text: input.rendered.text,
    to: input.to,
  };
}

function buildPersistedTicketTemplateVariables(
  ticket: PersistedSupportTicketForEmail,
): Record<string, string> {
  return {
    appUrl: 'https://predicta.rudraix.com',
    category: sentenceCase(ticket.category),
    createdAt: ticket.createdAt,
    customerEmail: ticket.customerEmail ?? 'not shared',
    customerName: ticket.customerName?.trim() || 'there',
    priority: ticket.priority.toUpperCase(),
    reportType: 'Predicta report',
    resolutionSummary: ticket.message,
    status: ticket.status,
    supportEmail: 'care@predicta.rudraix.com',
    ticketSubject: ticket.subject,
    ticketNumber: ticket.ticketNumber,
  };
}

function sentenceCase(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, char => char.toUpperCase());
}
