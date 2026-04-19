import AsyncStorage from '@react-native-async-storage/async-storage';

import { DAY_PASS_LIMITS } from '../../config/usageLimits';
import type {
  EntitlementState,
  MonetizationState,
  OneTimeEntitlement,
  OneTimeProductType,
} from '../../types/subscription';
import { createFreeEntitlement } from '../../types/subscription';

const MONETIZATION_STORAGE_KEY = 'pridicta.monetization.v1';

export function createInitialMonetizationState(): MonetizationState {
  return {
    entitlement: createFreeEntitlement(),
    oneTimeEntitlements: [],
  };
}

export async function getCurrentEntitlement(): Promise<EntitlementState> {
  return (await getCurrentMonetizationState()).entitlement;
}

export async function getCurrentMonetizationState(): Promise<MonetizationState> {
  const raw = await AsyncStorage.getItem(MONETIZATION_STORAGE_KEY);

  if (!raw) {
    return createInitialMonetizationState();
  }

  return JSON.parse(raw) as MonetizationState;
}

export async function setEntitlement(
  entitlement: EntitlementState,
): Promise<void> {
  const current = await getCurrentMonetizationState();
  await setMonetizationState({
    ...current,
    entitlement,
  });
}

export async function setMonetizationState(
  state: MonetizationState,
): Promise<void> {
  await AsyncStorage.setItem(MONETIZATION_STORAGE_KEY, JSON.stringify(state));
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
    .filter(item => item.productType === 'FIVE_QUESTIONS')
    .reduce((total, item) => total + Math.max(0, item.remainingUses ?? 0), 0);
}

export function hasPremiumPdfCredit(
  oneTimeEntitlements: OneTimeEntitlement[],
  kundliId?: string,
): boolean {
  return oneTimeEntitlements.some(
    item =>
      (item.productType === 'PREMIUM_PDF' ||
        item.productType === 'DETAILED_KUNDLI_REPORT') &&
      (item.remainingUses ?? 0) > 0 &&
      (!kundliId || !item.kundliId || item.kundliId === kundliId) &&
      !isExpired(item.expiresAt),
  );
}

export function hasLifeTimelineReportCredit(
  oneTimeEntitlements: OneTimeEntitlement[],
  kundliId?: string,
): boolean {
  return oneTimeEntitlements.some(
    item =>
      item.productType === 'LIFE_TIMELINE_REPORT' &&
      (item.remainingUses ?? 0) > 0 &&
      (!kundliId || !item.kundliId || item.kundliId === kundliId) &&
      !isExpired(item.expiresAt),
  );
}

export function hasOneTimeReportCredit(
  oneTimeEntitlements: OneTimeEntitlement[],
  productType: OneTimeProductType,
  kundliId?: string,
): boolean {
  return oneTimeEntitlements.some(
    item =>
      item.productType === productType &&
      (item.remainingUses ?? 0) > 0 &&
      (!kundliId || !item.kundliId || item.kundliId === kundliId) &&
      !isExpired(item.expiresAt),
  );
}

export function consumeOneTimeQuestionCreditFromState(
  state: MonetizationState,
): { consumed: boolean; state: MonetizationState } {
  const nextEntitlements = [...state.oneTimeEntitlements];
  const index = nextEntitlements.findIndex(
    item =>
      item.productType === 'FIVE_QUESTIONS' &&
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

export async function consumeOneTimeQuestionCredit(): Promise<boolean> {
  const current = await getCurrentMonetizationState();
  const result = consumeOneTimeQuestionCreditFromState(current);

  if (result.consumed) {
    await setMonetizationState(result.state);
  }

  return result.consumed;
}

export function consumePremiumPdfCreditFromState(
  state: MonetizationState,
  kundliId: string,
): { consumed: boolean; state: MonetizationState } {
  const nextEntitlements = [...state.oneTimeEntitlements];
  const index = nextEntitlements.findIndex(
    item =>
      item.productType === 'PREMIUM_PDF' &&
      (item.remainingUses ?? 0) > 0 &&
      (!item.kundliId || item.kundliId === kundliId) &&
      !isExpired(item.expiresAt),
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

export function consumeLifeTimelineReportCreditFromState(
  state: MonetizationState,
  kundliId: string,
): { consumed: boolean; state: MonetizationState } {
  const nextEntitlements = [...state.oneTimeEntitlements];
  const index = nextEntitlements.findIndex(
    item =>
      item.productType === 'LIFE_TIMELINE_REPORT' &&
      (item.remainingUses ?? 0) > 0 &&
      (!item.kundliId || item.kundliId === kundliId) &&
      !isExpired(item.expiresAt),
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

export function consumeOneTimeReportCreditFromState(
  state: MonetizationState,
  productType: OneTimeProductType,
  kundliId: string,
): { consumed: boolean; state: MonetizationState } {
  const nextEntitlements = [...state.oneTimeEntitlements];
  const index = nextEntitlements.findIndex(
    item =>
      item.productType === productType &&
      (item.remainingUses ?? 0) > 0 &&
      (!item.kundliId || item.kundliId === kundliId) &&
      !isExpired(item.expiresAt),
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

export async function consumePremiumPdfCredit(
  kundliId: string,
): Promise<boolean> {
  const current = await getCurrentMonetizationState();
  const result = consumePremiumPdfCreditFromState(current, kundliId);

  if (result.consumed) {
    await setMonetizationState(result.state);
  }

  return result.consumed;
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
