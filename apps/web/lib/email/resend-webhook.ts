import { createHmac, timingSafeEqual } from 'node:crypto';

import type {
  SupportEmailDeliveryStatus,
  SupportTicketActor,
  SupportTicketThread,
} from '@pridicta/types';

import {
  InMemorySupportTicketThreadRepository,
  type SupportTicketThreadRepository,
} from './support-ticket-thread';
import {
  normalizeSupportEmailText,
  supportEmailHtmlToPlainText,
} from './support-html-sanitizer';

const RESEND_RECEIVED_EMAIL_URL = 'https://api.resend.com/emails/receiving';
const MAX_WEBHOOK_CLOCK_SKEW_SECONDS = 5 * 60;

export const RESEND_SUPPORT_WEBHOOK_EVENTS = [
  'email.received',
  'email.sent',
  'email.delivered',
  'email.delivery_delayed',
  'email.bounced',
  'email.failed',
  'email.complained',
  'email.suppressed',
] as const;

export const RESEND_SUPPORT_WEBHOOK_EVENTS_NOT_ENABLED = [
  'email.opened',
  'email.clicked',
] as const;

export type ResendSupportWebhookEvent =
  (typeof RESEND_SUPPORT_WEBHOOK_EVENTS)[number];

export type ResendWebhookHeaders = {
  signature?: string | null;
  timestamp?: string | null;
  webhookId?: string | null;
};

export type ResendWebhookProcessingResult = {
  duplicate: boolean;
  eventType?: string;
  message?: string;
  status:
    | 'duplicate'
    | 'ignored'
    | 'invalid_event'
    | 'quarantined'
    | 'recorded'
    | 'threaded';
  ticketNumber?: string;
  webhookId?: string;
};

export type ResendWebhookParsedEvent = {
  createdAt?: string;
  data: Record<string, unknown>;
  type: string;
};

export type ResendReceivedEmailContent = {
  attachments?: ResendEmailAttachment[];
  from?: string;
  headers?: Record<string, unknown>;
  html?: string | null;
  message_id?: string;
  subject?: string;
  text?: string | null;
  to?: string[];
};

export type ResendWebhookProcessingStore = {
  markProcessed(webhookId: string): Promise<boolean>;
  quarantineDeliveryEvent(event: UnthreadedResendDeliveryEvent): Promise<void>;
  quarantineInboundEmail(email: UnthreadedResendInboundEmail): Promise<void>;
};

export type UnthreadedResendDeliveryEvent = {
  eventType: ResendSupportWebhookEvent;
  providerEmailId?: string;
  reason: string;
  receivedAt: string;
  recipient?: string;
  subject?: string;
  ticketNumber?: string;
  webhookId: string;
};

export type UnthreadedResendInboundEmail = {
  attachments: ResendEmailAttachment[];
  bodyPreview: string;
  from?: string;
  providerEmailId?: string;
  reason: string;
  receivedAt: string;
  recipient?: string;
  subject?: string;
  ticketNumber?: string;
  webhookId: string;
};

export type ResendEmailAttachment = {
  content_disposition?: string | null;
  content_id?: string | null;
  content_type?: string | null;
  filename?: string;
  id?: string;
  size?: number;
};

export type ProcessResendWebhookOptions = {
  fetchImpl?: typeof fetch;
  now?: Date;
  receivedEmailFetcher?: (
    emailId: string,
  ) => Promise<ResendReceivedEmailContent | undefined>;
  repository?: SupportTicketThreadRepository;
  store?: ResendWebhookProcessingStore;
};

export class ResendWebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResendWebhookVerificationError';
  }
}

export class ResendWebhookProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResendWebhookProcessingError';
  }
}

export class InMemoryResendWebhookProcessingStore
  implements ResendWebhookProcessingStore
{
  readonly processedWebhookIds = new Set<string>();
  readonly unthreadedDeliveryEvents: UnthreadedResendDeliveryEvent[] = [];
  readonly unthreadedInboundEmails: UnthreadedResendInboundEmail[] = [];

  async markProcessed(webhookId: string): Promise<boolean> {
    if (this.processedWebhookIds.has(webhookId)) {
      return false;
    }

    this.processedWebhookIds.add(webhookId);

    return true;
  }

  async quarantineDeliveryEvent(event: UnthreadedResendDeliveryEvent): Promise<void> {
    this.unthreadedDeliveryEvents.push(event);
  }

  async quarantineInboundEmail(email: UnthreadedResendInboundEmail): Promise<void> {
    this.unthreadedInboundEmails.push(email);
  }
}

