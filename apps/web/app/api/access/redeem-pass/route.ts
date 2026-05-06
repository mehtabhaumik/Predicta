import { proxyAstroApiRequest } from '../../../../lib/astro-api';

export async function POST(request: Request): Promise<Response> {
  return proxyAstroApiRequest('/access/guest-pass/redeem', await request.json());
}
