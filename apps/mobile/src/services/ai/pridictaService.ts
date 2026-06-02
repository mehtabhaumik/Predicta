import {
  FREE_AI_QUESTION_LIFETIME_LIMIT,
  evaluateAiCreditEntitlement,
  selectPaidAiCreditSpendSource,
  shouldConsumeDayPassAiCredit,
  shouldConsumeFreeAiCredit,
} from '@pridicta/monetization';
import { env } from '../../config/env';
import type {
  PridictaChatRequest,
  PridictaChatResponse,
} from '../../types/astrology';
import { getCurrentAuthState } from '../firebase/authService';
import {
  commitServerEntitlementOperationToFirebase,
  loadServerEntitlementLedgerFromFirebase,
} from '../firebase/serverEntitlementLedgerSync';
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
  const auth = await getCurrentAuthState();
  const ledger = auth.userId
    ? await loadServerEntitlementLedgerFromFirebase(auth.userId).catch(() => undefined)
    : undefined;
  const requestId = createClientRequestId();
  const aiEntitlement = ledger
    ? evaluateAiCreditEntitlement(ledger, userPlan)
    : undefined;

  if (ledger && aiEntitlement && !aiEntitlement.allowed) {
    return buildFreeAiUpsellResponse({
      ledger,
      message,
    });
  }

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
    aiCostGovernance: {
      entitlementSource: aiEntitlement?.allowed
        ? aiEntitlement.creditSource === 'personal'
          ? 'paid_question_pack'
          : aiEntitlement.creditSource
        : 'free_lifetime_ai_credit',
      productCreditSource: aiEntitlement
        ? selectPaidAiCreditSpendSource(aiEntitlement) ?? null
        : null,
    },
    chartContext,
    clientRequestId: requestId,
    deepAnalysis,
    history,
    kundli,
    language,
    message,
    safetyIdentifier: await getInstallDeviceId().catch(() => `mobile-${kundli.id}`),
    userPlan,
  });

  let nextLedger = ledger;
  if (
    auth.userId &&
    ledger &&
    aiEntitlement &&
    shouldConsumeFreeAiCredit(aiEntitlement) &&
    isProviderAiResponse(response)
  ) {
    const result = await commitServerEntitlementOperationToFirebase({
      operation: {
        idempotencyKey: `free-ai:${auth.userId}:${requestId}`,
        kind: 'record_successful_free_ai_answer',
      },
      userId: auth.userId,
    });
    nextLedger = result.ledger;

    if (!result.changed && result.reason === 'free_ai_lifetime_exhausted') {
      return buildFreeAiUpsellResponse({
        ledger: result.ledger,
        message,
      });
    }
  } else if (
    auth.userId &&
    ledger &&
    aiEntitlement &&
    shouldConsumeDayPassAiCredit(aiEntitlement) &&
    isProviderAiResponse(response)
  ) {
    const result = await commitServerEntitlementOperationToFirebase({
      operation: {
        idempotencyKey: `day-pass-ai:${auth.userId}:${requestId}`,
        kind: 'record_successful_day_pass_ai_answer',
      },
      userId: auth.userId,
    });
    nextLedger = result.ledger;
  } else if (auth.userId && ledger && aiEntitlement && isProviderAiResponse(response)) {
    const paidCreditSource = selectPaidAiCreditSpendSource(aiEntitlement);

    if (paidCreditSource) {
      const result = await commitServerEntitlementOperationToFirebase({
        operation: {
          idempotencyKey: `paid-ai:${auth.userId}:${paidCreditSource}:${requestId}`,
          kind: 'record_successful_paid_ai_answer',
          source: paidCreditSource,
        },
        userId: auth.userId,
      });
      nextLedger = result.ledger;
    }
  }

  if (isSafeToUseResponseCache(history)) {
    await setCachedAIResponse(cacheInput, {
      createdAt: new Date().toISOString(),
      intent: response.intent ?? intent,
      model: response.model,
      text: response.text.trim(),
    }).catch(() => undefined);
  }

  return {
    ...response,
    freeAiCreditsRemaining: nextLedger
      ? getFreeAiCreditsRemaining(nextLedger)
      : response.freeAiCreditsRemaining,
    freeAiCreditsTotal: FREE_AI_QUESTION_LIFETIME_LIMIT,
  };
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

function getFreeAiCreditsRemaining(
  ledger: Awaited<ReturnType<typeof loadServerEntitlementLedgerFromFirebase>>,
): number {
  return Math.max(
    0,
    FREE_AI_QUESTION_LIFETIME_LIMIT - ledger.freeAiCreditsUsed,
  );
}

function buildFreeAiUpsellResponse({
  ledger,
  message,
}: {
  ledger: Awaited<ReturnType<typeof loadServerEntitlementLedgerFromFirebase>>;
  message: string;
}): PridictaChatResponse {
  const preservedQuestion = message.trim();
  return {
    freeAiCreditsRemaining: getFreeAiCreditsRemaining(ledger),
    freeAiCreditsTotal: FREE_AI_QUESTION_LIFETIME_LIMIT,
    freeAiUpsell: {
      blocked: true,
      preservedQuestion,
      purchaseOptions: ['10 questions', '25 questions', '100 questions', 'Premium'],
    },
    model: 'predicta-entitlement-ledger',
    provider: 'deterministic',
    text: [
      'Your 3 free AI questions are used.',
      'I preserved your question so you can continue after unlocking more Predicta AI guidance.',
      preservedQuestion ? `Saved question: "${preservedQuestion}"` : undefined,
      'Choose 10 questions, 25 questions, 100 questions, or Premium to continue with AI. Deterministic Kundli, charts, reports, and Family Vault actions still work without AI spend.',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
}

function isProviderAiResponse(response: PridictaChatResponse): boolean {
  return response.provider === 'openai' || response.provider === 'gemini';
}

function createClientRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
