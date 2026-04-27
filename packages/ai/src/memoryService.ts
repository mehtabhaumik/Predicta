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
const MONTHS: Record<string, string> = {
  apr: '04',
  april: '04',
  aug: '08',
  august: '08',
  dec: '12',
  december: '12',
  feb: '02',
  february: '02',
  jan: '01',
  january: '01',
  jul: '07',
  july: '07',
  jun: '06',
  june: '06',
  mar: '03',
  march: '03',
  may: '05',
  nov: '11',
  november: '11',
  oct: '10',
  october: '10',
  sep: '09',
  sept: '09',
  september: '09',
};

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function normalizeYear(year: string): string {
  if (year.length === 4) {
    return year;
  }

  return Number(year) > 30 ? `19${year}` : `20${year}`;
}

function formatDateParts(year: string, month: string, day: string): string {
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function extractDate(text: string): string | undefined {
  const normalized = normalize(text);
  const iso = normalized.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) {
    return formatDateParts(iso[1], iso[2], iso[3]);
  }

  const numeric = normalized.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numeric) {
    return formatDateParts(normalizeYear(numeric[3]), numeric[2], numeric[1]);
  }

  const named = normalized.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})\b/i);
  if (named) {
    const month = MONTHS[named[2].toLowerCase()];
    if (month) {
      return formatDateParts(normalizeYear(named[3]), month, named[1]);
    }
  }

  return undefined;
}

function extractTime(text: string): string | undefined {
  const normalized = normalize(text);
  const time =
    normalized.match(
      /\b(?:time|born at|birth time is|at)\s*:?\s*(\d{1,2})(?::(\d{2}))?\s*(?:in the\s+)?(am|pm|morning|evening|night)?\b/i,
    ) ?? normalized.match(/\b(\d{1,2}):(\d{2})\s*(am|pm|morning|evening|night)?\b/i);

  if (!time) {
    return undefined;
  }

  let hours = Number(time[1]);
  const minutes = Number(time[2] ?? '00');
  const meridiemText = time[3]?.toLowerCase();
  const meridiem =
    meridiemText === 'am' || meridiemText === 'morning'
      ? 'AM'
      : meridiemText === 'pm' ||
          meridiemText === 'evening' ||
          meridiemText === 'night'
        ? 'PM'
        : undefined;

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }
  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }
  if (hours > 23 || minutes > 59) {
    return undefined;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function extractPlace(text: string): string | undefined {
  const normalized = normalize(text);
  const labeled = normalized.match(
    /\b(?:birth place|birthplace|place)\s*(?:is|:)?\s*([A-Za-z][A-Za-z\s.-]+(?:,\s*[A-Za-z][A-Za-z\s.-]+){0,2})\b/i,
  );

  if (labeled?.[1]) {
    return labeled[1].trim();
  }

  const bornIn = normalized.match(
    /\b(?:born in|from)\s+([A-Za-z][A-Za-z\s.-]+(?:,\s*[A-Za-z][A-Za-z\s.-]+){0,2})\b/i,
  );

  if (bornIn?.[1]) {
    return bornIn[1].trim();
  }

  return undefined;
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
    kundliReady: false,
    knownConcerns: [],
    previousGuidance: [],
    previousTopics: [],
  };
}

function extractBirthDetailsFromText(text: string): PartialBirthDetails {
  return {
    date: extractDate(text),
    place: extractPlace(text),
    time: extractTime(text),
  } as PartialBirthDetails;
}

function stripUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as Partial<T>;
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
      ...stripUndefined(extractBirthDetailsFromText(turn.text)),
    }),
    {},
  );
  const extractedFromMessage = input.message
    ? stripUndefined(extractBirthDetailsFromText(input.message))
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
    kundliReady: Boolean(input.kundli ?? existing.kundliReady),
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
