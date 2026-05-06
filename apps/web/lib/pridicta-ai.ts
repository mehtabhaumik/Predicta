import type {
  BirthDetailsExtractionResult,
  PridictaChatRequest,
  PridictaChatResponse,
} from '@pridicta/types';

export async function askPridictaFromWeb(
  request: PridictaChatRequest,
): Promise<PridictaChatResponse> {
  const response = await fetch('/api/ask-pridicta', {
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Pridicta AI failed.'));
  }

  return (await response.json()) as PridictaChatResponse;
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
