'use client';

import Link from 'next/link';
import type { CSSProperties, RefObject } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  applyManualBirthTimeEstimate,
  composeDestinyPassport,
  estimateManualBirthTimeRectification,
  attachKundliEditHistory,
  MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS,
  type ManualBirthTimeRectificationAnswer,
  type ManualBirthTimeRectificationEstimate,
} from '@pridicta/astrology';
import type {
  BirthDetails,
  ChartData,
  KundliData,
  SupportedLanguage,
} from '@pridicta/types';
import {
  WEB_BIRTH_PLACES,
  getBirthPlaceLabel,
  searchWebBirthPlaces,
  type WebBirthPlace,
} from '../lib/birth-places';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import {
  generateKundliFromWeb,
  canCreateAdditionalWebKundli,
  loadWebKundli,
  loadWebKundlis,
  saveWebKundli,
} from '../lib/web-kundli-storage';
import { AuthDialog } from './AuthDialog';
import { WebDestinyPassportCard } from './WebDestinyPassportCard';
import { NorthIndianChartLines, WebKundliChart } from './WebKundliChart';
import { WebActiveKundliActions } from './WebActiveKundliActions';

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
  const { language } = useLanguagePreference();
  const labels = KUNDLI_WIZARD_COPY[language] ?? KUNDLI_WIZARD_COPY.en;
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<WebBirthPlace>(
    WEB_BIRTH_PLACES[0],
  );
  const [birthPlaceQuery, setBirthPlaceQuery] = useState(
    getBirthPlaceLabel(WEB_BIRTH_PLACES[0]),
  );
  const [placeSuggestions, setPlaceSuggestions] = useState<WebBirthPlace[]>(
    WEB_BIRTH_PLACES.slice(0, 1),
  );
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [editingKundliId, setEditingKundliId] = useState<string | undefined>();
  const [editingKundliName, setEditingKundliName] = useState<string | undefined>();
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
  const [showStorageNudge, setShowStorageNudge] = useState(false);
  const [showCreationReveal, setShowCreationReveal] = useState(false);
  const createdChartRef = useRef<HTMLElement | null>(null);
  const selectedPlaceLabel = getBirthPlaceLabel(selectedPlace);
  const isSelectedPlaceCurrent =
    normalizeBirthPlaceLabel(birthPlaceQuery) ===
      normalizeBirthPlaceLabel(selectedPlaceLabel) ||
    normalizeBirthPlaceLabel(birthPlaceQuery) ===
      normalizeBirthPlaceLabel(selectedPlace.place);
  const details = useMemo<BirthDetails>(
    () => ({
      date,
      isTimeApproximate: isApproximate,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      name: name.trim(),
      place: selectedPlace.place,
      originalPlaceText:
        birthPlaceQuery.trim() === selectedPlaceLabel
          ? undefined
          : birthPlaceQuery.trim(),
      resolvedBirthPlace: {
        city: selectedPlace.city ?? selectedPlace.label.split(',')[0],
        country:
          selectedPlace.country ??
          selectedPlace.place.split(',').at(-1)?.trim() ??
          selectedPlace.place,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        source: selectedPlace.source ?? 'local-dataset',
        state: selectedPlace.state,
        timezone: selectedPlace.timezone,
      },
      time,
      timezone: selectedPlace.timezone,
    }),
    [birthPlaceQuery, date, isApproximate, name, selectedPlace, selectedPlaceLabel, time],
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
    const editKundliId = new URLSearchParams(window.location.search).get(
      'editKundliId',
    );

    if (!editKundliId) {
      return;
    }

    const record = loadWebKundlis().find(item => item.id === editKundliId);

    if (!record) {
      return;
    }

    const birthDetails = record.birthDetails;
    const matchingPlace = WEB_BIRTH_PLACES.find(
      option =>
        option.place === birthDetails.place ||
        option.label === birthDetails.place ||
        option.timezone === birthDetails.timezone,
    );
    const restoredPlace = matchingPlace ?? birthDetailsToWebPlace(birthDetails);

    setName(birthDetails.name);
    setDate(birthDetails.date);
    setTime(birthDetails.time);
    setSelectedPlace(restoredPlace);
    setBirthPlaceQuery(getBirthPlaceLabel(restoredPlace));
    setPlaceSuggestions([restoredPlace, ...WEB_BIRTH_PLACES].slice(0, 8));
    setIsApproximate(Boolean(birthDetails.isTimeApproximate));
    setEditingKundliId(record.id);
    setEditingKundliName(birthDetails.name);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const query = birthPlaceQuery.trim();

    setIsSearchingPlaces(query.length >= 2);

    const timer = window.setTimeout(() => {
      void searchWebBirthPlaces(query).then(places => {
        if (cancelled) {
          return;
        }

        setPlaceSuggestions(places);
        setIsSearchingPlaces(false);
      });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [birthPlaceQuery]);

  useEffect(() => {
    if (!showCreationReveal) {
      return;
    }

    window.requestAnimationFrame(() => {
      createdChartRef.current?.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
      createdChartRef.current?.focus({ preventScroll: true });
    });
  }, [showCreationReveal, kundli?.id]);

  function resetFlow() {
    setError(undefined);
    setShowStorageNudge(false);
    setRectificationStep('idle');
    setRectificationAnswers({});
    setShowCreationReveal(false);
  }

  function blockIfGuestNeedsSignInForNewKundli(mode: 'new' | 'update'): boolean {
    const gate = canCreateAdditionalWebKundli({
      isUpdate: mode === 'update',
    });

    if (gate.allowed) {
      return false;
    }

    setShowStorageNudge(true);
    setError(
      labels.guestLimitError,
    );
    return true;
  }

  function requestGeneration() {
    setError(undefined);
    setShowStorageNudge(false);

    if (!name.trim() || !date || !time) {
      setError('Please fill name, birth date, and birth time first.');
      return;
    }

    if (!isSelectedPlaceCurrent) {
      setError(
        'Choose a matching birth place from the suggestions so Predicta can use the correct timezone and coordinates.',
      );
      return;
    }

    if (!editingKundliId && blockIfGuestNeedsSignInForNewKundli('new')) {
      return;
    }

    if (isApproximate) {
      setRectificationStep('questions');
      return;
    }

    setRectificationStep('confirm-entered');
  }

  async function generate(
    finalDetails: BirthDetails,
    note: CreationNote,
    mode: 'new' | 'update' = 'new',
  ) {
    setError(undefined);

    try {
      if (blockIfGuestNeedsSignInForNewKundli(mode)) {
        return;
      }

      setActiveCreationNote(note);
      setIsGenerating(true);
      const generated = await generateKundliFromWeb(finalDetails, {
        save: false,
      });
      const existingKundli = editingKundliId
        ? loadWebKundlis().find(item => item.id === editingKundliId)
        : undefined;
      const nextKundli =
        existingKundli
          ? attachKundliEditHistory({
              after:
                mode === 'update'
                  ? { ...generated, id: existingKundli.id }
                  : generated,
              before: existingKundli,
              mode: mode === 'update' ? 'update-existing' : 'save-as-new',
              source: 'manual',
            })
          : generated;
      const saveResult = saveWebKundli(nextKundli);
      if (!saveResult.allowed) {
        setShowStorageNudge(true);
        setError(
          'This Kundli was calculated, but saving another Kundli needs sign-in. Sign in first, then create it again so it stays protected with your account.',
        );
        return;
      }
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
    setSelectedPlace(WEB_BIRTH_PLACES[0]);
    setBirthPlaceQuery(getBirthPlaceLabel(WEB_BIRTH_PLACES[0]));
    setPlaceSuggestions(WEB_BIRTH_PLACES.slice(0, 1));
    setIsApproximate(false);
    setRectificationStep('idle');
    setRectificationAnswers({});
    setLastCreationNote({ mode: 'entered' });
    setShowCreationReveal(false);
  }

  const shouldShowReadyFirst = Boolean(kundli && !editingKundliId);
  const readyFlow = kundli ? (
    <KundliReadyFlow
      creationNote={lastCreationNote}
      createdChartRef={createdChartRef}
      kundli={kundli}
      showCreationReveal={showCreationReveal}
    />
  ) : null;

  return (
    <div className="kundli-wizard">
      {isGenerating ? (
        <KundliCreationDialog
          birthDetails={confirmedDetails}
          creationNote={activeCreationNote}
        />
      ) : null}

      {shouldShowReadyFirst ? readyFlow : null}

      <section
        className={`kundli-wizard-card glass-panel${
          shouldShowReadyFirst ? ' secondary-kundli-form' : ''
        }`}
      >
        <div className="section-title">
          {shouldShowReadyFirst
            ? labels.createAnotherKundliStep
            : editingKundliName
            ? labels.editSavedKundli
            : labels.createKundliStep}
        </div>
        <h2>
          {shouldShowReadyFirst
            ? labels.createAnotherKundli
            : editingKundliName
            ? labels.reviewBirthDetails(editingKundliName)
            : labels.enterBirthDetails}
        </h2>
        <p>
          {shouldShowReadyFirst
            ? labels.createAnotherBirthDetailsBody
            : editingKundliName
            ? labels.editBirthDetailsBody
            : labels.createBirthDetailsBody}
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
            <div className="birth-place-search">
              <input
                aria-describedby="birth-place-help"
                autoComplete="off"
                onChange={event => {
                  resetFlow();
                  setBirthPlaceQuery(event.target.value);
                }}
                placeholder="Start typing city, state, country"
                value={birthPlaceQuery}
              />
              <small id="birth-place-help">
                Select the matching city so the chart uses the right timezone.
              </small>
              <div className="birth-place-suggestions" role="listbox">
                {placeSuggestions.slice(0, 6).map(option => {
                  const optionLabel = getBirthPlaceLabel(option);

                  return (
                    <button
                      aria-selected={
                        normalizeBirthPlaceLabel(optionLabel) ===
                        normalizeBirthPlaceLabel(selectedPlaceLabel)
                      }
                      key={`${option.place}-${option.latitude}-${option.longitude}`}
                      onClick={() => {
                        resetFlow();
                        setSelectedPlace(option);
                        setBirthPlaceQuery(optionLabel);
                        setPlaceSuggestions(current => [
                          option,
                          ...current.filter(item => item.place !== option.place),
                        ]);
                      }}
                      role="option"
                      type="button"
                    >
                      <strong>{option.city ?? option.label.split(',')[0]}</strong>
                      <span>
                        {[option.state, option.country]
                          .filter(Boolean)
                          .join(', ') || option.place}
                      </span>
                    </button>
                  );
                })}
                {isSearchingPlaces ? <em>Searching places...</em> : null}
              </div>
            </div>
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
        {showStorageNudge ? (
          <div className="guest-storage-nudge">
            <strong>Protect more Kundlis with sign-in</strong>
            <p>
              You can keep one Kundli as a guest. Sign in before adding family
              profiles, multiple saved chats, or report preferences.
            </p>
            <AuthDialog />
          </div>
        ) : null}

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
          isEditing={Boolean(editingKundliId)}
          isGenerating={isGenerating}
          onBack={() =>
            setRectificationStep(isApproximate ? 'questions' : 'idle')
          }
          onConfirm={() => generate(confirmedDetails, confirmationNote)}
          onConfirmUpdate={
            editingKundliId
              ? () => generate(confirmedDetails, confirmationNote, 'update')
              : undefined
          }
        />
      ) : null}

      {!shouldShowReadyFirst ? readyFlow : null}
    </div>
  );
}

