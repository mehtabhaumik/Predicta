import { getMonetizationPaywallContext } from '@pridicta/config';
import type { SupportedLanguage } from '@pridicta/types';
import type { UserPlan } from '@pridicta/types';

export type PaywallAction =
  | 'QUESTION_LIMIT_REACHED'
  | 'PDF_LIMIT_REACHED'
  | 'LOCKED_CHART_TAPPED'
  | 'ADVANCED_ANALYSIS_REQUESTED'
  | 'PREMIUM_REPORT_REQUESTED'
  | 'DEEP_AI_LIMIT_REACHED'
  | 'DAY_PASS_OFFER'
  | 'QUESTION_PACK_OFFER'
  | 'PREMIUM_PDF_OFFER';

export type PaywallContext = {
  title: string;
  message: string;
  primaryCta: string;
  secondaryCta: string;
  suggestedProductId?: string;
};

const PAYWALL_COOLDOWN_MS = 1000 * 60 * 10;
const shownAtByAction = new Map<PaywallAction, number>();

export function shouldShowPaywall(
  action: PaywallAction,
  userPlan: UserPlan,
): boolean {
  if (userPlan === 'PREMIUM' && !isOneTimeOffer(action)) {
    return false;
  }

  return canShowPaywallForAction(action);
}

export function getPaywallContext(
  action: PaywallAction,
  language: SupportedLanguage = 'en',
): PaywallContext {
  return getMonetizationPaywallContext(action, language);
}

export function markPaywallShown(action: PaywallAction): void {
  shownAtByAction.set(action, Date.now());
}

export function canShowPaywallForAction(action: PaywallAction): boolean {
  const shownAt = shownAtByAction.get(action);

  if (!shownAt) {
    return true;
  }

  return Date.now() - shownAt > PAYWALL_COOLDOWN_MS;
}

export function resetPaywallCooldowns(): void {
  shownAtByAction.clear();
}

function isOneTimeOffer(action: PaywallAction): boolean {
  return (
    action === 'DAY_PASS_OFFER' ||
    action === 'QUESTION_PACK_OFFER' ||
    action === 'PREMIUM_PDF_OFFER'
  );
}
