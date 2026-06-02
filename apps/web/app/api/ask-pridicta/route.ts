import { createHash } from 'node:crypto';
import {
  AI_ABUSE_PROTECTION_LIMITS,
  AI_FREE_RUNTIME_POLICY,
  AI_PREMIUM_RUNTIME_POLICY,
  type AIGovernanceEntitlementSource,
} from '@pridicta/config/aiCostGovernance';
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

const abuseBuckets = new Map<string, { count: number; resetAt: number }>();
const MAX_SERVER_HISTORY_MESSAGES = AI_PREMIUM_RUNTIME_POLICY.maxHistoryTurns;
const MAX_SERVER_MESSAGE_CHARS = AI_PREMIUM_RUNTIME_POLICY.maxMessageChars;
const MAX_FREE_SERVER_HISTORY_MESSAGES = AI_FREE_RUNTIME_POLICY.maxHistoryTurns;
const MAX_FREE_SERVER_MESSAGE_CHARS = AI_FREE_RUNTIME_POLICY.maxMessageChars;

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

  const ledger = await readServerEntitlementLedger(auth.user);
  const freeGatePreview = evaluateFreeAiGate(ledger, payload.body);
  const abuseGate = evaluateAiAbuseProtection({
    deviceKey: readDeviceKey(payload.body),
    ipKey: readRequestIp(request),
    isFreeAiPath: freeGatePreview.usesFreeCredit,
  });

  if (!abuseGate.allowed) {
    return Response.json(
      {
        detail:
          'Predicta AI is cooling down for a moment to protect fair access and prevent automated abuse. Please try again shortly.',
        reason: abuseGate.reason,
      },
      { status: 429 },
    );
  }

  const trimmedPayload = trimAskPridictaPayload({
    body: payload.body,
    entitlementSource: selectAiEntitlementSource(ledger, payload.body),
    isFreeAiPath: freeGatePreview.usesFreeCredit,
    productCreditSource: selectPaidAiCreditSpendSource(ledger, payload.body),
  });
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
  } else if (isProviderAiResponse(response)) {
    const paidCreditSource = selectPaidAiCreditSpendSource(ledger, trimmedPayload);

    if (paidCreditSource) {
      const result = await commitServerEntitlementOperation({
        operation: {
          idempotencyKey: buildPaidAiIdempotencyKey(
            auth.user.uid,
            paidCreditSource,
            trimmedPayload,
          ),
          kind: 'record_successful_paid_ai_answer',
          source: paidCreditSource,
        },
        user: auth.user,
      });
      nextLedger = result.ledger;
    }
  }

  return Response.json({
    ...response,
    freeAiCreditsRemaining: getFreeAiCreditsRemaining(nextLedger),
    freeAiCreditsTotal: FREE_AI_QUESTION_LIFETIME_LIMIT,
  } satisfies PridictaChatResponse);
}

function trimAskPridictaPayload({
  body,
  entitlementSource,
  isFreeAiPath,
  productCreditSource,
}: {
  body: unknown;
  entitlementSource: AIGovernanceEntitlementSource;
  isFreeAiPath: boolean;
  productCreditSource: 'personal' | 'family_bank' | undefined;
}): unknown {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return body;
  }

  const payload = body as Record<string, unknown>;
  const maxHistoryMessages = isFreeAiPath
    ? MAX_FREE_SERVER_HISTORY_MESSAGES
    : MAX_SERVER_HISTORY_MESSAGES;
  const maxMessageChars = isFreeAiPath
    ? MAX_FREE_SERVER_MESSAGE_CHARS
    : MAX_SERVER_MESSAGE_CHARS;
  const history = Array.isArray(payload.history)
    ? payload.history.slice(-maxHistoryMessages)
    : payload.history;
  const message =
    typeof payload.message === 'string'
      ? payload.message.slice(0, maxMessageChars)
      : payload.message;

  return {
    ...payload,
    aiCostGovernance: {
      entitlementSource,
      productCreditSource: productCreditSource ?? null,
    },
    history,
    message,
  };
}

