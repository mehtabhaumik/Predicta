import {
  submitSupportTicket,
  SupportTicketSubmissionError,
} from '../../../../lib/email/support-ticket-submission';
import { readJsonBody } from '../../../../lib/astro-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const payload = await readJsonBody(request);

  if (!payload.ok) {
    return payload.response;
  }

  const body = isRecord(payload.body) ? payload.body : {};

  try {
    const result = await submitSupportTicket({
      category: getString(body.category),
      customerEmail: getString(body.customerEmail),
      customerName: getString(body.customerName),
      language: getString(body.language),
      message: getString(body.message) ?? '',
      priority: getString(body.priority),
      related: isRecord(body.related) ? normalizeRelated(body.related) : undefined,
      route: getString(body.route),
      sourceSurface: getString(body.sourceSurface),
      subject: getString(body.subject) ?? '',
      userId: getString(body.userId),
    });

    return Response.json(
      {
        notifications: result.notifications,
        ticket: result.thread.ticket,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SupportTicketSubmissionError) {
      return Response.json(
        {
          detail: error.message,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        detail: 'Support request could not be created.',
      },
      { status: 500 },
    );
  }
}

function normalizeRelated(value: Record<string, unknown>) {
  return {
    kundliId: getString(value.kundliId),
    purchaseId: getString(value.purchaseId),
    reportId: getString(value.reportId),
    reportType: getString(value.reportType),
  };
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
