'use client';

import {
  getEventOracleCopy,
  type EventOracleCopy,
} from '@pridicta/config';
import {
  getEventQuestionChips,
  refineEventQuestion,
  type EventQuestionCategoryId,
  type EventQuestionRefinement,
} from '@pridicta/astrology';
import Link from 'next/link';
import { useState } from 'react';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';

const QUESTION_CHIPS = getEventQuestionChips();

function getChipLabel(copy: EventOracleCopy, chipId: string): string {
  return copy.chipQuestions[chipId] ?? chipId;
}

function getRoomLabel(copy: EventOracleCopy, room: string): string {
  return copy.roomLabels[room] ?? room;
}

export function WebEventQuestionComposer(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = getEventOracleCopy(language);
  const [customQuestion, setCustomQuestion] = useState('');
  const [refinement, setRefinement] = useState<EventQuestionRefinement>(() =>
    refineEventQuestion('', 'guide_me'),
  );

  function refineSelectedQuestion(
    question: string,
    categoryId: EventQuestionCategoryId,
  ): void {
    setRefinement(refineEventQuestion(question, categoryId));
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
    prompt: refinement.suggestedPhrasing,
    sourceScreen: 'Primary Predicta Event Oracle',
  });

  return (
    <section className="event-question-composer glass-panel" aria-label={copy.composer.title}>
      <div className="event-question-composer-copy">
        <div className="section-title">{copy.composer.selectedLabel}</div>
        <h2>{copy.composer.title}</h2>
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
          onClick={() => setRefinement(refineEventQuestion(customQuestion))}
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
    </section>
  );
}
