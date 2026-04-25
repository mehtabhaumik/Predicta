import type {
  AstrologyMemory,
  BirthDetails,
  ChartContext,
  ConversationTurn,
  KundliData,
} from '@pridicta/types';
import { detectPredictaIntent } from './intentDetector';

type MemoryInput = {
  existingMemory?: AstrologyMemory;
  message?: string;
  history?: ConversationTurn[];
  kundli?: KundliData;
  chartContext?: ChartContext;
  preferredLanguage?: string;
};

type PartialBirthDetails = Partial<BirthDetails>;

const DATE_PATTERN = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/i;
const TIME_PATTERN = /\b(\d{1,2}:\d{2}\s?(?:am|pm)?)\b/i;
const PLACE_PATTERN =
  /\b(?:place|born in|birth place|location)\s*:\s*([A-Za-z][A-Za-z\s,.-]{2,})$/i;

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function normalizePreferredLanguage(value?: string): "en" | "hi" | "gu" | undefined {
  if (value === 'en' || value === 'hi' || value === 'gu') {
    return value;
  }

  return undefined;
}

export function createInitialAstrologyMemory(): AstrologyMemory {
  return {
    birthDetailsComplete: false,
    knownConcerns: [],
    previousGuidance: [],
    previousTopics: [],
  };
}

function extractBirthDetailsFromText(text: string): PartialBirthDetails {
  const normalized = normalize(text);
  const dateMatch = normalized.match(DATE_PATTERN)?.[1];
  const timeMatch = normalized.match(TIME_PATTERN)?.[1];
  const placeMatch = normalized.match(PLACE_PATTERN)?.[1] ?? (
    /\b([A-Za-z][A-Za-z\s-]+,\s*[A-Za-z][A-Za-z\s-]+)\b/.exec(normalized)?.[1]
  );

  return {
    date: dateMatch,
    place: placeMatch,
    time: timeMatch,
  } as PartialBirthDetails;
}

function mergeBirthDetails(
  existing?: BirthDetails,
  update?: PartialBirthDetails,
): BirthDetails | undefined {
  if (!existing && !update) {
    return undefined;
  }

  const merged = {
    ...(existing ?? {}),
    ...(update ?? {}),
  } as Partial<BirthDetails>;

  if (
    merged.name &&
    merged.date &&
    merged.time &&
    merged.place &&
    typeof merged.latitude === 'number' &&
    typeof merged.longitude === 'number' &&
    merged.timezone
  ) {
    return merged as BirthDetails;
  }

  return merged as BirthDetails | undefined;
}

function uniqueLimited(values: string[], limit = 8): string[] {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))].slice(-limit);
}

function summarizeGuidance(text: string): string {
  const firstSentence = normalize(text).split(/(?<=[.!?])\s+/)[0] ?? text;
  return firstSentence.slice(0, 180);
}

export function getConversationSummary(
  memory?: AstrologyMemory,
  history?: ConversationTurn[],
): string {
  const safeMemory = memory ?? createInitialAstrologyMemory();
  const recentUsers = (history ?? [])
    .filter(turn => turn.role === 'user')
    .slice(-3)
    .map(turn => normalize(turn.text));

  const parts: string[] = [];

  if (safeMemory.userName) {
    parts.push(`User: ${safeMemory.userName}`);
  }
  if (safeMemory.lastIntent) {
    parts.push(`Current focus: ${safeMemory.lastIntent.replace(/_/g, ' ')}`);
  }
  if (safeMemory.knownConcerns.length > 0) {
    parts.push(`Known concerns: ${safeMemory.knownConcerns.slice(-2).join('; ')}`);
  }
  if (safeMemory.birthDetailsComplete && safeMemory.birthDetails?.date) {
    parts.push('Birth details complete');
  }
  if (!safeMemory.birthDetailsComplete && safeMemory.birthDetails) {
    parts.push('Birth details partial');
  }
  if (safeMemory.lastChartContext?.chartType) {
    parts.push(`Chart focus: ${safeMemory.lastChartContext.chartType}`);
  }
  if (recentUsers.length > 0) {
    parts.push(`Recent user asks: ${recentUsers.join(' | ')}`);
  }

  return parts.join('. ');
}

export function updateConversationSummary(
  memory: AstrologyMemory,
  history?: ConversationTurn[],
): AstrologyMemory {
  return {
    ...memory,
    conversationSummary: getConversationSummary(memory, history),
  };
}

export function getUserAstrologyMemory(input: MemoryInput): AstrologyMemory {
  return updateUserAstrologyMemory(input);
}

export function updateUserAstrologyMemory(input: MemoryInput): AstrologyMemory {
  const existing = input.existingMemory ?? createInitialAstrologyMemory();
  const userTurns = (input.history ?? []).filter(turn => turn.role === 'user');
  const assistantTurns = (input.history ?? []).filter(turn => turn.role === 'pridicta');

  const extractedFromHistory = userTurns.reduce<PartialBirthDetails>(
    (accumulator, turn) => ({
      ...accumulator,
      ...extractBirthDetailsFromText(turn.text),
    }),
    {},
  );
  const extractedFromMessage = input.message
    ? extractBirthDetailsFromText(input.message)
    : undefined;

  const mergedBirthDetails = input.kundli?.birthDetails
    ? input.kundli.birthDetails
    : mergeBirthDetails(
        existing.birthDetails,
        {
          ...extractedFromHistory,
          ...extractedFromMessage,
        },
      );

  const intentProfile = input.message
    ? detectPredictaIntent({
        chartContext: input.chartContext ?? existing.lastChartContext,
        history: input.history,
        memory: existing,
        message: input.message,
      })
    : undefined;

  const concernCandidates = [
    ...existing.knownConcerns,
    ...userTurns.slice(-3).map(turn => summarizeGuidance(turn.text)),
    ...(input.message ? [summarizeGuidance(input.message)] : []),
  ];

  const topicCandidates = [
    ...existing.previousTopics,
    ...(intentProfile?.primaryIntent ? [intentProfile.primaryIntent] : []),
  ];

  const guidanceCandidates = [
    ...existing.previousGuidance,
    ...assistantTurns.slice(-3).map(turn => summarizeGuidance(turn.text)),
  ];

  const memory: AstrologyMemory = {
    ...existing,
    activeKundliId: input.kundli?.id ?? existing.activeKundliId,
    birthDetails: mergedBirthDetails,
    birthDetailsComplete: Boolean(
      input.kundli?.birthDetails ??
        (mergedBirthDetails?.date &&
          mergedBirthDetails?.time &&
          mergedBirthDetails?.place),
    ),
    conversationSummary: existing.conversationSummary,
    emotionalTone: intentProfile?.emotionalTone ?? existing.emotionalTone,
    knownConcerns: uniqueLimited(concernCandidates, 8),
    lastChartContext: input.chartContext ?? existing.lastChartContext,
    lastIntent: intentProfile?.primaryIntent ?? existing.lastIntent,
    preferredLanguage:
      normalizePreferredLanguage(input.preferredLanguage) ??
      existing.preferredLanguage,
    previousGuidance: uniqueLimited(guidanceCandidates, 6),
    previousTopics: uniqueLimited(topicCandidates, 6),
    userName:
      input.kundli?.birthDetails.name ??
      existing.userName ??
      mergedBirthDetails?.name,
  };

  return updateConversationSummary(memory, input.history);
}
