import { proxyAstroApiRequest, readJsonBody } from '../../../lib/astro-api';

export async function POST(request: Request): Promise<Response> {
  const payload = await readJsonBody(request);

  if (!payload.ok) {
    return payload.response;
  }

  return proxyAstroApiRequest('/generate-kundli', payload.body);
}
