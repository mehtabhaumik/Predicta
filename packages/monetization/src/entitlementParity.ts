import { FREE_AI_QUESTION_LIFETIME_LIMIT } from './serverEntitlementLedger';
import type { ServerEntitlementLedger } from './serverEntitlementLedger';
import type { ReportCreditType } from './serverEntitlementLedger';

export type PaidCreditSource = 'personal' | 'family_bank';

export type AiEntitlementDecision =
  | {
      allowed: true;
      creditSource: 'premium_subscription' | 'day_pass' | PaidCreditSource;
    }
  | {
      allowed: true;
      creditSource: 'free_lifetime_ai_credit';
      freeCreditsRemaining: number;
    }
  | {
      allowed: false;
      creditSource: 'none';
      reason: 'free_ai_lifetime_exhausted';
    };

export type ReportEntitlementDecision =
  | {
      allowed: true;
      creditSource: 'free_deterministic_report' | 'premium_subscription' | 'day_pass';
      paidReportCredit?: undefined;
      requiredCreditType?: ReportCreditType;
    }
  | {
      allowed: true;
      creditSource: PaidCreditSource;
      paidReportCredit: {
        reportType: ReportCreditType;
        source: PaidCreditSource;
      };
      requiredCreditType: ReportCreditType;
    }
  | {
      allowed: false;
      creditSource: 'none';
      paidReportCredit?: undefined;
      reason: 'premium_report_credit_required';
      requiredCreditType: ReportCreditType;
    };

export function evaluateAiCreditEntitlement(
  ledger: ServerEntitlementLedger,
  userPlan?: string,
): AiEntitlementDecision {
  if (
    userPlan === 'PREMIUM' ||
    ledger.premiumEntitlement.status === 'ACTIVE' ||
    ledger.premiumEntitlement.status === 'GRACE_PERIOD'
  ) {
    return { allowed: true, creditSource: 'premium_subscription' };
  }

  if (ledger.dayPassEntitlement.active && ledger.dayPassEntitlement.questionsRemaining > 0) {
    return { allowed: true, creditSource: 'day_pass' };
  }

  if (ledger.paidAiQuestionCreditsBalance > 0) {
    return { allowed: true, creditSource: 'personal' };
  }

  if (ledger.familyBank.sharedQuestionCreditsBalance > 0) {
    return { allowed: true, creditSource: 'family_bank' };
  }

  const freeCreditsRemaining = Math.max(
    0,
    FREE_AI_QUESTION_LIFETIME_LIMIT - ledger.freeAiCreditsUsed,
  );

  if (freeCreditsRemaining <= 0) {
    return {
      allowed: false,
      creditSource: 'none',
      reason: 'free_ai_lifetime_exhausted',
    };
  }

  return {
    allowed: true,
    creditSource: 'free_lifetime_ai_credit',
    freeCreditsRemaining,
  };
}

export function selectPaidAiCreditSpendSource(
  decision: AiEntitlementDecision,
): PaidCreditSource | undefined {
  return decision.allowed &&
    (decision.creditSource === 'personal' || decision.creditSource === 'family_bank')
    ? decision.creditSource
    : undefined;
}

export function shouldConsumeFreeAiCredit(decision: AiEntitlementDecision): boolean {
  return decision.allowed && decision.creditSource === 'free_lifetime_ai_credit';
}

export function shouldConsumeDayPassAiCredit(decision: AiEntitlementDecision): boolean {
  return decision.allowed && decision.creditSource === 'day_pass';
}

export function evaluateReportEntitlement({
  ledger,
  mode,
  reportFocus,
}: {
  ledger: ServerEntitlementLedger;
  mode: string;
  reportFocus?: string;
}): ReportEntitlementDecision {
  const requiredCreditType = mapReportFocusToCreditType(reportFocus);

  if (mode !== 'PREMIUM') {
    return {
      allowed: true,
      creditSource: 'free_deterministic_report',
      requiredCreditType,
    };
  }

  if (
    ledger.premiumEntitlement.status === 'ACTIVE' ||
    ledger.premiumEntitlement.status === 'GRACE_PERIOD'
  ) {
    return {
      allowed: true,
      creditSource: 'premium_subscription',
      requiredCreditType,
    };
  }

  if (ledger.dayPassEntitlement.active && ledger.dayPassEntitlement.pdfsRemaining > 0) {
    return {
      allowed: true,
      creditSource: 'day_pass',
      requiredCreditType,
    };
  }

  const paidReportCredit = selectPaidReportCreditSpend(ledger, reportFocus);
  if (paidReportCredit) {
    return {
      allowed: true,
      creditSource: paidReportCredit.source,
      paidReportCredit,
      requiredCreditType,
    };
  }

  return {
    allowed: false,
    creditSource: 'none',
    reason: 'premium_report_credit_required',
    requiredCreditType,
  };
}

export function selectPaidReportCreditSpend(
  ledger: ServerEntitlementLedger,
  reportFocus?: string,
): { reportType: ReportCreditType; source: PaidCreditSource } | undefined {
  for (const reportType of getReportCreditCandidates(reportFocus)) {
    if ((ledger.reportCreditsByType[reportType] ?? 0) > 0) {
      return { reportType, source: 'personal' };
    }
    if ((ledger.familyBank.sharedReportCreditsByType[reportType] ?? 0) > 0) {
      return { reportType, source: 'family_bank' };
    }
  }

  return undefined;
}

export function getReportCreditCandidates(reportFocus?: string): ReportCreditType[] {
  const preferred = mapReportFocusToCreditType(reportFocus);
  return preferred === 'PREMIUM_PDF' ? ['PREMIUM_PDF'] : [preferred, 'PREMIUM_PDF'];
}

export function mapReportFocusToCreditType(reportFocus?: string): ReportCreditType {
  switch (reportFocus) {
    case 'KP':
      return 'KP';
    case 'JAIMINI':
      return 'JAIMINI';
    case 'NUMEROLOGY':
      return 'NUMEROLOGY';
    case 'SIGNATURE':
      return 'SIGNATURE';
    case 'LIFE_ATLAS':
      return 'LIFE_ATLAS';
    case 'VEDIC':
    case 'KUNDLI':
    case 'CAREER':
    case 'MARRIAGE':
    case 'WEALTH':
    case 'SADESATI':
    case 'DASHA':
    case 'COMPATIBILITY':
    case 'REMEDIES':
      return 'VEDIC';
    default:
      return 'PREMIUM_PDF';
  }
}

export function reportCreditLabel(reportType: ReportCreditType): string {
  switch (reportType) {
    case 'VEDIC':
      return 'Vedic report credit';
    case 'KP':
      return 'KP report credit';
    case 'JAIMINI':
      return 'Jaimini report credit';
    case 'NUMEROLOGY':
      return 'Numerology report credit';
    case 'SIGNATURE':
      return 'Signature report credit';
    case 'LIFE_ATLAS':
      return 'Life Atlas report credit';
    default:
      return 'Premium report credit';
  }
}
