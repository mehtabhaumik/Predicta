import { proxyAstroApiRequest } from '../../../../lib/astro-api';

export async function POST(request: Request): Promise<Response> {
  return proxyAstroApiRequest('/safety/report', await request.json());
}
