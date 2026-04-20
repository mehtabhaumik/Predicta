import { withTimeout } from '@pridicta/utils';

import type {
  PridictaChatRequest,
  PridictaChatResponse,
} from '../../../types/astrology';
import { env } from '../../../config/env';
import { getCurrentFirebaseIdToken } from '../../firebase/authService';

const BACKEND_AI_TIMEOUT_MS = 30000;

export async function generateBackendPridictaResponse(
  request: PridictaChatRequest,
): Promise<PridictaChatResponse | null> {
  const baseUrl = env.backendAuthorityUrl.trim().replace(/\/+$/, '');
  if (!baseUrl) {
    return null;
  }

  const token = await getCurrentFirebaseIdToken().catch(() => undefined);

  const response = await withTimeout(
    signal =>
      fetch(`${baseUrl}/ai/pridicta`, {
        body: JSON.stringify(request),
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        method: 'POST',
        signal,
      }),
    BACKEND_AI_TIMEOUT_MS,
    { message: 'Predicta guidance request timed out.' },
  ).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as
    | PridictaChatResponse
    | null;

  if (!payload?.text?.trim()) {
    return null;
  }

  return payload;
}
