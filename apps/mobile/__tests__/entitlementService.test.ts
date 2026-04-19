import {
  consumeOneTimeQuestionCreditFromState,
  consumeOneTimeReportCreditFromState,
  consumeLifeTimelineReportCreditFromState,
  consumePremiumPdfCreditFromState,
  createDayPassEntitlement,
  createInitialMonetizationState,
  hasActiveDayPass,
  hasPremiumAccess,
  hasLifeTimelineReportCredit,
  hasOneTimeReportCredit,
  hasPremiumPdfCredit,
  isPremium,
} from '../src/services/subscription/entitlementService';
import type { MonetizationState } from '../src/types/subscription';

describe('entitlementService', () => {
  it('detects premium subscription and active day pass access', () => {
    const state = createInitialMonetizationState();

    expect(isPremium(state.entitlement)).toBe(false);
    expect(hasPremiumAccess(state)).toBe(false);

    const dayPass = createDayPassEntitlement(
      'pridicta_day_pass_24h',
      new Date(),
    );
    const passState: MonetizationState = {
      ...state,
      oneTimeEntitlements: [dayPass],
    };

    expect(hasActiveDayPass(passState.oneTimeEntitlements)).toBe(true);
    expect(hasPremiumAccess(passState)).toBe(true);
  });

  it('consumes question credits only when available', () => {
    const state: MonetizationState = {
      ...createInitialMonetizationState(),
      oneTimeEntitlements: [
        {
          productId: 'pridicta_five_questions',
          productType: 'FIVE_QUESTIONS',
          purchasedAt: '2026-04-18T00:00:00Z',
          remainingUses: 1,
          source: 'mock',
        },
      ],
    };

    const consumed = consumeOneTimeQuestionCreditFromState(state);
    expect(consumed.consumed).toBe(true);
    expect(consumed.state.oneTimeEntitlements[0].remainingUses).toBe(0);
    expect(consumeOneTimeQuestionCreditFromState(consumed.state).consumed).toBe(
      false,
    );
  });

  it('consumes premium PDF credit for the active kundli', () => {
    const state: MonetizationState = {
      ...createInitialMonetizationState(),
      oneTimeEntitlements: [
        {
          productId: 'pridicta_premium_pdf',
          productType: 'PREMIUM_PDF',
          purchasedAt: '2026-04-18T00:00:00Z',
          remainingUses: 1,
          source: 'mock',
        },
      ],
    };

    expect(hasPremiumPdfCredit(state.oneTimeEntitlements, 'kundli-1')).toBe(
      true,
    );
    const consumed = consumePremiumPdfCreditFromState(state, 'kundli-1');
    expect(consumed.consumed).toBe(true);
    expect(consumed.state.oneTimeEntitlements[0].remainingUses).toBe(0);
  });

  it('detects and consumes life timeline report credit', () => {
    const state: MonetizationState = {
      ...createInitialMonetizationState(),
      oneTimeEntitlements: [
        {
          productId: 'pridicta_life_timeline_report',
          productType: 'LIFE_TIMELINE_REPORT',
          purchasedAt: '2026-04-18T00:00:00Z',
          remainingUses: 1,
          source: 'mock',
        },
      ],
    };

    expect(
      hasLifeTimelineReportCredit(state.oneTimeEntitlements, 'kundli-1'),
    ).toBe(true);
    const consumed = consumeLifeTimelineReportCreditFromState(
      state,
      'kundli-1',
    );
    expect(consumed.consumed).toBe(true);
    expect(consumed.state.oneTimeEntitlements[0].remainingUses).toBe(0);
  });

  it('detects and consumes generic one-time report credits', () => {
    const state: MonetizationState = {
      ...createInitialMonetizationState(),
      oneTimeEntitlements: [
        {
          productId: 'pridicta_annual_guidance_report',
          productType: 'ANNUAL_GUIDANCE_REPORT',
          purchasedAt: '2026-04-18T00:00:00Z',
          remainingUses: 1,
          source: 'mock',
        },
      ],
    };

    expect(
      hasOneTimeReportCredit(
        state.oneTimeEntitlements,
        'ANNUAL_GUIDANCE_REPORT',
        'kundli-1',
      ),
    ).toBe(true);
    const consumed = consumeOneTimeReportCreditFromState(
      state,
      'ANNUAL_GUIDANCE_REPORT',
      'kundli-1',
    );

    expect(consumed.consumed).toBe(true);
    expect(consumed.state.oneTimeEntitlements[0].remainingUses).toBe(0);
  });
});