const globalForResendWebhook = globalThis as typeof globalThis & {
  __predictaResendWebhookRepository?: InMemorySupportTicketThreadRepository;
  __predictaResendWebhookStore?: InMemoryResendWebhookProcessingStore;
};

export function getDefaultResendWebhookRepository(): InMemorySupportTicketThreadRepository {
  globalForResendWebhook.__predictaResendWebhookRepository ??=
    new InMemorySupportTicketThreadRepository();

  return globalForResendWebhook.__predictaResendWebhookRepository;
}

export function getDefaultResendWebhookStore(): InMemoryResendWebhookProcessingStore {
  globalForResendWebhook.__predictaResendWebhookStore ??=
    new InMemoryResendWebhookProcessingStore();

  return globalForResendWebhook.__predictaResendWebhookStore;
}

export function getResendWebhookSecret(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return env.PREDICTA_RESEND_WEBHOOK_SECRET?.trim() || undefined;
}

export function verifyResendWebhookSignature(input: {
  headers: ResendWebhookHeaders;
  now?: Date;
  rawBody: string;
  secret: string;
}): void {
  const webhookId = input.headers.webhookId?.trim();
  const timestamp = input.headers.timestamp?.trim();
  const signature = input.headers.signature?.trim();

  if (!webhookId || !timestamp || !signature) {
    throw new ResendWebhookVerificationError(
      'Missing required Resend/Svix webhook signature headers.',
    );
  }

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    throw new ResendWebhookVerificationError('Invalid Resend webhook timestamp.');
  }

  const nowSeconds = Math.floor((input.now ?? new Date()).getTime() / 1000);
  if (
    Math.abs(nowSeconds - timestampSeconds) > MAX_WEBHOOK_CLOCK_SKEW_SECONDS
  ) {
    throw new ResendWebhookVerificationError('Resend webhook timestamp is too old.');
  }

  const signedPayload = `${webhookId}.${timestamp}.${input.rawBody}`;
  const expectedSignature = createHmac(
    'sha256',
    decodeResendWebhookSecret(input.secret),
  )
    .update(signedPayload)
    .digest('base64');
  const expected = Buffer.from(expectedSignature);

  for (const part of signature.split(/\s+/)) {
    const providedSignature = part.startsWith('v1,') ? part.slice(3) : part;
    const provided = Buffer.from(providedSignature);

    if (
      provided.length === expected.length &&
      timingSafeEqual(provided, expected)
    ) {
      return;
    }
  }

  throw new ResendWebhookVerificationError('Invalid Resend webhook signature.');
}

export async function processVerifiedResendWebhook(
  input: {
    headers: ResendWebhookHeaders;
    rawBody: string;
  },
  options: ProcessResendWebhookOptions = {},
): Promise<ResendWebhookProcessingResult> {
  const event = parseResendWebhookEvent(input.rawBody);
  const webhookId =
    input.headers.webhookId?.trim() ||
    getString(event.data, 'webhook_id') ||
    getString(event.data, 'email_id') ||
    `${event.type}:${event.createdAt ?? ''}`;
  const store = options.store ?? getDefaultResendWebhookStore();
  const firstDelivery = await store.markProcessed(webhookId);

  if (!firstDelivery) {
    return {
      duplicate: true,
      eventType: event.type,
      status: 'duplicate',
      webhookId,
    };
  }

  if (RESEND_SUPPORT_WEBHOOK_EVENTS_NOT_ENABLED.includes(event.type as never)) {
    return {
      duplicate: false,
      eventType: event.type,
      message: 'Privacy-noise webhook event intentionally not enabled.',
      status: 'ignored',
      webhookId,
    };
  }

  if (!isSupportedResendWebhookEvent(event.type)) {
    return {
      duplicate: false,
      eventType: event.type,
      message: 'Unsupported Resend webhook event.',
      status: 'invalid_event',
      webhookId,
    };
  }

  if (event.type === 'email.received') {
    return processInboundEmail(event, {
      ...options,
      store,
      webhookId,
    });
  }

  return processDeliveryEvent(event, {
    ...options,
    store,
    webhookId,
  });
}

