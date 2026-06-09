'use client';

import {
  getEventOracleCopy,
  type EventOracleCopy,
} from '@pridicta/config';
import { getOneTimeProduct } from '@pridicta/config/pricing';
import {
  buildEventOracleEvidenceContract,
  buildEventOraclePredictionObject,
  createPredictionTrackerCard,
  getEventQuestionChips,
  isPredictionVisibleToFamilyVault,
  refineEventQuestion,
  refreshPredictionReminderState,
  setPredictionFamilyVaultSharing,
  updatePredictionOutcome,
  type EventQuestionCategoryId,
  type EventQuestionRefinement,
  type EventOracleOutcomeState,
  type EventOraclePredictionObject,
  type EventOraclePredictionTrackerCard,
} from '@pridicta/astrology';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import {
  getWebPassCostDisplay,
  PASS_USAGE_UPDATED_EVENT,
  type WebPassCostDisplay,
} from '../lib/web-pass-cost-guardrails';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';

const QUESTION_CHIPS = getEventQuestionChips();
const RECENT_EVENT_THREADS_KEY = 'predicta.eventOracle.recentThreads.v1';
const PREDICTION_TRACKER_KEY = 'predicta.eventOracle.predictionTracker.v1';
const MAX_RECENT_THREADS = 3;
const MAX_TRACKED_PREDICTIONS = 8;
const PRECISION_READING_PRODUCT = getOneTimeProduct('PRECISION_READING');

type RecentEventThread = {
  categoryId: EventQuestionCategoryId;
  id: string;
  question: string;
  updatedAt: string;
};

function getChipLabel(copy: EventOracleCopy, chipId: string): string {
  return copy.chipQuestions[chipId] ?? chipId;
}

function getRoomLabel(copy: EventOracleCopy, room: string): string {
  return copy.roomLabels[room] ?? room;
}

function getEventOracleSafetyMessages(
  copy: EventOracleCopy,
  categoryId: EventQuestionCategoryId,
): string[] {
  const messages = [copy.safety.general, copy.safety.noGuarantee];

  if (categoryId === 'wellness_caution') {
    messages.splice(1, 0, copy.safety.health);
  }

  if (categoryId === 'court_litigation') {
    messages.splice(1, 0, copy.safety.legal);
  }

  if (
    categoryId === 'money_property' ||
    categoryId === 'business_growth'
  ) {
    messages.splice(1, 0, copy.safety.finance);
  }

  return messages;
}

function localizePredictionPreview(
  copy: EventOracleCopy,
  prediction: EventOraclePredictionObject,
): {
  actionPrimary: string;
  actionSecondary: string;
  confidenceExplanation: string;
  confidenceLabel: string;
  directAnswer: string;
  evidenceItems: Array<{ availability: string; label: string; layerId: string }>;
  timingLabel: string;
  triggerSummary: string;
} {
  return {
    actionPrimary:
      prediction.outcome === 'needs_evidence'
        ? copy.predictionPreview.actionPrimary
        : prediction.whatToDoNow[0],
    actionSecondary:
      prediction.outcome === 'needs_evidence'
        ? copy.predictionPreview.actionSecondary
        : (prediction.whatToDoNow[1] ?? ''),
    confidenceExplanation:
      prediction.confidence.level === 'not_enough_evidence'
        ? copy.predictionPreview.confidenceNotEnoughExplanation
        : prediction.confidence.explanation,
    confidenceLabel:
      prediction.confidence.level === 'not_enough_evidence'
        ? copy.predictionPreview.confidenceNotEnoughLabel
        : prediction.confidence.label,
    directAnswer:
      prediction.outcome === 'needs_evidence'
        ? copy.predictionPreview.needsClarityDirectAnswer
        : prediction.directAnswer,
    evidenceItems: prediction.collapsedEvidence.map(item => ({
      availability:
        copy.predictionPreview.availability[item.availability] ?? item.availability,
      label: getRoomLabel(copy, item.layerId),
      layerId: item.layerId,
    })),
    timingLabel:
      prediction.timingWindow.precision === 'not_precise_yet'
        ? copy.predictionPreview.notPreciseLabel
        : prediction.timingWindow.label,
    triggerSummary:
      prediction.timingWindow.precision === 'not_precise_yet'
        ? copy.predictionPreview.triggerNeedsEvidence
        : prediction.mostLikelyTrigger.summary,
  };
}

