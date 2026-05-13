import {
  proxyAstroApiGet,
  proxyAstroApiRequest,
  readJsonBody,
} from '../../../../../lib/astro-api';

function adminHeaders(request: Request): HeadersInit {
  const token = request.headers.get('x-pridicta-admin-token') ?? '';

  return { 'x-pridicta-admin-token': token };
}

export async function GET(request: Request): Promise<Response> {
  return proxyAstroApiGet('/access/admin/guest-passes', adminHeaders(request));
}

export async function POST(request: Request): Promise<Response> {
  const payload = await readJsonBody(request);

  if (!payload.ok) {
    return payload.response;
  }

  const body = isRecord(payload.body) ? payload.body : {};
  const allowedEmails = normalizeAllowedEmails(body.allowedEmails);

  if (!allowedEmails.length) {
    return Response.json(
      {
        detail:
          'Add at least one allowed email before creating this pass. The pass can only be redeemed by that signed-in email.',
      },
      { status: 400 },
    );
  }

  return proxyAstroApiRequest(
    '/access/admin/guest-passes',
    {
      ...body,
      allowedEmails,
    },
    adminHeaders(request),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function normalizeAllowedEmails(value: unknown): string[] {
  const rawEmails = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\n,]+/)
      : [];

  return Array.from(
    new Set(
      rawEmails
        .map(email => String(email).trim().toLowerCase())
        .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
    ),
  );
}
