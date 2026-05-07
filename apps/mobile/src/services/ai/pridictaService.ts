import { env } from '../../config/env';
import type {
  PridictaChatRequest,
  PridictaChatResponse,
} from '../../types/astrology';
import {
  detectIntent,
  selectOpenAIModelForIntent,
} from './aiRouter';
import {
  getCachedAIResponse,
  normalizeQuestion,
  setCachedAIResponse,
} from '../cache/responseCache';
import { getInstallDeviceId } from '../device/deviceIdentity';

export async function askPridicta({
  chartContext,
  deepAnalysis = false,
  history,
  kundli,
  language = 'en',
  message,
  userPlan,
}: PridictaChatRequest): Promise<PridictaChatResponse> {
  const detectedIntent = detectIntent(message, chartContext);
  const intent = deepAnalysis ? 'deep' : detectedIntent;
  const model = selectOpenAIModelForIntent({ intent, userPlan });
  const normalizedQuestion = normalizeQuestion(message);
  const cacheInput = {
    activeKundliId: kundli.id,
    calculationInputHash: kundli.calculationMeta.inputHash,
    chartContext,
    intent,
    language,
    model,
    normalizedQuestion,
    userId: `local-${kundli.id}`,
  };

  if (isSafeToUseResponseCache(history)) {
    const cached = await getCachedAIResponse(cacheInput);

    if (cached) {
      return {
        cached: true,
        intent: cached.intent,
        model: cached.model,
        provider: 'cache',
        text: cached.text,
        usedDeepModel: false,
      };
    }
  }

  const response = await requestBackendReading({
    chartContext,
    deepAnalysis,
    history,
    kundli,
    language,
    message,
    safetyIdentifier: await getInstallDeviceId().catch(() => `mobile-${kundli.id}`),
    userPlan,
  });

  if (isSafeToUseResponseCache(history)) {
    await setCachedAIResponse(cacheInput, {
      createdAt: new Date().toISOString(),
      intent: response.intent ?? intent,
      model: response.model,
      text: response.text.trim(),
    }).catch(() => undefined);
  }

  return response;
}

export const askPredicta = askPridicta;

async function requestBackendReading(
  request: PridictaChatRequest,
): Promise<PridictaChatResponse> {
  const response = await fetch(`${env.astrologyApiUrl}/ask-pridicta`, {
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, 'Predicta could not answer right now.'),
    );
  }

  const payload = (await response.json()) as PridictaChatResponse;

  if (!payload.text?.trim()) {
    throw new Error('Predicta could not prepare a reading right now.');
  }

  return {
    ...payload,
    text: payload.text.trim(),
  };
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

function isSafeToUseResponseCache(
  history: PridictaChatRequest['history'],
): boolean {
  return history.filter(turn => turn.role === 'user').length === 0;
}
