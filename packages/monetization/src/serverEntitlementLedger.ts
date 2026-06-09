import type {
  EntitlementState,
  MonetizationState,
  OneTimeEntitlement,
  OneTimeProductType,
  UserPlan,
} from '@pridicta/types';
import { DAY_PASS_LIMITS } from '@pridicta/config/usageLimits';
import {
  createFreeEntitlement,
  getHumanReviewCreditQuantity,
  getQuestionCreditQuantity,
  getPrecisionFollowUpCreditQuantity,
  getPrecisionReadingCreditQuantity,
  getReportCreditQuantity,
  isHumanReviewProduct,
  isPrecisionFollowUpProduct,
  isPrecisionReadingProduct,
  isQuestionPackProduct,
} from '@pridicta/types';

export const SERVER_ENTITLEMENT_LEDGER_VERSION = 1;
export const FREE_AI_QUESTION_LIFETIME_LIMIT = 3;

export type ReportCreditType =
  | 'KUNDLI'
  | 'VEDIC'
  | 'KP'
  | 'JAIMINI'
  | 'NUMEROLOGY'
  | 'SIGNATURE'
  | 'LIFE_ATLAS'
  | 'PREMIUM_PDF'
  | 'DETAILED_KUNDLI_REPORT'
  | 'MARRIAGE_COMPATIBILITY_REPORT';

export type ServerDayPassEntitlement = {
  active: boolean;
  deepCallsRemaining: number;
  expiresAt?: string;
  pdfsRemaining: number;
  productId?: string;
  questionsRemaining: number;
};

export type ServerPremiumEntitlement = {
  activeProductId?: string;
  expiresAt?: string;
  plan: UserPlan;
  status: EntitlementState['status'];
};

export type FamilyBankMember = {
  email?: string;
  role: 'owner' | 'member';
  uid: string;
};

export type ServerFamilyBank = {
  memberUids: string[];
  members: FamilyBankMember[];
  ownerUid: string;
  sharedHumanReviewCreditsBalance: number;
  sharedPrecisionFollowUpCreditsBalance: number;
  sharedPrecisionReadingCreditsBalance: number;
  sharedQuestionCreditsBalance: number;
  sharedReportCreditsByType: Partial<Record<ReportCreditType, number>>;
};

export type EntitlementLedgerAuditTrail = {
  createdAt: string;
  lastOperationId?: string;
  lastOperationKind?: ServerEntitlementOperation['kind'];
  updatedAt: string;
};

export type ServerEntitlementLedger = {
  audit: EntitlementLedgerAuditTrail;
  dayPassEntitlement: ServerDayPassEntitlement;
  familyBank: ServerFamilyBank;
  freeAiCreditsUsed: number;
  humanReviewCreditsBalance: number;
  paidAiQuestionCreditsBalance: number;
  premiumEntitlement: ServerPremiumEntitlement;
  precisionFollowUpCreditsBalance: number;
  precisionReadingCreditsBalance: number;
  reportCreditsByType: Partial<Record<ReportCreditType, number>>;
  savedKundliCount: number;
  schemaVersion: typeof SERVER_ENTITLEMENT_LEDGER_VERSION;
  uid: string;
};

export type ServerEntitlementOperation =
  | {
      idempotencyKey: string;
      kind: 'record_successful_free_ai_answer';
    }
  | {
      idempotencyKey: string;
      kind: 'grant_paid_ai_questions';
      quantity: number;
    }
  | {
      idempotencyKey: string;
      kind: 'record_successful_paid_ai_answer';
      source: 'personal' | 'family_bank';
    }
  | {
      idempotencyKey: string;
      kind: 'record_successful_day_pass_ai_answer';
    }
  | {
      idempotencyKey: string;
      kind: 'grant_precision_reading_credit';
      quantity: number;
    }
  | {
      idempotencyKey: string;
      kind: 'grant_precision_follow_up_credit';
      quantity: number;
    }
  | {
      idempotencyKey: string;
      kind: 'consume_precision_reading_credit';
      source: 'personal' | 'family_bank';
    }
  | {
      idempotencyKey: string;
      kind: 'consume_precision_follow_up_credit';
      source: 'personal' | 'family_bank';
    }
  | {
      idempotencyKey: string;
      kind: 'consume_day_pass_precision_reading';
    }
  | {
      idempotencyKey: string;
      kind: 'grant_human_review_credit';
      quantity: number;
    }
  | {
      idempotencyKey: string;
      kind: 'consume_human_review_credit';
      source: 'personal' | 'family_bank';
    }
  | {
      idempotencyKey: string;
      kind: 'grant_report_credit';
      quantity: number;
      reportType: ReportCreditType;
    }
  | {
      idempotencyKey: string;
      kind: 'consume_report_credit';
      reportType: ReportCreditType;
      source: 'personal' | 'family_bank';
    }
  | {
      idempotencyKey: string;
      kind: 'consume_day_pass_report_pdf';
    }
  | {
      idempotencyKey: string;
      kind: 'sync_saved_kundli_count';
      savedKundliCount: number;
    }
  | {
      entitlement: ServerPremiumEntitlement;
      idempotencyKey: string;
      kind: 'activate_premium';
    }
  | {
      dayPass: ServerDayPassEntitlement;
      idempotencyKey: string;
      kind: 'activate_day_pass';
    }
  | {
      familyBank: ServerFamilyBank;
      idempotencyKey: string;
      kind: 'configure_family_bank';
    };

