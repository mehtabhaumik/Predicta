import { proxyAstroApiRequest, readJsonBody } from '../../../lib/astro-api';
import { requireFirebaseUser } from '../../../lib/firebase/server-auth';

export async function POST(request: Request): Promise<Response> {
  const auth = await requireFirebaseUser(request);
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await readJsonBody(request);

  if (!payload.ok) {
    return payload.response;
  }

  return proxyAstroApiRequest('/generate-kundli', payload.body);
}
