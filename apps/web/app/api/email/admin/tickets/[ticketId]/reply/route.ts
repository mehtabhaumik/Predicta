import {
  requireSupportInboxAdmin,
  sendAdminSupportReply,
  SupportInboxAdminError,
  type AdminReplySendAction,
} from '../../../../../../../lib/email/admin-support-inbox';
import { readJsonBody } from '../../../../../../../lib/astro-api';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    ticketId: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = requireSupportInboxAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const payload = await readJsonBody(request);

  if (!payload.ok) {
    return payload.response;
  }

  const body = isRecord(payload.body) ? payload.body : {};
  const { ticketId } = await context.params;

  try {
    const result = await sendAdminSupportReply(decodeURIComponent(ticketId), {
      action: normalizeAction(body.action),
      body: typeof body.body === 'string' ? body.body : '',
      idempotencyKey:
        typeof body.idempotencyKey === 'string' ? body.idempotencyKey : undefined,
      templateId:
        typeof body.templateId === 'string'
          ? body.templateId
          : 'support.admin.reply.need_more_details.v1',
      variables: isStringRecord(body.variables) ? body.variables : undefined,
    });

    return Response.json(result);
  } catch (error) {
    if (error instanceof SupportInboxAdminError) {
      return Response.json(
        {
          detail: error.message,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        detail: 'Admin reply could not be sent.',
      },
      { status: 500 },
    );
  }
}

function normalizeAction(value: unknown): AdminReplySendAction {
  return value === 'resolve' || value === 'escalate' ? value : 'waiting';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every(item => typeof item === 'string')
  );
}
