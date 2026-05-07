import type {
  BirthDetailsExtractionResult,
  PridictaChatRequest,
  PridictaChatResponse,
} from '@pridicta/types';

export async function askPridictaFromWeb(
  request: PridictaChatRequest,
): Promise<PridictaChatResponse> {
  const response = await fetch('/api/ask-pridicta', {
    body: JSON.stringify({
      ...request,
      safetyIdentifier: request.safetyIdentifier ?? getWebSafetyIdentifier(),
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Predicta could not answer right now.'));
  }

  return (await response.json()) as PridictaChatResponse;
}

export function getWebSafetyIdentifier(): string {
  const key = 'predicta.webSafetySession.v1';

  try {
    const existing = localStorage.getItem(key);
    if (existing) {
      return existing;
    }

    const next =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? `web-${crypto.randomUUID()}`
        : `web-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(key, next);
    return next;
  } catch {
    return `web-ephemeral-${Date.now()}`;
  }
}

export async function extractBirthDetailsFromWeb(
  text: string,
): Promise<BirthDetailsExtractionResult> {
  const response = await fetch('/api/extract-birth-details', {
    body: JSON.stringify({ text }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Birth detail extraction failed.'),
    );
  }

  return (await response.json()) as BirthDetailsExtractionResult;
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown };
    return typeof payload.detail === 'string' ? payload.detail : fallback;
  } catch {
    return fallback;
  }
}
