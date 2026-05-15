'use client';

import type {
  ChatSuggestedCta,
  KundliData,
  RedeemedGuestPass,
  SupportedLanguage,
} from '@pridicta/types';

const REDEEMED_PASS_KEY = 'pridicta.redeemedGuestPass.v1';
const PASS_USAGE_KEY = 'pridicta.passCostUsage.v2';
const FREE_USAGE_KEY = 'pridicta.freeCostUsage.v2';

const FREE_DAILY_LIMITS = {
  deepReadingsTotal: 2,
  questionsTotal: 6,
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
  dateKey: string;
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
  const deepRemaining = Math.max(
    0,
    FREE_DAILY_LIMITS.deepReadingsTotal - usage.deepReadingsUsed,
  );
  const questionRemaining = Math.max(
    0,
    FREE_DAILY_LIMITS.questionsTotal - usage.questionsUsed,
  );

  if (
    deepRemaining > 1 &&
    questionRemaining > Math.floor(FREE_DAILY_LIMITS.questionsTotal / 2)
  ) {
    return undefined;
  }

  return {
    body: freeDisplayBody({ deepRemaining, language, questionRemaining }),
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

  if (language === 'hi') {
    return [
      decision.display.kind === 'pass'
        ? 'Aapka private pass safe hai. Is pass ki deep reading limit abhi use ho chuki hai.'
        : 'Free guidance sabke liye fair rahe, isliye aaj ke extra deep readings ko maine pause kiya hai.',
      hasKundli
        ? 'Main abhi bhi bina extra deep reading ke charts, Gochar summary, Mahadasha overview, remedies aur free report kholne mein help kar sakti hoon.'
        : 'Aap manual Kundli bana sakte hain. Uske baad main charts, daily guidance aur free report ke saath help karungi.',
      'Agar deep follow-up chahiye, Premium, Day Pass, ya pass refresh best rahega.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      decision.display.kind === 'pass'
        ? 'Tamaro private pass safe chhe. Aa pass ni deep reading limit atyare use thai gayi chhe.'
        : 'Free guidance badha mate fair rahe, etle aaj na extra deep readings hu pause karu chhu.',
      hasKundli
        ? 'Hu haju pan extra deep reading vagar charts, Gochar summary, Mahadasha overview, remedies ane free report ma help kari shaku chhu.'
        : 'Tame manual Kundli banaavi shako. Pachhi hu charts, daily guidance ane free report sathe help karish.',
      'Deep follow-up joiye to Premium, Day Pass, athva pass refresh best rahe.',
    ].join('\n\n');
  }

  return [
    decision.display.kind === 'pass'
      ? 'Your private pass is safe. The deep reading limit for this pass has been used for now.'
      : 'To keep free guidance fair for everyone, I have paused extra deep readings for today.',
    hasKundli
      ? 'I can still help without another deep reading: open charts, show a Gochar summary, explain Mahadasha basics, suggest remedies, or create a free report.'
      : 'You can still create the Kundli manually. After that I can help with charts, daily guidance, and a free report.',
    'For deeper follow-up, Premium, a Day Pass, or a refreshed private pass is the right path.',
  ].join('\n\n');
}

export function buildPassCostGuardrailSuggestions(
  hasKundli: boolean,
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  if (language === 'hi') {
    return hasKundli
      ? [
          navCta('charts-after-budget', 'Charts kholo', '/dashboard/charts'),
          navCta('timeline-after-budget', 'Timing map dekho', '/dashboard/timeline'),
          navCta('report-after-budget', 'Free report banao', '/dashboard/report'),
          navCta('premium-after-budget', 'Options dekho', '/pricing'),
          navCta('redeem-after-budget', 'Pass redeem karo', '/dashboard/redeem-pass'),
        ]
      : [
          navCta('kundli-after-budget', 'Kundli banao', '/dashboard/kundli'),
          navCta('redeem-after-budget', 'Pass redeem karo', '/dashboard/redeem-pass'),
          navCta('premium-after-budget', 'Options dekho', '/pricing'),
        ];
  }

  if (language === 'gu') {
    return hasKundli
      ? [
          navCta('charts-after-budget', 'Charts kholo', '/dashboard/charts'),
          navCta('timeline-after-budget', 'Timing map juo', '/dashboard/timeline'),
          navCta('report-after-budget', 'Free report banao', '/dashboard/report'),
          navCta('premium-after-budget', 'Options juo', '/pricing'),
          navCta('redeem-after-budget', 'Pass redeem karo', '/dashboard/redeem-pass'),
        ]
      : [
          navCta('kundli-after-budget', 'Kundli banao', '/dashboard/kundli'),
          navCta('redeem-after-budget', 'Pass redeem karo', '/dashboard/redeem-pass'),
          navCta('premium-after-budget', 'Options juo', '/pricing'),
        ];
  }

  return hasKundli
    ? [
        navCta('charts-after-budget', 'Open charts', '/dashboard/charts'),
        navCta('timeline-after-budget', 'See timing map', '/dashboard/timeline'),
        navCta('report-after-budget', 'Create free report', '/dashboard/report'),
        navCta('premium-after-budget', 'See options', '/pricing'),
        navCta('redeem-after-budget', 'Redeem pass', '/dashboard/redeem-pass'),
      ]
    : [
        navCta('kundli-after-budget', 'Create Kundli', '/dashboard/kundli'),
        navCta('redeem-after-budget', 'Redeem pass', '/dashboard/redeem-pass'),
        navCta('premium-after-budget', 'See options', '/pricing'),
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
      ? FREE_DAILY_LIMITS.deepReadingsTotal
      : FREE_DAILY_LIMITS.questionsTotal;
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
        deepRemaining:
          kind === 'deep_reading'
            ? remainingAfter
            : Math.max(0, FREE_DAILY_LIMITS.deepReadingsTotal - usage.deepReadingsUsed),
        language,
        questionRemaining:
          kind === 'question'
            ? remainingAfter
            : Math.max(0, FREE_DAILY_LIMITS.questionsTotal - usage.questionsUsed),
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
  const dateKey = getLocalDateKey();

  try {
    const raw = window.localStorage.getItem(getStorageKey(FREE_USAGE_KEY));
    const parsed = raw ? (JSON.parse(raw) as StoredFreeUsage) : undefined;

    if (parsed?.dateKey === dateKey) {
      return parsed;
    }
  } catch {
    // Fall through to fresh day usage.
  }

  return {
    dateKey,
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

function getLocalDateKey(): string {
  return new Date().toLocaleDateString('en-CA');
}

function passDisplayTitle(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'Private pass limit';
  }

  if (language === 'gu') {
    return 'Private pass limit';
  }

  return 'Private pass limit';
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
  if (language === 'hi') {
    return `${pass.label}: ${questionRemaining} normal questions aur ${deepRemaining} deep readings left.`;
  }

  if (language === 'gu') {
    return `${pass.label}: ${questionRemaining} normal questions ane ${deepRemaining} deep readings left.`;
  }

  return `${pass.label}: ${questionRemaining} normal questions and ${deepRemaining} deep readings left.`;
}

function freeDisplayTitle(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'Free guidance limit';
  }

  if (language === 'gu') {
    return 'Free guidance limit';
  }

  return 'Free guidance limit';
}

function freeDisplayBody({
  deepRemaining,
  language,
  questionRemaining,
}: {
  deepRemaining: number;
  language: SupportedLanguage;
  questionRemaining: number;
}): string {
  if (language === 'hi') {
    return `${questionRemaining} normal questions aur ${deepRemaining} deep readings aaj ke liye left.`;
  }

  if (language === 'gu') {
    return `${questionRemaining} normal questions ane ${deepRemaining} deep readings aaje left.`;
  }

  return `${questionRemaining} normal questions and ${deepRemaining} deep readings left today.`;
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
