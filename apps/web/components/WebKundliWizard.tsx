'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  applyManualBirthTimeEstimate,
  buildNorthIndianChartCells,
  composeDestinyPassport,
  estimateManualBirthTimeRectification,
  getPlanetAbbreviation,
  MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS,
  type ManualBirthTimeRectificationAnswer,
  type ManualBirthTimeRectificationEstimate,
} from '@pridicta/astrology';
import type { BirthDetails, ChartData, KundliData, PlanetPosition } from '@pridicta/types';
import { WEB_BIRTH_PLACES } from '../lib/birth-places';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import {
  generateKundliFromWeb,
  loadWebKundli,
} from '../lib/web-kundli-storage';
import { WebDestinyPassportCard } from './WebDestinyPassportCard';
import { WebKundliChart } from './WebKundliChart';

type CreationNote =
  | {
      mode: 'corrected';
      originalTime: string;
      probableTime: string;
    }
  | {
      mode: 'entered';
    };

export function WebKundliWizard(): React.JSX.Element {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [placeIndex, setPlaceIndex] = useState(0);
  const [isApproximate, setIsApproximate] = useState(false);
  const [rectificationStep, setRectificationStep] = useState<
    'confirm-corrected' | 'confirm-entered' | 'idle' | 'questions'
  >('idle');
  const [rectificationAnswers, setRectificationAnswers] = useState<
    Record<string, ManualBirthTimeRectificationAnswer | undefined>
  >({});
  const [lastCreationNote, setLastCreationNote] = useState<CreationNote>({
    mode: 'entered',
  });
  const [activeCreationNote, setActiveCreationNote] = useState<CreationNote>({
    mode: 'entered',
  });
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showCreationReveal, setShowCreationReveal] = useState(false);
  const place = WEB_BIRTH_PLACES[placeIndex] ?? WEB_BIRTH_PLACES[0];
  const details = useMemo<BirthDetails>(
    () => ({
      date,
      isTimeApproximate: isApproximate,
      latitude: place.latitude,
      longitude: place.longitude,
      name: name.trim(),
      place: place.place,
      resolvedBirthPlace: {
        city: place.label.split(',')[0],
        country: place.place.split(',').at(-1)?.trim() ?? place.place,
        latitude: place.latitude,
        longitude: place.longitude,
        source: 'local-dataset',
        timezone: place.timezone,
      },
      time,
      timezone: place.timezone,
    }),
    [date, isApproximate, name, place, time],
  );
  const rectificationEstimate = useMemo<ManualBirthTimeRectificationEstimate>(
    () =>
      estimateManualBirthTimeRectification({
        answers: rectificationAnswers,
        birthDetails: details,
      }),
    [details, rectificationAnswers],
  );
  const hasAnsweredAllRectificationQuestions =
    rectificationEstimate.answeredCount ===
    MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.length;
  const confirmedDetails =
    rectificationStep === 'confirm-corrected'
      ? applyManualBirthTimeEstimate(details, rectificationEstimate)
      : {
          ...details,
          isTimeApproximate:
            rectificationStep === 'confirm-entered' ? false : isApproximate,
          timeConfidence: 'entered' as const,
        };
  const confirmationNote: CreationNote =
    rectificationStep === 'confirm-corrected'
      ? {
          mode: 'corrected',
          originalTime: rectificationEstimate.originalTime,
          probableTime: rectificationEstimate.probableTime,
        }
      : {
          mode: 'entered',
        };

  useEffect(() => {
    setKundli(loadWebKundli());
  }, []);

  function resetFlow() {
    setError(undefined);
    setRectificationStep('idle');
    setRectificationAnswers({});
    setShowCreationReveal(false);
  }

  function requestGeneration() {
    setError(undefined);

    if (!name.trim() || !date || !time) {
      setError('Please fill name, birth date, and birth time first.');
      return;
    }

    if (isApproximate) {
      setRectificationStep('questions');
      return;
    }

    setRectificationStep('confirm-entered');
  }

  async function generate(finalDetails: BirthDetails, note: CreationNote) {
    setError(undefined);

    try {
      setActiveCreationNote(note);
      setIsGenerating(true);
      const nextKundli = await generateKundliFromWeb(finalDetails);
      setLastCreationNote(note);
      setKundli(nextKundli);
      setShowCreationReveal(true);
      setRectificationStep('idle');
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Kundli calculation failed. Please check the details.',
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function fillExample() {
    setError(undefined);
    setName('Aarav');
    setDate('2012-08-16');
    setTime('06:42');
    setPlaceIndex(0);
    setIsApproximate(false);
    setRectificationStep('idle');
    setRectificationAnswers({});
    setLastCreationNote({ mode: 'entered' });
    setShowCreationReveal(false);
  }

  return (
    <div className="kundli-wizard">
      {isGenerating ? (
        <KundliCreationDialog
          birthDetails={confirmedDetails}
          creationNote={activeCreationNote}
        />
      ) : null}

      <section className="kundli-wizard-card glass-panel">
        <div className="section-title">STEP 1 · CREATE KUNDLI</div>
        <h2>Enter birth details in order.</h2>
        <p>
          Predicta needs only three things first: date, time, and place.
        </p>

        <div className="kundli-form-grid">
          <label>
            <span>Name</span>
            <input
              onChange={event => {
                resetFlow();
                setName(event.target.value);
              }}
              placeholder="Your name"
              value={name}
            />
          </label>
          <label>
            <span>Birth date</span>
            <input
              onChange={event => {
                resetFlow();
                setDate(event.target.value);
              }}
              type="date"
              value={date}
            />
          </label>
          <label>
            <span>Birth time</span>
            <input
              onChange={event => {
                resetFlow();
                setTime(event.target.value);
              }}
              type="time"
              value={time}
            />
          </label>
          <label>
            <span>Birth place</span>
            <select
              onChange={event => {
                resetFlow();
                setPlaceIndex(Number(event.target.value));
              }}
              value={placeIndex}
            >
              {WEB_BIRTH_PLACES.map((option, index) => (
                <option key={option.place} value={index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="kundli-checkbox">
          <input
            checked={isApproximate}
            onChange={event => {
              resetFlow();
              setIsApproximate(event.target.checked);
            }}
            type="checkbox"
          />
          Birth time is approximate
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="action-row">
          <button
            className="button"
            disabled={isGenerating}
            onClick={requestGeneration}
            type="button"
          >
            {isGenerating ? 'Calculating...' : 'Continue'}
          </button>
          <button className="button secondary" onClick={fillExample} type="button">
            Fill Example
          </button>
        </div>
      </section>

      {rectificationStep === 'questions' ? (
        <section className="kundli-rectification-panel glass-panel">
          <div className="section-title">BIRTH TIME CHECK</div>
          <h2>Do you want Predicta to re-check this time?</h2>
          <p>
            Since you marked the time approximate, Predicta can ask a few simple
            yes/no life questions before creating the Kundli. You can also use
            the entered time if you are confident it is correct.
          </p>
          <div className="rectification-fast-path">
            <button
              className="button secondary"
              onClick={() => setRectificationStep('confirm-entered')}
              type="button"
            >
              Use my entered time
            </button>
            <span>
              No corrected-time wording will appear if you choose this path.
            </span>
          </div>
          <div className="rectification-question-list">
            {MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.map(question => (
              <div className="rectification-question" key={question.id}>
                <strong>{question.question}</strong>
                <div>
                  {(['yes', 'no'] as const).map(answer => (
                    <button
                      className={
                        rectificationAnswers[question.id] === answer
                          ? 'selected'
                          : ''
                      }
                      key={answer}
                      onClick={() =>
                        setRectificationAnswers(current => ({
                          ...current,
                          [question.id]: answer,
                        }))
                      }
                      type="button"
                    >
                      {answer === 'yes' ? 'Yes' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {hasAnsweredAllRectificationQuestions ? (
            <div className="rectification-estimate">
              <strong>Probable time: {rectificationEstimate.probableTime}</strong>
              <p>{rectificationEstimate.summary}</p>
              <div className="action-row">
                <button
                  className="button"
                  onClick={() => setRectificationStep('confirm-corrected')}
                  type="button"
                >
                  Use probable time
                </button>
                <button
                  className="button secondary"
                  onClick={() => setRectificationStep('confirm-entered')}
                  type="button"
                >
                  Use entered time instead
                </button>
              </div>
            </div>
          ) : (
            <p className="rectification-progress">
              Answer {MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.length -
                rectificationEstimate.answeredCount}{' '}
              more question
              {MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.length -
                rectificationEstimate.answeredCount ===
              1
                ? ''
                : 's'}{' '}
              to get a probable time.
            </p>
          )}
        </section>
      ) : null}

      {rectificationStep === 'confirm-entered' ||
      rectificationStep === 'confirm-corrected' ? (
        <BirthDetailsConfirmation
          birthDetails={confirmedDetails}
          creationNote={confirmationNote}
          isGenerating={isGenerating}
          onBack={() =>
            setRectificationStep(isApproximate ? 'questions' : 'idle')
          }
          onConfirm={() => generate(confirmedDetails, confirmationNote)}
        />
      ) : null}

      {kundli ? (
        <section className="kundli-ready-flow">
          {showCreationReveal ? (
            <KundliCreationReveal
              chart={kundli.charts.D1}
              creationNote={lastCreationNote}
            />
          ) : null}
          <div className="plain-summary glass-panel">
            <div className="section-title">STEP 2 · SIMPLE SUMMARY</div>
            <h2>Your kundli is ready.</h2>
            <p>
              Start here before opening advanced tools. Rising sign means your
              starting style. Moon sign means your emotional pattern. Dasha means
              the current life chapter.
            </p>
            <div className="plain-summary-grid">
              <div className="birth-detail-summary">
                <span>Date of birth</span>
                <strong>{kundli.birthDetails.date}</strong>
              </div>
              <div className="birth-detail-summary">
                <span>Birth time</span>
                <strong>
                  {kundli.birthDetails.time}
                  {isRectifiedBirthDetails(kundli.birthDetails) ? (
                    <em>Rectified time</em>
                  ) : null}
                </strong>
              </div>
              <div className="birth-detail-summary">
                <span>Birth place</span>
                <strong>{kundli.birthDetails.place}</strong>
              </div>
              <div>
                <span>Rising sign</span>
                <strong>{kundli.lagna}</strong>
              </div>
              <div>
                <span>Moon pattern</span>
                <strong>{kundli.moonSign}</strong>
              </div>
              <div>
                <span>Life chapter</span>
                <strong>
                  {kundli.dasha.current.mahadasha}/{kundli.dasha.current.antardasha}
                </strong>
              </div>
            </div>
            <div className="kundli-next-step-panel">
              <div>
                <h3>What would you like to see next?</h3>
                <p>
                  Predicta can now read this Kundli across today, timing, charts,
                  remedies, and reports.
                </p>
              </div>
              <div className="kundli-next-step-grid">
                <Link
                  className="quick-action primary"
                  href={buildPredictaChatHref({
                    kundli,
                    prompt:
                      'Use my newly created Kundli and tell me what I should look at first today.',
                    sourceScreen: 'Kundli Created',
                  })}
                >
                  <strong>Ask Predicta first</strong>
                  <span>Start with a guided reading.</span>
                </Link>
                <Link className="quick-action" href="/dashboard">
                  <strong>Today for me</strong>
                  <span>See Gochar and daily guidance.</span>
                </Link>
                <Link className="quick-action" href="/dashboard/charts">
                  <strong>Open charts</strong>
                  <span>See D1, D9, D10, and more.</span>
                </Link>
                <Link className="quick-action" href="/dashboard/timeline">
                  <strong>Timing map</strong>
                  <span>Dasha, Sade Sati, and yearly timing.</span>
                </Link>
                <Link className="quick-action" href="/dashboard/report">
                  <strong>Create report</strong>
                  <span>Make a free or premium PDF.</span>
                </Link>
                <Link className="quick-action" href="/dashboard/remedies">
                  <strong>Remedies</strong>
                  <span>Get karma-based practices.</span>
                </Link>
              </div>
            </div>
          </div>

          <WebDestinyPassportCard passport={composeDestinyPassport(kundli)} />
          <div className="glass-panel kundli-chart-panel">
            <WebKundliChart chart={kundli.charts.D1} kundliId={kundli.id} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function BirthDetailsConfirmation({
  birthDetails,
  creationNote,
  isGenerating,
  onBack,
  onConfirm,
}: {
  birthDetails: BirthDetails;
  creationNote: CreationNote;
  isGenerating: boolean;
  onBack: () => void;
  onConfirm: () => void;
}): React.JSX.Element {
  return (
    <section className="birth-confirmation-panel glass-panel">
      <div className="section-title">CONFIRM BEFORE CREATION</div>
      <h2>Check these birth details.</h2>
      <p>
        Predicta will create the Kundli only after you confirm these details.
        If something is wrong, edit it before continuing.
      </p>
      <div className="birth-confirmation-grid">
        <Detail label="Name" value={birthDetails.name} />
        <Detail label="Date" value={birthDetails.date} />
        <Detail label="Time" value={birthDetails.time} />
        <Detail label="Place" value={birthDetails.place} />
        <Detail label="Timezone" value={birthDetails.timezone} />
        <Detail
          label="Time confidence"
          value={
            creationNote.mode === 'corrected'
              ? 'Probable corrected time'
              : 'Entered time confirmed'
          }
        />
      </div>
      {creationNote.mode === 'corrected' ? (
        <div className="rectification-note-card">
          <strong>Probable corrected time selected</strong>
          <p>
            You entered {creationNote.originalTime}. Based on your yes/no
            answers, Predicta will create this Kundli with{' '}
            {creationNote.probableTime}. The chart will clearly remember this as
            a probable corrected time.
          </p>
        </div>
      ) : null}
      <div className="action-row">
        <button
          className="button"
          disabled={isGenerating}
          onClick={onConfirm}
          type="button"
        >
          {isGenerating ? 'Creating...' : 'Create Kundli'}
        </button>
        <button className="button secondary" onClick={onBack} type="button">
          Edit details
        </button>
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function isRectifiedBirthDetails(birthDetails: BirthDetails): boolean {
  return birthDetails.timeConfidence === 'rectified';
}

function KundliCreationDialog({
  birthDetails,
  creationNote,
}: {
  birthDetails: BirthDetails;
  creationNote: CreationNote;
}): React.JSX.Element {
  return (
    <div className="kundli-creation-dialog" role="status">
      <div className="kundli-creation-dialog-card">
        <div className="animated-kundli-board compact">
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              className="animated-kundli-house"
              key={index}
              style={{ '--creation-cell-index': index } as React.CSSProperties}
            />
          ))}
        </div>
        <div>
          <div className="section-title">CREATING KUNDLI</div>
          <h2>Drawing the chart carefully.</h2>
          <p>
            Lines are forming, signs are being placed, and planets will settle
            into their houses after calculation.
          </p>
          {creationNote.mode === 'corrected' ? (
            <p className="creation-correction-line">
              Using probable corrected time {creationNote.probableTime}, not
              the originally entered {creationNote.originalTime}.
            </p>
          ) : (
            <p className="creation-correction-line">
              Using the confirmed entered time {birthDetails.time}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function KundliCreationReveal({
  chart,
  creationNote,
}: {
  chart: ChartData;
  creationNote: CreationNote;
}): React.JSX.Element {
  const cells = buildNorthIndianChartCells(chart);
  const planetsByName = chart.planetDistribution.reduce<
    Record<string, PlanetPosition>
  >((current, planet) => {
    current[planet.name] = planet;
    return current;
  }, {});

  return (
    <section className="kundli-creation-reveal glass-panel">
      <div>
        <div className="section-title">KUNDLI CREATED</div>
        <h2>The chart is laid out.</h2>
        {creationNote.mode === 'corrected' ? (
          <p>
            This Kundli uses a probable corrected birth time of{' '}
            {creationNote.probableTime}. Original entered time:{' '}
            {creationNote.originalTime}.
          </p>
        ) : (
          <p>
            This Kundli uses the birth time you confirmed. No birth-time
            recalculation was applied.
          </p>
        )}
      </div>
      <div className="animated-kundli-board">
        {cells.map((cell, index) => {
          const housePlanets = cell.planets
            .map(planet => planetsByName[planet])
            .filter(Boolean)
            .sort((first, second) => first.degree - second.degree);

          return (
            <div
              className="animated-kundli-house"
              key={cell.key}
              style={
                { '--creation-cell-index': index } as React.CSSProperties
              }
            >
              <small>
                House {cell.house} · {cell.signShort}
              </small>
              <div className="creation-planet-stack">
                {housePlanets.slice(0, 3).map(planet => (
                  <span
                    className={planet.retrograde ? 'retrograde' : ''}
                    key={planet.name}
                    title={`${planet.name} ${planet.degree.toFixed(1)}°${
                      planet.retrograde ? ' retrograde' : ''
                    }`}
                  >
                    {getPlanetAbbreviation(planet.name)}
                    <em>{planet.degree.toFixed(1)}°</em>
                    {planet.retrograde ? <b>R</b> : null}
                  </span>
                ))}
                {housePlanets.length > 3 ? (
                  <strong>+{housePlanets.length - 3}</strong>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
