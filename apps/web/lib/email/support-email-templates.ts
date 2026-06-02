import type { ResendOutboundConfig, ResendEmailPayload } from './resend-outbound';

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

type RenderedSupportTemplate = {
  html: string;
  previewText: string;
  subject: string;
  templateId: string;
  text: string;
};

export function renderCustomerAutoReplyTemplate(
  ticket: PersistedSupportTicketForEmail,
): RenderedSupportTemplate {
  const name = ticket.customerName?.trim() || 'there';
  const categoryLine = sentenceCase(ticket.category);
  const subject = `We received your Predicta request ${ticket.ticketNumber}`;
  const previewText =
    'Predicta has received your message and will review the details carefully.';
  const text = [
    `Hi ${name},`,
    '',
    'We have received your message and the Predicta team will review it carefully.',
    '',
    `Reference: ${ticket.ticketNumber}`,
    `Topic: ${categoryLine}`,
    `Submitted: ${ticket.createdAt}`,
    '',
    'What happens next:',
    '- We review your request and the context you shared.',
    '- If anything is missing, we will ask clearly.',
    '- If this is about payment, report access, Kundli, or account help, we will prioritize the next practical step.',
    '',
    'Thank you for trusting Predicta.',
    '',
    'Privacy note: Predicta support uses your message only to help with your request.',
  ].join('\n');

  return {
    html: wrapCustomerEmailHtml({
      body: [
        `<p>Hi ${escapeHtml(name)},</p>`,
        '<p>We have received your message and the Predicta team will review it carefully.</p>',
        renderContextBlock([
          ['Reference', ticket.ticketNumber],
          ['Topic', categoryLine],
          ['Submitted', ticket.createdAt],
        ]),
        '<h2>What happens next</h2>',
        '<ul><li>We review your request and the context you shared.</li><li>If anything is missing, we will ask clearly.</li><li>If this is about payment, report access, Kundli, or account help, we will prioritize the next practical step.</li></ul>',
        '<p>Thank you for trusting Predicta.</p>',
      ].join(''),
      previewText,
      title: 'We received your message',
    }),
    previewText,
    subject,
    templateId: SUPPORT_CUSTOMER_AUTO_REPLY_TEMPLATE_ID,
    text,
  };
}

export function renderAdminNotificationTemplate(
  ticket: PersistedSupportTicketForEmail,
): RenderedSupportTemplate {
  const subject = `[${ticket.priority.toUpperCase()}] ${ticket.ticketNumber} - ${ticket.subject}`;
  const previewText = `New Predicta support request from ${ticket.customerEmail || 'unknown customer'}.`;
  const text = [
    `Ticket: ${ticket.ticketNumber}`,
    `Priority: ${ticket.priority}`,
    `Status: ${ticket.status}`,
    `Category: ${ticket.category}`,
    `Customer: ${ticket.customerName || 'Not shared'} <${ticket.customerEmail || 'not shared'}>`,
    `Route: ${ticket.sourceRoute || 'not shared'}`,
    `Language: ${ticket.language || 'not shared'}`,
    `Created: ${ticket.createdAt}`,
    '',
    'Subject:',
    ticket.subject,
    '',
    'Message:',
    ticket.message,
    '',
    'Recommended action: Open the Predicta admin inbox, verify context, and reply using the matching template.',
  ].join('\n');

  return {
    html: wrapAdminEmailHtml({
      body: [
        renderContextBlock([
          ['Ticket', ticket.ticketNumber],
          ['Priority', ticket.priority],
          ['Status', ticket.status],
          ['Category', ticket.category],
          [
            'Customer',
            `${ticket.customerName || 'Not shared'} <${ticket.customerEmail || 'not shared'}>`,
          ],
          ['Route', ticket.sourceRoute || 'not shared'],
          ['Language', ticket.language || 'not shared'],
          ['Created', ticket.createdAt],
        ]),
        `<h2>${escapeHtml(ticket.subject)}</h2>`,
        `<p>${escapeHtml(ticket.message)}</p>`,
        '<p><strong>Recommended action:</strong> Open the Predicta admin inbox, verify context, and reply using the matching template.</p>',
      ].join(''),
      previewText,
      title: 'New Predicta support request',
    }),
    previewText,
    subject,
    templateId: SUPPORT_ADMIN_NOTIFICATION_TEMPLATE_ID,
    text,
  };
}

export function createCustomerAutoReplyEmail(
  config: ResendOutboundConfig,
  ticket: PersistedSupportTicketForEmail,
): ResendEmailPayload | undefined {
  if (!ticket.customerEmail) {
    return undefined;
  }

  const rendered = renderCustomerAutoReplyTemplate(ticket);

  return {
    from: config.from,
    headers: {
      'X-Predicta-Template': rendered.templateId,
      'X-Predicta-Ticket': ticket.ticketNumber,
    },
    html: rendered.html,
    replyTo: [config.replyTo],
    subject: rendered.subject,
    tags: [
      { name: 'predicta_ticket', value: ticket.ticketNumber },
      { name: 'predicta_template', value: rendered.templateId },
    ],
    text: rendered.text,
    to: [ticket.customerEmail],
  };
}

export function createAdminNotificationEmail(
  config: ResendOutboundConfig,
  ticket: PersistedSupportTicketForEmail,
): ResendEmailPayload {
  const rendered = renderAdminNotificationTemplate(ticket);

  return {
    from: config.from,
    headers: {
      'X-Predicta-Template': rendered.templateId,
      'X-Predicta-Ticket': ticket.ticketNumber,
    },
    html: rendered.html,
    replyTo: ticket.customerEmail ? [ticket.customerEmail] : [config.replyTo],
    subject: rendered.subject,
    tags: [
      { name: 'predicta_ticket', value: ticket.ticketNumber },
      { name: 'predicta_template', value: rendered.templateId },
    ],
    text: rendered.text,
    to: [config.adminInbox],
  };
}

function wrapCustomerEmailHtml(input: {
  body: string;
  previewText: string;
  title: string;
}): string {
  return wrapPredictaEmailHtml({
    ...input,
    audience: 'customer',
    footer:
      'Predicta support uses your message only to help with your request. Please do not reply with passwords, payment card numbers, or private secrets.',
  });
}

function wrapAdminEmailHtml(input: {
  body: string;
  previewText: string;
  title: string;
}): string {
  return wrapPredictaEmailHtml({
    ...input,
    audience: 'admin',
    footer:
      'Internal Predicta note: verify the customer context before changing access, payment state, report delivery, or account status.',
  });
}

function wrapPredictaEmailHtml(input: {
  audience: 'admin' | 'customer';
  body: string;
  footer: string;
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
    `<tr><td style="padding:30px;font-size:16px;line-height:1.65;">${input.body}</td></tr>`,
    `<tr><td style="border-top:1px solid #e4d6b1;padding:20px 30px;color:#536070;font-size:13px;line-height:1.55;">${escapeHtml(input.footer)}<br>Prepared by Predicta.</td></tr>`,
    '</table>',
    `<!-- audience:${input.audience} -->`,
    '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('');
}

function renderContextBlock(rows: Array<[string, string]>): string {
  const renderedRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;color:#6b7280;">${escapeHtml(label)}</td><td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(value)}</td></tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e4d6b1;border-bottom:1px solid #e4d6b1;margin:22px 0;">${renderedRows}</table>`;
}

function sentenceCase(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, char => char.toUpperCase());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
