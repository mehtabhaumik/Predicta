import { create } from 'zustand';

import { DAY_PASS_LIMITS, getUsageLimits } from '@pridicta/config/usageLimits';
import { getBirthIntakeWelcome } from '@pridicta/config/predictaUx';
import { resolveAccess } from '@pridicta/access';
import {
  consumeGuestQuota,
  hasGuestQuota,
} from '@pridicta/access';
import {
  consumeOneTimeQuestionCreditFromState,
  consumePremiumPdfCreditFromState,
  createInitialMonetizationState,
  getPaidQuestionCredits,
  hasActiveDayPass,
  hasPremiumPdfCredit as hasPremiumPdfCreditInState,
  hasPremiumAccess,
  isPremium,
} from '@pridicta/monetization';
import type {
  AuthState,
  BirthDetailsDraft,
  ChartContext,
  ChatMessage,
  KundliData,
  LanguagePreference,
  SavedKundliRecord,
  SupportedLanguage,
  UsageState,
  UserPlan,
} from '../types/astrology';
import type { RedeemedGuestPass, ResolvedAccess } from '../types/access';
import type {
  EntitlementState,
  MonetizationState,
  OneTimeEntitlement,
} from '../types/subscription';

const BIRTH_INTAKE_CONVERSATION_ID = 'birth-intake';

function getDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function getMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

function createInitialUsage(): UsageState {
  return {
    dayKey: getDayKey(),
    dayPassDeepCallsUsed: 0,
    dayPassPdfsUsed: 0,
    dayPassQuestionsUsed: 0,
    deepCallsToday: 0,
    monthKey: getMonthKey(),
    pdfsThisMonth: 0,
    questionsToday: 0,
  };
}

function normalizeUsage(usage: UsageState): UsageState {
  const dayKey = getDayKey();
  const monthKey = getMonthKey();

  return {
    dayKey,
    dayPassDeepCallsUsed: usage.dayPassDeepCallsUsed ?? 0,
    dayPassPdfsUsed: usage.dayPassPdfsUsed ?? 0,
    dayPassQuestionsUsed: usage.dayPassQuestionsUsed ?? 0,
    deepCallsToday: usage.dayKey === dayKey ? usage.deepCallsToday : 0,
    monthKey,
    pdfsThisMonth: usage.monthKey === monthKey ? usage.pdfsThisMonth : 0,
    questionsToday: usage.dayKey === dayKey ? usage.questionsToday : 0,
  };
}

function getKundliSessionId(kundli: KundliData): string {
  const { date, name, time } = kundli.birthDetails;
  return `${name}-${date}-${time}`.toLowerCase().replace(/\s+/g, '-');
}