function KundliReadyFlow({
  creationNote,
  createdChartRef,
  kundli,
  showCreationReveal,
}: {
  creationNote: CreationNote;
  createdChartRef: RefObject<HTMLElement | null>;
  kundli: KundliData;
  showCreationReveal: boolean;
}): React.JSX.Element {
  return (
    <section className="kundli-ready-flow">
      <WebActiveKundliActions
        compact
        kundli={kundli}
        showDelete
        sourceScreen="Kundli"
      />
      {showCreationReveal ? (
        <KundliCreationReveal
          birthDetails={kundli.birthDetails}
          chart={kundli.charts.D1}
          creationNote={creationNote}
          createdChartRef={createdChartRef}
          kundliId={kundli.id}
        />
      ) : (
        <div className="glass-panel kundli-chart-panel priority-kundli-chart">
          <div className="kundli-priority-heading">
            <div>
              <div className="section-title">ACTIVE KUNDLI</div>
              <h2>{kundli.birthDetails.name || 'Your Kundli'} is ready.</h2>
            </div>
            <Link
              className="button secondary"
              href={buildPredictaChatHref({
                kundli,
                prompt:
                  'Use this active Kundli and tell me what I should look at first today.',
                sourceScreen: 'Kundli',
              })}
            >
              Ask Predicta
            </Link>
          </div>
          <WebKundliChart
            birthDetails={kundli.birthDetails}
            chart={kundli.charts.D1}
            kundliId={kundli.id}
          />
        </div>
      )}
      <div className="plain-summary glass-panel">
        <div className="section-title">SIMPLE SUMMARY</div>
        <h2>Your chart foundation.</h2>
        <details className="info-drawer">
          <summary>
            <span>What this means</span>
            <strong>Open</strong>
          </summary>
          <p>
            Rising sign means your starting style. Moon sign means your
            emotional pattern. Dasha means the current life chapter.
          </p>
        </details>
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
    </section>
  );
}

