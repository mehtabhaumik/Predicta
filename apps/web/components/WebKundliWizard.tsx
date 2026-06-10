'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
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
  FamilyRelationshipLabel,
  KundliData,
  SupportedLanguage,
} from '@pridicta/types';
import {
  WEB_BIRTH_PLACES,
  doesBirthPlaceMatchQuery,
  getBirthPlaceLabel,
  searchWebBirthPlaces,
  type WebBirthPlace,
} from '../lib/birth-places';
import {
  getKundliAnimationStyle,
  getKundliAnimationSurfaceProps,
} from '../lib/kundli-animation-contract';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import {
  FAMILY_RELATIONSHIP_ORDER,
  getFamilyRelationshipLabel,
} from '../lib/family-relationships';
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
  const [selectedPlace, setSelectedPlace] = useState<WebBirthPlace | undefined>();
  const [birthPlaceQuery, setBirthPlaceQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<WebBirthPlace[]>([]);
  const [isPlaceSuggestionsOpen, setIsPlaceSuggestionsOpen] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [editingKundliId, setEditingKundliId] = useState<string | undefined>();
  const [editingKundliName, setEditingKundliName] = useState<string | undefined>();
  const [isApproximate, setIsApproximate] = useState(false);
  const [relationshipToOwner, setRelationshipToOwner] = useState<
    FamilyRelationshipLabel | ''
  >('');
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
  const birthPlaceSearchRef = useRef<HTMLDivElement | null>(null);
  const placeSearchRequestRef = useRef(0);
  const createdChartRef = useRef<HTMLElement | null>(null);
  const savedKundliRecords = useMemo(() => loadWebKundlis(), [kundli?.id]);
  const editingRecord = useMemo(
    () =>
      editingKundliId
        ? savedKundliRecords.find(item => item.id === editingKundliId)
        : undefined,
    [editingKundliId, savedKundliRecords],
  );
  const isOwnerProfile =
    editingRecord?.isOwnerProfile ?? (!editingKundliId && savedKundliRecords.length === 0);
  const shouldShowRelationshipSelector = !isOwnerProfile;
  const selectedPlaceLabel = selectedPlace ? getBirthPlaceLabel(selectedPlace) : '';
  const isSelectedPlaceCurrent =
    Boolean(selectedPlace) && isExactBirthPlaceSelection(selectedPlace, birthPlaceQuery);
  const details = useMemo<BirthDetails | undefined>(
    () => {
      if (!selectedPlace) {
        return undefined;
      }

      return {
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
      };
    },
    [birthPlaceQuery, date, isApproximate, name, selectedPlace, selectedPlaceLabel, time],
  );
  const rectificationEstimate = useMemo<ManualBirthTimeRectificationEstimate>(
    () => {
      if (!details) {
        return {
          answeredCount: 0,
          confidence: 'low',
          evidence: [],
          minuteAdjustment: 0,
          originalTime: time,
          probableTime: time,
          summary:
            'Select a matching birth place first so Predicta can check the birth time.',
        };
      }

      return estimateManualBirthTimeRectification({
        answers: rectificationAnswers,
        birthDetails: details,
      });
    },
    [details, rectificationAnswers, time],
  );
  const hasAnsweredAllRectificationQuestions =
    rectificationEstimate.answeredCount ===
    MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.length;
  const confirmedDetails = details
    ? rectificationStep === 'confirm-corrected'
      ? applyManualBirthTimeEstimate(details, rectificationEstimate)
      : {
          ...details,
          isTimeApproximate:
            rectificationStep === 'confirm-entered' ? false : isApproximate,
          timeConfidence: 'entered' as const,
        }
    : undefined;
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

  function closeBirthPlaceSuggestions() {
    placeSearchRequestRef.current += 1;
    setPlaceSuggestions([]);
    setIsSearchingPlaces(false);
    setIsPlaceSuggestionsOpen(false);
  }

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
    setPlaceSuggestions([]);
    setIsSearchingPlaces(false);
    setIsPlaceSuggestionsOpen(false);
    setIsApproximate(Boolean(birthDetails.isTimeApproximate));
    setRelationshipToOwner(
      record.isOwnerProfile ? '' : (record.relationshipToOwner ?? 'other'),
    );
    setEditingKundliId(record.id);
    setEditingKundliName(birthDetails.name);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const requestId = ++placeSearchRequestRef.current;
    const query = birthPlaceQuery.trim();
    const selectedPlaceIsExact = isExactBirthPlaceSelection(selectedPlace, query);

    if (selectedPlace && !selectedPlaceIsExact) {
      setSelectedPlace(undefined);
    }

    if (query.length < 2) {
      closeBirthPlaceSuggestions();
      return;
    }

    if (selectedPlaceIsExact) {
      closeBirthPlaceSuggestions();
      return;
    }

    if (!isPlaceSuggestionsOpen) {
      setIsSearchingPlaces(false);
      return;
    }

    setIsSearchingPlaces(true);

    const timer = window.setTimeout(() => {
      void searchWebBirthPlaces(query).then(places => {
        if (cancelled || requestId !== placeSearchRequestRef.current) {
          return;
        }

        const exactMatch = places.find(place =>
          isExactBirthPlaceSelection(place, query),
        );
        if (exactMatch) {
          setSelectedPlace(exactMatch);
          setBirthPlaceQuery(getBirthPlaceLabel(exactMatch));
          setPlaceSuggestions([]);
          setIsPlaceSuggestionsOpen(false);
          setIsSearchingPlaces(false);
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
  }, [birthPlaceQuery, isPlaceSuggestionsOpen, selectedPlace]);

  useEffect(() => {
    function closeBirthPlaceSuggestionsOnOutsidePress(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        birthPlaceSearchRef.current?.contains(target)
      ) {
        return;
      }

      closeBirthPlaceSuggestions();
    }

    document.addEventListener('pointerdown', closeBirthPlaceSuggestionsOnOutsidePress);

    return () => {
      document.removeEventListener(
        'pointerdown',
        closeBirthPlaceSuggestionsOnOutsidePress,
      );
    };
  }, []);

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
    setError(getKundliGateMessage(gate.reason, labels));
    return true;
  }

  function requestGeneration() {
    setError(undefined);
    setShowStorageNudge(false);

    if (!name.trim() || !date || !time) {
      setError('Please fill name, birth date, and birth time first.');
      return;
    }

    if (shouldShowRelationshipSelector && !relationshipToOwner) {
      setError(labels.relationshipRequiredError);
      return;
    }

    if (!details || !selectedPlace || !isSelectedPlaceCurrent) {
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
      const saveResult = saveWebKundli(nextKundli, {
        relationshipToOwner: shouldShowRelationshipSelector
          ? relationshipToOwner || undefined
          : 'self',
      });
      if (!saveResult.allowed) {
        setShowStorageNudge(true);
        setError(getKundliGateMessage(saveResult.reason, labels));
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
    setPlaceSuggestions([]);
    setIsSearchingPlaces(false);
    setIsPlaceSuggestionsOpen(false);
    setIsApproximate(false);
    setRelationshipToOwner('');
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
      {isGenerating && confirmedDetails ? (
        <KundliCreationDialog
          birthDetails={confirmedDetails}
          creationNote={activeCreationNote}
        />
      ) : null}

      <KundliRouteHeader
        editingKundliName={editingKundliName}
        kundli={kundli}
      />

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
            <div className="birth-place-search" ref={birthPlaceSearchRef}>
              <input
                aria-describedby="birth-place-help"
                autoComplete="off"
                onChange={event => {
                  resetFlow();
                  setBirthPlaceQuery(event.target.value);
                  setSelectedPlace(undefined);
                  setIsPlaceSuggestionsOpen(true);
                }}
                onFocus={() => {
                  if (
                    birthPlaceQuery.trim().length >= 2 &&
                    !isSelectedPlaceCurrent
                  ) {
                    setIsPlaceSuggestionsOpen(true);
                  }
                }}
                onKeyDown={event => {
                  if (event.key === 'Escape') {
                    closeBirthPlaceSuggestions();
                    event.currentTarget.blur();
                  }
                }}
                onBlur={event => {
                  const relatedTarget = event.relatedTarget;

                  if (
                    relatedTarget instanceof Node &&
                    birthPlaceSearchRef.current?.contains(relatedTarget)
                  ) {
                    return;
                  }

                  if (isSelectedPlaceCurrent) {
                    closeBirthPlaceSuggestions();
                  }
                }}
                placeholder="Start typing city, state, country"
                value={birthPlaceQuery}
              />
              <small id="birth-place-help">
                Select the matching city so the chart uses the right timezone.
              </small>
              {isPlaceSuggestionsOpen &&
              !isSelectedPlaceCurrent &&
              (placeSuggestions.length > 0 || isSearchingPlaces) ? (
                <div className="birth-place-suggestions" role="listbox">
                  {placeSuggestions.slice(0, 6).map(option => {
                    const optionLabel = getBirthPlaceLabel(option);

                    return (
                      <button
                        aria-selected={
                          selectedPlace
                            ? doesBirthPlaceMatchQuery(option, selectedPlaceLabel)
                            : false
                        }
                        key={`${option.place}-${option.latitude}-${option.longitude}`}
                        onClick={() => {
                          resetFlow();
                          setSelectedPlace(option);
                          setBirthPlaceQuery(optionLabel);
                          closeBirthPlaceSuggestions();
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
                  {isSearchingPlaces ? <em>{labels.searchingPlaces}</em> : null}
                </div>
              ) : null}
            </div>
          </label>
          {shouldShowRelationshipSelector ? (
            <label>
              <span>{labels.relationshipLabel}</span>
              <select
                onChange={event => {
                  resetFlow();
                  setRelationshipToOwner(
                    event.target.value as FamilyRelationshipLabel | '',
                  );
                }}
                value={relationshipToOwner}
              >
                <option value="">{labels.relationshipPlaceholder}</option>
                {FAMILY_RELATIONSHIP_ORDER.filter(option => option !== 'self').map(
                  option => (
                    <option key={option} value={option}>
                      {getFamilyRelationshipLabel(option, language)}
                    </option>
                  ),
                )}
              </select>
              <small>{labels.relationshipHelp}</small>
            </label>
          ) : null}
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
          {labels.birthTimeApproximate}
        </label>

        {error ? <p className="form-error">{error}</p> : null}
        {showStorageNudge ? (
          <div className="guest-storage-nudge">
            <strong>{labels.guestLimitTitle}</strong>
            <p>{labels.guestLimitError}</p>
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
            {isGenerating ? labels.calculating : labels.continueLabel}
          </button>
          <button className="button secondary" onClick={fillExample} type="button">
            {labels.fillExample}
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

      {(rectificationStep === 'confirm-entered' ||
        rectificationStep === 'confirm-corrected') &&
      confirmedDetails ? (
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
          kundli={kundli}
          kundliId={kundli.id}
        />
      ) : (
        <div className="glass-panel kundli-chart-panel priority-kundli-chart">
          <div className="kundli-priority-heading">
            <div>
              <div className="section-title">ACTIVE KUNDLI</div>
              <h2>{kundli.birthDetails.name || 'Your Kundli'} is ready.</h2>
              <p className="kundli-priority-copy">
                Start with one guided reading first. The chart below keeps the
                core Vedic grahas in front and keeps supporting refinements
                secondary.
              </p>
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
          <KundliProofStrip
            birthDetails={kundli.birthDetails}
            creationNote={creationNote}
          />
          <WebKundliChart
            birthDetails={kundli.birthDetails}
            chart={kundli.charts.D1}
            kundli={kundli}
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
            <div className="section-title">NEXT STEP</div>
            <h3>Start with Predicta first.</h3>
            <p>
              One guided reading is the fastest way to turn this chart into a
              clear starting point. Open the deeper tools only after that first
              read.
            </p>
          </div>
          <div className="kundli-next-step-actions">
            <Link
              className="button"
              href={buildPredictaChatHref({
                kundli,
                prompt:
                  'Use my newly created Kundli and tell me what I should look at first today.',
                sourceScreen: 'Kundli Created',
              })}
            >
              Ask Predicta first
            </Link>
            <Link className="button secondary" href="/dashboard/charts">
              Open charts
            </Link>
          </div>
          <div className="kundli-secondary-links">
            <Link href="/dashboard">Today for me</Link>
            <Link href="/dashboard/timeline">Timing map</Link>
            <Link href="/dashboard/report">Create report</Link>
            <Link href="/dashboard/remedies">Remedies</Link>
          </div>
        </div>
      </div>

      <WebDestinyPassportCard passport={composeDestinyPassport(kundli)} />
    </section>
  );
}

function KundliRouteHeader({
  editingKundliName,
  kundli,
}: {
  editingKundliName?: string;
  kundli?: KundliData;
}): React.JSX.Element {
  const isEditing = Boolean(editingKundliName);
  const isReady = Boolean(kundli && !editingKundliName);

  return (
    <section className="page-heading compact kundli-route-heading">
      <div className="section-title">
        {isEditing ? 'REVIEW SAVED KUNDLI' : isReady ? 'ACTIVE KUNDLI' : 'KUNDLI SETUP'}
      </div>
      <h1 className="gradient-text">
        {isEditing
          ? `Review ${editingKundliName}'s birth details carefully.`
          : isReady
          ? `${kundli?.birthDetails.name || 'Your'} Kundli is ready.`
          : 'Create your Kundli carefully.'}
      </h1>
      <p>
        {isEditing
          ? 'Any change to birth date, time, or place recalculates the chart. Confirm only after the details look exact.'
          : isReady
          ? 'Start from one guided reading, then move deeper into charts, timing, reports, or remedies.'
          : 'Match the birth place, confirm the timezone, and review the final birth details before Predicta calculates the chart.'}
      </p>
      <details className="info-drawer">
        <summary>
          <span>
            {isEditing
              ? 'How updates work'
              : isReady
              ? 'Why this chart is trustworthy'
              : 'What happens after creation'}
          </span>
          <strong>Open</strong>
        </summary>
        <p>
          {isEditing
            ? 'Updating a saved Kundli recalculates the chart from the edited details. Save as new only when you intentionally want two separate records.'
            : isReady
            ? 'The chart uses the matched place, coordinates, and timezone from the selected city. The primary Vedic view keeps core grahas first and moves supporting refinements into a secondary layer.'
            : 'Predicta matches the selected birth place to coordinates and timezone, asks for confirmation before calculation, and then moves you into an active-reading state instead of leaving you inside a setup-only page.'}
        </p>
      </details>
    </section>
  );
}

function KundliProofStrip({
  birthDetails,
  creationNote,
}: {
  birthDetails?: BirthDetails;
  creationNote: CreationNote;
}): React.JSX.Element {
  return (
    <div className="kundli-proof-strip">
      <div>
        <span>Birth place</span>
        <strong>{birthDetails?.place ?? 'Matched city selected'}</strong>
        <small>{birthDetails?.timezone ?? 'Timezone locked before calculation'}</small>
      </div>
      <div>
        <span>Time basis</span>
        <strong>
          {creationNote.mode === 'corrected'
            ? `Probable corrected time ${creationNote.probableTime}`
            : isRectifiedBirthDetails(birthDetails)
            ? `Saved rectified time ${birthDetails?.time ?? ''}`.trim()
            : `Confirmed entered time ${birthDetails?.time ?? ''}`.trim()}
        </strong>
        <small>
          {creationNote.mode === 'corrected'
            ? `Original entry ${creationNote.originalTime}`
            : isRectifiedBirthDetails(birthDetails)
            ? 'This saved Kundli already carries a rectified-time note'
            : 'No correction layer was applied'}
        </small>
      </div>
      <div>
        <span>Chart method</span>
        <strong>Core Vedic grahas first</strong>
        <small>Advanced refinements stay secondary on the first reading</small>
      </div>
    </div>
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

function isRectifiedBirthDetails(birthDetails?: BirthDetails): boolean {
  return birthDetails?.timeConfidence === 'rectified';
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
        <div
          className="animated-kundli-board compact"
          {...getKundliAnimationSurfaceProps('creation')}
        >
          <NorthIndianChartLines surface="creation" />
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              className="animated-kundli-house"
              data-kundli-animation-part="signs"
              key={index}
              style={{
                '--creation-cell-index': index,
                ...getKundliAnimationStyle(index, 'signs', 'creation'),
              } as CSSProperties}
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
  kundli,
  kundliId,
}: {
  birthDetails?: BirthDetails;
  chart: ChartData;
  creationNote: CreationNote;
  createdChartRef: RefObject<HTMLElement | null>;
  kundli?: KundliData;
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
        <h2>Your Kundli is ready.</h2>
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
      <KundliProofStrip birthDetails={birthDetails} creationNote={creationNote} />
      <div className="kundli-created-chart-full">
        <WebKundliChart
          animationSurface="creation"
          birthDetails={birthDetails}
          centerLabel="Created Kundli"
          chart={chart}
          kundli={kundli}
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

function isExactBirthPlaceSelection(
  place: WebBirthPlace | undefined,
  query?: string,
): boolean {
  if (!place) {
    return false;
  }

  const normalizedQuery = normalizeBirthPlaceLabel(query);

  if (!normalizedQuery) {
    return false;
  }

  return [
    place.city,
    place.label,
    place.place,
    getBirthPlaceLabel(place),
    ...(place.aliases ?? []),
  ]
    .filter(Boolean)
    .map(term => normalizeBirthPlaceLabel(term))
    .some(term => term === normalizedQuery);
}

function getKundliGateMessage(
  reason: ReturnType<typeof canCreateAdditionalWebKundli>['reason'],
  labels: KundliWizardCopy,
): string {
  if (reason === 'FREE_KUNDLI_LIMIT_REACHED') {
    return labels.freeLimitError;
  }

  if (reason === 'PREMIUM_KUNDLI_DAILY_SOFT_LIMIT_REACHED') {
    return labels.premiumDailySoftLimitError;
  }

  return labels.guestLimitError;
}

function normalizeBirthPlaceLabel(value?: string): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type KundliWizardCopy = {
  birthTimeApproximate: string;
  calculating: string;
  continueLabel: string;
  createAnotherBirthDetailsBody: string;
  createAnotherKundli: string;
  createAnotherKundliStep: string;
  createBirthDetailsBody: string;
  createKundliStep: string;
  editBirthDetailsBody: string;
  editSavedKundli: string;
  enterBirthDetails: string;
  fillExample: string;
  freeLimitError: string;
  reviewBirthDetails: (name: string) => string;
  guestLimitError: string;
  guestLimitTitle: string;
  premiumDailySoftLimitError: string;
  relationshipHelp: string;
  relationshipLabel: string;
  relationshipPlaceholder: string;
  relationshipRequiredError: string;
  searchingPlaces: string;
};

const KUNDLI_WIZARD_COPY: Record<SupportedLanguage, KundliWizardCopy> = {
  en: {
    birthTimeApproximate: 'Birth time is approximate',
    calculating: 'Calculating...',
    continueLabel: 'Continue',
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
    fillExample: 'Fill Example',
    freeLimitError:
      'You have saved 4 Kundlis on the free plan. Your details are still here. Upgrade to save another Kundli.',
    guestLimitError:
      'Your first Kundli is safe here. Please sign in before adding another Kundli, so family profiles and future edits stay protected.',
    guestLimitTitle: 'Protect more Kundlis with sign-in',
    premiumDailySoftLimitError:
      'You have created many Kundlis today. Existing Kundlis still open normally; please pause and try another new Kundli later.',
    relationshipHelp:
      'Choose how this saved profile relates to you. Your main profile stays Self and does not need this field.',
    relationshipLabel: 'Relationship to you',
    relationshipPlaceholder: 'Select relationship',
    relationshipRequiredError:
      'Select how this saved profile is related to you before creating or updating it.',
    reviewBirthDetails: name => `Review ${name}'s birth details.`,
    searchingPlaces: 'Searching places...',
  },
  hi: {
    birthTimeApproximate: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.abe190eefa"),
    calculating: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.6c8fdc8295"),
    continueLabel: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.aa9a542091"),
    createAnotherBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.04d60c154e"),
    createAnotherKundli: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.9524ee86a7"),
    createAnotherKundliStep: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.72bfdc185c"),
    createBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.bb01300395"),
    createKundliStep: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.3f1201483c"),
    editBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.b4c91e2690"),
    editSavedKundli: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.9ab7f097a3"),
    enterBirthDetails: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.7c8f5f32b0"),
    fillExample: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.cc062f671d"),
    freeLimitError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.4cdc4132e7"),
    guestLimitError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.4cdc4132e7"),
    guestLimitTitle: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.69426948bc"),
    premiumDailySoftLimitError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.4cdc4132e7"),
    relationshipHelp:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.ac5916328d"),
    relationshipLabel: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.920f52e152"),
    relationshipPlaceholder: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.06da9e136b"),
    relationshipRequiredError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.fa7f447f5e"),
    reviewBirthDetails: name => formatNativeCopy("native.apps.web.components.WebKundliWizard.tsx.78c98d45b0", [name]),
    searchingPlaces: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.f530cdfa76"),
  },
  gu: {
    birthTimeApproximate: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.f92bd5d28b"),
    calculating: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.38007d95c3"),
    continueLabel: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.9e3014236d"),
    createAnotherBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.b2d20cc0da"),
    createAnotherKundli: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.1beb027425"),
    createAnotherKundliStep: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.df15299f0b"),
    createBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.3daa0a51c7"),
    createKundliStep: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.7fa5156756"),
    editBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.66668b5ce0"),
    editSavedKundli: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.f2f57c2164"),
    enterBirthDetails: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.f08fc8d0eb"),
    fillExample: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.a8375c5abe"),
    freeLimitError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.df109a4a8f"),
    guestLimitError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.df109a4a8f"),
    guestLimitTitle: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.2d3fc8eba7"),
    premiumDailySoftLimitError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.df109a4a8f"),
    relationshipHelp:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.5071b4480b"),
    relationshipLabel: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.142d267dd0"),
    relationshipPlaceholder: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.9c93179b60"),
    relationshipRequiredError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.d369f850b5"),
    reviewBirthDetails: name => formatNativeCopy("native.apps.web.components.WebKundliWizard.tsx.4b0b53bf8b", [name]),
    searchingPlaces: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.78a7225ab4"),
  },
};
