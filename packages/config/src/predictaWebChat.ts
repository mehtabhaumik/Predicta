import type { SupportedLanguage } from '@pridicta/types';
import predictaWebChatTranslations from './translations/predictaWebChat.json';

export type PredictaWebChatSuggestionCopy = {
  href?: string;
  id: string;
  label: string;
  prompt: string;
  targetScreen?: string;
};

export type PredictaWebChatCopy = {
  chatPlaceholder: string;
  createKundliFirstReply: string;
  feedback: {
    copiedLabel: string;
    copyLabel: string;
    groupLabel: string;
    helpfulLabel: string;
    notHelpfulLabel: string;
    ratingBody: string;
    ratingGroupLabel: string;
    ratingLabel: string;
    ratingLater: string;
    ratingThanks: string;
    ratingTitle: string;
  };
  kundliCreatedAsk: string;
  kundliCreatedIntro: string;
  kundliCreatedLabels: {
    currentDasha: string;
    lagna: string;
    moon: string;
    nakshatra: string;
  };
  kundliCreatedQuickOptions: string;
  kundliManagement: {
    activeKundliSuffix: string;
    deleted: string;
    editConfirm: string;
    fieldLabels: {
      date: string;
      name: string;
      place: string;
      time: string;
    };
    savedAsNewAction: string;
    updated: string;
    updatedAction: string;
  };
  placeClarificationReply: string;
  postKundliSuggestions: PredictaWebChatSuggestionCopy[];
  radarSuggestions: PredictaWebChatSuggestionCopy[];
  smartMonetizationSuggestions: {
    calendar: PredictaWebChatSuggestionCopy;
    compare: PredictaWebChatSuggestionCopy;
    dayPass: PredictaWebChatSuggestionCopy;
    freePreview: PredictaWebChatSuggestionCopy;
    premium: PredictaWebChatSuggestionCopy;
    report: PredictaWebChatSuggestionCopy;
  };
};

const COPY = predictaWebChatTranslations.copy as Record<
  SupportedLanguage,
  PredictaWebChatCopy
>;

export function getPredictaWebChatCopy(
  language: SupportedLanguage = 'en',
): PredictaWebChatCopy {
  return COPY[language] ?? COPY.en;
}

export function formatPredictaWebChatCopy(
  template: string,
  values: Record<string, number | string | undefined>,
): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? '' : String(value);
  });
}
