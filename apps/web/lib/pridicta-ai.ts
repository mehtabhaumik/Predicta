import type {
  BirthDetailsExtractionResult,
  PridictaChatRequest,
  PridictaChatResponse,
} from '@pridicta/types';
import {
  FREE_AI_QUESTION_LIFETIME_LIMIT,
  type ServerEntitlementLedger,
} from '@pridicta/monetization';
import { getWebAuthHeaders } from './firebase/auth-token';

export async function askPridictaFromWeb(
  request: PridictaChatRequest,
): Promise<PridictaChatResponse> {
  const authHeaders = await getWebAuthHeaders();
  const response = await fetch('/api/ask-pridicta', {
    body: JSON.stringify({
      ...request,
      clientRequestId: request.clientRequestId ?? createClientRequestId(),
      safetyIdentifier: request.safetyIdentifier ?? getWebSafetyIdentifier(),
    }),
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Predicta could not answer right now.'));
  }

  return (await response.json()) as PridictaChatResponse;
}

function createClientRequestId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
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

export async function loadWebFreeAiBalance(): Promise<
  | {
      remaining: number;
      total: number;
    }
  | undefined
> {
  try {
    const authHeaders = await getWebAuthHeaders();
    const response = await fetch('/api/entitlements/ledger', {
      headers: authHeaders,
      method: 'GET',
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as { ledger?: ServerEntitlementLedger };
    if (!payload.ledger) {
      return undefined;
    }

    return {
      remaining: Math.max(
        0,
        FREE_AI_QUESTION_LIFETIME_LIMIT - payload.ledger.freeAiCreditsUsed,
      ),
      total: FREE_AI_QUESTION_LIFETIME_LIMIT,
    };
  } catch {
    return undefined;
  }
}

export async function loadWebProductBankBalance(): Promise<
  | {
      familyReportCredits: number;
      familySharedMembers: number;
      familySharingEnabled: boolean;
      familyQuestionCredits: number;
      paidQuestionCredits: number;
      familyReportCreditsByType: Partial<Record<string, number>>;
      reportCreditsByType: Partial<Record<string, number>>;
      reportCredits: number;
    }
  | undefined
> {
  try {
    const authHeaders = await getWebAuthHeaders();
    const response = await fetch('/api/entitlements/ledger', {
      headers: authHeaders,
      method: 'GET',
    });

    if (!response.ok) {
      return undefined;
    }

    const payload = (await response.json()) as { ledger?: ServerEntitlementLedger };
    if (!payload.ledger) {
      return undefined;
    }

    return {
      familyQuestionCredits: payload.ledger.familyBank.sharedQuestionCreditsBalance,
      familyReportCredits: sumCreditMap(payload.ledger.familyBank.sharedReportCreditsByType),
      familyReportCreditsByType: payload.ledger.familyBank.sharedReportCreditsByType,
      familySharedMembers: payload.ledger.familyBank.memberUids.length,
      familySharingEnabled:
        payload.ledger.familyBank.memberUids.length > 1 ||
        payload.ledger.familyBank.sharedQuestionCreditsBalance > 0 ||
        sumCreditMap(payload.ledger.familyBank.sharedReportCreditsByType) > 0,
      paidQuestionCredits: payload.ledger.paidAiQuestionCreditsBalance,
      reportCreditsByType: payload.ledger.reportCreditsByType,
      reportCredits: sumCreditMap(payload.ledger.reportCreditsByType),
    };
  } catch {
    return undefined;
  }
}

function sumCreditMap(value: Partial<Record<string, number>>): number {
  return Object.values(value).reduce<number>(
    (total, amount) => total + Math.max(0, Number(amount) || 0),
    0,
  );
}

export async function extractBirthDetailsFromWeb(
  text: string,
  options: { allowProviderFallback?: boolean } = {},
): Promise<BirthDetailsExtractionResult> {
  const authHeaders = await getWebAuthHeaders();
  const response = await fetch('/api/extract-birth-details', {
    body: JSON.stringify({
      allowProviderFallback: options.allowProviderFallback === true,
      rulesOnly: options.allowProviderFallback !== true,
      text,
    }),
    headers: {
      ...authHeaders,
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
