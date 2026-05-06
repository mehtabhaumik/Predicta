import type {
  KundliData,
  RemedyCoachItem,
  RemedyCoachPlan,
  RemedyInsight,
  RemedyPracticeStatus,
} from '@pridicta/types';

export type RemedyTrackingMap = Record<string, RemedyPracticeStatus>;

export function composeRemedyCoach(
  kundli?: KundliData,
  tracking: RemedyTrackingMap = {},
  nowIso = new Date().toISOString(),
): RemedyCoachPlan {
  if (!kundli) {
    return {
      guardrails: buildGuardrails(),
      items: [],
      reviewQuestion:
        'What birth chart remedy should I practice once my kundli is calculated?',
      status: 'pending',
      subtitle:
        'Create a kundli to unlock remedies tied to dasha, house strength, and birth-time confidence.',
      title: 'Remedy Coach is waiting.',
    };
  }

  const items = (kundli.remedies ?? []).map(remedy =>
    buildRemedyCoachItem(remedy, tracking[remedy.id], kundli, nowIso),
  );

  return {
    guardrails: buildGuardrails(),
    items,
    reviewQuestion:
      'Which remedy is helping me become steadier, and which one needs to be simplified?',
    status: 'ready',
    subtitle:
      'Small chart-backed practices, tracked locally, without fear or guaranteed outcomes.',
    title: `${kundli.birthDetails.name}'s Remedy Coach`,
  };
}

function buildRemedyCoachItem(
  remedy: RemedyInsight,
  status: RemedyPracticeStatus | undefined,
  kundli: KundliData,
  nowIso: string,
): RemedyCoachItem {
  const evidence = buildEvidence(remedy, kundli);
  const tracking = buildTracking(remedy, status, nowIso);

  return {
    area: remedy.area,
    askPrompt: [
      `Explain why this remedy is recommended: ${remedy.title}.`,
      `Practice: ${remedy.practice}`,
      'Use chart evidence, expected inner shift, when to stop or review, and no guaranteed outcomes.',
    ].join(' '),
    cadence: remedy.cadence,
    caution: remedy.caution,
    evidence,
    expectedInnerShift: buildExpectedInnerShift(remedy),
    id: remedy.id,
    linkedHouses: remedy.linkedHouses,
    linkedPlanets: remedy.linkedPlanets,
    practice: remedy.practice,
    priority: remedy.priority,
    rationale: remedy.rationale,
    title: remedy.title,
    tracking,
  };
}

function buildTracking(
  remedy: RemedyInsight,
  status: RemedyPracticeStatus | undefined,
  nowIso: string,
): RemedyCoachItem['tracking'] {
  const today = toDayKey(nowIso);
  const completedDates = normalizeCompletedDates(status?.completedDates ?? []);
  const completions = completedDates.length;
  const currentStreak = countCurrentStreak(completedDates, today);
  const lastCompletedAt = status?.lastCompletedAt ?? completedDates.at(-1);
  const daysSinceLast = lastCompletedAt
    ? diffDays(today, toDayKey(lastCompletedAt))
    : undefined;
  const trackingStatus =
    completedDates.includes(today)
      ? currentStreak >= 3
        ? 'consistent'
        : 'done-today'
      : daysSinceLast !== undefined && daysSinceLast >= 21
        ? 'review-needed'
        : completions === 0
          ? 'not-started'
          : 'due';

  return {
    completions,
    currentStreak,
    lastCompletedAt,
    nextReviewPrompt: buildReviewPrompt(remedy, trackingStatus),
    reviewAfter: 'Review after 4 completions or 30 days, whichever comes first.',
    status: trackingStatus,
  };
}

function buildEvidence(remedy: RemedyInsight, kundli: KundliData): string[] {
  const evidence = [
    remedy.rationale,
    `Current dasha: ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`,
  ];

  if (remedy.linkedPlanets.length) {
    evidence.push(`Linked planets: ${remedy.linkedPlanets.join(', ')}.`);
  }

  if (remedy.linkedHouses.length) {
    evidence.push(`Linked houses: ${remedy.linkedHouses.join(', ')}.`);
  }

  if (remedy.id === 'weak-house-correction') {
    evidence.push(
      `Weakest ashtakavarga houses: ${kundli.ashtakavarga.weakestHouses.join(', ')}.`,
    );
  }

  return evidence.slice(0, 4);
}

function buildExpectedInnerShift(remedy: RemedyInsight): string {
  if (remedy.id.includes('rectification')) {
    return 'More honesty about uncertainty, so fine timing is handled carefully.';
  }

  if (remedy.linkedHouses.length) {
    return 'Cleaner routines around the pressured life areas instead of anxious overreaction.';
  }

  if (remedy.linkedPlanets.length) {
    return `A steadier expression of ${remedy.linkedPlanets.join(' and ')} through repetition, service, and restraint.`;
  }

  return 'More consistency, less bargaining with outcomes.';
}

function buildGuardrails(): string[] {
  return [
    'No gemstone or paid ritual is required by Predicta.',
    'No remedy guarantees an outcome.',
    'Stop or simplify a practice if it creates fear, obsession, or avoidance of real-world action.',
    'Professional medical, legal, financial, and safety decisions must stay with qualified professionals.',
  ];
}

function buildReviewPrompt(
  remedy: RemedyInsight,
  status: RemedyCoachItem['tracking']['status'],
): string {
  if (status === 'review-needed') {
    return 'Review this remedy now. Make it smaller or pause it if it is not helping steadiness.';
  }

  if (status === 'consistent') {
    return 'You are consistent. Check whether the practice is making daily choices calmer.';
  }

  return `After the next practice, ask: did ${remedy.title} make my choices cleaner or more fearful?`;
}

function normalizeCompletedDates(dates: string[]): string[] {
  return [...new Set(dates.map(toDayKey))].sort();
}

function countCurrentStreak(dates: string[], today: string): number {
  const completed = new Set(dates);
  let streak = 0;
  let cursor = new Date(`${today}T00:00:00.000Z`);

  while (completed.has(toDayKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

function diffDays(today: string, previous: string): number {
  const todayTime = new Date(`${today}T00:00:00.000Z`).getTime();
  const previousTime = new Date(`${previous}T00:00:00.000Z`).getTime();

  return Math.floor((todayTime - previousTime) / 86_400_000);
}

function toDayKey(value: string): string {
  return value.slice(0, 10);
}
