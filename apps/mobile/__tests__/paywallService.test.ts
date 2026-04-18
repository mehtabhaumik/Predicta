import {
  canShowPaywallForAction,
  getPaywallContext,
  markPaywallShown,
  resetPaywallCooldowns,
  shouldShowPaywall,
} from '../src/services/paywall/paywallService';

describe('paywallService', () => {
  beforeEach(() => resetPaywallCooldowns());

  it('does not show subscription paywall to premium users', () => {
    expect(shouldShowPaywall('LOCKED_CHART_TAPPED', 'PREMIUM')).toBe(false);
    expect(shouldShowPaywall('QUESTION_LIMIT_REACHED', 'FREE')).toBe(true);
  });

  it('returns calm contextual copy and applies cooldown', () => {
    const context = getPaywallContext('QUESTION_LIMIT_REACHED');

    expect(context.primaryCta).toBe('Add 5 Questions');
    expect(context.message).toContain('chart context is saved');
    expect(canShowPaywallForAction('QUESTION_LIMIT_REACHED')).toBe(true);
    markPaywallShown('QUESTION_LIMIT_REACHED');
    expect(canShowPaywallForAction('QUESTION_LIMIT_REACHED')).toBe(false);
  });
});
