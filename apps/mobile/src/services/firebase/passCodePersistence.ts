import type {
  GuestPassCode,
  GuestPassUsageSummary,
  PassRedemptionRequest,
  PassRedemptionResult,
  RedeemedGuestPass,
} from '@pridicta/types';
import type { BackendGuestPassCreateResult } from '@pridicta/firebase';
import { getBackendAuthorityClient } from '../backend/backendAuthorityClient';
import { accessPassCodesCollection, serverTimestamp, userDocument } from './dbService';

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
  try {
    const redeemedPass = await getBackendAuthorityClient().redeemPassCode({
      code: request.code,
      deviceId: request.deviceId,
    });

    return {
      redeemedPass,
      status: 'SUCCESS',
      updatedPassCode: createBackendPassSnapshot(redeemedPass),
    };
  } catch {
    return {
      message:
        'Guest pass redemption needs a secure internet connection. Please sign in and try again.',
      status: 'NETWORK_ERROR',
    };
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

export async function createGuestPassCodeInFirebase({
  passCode,
}: {
  actorEmail?: string;
  actorUserId: string;
  passCode: GuestPassCode;
}): Promise<BackendGuestPassCreateResult> {
  return getBackendAuthorityClient().createGuestPassCode({
    accessLevel: passCode.accessLevel,
    allowedEmails: passCode.allowedEmails,
    codeId: passCode.codeId,
    expiresAt: passCode.expiresAt,
    label: passCode.label,
    maxRedemptions: passCode.maxRedemptions,
    type: passCode.type,
  });
}

export async function revokeGuestPassCodeInFirebase({
  codeId,
  reason,
}: {
  actorEmail?: string;
  actorUserId: string;
  codeId: string;
  reason: string;
}): Promise<void> {
  await getBackendAuthorityClient().revokeGuestPassCode(codeId, reason);
}

export async function listActiveGuestPassCodes(): Promise<
  GuestPassUsageSummary[]
> {
  return getBackendAuthorityClient().listGuestPassCodes();
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

function createBackendPassSnapshot(redeemedPass: RedeemedGuestPass): GuestPassCode {
  return {
    accessLevel: redeemedPass.accessLevel,
    codeHash: 'backend-authority',
    codeId: redeemedPass.passCodeId,
    createdAt: redeemedPass.redeemedAt,
    createdBy: 'backend-authority',
    deviceLimit: 0,
    expiresAt: redeemedPass.expiresAt,
    isActive: true,
    label: redeemedPass.label,
    maxRedemptions: 0,
    redeemedByUserIds: [],
    redeemedDeviceIds: [],
    type: redeemedPass.type,
    usageLimits: redeemedPass.usageLimits,
  };
}