export function WebEventQuestionComposer(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const searchParams = useSearchParams();
  const copy = getEventOracleCopy(language);
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const [customQuestion, setCustomQuestion] = useState('');
  const [refinement, setRefinement] = useState<EventQuestionRefinement>(() =>
    refineEventQuestion('', 'guide_me'),
  );
  const [trackedPredictions, setTrackedPredictions] = useState<
    EventOraclePredictionTrackerCard[]
  >([]);
  const [recentThreads, setRecentThreads] = useState<RecentEventThread[]>([]);
  const [passStatus, setPassStatus] = useState<WebPassCostDisplay | undefined>();
  const handoffContext = getEventOracleHandoffContext(searchParams);

  useEffect(() => {
    setRecentThreads(loadRecentThreads());
    setTrackedPredictions(loadTrackedPredictions());

    function refreshStatus() {
      setPassStatus(getWebPassCostDisplay(language));
    }

    refreshStatus();
    window.addEventListener('storage', refreshStatus);
    window.addEventListener(PASS_USAGE_UPDATED_EVENT, refreshStatus);
    return () => {
      window.removeEventListener('storage', refreshStatus);
      window.removeEventListener(PASS_USAGE_UPDATED_EVENT, refreshStatus);
    };
  }, [language]);

  function refineSelectedQuestion(
    question: string,
    categoryId: EventQuestionCategoryId,
  ): void {
    const nextRefinement = refineEventQuestion(question, categoryId);
    setRefinement(nextRefinement);
    setRecentThreads(rememberRecentThread(nextRefinement));
  }

  const visibleQuestion =
    copy.chipQuestions[
      QUESTION_CHIPS.find(chip => chip.categoryId === refinement.categoryId)?.id ?? ''
    ] ??
    (customQuestion.trim() || copy.composer.guideMe);
  const visibleClarifier =
    refinement.clarifyingQuestion && copy.categoryClarifiers[refinement.categoryId]
      ? copy.categoryClarifiers[refinement.categoryId]
      : refinement.clarifyingQuestion;
  const askHref = buildPredictaChatHref({
    kundli: activeKundli,
    prompt: refinement.suggestedPhrasing,
    selectedLanguage: language,
    sourceScreen: 'Primary Predicta Event Oracle',
  });
  const predictionPreview = buildEventOraclePredictionObject({
    evidenceContract: buildEventOracleEvidenceContract({
      refinement,
      layers: {},
    }),
    refinement,
  });
  const localizedPredictionPreview = localizePredictionPreview(
    copy,
    predictionPreview,
  );
  const safetyMessages = getEventOracleSafetyMessages(copy, refinement.categoryId);
  const creditStatusTitle = passStatus?.title ?? copy.hero.creditQuietTitle;
  const creditStatusBody = passStatus?.body ?? copy.hero.creditQuietBody;
  const activeKundliName =
    activeKundli?.birthDetails.name?.trim() || copy.hero.activeKundliEmpty;
  const primaryHref = activeKundli ? askHref : '/dashboard/kundli';
  const outcomeLabels: Record<EventOracleOutcomeState, string> = {
    did_not_happen: copy.tracker.didNotHappen,
    happened: copy.tracker.happened,
    partially_happened: copy.tracker.partiallyHappened,
    pending: copy.tracker.pending,
    too_early_to_judge: copy.tracker.tooEarly,
  };

  function saveCurrentPrediction(): void {
    const nextCard = createPredictionTrackerCard({
      nowIso: new Date().toISOString(),
      prediction: predictionPreview,
    });
    setTrackedPredictions(saveTrackedPrediction(nextCard));
    setRecentThreads(rememberRecentThread(refinement));
  }

  function changeOutcome(
    card: EventOraclePredictionTrackerCard,
    outcomeState: EventOracleOutcomeState,
  ): void {
    setTrackedPredictions(
      saveTrackedPredictions(
        trackedPredictions.map(item =>
          item.id === card.id
            ? updatePredictionOutcome(item, {
                outcomeState,
                updatedAt: new Date().toISOString(),
              })
            : item,
        ),
      ),
    );
  }

  function toggleFamilyShare(card: EventOraclePredictionTrackerCard): void {
    setTrackedPredictions(
      saveTrackedPredictions(
        trackedPredictions.map(item =>
          item.id === card.id
            ? setPredictionFamilyVaultSharing(
                item,
                !isPredictionVisibleToFamilyVault(item),
                new Date().toISOString(),
              )
            : item,
        ),
      ),
    );
  }

  return (
    <section className="event-question-composer glass-panel" aria-label={copy.composer.title}>
      <div className="event-question-hero">
        <div className="event-question-composer-copy">
          <div className="section-title">{copy.hero.eyebrow}</div>
          <h2>{copy.hero.title}</h2>
          <p>{copy.hero.subtitle}</p>
          <div className="event-question-hero-actions" aria-label={copy.hero.actionTitle}>
            <Link className="button" href={primaryHref}>
              {activeKundli ? copy.hero.primaryCta : copy.hero.secondaryCta}
            </Link>
            <Link className="button secondary" href="/dashboard/report">
              {copy.hero.reportCta}
            </Link>
          </div>
          {handoffContext ? (
            <div className="event-question-handoff-strip">
              <span>{copy.handoff.title}</span>
              <strong>{handoffContext.sourceScreen}</strong>
              <p>
                {copy.handoff.evidenceLabel}: {handoffContext.evidenceSourceLabel}
              </p>
              <p>
                {copy.handoff.modeLabel}:{' '}
                {handoffContext.handoffMode === 'main_synthesis'
                  ? copy.handoff.mainSynthesisMode
                  : copy.handoff.roomSafeMode}
              </p>
              {handoffContext.question ? <p>{handoffContext.question}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="event-question-status-grid">
          <article className="event-question-status-card">
            <span>{copy.hero.activeKundliLabel}</span>
            <strong>{activeKundliName}</strong>
            <p>
              {activeKundli
                ? `${copy.hero.activeKundliReady} (${savedKundlis.length})`
                : copy.hero.activeKundliEmpty}
            </p>
          </article>
          <article
            className={
              passStatus?.tone === 'careful'
                ? 'event-question-status-card careful'
                : 'event-question-status-card'
            }
          >
            <span>{copy.hero.statusLabel}</span>
            <strong>{creditStatusTitle}</strong>
            <p>{creditStatusBody}</p>
          </article>
        </div>
      </div>

      <div className="event-question-section-head">
        <span>{copy.composer.selectedLabel}</span>
        <strong>{copy.hero.actionTitle}</strong>
        <p>{copy.composer.body}</p>
      </div>

      <div className="event-question-chip-grid">
        {QUESTION_CHIPS.map(chip => (
          <button
            aria-label={`${copy.accessibility.selectEventChip}: ${getChipLabel(copy, chip.id)}`}
            aria-pressed={refinement.categoryId === chip.categoryId}
            className={
              refinement.categoryId === chip.categoryId
                ? 'event-question-chip active'
                : 'event-question-chip'
            }
            key={chip.id}
            onClick={() => refineSelectedQuestion(chip.question, chip.categoryId)}
            type="button"
          >
            <span>{copy.categoryLabels[chip.categoryId] ?? chip.categoryId}</span>
            <strong>{getChipLabel(copy, chip.id)}</strong>
          </button>
        ))}
      </div>

      <div className="event-question-custom-row">
        <label className="field-stack">
          <span className="field-label">{copy.composer.customTitle}</span>
          <input
            aria-label={copy.accessibility.customQuestionInput}
            onChange={event => setCustomQuestion(event.target.value)}
            placeholder={copy.composer.customPlaceholder}
            type="text"
            value={customQuestion}
          />
        </label>
        <button
          aria-label={copy.accessibility.refineCustomQuestion}
          className="button secondary"
          onClick={() => {
            const nextRefinement = refineEventQuestion(customQuestion);
            setRefinement(nextRefinement);
            setRecentThreads(rememberRecentThread(nextRefinement));
          }}
          type="button"
        >
          {copy.composer.refineQuestion}
        </button>
      </div>

      <div className="event-question-refined-card">
        <div>
          <span>{copy.composer.refinedLabel}</span>
          <strong>{visibleQuestion}</strong>
          {visibleClarifier ? (
            <p>
              <b>{copy.composer.clarifierLabel}:</b> {visibleClarifier}
            </p>
          ) : null}
        </div>
        <div className="event-question-evidence">
          <span>{copy.composer.evidenceLabel}</span>
          <div aria-label={copy.accessibility.evidenceRooms}>
            {refinement.downstream.evidenceRooms.map(room => (
              <em key={room}>{getRoomLabel(copy, room)}</em>
            ))}
          </div>
        </div>
        <p>{copy.composer.freePaid}</p>
        <Link aria-label={copy.accessibility.askRefinedQuestion} className="button" href={askHref}>
          {copy.composer.askThis}
        </Link>
      </div>

      <div className="event-question-hero-lower">
        <article
          aria-label={copy.accessibility.predictionCard}
          className="event-question-prediction-card"
        >
          <div className="event-question-card-title">
            <span>{copy.predictionCard.evidencePendingTitle}</span>
            <strong>{copy.predictionCard.directAnswerLabel}</strong>
          </div>
          <p className="event-question-direct-answer">
            {localizedPredictionPreview.directAnswer}
          </p>
          <div className="event-question-prediction-grid">
            <div>
              <span>{copy.predictionCard.timingTriggerLabel}</span>
              <strong>{localizedPredictionPreview.timingLabel}</strong>
              <p>{localizedPredictionPreview.triggerSummary}</p>
            </div>
            <div aria-label={copy.accessibility.confidenceIndicator}>
              <span>{copy.predictionCard.confidenceLabel}</span>
              <strong>{localizedPredictionPreview.confidenceLabel}</strong>
              <p>{localizedPredictionPreview.confidenceExplanation}</p>
            </div>
            <div>
              <span>{copy.predictionCard.actionPlanLabel}</span>
              <strong>{localizedPredictionPreview.actionPrimary}</strong>
              <p>{localizedPredictionPreview.actionSecondary}</p>
            </div>
          </div>
          <details className="event-question-collapsed-evidence">
            <summary aria-label={copy.accessibility.evidenceDrawer}>
              {copy.predictionCard.collapsedEvidenceLabel}
            </summary>
            <div>
              {localizedPredictionPreview.evidenceItems.map(item => (
                <em key={item.layerId}>
                  {item.label}: {item.availability}
                </em>
              ))}
            </div>
          </details>
          <div className="event-question-safety-note" role="note">
            {safetyMessages.map(message => (
              <p key={message}>{message}</p>
            ))}
          </div>
        </article>

        <article className="event-question-precision-panel">
          <div>
            <span>{copy.precisionReading.productLabel}</span>
            <strong>{copy.precisionReading.freePreviewTitle}</strong>
            <p>{copy.precisionReading.freePreviewBody}</p>
          </div>
          <div>
            <span>{copy.precisionReading.paidTitle}</span>
            <strong>{PRECISION_READING_PRODUCT.displayPrice}</strong>
            <p>{copy.precisionReading.paidBody}</p>
          </div>
          <ul>
            <li>{copy.precisionReading.costGuardrail}</li>
            <li>{copy.precisionReading.followUp}</li>
            <li>{copy.precisionReading.reportSeparation}</li>
            <li>{copy.precisionReading.telemetry}</li>
          </ul>
          <Link
            className="button"
            href={`/checkout?productId=${PRECISION_READING_PRODUCT.productId}`}
            onClick={() => setRecentThreads(rememberRecentThread(refinement))}
          >
            {copy.precisionReading.paidCta}
          </Link>
        </article>

        <aside className="event-question-recent-threads">
          <span>{copy.recentThreads.title}</span>
          {recentThreads.length ? (
            <div>
              {recentThreads.map(thread => (
                <button
                  aria-label={`${copy.accessibility.recentThread}: ${thread.question}`}
                  key={thread.id}
                  onClick={() =>
                    refineSelectedQuestion(thread.question, thread.categoryId)
                  }
                  type="button"
                >
                  <strong>{copy.categoryLabels[thread.categoryId] ?? thread.categoryId}</strong>
                  <em>{thread.question}</em>
                </button>
              ))}
            </div>
          ) : (
            <p>{copy.recentThreads.empty}</p>
          )}
          <p>{copy.hero.deterministicHelp}</p>
        </aside>
      </div>

      <section
        aria-label={copy.accessibility.trackerPanel}
        className="event-question-tracker-panel"
      >
        <div className="event-question-section-head">
          <span>{copy.tracker.title}</span>
          <strong>{copy.tracker.familyPrivate}</strong>
          <button
            aria-label={copy.accessibility.savePrediction}
            className="button secondary"
            onClick={saveCurrentPrediction}
            type="button"
          >
            {copy.tracker.savePrediction}
          </button>
        </div>
        {trackedPredictions.length ? (
          <div className="event-question-tracker-grid">
            {trackedPredictions.map(card => (
              <article className="event-question-tracker-card" key={card.id}>
                <div>
                  <span>{copy.categoryLabels[card.categoryId] ?? card.categoryId}</span>
                  <strong>{card.refinedQuestion}</strong>
                  <p>{card.answer}</p>
                </div>
                <dl>
                  <div>
                    <dt>{copy.predictionCard.timingTriggerLabel}</dt>
                    <dd>{card.timingWindow.label}</dd>
                  </div>
                  <div>
                    <dt>{copy.predictionCard.confidenceLabel}</dt>
                    <dd>{card.confidence.label}</dd>
                  </div>
                  <div>
                    <dt>{copy.predictionCard.collapsedEvidenceLabel}</dt>
                    <dd>{card.evidenceSourceLabels.join(' / ') || copy.predictionCard.evidencePendingTitle}</dd>
                  </div>
                </dl>
                <p>
                  {card.followUpReminder.state === 'due'
                    ? copy.tracker.reminderDue
                    : copy.tracker.reminderPending}
                  {card.followUpReminder.dueAt ? `: ${card.followUpReminder.dueAt}` : ''}
                </p>
                <label className="field-stack">
                  <span className="field-label">{copy.tracker.markOutcome}</span>
                  <select
                    aria-label={copy.accessibility.outcomeSelect}
                    onChange={event =>
                      changeOutcome(card, event.target.value as EventOracleOutcomeState)
                    }
                    value={card.outcomeState}
                  >
                    {Object.entries(outcomeLabels).map(([state, label]) => (
                      <option key={state} value={state}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  aria-label={copy.accessibility.familyShareToggle}
                  className="button secondary"
                  onClick={() => toggleFamilyShare(card)}
                  type="button"
                >
                  {isPredictionVisibleToFamilyVault(card)
                    ? copy.tracker.unshareFromFamily
                    : copy.tracker.shareWithFamily}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="event-question-tracker-empty">{copy.tracker.empty}</p>
        )}
      </section>
    </section>
  );
}

function getEventOracleHandoffContext(searchParams: URLSearchParams): {
  evidenceSourceLabel: string;
  handoffMode: 'main_synthesis' | 'room_safe';
  question?: string;
  sourceScreen: string;
} | undefined {
  if (searchParams.get('eventOracleHandoff') !== 'true') {
    return undefined;
  }

  const handoffMode =
    searchParams.get('handoffMode') === 'main_synthesis'
      ? 'main_synthesis'
      : 'room_safe';
  return {
    evidenceSourceLabel:
      searchParams.get('evidenceSourceLabel') ??
      searchParams.get('carriedContextLabel') ??
      searchParams.get('sourceScreen') ??
      'Predicta',
    handoffMode,
    question: searchParams.get('handoffQuestion') ?? searchParams.get('prompt') ?? undefined,
    sourceScreen: searchParams.get('sourceScreen') ?? 'Predicta',
  };
}

function loadRecentThreads(): RecentEventThread[] {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(RECENT_EVENT_THREADS_KEY) ?? '[]',
    ) as RecentEventThread[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_THREADS) : [];
  } catch {
    return [];
  }
}

function loadTrackedPredictions(): EventOraclePredictionTrackerCard[] {
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(PREDICTION_TRACKER_KEY) ?? '[]',
    ) as EventOraclePredictionTrackerCard[];
    const nowIso = new Date().toISOString();
    return Array.isArray(parsed)
      ? parsed
          .map(card => refreshPredictionReminderState(card, nowIso))
          .slice(0, MAX_TRACKED_PREDICTIONS)
      : [];
  } catch {
    return [];
  }
}

function saveTrackedPrediction(
  nextCard: EventOraclePredictionTrackerCard,
): EventOraclePredictionTrackerCard[] {
  const nextCards = [
    nextCard,
    ...loadTrackedPredictions().filter(card => card.id !== nextCard.id),
  ].slice(0, MAX_TRACKED_PREDICTIONS);
  return saveTrackedPredictions(nextCards);
}

function saveTrackedPredictions(
  nextCards: EventOraclePredictionTrackerCard[],
): EventOraclePredictionTrackerCard[] {
  window.localStorage.setItem(PREDICTION_TRACKER_KEY, JSON.stringify(nextCards));
  return nextCards;
}

function rememberRecentThread(
  refinement: EventQuestionRefinement,
): RecentEventThread[] {
  const thread: RecentEventThread = {
    categoryId: refinement.categoryId,
    id: `${refinement.categoryId}:${refinement.suggestedPhrasing}`,
    question: refinement.suggestedPhrasing,
    updatedAt: new Date().toISOString(),
  };
  const nextThreads = [
    thread,
    ...loadRecentThreads().filter(item => item.id !== thread.id),
  ].slice(0, MAX_RECENT_THREADS);

  window.localStorage.setItem(
    RECENT_EVENT_THREADS_KEY,
    JSON.stringify(nextThreads),
  );
  return nextThreads;
}
