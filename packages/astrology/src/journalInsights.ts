import type {
  JournalAnalyticsPayload,
  JournalCategory,
  JournalDashaContext,
  JournalEntry,
  JournalInsight,
  JournalInsightAccess,
  JournalInsightInput,
  JournalLocalSummary,
  JournalMood,
  KundliData,
} from '@pridicta/types';

export function buildJournalHash(
  kundli: KundliData,
  entries: JournalEntry[],
  monthKey?: string,
): string {
  const stableEntries = entries
    .filter(entry => !monthKey || entry.date.startsWith(monthKey))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(entry => ({
      category: entry.category,
      date: entry.date,
      id: entry.id,
      mood: entry.mood ?? null,
      note: entry.note.trim(),
      relatedDecision: entry.relatedDecision ?? null,
      tags: [...entry.tags].sort(),
      updatedAt: entry.updatedAt,
    }));

  return stableHash(
    JSON.stringify({
      entries: stableEntries,
      inputHash: kundli.calculationMeta.inputHash,
      kundliId: kundli.id,
      monthKey: monthKey ?? 'all',
      version: 'journal-insights-v1',
    }),
  );
}

export function mapJournalEntryToDasha(
  kundli: KundliData,
  entry: JournalEntry,
): JournalDashaContext {
  const entryTime = new Date(entry.date).getTime();
  const mahadasha = kundli.dasha.timeline.find(
    item =>
      new Date(item.startDate).getTime() <= entryTime &&
      entryTime <= new Date(item.endDate).getTime(),
  );
  const antardasha = mahadasha?.antardashas.find(
    item =>
      new Date(item.startDate).getTime() <= entryTime &&
      entryTime <= new Date(item.endDate).getTime(),
  );

  return {
    antardasha: antardasha?.antardasha,
    category: entry.category,
    dashaEndDate: antardasha?.endDate ?? mahadasha?.endDate,
    dashaStartDate: antardasha?.startDate ?? mahadasha?.startDate,
    date: entry.date,
    entryId: entry.id,
    mahadasha: mahadasha?.mahadasha,
    mood: entry.mood,
  };
}

export function summarizeJournalLocally({
  entries,
  kundli,
  monthKey = getCurrentMonthKey(),
}: {
  entries: JournalEntry[];
  kundli: KundliData;
  monthKey?: string;
}): JournalLocalSummary {
  const monthEntries = entries.filter(entry => entry.date.startsWith(monthKey));
  const categoryCounts: Partial<Record<JournalCategory, number>> = {};
  const moodCounts: Partial<Record<JournalMood, number>> = {};
  const tagCounts = new Map<string, number>();

  for (const entry of monthEntries) {
    categoryCounts[entry.category] = (categoryCounts[entry.category] ?? 0) + 1;

    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] ?? 0) + 1;
    }

    for (const tag of entry.tags) {
      const normalized = tag.trim().toLowerCase();
      if (normalized) {
        tagCounts.set(normalized, (tagCounts.get(normalized) ?? 0) + 1);
      }
    }
  }

  return {
    calculationMeta: {
      ayanamsa: kundli.calculationMeta.ayanamsa,
      calculatedAt: kundli.calculationMeta.calculatedAt,
      houseSystem: kundli.calculationMeta.houseSystem,
      inputHash: kundli.calculationMeta.inputHash,
      nodeType: kundli.calculationMeta.nodeType,
    },
    categoryCounts,
    dashaContexts: monthEntries.map(entry => mapJournalEntryToDasha(kundli, entry)),
    entryCount: monthEntries.length,
    journalHash: buildJournalHash(kundli, entries, monthKey),
    kundliId: kundli.id,
    monthKey,
    moodCounts,
    topTags: [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 6)
      .map(([tag]) => tag),
  };
}

export function buildJournalInsight({
  entries,
  generatedAt = new Date().toISOString(),
  hasPremiumAccess,
  kundli,
  monthKey = getCurrentMonthKey(),
}: JournalInsightInput): JournalInsight {
  const summary = summarizeJournalLocally({ entries, kundli, monthKey });
  const depth = hasPremiumAccess ? 'PREMIUM' : 'FREE';
  const topCategory = topKey(summary.categoryCounts);
  const topMood = topKey(summary.moodCounts);
  const dashaLabel = summarizeDashaContexts(summary.dashaContexts);

  return {
    basicReflection:
      summary.entryCount === 0
        ? 'Your private journal is ready. Add a few honest notes and Predicta will help you notice the month with care.'
        : `${summary.entryCount} private entr${
            summary.entryCount === 1 ? 'y' : 'ies'
          } this month lean toward ${topCategory ?? 'mixed themes'} during ${dashaLabel}.`,
    depth,
    emotionalCycleInsight:
      depth === 'PREMIUM'
        ? `The strongest emotional signal is ${
            topMood ?? 'not clear yet'
          }. Watch whether this repeats around similar dasha pressure before acting on it.`
        : undefined,
    generatedAt,
    journalHash: summary.journalHash,
    kundliId: kundli.id,
    monthKey,
    monthlyReflection:
      depth === 'PREMIUM'
        ? `For ${monthKey}, keep one grounding ritual and one practical decision log. The goal is to notice patterns without judging yourself.`
        : undefined,
    premiumPatternSummary:
      depth === 'PREMIUM'
        ? `Recurring journal themes: ${
            summary.topTags.join(', ') || topCategory || 'still forming'
          }. This is a local-first synthesis built from counts, tags, and dasha labels.`
        : undefined,
    summary,
  };
}

export function resolveJournalInsightAccess({
  hasPremiumAccess,
}: {
  hasPremiumAccess: boolean;
}): JournalInsightAccess {
  return hasPremiumAccess
    ? {
        canViewPremiumPatterns: true,
        depth: 'PREMIUM',
        message: 'Premium journal patterns are active.',
      }
    : {
        canViewPremiumPatterns: false,
        depth: 'FREE',
        message: 'Free journal keeps entries private with basic dasha labels.',
      };
}

export function buildJournalAnalyticsPayload({
  entries,
  monthKey = getCurrentMonthKey(),
}: {
  entries: JournalEntry[];
  monthKey?: string;
}): JournalAnalyticsPayload {
  const monthEntries = entries.filter(entry => entry.date.startsWith(monthKey));
  const latest = monthEntries[0];

  return {
    category: latest?.category,
    entryCount: monthEntries.length,
    mood: latest?.mood,
    monthKey,
  };
}

export function getCurrentMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

function summarizeDashaContexts(contexts: JournalDashaContext[]): string {
  const firstMapped = contexts.find(context => context.mahadasha);

  if (!firstMapped) {
    return 'the current chart period';
  }

  return `${firstMapped.mahadasha}/${firstMapped.antardasha ?? 'sub-period'} timing`;
}

function topKey<T extends string>(counts: Partial<Record<T, number>>): T | undefined {
  return Object.entries(counts).sort(
    ([, a], [, b]) => Number(b) - Number(a),
  )[0]?.[0] as T | undefined;
}

function stableHash(value: string): string {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) % 2147483647;
  }

  return `jn${hash}`;
}
