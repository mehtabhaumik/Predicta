import {
  resolveAccess,
  canSeeAdminRoute,
} from '../src/services/access/accessResolver';
import { createFreeEntitlement } from '../src/types/subscription';
import type { MonetizationState } from '../src/types/subscription';
import type { RedeemedGuestPass } from '../src/types/access';

function monetization(): MonetizationState {
  return {
    entitlement: createFreeEntitlement('local'),
    oneTimeEntitlements: [],
  };
}

function guestPass(): RedeemedGuestPass {
  return {
    accessLevel: 'VIP_GUEST',
    deepReadingsUsed: 0,
    expiresAt: '2099-01-01T00:00:00.000Z',
    label: 'VIP review pass',
    passCodeId: 'vip-review-01',
    premiumPdfsUsed: 0,
    questionsUsed: 0,
    redeemedAt: '2026-04-18T00:00:00.000Z',
    type: 'VIP_REVIEW',
    usageLimits: {
      deepReadingsTotal: 30,
      premiumPdfsTotal: 5,
      questionsTotal: 150,
    },
  };
}

describe('access resolver', () => {
  it('resolves admin whitelist before any other access', () => {
    const result = resolveAccess({
      auth: { email: 'UI.BHAUMIK@gmail.com', userId: 'admin' },
      monetization: monetization(),
      redeemedGuestPass: guestPass(),
    });

    expect(result.accessLevel).toBe('ADMIN');
    expect(result.isAdmin).toBe(true);
    expect(result.hasUnrestrictedAppAccess).toBe(true);
    expect(canSeeAdminRoute(result)).toBe(true);
  });

  it('resolves full access whitelist without admin tools', () => {
    const result = resolveAccess({
      auth: { email: 'sonalimehta.shilpan@gmail.com', userId: 'full' },
      monetization: monetization(),
    });

    expect(result.accessLevel).toBe('FULL_ACCESS');
    expect(result.isAdmin).toBe(false);
    expect(result.hasPremiumAccess).toBe(true);
    expect(canSeeAdminRoute(result)).toBe(false);
  });

  it('keeps the configured priority over guest passes', () => {
    const state = monetization();
    state.entitlement = {
      activeProductId: 'pridicta_premium_monthly',
      plan: 'PREMIUM',
      source: 'mock',
      status: 'ACTIVE',
      updatedAt: '2026-04-18T00:00:00.000Z',
    };

    const result = resolveAccess({
      auth: { email: 'guest@example.com', userId: 'user' },
      monetization: state,
      redeemedGuestPass: guestPass(),
    });

    expect(result.source).toBe('subscription');
    expect(result.hasPremiumAccess).toBe(true);
  });
});
