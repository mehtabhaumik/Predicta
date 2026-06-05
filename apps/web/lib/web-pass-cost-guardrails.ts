'use client';

import type {
  ChatSuggestedCta,
  KundliData,
  RedeemedGuestPass,
  SupportedLanguage,
} from '@pridicta/types';
import { getMonetizationUsageCopy } from '@pridicta/config';

const REDEEMED_PASS_KEY = 'pridicta.redeemedGuestPass.v1';
const PASS_USAGE_KEY = 'pridicta.passCostUsage.v2';
const FREE_USAGE_KEY = 'pridicta.freeCostUsage.v2';
export const PASS_USAGE_UPDATED_EVENT = 'predicta:pass-usage-updated';

const FREE_LIFETIME_LIMITS = {
  deepReadingsTotal: 0,
  questionsTotal: 3,
};

type CostKind = 'question' | 'deep_reading';

type StoredPassUsage = {
  deepReadingsUsed: number;
  expiresAt: string;
  passCodeId: string;
  premiumPdfsUsed: number;
  questionsUsed: number;
  updatedAt: string;
};

type StoredFreeUsage = {
  deepReadingsUsed: number;
  questionsUsed: number;
  updatedAt: string;
};

export type WebPassCostDisplay = {
  body: string;
  kind: 'pass' | 'free' | 'quiet';
  title: string;
  tone: 'steady' | 'careful';
};

export type WebPassBudgetDecision = {
  allowed: boolean;
  display: WebPassCostDisplay;
  kind: CostKind;
  remainingAfter: number;
  remainingBefore: number;
  total: number;
};

export function consumeWebAiBudget(
  kind: CostKind,
  language: SupportedLanguage,
): WebPassBudgetDecision {
  const pass = loadWebRedeemedGuestPass();

  if (isPassActive(pass)) {
    return consumePassBudget(pass, kind, language);
  }

  return consumeFreeBudget(kind, language);
}

export function getWebPassCostDisplay(
  language: SupportedLanguage,
): WebPassCostDisplay | undefined {
  const pass = loadWebRedeemedGuestPass();

  if (isPassActive(pass)) {
    const usage = loadPassUsage(pass);
    const deepRemaining = Math.max(
      0,
      pass.usageLimits.deepReadingsTotal - usage.deepReadingsUsed,
    );
    const questionRemaining = Math.max(
      0,
      pass.usageLimits.questionsTotal - usage.questionsUsed,
    );

    return {
      body: passDisplayBody({
        deepRemaining,
        language,
        pass,
        questionRemaining,
      }),
      kind: 'pass',
      title: passDisplayTitle(language),
      tone: deepRemaining <= 1 || questionRemaining <= 2 ? 'careful' : 'steady',
    };
  }

  const usage = loadFreeUsage();

  if (usage.deepReadingsUsed === 0 && usage.questionsUsed === 0) {
    return undefined;
  }

  const deepRemaining = Math.max(
    0,
    FREE_LIFETIME_LIMITS.deepReadingsTotal - usage.deepReadingsUsed,
  );
  const questionRemaining = Math.max(
    0,
    FREE_LIFETIME_LIMITS.questionsTotal - usage.questionsUsed,
  );

  if (
    deepRemaining > 1 &&
    questionRemaining > Math.floor(FREE_LIFETIME_LIMITS.questionsTotal / 2)
  ) {
    return undefined;
  }

  return {
    body: freeDisplayBody({ language, questionRemaining }),
    kind: 'free',
    title: freeDisplayTitle(language),
    tone: deepRemaining <= 0 || questionRemaining <= 1 ? 'careful' : 'steady',
  };
}

export function buildPassCostGuardrailReply({
  decision,
  kundli,
  language,
}: {
  decision: WebPassBudgetDecision;
  kundli?: KundliData;
  language: SupportedLanguage;
}): string {
  const hasKundli = Boolean(kundli);

  return [
    decision.display.kind === 'pass'
      ? getMonetizationUsageCopy('guardrailReplyPassPaused', language)
      : getMonetizationUsageCopy('guardrailReplyFreePaused', language),
    hasKundli
      ? getMonetizationUsageCopy('guardrailReplyHasKundli', language)
      : getMonetizationUsageCopy('guardrailReplyNoKundli', language),
    getMonetizationUsageCopy('guardrailReplyUpgradePath', language),
  ].join('\n\n');
}

