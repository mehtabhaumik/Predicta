import { proxyAstroApiGet } from '../../../../../lib/astro-api';

function adminHeaders(request: Request): HeadersInit {
  const token = request.headers.get('x-pridicta-admin-token') ?? '';

  return { 'x-pridicta-admin-token': token };
}

export async function GET(request: Request): Promise<Response> {
  return proxyAstroApiGet('/safety/admin/release-readiness', adminHeaders(request));
}
