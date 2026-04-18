import { GUEST_ACCESS_LIMITS } from '@pridicta/config/guestAccessLimits';
import type {
  GuestPassCode,
  GuestQuotaKind,
  PassCodeType,
  PassRedemptionRequest,
  PassRedemptionResult,
  RedeemedGuestPass,
} from '@pridicta/types';
import { sha256 } from '@pridicta/utils/sha256';
import { normalizeEmail } from './accessControlService';

const GENERIC_REDEMPTION_ERROR =
  'This pass code could not be redeemed. Please check the code or ask the person who shared it with you.';

const lastAttemptByKey = new Map<string, number[]>();
const MAX_ATTEMPTS_PER_WINDOW = 5;
const ATTEMPT_WINDOW_MS = 5 * 60 * 1000;

export function normalizePassCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

export function hashPassCode(code: string): string {
  return sha256(normalizePassCode(code));
}

export function formatPassCode(code: string): string {
  const normalized = normalizePassCode(code);
  return normalized.match(/.{1,4}/g)?.join('-') ?? normalized;
}

export function createGuestPassCode({
  accessLevel,
  allowedEmails,
  code,
  codeId,
  createdAt = new Date().toISOString(),
  createdBy,
  expiresAt,
  label,
  maxRedemptions,
  type,
}: {
  accessLevel: GuestPassCode['accessLevel'];
  allowedEmails?: string[];
  code: string;
  codeId: string;
  createdAt?: string;
  createdBy: string;
  expiresAt?: string;
  label: string;
  maxRedemptions: number;
  type: PassCodeType;
}): GuestPassCode {
  const config = GUEST_ACCESS_LIMITS[type];

  return {
    accessLevel,
    allowedEmails: allowedEmails?.map(email => email.toLowerCase()),
    codeHash: hashPassCode(code),
    codeId,
    createdAt,
    createdBy,
    deviceLimit: config.deviceLimit,
    expiresAt: expiresAt ?? addDays(createdAt, 365),
    isActive: true,
    label,
    maxRedemptions,
    redeemedByUserIds: [],
    redeemedDeviceIds: [],
    type,
    usageLimits: config.usageLimits,
  };
}

export function validateGuestPassCode(
  passCode: GuestPassCode | undefined,
  request: PassRedemptionRequest,
): PassRedemptionResult {
  const now = request.now ?? new Date();
  const rateLimitKey = `${request.userId}:${normalizePassCode(request.code)}`;

  if (isRateLimited(rateLimitKey, now)) {
    return {
      message: 'Please wait a moment before trying another pass code.',
      status: 'RATE_LIMITED',
    };
  }

  if (!passCode || passCode.codeHash !== hashPassCode(request.code)) {
    return { message: GENERIC_REDEMPTION_ERROR, status: 'INVALID' };
  }

  if (!passCode.isActive || passCode.revokedAt) {
    return { message: GENERIC_REDEMPTION_ERROR, status: 'INACTIVE' };
  }

  if (new Date(passCode.expiresAt).getTime() <= now.getTime()) {
    return {
      message: 'This guest pass has expired.',
      status: 'EXPIRED',
    };
  }

  if (passCode.redeemedByUserIds.includes(request.userId)) {
    return {
      message: 'This guest pass is already active on your account.',
      status: 'ALREADY_REDEEMED',
    };
  }

  if (passCode.redeemedByUserIds.length >= passCode.maxRedemptions) {
    return {
      message: 'This guest pass has already been fully redeemed.',
      status: 'MAX_REDEMPTIONS',
    };
  }

  if (
    passCode.allowedEmails?.length &&
    !passCode.allowedEmails.includes(normalizeEmail(request.email) ?? '')
  ) {
    return { message: GENERIC_REDEMPTION_ERROR, status: 'EMAIL_NOT_ALLOWED' };
  }

  const redeemedDeviceIds = passCode.redeemedDeviceIds ?? [];
  if (
    !redeemedDeviceIds.includes(request.deviceId) &&
    redeemedDeviceIds.length >= passCode.deviceLimit
  ) {
    return {
      message: 'This guest pass is already active on its allowed devices.',
      status: 'DEVICE_LIMIT',
    };
  }

  const redeemedAt = now.toISOString();
  const redeemedExpiresAt = addDays(
    redeemedAt,
    GUEST_ACCESS_LIMITS[passCode.type].durationDays,
  );
  const redeemedPass: RedeemedGuestPass = {
    accessLevel: passCode.accessLevel,
    deepReadingsUsed: 0,
    expiresAt: redeemedExpiresAt,
    label: passCode.label,
    passCodeId: passCode.codeId,
    premiumPdfsUsed: 0,
    questionsUsed: 0,
    redeemedAt,
    type: passCode.type,
    usageLimits: passCode.usageLimits,
  };

  return {
    redeemedPass,
    status: 'SUCCESS',
    updatedPassCode: {
      ...passCode,
      redeemedByUserIds: [...passCode.redeemedByUserIds, request.userId],
      redeemedDeviceIds: Array.from(
        new Set([...redeemedDeviceIds, request.deviceId]),
      ),
    },
  };
}

export function isGuestPassActive(
  pass?: RedeemedGuestPass,
  now = new Date(),
): pass is RedeemedGuestPass {
  return Boolean(pass && new Date(pass.expiresAt).getTime() > now.getTime());
}

export function hasGuestQuota(
  pass: RedeemedGuestPass | undefined,
  kind: GuestQuotaKind,
): boolean {
  if (!isGuestPassActive(pass)) {
    return false;
  }

  if (kind === 'question') {
    return pass.questionsUsed < pass.usageLimits.questionsTotal;
  }

  if (kind === 'deep_reading') {
    return pass.deepReadingsUsed < pass.usageLimits.deepReadingsTotal;
  }

  return pass.premiumPdfsUsed < pass.usageLimits.premiumPdfsTotal;
}

export function consumeGuestQuota(
  pass: RedeemedGuestPass,
  kind: GuestQuotaKind,
): RedeemedGuestPass {
  if (kind === 'question') {
    return { ...pass, questionsUsed: pass.questionsUsed + 1 };
  }

  if (kind === 'deep_reading') {
    return { ...pass, deepReadingsUsed: pass.deepReadingsUsed + 1 };
  }

  return { ...pass, premiumPdfsUsed: pass.premiumPdfsUsed + 1 };
}

export function getGuestAccessLabel(pass?: RedeemedGuestPass): string {
  if (!pass) {
    return 'Free guidance active';
  }

  if (pass.accessLevel === 'FULL_ACCESS') {
    return 'Full access active';
  }

  if (pass.accessLevel === 'VIP_GUEST') {
    return 'VIP Guest Pass active';
  }

  return 'Guest Pass active';
}

function addDays(date: string, days: number): string {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

function isRateLimited(key: string, now: Date): boolean {
  const windowStart = now.getTime() - ATTEMPT_WINDOW_MS;
  const attempts = (lastAttemptByKey.get(key) ?? []).filter(
    attempt => attempt > windowStart,
  );
  attempts.push(now.getTime());
  lastAttemptByKey.set(key, attempts);

  return attempts.length > MAX_ATTEMPTS_PER_WINDOW;
}

export function resetPassCodeRateLimits(): void {
  lastAttemptByKey.clear();
}
