import type { SupportedLanguage } from '@pridicta/types';
import { getRandomPredictaGreeting } from './predictaMemory';
import predictaUxTranslations from './translations/predictaUx.json';

export type PredictaJourneyStep = {
  id: 'create' | 'summary' | 'ask';
  title: string;
  body: string;
  action: string;
};

export const PREDICTA_JOURNEY_STEPS =
  predictaUxTranslations.journeySteps as PredictaJourneyStep[];

export type PredictaOutcomeEntry = {
  id:
    | 'money'
    | 'career'
    | 'marriage'
    | 'health'
    | 'family'
    | 'today'
    | 'remedies'
    | 'report';
  title: string;
  body: string;
  proof: string;
  prompt: string;
  cta: string;
};

export const PREDICTA_OUTCOME_ENTRIES =
  predictaUxTranslations.outcomeEntries as PredictaOutcomeEntry[];

type PredictaUxLocalizedCopy = {
  birthExtractionFailureLines: string[];
  birthIntakeWelcome: string;
  friendlyGreetingLines: string[];
  listeningMicrocopy: string[];
  microMessages: Record<PredictaMicroMessageId, string>;
};

const PREDICTA_UX_COPY = predictaUxTranslations.copy as Record<
  SupportedLanguage,
  PredictaUxLocalizedCopy
>;

export type PredictaMicroMessageId =
  | 'careerTimingFocus'
  | 'checkingTimingFirst'
  | 'deterministicModeActive'
  | 'elegantFunSpark'
  | 'kpUsefulEventQuestion'
  | 'kundliSelected'
  | 'needBirthPlacePrecision'
  | 'passNearingExhaustion'
  | 'reportReady'
  | 'signatureReady';

function getPredictaUxCopy(language: SupportedLanguage): PredictaUxLocalizedCopy {
  return PREDICTA_UX_COPY[language] ?? PREDICTA_UX_COPY.en;
}

export function getFriendlyGreetingReply(language: SupportedLanguage): string {
  const greeting = getRandomPredictaGreeting(language);
  const copy = getPredictaUxCopy(language);

  return [greeting, ...copy.friendlyGreetingLines].join('\n');
}

export function getBirthIntakeWelcome(language: SupportedLanguage): string {
  const greeting = getRandomPredictaGreeting(
    language,
    `birth-intake-${language}`,
  );

  return `${greeting} ${getPredictaUxCopy(language).birthIntakeWelcome}`;
}

export function getListeningMicrocopy(language: SupportedLanguage): string {
  const items = getPredictaUxCopy(language).listeningMicrocopy;
  const index = Math.floor(Math.random() * items.length);

  return items[index] ?? items[0];
}

export function getPredictaMicroMessage(
  language: SupportedLanguage,
  id: PredictaMicroMessageId,
): string {
  const copy = getPredictaUxCopy(language);
  return copy.microMessages[id] ?? PREDICTA_UX_COPY.en.microMessages[id];
}

export function getBirthExtractionFailureReply(
  language: SupportedLanguage,
): string {
  return getPredictaUxCopy(language).birthExtractionFailureLines.join('\n');
}

export function isSimpleGreeting(message: string): boolean {
  return /^(hi|hello|hey|namaste|namaskar|pranam|ram ram|jai shree krishna|kem cho|kaise ho|kaise ho predicta|su chale|shu chale)[!.\s]*$/i.test(
    message.trim(),
  );
}
