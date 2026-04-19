import type {
  DailyIntelligence,
  IntelligenceDepth,
  IntelligenceQuotaDecision,
  KundliData,
  WeeklyIntelligence,
  WeeklyDateWindow,
} from '@pridicta/types';
import { sha256 } from '@pridicta/utils/sha256';

const toneCycle = [
  'Grounded and observant',
  'Focused but gentle',
  'Reflective and steady',
  'Clear, practical, and calm',
  'Patient with useful momentum',
  'Quietly confident',
  'Soft but decisive',
];

const workThemes = [
  'prioritize one important responsibility before opening new loops',
  'finish what already has momentum instead of chasing every signal',
  'use structure, notes, and timing to reduce unnecessary pressure',
  'make space for careful decisions around work and money',
  'choose the task that improves long-term stability',
  'keep communication simple and documented',
  'protect deep work from scattered interruptions',
];

const relationshipThemes = [
  'listen before responding; the tone matters more than speed',
  'keep expectations warm, direct, and realistic',
  'avoid reading silence as rejection; ask gently when needed',
  'let practical care speak louder than dramatic reassurance',
  'choose patience where a conversation is still forming',
  'repair small misunderstandings before they become stories',
  'make room for honest but calm emotional clarity',
];

const actions = [
  'Write the one decision that would make today feel lighter, then act on the smallest next step.',
  'Give the first half of the day to the most concrete task, then review your energy before committing further.',
  'Choose one useful conversation and keep it direct, kind, and short.',
  'Review one pending commitment and remove anything that no longer needs your attention.',
  'Spend ten quiet minutes before a major response or purchase.',
  'Close one open loop before starting something new.',
  'Keep your schedule slightly underfilled so timing can breathe.',
];

const avoids = [
  'Avoid forcing certainty where the chart is asking for observation.',
  'Avoid overexplaining your position when a simple answer is enough.',
  'Avoid making a long-term promise from a temporary mood.',
  'Avoid comparing your timing with someone else’s path.',
  'Avoid reacting to pressure as if it is guidance.',
  'Avoid taking on a new obligation just to reduce short-term discomfort.',
  'Avoid treating a delay as a denial.',
];

export function getDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function getWeekKey(date = new Date()): string {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((value.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return `${value.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function buildDailyIntelligenceCacheKey(
  kundli: KundliData,
  date = new Date(),
): string {
  return sha256(
    JSON.stringify({
      dateKey: getDateKey(date),
      inputHash: kundli.calculationMeta.inputHash,
      kundliId: kundli.id,
      type: 'daily-intelligence-v1',
    }),
  );
}

export function buildWeeklyIntelligenceCacheKey(
  kundli: KundliData,
  date = new Date(),
): string {
  return sha256(
    JSON.stringify({
      inputHash: kundli.calculationMeta.inputHash,
      kundliId: kundli.id,
      type: 'weekly-intelligence-v1',
      weekKey: getWeekKey(date),
    }),
  );
}

export function buildDailyIntelligence({
  date = new Date(),
  depth = 'FREE',
  generatedAt = new Date().toISOString(),
  kundli,
}: {
  date?: Date;
  depth?: IntelligenceDepth;
  generatedAt?: string;
  kundli: KundliData;
}): DailyIntelligence {
  const seed = seedFor(kundli, getDateKey(date));
  const strongestHouse = kundli.ashtakavarga.strongestHouses[0] ?? 10;
  const dasha = kundli.dasha.current;

  return {
    avoid: avoids[seed % avoids.length],
    cacheKey: buildDailyIntelligenceCacheKey(kundli, date),
    chartBasisSummary: `Based on ${kundli.lagna} lagna, ${kundli.moonSign} Moon, ${dasha.mahadasha}/${dasha.antardasha} dasha, and House ${strongestHouse} strength.`,
    dateKey: getDateKey(date),
    depth,
    emotionalTone: toneCycle[seed % toneCycle.length],
    generatedAt,
    kundliId: kundli.id,
    practicalAction: actions[(seed + strongestHouse) % actions.length],
    relationshipTone: relationshipThemes[(seed + 2) % relationshipThemes.length],
    workFocus: workThemes[(seed + dasha.mahadasha.length) % workThemes.length],
  };
}

export function buildWeeklyIntelligence({
  date = new Date(),
  depth = 'FREE',
  generatedAt = new Date().toISOString(),
  kundli,
  premiumSynthesis,
}: {
  date?: Date;
  depth?: IntelligenceDepth;
  generatedAt?: string;
  kundli: KundliData;
  premiumSynthesis?: string;
}): WeeklyIntelligence {
  const seed = seedFor(kundli, getWeekKey(date));
  const weekStart = getUtcWeekStart(date);
  const strongest = kundli.ashtakavarga.strongestHouses.slice(0, 3);
  const weakest = kundli.ashtakavarga.weakestHouses.slice(0, 2);
  const dasha = kundli.dasha.current;

  return {
    cacheKey: buildWeeklyIntelligenceCacheKey(kundli, date),
    careerFocus: `Work favors ${workThemes[(seed + 1) % workThemes.length]}.`,
    chartBasisSummary: `Week read from ${kundli.lagna} lagna, current ${dasha.mahadasha}/${dasha.antardasha} dasha, strong houses ${strongest.join(', ') || 'pending'}, and pressure houses ${weakest.join(', ') || 'pending'}.`,
    depth,
    generatedAt,
    importantDateWindows: buildWeeklyWindows(weekStart, seed),
    kundliId: kundli.id,
    premiumSynthesis:
      depth === 'EXPANDED'
        ? premiumSynthesis ??
          'This week is best used for patient progress, thoughtful communication, and choices that support stability without forcing outcomes.'
        : undefined,
    relationshipFocus: `Relationships benefit when you ${relationshipThemes[(seed + 3) % relationshipThemes.length]}.`,
    spiritualSuggestion:
      actions[(seed + 4) % actions.length] +
      ' Keep the guidance practical; this is a pattern read, not a guarantee.',
    weekKey: getWeekKey(date),
    weeklyTheme: `${toneCycle[(seed + 2) % toneCycle.length]} progress through ${dasha.antardasha} timing`,
  };
}

export function shouldConsumeIntelligenceQuota({
  cacheHit,
  generationMode,
}: {
  cacheHit: boolean;
  generationMode: 'template' | 'ai';
}): IntelligenceQuotaDecision {
  if (cacheHit) {
    return { consumesQuota: false, reason: 'cache_hit' };
  }

  if (generationMode === 'template') {
    return { consumesQuota: false, reason: 'template_generated' };
  }

  return { consumesQuota: true, reason: 'ai_generated' };
}

function seedFor(kundli: KundliData, key: string): number {
  const hash = sha256(`${kundli.calculationMeta.inputHash}:${kundli.id}:${key}`);
  return parseInt(hash.slice(0, 8), 16);
}

function getUtcWeekStart(date: Date): Date {
  const value = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() - day + 1);
  return value;
}

function buildWeeklyWindows(weekStart: Date, seed: number): WeeklyDateWindow[] {
  return [0, 2, 5].map((offset, index) => {
    const start = new Date(weekStart);
    start.setUTCDate(start.getUTCDate() + offset);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + (index === 2 ? 1 : 0));

    return {
      endDate: getDateKey(end),
      focus: [
        'Set the tone and choose your main priority.',
        'Handle communication and practical coordination.',
        'Review progress before making a larger commitment.',
      ][index],
      startDate: getDateKey(start),
      tone: toneCycle[(seed + index) % toneCycle.length],
    };
  });
}
