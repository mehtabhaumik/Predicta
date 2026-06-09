'use client';

import {
  getEventOracleCopy,
  type EventOracleCopy,
} from '@pridicta/config';
import {
  buildEventOracleEvidenceContract,
  buildEventOraclePredictionObject,
  getEventQuestionChips,
  refineEventQuestion,
  type EventQuestionCategoryId,
  type EventQuestionRefinement,
} from '@pridicta/astrology';
import Link from 'next/link';
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
const MAX_RECENT_THREADS = 3;

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

export function WebEventQuestionComposer(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = getEventOracleCopy(language);
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const [customQuestion, setCustomQuestion] = useState('');
  const [refinement, setRefinement] = useState<EventQuestionRefinement>(() =>
    refineEventQuestion('', 'guide_me'),
  );
  const [recentThreads, setRecentThreads] = useState<RecentEventThread[]>([]);
  const [passStatus, setPassStatus] = useState<WebPassCostDisplay | undefined>();

  useEffect(() => {
    setRecentThreads(loadRecentThreads());

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
  const creditStatusTitle = passStatus?.title ?? copy.hero.creditQuietTitle;
  const creditStatusBody = passStatus?.body ?? copy.hero.creditQuietBody;
  const activeKundliName =
    activeKundli?.birthDetails.name?.trim() || copy.hero.activeKundliEmpty;
  const primaryHref = activeKundli ? askHref : '/dashboard/kundli';

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
            onChange={event => setCustomQuestion(event.target.value)}
            placeholder={copy.composer.customPlaceholder}
            type="text"
            value={customQuestion}
          />
        </label>
        <button
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
          <div>
            {refinement.downstream.evidenceRooms.map(room => (
              <em key={room}>{getRoomLabel(copy, room)}</em>
            ))}
          </div>
        </div>
        <p>{copy.composer.freePaid}</p>
        <Link className="button" href={askHref}>
          {copy.composer.askThis}
        </Link>
      </div>

      <div className="event-question-hero-lower">
        <article className="event-question-prediction-card">
          <div className="event-question-card-title">
            <span>{copy.predictionCard.evidencePendingTitle}</span>
            <strong>{copy.predictionCard.directAnswerLabel}</strong>
          </div>
          <p className="event-question-direct-answer">
            {predictionPreview.directAnswer}
          </p>
          <div className="event-question-prediction-grid">
            <div>
              <span>{copy.predictionCard.timingTriggerLabel}</span>
              <strong>{predictionPreview.timingWindow.label}</strong>
              <p>{predictionPreview.mostLikelyTrigger.summary}</p>
            </div>
            <div>
              <span>{copy.predictionCard.confidenceLabel}</span>
              <strong>{predictionPreview.confidence.label}</strong>
              <p>{predictionPreview.confidence.explanation}</p>
            </div>
            <div>
              <span>{copy.predictionCard.actionPlanLabel}</span>
              <strong>{predictionPreview.whatToDoNow[0]}</strong>
              <p>{predictionPreview.whatToDoNow[1]}</p>
            </div>
          </div>
          <details className="event-question-collapsed-evidence">
            <summary>{copy.predictionCard.collapsedEvidenceLabel}</summary>
            <div>
              {predictionPreview.collapsedEvidence.map(item => (
                <em key={item.layerId}>
                  {item.label}: {item.availability}
                </em>
              ))}
            </div>
          </details>
        </article>

        <aside className="event-question-recent-threads">
          <span>{copy.recentThreads.title}</span>
          {recentThreads.length ? (
            <div>
              {recentThreads.map(thread => (
                <button
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
    </section>
  );
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