export function buildPassCostGuardrailSuggestions(
  hasKundli: boolean,
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  return hasKundli
    ? [
        navCta(
          'charts-after-budget',
          getMonetizationUsageCopy('ctaOpenCharts', language),
          '/dashboard/charts',
        ),
        navCta(
          'timeline-after-budget',
          getMonetizationUsageCopy('ctaSeeTimingMap', language),
          '/dashboard/timeline',
        ),
        navCta(
          'report-after-budget',
          getMonetizationUsageCopy('ctaCreateFreeReport', language),
          '/dashboard/report',
        ),
        navCta(
          'premium-after-budget',
          getMonetizationUsageCopy('ctaSeeOptions', language),
          '/pricing',
        ),
        navCta(
          'redeem-after-budget',
          getMonetizationUsageCopy('ctaRedeemPass', language),
          '/dashboard/redeem-pass',
        ),
      ]
    : [
        navCta(
          'kundli-after-budget',
          getMonetizationUsageCopy('ctaCreateKundli', language),
          '/dashboard/kundli',
        ),
        navCta(
          'redeem-after-budget',
          getMonetizationUsageCopy('ctaRedeemPass', language),
          '/dashboard/redeem-pass',
        ),
        navCta(
          'premium-after-budget',
          getMonetizationUsageCopy('ctaSeeOptions', language),
          '/pricing',
        ),
      ];
}

function consumePassBudget(
  pass: RedeemedGuestPass,
  kind: CostKind,
  language: SupportedLanguage,
): WebPassBudgetDecision {
  const usage = loadPassUsage(pass);
  const used =
    kind === 'deep_reading' ? usage.deepReadingsUsed : usage.questionsUsed;
  const total =
    kind === 'deep_reading'
      ? pass.usageLimits.deepReadingsTotal
      : pass.usageLimits.questionsTotal;
  const remainingBefore = Math.max(0, total - used);
  const allowed = remainingBefore > 0;

  if (allowed) {
    const next: StoredPassUsage = {
      ...usage,
      deepReadingsUsed:
        kind === 'deep_reading'
          ? usage.deepReadingsUsed + 1
          : usage.deepReadingsUsed,
      questionsUsed:
        kind === 'question' ? usage.questionsUsed + 1 : usage.questionsUsed,
      updatedAt: new Date().toISOString(),
    };
    savePassUsage(next);
    saveRedeemedGuestPass({
      ...pass,
      deepReadingsUsed: next.deepReadingsUsed,
      questionsUsed: next.questionsUsed,
    });
  }

  const remainingAfter = allowed ? remainingBefore - 1 : 0;

  return {
    allowed,
    display: {
      body: passDisplayBody({
        deepRemaining:
          kind === 'deep_reading'
            ? remainingAfter
            : Math.max(0, pass.usageLimits.deepReadingsTotal - usage.deepReadingsUsed),
        language,
        pass,
        questionRemaining:
          kind === 'question'
            ? remainingAfter
            : Math.max(0, pass.usageLimits.questionsTotal - usage.questionsUsed),
      }),
      kind: 'pass',
      title: passDisplayTitle(language),
      tone: remainingAfter <= 1 ? 'careful' : 'steady',
    },
    kind,
    remainingAfter,
    remainingBefore,
    total,
  };
}

function consumeFreeBudget(
  kind: CostKind,
  language: SupportedLanguage,
): WebPassBudgetDecision {
  const usage = loadFreeUsage();
  const total =
    kind === 'deep_reading'
      ? FREE_LIFETIME_LIMITS.deepReadingsTotal
      : FREE_LIFETIME_LIMITS.questionsTotal;
  const used =
    kind === 'deep_reading' ? usage.deepReadingsUsed : usage.questionsUsed;
  const remainingBefore = Math.max(0, total - used);
  const allowed = remainingBefore > 0;

  if (allowed) {
    saveFreeUsage({
      ...usage,
      deepReadingsUsed:
        kind === 'deep_reading'
          ? usage.deepReadingsUsed + 1
          : usage.deepReadingsUsed,
      questionsUsed:
        kind === 'question' ? usage.questionsUsed + 1 : usage.questionsUsed,
      updatedAt: new Date().toISOString(),
    });
  }

  const remainingAfter = allowed ? remainingBefore - 1 : 0;

  return {
    allowed,
    display: {
      body: freeDisplayBody({
        language,
        questionRemaining:
          kind === 'question'
            ? remainingAfter
            : Math.max(0, FREE_LIFETIME_LIMITS.questionsTotal - usage.questionsUsed),
      }),
      kind: 'free',
      title: freeDisplayTitle(language),
      tone: remainingAfter <= 1 ? 'careful' : 'steady',
    },
    kind,
    remainingAfter,
    remainingBefore,
    total,
  };
}

