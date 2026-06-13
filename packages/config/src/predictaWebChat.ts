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
  kundliCreatedAsk: string;
  kundliCreatedIntro: string;
  kundliCreatedLabels: {
    currentDasha: string;
    lagna: string;
    moon: string;
    nakshatra: string;
  };
  kundliCreatedQuickOptions: string;
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