function BirthDetailsConfirmation({
  birthDetails,
  creationNote,
  isGenerating,
  isEditing,
  onBack,
  onConfirm,
  onConfirmUpdate,
}: {
  birthDetails: BirthDetails;
  creationNote: CreationNote;
  isEditing?: boolean;
  isGenerating: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onConfirmUpdate?: () => void;
}): React.JSX.Element {
  return (
    <section className="birth-confirmation-panel glass-panel">
      <div className="section-title">
        {isEditing ? 'CONFIRM BEFORE UPDATE' : 'CONFIRM BEFORE CREATION'}
      </div>
      <h2>Check these birth details.</h2>
      <p>
        Predicta will {isEditing ? 'recalculate' : 'create'} the Kundli only
        after you confirm these details. If something is wrong, edit it before
        continuing.
      </p>
      {isEditing ? (
        <p>
          Changing birth date, time, or place recalculates the chart. You can
          update this saved Kundli or keep the old one and save a new Kundli.
        </p>
      ) : null}
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
        {onConfirmUpdate ? (
          <>
            <button
              className="button"
              disabled={isGenerating}
              onClick={onConfirmUpdate}
              type="button"
            >
              {isGenerating ? 'Updating...' : 'Update existing Kundli'}
            </button>
            <button
              className="button secondary"
              disabled={isGenerating}
              onClick={onConfirm}
              type="button"
            >
              {isGenerating ? 'Creating...' : 'Save as new Kundli'}
            </button>
          </>
        ) : (
          <button
            className="button"
            disabled={isGenerating}
            onClick={onConfirm}
            type="button"
          >
            {isGenerating ? 'Creating...' : 'Create Kundli'}
          </button>
        )}
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
          <NorthIndianChartLines />
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              className="animated-kundli-house"
              key={index}
              style={{ '--creation-cell-index': index } as CSSProperties}
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
  birthDetails,
  chart,
  creationNote,
  createdChartRef,
  kundliId,
}: {
  birthDetails?: BirthDetails;
  chart: ChartData;
  creationNote: CreationNote;
  createdChartRef: RefObject<HTMLElement | null>;
  kundliId?: string;
}): React.JSX.Element {
  return (
    <section
      className="kundli-creation-reveal glass-panel"
      ref={createdChartRef}
      tabIndex={-1}
    >
      <div className="kundli-creation-copy">
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
      <div className="kundli-created-chart-full">
        <WebKundliChart
          birthDetails={birthDetails}
          centerLabel="Created Kundli"
          chart={chart}
          kundliId={kundliId}
          sectionTitle="CREATED KUNDLI"
        />
      </div>
    </section>
  );
}