export async function fetchResendReceivedEmailContent(
  emailId: string,
  options: { apiKey?: string; fetchImpl?: typeof fetch } = {},
): Promise<ResendReceivedEmailContent | undefined> {
  const apiKey = options.apiKey ?? process.env.PREDICTA_RESEND_API_KEY?.trim();

  if (!apiKey) {
    return undefined;
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(
    `${RESEND_RECEIVED_EMAIL_URL}/${encodeURIComponent(emailId)}?html_format=cid`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      method: 'GET',
    },
  );

  if (!response.ok) {
    return undefined;
  }

  const body = await response.json();

  if (isRecord(body) && isRecord(body.data)) {
    return normalizeReceivedEmailContent(body.data);
  }

  return isRecord(body) ? normalizeReceivedEmailContent(body) : undefined;
}

export function extractSupportTicketNumber(input: {
  headers?: Record<string, unknown>;
  recipient?: string;
  subject?: string;
  tags?: Record<string, unknown>;
}): string | undefined {
  const candidates = [
    getString(input.tags, 'predicta_ticket'),
    getString(input.tags, 'ticket_number'),
    getHeader(input.headers, 'x-predicta-ticket'),
    getHeader(input.headers, 'x-support-ticket'),
    input.subject,
    input.recipient,
  ];

  for (const candidate of candidates) {
    const ticketNumber = matchTicketNumber(candidate);

    if (ticketNumber) {
      return ticketNumber;
    }
  }

  return undefined;
}

export function buildWebhookSignatureForTest(input: {
  rawBody: string;
  secret: string;
  timestamp: string;
  webhookId: string;
}): string {
  return `v1,${createHmac('sha256', decodeResendWebhookSecret(input.secret))
    .update(`${input.webhookId}.${input.timestamp}.${input.rawBody}`)
    .digest('base64')}`;
}

function parseResendWebhookEvent(rawBody: string): ResendWebhookParsedEvent {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawBody);
  } catch {
    throw new ResendWebhookProcessingError('Resend webhook body is not valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new ResendWebhookProcessingError('Resend webhook body must be an object.');
  }

  const type = getString(parsed, 'type');
  const data = parsed.data;

  if (!type || !isRecord(data)) {
    throw new ResendWebhookProcessingError(
      'Resend webhook body is missing type or data.',
    );
  }

  return {
    createdAt: getString(parsed, 'created_at'),
    data,
    type,
  };
}

async function processInboundEmail(
  event: ResendWebhookParsedEvent,
  options: ProcessResendWebhookOptions & {
    store: ResendWebhookProcessingStore;
    webhookId: string;
  },
): Promise<ResendWebhookProcessingResult> {
  const providerEmailId = getString(event.data, 'email_id');
  const fetched =
    providerEmailId && options.receivedEmailFetcher
      ? await options.receivedEmailFetcher(providerEmailId)
      : providerEmailId
        ? await fetchResendReceivedEmailContent(providerEmailId, {
            fetchImpl: options.fetchImpl,
          })
        : undefined;
  const merged = mergeInboundWebhookData(event.data, fetched);
  const recipient = merged.to[0];
  const ticketNumber = extractSupportTicketNumber({
    headers: merged.headers,
    recipient,
    subject: merged.subject,
    tags: getRecord(event.data, 'tags'),
  });
  const body = buildInboundMessageBody(merged);
  const repository = options.repository ?? getDefaultResendWebhookRepository();
  const thread = ticketNumber
    ? await findSupportThread(repository, ticketNumber)
    : undefined;

  if (!thread) {
    await options.store.quarantineInboundEmail({
      attachments: merged.attachments,
      bodyPreview: preview(body),
      from: merged.from,
      providerEmailId,
      reason: ticketNumber
        ? 'No matching support thread for extracted ticket number.'
        : 'No support ticket number found in Resend inbound email.',
      receivedAt: event.createdAt ?? new Date().toISOString(),
      recipient,
      subject: merged.subject,
      ticketNumber,
      webhookId: options.webhookId,
    });

    return {
      duplicate: false,
      eventType: event.type,
      status: 'quarantined',
      ticketNumber,
      webhookId: options.webhookId,
    };
  }

  await repository.appendMessage(thread.ticket.id, {
    actor: {
      displayName: parseDisplayName(merged.headers, merged.from),
      email: parseEmailAddress(merged.from),
      role: 'customer',
    },
    body,
    id: createInboundMessageId(options.webhookId, providerEmailId),
    kind: 'customer_inbound',
    now: event.createdAt,
  });

  return {
    duplicate: false,
    eventType: event.type,
    status: 'threaded',
    ticketNumber: thread.ticket.ticketNumber,
    webhookId: options.webhookId,
  };
}

