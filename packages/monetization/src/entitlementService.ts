import { DAY_PASS_LIMITS } from '@pridicta/config/usageLimits';
import type {
  EntitlementState,
  MonetizationState,
  OneTimeEntitlement,
} from '@pridicta/types';
import {
  createFreeEntitlement,
  getQuestionCreditQuantity,
  isQuestionPackProduct,
} from '@pridicta/types';

export function createInitialMonetizationState(): MonetizationState {
  return {
    entitlement: createFreeEntitlement(),
    oneTimeEntitlements: [],
  };
}

export function isPremium(entitlement: EntitlementState): boolean {
  if (entitlement.plan !== 'PREMIUM') {
    return false;
  }

  if (
    entitlement.status !== 'ACTIVE' &&
    entitlement.status !== 'GRACE_PERIOD'
  ) {
    return false;
  }

  return !isExpired(entitlement.expiresAt);
}

export function hasActiveDayPass(
  oneTimeEntitlements: OneTimeEntitlement[],
  now = new Date(),
): boolean {
  return oneTimeEntitlements.some(
    item =>
      item.productType === 'DAY_PASS' &&
      !isExpired(item.expiresAt, now) &&
      (item.remainingUses === undefined || item.remainingUses > 0),
  );
}

export function hasPremiumAccess(
  state: MonetizationState,
  now = new Date(),
): boolean {
  return (
    isPremium(state.entitlement) ||
    hasActiveDayPass(state.oneTimeEntitlements, now)
  );
}

export function getPaidQuestionCredits(
  oneTimeEntitlements: OneTimeEntitlement[],
): number {
  return oneTimeEntitlements
    .filter(item => isQuestionPackProduct(item.productType))
    .reduce(
      (total, item) =>
        total +
        Math.max(0, item.remainingUses ?? getQuestionCreditQuantity(item.productType)),
      0,
    );
}

export function hasPremiumPdfCredit(
  oneTimeEntitlements: OneTimeEntitlement[],
  kundliId?: string,
): boolean {
  return oneTimeEntitlements.some(
    item =>
      (item.productType === 'PREMIUM_PDF' ||
        item.productType === 'REPORT_SINGLE' ||
        item.productType === 'REPORT_BUNDLE' ||
        item.productType === 'DETAILED_KUNDLI_REPORT') &&
      (item.remainingUses ?? 0) > 0 &&
      (!kundliId || !item.kundliId || item.kundliId === kundliId) &&
      !isExpired(item.expiresAt),
  );
}

export function hasJaiminiReportCredit(
  oneTimeEntitlements: OneTimeEntitlement[],
  kundliId?: string,
): boolean {
  return oneTimeEntitlements.some(
    item =>
      isJaiminiReportCredit(item) &&
      (item.remainingUses ?? 0) > 0 &&
      (!kundliId || !item.kundliId || item.kundliId === kundliId) &&
      !isExpired(item.expiresAt),
  );
}

export function hasReportPdfCredit(
  oneTimeEntitlements: OneTimeEntitlement[],
  kundliId?: string,
  reportFocus?: string,
): boolean {
  return (
    hasPremiumPdfCredit(oneTimeEntitlements, kundliId) ||
    (reportFocus === 'JAIMINI' &&
      hasJaiminiReportCredit(oneTimeEntitlements, kundliId))
  );
}

export function consumeOneTimeQuestionCreditFromState(
  state: MonetizationState,
): { consumed: boolean; state: MonetizationState } {
  const nextEntitlements = [...state.oneTimeEntitlements];
  const index = nextEntitlements.findIndex(
    item =>
      isQuestionPackProduct(item.productType) &&
      (item.remainingUses ?? 0) > 0 &&
      !isExpired(item.expiresAt),
  );

  if (index === -1) {
    return { consumed: false, state };
  }

  nextEntitlements[index] = {
    ...nextEntitlements[index],
    remainingUses: Math.max(
      0,
      (nextEntitlements[index].remainingUses ?? 0) - 1,
    ),
  };

  return {
    consumed: true,
    state: {
      ...state,
      oneTimeEntitlements: nextEntitlements,
    },
  };
}

export function consumePremiumPdfCreditFromState(
  state: MonetizationState,
  kundliId: string,
): { consumed: boolean; state: MonetizationState } {
  return consumeReportPdfCreditFromState(state, kundliId);
}

export function consumeReportPdfCreditFromState(
  state: MonetizationState,
  kundliId: string,
  reportFocus?: string,
): { consumed: boolean; state: MonetizationState } {
  const nextEntitlements = [...state.oneTimeEntitlements];
  const index = nextEntitlements.findIndex(
    item => {
      const allowed =
        reportFocus === 'JAIMINI'
          ? isJaiminiReportCredit(item) ||
            item.productType === 'PREMIUM_PDF' ||
            item.productType === 'REPORT_SINGLE' ||
            item.productType === 'REPORT_BUNDLE' ||
            item.productType === 'DETAILED_KUNDLI_REPORT'
          : item.productType === 'PREMIUM_PDF' ||
            item.productType === 'REPORT_SINGLE' ||
            item.productType === 'REPORT_BUNDLE' ||
            item.productType === 'DETAILED_KUNDLI_REPORT';

      return (
        allowed &&
        (item.remainingUses ?? 0) > 0 &&
        (!item.kundliId || item.kundliId === kundliId) &&
        !isExpired(item.expiresAt)
      );
    },
  );

  if (index === -1) {
    return { consumed: false, state };
  }

  nextEntitlements[index] = {
    ...nextEntitlements[index],
    kundliId,
    remainingUses: Math.max(
      0,
      (nextEntitlements[index].remainingUses ?? 0) - 1,
    ),
  };

  return {
    consumed: true,
    state: {
      ...state,
      oneTimeEntitlements: nextEntitlements,
    },
  };
}

function isJaiminiReportCredit(item: OneTimeEntitlement): boolean {
  return (
    item.productType === 'JAIMINI_REPORT' ||
    String(item.productType) === 'NADI_REPORT' ||
    item.productId.toLowerCase().includes('nadi_report')
  );
}

export function createDayPassEntitlement(
  productId: string,
  now = new Date(),
): OneTimeEntitlement {
  return {
    expiresAt: new Date(
      now.getTime() + DAY_PASS_LIMITS.durationHours * 60 * 60 * 1000,
    ).toISOString(),
    productId,
    productType: 'DAY_PASS',
    purchasedAt: now.toISOString(),
    remainingUses: DAY_PASS_LIMITS.questionsPerPass,
    source: 'mock',
  };
}

export function isExpired(expiresAt?: string, now = new Date()): boolean {
  if (!expiresAt) {
    return false;
  }

  return new Date(expiresAt).getTime() <= now.getTime();
}