type AppState = {
  activeChartContext?: ChartContext;
  activeKundli?: KundliData;
  activeKundliId?: string;
  auth: AuthState;
  biometricsEnabled: boolean;
  chatSoundEnabled: boolean;
  conversationsByKundli: Record<string, ChatMessage[]>;
  languagePreference: LanguagePreference;
  onboardingComplete: boolean;
  monetization: MonetizationState;
  pendingBirthDetailsDraft?: BirthDetailsDraft;
  pendingKundliEditId?: string;
  predictaReplyLanguage: SupportedLanguage;
  pinEnabled: boolean;
  redeemedGuestPass?: RedeemedGuestPass;
  securityEnabled: boolean;
  savedKundlis: SavedKundliRecord[];
  usage: UsageState;
  userPlan: UserPlan;
  appendConversationMessage: (message: ChatMessage) => void;
  canUseDeepCall: () => boolean;
  canAskQuestion: () => boolean;
  canGeneratePdf: () => boolean;
  hasPremiumPdfCredit: (kundliId?: string) => boolean;
  hasPaidQuestionCredits: () => boolean;
  clearActiveKundli: () => void;
  clearPendingBirthDetailsDraft: () => void;
  clearPendingKundliEditId: () => void;
  consumePaidQuestionCredit: () => boolean;
  consumeGuestDeepQuota: () => boolean;
  consumeGuestPdfQuota: () => boolean;
  consumeGuestQuestionQuota: () => boolean;
  consumePremiumPdfCredit: (kundliId: string) => boolean;
  getActiveConversation: () => ChatMessage[];
  getResolvedAccess: () => ResolvedAccess;
  addOneTimeEntitlement: (entitlement: OneTimeEntitlement) => void;
  recordDeepCall: () => void;
  recordPdfGeneration: () => void;
  recordQuestion: () => void;
  replaceConversationMessage: (messageId: string, message: ChatMessage) => void;
  setActiveChartContext: (context?: ChartContext) => void;
  setActiveKundli: (kundli: KundliData) => void;
  setAuth: (value: AuthState) => void;
  setBiometricsEnabled: (value: boolean) => void;
  setChatSoundEnabled: (value: boolean) => void;
  setEntitlement: (value: EntitlementState) => void;
  setLanguagePreference: (language: SupportedLanguage) => void;
  setMonetizationState: (value: MonetizationState) => void;
  setOnboardingComplete: (value: boolean) => void;
  setPendingBirthDetailsDraft: (value?: BirthDetailsDraft) => void;
  setPendingKundliEditId: (value?: string) => void;
  setPinEnabled: (value: boolean) => void;
  setPredictaReplyLanguage: (language: SupportedLanguage) => void;
  setRedeemedGuestPass: (value?: RedeemedGuestPass) => void;
  setSavedKundlis: (records: SavedKundliRecord[]) => void;
  setSecurityEnabled: (value: boolean) => void;
  setUserPlan: (value: UserPlan) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  auth: {
    isLoggedIn: false,
    provider: null,
  },
  activeKundliId: BIRTH_INTAKE_CONVERSATION_ID,
  biometricsEnabled: true,
  chatSoundEnabled: true,
  conversationsByKundli: {
    [BIRTH_INTAKE_CONVERSATION_ID]: [
      {
        createdAt: new Date().toISOString(),
        id: 'welcome-birth-intake',
        role: 'pridicta',
        text: getBirthIntakeWelcome('en'),
      },
    ],
  },
  languagePreference: {
    appLanguage: 'en',
    language: 'en',
    predictaReplyLanguage: 'en',
    updatedAt: new Date().toISOString(),
  },
  monetization: createInitialMonetizationState(),
  onboardingComplete: false,
  pinEnabled: true,
  predictaReplyLanguage: 'en',
  savedKundlis: [],
  securityEnabled: false,
  usage: createInitialUsage(),
  userPlan: 'FREE',
  appendConversationMessage: message =>
    set(state => {
      if (!state.activeKundliId) {
        return {};
      }

      const activeMessages =
        state.conversationsByKundli[state.activeKundliId] ?? [];

      return {
        conversationsByKundli: {
          ...state.conversationsByKundli,
          [state.activeKundliId]: [...activeMessages, message],
        },
      };
    }),
  canAskQuestion: () => {
    const state = get();
    const usage = normalizeUsage(state.usage);
    const access = state.getResolvedAccess();

    if (access.hasUnrestrictedAppAccess) {
      return true;
    }

    if (access.source === 'guest_pass') {
      return hasGuestQuota(state.redeemedGuestPass, 'question');
    }

    if (
      hasActiveDayPass(state.monetization.oneTimeEntitlements) &&
      !isPremium(state.monetization.entitlement)
    ) {
      return (
        (usage.dayPassQuestionsUsed ?? 0) < DAY_PASS_LIMITS.questionsPerPass
      );
    }

    const plan = hasPremiumAccess(state.monetization)
      ? 'PREMIUM'
      : state.userPlan;
    const limits = getUsageLimits(plan);

    return usage.questionsToday < limits.questionsPerDay;
  },
  canUseDeepCall: () => {
    const state = get();
    const usage = normalizeUsage(state.usage);
    const access = state.getResolvedAccess();

    if (access.hasUnrestrictedAppAccess) {
      return true;
    }

    if (access.source === 'guest_pass') {
      return hasGuestQuota(state.redeemedGuestPass, 'deep_reading');
    }

    if (
      hasActiveDayPass(state.monetization.oneTimeEntitlements) &&
      !isPremium(state.monetization.entitlement)
    ) {
      return (
        (usage.dayPassDeepCallsUsed ?? 0) < DAY_PASS_LIMITS.deepCallsPerPass
      );
    }

    const plan = hasPremiumAccess(state.monetization)
      ? 'PREMIUM'
      : state.userPlan;
    const limits = getUsageLimits(plan);

    return usage.deepCallsToday < limits.deepCallsPerDay;
  },
  canGeneratePdf: () => {
    const state = get();
    const usage = normalizeUsage(state.usage);
    const access = state.getResolvedAccess();

    if (access.hasUnrestrictedAppAccess) {
      return true;
    }

    if (access.source === 'guest_pass') {
      return hasGuestQuota(state.redeemedGuestPass, 'premium_pdf');
    }

    if (
      hasActiveDayPass(state.monetization.oneTimeEntitlements) &&
      !isPremium(state.monetization.entitlement)
    ) {
      return (usage.dayPassPdfsUsed ?? 0) < DAY_PASS_LIMITS.pdfsPerPass;
    }

    const plan = hasPremiumAccess(state.monetization)
      ? 'PREMIUM'
      : state.userPlan;
    const limits = getUsageLimits(plan);

    return usage.pdfsThisMonth < limits.pdfsPerMonth;
  },
  clearPendingBirthDetailsDraft: () =>
    set({ pendingBirthDetailsDraft: undefined }),
  clearPendingKundliEditId: () => set({ pendingKundliEditId: undefined }),
  clearActiveKundli: () =>
    set({
      activeChartContext: undefined,
      activeKundli: undefined,
      activeKundliId: BIRTH_INTAKE_CONVERSATION_ID,
    }),
  hasPaidQuestionCredits: () =>
    getPaidQuestionCredits(get().monetization.oneTimeEntitlements) > 0,
  hasPremiumPdfCredit: kundliId =>
    hasPremiumPdfCreditInState(
      get().monetization.oneTimeEntitlements,
      kundliId,
    ),
  consumePaidQuestionCredit: () => {
    const result = consumeOneTimeQuestionCreditFromState(get().monetization);

    if (result.consumed) {
      set({
        monetization: result.state,
      });
    }

    return result.consumed;
  },
  consumeGuestQuestionQuota: () => {
    const pass = get().redeemedGuestPass;

    if (!pass || !hasGuestQuota(pass, 'question')) {
      return false;
    }

    set({
      redeemedGuestPass: consumeGuestQuota(pass, 'question'),
    });

    return true;
  },
  consumeGuestDeepQuota: () => {
    const pass = get().redeemedGuestPass;

    if (!pass || !hasGuestQuota(pass, 'deep_reading')) {
      return false;
    }

    set({
      redeemedGuestPass: consumeGuestQuota(pass, 'deep_reading'),
    });

    return true;
  },
  consumeGuestPdfQuota: () => {
    const pass = get().redeemedGuestPass;

    if (!pass || !hasGuestQuota(pass, 'premium_pdf')) {
      return false;
    }

    set({
      redeemedGuestPass: consumeGuestQuota(pass, 'premium_pdf'),
    });

    return true;
  },
  consumePremiumPdfCredit: kundliId => {
    const result = consumePremiumPdfCreditFromState(
      get().monetization,
      kundliId,
    );

    if (result.consumed) {
      set({
        monetization: result.state,
      });
    }

    return result.consumed;
  },
  getActiveConversation: () => {
    const state = get();

    if (!state.activeKundliId) {
      return [];
    }

    return state.conversationsByKundli[state.activeKundliId] ?? [];
  },
  getResolvedAccess: () => {
    const state = get();

    return resolveAccess({
      auth: state.auth,
      monetization: state.monetization,
      redeemedGuestPass: state.redeemedGuestPass,
    });
  },
  addOneTimeEntitlement: entitlement =>
    set(state => ({
      monetization: {
        ...state.monetization,
        oneTimeEntitlements: [
          entitlement,
          ...state.monetization.oneTimeEntitlements,
        ],
      },
      usage:
        entitlement.productType === 'DAY_PASS'
          ? {
              ...normalizeUsage(state.usage),
              dayPassDeepCallsUsed: 0,
              dayPassPdfsUsed: 0,
              dayPassQuestionsUsed: 0,
            }
          : state.usage,
    })),
  recordPdfGeneration: () =>
    set(state => {
      const usage = normalizeUsage(state.usage);

      return {
        usage: {
          ...usage,
          dayPassPdfsUsed:
            hasActiveDayPass(state.monetization.oneTimeEntitlements) &&
            !isPremium(state.monetization.entitlement)
              ? (usage.dayPassPdfsUsed ?? 0) + 1
              : usage.dayPassPdfsUsed,
          pdfsThisMonth: usage.pdfsThisMonth + 1,
        },
      };
    }),
  recordDeepCall: () =>
    set(state => {
      const usage = normalizeUsage(state.usage);

      return {
        usage: {
          ...usage,
          dayPassDeepCallsUsed:
            hasActiveDayPass(state.monetization.oneTimeEntitlements) &&
            !isPremium(state.monetization.entitlement)
              ? (usage.dayPassDeepCallsUsed ?? 0) + 1
              : usage.dayPassDeepCallsUsed,
          deepCallsToday: usage.deepCallsToday + 1,
        },
      };
    }),
  recordQuestion: () =>
    set(state => {
      const usage = normalizeUsage(state.usage);

      return {
        usage: {
          ...usage,
          dayPassQuestionsUsed:
            hasActiveDayPass(state.monetization.oneTimeEntitlements) &&
            !isPremium(state.monetization.entitlement)
              ? (usage.dayPassQuestionsUsed ?? 0) + 1
              : usage.dayPassQuestionsUsed,
          questionsToday: usage.questionsToday + 1,
        },
      };
    }),
  replaceConversationMessage: (messageId, message) =>
    set(state => {
      if (!state.activeKundliId) {
        return {};
      }

      const activeMessages =
        state.conversationsByKundli[state.activeKundliId] ?? [];

      return {
        conversationsByKundli: {
          ...state.conversationsByKundli,
          [state.activeKundliId]: activeMessages.map(item =>
            item.id === messageId ? message : item,
          ),
        },
      };
    }),
  setActiveChartContext: context => set({ activeChartContext: context }),
  setActiveKundli: kundli => {
    const activeKundliId = getKundliSessionId(kundli);

    set(state => ({
      activeKundli: kundli,
      activeKundliId,
      conversationsByKundli: {
        ...state.conversationsByKundli,
        [activeKundliId]: state.conversationsByKundli[activeKundliId] ?? [
          {
            createdAt: new Date().toISOString(),
            id: `welcome-${activeKundliId}`,
            role: 'pridicta',
            text: `I have opened ${kundli.birthDetails.name}'s kundli. Ask from any chart or report section and I will keep that context in mind.`,
          },
        ],
      },
    }));
  },
  setAuth: value => set({ auth: value }),
  setBiometricsEnabled: value => set({ biometricsEnabled: value }),
  setChatSoundEnabled: value => set({ chatSoundEnabled: value }),
  setEntitlement: value =>
    set({
      monetization: {
        ...get().monetization,
        entitlement: value,
      },
      userPlan: value.plan,
    }),
  setLanguagePreference: language =>
    set({
      languagePreference: {
        appLanguage: language,
        language,
        predictaReplyLanguage: language,
        updatedAt: new Date().toISOString(),
      },
      predictaReplyLanguage: language,
    }),
  setMonetizationState: value =>
    set({
      monetization: value,
      userPlan: value.entitlement.plan,
    }),
  setOnboardingComplete: value => set({ onboardingComplete: value }),
  setPendingBirthDetailsDraft: value =>
    set({ pendingBirthDetailsDraft: value }),
  setPendingKundliEditId: value => set({ pendingKundliEditId: value }),
  setPinEnabled: value => set({ pinEnabled: value }),
  setPredictaReplyLanguage: language =>
    set(state => ({
      languagePreference: {
        ...state.languagePreference,
        predictaReplyLanguage: language,
        updatedAt: new Date().toISOString(),
      },
      predictaReplyLanguage: language,
    })),
  setRedeemedGuestPass: value => set({ redeemedGuestPass: value }),
  setSavedKundlis: records => set({ savedKundlis: records }),
  setSecurityEnabled: value => set({ securityEnabled: value }),
  setUserPlan: value => set({ userPlan: value }),
}));
