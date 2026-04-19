import {
  buildAdminMonetizationSummary,
  createInitialMonetizationState,
  getProductUpgradePrompt,
  getUsageAwareUpgradeMoment,
} from '@pridicta/monetization';
import type { ResolvedAccess, UsageState } from '@pridicta/types';

import { sanitizeAnalyticsMetadata } from '../src/services/analytics/analyticsService';

const freeAccess: ResolvedAccess = {
  accessLevel: 'FREE',
  hasPremiumAccess: false,
  hasUnrestrictedAppAccess: false,
  isAdmin: false,
  source: 'free',
};

const baseUsage: UsageState = {
  dayKey: '2026-04-18',
  deepCallsToday: 0,
  monthKey: '2026-04',
  pdfsThisMonth: 0,
  questionsToday: 0,
};

describe('monetization optimization', () => {
  it('builds product-specific upgrade prompts for report hooks', () => {
    expect(getProductUpgradePrompt('LIFE_TIMELINE_REPORT')).toMatchObject({
      productId: 'pridicta_life_timeline_report',
      primaryCta: 'Unlock Life Timeline - ₹299',
      productType: 'LIFE_TIMELINE_REPORT',
    });
    expect(getProductUpgradePrompt('MARRIAGE_COMPATIBILITY_REPORT')).toMatchObject({
      productId: 'pridicta_marriage_compatibility_report',
      primaryCta: 'Unlock Compatibility Report - ₹499',
    });
  });

  it('suggests question packs only when free guidance is exhausted', () => {
    const monetization = createInitialMonetizationState();
    const prompt = getUsageAwareUpgradeMoment({
      monetization,
      resolvedAccess: freeAccess,
      usage: {
        ...baseUsage,
        questionsToday: 3,
      },
      userPlan: 'FREE',
    });

    expect(prompt).toMatchObject({
      productId: 'pridicta_five_questions',
      productType: 'FIVE_QUESTIONS',
    });
  });

  it('builds an admin-safe monetization summary without private data', () => {
    const summary = buildAdminMonetizationSummary({
      analyticsCounts: {
        paywall_viewed: 4,
        product_selected: 2,
        purchase_completed: 1,
        report_generated: 3,
      },
      monetization: createInitialMonetizationState(),
      resolvedAccess: freeAccess,
      usage: baseUsage,
      userPlan: 'FREE',
    });

    expect(summary).toMatchObject({
      accessStatus: 'Free access',
      conversionSignals: {
        paywallViews: 4,
        productSelections: 2,
        purchasesCompleted: 1,
        reportsGenerated: 3,
      },
      costPosture: 'controlled',
    });
    expect(summary.recommendedActions.join(' ')).not.toContain('birth');
  });

  it('removes sensitive astrology and chat fields from analytics metadata', () => {
    expect(
      sanitizeAnalyticsMetadata({
        birthTime: '06:42',
        chatText: 'private question',
        kundliId: 'private-kundli',
        productId: 'pridicta_premium_pdf',
        source: 'report_studio',
      }),
    ).toEqual({
      productId: 'pridicta_premium_pdf',
      source: 'report_studio',
    });
  });
});
