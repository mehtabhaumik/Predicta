import { proxyAstroApiRequest, readJsonBody } from '../../../lib/astro-api';
import { requireFirebaseUser } from '../../../lib/firebase/server-auth';

const MAX_SERVER_HISTORY_MESSAGES = 8;
const MAX_SERVER_MESSAGE_CHARS = 4000;

export async function POST(request: Request): Promise<Response> {
  const auth = await requireFirebaseUser(request);
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await readJsonBody(request);

  if (!payload.ok) {
    return payload.response;
  }

  return proxyAstroApiRequest('/ask-pridicta', trimAskPridictaPayload(payload.body));
}

function trimAskPridictaPayload(body: unknown): unknown {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return body;
  }

  const payload = body as Record<string, unknown>;
  const history = Array.isArray(payload.history)
    ? payload.history.slice(-MAX_SERVER_HISTORY_MESSAGES)
    : payload.history;
  const message =
    typeof payload.message === 'string'
      ? payload.message.slice(0, MAX_SERVER_MESSAGE_CHARS)
      : payload.message;

  return {
    ...payload,
    history,
    message,
  };
}
