import {
  proxyAstroApiRequest,
  readJsonBody,
} from '../../../../../../../lib/astro-api';

export async function POST(
  request: Request,
  context: { params: Promise<{ codeId: string }> },
): Promise<Response> {
  const { codeId } = await context.params;
  const token = request.headers.get('x-pridicta-admin-token') ?? '';
  const payload = await readJsonBody(request);

  if (!payload.ok) {
    return payload.response;
  }

  return proxyAstroApiRequest(
    `/access/admin/guest-passes/${encodeURIComponent(codeId)}/revoke`,
    payload.body,
    { 'x-pridicta-admin-token': token },
  );
}
