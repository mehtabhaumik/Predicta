import type { SupportedLanguage } from '@pridicta/types';
import eventOracleTranslations from './translations/eventOracle.json';

export type EventOracleCopy = {
  categoryLabels: Record<string, string>;
  categoryClarifiers: Record<string, string>;
  chipQuestions: Record<string, string>;
  composer: {
    askThis: string;
    body: string;
    clarifierLabel: string;
    customPlaceholder: string;
    customTitle: string;
    evidenceLabel: string;
    freePaid: string;
    guideMe: string;
    refinedLabel: string;
    refineQuestion: string;
    selectedLabel: string;
    title: string;
  };
  hero: {
    actionTitle: string;
    activeKundliEmpty: string;
    activeKundliLabel: string;
    activeKundliReady: string;
    creditQuietBody: string;
    creditQuietTitle: string;
    deterministicHelp: string;
    eyebrow: string;
    primaryCta: string;
    reportCta: string;
    secondaryCta: string;
    statusLabel: string;
    subtitle: string;
    title: string;
  };
  handoff: {
    evidenceLabel: string;
    modeLabel: string;
    mainSynthesisMode: string;
    roomSafeMode: string;
    title: string;
  };
  predictionCard: {
    actionPlanLabel: string;
    collapsedEvidenceLabel: string;
    confidenceLabel: string;
    delayLabel: string;
    directAnswerLabel: string;
    evidencePendingTitle: string;
    strengthenLabel: string;
    timingTriggerLabel: string;
  };
  precisionReading: {
    costGuardrail: string;
    followUp: string;
    freePreviewBody: string;
    freePreviewTitle: string;
    paidBody: string;
    paidCta: string;
    paidTitle: string;
    productLabel: string;
    reportSeparation: string;
    telemetry: string;
  };
  recentThreads: {
    empty: string;
    openThread: string;
    title: string;
  };
  roomLabels: Record<string, string>;
  tracker: {
    adminAnalyticsTitle: string;
    analyticsCaution: string;
    didNotHappen: string;
    empty: string;
    familyPrivate: string;
    happened: string;
    markOutcome: string;
    partiallyHappened: string;
    pending: string;
    reminderDue: string;
    reminderPending: string;
    savePrediction: string;
    shareWithFamily: string;
    title: string;
    tooEarly: string;
    unshareFromFamily: string;
  };
};

const EVENT_ORACLE_COPY = eventOracleTranslations.copy as Record<
  SupportedLanguage,
  EventOracleCopy
>;

export function getEventOracleCopy(language: SupportedLanguage): EventOracleCopy {
  return EVENT_ORACLE_COPY[language] ?? EVENT_ORACLE_COPY.en;
}