function loadWebRedeemedGuestPass(): RedeemedGuestPass | undefined {
  try {
    const raw = window.localStorage.getItem(REDEEMED_PASS_KEY);
    return raw ? (JSON.parse(raw) as RedeemedGuestPass) : undefined;
  } catch {
    return undefined;
  }
}

function saveRedeemedGuestPass(pass: RedeemedGuestPass): void {
  window.localStorage.setItem(REDEEMED_PASS_KEY, JSON.stringify(pass));
  window.dispatchEvent(new CustomEvent(PASS_USAGE_UPDATED_EVENT));
}

function isPassActive(pass?: RedeemedGuestPass): pass is RedeemedGuestPass {
  return Boolean(pass && new Date(pass.expiresAt).getTime() > Date.now());
}

function loadPassUsage(pass: RedeemedGuestPass): StoredPassUsage {
  try {
    const raw = window.localStorage.getItem(getStorageKey(PASS_USAGE_KEY));
    const parsed = raw ? (JSON.parse(raw) as StoredPassUsage) : undefined;

    if (
      parsed?.passCodeId === pass.passCodeId &&
      new Date(parsed.expiresAt).getTime() > Date.now()
    ) {
      return {
        ...parsed,
        deepReadingsUsed: Math.max(parsed.deepReadingsUsed, pass.deepReadingsUsed),
        premiumPdfsUsed: Math.max(parsed.premiumPdfsUsed, pass.premiumPdfsUsed),
        questionsUsed: Math.max(parsed.questionsUsed, pass.questionsUsed),
      };
    }
  } catch {
    // Fall through to pass values.
  }

  return {
    deepReadingsUsed: pass.deepReadingsUsed,
    expiresAt: pass.expiresAt,
    passCodeId: pass.passCodeId,
    premiumPdfsUsed: pass.premiumPdfsUsed,
    questionsUsed: pass.questionsUsed,
    updatedAt: new Date().toISOString(),
  };
}

function savePassUsage(usage: StoredPassUsage): void {
  window.localStorage.setItem(getStorageKey(PASS_USAGE_KEY), JSON.stringify(usage));
}

function loadFreeUsage(): StoredFreeUsage {
  try {
    const raw = window.localStorage.getItem(getStorageKey(FREE_USAGE_KEY));
    const parsed = raw ? (JSON.parse(raw) as StoredFreeUsage) : undefined;

    if (parsed) {
      return {
        deepReadingsUsed: Math.max(0, parsed.deepReadingsUsed ?? 0),
        questionsUsed: Math.max(0, parsed.questionsUsed ?? 0),
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      };
    }
  } catch {
    // Fall through to a fresh lifetime starter balance.
  }

  return {
    deepReadingsUsed: 0,
    questionsUsed: 0,
    updatedAt: new Date().toISOString(),
  };
}

function saveFreeUsage(usage: StoredFreeUsage): void {
  window.localStorage.setItem(getStorageKey(FREE_USAGE_KEY), JSON.stringify(usage));
}

function getStorageKey(baseKey: string): string {
  return window.location.search.includes('cost-guardrail-smoke')
    ? `${baseKey}.smoke`
    : baseKey;
}

function passDisplayTitle(language: SupportedLanguage): string {
  return getMonetizationUsageCopy('privatePassBalanceTitle', language);
}

function passDisplayBody({
  deepRemaining,
  language,
  pass,
  questionRemaining,
}: {
  deepRemaining: number;
  language: SupportedLanguage;
  pass: RedeemedGuestPass;
  questionRemaining: number;
}): string {
  const warning =
    questionRemaining <= 3 || deepRemaining <= 1
      ? getMonetizationUsageCopy('privatePassBalanceLowWarning', language)
      : '';
  return getMonetizationUsageCopy('privatePassBalanceBodyTemplate', language, {
    deepRemaining,
    label: pass.label,
    questionRemaining,
    warning,
  });
}

function freeDisplayTitle(language: SupportedLanguage): string {
  return getMonetizationUsageCopy('freeStarterBalanceTitle', language);
}

function freeDisplayBody({
  language,
  questionRemaining,
}: {
  language: SupportedLanguage;
  questionRemaining: number;
}): string {
  return getMonetizationUsageCopy('freeStarterBalanceBodyTemplate', language, {
    questionRemaining,
  });
}

function navCta(
  id: string,
  label: string,
  href: string,
): ChatSuggestedCta {
  return {
    href,
    id,
    label,
    prompt: label,
    targetScreen: label,
  };
}
