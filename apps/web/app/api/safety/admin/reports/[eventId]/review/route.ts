import { proxyAstroApiRequest } from '../../../../../../../lib/astro-api';

export async function POST(
  request: Request,
  context: { params: Promise<{ eventId: string }> },
): Promise<Response> {
  const { eventId } = await context.params;
  const token = request.headers.get('x-pridicta-admin-token') ?? '';

  return proxyAstroApiRequest(
    `/safety/admin/reports/${encodeURIComponent(eventId)}/review`,
    await request.json(),
    { 'x-pridicta-admin-token': token },
  );
}
