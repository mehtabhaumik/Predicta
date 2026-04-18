import { buildUsageDisplay } from '../src/services/usage/usageDisplayService';
import {
  createDayPassEntitlement,
  createInitialMonetizationState,
} from '../src/services/subscription/entitlementService';

describe('usageDisplayService', () => {
  it('shows free counters calmly', () => {
    const display = buildUsageDisplay({
      monetization: createInitialMonetizationState(),
      usage: {
        dayKey: '2026-04-18',
        deepCallsToday: 0,
        monthKey: '2026-04',
        pdfsThisMonth: 0,
        questionsToday: 1,
      },
      userPlan: 'FREE',
    });

    expect(display.questionsText).toBe('2 guidance questions left today');
    expect(display.statusText).toBe('Your free guidance resets tomorrow');
  });

  it('shows day pass access when active', () => {
    const display = buildUsageDisplay({
      monetization: {
        ...createInitialMonetizationState(),
        oneTimeEntitlements: [
          createDayPassEntitlement('pridicta_day_pass_24h'),
        ],
      },
      usage: {
        dayKey: '2026-04-18',
        deepCallsToday: 1,
        monthKey: '2026-04',
        pdfsThisMonth: 0,
        questionsToday: 2,
      },
      userPlan: 'FREE',
    });

    expect(display.statusText).toBe('Day Pass active');
    expect(display.questionsText).toBe('8 guidance questions left today');
    expect(display.deepReadingsText).toBe('2 deep readings left');
  });
});
