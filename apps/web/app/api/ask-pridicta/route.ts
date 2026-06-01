import { createHash } from 'node:crypto';
import {
  FREE_AI_QUESTION_LIFETIME_LIMIT,
  type ServerEntitlementLedger,
} from '@pridicta/monetization';
import type { PridictaChatResponse } from '@pridicta/types';
import { getAstroApiUrl, readJsonBody } from '../../../lib/astro-api';
import { requireFirebaseUser } from '../../../lib/firebase/server-auth';
import {
  commitServerEntitlementOperation,
  readServerEntitlementLedger,
} from '../../../lib/firebase/server-entitlement-ledger';

const MAX_SERVER_HISTORY_MESSAGES = 8;
const MAX_SERVER_MESSAGE_CHARS = 4000;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const auth = await requireFirebaseUser(request);
  if (!auth.ok) {
    return auth.response;
  }

  const payload = await readJsonBody(request);

  if (!payload.ok) {
    return payload.response;
  }

  const trimmedPayload = trimAskPridictaPayload(payload.body);
  const ledger = await readServerEntitlementLedger(auth.user);
  const freeGate = evaluateFreeAiGate(ledger, trimmedPayload);

  if (freeGate.blocked) {
    return Response.json(
      buildFreeAiUpsellResponse({
        ledger,
        payload: trimmedPayload,
      }),
    );
  }

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(`${getAstroApiUrl()}/ask-pridicta`, {
      body: JSON.stringify(trimmedPayload),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  } catch {
    return Response.json(
      {
        detail:
          'Predicta calculation service is not reachable right now. Please try again shortly.',
      },
      { status: 503 },
    );
  }

  const text = await upstream.text();

  if (!upstream.ok) {
    return new Response(text, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
      },
      status: upstream.status,
    });
  }

  const response = parseChatResponse(text);
  if (!response) {
    return new Response(text, {
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json',
      },
      status: upstream.status,
    });
  }

  let nextLedger = ledger;
  if (freeGate.usesFreeCredit && isProviderAiResponse(response)) {
    const result = await commitServerEntitlementOperation({
      operation: {
        idempotencyKey: buildFreeAiIdempotencyKey(auth.user.uid, trimmedPayload),
        kind: 'record_successful_free_ai_answer',
      },
      user: auth.user,
    });
    nextLedger = result.ledger;

    if (!result.changed && result.reason === 'free_ai_lifetime_exhausted') {
      return Response.json(
        buildFreeAiUpsellResponse({
          ledger: result.ledger,
          payload: trimmedPayload,
        }),
      );
    }
  }

  return Response.json({
    ...response,
    freeAiCreditsRemaining: getFreeAiCreditsRemaining(nextLedger),
    freeAiCreditsTotal: FREE_AI_QUESTION_LIFETIME_LIMIT,
  } satisfies PridictaChatResponse);
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

function evaluateFreeAiGate(
  ledger: ServerEntitlementLedger,
  body: unknown,
): { blocked: boolean; usesFreeCredit: boolean } {
  if (hasNonFreeAiAccess(ledger) || getUserPlan(body) === 'PREMIUM') {
    return {
      blocked: false,
      usesFreeCredit: false,
    };
  }

  const remaining = getFreeAiCreditsRemaining(ledger);
  return {
    blocked: remaining <= 0,
    usesFreeCredit: true,
  };
}

function hasNonFreeAiAccess(ledger: ServerEntitlementLedger): boolean {
  return (
    ledger.premiumEntitlement.status === 'ACTIVE' ||
    ledger.premiumEntitlement.status === 'GRACE_PERIOD' ||
    ledger.paidAiQuestionCreditsBalance > 0 ||
    ledger.familyBank.sharedQuestionCreditsBalance > 0 ||
    (ledger.dayPassEntitlement.active &&
      ledger.dayPassEntitlement.questionsRemaining > 0)
  );
}

function getUserPlan(body: unknown): string | undefined {
  return body && typeof body === 'object' && !Array.isArray(body)
    ? String((body as Record<string, unknown>).userPlan ?? '')
    : undefined;
}

function getFreeAiCreditsRemaining(ledger: ServerEntitlementLedger): number {
  return Math.max(
    0,
    FREE_AI_QUESTION_LIFETIME_LIMIT - ledger.freeAiCreditsUsed,
  );
}

function parseChatResponse(text: string): PridictaChatResponse | undefined {
  try {
    const parsed = JSON.parse(text) as Partial<PridictaChatResponse>;
    return typeof parsed.text === 'string' && typeof parsed.provider === 'string'
      ? (parsed as PridictaChatResponse)
      : undefined;
  } catch {
    return undefined;
  }
}

function isProviderAiResponse(response: PridictaChatResponse): boolean {
  return response.provider === 'openai' || response.provider === 'gemini';
}

function buildFreeAiIdempotencyKey(uid: string, body: unknown): string {
  const payload =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const clientRequestId =
    typeof payload.clientRequestId === 'string' && payload.clientRequestId.trim()
      ? payload.clientRequestId.trim()
      : createHash('sha256')
          .update(`${uid}:${String(payload.message ?? '')}:${Date.now()}`)
          .digest('hex');
  return `free-ai:${uid}:${clientRequestId}`;
}

function buildFreeAiUpsellResponse({
  ledger,
  payload,
}: {
  ledger: ServerEntitlementLedger;
  payload: unknown;
}): PridictaChatResponse {
  const preservedQuestion =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? String((payload as Record<string, unknown>).message ?? '').trim()
      : '';

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
      'Choose 10 questions, 25 questions, 100 questions, or Premium to continue with AI. I can still help with deterministic Kundli, charts, reports, and Family Vault actions without spending AI.',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
}
