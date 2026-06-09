import type { EventQuestionCategoryId } from './eventOracleQuestions';
import type {
  EventOraclePredictionConfidence,
  EventOraclePredictionObject,
} from './eventOraclePredictionEngine';

export type EventOracleOutcomeState =
  | 'did_not_happen'
  | 'happened'
  | 'partially_happened'
  | 'pending'
  | 'too_early_to_judge';

export type EventOracleReminderState =
  | 'completed'
  | 'due'
  | 'pending'
  | 'snoozed';

export type EventOraclePredictionPrivacy =
  | 'private'
  | 'shared_with_family_vault';

export type EventOraclePredictionTrackerCard = {
  answer: string;
  categoryId: EventQuestionCategoryId;
  confidence: EventOraclePredictionConfidence;
  createdAt: string;
  evidenceSourceLabels: string[];
  followUpReminder: {
    dueAt?: string;
    label: string;
    state: EventOracleReminderState;
  };
  id: string;
  originalQuestion: string;
  outcomeNotes?: string;
  outcomeState: EventOracleOutcomeState;
  privacy: EventOraclePredictionPrivacy;
  refinedQuestion: string;
  timingWindow: {
    endDate?: string;
    label: string;
    startDate?: string;
  };
  trigger: string;
  updatedAt: string;
};

export type EventOracleOutcomeUpdate = {
  note?: string;
  outcomeState: EventOracleOutcomeState;
  updatedAt: string;
};

export type EventOracleCategoryOutcomeAnalytics = {
  categoryId: EventQuestionCategoryId;
  confidenceBands: Partial<Record<EventOraclePredictionConfidence['level'], number>>;
  outcomeCounts: Record<EventOracleOutcomeState, number>;
  reviewableCount: number;
  total: number;
  trustRateLabel: string;
};

export type EventOracleOutcomeAnalytics = {
  byCategory: EventOracleCategoryOutcomeAnalytics[];
  caution: string;
  totalTracked: number;
};

const OUTCOME_STATES: EventOracleOutcomeState[] = [
  'happened',
  'partially_happened',
  'did_not_happen',
  'pending',
  'too_early_to_judge',
];

