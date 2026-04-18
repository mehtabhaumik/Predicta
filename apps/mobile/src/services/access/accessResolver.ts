import type { AuthState } from '../../types/astrology';
import type { RedeemedGuestPass, ResolvedAccess } from '../../types/access';
import type { MonetizationState } from '../../types/subscription';
import {
  getPaidQuestionCredits,
  hasActiveDayPass,
  isPremium,
} from '../subscription/entitlementService';
import { getWhitelistedAccessLevel } from './accessControlService';
import { isGuestPassActive } from './passCodeService';

export function resolveAccess({
  auth,
  monetization,
  redeemedGuestPass,
}: {
  auth: Pick<AuthState, 'email' | 'userId'>;
  monetization: MonetizationState;
  redeemedGuestPass?: RedeemedGuestPass;
}): ResolvedAccess {
  const whitelistAccess = getWhitelistedAccessLevel(auth.email);

  if (whitelistAccess === 'ADMIN') {
    return {
      accessLevel: 'ADMIN',
      hasPremiumAccess: true,
      hasUnrestrictedAppAccess: true,
      isAdmin: true,
      source: 'admin_whitelist',
    };
  }

  if (whitelistAccess === 'FULL_ACCESS') {
    return {
      accessLevel: 'FULL_ACCESS',
      hasPremiumAccess: true,
      hasUnrestrictedAppAccess: true,
      isAdmin: false,
      source: 'full_access_whitelist',
    };
  }

  if (isPremium(monetization.entitlement)) {
    return {
      accessLevel: 'FULL_ACCESS',
      hasPremiumAccess: true,
      hasUnrestrictedAppAccess: false,
      isAdmin: false,
      source: 'subscription',
    };
  }

  if (hasActiveDayPass(monetization.oneTimeEntitlements)) {
    return {
      accessLevel: 'VIP_GUEST',
      hasPremiumAccess: true,
      hasUnrestrictedAppAccess: false,
      isAdmin: false,
      source: 'day_pass',
    };
  }

  if (isGuestPassActive(redeemedGuestPass)) {
    return {
      accessLevel: redeemedGuestPass.accessLevel,
      activeGuestPass: redeemedGuestPass,
      hasPremiumAccess: true,
      hasUnrestrictedAppAccess: false,
      isAdmin: false,
      source: 'guest_pass',
    };
  }

  if (getPaidQuestionCredits(monetization.oneTimeEntitlements) > 0) {
    return {
      accessLevel: 'FREE',
      hasPremiumAccess: false,
      hasUnrestrictedAppAccess: false,
      isAdmin: false,
      source: 'one_time',
    };
  }

  return {
    accessLevel: 'FREE',
    hasPremiumAccess: false,
    hasUnrestrictedAppAccess: false,
    isAdmin: false,
    source: 'free',
  };
}

export function canSeeAdminRoute(access: ResolvedAccess): boolean {
  return access.isAdmin && access.source === 'admin_whitelist';
}
