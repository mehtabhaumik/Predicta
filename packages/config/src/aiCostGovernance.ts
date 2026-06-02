import { GEMINI_MODELS, OPENAI_MODELS } from './aiModels';

export const AI_COST_GOVERNANCE_VERSION = 'predicta-ai-cost-governance-v1';

export const AI_FREE_RUNTIME_POLICY = {
  allowedProvider: 'openai',
  allowedModel: OPENAI_MODELS.FREE_REASONING,
  maxHistoryTurns: 4,
  maxMessageChars: 2400,
  maxOutputTokens: 420,
  noGeminiValidator: true,
  noPremiumModel: true,
} as const;

export const AI_PREMIUM_RUNTIME_POLICY = {
  allowedDeepProvider: 'openai',
  allowedDeepModel: OPENAI_MODELS.PREMIUM_DEEP_ANALYSIS,
  maxHistoryTurns: 8,
  maxMessageChars: 4000,
  maxOutputTokens: 720,
} as const;

export const AI_VALIDATOR_POLICY = {
  freeValidatorProvider: 'deterministic',
  paidPremiumValidatorProvider: 'gemini',
  paidPremiumValidatorModel: GEMINI_MODELS.PRO_FUTURE,
} as const;

export const AI_FEATURE_BUDGET_THRESHOLDS_USD = {
  freeChatAnswer: {
    alertAt: 0.003,
    stopAt: 0.01,
  },
  paidQuestionAnswer: {
    alertAt: 0.02,
    stopAt: 0.08,
  },
  premiumReportDraft: {
    alertAt: 0.35,
    stopAt: 1.25,
  },
  premiumReportValidator: {
    alertAt: 0.12,
    stopAt: 0.45,
  },
  batchQa: {
    alertAt: 0.08,
    stopAt: 0.35,
  },
} as const;

export const AI_ABUSE_PROTECTION_LIMITS = {
  perIpRequestsPerMinute: 12,
  perDeviceRequestsPerMinute: 8,
  freeUserRequestsPerMinute: 4,
} as const;

export const AI_TELEMETRY_REQUIRED_FIELDS = [
  'provider',
  'model',
  'feature',
  'userPlan',
  'entitlementSource',
  'productCreditSource',
  'estimatedInputTokens',
  'estimatedOutputTokens',
  'providerInputTokens',
  'providerOutputTokens',
  'estimatedCostUsd',
  'cacheState',
  'cacheHit',
] as const;

export type AIGovernanceUserPlan = 'FREE' | 'PREMIUM';
export type AIGovernanceEntitlementSource =
  | 'free_lifetime_ai_credit'
  | 'paid_question_pack'
  | 'family_bank'
  | 'day_pass'
  | 'premium_subscription'
  | 'deterministic_no_ai';

export type AIGovernanceFeature =
  | keyof typeof AI_FEATURE_BUDGET_THRESHOLDS_USD
  | 'chat'
  | 'reportGeneration'
  | 'reportValidator';

export type AICostGovernanceDecision = {
  allowed: boolean;
  reason: string;
};

export function assertFreeModelAllowed(model: string): AICostGovernanceDecision {
  if (model === AI_FREE_RUNTIME_POLICY.allowedModel) {
    return {
      allowed: true,
      reason: 'free-ai-uses-openai-mini',
    };
  }

  return {
    allowed: false,
    reason: 'free-ai-cannot-use-premium-or-non-free-model',
  };
}

export function assertGeminiValidatorAllowed({
  paidPremiumReport,
  userPlan,
}: {
  paidPremiumReport: boolean;
  userPlan: AIGovernanceUserPlan;
}): AICostGovernanceDecision {
  if (paidPremiumReport && userPlan === 'PREMIUM') {
    return {
      allowed: true,
      reason: 'paid-premium-report-may-use-gemini-validator',
    };
  }

  return {
    allowed: false,
    reason: 'gemini-validator-is-for-paid-premium-reports-only',
  };
}

export function evaluateAiFeatureSpend({
  estimatedCostUsd,
  feature,
}: {
  estimatedCostUsd: number;
  feature: keyof typeof AI_FEATURE_BUDGET_THRESHOLDS_USD;
}): AICostGovernanceDecision & { severity: 'allow' | 'alert' | 'stop' } {
  const threshold = AI_FEATURE_BUDGET_THRESHOLDS_USD[feature];

  if (estimatedCostUsd >= threshold.stopAt) {
    return {
      allowed: false,
      reason: `${feature}-spend-stop-threshold-exceeded`,
      severity: 'stop',
    };
  }

  if (estimatedCostUsd >= threshold.alertAt) {
    return {
      allowed: true,
      reason: `${feature}-spend-alert-threshold-reached`,
      severity: 'alert',
    };
  }

  return {
    allowed: true,
    reason: `${feature}-spend-within-budget`,
    severity: 'allow',
  };
}