export type ServerEntitlementOperationResult = {
  changed: boolean;
  ledger: ServerEntitlementLedger;
  reason?:
    | 'free_ai_lifetime_exhausted'
    | 'day_pass_ai_exhausted'
    | 'day_pass_precision_exhausted'
    | 'day_pass_report_exhausted'
    | 'human_review_credit_exhausted'
    | 'paid_ai_credits_exhausted'
    | 'precision_follow_up_credit_exhausted'
    | 'precision_reading_credit_exhausted'
    | 'report_credit_exhausted';
};

export function createDefaultServerEntitlementLedger(
  uid: string,
  nowIso = new Date().toISOString(),
): ServerEntitlementLedger {
  const free = createFreeEntitlement('firebase');

  return {
    audit: {
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    dayPassEntitlement: {
      active: false,
      deepCallsRemaining: 0,
      pdfsRemaining: 0,
      questionsRemaining: 0,
    },
    familyBank: {
      memberUids: [],
      members: [
        {
          role: 'owner',
          uid,
        },
      ],
      ownerUid: uid,
      sharedHumanReviewCreditsBalance: 0,
      sharedPrecisionFollowUpCreditsBalance: 0,
      sharedPrecisionReadingCreditsBalance: 0,
      sharedQuestionCreditsBalance: 0,
      sharedReportCreditsByType: {},
    },
    freeAiCreditsUsed: 0,
    humanReviewCreditsBalance: 0,
    paidAiQuestionCreditsBalance: 0,
    premiumEntitlement: {
      plan: free.plan,
      status: free.status,
    },
    precisionFollowUpCreditsBalance: 0,
    precisionReadingCreditsBalance: 0,
    reportCreditsByType: {},
    savedKundliCount: 0,
    schemaVersion: SERVER_ENTITLEMENT_LEDGER_VERSION,
    uid,
  };
}

export function normalizeServerEntitlementLedger(
  uid: string,
  value?: Partial<ServerEntitlementLedger> | null,
  nowIso = new Date().toISOString(),
): ServerEntitlementLedger {
  const defaults = createDefaultServerEntitlementLedger(uid, nowIso);

  return {
    ...defaults,
    ...value,
    audit: {
      ...defaults.audit,
      ...value?.audit,
    },
    dayPassEntitlement: {
      ...defaults.dayPassEntitlement,
      ...value?.dayPassEntitlement,
    },
    familyBank: {
      ...defaults.familyBank,
      ...value?.familyBank,
      members: value?.familyBank?.members?.length
        ? value.familyBank.members
        : defaults.familyBank.members,
      sharedHumanReviewCreditsBalance: Math.max(
        0,
        value?.familyBank?.sharedHumanReviewCreditsBalance ??
          defaults.familyBank.sharedHumanReviewCreditsBalance,
      ),
      sharedPrecisionFollowUpCreditsBalance: Math.max(
        0,
        value?.familyBank?.sharedPrecisionFollowUpCreditsBalance ??
          defaults.familyBank.sharedPrecisionFollowUpCreditsBalance,
      ),
      sharedPrecisionReadingCreditsBalance: Math.max(
        0,
        value?.familyBank?.sharedPrecisionReadingCreditsBalance ??
          defaults.familyBank.sharedPrecisionReadingCreditsBalance,
      ),
    },
    freeAiCreditsUsed: Math.max(0, value?.freeAiCreditsUsed ?? defaults.freeAiCreditsUsed),
    humanReviewCreditsBalance: Math.max(
      0,
      value?.humanReviewCreditsBalance ?? defaults.humanReviewCreditsBalance,
    ),
    paidAiQuestionCreditsBalance: Math.max(
      0,
      value?.paidAiQuestionCreditsBalance ?? defaults.paidAiQuestionCreditsBalance,
    ),
    premiumEntitlement: {
      ...defaults.premiumEntitlement,
      ...value?.premiumEntitlement,
    },
    precisionFollowUpCreditsBalance: Math.max(
      0,
      value?.precisionFollowUpCreditsBalance ??
        defaults.precisionFollowUpCreditsBalance,
    ),
    precisionReadingCreditsBalance: Math.max(
      0,
      value?.precisionReadingCreditsBalance ??
        defaults.precisionReadingCreditsBalance,
    ),
    reportCreditsByType: clampCreditMap(value?.reportCreditsByType),
    savedKundliCount: Math.max(0, value?.savedKundliCount ?? defaults.savedKundliCount),
    schemaVersion: SERVER_ENTITLEMENT_LEDGER_VERSION,
    uid,
  };
}

export function applyServerEntitlementOperation({
  ledger,
  nowIso = new Date().toISOString(),
  operation,
}: {
  ledger: ServerEntitlementLedger;
  nowIso?: string;
  operation: ServerEntitlementOperation;
}): ServerEntitlementOperationResult {
  const next = normalizeServerEntitlementLedger(ledger.uid, ledger, nowIso);

  switch (operation.kind) {
    case 'record_successful_free_ai_answer': {
      if (next.freeAiCreditsUsed >= FREE_AI_QUESTION_LIFETIME_LIMIT) {
        return {
          changed: false,
          ledger: next,
          reason: 'free_ai_lifetime_exhausted',
        };
      }
      next.freeAiCreditsUsed += 1;
      return changed(next, operation, nowIso);
    }

    case 'grant_paid_ai_questions':
      next.paidAiQuestionCreditsBalance += clampQuantity(operation.quantity);
      return changed(next, operation, nowIso);

    case 'record_successful_paid_ai_answer':
      if (operation.source === 'family_bank') {
        if (next.familyBank.sharedQuestionCreditsBalance <= 0) {
          return { changed: false, ledger: next, reason: 'paid_ai_credits_exhausted' };
        }
        next.familyBank = {
          ...next.familyBank,
          sharedQuestionCreditsBalance: next.familyBank.sharedQuestionCreditsBalance - 1,
        };
        return changed(next, operation, nowIso);
      }

      if (next.paidAiQuestionCreditsBalance <= 0) {
        return { changed: false, ledger: next, reason: 'paid_ai_credits_exhausted' };
      }
      next.paidAiQuestionCreditsBalance -= 1;
      return changed(next, operation, nowIso);

    case 'record_successful_day_pass_ai_answer':
      if (
        !next.dayPassEntitlement.active ||
        next.dayPassEntitlement.questionsRemaining <= 0
      ) {
        return { changed: false, ledger: next, reason: 'day_pass_ai_exhausted' };
      }
      next.dayPassEntitlement = {
        ...next.dayPassEntitlement,
        questionsRemaining: next.dayPassEntitlement.questionsRemaining - 1,
      };
      return changed(next, operation, nowIso);

    case 'grant_precision_reading_credit':
      next.precisionReadingCreditsBalance += clampQuantity(operation.quantity);
      return changed(next, operation, nowIso);

    case 'grant_precision_follow_up_credit':
      next.precisionFollowUpCreditsBalance += clampQuantity(operation.quantity);
      return changed(next, operation, nowIso);

    case 'consume_precision_reading_credit':
      if (operation.source === 'family_bank') {
        if (next.familyBank.sharedPrecisionReadingCreditsBalance <= 0) {
          return {
            changed: false,
            ledger: next,
            reason: 'precision_reading_credit_exhausted',
          };
        }
        next.familyBank = {
          ...next.familyBank,
          sharedPrecisionReadingCreditsBalance:
            next.familyBank.sharedPrecisionReadingCreditsBalance - 1,
        };
        return changed(next, operation, nowIso);
      }
      if (next.precisionReadingCreditsBalance <= 0) {
        return {
          changed: false,
          ledger: next,
          reason: 'precision_reading_credit_exhausted',
        };
      }
      next.precisionReadingCreditsBalance -= 1;
      return changed(next, operation, nowIso);

    case 'consume_precision_follow_up_credit':
      if (operation.source === 'family_bank') {
        if (next.familyBank.sharedPrecisionFollowUpCreditsBalance <= 0) {
          return {
            changed: false,
            ledger: next,
            reason: 'precision_follow_up_credit_exhausted',
          };
        }
        next.familyBank = {
          ...next.familyBank,
          sharedPrecisionFollowUpCreditsBalance:
            next.familyBank.sharedPrecisionFollowUpCreditsBalance - 1,
        };
        return changed(next, operation, nowIso);
      }
      if (next.precisionFollowUpCreditsBalance <= 0) {
        return {
          changed: false,
          ledger: next,
          reason: 'precision_follow_up_credit_exhausted',
        };
      }
      next.precisionFollowUpCreditsBalance -= 1;
      return changed(next, operation, nowIso);

    case 'consume_day_pass_precision_reading':
      if (
        !next.dayPassEntitlement.active ||
        next.dayPassEntitlement.deepCallsRemaining <= 0
      ) {
        return {
          changed: false,
          ledger: next,
          reason: 'day_pass_precision_exhausted',
        };
      }
      next.dayPassEntitlement = {
        ...next.dayPassEntitlement,
        deepCallsRemaining: next.dayPassEntitlement.deepCallsRemaining - 1,
      };
      return changed(next, operation, nowIso);

    case 'grant_human_review_credit':
      next.humanReviewCreditsBalance += clampQuantity(operation.quantity);
      return changed(next, operation, nowIso);

    case 'consume_human_review_credit':
      if (operation.source === 'family_bank') {
        if (next.familyBank.sharedHumanReviewCreditsBalance <= 0) {
          return {
            changed: false,
            ledger: next,
            reason: 'human_review_credit_exhausted',
          };
        }
        next.familyBank = {
          ...next.familyBank,
          sharedHumanReviewCreditsBalance:
            next.familyBank.sharedHumanReviewCreditsBalance - 1,
        };
        return changed(next, operation, nowIso);
      }
      if (next.humanReviewCreditsBalance <= 0) {
        return {
          changed: false,
          ledger: next,
          reason: 'human_review_credit_exhausted',
        };
      }
      next.humanReviewCreditsBalance -= 1;
      return changed(next, operation, nowIso);

    case 'grant_report_credit':
      next.reportCreditsByType = addCredit(
        next.reportCreditsByType,
        operation.reportType,
        operation.quantity,
      );
      return changed(next, operation, nowIso);

    case 'consume_report_credit':
      if (operation.source === 'family_bank') {
        const result = removeCredit(
          next.familyBank.sharedReportCreditsByType,
          operation.reportType,
        );
        if (!result.consumed) {
          return { changed: false, ledger: next, reason: 'report_credit_exhausted' };
        }
        next.familyBank = {
          ...next.familyBank,
          sharedReportCreditsByType: result.credits,
        };
        return changed(next, operation, nowIso);
      }

      {
        const result = removeCredit(next.reportCreditsByType, operation.reportType);
        if (!result.consumed) {
          return { changed: false, ledger: next, reason: 'report_credit_exhausted' };
        }
        next.reportCreditsByType = result.credits;
        return changed(next, operation, nowIso);
      }

    case 'consume_day_pass_report_pdf':
      if (
        !next.dayPassEntitlement.active ||
        next.dayPassEntitlement.pdfsRemaining <= 0
      ) {
        return {
          changed: false,
          ledger: next,
          reason: 'day_pass_report_exhausted',
        };
      }
      next.dayPassEntitlement = {
        ...next.dayPassEntitlement,
        pdfsRemaining: next.dayPassEntitlement.pdfsRemaining - 1,
      };
      return changed(next, operation, nowIso);

    case 'sync_saved_kundli_count':
      next.savedKundliCount = Math.max(0, operation.savedKundliCount);
      return changed(next, operation, nowIso);

    case 'activate_premium':
      next.premiumEntitlement = operation.entitlement;
      return changed(next, operation, nowIso);

    case 'activate_day_pass':
      next.dayPassEntitlement = operation.dayPass;
      return changed(next, operation, nowIso);

    case 'configure_family_bank':
      next.familyBank = normalizeFamilyBank(next.uid, operation.familyBank);
      return changed(next, operation, nowIso);
  }
}

export function mapOneTimeProductToLedgerOperation({
  idempotencyKey,
  productId,
  productType,
}: {
  idempotencyKey: string;
  productId: string;
  productType: OneTimeProductType;
}): ServerEntitlementOperation {
  if (isHumanReviewProduct(productType)) {
    return {
      idempotencyKey,
      kind: 'grant_human_review_credit',
      quantity: getHumanReviewCreditQuantity(productType),
    };
  }

  if (isPrecisionReadingProduct(productType)) {
    return {
      idempotencyKey,
      kind: 'grant_precision_reading_credit',
      quantity: getPrecisionReadingCreditQuantity(productType),
    };
  }

  if (isPrecisionFollowUpProduct(productType)) {
    return {
      idempotencyKey,
      kind: 'grant_precision_follow_up_credit',
      quantity: getPrecisionFollowUpCreditQuantity(productType),
    };
  }

  if (isQuestionPackProduct(productType)) {
    return {
      idempotencyKey,
      kind: 'grant_paid_ai_questions',
      quantity: getQuestionCreditQuantity(productType),
    };
  }

  if (productType === 'DAY_PASS') {
    return {
      dayPass: {
        active: true,
        deepCallsRemaining: DAY_PASS_LIMITS.deepCallsPerPass,
        expiresAt: new Date(
          Date.now() + DAY_PASS_LIMITS.durationHours * 60 * 60 * 1000,
        ).toISOString(),
        pdfsRemaining: DAY_PASS_LIMITS.pdfsPerPass,
        productId,
        questionsRemaining: DAY_PASS_LIMITS.questionsPerPass,
      },
      idempotencyKey,
      kind: 'activate_day_pass',
    };
  }

  return {
    idempotencyKey,
    kind: 'grant_report_credit',
    quantity: getReportCreditQuantity(productType) || 1,
    reportType: mapProductTypeToReportCredit(productType),
  };
}

export function mapServerLedgerToMonetizationState(
  ledger: ServerEntitlementLedger,
  nowIso = new Date().toISOString(),
): MonetizationState {
  const oneTimeEntitlements: OneTimeEntitlement[] = [];

  if (ledger.dayPassEntitlement.active) {
    oneTimeEntitlements.push({
      expiresAt: ledger.dayPassEntitlement.expiresAt,
      productId: ledger.dayPassEntitlement.productId ?? 'server_day_pass',
      productType: 'DAY_PASS',
      purchasedAt: ledger.audit.createdAt,
      remainingUses: ledger.dayPassEntitlement.questionsRemaining,
      source: 'firebase',
    });
  }

  if (ledger.paidAiQuestionCreditsBalance > 0) {
    oneTimeEntitlements.push({
      productId: 'server_paid_ai_questions',
      productType: 'AI_QUESTIONS_10',
      purchasedAt: ledger.audit.createdAt,
      remainingUses: ledger.paidAiQuestionCreditsBalance,
      source: 'firebase',
    });
  }

  if (ledger.humanReviewCreditsBalance > 0) {
    oneTimeEntitlements.push({
      productId: 'server_human_astrologer_review',
      productType: 'HUMAN_ASTROLOGER_REVIEW',
      purchasedAt: ledger.audit.createdAt,
      remainingUses: ledger.humanReviewCreditsBalance,
      source: 'firebase',
    });
  }

  if (ledger.precisionReadingCreditsBalance > 0) {
    oneTimeEntitlements.push({
      productId: 'server_precision_reading',
      productType: 'PRECISION_READING',
      purchasedAt: ledger.audit.createdAt,
      remainingUses: ledger.precisionReadingCreditsBalance,
      source: 'firebase',
    });
  }

  if (ledger.precisionFollowUpCreditsBalance > 0) {
    oneTimeEntitlements.push({
      productId: 'server_precision_follow_up_pack',
      productType: 'PRECISION_FOLLOW_UP_PACK',
      purchasedAt: ledger.audit.createdAt,
      remainingUses: ledger.precisionFollowUpCreditsBalance,
      source: 'firebase',
    });
  }

  for (const [reportType, remainingUses] of Object.entries(ledger.reportCreditsByType)) {
    if ((remainingUses ?? 0) <= 0) {
      continue;
    }
    oneTimeEntitlements.push({
      productId: `server_report_${reportType.toLowerCase()}`,
      productType: mapReportCreditToOneTimeProduct(reportType as ReportCreditType),
      purchasedAt: ledger.audit.createdAt,
      remainingUses,
      source: 'firebase',
    });
  }

  return {
    entitlement: {
      activeProductId: ledger.premiumEntitlement.activeProductId,
      expiresAt: ledger.premiumEntitlement.expiresAt,
      plan: ledger.premiumEntitlement.plan,
      source: 'firebase',
      status: ledger.premiumEntitlement.status,
      updatedAt: ledger.audit.updatedAt || nowIso,
    },
    oneTimeEntitlements,
  };
}

function changed(
  ledger: ServerEntitlementLedger,
  operation: ServerEntitlementOperation,
  nowIso: string,
): ServerEntitlementOperationResult {
  return {
    changed: true,
    ledger: {
      ...ledger,
      audit: {
        ...ledger.audit,
        lastOperationId: operation.idempotencyKey,
        lastOperationKind: operation.kind,
        updatedAt: nowIso,
      },
    },
  };
}

function addCredit(
  credits: Partial<Record<ReportCreditType, number>>,
  type: ReportCreditType,
  quantity: number,
): Partial<Record<ReportCreditType, number>> {
  return {
    ...credits,
    [type]: Math.max(0, credits[type] ?? 0) + clampQuantity(quantity),
  };
}

function removeCredit(
  credits: Partial<Record<ReportCreditType, number>>,
  type: ReportCreditType,
): { consumed: boolean; credits: Partial<Record<ReportCreditType, number>> } {
  const current = Math.max(0, credits[type] ?? 0);

  if (current <= 0) {
    return {
      consumed: false,
      credits,
    };
  }

  return {
    consumed: true,
    credits: {
      ...credits,
      [type]: current - 1,
    },
  };
}

function clampCreditMap(
  value?: Partial<Record<ReportCreditType, number>>,
): Partial<Record<ReportCreditType, number>> {
  return Object.fromEntries(
    Object.entries(value ?? {}).map(([key, amount]) => [
      key,
      Math.max(0, Number(amount) || 0),
    ]),
  ) as Partial<Record<ReportCreditType, number>>;
}

function clampQuantity(value: number): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function normalizeFamilyBank(
  uid: string,
  familyBank: ServerFamilyBank,
): ServerFamilyBank {
  const ownerUid = familyBank.ownerUid || uid;
  const memberUids = [...new Set([ownerUid, ...familyBank.memberUids])];
  const members = familyBank.members.length
    ? familyBank.members
    : memberUids.map(memberUid => ({
        role: memberUid === ownerUid ? ('owner' as const) : ('member' as const),
        uid: memberUid,
      }));

  return {
    memberUids,
    members,
    ownerUid,
    sharedHumanReviewCreditsBalance: Math.max(
      0,
      familyBank.sharedHumanReviewCreditsBalance,
    ),
    sharedPrecisionFollowUpCreditsBalance: Math.max(
      0,
      familyBank.sharedPrecisionFollowUpCreditsBalance,
    ),
    sharedPrecisionReadingCreditsBalance: Math.max(
      0,
      familyBank.sharedPrecisionReadingCreditsBalance,
    ),
    sharedQuestionCreditsBalance: Math.max(0, familyBank.sharedQuestionCreditsBalance),
    sharedReportCreditsByType: clampCreditMap(familyBank.sharedReportCreditsByType),
  };
}

function mapProductTypeToReportCredit(productType: OneTimeProductType): ReportCreditType {
  switch (productType) {
    case 'JAIMINI_REPORT':
      return 'JAIMINI';
    case 'DETAILED_KUNDLI_REPORT':
      return 'DETAILED_KUNDLI_REPORT';
    case 'MARRIAGE_COMPATIBILITY_REPORT':
      return 'MARRIAGE_COMPATIBILITY_REPORT';
    case 'REPORT_BUNDLE':
    case 'REPORT_SINGLE':
    case 'PREMIUM_PDF':
    default:
      return 'PREMIUM_PDF';
  }
}

function mapReportCreditToOneTimeProduct(reportType: ReportCreditType): OneTimeProductType {
  switch (reportType) {
    case 'JAIMINI':
      return 'JAIMINI_REPORT';
    case 'DETAILED_KUNDLI_REPORT':
      return 'DETAILED_KUNDLI_REPORT';
    case 'MARRIAGE_COMPATIBILITY_REPORT':
      return 'MARRIAGE_COMPATIBILITY_REPORT';
    default:
      return 'REPORT_SINGLE';
  }
}
