import { useAppStore } from '../src/store/useAppStore';
import type { RedeemedGuestPass } from '../src/types/access';

function resetStore() {
  useAppStore.setState({
    auth: {
      isLoggedIn: false,
      provider: null,
    },
    redeemedGuestPass: undefined,
    usage: {
      dayKey: new Date().toISOString().slice(0, 10),
      deepCallsToday: 0,
      monthKey: new Date().toISOString().slice(0, 7),
      pdfsThisMonth: 0,
      questionsToday: 0,
    },
    userPlan: 'FREE',
  });
}

function guestPass(
  overrides: Partial<RedeemedGuestPass> = {},
): RedeemedGuestPass {
  return {
    accessLevel: 'GUEST',
    deepReadingsUsed: 0,
    expiresAt: '2099-01-01T00:00:00.000Z',
    label: 'Guest trial',
    passCodeId: 'guest-trial-01',
    premiumPdfsUsed: 0,
    questionsUsed: 0,
    redeemedAt: '2026-04-18T00:00:00.000Z',
    type: 'GUEST_TRIAL',
    usageLimits: {
      deepReadingsTotal: 1,
      premiumPdfsTotal: 1,
      questionsTotal: 1,
    },
    ...overrides,
  };
}

describe('guest access store integration', () => {
  beforeEach(resetStore);

  it('allows active guest pass access and consumes quota only on success', () => {
    useAppStore.getState().setRedeemedGuestPass(guestPass());

    expect(useAppStore.getState().canAskQuestion()).toBe(true);
    expect(useAppStore.getState().consumeGuestQuestionQuota()).toBe(true);
    expect(useAppStore.getState().canAskQuestion()).toBe(false);
  });

  it('gives admin whitelist unrestricted app access', () => {
    useAppStore.getState().setAuth({
      email: 'ui.bhaumik@gmail.com',
      isLoggedIn: true,
      provider: 'google',
      userId: 'admin',
    });

    const access = useAppStore.getState().getResolvedAccess();
    expect(access.isAdmin).toBe(true);
    expect(access.hasUnrestrictedAppAccess).toBe(true);
    expect(useAppStore.getState().canAskQuestion()).toBe(true);
    expect(useAppStore.getState().canGeneratePdf()).toBe(true);
  });
});
