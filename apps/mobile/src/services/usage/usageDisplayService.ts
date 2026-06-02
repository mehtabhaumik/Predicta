import { getMonetizationUsageCopy } from '@pridicta/config';
import type { SupportedLanguage } from '@pridicta/types';
import { DAY_PASS_LIMITS, getUsageLimits } from '../../config/usageLimits';
import type { UsageState, UserPlan } from '../../types/astrology';
import type { ResolvedAccess } from '../../types/access';
import type { MonetizationState } from '../../types/subscription';
import {
  getPaidQuestionCredits,
  hasActiveDayPass,
  hasPremiumAccess,
} from '../subscription/entitlementService';

export type UsageDisplay = {
  questionsText: string;
  deepReadingsText: string;
  pdfText: string;
  statusText: string;
};

export function buildUsageDisplay({
  monetization,
  resolvedAccess,
  usage,
  userPlan,
  language = 'en',
}: {
  monetization: MonetizationState;
  resolvedAccess?: ResolvedAccess;
  usage: UsageState;
  userPlan: UserPlan;
  language?: SupportedLanguage;
}): UsageDisplay {
  if (resolvedAccess?.source === 'admin_whitelist') {
    return {
      deepReadingsText: getMonetizationUsageCopy('adminNoRestriction', language),
      pdfText: getMonetizationUsageCopy('adminPdfAccess', language),
      questionsText: getMonetizationUsageCopy('adminGuidanceAccess', language),
      statusText: getMonetizationUsageCopy('adminAccess', language),
    };
  }

  if (resolvedAccess?.source === 'full_access_whitelist') {
    return {
      deepReadingsText: getMonetizationUsageCopy('fullDeepAccess', language),
      pdfText: getMonetizationUsageCopy('fullReportAccess', language),
      questionsText: getMonetizationUsageCopy('fullPredictaAccess', language),
      statusText: getMonetizationUsageCopy('fullAccess', language),
    };
  }

  if (
    resolvedAccess?.source === 'guest_pass' &&
    resolvedAccess.activeGuestPass
  ) {
    const pass = resolvedAccess.activeGuestPass;

    return {
      deepReadingsText: getMonetizationUsageCopy('guestDeepReadingsTemplate', language, {
        count: Math.max(
          0,
          pass.usageLimits.deepReadingsTotal - pass.deepReadingsUsed,
        ),
      }),
      pdfText: getMonetizationUsageCopy('guestPremiumReportsTemplate', language, {
        count: Math.max(
          0,
          pass.usageLimits.premiumPdfsTotal - pass.premiumPdfsUsed,
        ),
      }),
      questionsText: getMonetizationUsageCopy('guestQuestionsTemplate', language, {
        count: Math.max(
          0,
          pass.usageLimits.questionsTotal - pass.questionsUsed,
        ),
      }),
      statusText:
        pass.accessLevel === 'VIP_GUEST'
          ? getMonetizationUsageCopy('vipGuest', language)
          : pass.accessLevel === 'FULL_ACCESS'
          ? getMonetizationUsageCopy('fullGuest', language)
          : getMonetizationUsageCopy('guestPass', language),
    };
  }

  const plan = hasPremiumAccess(monetization) ? 'PREMIUM' : userPlan;
  const limits = getUsageLimits(plan);
  const paidQuestions = getPaidQuestionCredits(
    monetization.oneTimeEntitlements,
  );
  const dayPassActive = hasActiveDayPass(monetization.oneTimeEntitlements);
  const questionLimit = dayPassActive
    ? DAY_PASS_LIMITS.questionsPerPass
    : limits.questionsPerDay;
  const deepLimit = dayPassActive
    ? DAY_PASS_LIMITS.deepCallsPerPass
    : limits.deepCallsPerDay;
  const pdfLimit = dayPassActive
    ? DAY_PASS_LIMITS.pdfsPerPass
    : limits.pdfsPerMonth;

  return {
    deepReadingsText:
      deepLimit > 0
        ? getMonetizationUsageCopy('deepReadingsTemplate', language, {
            count: Math.max(0, deepLimit - usage.deepCallsToday),
          })
        : getMonetizationUsageCopy('deepReadingsPremium', language),
    pdfText: getMonetizationUsageCopy('premiumReportsTemplate', language, {
      count: Math.max(0, pdfLimit - usage.pdfsThisMonth),
      plural: pdfLimit - usage.pdfsThisMonth === 1 ? '' : 's',
    }),
    questionsText:
      paidQuestions > 0
        ? getMonetizationUsageCopy('paidQuestionsTemplate', language, {
            count: paidQuestions,
          })
        : getMonetizationUsageCopy('guidanceQuestionsTemplate', language, {
            count: Math.max(0, questionLimit - usage.questionsToday),
          }),
    statusText: dayPassActive
      ? getMonetizationUsageCopy('dayPassActive', language)
      : plan === 'PREMIUM'
      ? getMonetizationUsageCopy('premiumGuidanceActive', language)
      : getMonetizationUsageCopy('freeGuidanceResets', language),
  };
}
