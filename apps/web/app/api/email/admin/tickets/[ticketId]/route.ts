import type {
  SupportTicketPriority,
  SupportTicketStatus,
} from '@pridicta/types';

import {
  getAdminSupportInboxThread,
  requireSupportInboxAdmin,
  SupportInboxAdminError,
  updateAdminSupportInboxThread,
} from '../../../../../../lib/email/admin-support-inbox';
import { readJsonBody } from '../../../../../../lib/astro-api';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    ticketId: string;
  }>;
};

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const auth = requireSupportInboxAdmin(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { ticketId } = await context.params;
  const thread = await getAdminSupportInboxThread(decodeURIComponent(ticketId));

  if (!thread) {
    return Response.json(
      {
        detail: 'Support ticket was not found.',
      },
      { status: 404 },
    );
  }

  return Response.json(thread);
}

export async function PATCH(
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
    const thread = await updateAdminSupportInboxThread(decodeURIComponent(ticketId), {
      assignedTo:
        typeof body.assignedTo === 'string' ? body.assignedTo : undefined,
      priority:
        typeof body.priority === 'string'
          ? (body.priority as SupportTicketPriority)
          : undefined,
      status:
        typeof body.status === 'string' ? (body.status as SupportTicketStatus) : undefined,
    });

    return Response.json(thread);
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
        detail: 'Support ticket could not be updated.',
      },
      { status: 500 },
    );
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
