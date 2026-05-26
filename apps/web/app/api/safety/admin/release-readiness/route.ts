import { proxyAstroApiGet } from '../../../../../lib/astro-api';
import {
  isOwnerConsoleEnabled,
  ownerConsoleUnavailableResponse,
} from '../../../../../lib/owner-surface';

function adminHeaders(request: Request): HeadersInit {
  const token = request.headers.get('x-pridicta-admin-token') ?? '';

  return { 'x-pridicta-admin-token': token };
}

export async function GET(request: Request): Promise<Response> {
  if (!isOwnerConsoleEnabled()) {
    return ownerConsoleUnavailableResponse();
  }

  return proxyAstroApiGet('/safety/admin/release-readiness', adminHeaders(request));
}
