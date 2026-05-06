import { proxyAstroApiRequest } from '../../../../../../../lib/astro-api';

export async function POST(
  request: Request,
  context: { params: Promise<{ codeId: string }> },
): Promise<Response> {
  const { codeId } = await context.params;
  const token = request.headers.get('x-pridicta-admin-token') ?? '';

  return proxyAstroApiRequest(
    `/access/admin/guest-passes/${encodeURIComponent(codeId)}/revoke`,
    await request.json(),
    { 'x-pridicta-admin-token': token },
  );
}