async function processDeliveryEvent(
  event: ResendWebhookParsedEvent,
  options: ProcessResendWebhookOptions & {
    store: ResendWebhookProcessingStore;
    webhookId: string;
  },
): Promise<ResendWebhookProcessingResult> {
  const tags = getRecord(event.data, 'tags');
  const recipient = getStringArray(event.data, 'to')[0];
  const subject = getString(event.data, 'subject');
  const ticketNumber = extractSupportTicketNumber({
    recipient,
    subject,
    tags,
  });
  const repository = options.repository ?? getDefaultResendWebhookRepository();
  const thread = ticketNumber
    ? await findSupportThread(repository, ticketNumber)
    : undefined;

  if (!thread) {
    await options.store.quarantineDeliveryEvent({
      eventType: event.type as ResendSupportWebhookEvent,
      providerEmailId: getString(event.data, 'email_id'),
      reason: ticketNumber
        ? 'No matching support thread for Resend delivery event.'
        : 'No support ticket number found in Resend delivery event.',
      receivedAt: event.createdAt ?? new Date().toISOString(),
      recipient,
      subject,
      ticketNumber,
      webhookId: options.webhookId,
    });

    return {
      duplicate: false,
      eventType: event.type,
      status: 'quarantined',
      ticketNumber,
      webhookId: options.webhookId,
    };
  }

  await repository.recordDeliveryEvent(thread.ticket.id, {
    attemptedAt: event.createdAt ?? new Date().toISOString(),
    messageId: getString(event.data, 'message_id'),
    provider: 'resend',
    providerMessageId: getString(event.data, 'email_id'),
    recipient: recipient ?? thread.ticket.customerEmail ?? 'unknown-recipient',
    status: mapResendDeliveryStatus(event.type),
    statusCode: mapResendDeliveryStatusCode(event.type),
    templateId: getString(event.data, 'template_id') ?? 'resend.webhook.event',
  });

  return {
    duplicate: false,
    eventType: event.type,
    status: 'recorded',
    ticketNumber: thread.ticket.ticketNumber,
    webhookId: options.webhookId,
  };
}

async function findSupportThread(
  repository: SupportTicketThreadRepository,
  ticketNumber: string,
): Promise<SupportTicketThread | undefined> {
  return repository.findThreadByTicketNumber(ticketNumber);
}

function mergeInboundWebhookData(
  data: Record<string, unknown>,
  fetched?: ResendReceivedEmailContent,
): Required<
  Pick<ResendReceivedEmailContent, 'attachments' | 'headers' | 'to'>
> &
  Pick<ResendReceivedEmailContent, 'from' | 'html' | 'message_id' | 'subject' | 'text'> {
  return {
    attachments:
      normalizeAttachments(fetched?.attachments) ??
      normalizeAttachments(getUnknownArray(data, 'attachments')) ??
      [],
    from: fetched?.from ?? getString(data, 'from'),
    headers: fetched?.headers ?? getRecord(data, 'headers') ?? {},
    html: fetched?.html ?? getString(data, 'html') ?? null,
    message_id: fetched?.message_id ?? getString(data, 'message_id'),
    subject: fetched?.subject ?? getString(data, 'subject'),
    text: fetched?.text ?? getString(data, 'text') ?? null,
    to: fetched?.to ?? getStringArray(data, 'to'),
  };
}

function buildInboundMessageBody(
  email: ReturnType<typeof mergeInboundWebhookData>,
): string {
  const primary =
    email.text && email.text.trim()
      ? normalizeSupportEmailText(email.text)
      : email.html
        ? supportEmailHtmlToPlainText(email.html)
        : '';
  const body =
    primary ||
    [
      'Customer reply was received through Resend, but full body content was not available.',
      email.subject ? `Subject: ${email.subject}` : undefined,
    ]
      .filter(Boolean)
      .join('\n');
  const attachmentSummary = email.attachments.length
    ? `\n\nAttachments received: ${email.attachments
        .map(attachment => attachment.filename ?? attachment.id ?? 'unnamed')
        .join(', ')}`
    : '';

  return `${body}${attachmentSummary}`.trim();
}

