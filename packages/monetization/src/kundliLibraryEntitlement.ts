export const FREE_SAVED_KUNDLI_LIMIT = 4;
export const PREMIUM_KUNDLI_DAILY_SOFT_LIMIT = 30;

export type KundliLibraryEntitlementReason =
  | 'FREE_KUNDLI_LIMIT_REACHED'
  | 'PREMIUM_KUNDLI_DAILY_SOFT_LIMIT_REACHED'
  | 'SIGN_IN_REQUIRED_FOR_MULTIPLE_KUNDLIS';

export type KundliLibraryEntitlementInput = {
  existingKundli?: boolean;
  generatedKundlisToday?: number;
  hasPremiumAccess?: boolean;
  isUpdate?: boolean;
  savedKundliCount: number;
  signedIn: boolean;
};

export type KundliLibraryEntitlementDecision = {
  allowed: boolean;
  limit: number | 'unlimited';
  reason?: KundliLibraryEntitlementReason;
  remaining: number | 'unlimited';
  savedKundliCount: number;
};

export function evaluateKundliLibraryEntitlement({
  existingKundli = false,
  generatedKundlisToday = 0,
  hasPremiumAccess = false,
  isUpdate = false,
  savedKundliCount,
  signedIn,
}: KundliLibraryEntitlementInput): KundliLibraryEntitlementDecision {
  const safeSavedCount = Math.max(0, savedKundliCount);

  if (isUpdate || existingKundli) {
    return {
      allowed: true,
      limit: hasPremiumAccess ? 'unlimited' : FREE_SAVED_KUNDLI_LIMIT,
      remaining: hasPremiumAccess
        ? 'unlimited'
        : Math.max(0, FREE_SAVED_KUNDLI_LIMIT - safeSavedCount),
      savedKundliCount: safeSavedCount,
    };
  }

  if (!signedIn) {
    return {
      allowed: false,
      limit: FREE_SAVED_KUNDLI_LIMIT,
      reason: 'SIGN_IN_REQUIRED_FOR_MULTIPLE_KUNDLIS',
      remaining: 0,
      savedKundliCount: safeSavedCount,
    };
  }

  if (hasPremiumAccess) {
    if (generatedKundlisToday >= PREMIUM_KUNDLI_DAILY_SOFT_LIMIT) {
      return {
        allowed: false,
        limit: 'unlimited',
        reason: 'PREMIUM_KUNDLI_DAILY_SOFT_LIMIT_REACHED',
        remaining: 'unlimited',
        savedKundliCount: safeSavedCount,
      };
    }

    return {
      allowed: true,
      limit: 'unlimited',
      remaining: 'unlimited',
      savedKundliCount: safeSavedCount,
    };
  }

  if (safeSavedCount >= FREE_SAVED_KUNDLI_LIMIT) {
    return {
      allowed: false,
      limit: FREE_SAVED_KUNDLI_LIMIT,
      reason: 'FREE_KUNDLI_LIMIT_REACHED',
      remaining: 0,
      savedKundliCount: safeSavedCount,
    };
  }

  return {
    allowed: true,
    limit: FREE_SAVED_KUNDLI_LIMIT,
    remaining: Math.max(0, FREE_SAVED_KUNDLI_LIMIT - safeSavedCount),
    savedKundliCount: safeSavedCount,
  };
}