function birthDetailsToWebPlace(birthDetails: BirthDetails): WebBirthPlace {
  const resolved = birthDetails.resolvedBirthPlace;

  return {
    city: resolved?.city ?? birthDetails.place.split(',')[0]?.trim(),
    country:
      resolved?.country ?? birthDetails.place.split(',').at(-1)?.trim(),
    label:
      resolved
        ? [resolved.city, resolved.state, resolved.country]
            .filter(Boolean)
            .join(', ')
        : birthDetails.place,
    latitude: birthDetails.latitude,
    longitude: birthDetails.longitude,
    place: birthDetails.place,
    source: resolved?.source ?? 'local-dataset',
    state: resolved?.state,
    timezone: birthDetails.timezone,
  };
}

function normalizeBirthPlaceLabel(value?: string): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type KundliWizardCopy = {
  createAnotherBirthDetailsBody: string;
  createAnotherKundli: string;
  createAnotherKundliStep: string;
  createBirthDetailsBody: string;
  createKundliStep: string;
  editBirthDetailsBody: string;
  editSavedKundli: string;
  enterBirthDetails: string;
  reviewBirthDetails: (name: string) => string;
  guestLimitError: string;
};

const KUNDLI_WIZARD_COPY: Record<SupportedLanguage, KundliWizardCopy> = {
  en: {
    createAnotherBirthDetailsBody:
      'Your active Kundli stays above. Use this only when you want to create another chart.',
    createAnotherKundli: 'Create another Kundli only when needed.',
    createAnotherKundliStep: 'CREATE ANOTHER KUNDLI',
    createBirthDetailsBody:
      'Predicta needs only three things first: date, time, and place.',
    createKundliStep: 'STEP 1 · CREATE KUNDLI',
    editBirthDetailsBody:
      'Change only what is wrong, then confirm before Predicta recalculates the Kundli.',
    editSavedKundli: 'EDIT SAVED KUNDLI',
    enterBirthDetails: 'Enter birth details in order.',
    guestLimitError:
      'Your first Kundli is safe here. Please sign in before adding another Kundli, so family profiles and future edits stay protected.',
    reviewBirthDetails: name => `Review ${name}'s birth details.`,
  },
  hi: {
    createAnotherBirthDetailsBody:
      'आपकी सक्रिय कुंडली ऊपर रहेगी. नया चार्ट बनाना हो तभी यह इस्तेमाल करें.',
    createAnotherKundli: 'जरूरत हो तभी दूसरी कुंडली बनाएं.',
    createAnotherKundliStep: 'दूसरी कुंडली बनाएं',
    createBirthDetailsBody:
      'Predicta को पहले केवल तीन बातें चाहिए: तारीख, समय और स्थान.',
    createKundliStep: 'चरण 1 · कुंडली बनाएं',
    editBirthDetailsBody:
      'सिर्फ गलत विवरण बदलें, फिर Predicta कुंडली दोबारा गणना करने से पहले पुष्टि लेगी.',
    editSavedKundli: 'सेव कुंडली संपादित करें',
    enterBirthDetails: 'जन्म विवरण क्रम से भरें.',
    guestLimitError:
      'आपकी पहली कुंडली इस डिवाइस पर सेव है. दूसरी कुंडली जोड़ने से पहले साइन इन करें, ताकि परिवार प्रोफाइल और आगे के बदलाव सुरक्षित रहें.',
    reviewBirthDetails: name => `${name} के जन्म विवरण जांचें.`,
  },
  gu: {
    createAnotherBirthDetailsBody:
      'તમારી સક્રિય કુંડળી ઉપર રહેશે. બીજો ચાર્ટ બનાવવો હોય ત્યારે જ આ વાપરો.',
    createAnotherKundli: 'જરૂર હોય ત્યારે જ બીજી કુંડળી બનાવો.',
    createAnotherKundliStep: 'બીજી કુંડળી બનાવો',
    createBirthDetailsBody:
      'Predicta ને પહેલા માત્ર ત્રણ બાબતો જોઈએ: તારીખ, સમય અને સ્થળ.',
    createKundliStep: 'પગલું 1 · કુંડળી બનાવો',
    editBirthDetailsBody:
      'માત્ર ખોટી વિગતો બદલો, પછી Predicta કુંડળી ફરી ગણતા પહેલાં ખાતરી કરશે.',
    editSavedKundli: 'સાચવેલી કુંડળી સંપાદિત કરો',
    enterBirthDetails: 'જન્મ વિગતો ક્રમથી ભરો.',
    guestLimitError:
      'તમારી પહેલી કુંડળી આ ડિવાઇસ પર સેવ છે. બીજી કુંડળી ઉમેરતા પહેલાં સાઇન ઇન કરો, જેથી પરિવાર પ્રોફાઇલ અને આગળના ફેરફારો સુરક્ષિત રહે.',
    reviewBirthDetails: name => `${name} ની જન્મ વિગતો તપાસો.`,
  },
};
