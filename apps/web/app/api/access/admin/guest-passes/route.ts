import {
  proxyAstroApiGet,
  proxyAstroApiRequest,
} from '../../../../../lib/astro-api';

function adminHeaders(request: Request): HeadersInit {
  const token = request.headers.get('x-pridicta-admin-token') ?? '';

  return { 'x-pridicta-admin-token': token };
}

export async function GET(request: Request): Promise<Response> {
  return proxyAstroApiGet('/access/admin/guest-passes', adminHeaders(request));
}

export async function POST(request: Request): Promise<Response> {
  return proxyAstroApiRequest(
    '/access/admin/guest-passes',
    await request.json(),
    adminHeaders(request),
  );
}
