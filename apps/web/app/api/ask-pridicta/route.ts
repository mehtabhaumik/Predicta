import { proxyAstroApiRequest } from '../../../lib/astro-api';

export async function POST(request: Request): Promise<Response> {
  return proxyAstroApiRequest('/ask-pridicta', await request.json());
}