function mapResendDeliveryStatus(eventType: string): SupportEmailDeliveryStatus {
  switch (eventType) {
    case 'email.sent':
      return 'sent';
    case 'email.delivered':
      return 'delivered';
    case 'email.delivery_delayed':
      return 'delivery_delayed';
    case 'email.bounced':
      return 'bounced';
    case 'email.failed':
      return 'failed';
    case 'email.complained':
      return 'complained';
    case 'email.suppressed':
      return 'suppressed';
    default:
      return 'failed';
  }
}

function mapResendDeliveryStatusCode(eventType: string): number {
  return eventType === 'email.delivered' || eventType === 'email.sent'
    ? 200
    : eventType === 'email.delivery_delayed'
      ? 202
      : 500;
}

function isSupportedResendWebhookEvent(
  eventType: string,
): eventType is ResendSupportWebhookEvent {
  return RESEND_SUPPORT_WEBHOOK_EVENTS.includes(
    eventType as ResendSupportWebhookEvent,
  );
}

function decodeResendWebhookSecret(secret: string): Buffer {
  const normalized = secret.startsWith('whsec_') ? secret.slice(6) : secret;

  try {
    return Buffer.from(normalized, 'base64');
  } catch {
    return Buffer.from(secret);
  }
}

function normalizeReceivedEmailContent(
  value: Record<string, unknown>,
): ResendReceivedEmailContent {
  return {
    attachments: normalizeAttachments(getUnknownArray(value, 'attachments')),
    from: getString(value, 'from'),
    headers: getRecord(value, 'headers'),
    html: getNullableString(value, 'html'),
    message_id: getString(value, 'message_id'),
    subject: getString(value, 'subject'),
    text: getNullableString(value, 'text'),
    to: getStringArray(value, 'to'),
  };
}

function normalizeAttachments(
  value?: unknown[],
): ResendEmailAttachment[] | undefined {
  if (!value) {
    return undefined;
  }

  return value
    .filter(isRecord)
    .map(attachment => ({
      content_disposition: getNullableString(attachment, 'content_disposition'),
      content_id: getNullableString(attachment, 'content_id'),
      content_type: getNullableString(attachment, 'content_type'),
      filename: getString(attachment, 'filename'),
      id: getString(attachment, 'id'),
      size: getNumber(attachment, 'size'),
    }));
}

function getRecord(
  value: Record<string, unknown> | undefined,
  key: string,
): Record<string, unknown> | undefined {
  const found = value?.[key];

  return isRecord(found) ? found : undefined;
}

function getString(
  value: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const found = value?.[key];

  return typeof found === 'string' ? found : undefined;
}

function getNullableString(
  value: Record<string, unknown> | undefined,
  key: string,
): string | null | undefined {
  const found = value?.[key];

  return typeof found === 'string' || found === null ? found : undefined;
}

function getNumber(
  value: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const found = value?.[key];

  return typeof found === 'number' ? found : undefined;
}

function getStringArray(
  value: Record<string, unknown> | undefined,
  key: string,
): string[] {
  const found = value?.[key];

  return Array.isArray(found)
    ? found.filter((item): item is string => typeof item === 'string')
    : [];
}

function getUnknownArray(
  value: Record<string, unknown> | undefined,
  key: string,
): unknown[] | undefined {
  const found = value?.[key];

  return Array.isArray(found) ? found : undefined;
}

function getHeader(
  headers: Record<string, unknown> | undefined,
  name: string,
): string | undefined {
  if (!headers) {
    return undefined;
  }

  const normalizedName = name.toLowerCase();
  const key = Object.keys(headers).find(
    candidate => candidate.toLowerCase() === normalizedName,
  );

  return key ? getString(headers, key) : undefined;
}

function matchTicketNumber(value?: string): string | undefined {
  const match = value
    ?.toUpperCase()
    .match(/\b(PRD[-_ ]?[A-Z0-9]{4,}[-_ ]?[A-Z0-9]{2,})\b/);

  return match?.[1].replace(/[_ ]/g, '-');
}

function parseEmailAddress(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.match(/<([^>]+)>/)?.[1] ?? value.trim();
}

function parseDisplayName(
  headers: Record<string, unknown> | undefined,
  fallbackFrom?: string,
): string | undefined {
  const from = getHeader(headers, 'from') ?? fallbackFrom;
  const match = from?.match(/^"?([^"<]+?)"?\s*</);

  return match?.[1]?.trim();
}

function createInboundMessageId(webhookId: string, providerEmailId?: string): string {
  return `resend-inbound-${Buffer.from(providerEmailId ?? webhookId)
    .toString('base64url')
    .slice(0, 32)}`;
}

function preview(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();

  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
