import type {
  GuestPassCode,
  PassRedemptionRequest,
  PassRedemptionResult,
  RedeemedGuestPass,
} from '../../types/access';
import { env } from '../../config/env';
import {
  accessPassCodeDocument,
  accessPassCodesCollection,
  serverTimestamp,
  userDocument,
} from './dbService';

export async function fetchPassCodeByHash(
  codeHash: string,
): Promise<GuestPassCode | undefined> {
  const snapshot = await accessPassCodesCollection()
    .where('codeHash', '==', codeHash)
    .limit(1)
    .get();
  const document = snapshot.docs[0];

  return document?.data() as GuestPassCode | undefined;
}

export async function redeemPassCodeWithFirebase(
  request: PassRedemptionRequest,
): Promise<PassRedemptionResult> {
  const backendResult = await redeemPassCodeWithBackend(request);

  if (backendResult) {
    return backendResult;
  }

  return {
    message:
      'Guest pass check is unavailable right now. Please check your internet connection and try again.',
    status: 'NETWORK_ERROR',
  };
}

async function redeemPassCodeWithBackend(
  request: PassRedemptionRequest,
): Promise<PassRedemptionResult | undefined> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);
  try {
    const response = await fetch(
      `${env.astrologyApiUrl.replace(/\/$/, '')}/access/guest-pass/redeem`,
      {
        body: JSON.stringify(request),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        message:
          'Guest pass check is unavailable right now. Please check your internet connection and try again.',
        status: 'NETWORK_ERROR',
      };
    }

    return (await response.json()) as PassRedemptionResult;
  } catch {
    clearTimeout(timeout);
    return undefined;
  }
}

export async function syncRedeemedGuestPassToUser(
  userId: string,
  redeemedPass: RedeemedGuestPass,
): Promise<void> {
  await userDocument(userId).set(
    {
      access: {
        accessLevel: redeemedPass.accessLevel,
        activeGuestPass: redeemedPass,
        source: 'guest_pass',
        updatedAt: serverTimestamp(),
      },
      guestPassUsage: {
        deepReadingsUsed: redeemedPass.deepReadingsUsed,
        lastUsedAt: serverTimestamp(),
        passCodeId: redeemedPass.passCodeId,
        premiumPdfsUsed: redeemedPass.premiumPdfsUsed,
        questionsUsed: redeemedPass.questionsUsed,
      },
    },
    { merge: true },
  );
}

export async function loadRedeemedGuestPassFromFirebase(
  userId: string,
): Promise<RedeemedGuestPass | undefined> {
  const snapshot = await userDocument(userId).get();
  const data = snapshot.data();

  return data?.access?.activeGuestPass as RedeemedGuestPass | undefined;
}

export async function createGuestPassCodeInFirebase(
  passCode: GuestPassCode,
): Promise<void> {
  await accessPassCodeDocument(passCode.codeId).set(passCode, { merge: true });
}

export async function revokeGuestPassCodeInFirebase({
  codeId,
  reason,
}: {
  codeId: string;
  reason: string;
}): Promise<void> {
  await accessPassCodeDocument(codeId).set(
    {
      isActive: false,
      revokeReason: reason,
      revokedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function listActiveGuestPassCodes(): Promise<GuestPassCode[]> {
  const snapshot = await accessPassCodesCollection()
    .where('isActive', '==', true)
    .get();

  return snapshot.docs.map(document => document.data() as GuestPassCode);
}

export async function getGuestPassUsageSummary(userId: string): Promise<{
  deepReadingsUsed: number;
  passCodeId?: string;
  premiumPdfsUsed: number;
  questionsUsed: number;
}> {
  const snapshot = await userDocument(userId).get();
  const usage = snapshot.data()?.guestPassUsage;

  return {
    deepReadingsUsed: usage?.deepReadingsUsed ?? 0,
    passCodeId: usage?.passCodeId,
    premiumPdfsUsed: usage?.premiumPdfsUsed ?? 0,
    questionsUsed: usage?.questionsUsed ?? 0,
  };
}
