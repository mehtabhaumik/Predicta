import {
  consumeOneTimeQuestionCreditFromState,
  consumePremiumPdfCreditFromState,
  consumeReportPdfCreditFromState,
  createDayPassEntitlement,
  createInitialMonetizationState,
  hasActiveDayPass,
  hasPremiumAccess,
  hasReportPdfCredit,
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
      new Date('2026-04-18T00:00:00Z'),
    );
    const duringPass = new Date('2026-04-18T12:00:00Z');
    const passState: MonetizationState = {
      ...state,
      oneTimeEntitlements: [dayPass],
    };

    expect(hasActiveDayPass(passState.oneTimeEntitlements, duringPass)).toBe(
      true,
    );
    expect(hasPremiumAccess(passState, duringPass)).toBe(true);
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

  it('keeps Jaimini report credit scoped to Jaimini reports', () => {
    const state: MonetizationState = {
      ...createInitialMonetizationState(),
      oneTimeEntitlements: [
        {
          productId: 'pridicta_jaimini_report',
          productType: 'JAIMINI_REPORT',
          purchasedAt: '2026-06-01T00:00:00Z',
          remainingUses: 1,
          source: 'mock',
        },
      ],
    };

    expect(hasPremiumPdfCredit(state.oneTimeEntitlements, 'kundli-1')).toBe(
      false,
    );
    expect(
      hasReportPdfCredit(state.oneTimeEntitlements, 'kundli-1', 'JAIMINI'),
    ).toBe(true);
    expect(
      hasReportPdfCredit(state.oneTimeEntitlements, 'kundli-1', 'KUNDLI'),
    ).toBe(false);

    const consumed = consumeReportPdfCreditFromState(
      state,
      'kundli-1',
      'JAIMINI',
    );
    expect(consumed.consumed).toBe(true);
    expect(consumed.state.oneTimeEntitlements[0].remainingUses).toBe(0);
  });
});
