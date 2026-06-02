const RESEND_SEND_EMAIL_URL = 'https://api.resend.com/emails';

export type ResendOutboundConfig = {
  apiKey: string;
  from: string;
  replyTo: string;
  adminInbox: string;
};

export type ResendEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string[];
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
};

export type ResendProviderResponse = {
  id?: string;
  error?: string;
};

export type ResendSendResult =
  | {
      accepted: true;
      providerMessageId: string;
      statusCode: number;
    }
  | {
      accepted: false;
      error: string;
      statusCode: number;
    };

export type EmailDeliveryEvent = {
  attemptedAt: string;
  error?: string;
  provider: 'resend';
  providerMessageId?: string;
  recipient: string;
  status: 'accepted' | 'failed';
  statusCode: number;
  templateId: string;
  ticketNumber: string;
};

export type ResendFetch = typeof fetch;

export class ResendConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResendConfigurationError';
  }
}

export function resolveResendOutboundConfig(
  env: NodeJS.ProcessEnv = process.env,
  options: { liveRequired?: boolean } = {},
): ResendOutboundConfig | undefined {
  const apiKey = env.PREDICTA_RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (options.liveRequired) {
      throw new ResendConfigurationError(
        'PREDICTA_RESEND_API_KEY is required for live Resend email delivery.',
      );
    }

    return undefined;
  }

  return {
    adminInbox: env.PREDICTA_SUPPORT_ADMIN_EMAIL?.trim() || 'predicta@rudraix.com',
    apiKey,
    from:
      env.PREDICTA_SUPPORT_FROM_EMAIL?.trim() ||
      'Predicta Care <care@predicta.rudraix.com>',
    replyTo:
      env.PREDICTA_SUPPORT_REPLY_TO_EMAIL?.trim() || 'predicta@rudraix.com',
  };
}

export async function sendResendEmail(
  config: ResendOutboundConfig,
  payload: ResendEmailPayload,
  fetchImpl: ResendFetch = fetch,
): Promise<ResendSendResult> {
  const response = await fetchImpl(RESEND_SEND_EMAIL_URL, {
    body: JSON.stringify({
      from: payload.from,
      headers: payload.headers,
      html: payload.html,
      reply_to: payload.replyTo,
      subject: payload.subject,
      tags: normalizeResendTags(payload.tags),
      text: payload.text,
      to: payload.to,
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const providerBody = await readProviderBody(response);

  if (!response.ok) {
    return {
      accepted: false,
      error:
        providerBody.error ||
        `Resend rejected email delivery with status ${response.status}.`,
      statusCode: response.status,
    };
  }

  if (!providerBody.id) {
    return {
      accepted: false,
      error: 'Resend accepted the request shape but did not return an email id.',
      statusCode: response.status,
    };
  }

  return {
    accepted: true,
    providerMessageId: providerBody.id,
    statusCode: response.status,
  };
}

export function createEmailDeliveryEvent(input: {
  recipient: string;
  result: ResendSendResult;
  templateId: string;
  ticketNumber: string;
}): EmailDeliveryEvent {
  return {
    attemptedAt: new Date().toISOString(),
    error: input.result.accepted ? undefined : input.result.error,
    provider: 'resend',
    providerMessageId: input.result.accepted
      ? input.result.providerMessageId
      : undefined,
    recipient: input.recipient,
    status: input.result.accepted ? 'accepted' : 'failed',
    statusCode: input.result.statusCode,
    templateId: input.templateId,
    ticketNumber: input.ticketNumber,
  };
}

async function readProviderBody(response: Response): Promise<ResendProviderResponse> {
  try {
    const body = await response.json();

    if (isRecord(body)) {
      const id = typeof body.id === 'string' ? body.id : undefined;
      const error =
        typeof body.message === 'string'
          ? body.message
          : typeof body.error === 'string'
            ? body.error
            : undefined;

      return { error, id };
    }
  } catch {
    // Non-JSON provider errors should still become delivery events.
  }

  return {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function normalizeResendTags(
  tags?: Array<{ name: string; value: string }>,
): Array<{ name: string; value: string }> | undefined {
  return tags?.map(tag => ({
    name: normalizeResendTagToken(tag.name),
    value: normalizeResendTagToken(tag.value),
  }));
}

function normalizeResendTagToken(value: string): string {
  const normalized = value
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'predicta';
}