function stablePredictionId(prediction: EventOraclePredictionObject): string {
  return [
    prediction.question.categoryId,
    prediction.question.refined,
    prediction.timingWindow.label,
    prediction.mostLikelyTrigger.summary,
  ]
    .join('|')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function buildReminder(
  prediction: EventOraclePredictionObject,
  nowIso: string,
): EventOraclePredictionTrackerCard['followUpReminder'] {
  const dueAt =
    prediction.timingWindow.endDate ??
    prediction.timingWindow.startDate;

  if (!dueAt) {
    return {
      label: 'Reminder waits until Predicta has a usable timing window.',
      state: 'pending',
    };
  }

  const dueTime = Date.parse(dueAt);
  const nowTime = Date.parse(nowIso);
  return {
    dueAt,
    label: `Check outcome after ${prediction.timingWindow.label}.`,
    state: Number.isFinite(dueTime) && Number.isFinite(nowTime) && dueTime <= nowTime
      ? 'due'
      : 'pending',
  };
}

export function createPredictionTrackerCard({
  nowIso,
  prediction,
  privacy = 'private',
}: {
  nowIso: string;
  prediction: EventOraclePredictionObject;
  privacy?: EventOraclePredictionPrivacy;
}): EventOraclePredictionTrackerCard {
  return {
    answer: prediction.directAnswer,
    categoryId: prediction.question.categoryId,
    confidence: prediction.confidence,
    createdAt: nowIso,
    evidenceSourceLabels: prediction.collapsedEvidence
      .filter(item => item.availability !== 'missing')
      .map(item => item.label),
    followUpReminder: buildReminder(prediction, nowIso),
    id: stablePredictionId(prediction),
    originalQuestion: prediction.question.original,
    outcomeState: 'pending',
    privacy,
    refinedQuestion: prediction.question.refined,
    timingWindow: {
      endDate: prediction.timingWindow.endDate,
      label: prediction.timingWindow.label,
      startDate: prediction.timingWindow.startDate,
    },
    trigger: prediction.mostLikelyTrigger.summary,
    updatedAt: nowIso,
  };
}

export function upsertPredictionTrackerCard(
  cards: EventOraclePredictionTrackerCard[],
  nextCard: EventOraclePredictionTrackerCard,
): EventOraclePredictionTrackerCard[] {
  return [
    nextCard,
    ...cards.filter(card => card.id !== nextCard.id),
  ];
}

export function updatePredictionOutcome(
  card: EventOraclePredictionTrackerCard,
  update: EventOracleOutcomeUpdate,
): EventOraclePredictionTrackerCard {
  return {
    ...card,
    followUpReminder:
      update.outcomeState === 'pending' || update.outcomeState === 'too_early_to_judge'
        ? card.followUpReminder
        : { ...card.followUpReminder, state: 'completed' },
    outcomeNotes: update.note?.trim() || card.outcomeNotes,
    outcomeState: update.outcomeState,
    updatedAt: update.updatedAt,
  };
}

export function setPredictionFamilyVaultSharing(
  card: EventOraclePredictionTrackerCard,
  share: boolean,
  updatedAt: string,
): EventOraclePredictionTrackerCard {
  return {
    ...card,
    privacy: share ? 'shared_with_family_vault' : 'private',
    updatedAt,
  };
}

export function isPredictionVisibleToFamilyVault(
  card: EventOraclePredictionTrackerCard,
): boolean {
  return card.privacy === 'shared_with_family_vault';
}

export function refreshPredictionReminderState(
  card: EventOraclePredictionTrackerCard,
  nowIso: string,
): EventOraclePredictionTrackerCard {
  if (!card.followUpReminder.dueAt || card.followUpReminder.state === 'completed') {
    return card;
  }

  const dueTime = Date.parse(card.followUpReminder.dueAt);
  const nowTime = Date.parse(nowIso);
  if (!Number.isFinite(dueTime) || !Number.isFinite(nowTime) || dueTime > nowTime) {
    return card;
  }

  return {
    ...card,
    followUpReminder: {
      ...card.followUpReminder,
      state: 'due',
    },
  };
}

export function buildOutcomeAnalytics(
  cards: EventOraclePredictionTrackerCard[],
): EventOracleOutcomeAnalytics {
  const grouped = new Map<EventQuestionCategoryId, EventOraclePredictionTrackerCard[]>();

  for (const card of cards) {
    const existing = grouped.get(card.categoryId) ?? [];
    existing.push(card);
    grouped.set(card.categoryId, existing);
  }

  const byCategory = Array.from(grouped.entries()).map(([categoryId, categoryCards]) => {
    const outcomeCounts = OUTCOME_STATES.reduce(
      (counts, state) => ({ ...counts, [state]: 0 }),
      {} as Record<EventOracleOutcomeState, number>,
    );
    const confidenceBands: Partial<Record<EventOraclePredictionConfidence['level'], number>> = {};

    for (const card of categoryCards) {
      outcomeCounts[card.outcomeState] += 1;
      confidenceBands[card.confidence.level] =
        (confidenceBands[card.confidence.level] ?? 0) + 1;
    }

    const reviewableCount =
      outcomeCounts.happened +
      outcomeCounts.partially_happened +
      outcomeCounts.did_not_happen;
    const supportiveCount = outcomeCounts.happened + outcomeCounts.partially_happened;
    const trustRateLabel =
      reviewableCount > 0
        ? `${Math.round((supportiveCount / reviewableCount) * 100)}% matched or partly matched`
        : 'Not enough judged outcomes yet';

    return {
      categoryId,
      confidenceBands,
      outcomeCounts,
      reviewableCount,
      total: categoryCards.length,
      trustRateLabel,
    };
  });

  return {
    byCategory,
    caution:
      'Outcome analytics are category-aware and exclude pending or too-early predictions from match-rate claims.',
    totalTracked: cards.length,
  };
}
