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

    expect(display.questionsText).toBe('2 starter AI questions left');
    expect(display.statusText).toBe(
      'Free starter AI is lifetime-limited; deterministic guidance stays available',
    );
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
    expect(display.questionsText).toBe('3 starter AI questions left');
    expect(display.deepReadingsText).toBe('0 deep readings left');
  });
});
