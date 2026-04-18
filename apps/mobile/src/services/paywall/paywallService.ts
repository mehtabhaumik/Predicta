import type { UserPlan } from '../../types/astrology';

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

export function getPaywallContext(action: PaywallAction): PaywallContext {
  switch (action) {
    case 'QUESTION_LIMIT_REACHED':
      return {
        message:
          'Your chart context is saved. You can continue tomorrow, add a few questions, or unlock more Pridicta guidance today.',
        primaryCta: 'Add 5 Questions',
        secondaryCta: 'Try Tomorrow',
        suggestedProductId: 'pridicta_five_questions',
        title: "You've reached today's guidance limit.",
      };
    case 'PDF_LIMIT_REACHED':
    case 'PREMIUM_PDF_OFFER':
      return {
        message:
          'Your free report remains available. Premium PDF depth adds richer divisional chart, dasha, and guidance sections.',
        primaryCta: 'Unlock Premium PDF',
        secondaryCta: 'Keep Free Report',
        suggestedProductId: 'pridicta_premium_pdf',
        title: 'Go deeper with this report.',
      };
    case 'DEEP_AI_LIMIT_REACHED':
    case 'ADVANCED_ANALYSIS_REQUESTED':
      return {
        message:
          'Use a lighter reading now, or unlock deeper chart interpretation and expanded Pridicta guidance.',
        primaryCta: 'Unlock Premium',
        secondaryCta: 'Continue Free',
        title: 'Deeper analysis is available in Premium.',
      };
    case 'DAY_PASS_OFFER':
      return {
        message:
          'Try Premium depth for 24 hours without starting a subscription.',
        primaryCta: 'Try Premium for 24 hours',
        secondaryCta: 'Continue Free',
        suggestedProductId: 'pridicta_day_pass_24h',
        title: 'Try Premium today.',
      };
    case 'QUESTION_PACK_OFFER':
      return {
        message:
          'Add a few Pridicta questions without starting a subscription.',
        primaryCta: 'Add 5 Questions',
        secondaryCta: 'Continue Free',
        suggestedProductId: 'pridicta_five_questions',
        title: 'Need a few more questions?',
      };
    case 'LOCKED_CHART_TAPPED':
    case 'PREMIUM_REPORT_REQUESTED':
    default:
      return {
        message:
          'Premium opens richer interpretation depth while keeping your free kundli experience intact.',
        primaryCta: 'Unlock Premium',
        secondaryCta: 'Continue Free',
        title: 'Available in Premium.',
      };
  }
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
