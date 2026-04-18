import { DAY_PASS_LIMITS, getUsageLimits } from '@pridicta/config/usageLimits';
import type {
  MonetizationState,
  ResolvedAccess,
  UsageState,
  UserPlan,
} from '@pridicta/types';
import {
  getPaidQuestionCredits,
  hasActiveDayPass,
  hasPremiumAccess,
} from './entitlementService';

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
}: {
  monetization: MonetizationState;
  resolvedAccess?: ResolvedAccess;
  usage: UsageState;
  userPlan: UserPlan;
}): UsageDisplay {
  if (resolvedAccess?.source === 'admin_whitelist') {
    return {
      deepReadingsText: 'No app-level AI restriction',
      pdfText: 'Admin PDF access active',
      questionsText: 'Admin guidance access active',
      statusText: 'Admin access active',
    };
  }

  if (resolvedAccess?.source === 'full_access_whitelist') {
    return {
      deepReadingsText: 'Full deep guidance access active',
      pdfText: 'Full report access active',
      questionsText: 'Full Predicta access active',
      statusText: 'Full access active',
    };
  }

  if (
    resolvedAccess?.source === 'guest_pass' &&
    resolvedAccess.activeGuestPass
  ) {
    const pass = resolvedAccess.activeGuestPass;

    return {
      deepReadingsText: `${Math.max(
        0,
        pass.usageLimits.deepReadingsTotal - pass.deepReadingsUsed,
      )} guest deep readings remaining`,
      pdfText: `${Math.max(
        0,
        pass.usageLimits.premiumPdfsTotal - pass.premiumPdfsUsed,
      )} guest premium reports remaining`,
      questionsText: `${Math.max(
        0,
        pass.usageLimits.questionsTotal - pass.questionsUsed,
      )} guest guidance questions remaining`,
      statusText:
        pass.accessLevel === 'VIP_GUEST'
          ? 'VIP Guest Pass active'
          : pass.accessLevel === 'FULL_ACCESS'
          ? 'Full guest access active'
          : 'Guest Pass active',
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
        ? `${Math.max(0, deepLimit - usage.deepCallsToday)} deep readings left`
        : 'Deep readings unlock with Premium',
    pdfText: `${Math.max(0, pdfLimit - usage.pdfsThisMonth)} premium report${
      pdfLimit - usage.pdfsThisMonth === 1 ? '' : 's'
    } remaining`,
    questionsText:
      paidQuestions > 0
        ? `${paidQuestions} paid questions available`
        : `${Math.max(
            0,
            questionLimit - usage.questionsToday,
          )} guidance questions left today`,
    statusText: dayPassActive
      ? 'Day Pass active'
      : plan === 'PREMIUM'
      ? 'Premium guidance active'
      : 'Your free guidance resets tomorrow',
  };
}