function evaluateAiAbuseProtection({
  deviceKey,
  ipKey,
  isFreeAiPath,
}: {
  deviceKey: string;
  ipKey: string;
  isFreeAiPath: boolean;
}): { allowed: boolean; reason: string } {
  const ipDecision = incrementAiAbuseBucket(
    `ip:${ipKey}`,
    AI_ABUSE_PROTECTION_LIMITS.perIpRequestsPerMinute,
  );
  if (!ipDecision.allowed) {
    return ipDecision;
  }

  if (deviceKey) {
    const deviceDecision = incrementAiAbuseBucket(
      `device:${deviceKey}`,
      AI_ABUSE_PROTECTION_LIMITS.perDeviceRequestsPerMinute,
    );
    if (!deviceDecision.allowed) {
      return deviceDecision;
    }
  }

  if (isFreeAiPath) {
    const freeDecision = incrementAiAbuseBucket(
      `free:${ipKey}:${deviceKey || 'unknown-device'}`,
      AI_ABUSE_PROTECTION_LIMITS.freeUserRequestsPerMinute,
    );
    if (!freeDecision.allowed) {
      return freeDecision;
    }
  }

  return {
    allowed: true,
    reason: 'ai-abuse-window-clear',
  };
}

function incrementAiAbuseBucket(
  key: string,
  limit: number,
): { allowed: boolean; reason: string } {
  const now = Date.now();
  const current = abuseBuckets.get(key);
  const bucket =
    current && current.resetAt > now
      ? current
      : {
          count: 0,
          resetAt: now + 60_000,
        };

  bucket.count += 1;
  abuseBuckets.set(key, bucket);

  if (bucket.count > limit) {
    return {
      allowed: false,
      reason: 'ai-abuse-rate-limit-exceeded-not-quota-authority',
    };
  }

  return {
    allowed: true,
    reason: 'ai-abuse-bucket-allowed',
  };
}

function readRequestIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unknown-ip'
  );
}

function readDeviceKey(body: unknown): string {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return '';
  }

  const payload = body as Record<string, unknown>;
  return typeof payload.safetyIdentifier === 'string'
    ? payload.safetyIdentifier.slice(0, 120)
    : '';
}

function selectAiEntitlementSource(
  ledger: ServerEntitlementLedger,
  body: unknown,
): AIGovernanceEntitlementSource {
  if (
    getUserPlan(body) === 'PREMIUM' ||
    ledger.premiumEntitlement.status === 'ACTIVE' ||
    ledger.premiumEntitlement.status === 'GRACE_PERIOD'
  ) {
    return 'premium_subscription';
  }

  if (ledger.paidAiQuestionCreditsBalance > 0) {
    return 'paid_question_pack';
  }

  if (ledger.familyBank.sharedQuestionCreditsBalance > 0) {
    return 'family_bank';
  }

  if (
    ledger.dayPassEntitlement.active &&
    ledger.dayPassEntitlement.questionsRemaining > 0
  ) {
    return 'day_pass';
  }

  return 'free_lifetime_ai_credit';
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

function selectPaidAiCreditSpendSource(
  ledger: ServerEntitlementLedger,
  body: unknown,
): 'personal' | 'family_bank' | undefined {
  if (
    getUserPlan(body) === 'PREMIUM' ||
    ledger.premiumEntitlement.status === 'ACTIVE' ||
    ledger.premiumEntitlement.status === 'GRACE_PERIOD' ||
    (ledger.dayPassEntitlement.active &&
      ledger.dayPassEntitlement.questionsRemaining > 0)
  ) {
    return undefined;
  }

  if (ledger.paidAiQuestionCreditsBalance > 0) {
    return 'personal';
  }

  if (ledger.familyBank.sharedQuestionCreditsBalance > 0) {
    return 'family_bank';
  }

  return undefined;
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

function buildPaidAiIdempotencyKey(
  uid: string,
  source: 'personal' | 'family_bank',
  body: unknown,
): string {
  const payload =
    body && typeof body === 'object' && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const clientRequestId =
    typeof payload.clientRequestId === 'string' && payload.clientRequestId.trim()
      ? payload.clientRequestId.trim()
      : createHash('sha256')
          .update(`${uid}:${source}:${String(payload.message ?? '')}:${Date.now()}`)
          .digest('hex');
  return `paid-ai:${uid}:${source}:${clientRequestId}`;
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
