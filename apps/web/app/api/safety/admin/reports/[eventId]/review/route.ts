import {
  proxyAstroApiRequest,
  readJsonBody,
} from '../../../../../../../lib/astro-api';

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
): Promise<Response> {
  const { eventId } = await context.params;
  const token = request.headers.get('x-pridicta-admin-token') ?? '';
  const payload = await readJsonBody(request);

  if (!payload.ok) {
    return payload.response;
  }

  return proxyAstroApiRequest(
    `/safety/admin/reports/${encodeURIComponent(eventId)}/review`,
    payload.body,
    { 'x-pridicta-admin-token': token },
  );
}
