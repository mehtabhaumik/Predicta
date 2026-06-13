'use client';

import {
  formatNativeCopy,
  getNativeCopy,
  translateUiText,
} from '@pridicta/config';
import Link from 'next/link';
import type { CSSProperties, RefObject } from 'react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
  searchLocalWebBirthPlaces,
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
  const [isBirthPlaceInputFocused, setIsBirthPlaceInputFocused] = useState(false);
  const [birthPlaceInputResetToken, setBirthPlaceInputResetToken] = useState(0);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [acceptedBirthPlaceQuery, setAcceptedBirthPlaceQuery] = useState('');
  const [settledBirthPlaceQuery, setSettledBirthPlaceQuery] = useState('');
  const [isBirthPlaceSelectionLocked, setIsBirthPlaceSelectionLocked] =
    useState(false);
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
  const birthPlaceInputRef = useRef<HTMLInputElement | null>(null);
  const birthPlaceSearchRef = useRef<HTMLDivElement | null>(null);
  const birthPlaceAutocompleteName = `predicta-context-${useId().replace(
    /[^a-zA-Z0-9_-]/g,
    '',
  )}`;
  const placeSearchRequestRef = useRef(0);
  const latestBirthPlaceSearchQueryRef = useRef('');
  const resolvedBirthPlaceQueryRef = useRef('');
  const birthPlaceSearchSettledRef = useRef(false);
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
  const normalizedBirthPlaceQuery = normalizeBirthPlaceLabel(birthPlaceQuery);
  const localBirthPlaceMatches = useMemo(
    () =>
      birthPlaceQuery.trim().length >= 2
        ? searchLocalWebBirthPlaces(birthPlaceQuery.trim()).slice(0, 6)
        : [],
    [birthPlaceQuery],
  );
  const immediatelySettledBirthPlace = useMemo(
    () => findSettledBirthPlaceCandidate(localBirthPlaceMatches, birthPlaceQuery),
    [birthPlaceQuery, localBirthPlaceMatches],
  );
  const isSelectedPlaceCurrent =
    Boolean(selectedPlace) &&
    (isExactBirthPlaceSelection(selectedPlace, birthPlaceQuery) ||
      doesBirthPlaceMatchQuery(selectedPlace, birthPlaceQuery));
  const isBirthPlaceQueryAccepted =
    Boolean(normalizedBirthPlaceQuery) &&
    acceptedBirthPlaceQuery === normalizedBirthPlaceQuery;
  const isBirthPlaceQuerySettled =
    Boolean(normalizedBirthPlaceQuery) &&
    settledBirthPlaceQuery === normalizedBirthPlaceQuery;
  const isBirthPlaceSearchSettled =
    isSelectedPlaceCurrent || isBirthPlaceQueryAccepted || isBirthPlaceQuerySettled;
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

  function resetBirthPlaceSearchUi() {
    setPlaceSuggestions([]);
    setIsSearchingPlaces(false);
    setIsPlaceSuggestionsOpen(false);
  }

  function closeSettledBirthPlaceSearch(optionLabel: string) {
    placeSearchRequestRef.current += 1;
    resolvedBirthPlaceQueryRef.current = normalizeBirthPlaceLabel(optionLabel);
    markBirthPlaceSearchSettled(optionLabel);
    setSettledBirthPlaceQuery(normalizeBirthPlaceLabel(optionLabel));
    setIsBirthPlaceInputFocused(false);
    resetBirthPlaceSearchUi();
  }

  function markBirthPlaceSearchSettled(query: string) {
    latestBirthPlaceSearchQueryRef.current = normalizeBirthPlaceLabel(query);
    birthPlaceSearchSettledRef.current = true;
  }

  function markBirthPlaceSearchUnsettled(query: string) {
    latestBirthPlaceSearchQueryRef.current = normalizeBirthPlaceLabel(query);
    birthPlaceSearchSettledRef.current = false;
  }

  function isResolvedBirthPlaceQuery(query: string) {
    const normalizedQuery = normalizeBirthPlaceLabel(query);

    if (!normalizedQuery) {
      return false;
    }

    if (acceptedBirthPlaceQuery === normalizedQuery) {
      return true;
    }

    if (settledBirthPlaceQuery === normalizedQuery) {
      return true;
    }

    return Boolean(
      selectedPlace &&
        (isExactBirthPlaceSelection(selectedPlace, query) ||
          doesBirthPlaceMatchQuery(selectedPlace, query)),
    );
  }

  function canApplyBirthPlaceSearchResult(requestId: number, query: string) {
    return (
      requestId === placeSearchRequestRef.current &&
      !birthPlaceSearchSettledRef.current &&
      latestBirthPlaceSearchQueryRef.current === normalizeBirthPlaceLabel(query) &&
      !isResolvedBirthPlaceQuery(query)
    );
  }

  function setBirthPlaceSuggestionResults(
    nextSuggestions: WebBirthPlace[],
    query = birthPlaceQuery,
  ) {
    const settledSuggestion = findSettledBirthPlaceCandidate(nextSuggestions, query);

    if (settledSuggestion) {
      settleBirthPlaceSelection(settledSuggestion);
      return;
    }

    if (
      birthPlaceSearchSettledRef.current ||
      isResolvedBirthPlaceQuery(query)
    ) {
      resetBirthPlaceSearchUi();
      return;
    }

    setPlaceSuggestions(nextSuggestions);
    setIsSearchingPlaces(false);
    setIsPlaceSuggestionsOpen(nextSuggestions.length > 0);
  }

  function closeBirthPlaceSuggestions() {
    placeSearchRequestRef.current += 1;
    resetBirthPlaceSearchUi();
  }

  function settleBirthPlaceQueryIfPossible(query = birthPlaceQuery) {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return false;
    }

    const settledPlace = findSettledBirthPlaceCandidate(
      searchLocalWebBirthPlaces(trimmedQuery).slice(0, 6),
      trimmedQuery,
    );

    if (!settledPlace) {
      return false;
    }

    settleBirthPlaceSelection(settledPlace);
    return true;
  }

  function settleBirthPlaceSelection(option: WebBirthPlace) {
    const optionLabel = getBirthPlaceLabel(option);

    closeSettledBirthPlaceSearch(optionLabel);
    setAcceptedBirthPlaceQuery(normalizeBirthPlaceLabel(optionLabel));
    setSelectedPlace(option);
    setBirthPlaceQuery(optionLabel);
    setIsBirthPlaceSelectionLocked(true);
    setBirthPlaceInputResetToken(token => token + 1);

    window.requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      const input = birthPlaceInputRef.current;

      if (
        input &&
        activeElement === input &&
        normalizeBirthPlaceLabel(input.value) === normalizeBirthPlaceLabel(optionLabel)
      ) {
        input.blur();
      }
    });

    window.setTimeout(() => {
      if (
        normalizeBirthPlaceLabel(birthPlaceInputRef.current?.value) ===
        normalizeBirthPlaceLabel(optionLabel)
      ) {
        closeSettledBirthPlaceSearch(optionLabel);
      }
    }, 120);
  }

  function selectBirthPlace(option: WebBirthPlace) {
    resetFlow();
    settleBirthPlaceSelection(option);
    window.requestAnimationFrame(() => {
      birthPlaceInputRef.current?.blur();
    });
  }

  function editBirthPlaceSelection() {
    resetFlow();
    placeSearchRequestRef.current += 1;
    resolvedBirthPlaceQueryRef.current = '';
    birthPlaceSearchSettledRef.current = false;
    setAcceptedBirthPlaceQuery('');
    setSettledBirthPlaceQuery('');
    setIsBirthPlaceSelectionLocked(false);
    setSelectedPlace(undefined);
    setBirthPlaceQuery('');
    resetBirthPlaceSearchUi();

    window.requestAnimationFrame(() => {
      const input = birthPlaceInputRef.current;

      if (!input) {
        return;
      }

      input.focus();
      input.setSelectionRange(0, 0);
      setIsBirthPlaceInputFocused(true);
    });
  }

  function handleBirthPlaceQueryInput(nextQuery: string) {
    resetFlow();
    placeSearchRequestRef.current += 1;
    const normalizedNextQuery = normalizeBirthPlaceLabel(nextQuery);

    if (
      normalizedNextQuery &&
      resolvedBirthPlaceQueryRef.current === normalizedNextQuery
    ) {
      markBirthPlaceSearchSettled(nextQuery);
      setBirthPlaceQuery(nextQuery);
      setIsBirthPlaceInputFocused(false);
      closeBirthPlaceSuggestions();
      return;
    }

    if (
      resolvedBirthPlaceQueryRef.current &&
      resolvedBirthPlaceQueryRef.current !== normalizedNextQuery
    ) {
      resolvedBirthPlaceQueryRef.current = '';
    }

    markBirthPlaceSearchUnsettled(nextQuery);
    resetBirthPlaceSearchUi();
    setIsBirthPlaceInputFocused(true);
    setBirthPlaceQuery(nextQuery);

    if (
      settledBirthPlaceQuery &&
      settledBirthPlaceQuery !== normalizedNextQuery
    ) {
      setSettledBirthPlaceQuery('');
    }

    if (
      !acceptedBirthPlaceQuery ||
      acceptedBirthPlaceQuery !== normalizedNextQuery
    ) {
      setIsBirthPlaceSelectionLocked(false);
      setSelectedPlace(undefined);
    }

    const settledPlace = findSettledBirthPlaceCandidate(
      searchLocalWebBirthPlaces(nextQuery).slice(0, 6),
      nextQuery,
    );

    if (settledPlace) {
      settleBirthPlaceSelection(settledPlace);
      return;
    }

    if (
      (settledBirthPlaceQuery &&
        settledBirthPlaceQuery === normalizedNextQuery) ||
      (acceptedBirthPlaceQuery &&
        acceptedBirthPlaceQuery === normalizedNextQuery)
    ) {
      markBirthPlaceSearchSettled(nextQuery);
      closeBirthPlaceSuggestions();
      setIsBirthPlaceSelectionLocked(true);
      return;
    }

    const nextLocalMatches = searchLocalWebBirthPlaces(nextQuery).slice(0, 6);

    if (nextLocalMatches.length > 0) {
      setBirthPlaceSuggestionResults(nextLocalMatches, nextQuery);
      setIsPlaceSuggestionsOpen(true);
      return;
    }

    setAcceptedBirthPlaceQuery('');
    setIsBirthPlaceSelectionLocked(false);
    setIsPlaceSuggestionsOpen(normalizedNextQuery.length >= 2);
    setIsSearchingPlaces(normalizedNextQuery.length >= 2);
  }

  useEffect(() => {
    if (!isBirthPlaceSearchSettled) {
      return;
    }

    // A resolved place must always win over stale local/remote search results.
    setIsBirthPlaceInputFocused(false);
    resetBirthPlaceSearchUi();
  }, [isBirthPlaceSearchSettled, normalizedBirthPlaceQuery]);

  useEffect(() => {
    if (!isBirthPlaceInputFocused) {
      return undefined;
    }

    const reconcileNativeBirthPlaceValue = () => {
      const nativeValue = birthPlaceInputRef.current?.value ?? '';
      const normalizedNativeValue = normalizeBirthPlaceLabel(nativeValue);

      if (!normalizedNativeValue) {
        return;
      }

      if (normalizedNativeValue !== normalizeBirthPlaceLabel(birthPlaceQuery)) {
        handleBirthPlaceQueryInput(nativeValue);
        return;
      }

      if (!isResolvedBirthPlaceQuery(nativeValue)) {
        settleBirthPlaceQueryIfPossible(nativeValue);
      }
    };

    const intervalId = window.setInterval(reconcileNativeBirthPlaceValue, 120);
    reconcileNativeBirthPlaceValue();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    acceptedBirthPlaceQuery,
    birthPlaceQuery,
    isBirthPlaceInputFocused,
    selectedPlace,
    settledBirthPlaceQuery,
  ]);

  useEffect(() => {
    if (!isSearchingPlaces) {
      return;
    }

    if (localBirthPlaceMatches.length > 0 || placeSuggestions.length > 0) {
      setIsSearchingPlaces(false);
    }
  }, [isSearchingPlaces, localBirthPlaceMatches.length, placeSuggestions.length]);

  useEffect(() => {
    if (
      !immediatelySettledBirthPlace ||
      isBirthPlaceSelectionLocked ||
      isSelectedPlaceCurrent
    ) {
      return;
    }

    // Exact local matches should become a real resolved place immediately,
    // not a half-open autocomplete state that waits for another click.
    settleBirthPlaceSelection(immediatelySettledBirthPlace);
  }, [
    immediatelySettledBirthPlace,
    isBirthPlaceSelectionLocked,
    isSelectedPlaceCurrent,
  ]);

  useEffect(() => {
    if (!isBirthPlaceInputFocused && !isPlaceSuggestionsOpen) {
      return undefined;
    }

    function handleOutsidePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        birthPlaceSearchRef.current?.contains(target)
      ) {
        return;
      }

      setIsBirthPlaceInputFocused(false);
      closeBirthPlaceSuggestions();
    }

    document.addEventListener('pointerdown', handleOutsidePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown, true);
    };
  }, [isBirthPlaceInputFocused, isPlaceSuggestionsOpen]);

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
    settleBirthPlaceSelection(restoredPlace);
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
    const selectedPlaceMatchesQuery =
      selectedPlaceIsExact ||
      Boolean(selectedPlace && doesBirthPlaceMatchQuery(selectedPlace, query));

    if (selectedPlace && !selectedPlaceMatchesQuery) {
      markBirthPlaceSearchUnsettled(query);
      setIsBirthPlaceSelectionLocked(false);
      setSelectedPlace(undefined);
    }

    if (query.length < 2) {
      markBirthPlaceSearchUnsettled(query);
      setAcceptedBirthPlaceQuery('');
      setSettledBirthPlaceQuery('');
      setIsBirthPlaceSelectionLocked(false);
      resetBirthPlaceSearchUi();
      return;
    }

    if (
      selectedPlaceMatchesQuery ||
      (settledBirthPlaceQuery &&
        settledBirthPlaceQuery === normalizedBirthPlaceQuery) ||
      (acceptedBirthPlaceQuery &&
        acceptedBirthPlaceQuery === normalizedBirthPlaceQuery)
    ) {
      resetBirthPlaceSearchUi();
      return;
    }

    if (!isPlaceSuggestionsOpen || !isBirthPlaceInputFocused) {
      setIsSearchingPlaces(false);
      return;
    }

    const localMatches = searchLocalWebBirthPlaces(query).slice(0, 6);
    const exactLocalMatch = findSettledBirthPlaceCandidate(localMatches, query);

    if (exactLocalMatch) {
      settleBirthPlaceSelection(exactLocalMatch);
      return;
    }

    if (!canApplyBirthPlaceSearchResult(requestId, query)) {
      resetBirthPlaceSearchUi();
      return;
    }

    setBirthPlaceSuggestionResults(localMatches, query);
    setIsSearchingPlaces(localMatches.length === 0);

    if (localMatches.length > 0) {
      return;
    }

    let remoteSearchTimeout: number | undefined;
    const timer = window.setTimeout(() => {
      remoteSearchTimeout = window.setTimeout(() => {
        if (cancelled || !canApplyBirthPlaceSearchResult(requestId, query)) {
          return;
        }

        const fallbackMatches = searchLocalWebBirthPlaces(query).slice(0, 6);
        setBirthPlaceSuggestionResults(fallbackMatches, query);
        setIsSearchingPlaces(false);
        setIsPlaceSuggestionsOpen(fallbackMatches.length > 0);
      }, 4000);

      void searchWebBirthPlaces(query).then(places => {
        if (cancelled || !canApplyBirthPlaceSearchResult(requestId, query)) {
          return;
        }

        const exactMatch = findSettledBirthPlaceCandidate(places, query);
        if (exactMatch) {
          settleBirthPlaceSelection(exactMatch);
          return;
        }

        setBirthPlaceSuggestionResults(places, query);
        setIsSearchingPlaces(false);
      }).catch(() => {
        if (cancelled || !canApplyBirthPlaceSearchResult(requestId, query)) {
          return;
        }

        const fallbackMatches = searchLocalWebBirthPlaces(query).slice(0, 6);
        setBirthPlaceSuggestionResults(fallbackMatches, query);
        setIsSearchingPlaces(false);
        setIsPlaceSuggestionsOpen(fallbackMatches.length > 0);
      }).finally(() => {
        if (remoteSearchTimeout) {
          window.clearTimeout(remoteSearchTimeout);
        }
      });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (remoteSearchTimeout) {
        window.clearTimeout(remoteSearchTimeout);
      }
    };
  }, [
    birthPlaceQuery,
    acceptedBirthPlaceQuery,
    isBirthPlaceInputFocused,
    isPlaceSuggestionsOpen,
    isBirthPlaceSelectionLocked,
    normalizedBirthPlaceQuery,
    selectedPlace,
    settledBirthPlaceQuery,
  ]);

  useEffect(() => {
    if (
      isBirthPlaceSearchSettled &&
      (isPlaceSuggestionsOpen || isSearchingPlaces || placeSuggestions.length > 0)
    ) {
      resetBirthPlaceSearchUi();
    }
  }, [
    isPlaceSuggestionsOpen,
    isSearchingPlaces,
    isBirthPlaceSearchSettled,
    placeSuggestions.length,
  ]);

  useEffect(() => {
    if (
      !isBirthPlaceInputFocused &&
      (isPlaceSuggestionsOpen || isSearchingPlaces || placeSuggestions.length > 0)
    ) {
      resetBirthPlaceSearchUi();
    }
  }, [
    isBirthPlaceInputFocused,
    isPlaceSuggestionsOpen,
    isSearchingPlaces,
    placeSuggestions.length,
  ]);

  useEffect(() => {
    if (
      isSelectedPlaceCurrent &&
      (isBirthPlaceInputFocused ||
        isPlaceSuggestionsOpen ||
        isSearchingPlaces ||
        placeSuggestions.length > 0)
    ) {
      birthPlaceInputRef.current?.blur();
      setIsBirthPlaceInputFocused(false);
      resetBirthPlaceSearchUi();
    }
  }, [
    isBirthPlaceInputFocused,
    isPlaceSuggestionsOpen,
    isSearchingPlaces,
    isSelectedPlaceCurrent,
    placeSuggestions.length,
  ]);

  useEffect(() => {
    if (!isResolvedBirthPlaceQuery(birthPlaceQuery)) {
      return;
    }

    // A resolved place must never leave a native/autocomplete ghost panel behind.
    placeSearchRequestRef.current += 1;
    markBirthPlaceSearchSettled(birthPlaceQuery);
    setIsBirthPlaceInputFocused(false);
    resetBirthPlaceSearchUi();
  }, [
    acceptedBirthPlaceQuery,
    birthPlaceQuery,
    selectedPlace,
    settledBirthPlaceQuery,
  ]);

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
      setIsBirthPlaceInputFocused(false);
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
    closeBirthPlaceSuggestions();

    if (!name.trim() || !date || !time) {
      setError(labels.requiredBirthDetailsError);
      return;
    }

    if (shouldShowRelationshipSelector && !relationshipToOwner) {
      setError(labels.relationshipRequiredError);
      return;
    }

    if (!details || !selectedPlace || !isSelectedPlaceCurrent) {
      setError(
        labels.birthPlaceRequiredError,
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
    settleBirthPlaceSelection(WEB_BIRTH_PLACES[0]);
    setIsApproximate(false);
    setRelationshipToOwner('');
    setRectificationStep('idle');
    setRectificationAnswers({});
    setLastCreationNote({ mode: 'entered' });
    setShowCreationReveal(false);
  }

  const shouldShowReadyFirst = Boolean(kundli && !editingKundliId);
  const isBirthPlaceOverlayResolved =
    normalizedBirthPlaceQuery.length >= 2 &&
    isResolvedBirthPlaceQuery(birthPlaceQuery);
  const shouldSuppressBirthPlaceOverlay =
    Boolean(
      normalizedBirthPlaceQuery &&
        resolvedBirthPlaceQueryRef.current === normalizedBirthPlaceQuery,
    ) ||
    isBirthPlaceSelectionLocked ||
    isBirthPlaceQuerySettled ||
    Boolean(selectedPlace && isSelectedPlaceCurrent) ||
    isBirthPlaceSearchSettled ||
    Boolean(immediatelySettledBirthPlace) ||
    isBirthPlaceOverlayResolved;
  const canShowBirthPlaceOverlay =
    isBirthPlaceInputFocused &&
    !shouldSuppressBirthPlaceOverlay &&
    !isResolvedBirthPlaceQuery(birthPlaceQuery) &&
    normalizedBirthPlaceQuery.length >= 2;
  const visibleBirthPlaceSuggestions = !canShowBirthPlaceOverlay
    ? []
    : (localBirthPlaceMatches.length > 0
        ? localBirthPlaceMatches
        : placeSuggestions
      ).slice(0, 6);
  const hasVisibleBirthPlaceSuggestions = visibleBirthPlaceSuggestions.length > 0;
  const shouldShowBirthPlaceSuggestions =
    canShowBirthPlaceOverlay &&
    isPlaceSuggestionsOpen &&
    !isSearchingPlaces &&
    hasVisibleBirthPlaceSuggestions;
  const shouldShowBirthPlaceOverlay = shouldShowBirthPlaceSuggestions;
  const readyFlow = kundli ? (
    <KundliReadyFlow
      creationNote={lastCreationNote}
      createdChartRef={createdChartRef}
      kundli={kundli}
      labels={labels}
      language={language}
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
        labels={labels}
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
            <span>{labels.nameLabel}</span>
            <input
              onChange={event => {
                resetFlow();
                setName(event.target.value);
              }}
              placeholder={labels.namePlaceholder}
              value={name}
            />
          </label>
          <label>
            <span>{labels.birthDateLabel}</span>
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
            <span>{labels.birthTimeLabel}</span>
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
            <span>{labels.birthPlaceLabel}</span>
            <div
              className="birth-place-search"
              data-birth-place-settled={isBirthPlaceSearchSettled ? 'true' : 'false'}
              ref={birthPlaceSearchRef}
            >
              <div className="birth-place-input-row">
                <input
                  aria-describedby="birth-place-help"
                  aria-autocomplete="list"
                  aria-readonly={isBirthPlaceSearchSettled}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="new-password"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  data-birth-place-search="true"
                  data-form-type="other"
                  data-lpignore="true"
                  inputMode="search"
                  key={`${birthPlaceAutocompleteName}-${birthPlaceInputResetToken}`}
                  name={`${birthPlaceAutocompleteName}-${birthPlaceInputResetToken}`}
                  aria-expanded={shouldShowBirthPlaceOverlay}
                  readOnly={isBirthPlaceSearchSettled}
                  ref={birthPlaceInputRef}
                  spellCheck={false}
                  onInput={event => {
                    if (isBirthPlaceSearchSettled) {
                      return;
                    }

                    handleBirthPlaceQueryInput(event.currentTarget.value);
                  }}
                  onFocus={event => {
                    if (isBirthPlaceSearchSettled) {
                      setIsBirthPlaceInputFocused(false);
                      closeBirthPlaceSuggestions();
                      event.currentTarget.blur();
                      return;
                    }

                    const nativeValue = birthPlaceInputRef.current?.value ?? '';
                    if (
                      nativeValue &&
                      normalizeBirthPlaceLabel(nativeValue) !==
                        normalizeBirthPlaceLabel(birthPlaceQuery)
                    ) {
                      handleBirthPlaceQueryInput(nativeValue);
                      return;
                    }

                    const focusQuery = nativeValue || birthPlaceQuery;
                    if (
                      isResolvedBirthPlaceQuery(focusQuery) ||
                      settleBirthPlaceQueryIfPossible(focusQuery)
                    ) {
                      setIsBirthPlaceInputFocused(false);
                      closeBirthPlaceSuggestions();
                      event.currentTarget.blur();
                      return;
                    }

                    setIsBirthPlaceInputFocused(true);
                    if (birthPlaceQuery.trim().length >= 2) {
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

                    if (isBirthPlaceSearchSettled || settleBirthPlaceQueryIfPossible()) {
                      setIsBirthPlaceInputFocused(false);
                      closeBirthPlaceSuggestions();
                      return;
                    }

                    window.setTimeout(() => {
                      const activeElement = document.activeElement;

                      if (
                        activeElement instanceof Node &&
                        birthPlaceSearchRef.current?.contains(activeElement)
                      ) {
                        return;
                      }

                      setIsBirthPlaceInputFocused(false);
                      closeBirthPlaceSuggestions();
                    }, 80);
                  }}
                  placeholder={labels.birthPlacePlaceholder}
                  value={birthPlaceQuery}
                />
                {isBirthPlaceSearchSettled ? (
                  <button
                    className="birth-place-change-button"
                    onClick={editBirthPlaceSelection}
                    type="button"
                  >
                    {labels.birthPlaceChangeLabel}
                  </button>
                ) : null}
              </div>
              <small id="birth-place-help">
                {labels.birthPlaceHelp}
              </small>
              {shouldShowBirthPlaceOverlay ? (
                <div className="birth-place-suggestions" role="listbox">
                  {visibleBirthPlaceSuggestions.map(option => {
                    return (
                      <button
                        aria-selected={
                          selectedPlace
                            ? doesBirthPlaceMatchQuery(option, selectedPlaceLabel)
                            : false
                        }
                        key={`${option.place}-${option.latitude}-${option.longitude}`}
                        onPointerDown={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          selectBirthPlace(option);
                        }}
                        onMouseDown={event => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          selectBirthPlace(option);
                        }}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.stopPropagation();
                            selectBirthPlace(option);
                          }
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
  labels,
  language,
  showCreationReveal,
}: {
  creationNote: CreationNote;
  createdChartRef: RefObject<HTMLElement | null>;
  kundli: KundliData;
  labels: KundliWizardCopy;
  language: SupportedLanguage;
  showCreationReveal: boolean;
}): React.JSX.Element {
  const t = (value: string) => translateUiText(value, language);

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
          labels={labels}
          kundli={kundli}
          kundliId={kundli.id}
        />
      ) : (
        <div className="glass-panel kundli-chart-panel priority-kundli-chart">
          <div className="kundli-priority-heading">
            <div>
              <div className="section-title">{labels.activeKundliSection}</div>
              <h2>
                {kundli.birthDetails.name
                  ? labels.activeKundliHeading(kundli.birthDetails.name)
                  : labels.activeKundliGenericHeading}
              </h2>
              <p className="kundli-priority-copy">
                {labels.activeKundliPriorityCopy}
              </p>
            </div>
            <Link
              className="button secondary"
              href={buildPredictaChatHref({
                kundli,
                prompt: labels.activeKundliAskPrompt,
                sourceScreen: 'Kundli',
              })}
            >
              {labels.askPredictaLabel}
            </Link>
          </div>
          <KundliProofStrip
            birthDetails={kundli.birthDetails}
            creationNote={creationNote}
            labels={labels}
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
        <div className="section-title">{labels.simpleSummarySection}</div>
        <h2>{labels.chartFoundationHeading}</h2>
        <details className="info-drawer">
          <summary>
            <span>{labels.whatThisMeansTitle}</span>
            <strong>{labels.openLabel}</strong>
          </summary>
          <p>{labels.chartFoundationDrawerBody}</p>
        </details>
        <div className="plain-summary-grid">
          <div className="birth-detail-summary">
            <span>{labels.dateOfBirthLabel}</span>
            <strong>{kundli.birthDetails.date}</strong>
          </div>
          <div className="birth-detail-summary">
            <span>{labels.birthTimeLabel}</span>
            <strong>
              {kundli.birthDetails.time}
              {isRectifiedBirthDetails(kundli.birthDetails) ? (
                <em>{labels.rectifiedTimeLabel}</em>
              ) : null}
            </strong>
          </div>
          <div className="birth-detail-summary">
            <span>{labels.birthPlaceLabel}</span>
            <strong>{kundli.birthDetails.place}</strong>
          </div>
          <div>
            <span>{labels.risingSignLabel}</span>
            <strong>{kundli.lagna}</strong>
          </div>
          <div>
            <span>{labels.moonPatternLabel}</span>
            <strong>{kundli.moonSign}</strong>
          </div>
          <div>
            <span>{labels.lifeChapterLabel}</span>
            <strong>
              {kundli.dasha.current.mahadasha}/{kundli.dasha.current.antardasha}
            </strong>
          </div>
        </div>
        <div className="kundli-next-step-panel">
          <div>
            <div className="section-title">{labels.nextStepSection}</div>
            <h3>{labels.startPredictaFirstHeading}</h3>
            <p>{labels.startPredictaFirstBody}</p>
          </div>
          <div className="kundli-primary-action-row">
            <Link
              className="button"
              href={buildPredictaChatHref({
                kundli,
                prompt: labels.createdKundliAskPrompt,
                sourceScreen: 'Kundli Created',
              })}
            >
              {labels.askPredictaFirstLabel}
            </Link>
          </div>
          <details className="info-drawer kundli-tools-drawer">
            <summary>
              <span>{t('More Kundli tools')}</span>
              <strong>{t('Open only when needed')}</strong>
            </summary>
            <div className="kundli-secondary-tool-grid">
              <Link
                className="kundli-secondary-tool-link"
                href={buildPredictaChatHref({
                  kundli,
                  prompt:
                    "Use my Kundli and tell me today's most useful guidance first.",
                  sourceScreen: 'Kundli Created',
                })}
              >
                <strong>{t('Today for me')}</strong>
                <span>{t('See Gochar and daily guidance.')}</span>
              </Link>
              <Link className="kundli-secondary-tool-link" href="/dashboard/charts">
                <strong>{t('Open charts')}</strong>
                <span>{t('See D1, D9, D10, and more.')}</span>
              </Link>
              <Link className="kundli-secondary-tool-link" href="/dashboard/timeline">
                <strong>{t('Timing map')}</strong>
                <span>{t('Dasha, Sade Sati, and yearly timing.')}</span>
              </Link>
              <Link className="kundli-secondary-tool-link" href="/dashboard/report">
                <strong>{t('Create report')}</strong>
                <span>{t('Make a free or premium PDF.')}</span>
              </Link>
              <Link className="kundli-secondary-tool-link" href="/dashboard/remedies">
                <strong>{t('Remedies')}</strong>
                <span>{t('Get karma-based practices.')}</span>
              </Link>
            </div>
          </details>
        </div>
      </div>

      <WebDestinyPassportCard passport={composeDestinyPassport(kundli)} />
    </section>
  );
}

function KundliRouteHeader({
  editingKundliName,
  kundli,
  labels,
}: {
  editingKundliName?: string;
  kundli?: KundliData;
  labels: KundliWizardCopy;
}): React.JSX.Element {
  const isEditing = Boolean(editingKundliName);
  const isReady = Boolean(kundli && !editingKundliName);

  return (
    <section className="page-heading compact kundli-route-heading">
      <div className="section-title">
        {isEditing
          ? labels.reviewSavedKundliSection
          : isReady
          ? labels.activeKundliSection
          : labels.kundliSetupSection}
      </div>
      <h1 className="gradient-text">
        {isEditing
          ? labels.reviewSavedKundliHeading(editingKundliName ?? '')
          : isReady
          ? kundli?.birthDetails.name
            ? labels.activeKundliHeading(kundli.birthDetails.name)
            : labels.activeKundliGenericHeading
          : labels.createKundliHeading}
      </h1>
      <p>
        {isEditing
          ? labels.reviewSavedKundliBody
          : isReady
          ? labels.activeKundliBody
          : labels.createKundliBody}
      </p>
      <details className="info-drawer">
        <summary>
          <span>
            {isEditing
              ? labels.updateDrawerTitle
              : isReady
              ? labels.trustDrawerTitle
              : labels.creationDrawerTitle}
          </span>
          <strong>{labels.openLabel}</strong>
        </summary>
        <p>
          {isEditing
            ? labels.updateDrawerBody
            : isReady
            ? labels.trustDrawerBody
            : labels.creationDrawerBody}
        </p>
      </details>
    </section>
  );
}

function KundliProofStrip({
  birthDetails,
  creationNote,
  labels,
}: {
  birthDetails?: BirthDetails;
  creationNote: CreationNote;
  labels: KundliWizardCopy;
}): React.JSX.Element {
  return (
    <div className="kundli-proof-strip">
      <div>
        <span>{labels.birthPlaceLabel}</span>
        <strong>{birthDetails?.place ?? labels.matchedCitySelectedLabel}</strong>
        <small>{birthDetails?.timezone ?? labels.timezoneLockedLabel}</small>
      </div>
      <div>
        <span>{labels.timeBasisLabel}</span>
        <strong>
          {creationNote.mode === 'corrected'
            ? labels.probableCorrectedTimeLabel(creationNote.probableTime)
            : isRectifiedBirthDetails(birthDetails)
            ? labels.savedRectifiedTimeLabel(birthDetails?.time ?? '')
            : labels.confirmedEnteredTimeLabel(birthDetails?.time ?? '')}
        </strong>
        <small>
          {creationNote.mode === 'corrected'
            ? labels.originalEntryLabel(creationNote.originalTime)
            : isRectifiedBirthDetails(birthDetails)
            ? labels.savedRectifiedNote
            : labels.noCorrectionAppliedLabel}
        </small>
      </div>
      <div>
        <span>{labels.chartMethodLabel}</span>
        <strong>{labels.coreVedicGrahasFirstLabel}</strong>
        <small>{labels.advancedRefinementsSecondaryLabel}</small>
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
  labels,
  kundli,
  kundliId,
}: {
  birthDetails?: BirthDetails;
  chart: ChartData;
  creationNote: CreationNote;
  createdChartRef: RefObject<HTMLElement | null>;
  labels: KundliWizardCopy;
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
        <div className="section-title">{labels.kundliCreatedSection}</div>
        <h2>{labels.createdKundliReadyHeading}</h2>
        {creationNote.mode === 'corrected' ? (
          <p>{labels.createdKundliCorrectedBody(
            creationNote.probableTime,
            creationNote.originalTime,
          )}</p>
        ) : (
          <p>{labels.createdKundliEnteredBody}</p>
        )}
      </div>
      <KundliProofStrip
        birthDetails={birthDetails}
        creationNote={creationNote}
        labels={labels}
      />
      <div className="kundli-created-chart-full">
        <WebKundliChart
          animationSurface="creation"
          birthDetails={birthDetails}
          centerLabel={labels.createdKundliChartLabel}
          chart={chart}
          kundli={kundli}
          kundliId={kundliId}
          sectionTitle={labels.kundliCreatedSection}
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

  const cityStateCountry = [place.city, place.state, place.country]
    .filter(Boolean)
    .join(', ');
  const cityCountry = [place.city, place.country].filter(Boolean).join(', ');
  const candidateLabels = [
    place.city,
    place.label,
    place.place,
    cityStateCountry,
    cityCountry,
    getBirthPlaceLabel(place),
    ...(place.aliases ?? []),
  ];

  return candidateLabels
    .filter(Boolean)
    .map(term => normalizeBirthPlaceLabel(term))
    .some(term => term === normalizedQuery);
}

function findSettledBirthPlaceCandidate(
  places: WebBirthPlace[],
  query?: string,
): WebBirthPlace | undefined {
  const exactMatch = places.find(place =>
    isExactBirthPlaceSelection(place, query),
  );

  if (exactMatch) {
    return exactMatch;
  }

  if (places.length !== 1) {
    return undefined;
  }

  const normalizedQuery = normalizeBirthPlaceLabel(query);

  if (normalizedQuery.length < 4) {
    return undefined;
  }

  const [onlyPlace] = places;
  const primaryNames = [
    onlyPlace.city,
    onlyPlace.label.split(',')[0],
    onlyPlace.place.split(',')[0],
  ]
    .filter(Boolean)
    .map(term => normalizeBirthPlaceLabel(term));

  return primaryNames.some(term => term === normalizedQuery)
    ? onlyPlace
    : undefined;
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
  activeKundliBody: string;
  activeKundliAskPrompt: string;
  activeKundliGenericHeading: string;
  activeKundliHeading: (name: string) => string;
  activeKundliPriorityCopy: string;
  activeKundliSection: string;
  advancedRefinementsSecondaryLabel: string;
  askPredictaFirstLabel: string;
  askPredictaLabel: string;
  birthDateLabel: string;
  birthPlaceHelp: string;
  birthPlaceChangeLabel: string;
  birthPlaceLabel: string;
  birthPlacePlaceholder: string;
  birthPlaceRequiredError: string;
  birthTimeLabel: string;
  birthTimeApproximate: string;
  calculating: string;
  chartFoundationDrawerBody: string;
  chartFoundationHeading: string;
  chartMethodLabel: string;
  continueLabel: string;
  confirmedEnteredTimeLabel: (time: string) => string;
  coreVedicGrahasFirstLabel: string;
  createAnotherBirthDetailsBody: string;
  createAnotherKundli: string;
  createAnotherKundliStep: string;
  createBirthDetailsBody: string;
  createKundliBody: string;
  createKundliHeading: string;
  createKundliStep: string;
  creationDrawerBody: string;
  creationDrawerTitle: string;
  createdKundliAskPrompt: string;
  createdKundliChartLabel: string;
  createdKundliCorrectedBody: (
    probableTime: string,
    originalTime: string,
  ) => string;
  createdKundliEnteredBody: string;
  createdKundliReadyHeading: string;
  dateOfBirthLabel: string;
  editBirthDetailsBody: string;
  editSavedKundli: string;
  enterBirthDetails: string;
  fillExample: string;
  freeLimitError: string;
  reviewBirthDetails: (name: string) => string;
  guestLimitError: string;
  guestLimitTitle: string;
  kundliCreatedSection: string;
  lifeChapterLabel: string;
  matchedCitySelectedLabel: string;
  moonPatternLabel: string;
  nextStepSection: string;
  noCorrectionAppliedLabel: string;
  originalEntryLabel: (time: string) => string;
  premiumDailySoftLimitError: string;
  probableCorrectedTimeLabel: (time: string) => string;
  relationshipHelp: string;
  relationshipLabel: string;
  relationshipPlaceholder: string;
  relationshipRequiredError: string;
  rectifiedTimeLabel: string;
  requiredBirthDetailsError: string;
  reviewSavedKundliBody: string;
  reviewSavedKundliHeading: (name: string) => string;
  reviewSavedKundliSection: string;
  kundliSetupSection: string;
  nameLabel: string;
  namePlaceholder: string;
  openLabel: string;
  risingSignLabel: string;
  savedRectifiedNote: string;
  savedRectifiedTimeLabel: (time: string) => string;
  simpleSummarySection: string;
  startPredictaFirstBody: string;
  startPredictaFirstHeading: string;
  timeBasisLabel: string;
  timezoneLockedLabel: string;
  trustDrawerBody: string;
  trustDrawerTitle: string;
  updateDrawerBody: string;
  updateDrawerTitle: string;
  whatThisMeansTitle: string;
};

const KUNDLI_WIZARD_COPY: Record<SupportedLanguage, KundliWizardCopy> = {
  en: {
    activeKundliBody:
      'Start from one guided reading, then move deeper into charts, timing, reports, or remedies.',
    activeKundliAskPrompt:
      'Use this active Kundli and tell me what I should look at first today.',
    activeKundliGenericHeading: 'Your Kundli is ready.',
    activeKundliHeading: name => `${name} Kundli is ready.`,
    activeKundliPriorityCopy:
      'Start with one guided reading first. The chart below keeps the core Vedic grahas in front and keeps supporting refinements secondary.',
    activeKundliSection: 'ACTIVE KUNDLI',
    advancedRefinementsSecondaryLabel:
      'Advanced refinements stay secondary on the first reading',
    askPredictaFirstLabel: 'Ask Predicta first',
    askPredictaLabel: 'Ask Predicta',
    birthDateLabel: 'Birth date',
    birthPlaceHelp:
      'Select the matching city so the chart uses the right timezone.',
    birthPlaceChangeLabel: 'Change',
    birthPlaceLabel: 'Birth place',
    birthPlacePlaceholder: 'Start typing city, state, country',
    birthPlaceRequiredError:
      'Choose a matching birth place from the suggestions so Predicta can use the correct timezone and coordinates.',
    birthTimeLabel: 'Birth time',
    birthTimeApproximate: 'Birth time is approximate',
    calculating: 'Calculating...',
    chartFoundationDrawerBody:
      'Rising sign means your starting style. Moon sign means your emotional pattern. Dasha means the current life chapter.',
    chartFoundationHeading: 'Your chart foundation.',
    chartMethodLabel: 'Chart method',
    continueLabel: 'Continue',
    confirmedEnteredTimeLabel: time =>
      `Confirmed entered time ${time}`.trim(),
    coreVedicGrahasFirstLabel: 'Core Vedic grahas first',
    createAnotherBirthDetailsBody:
      'Your active Kundli stays above. Use this only when you want to create another chart.',
    createAnotherKundli: 'Create another Kundli only when needed.',
    createAnotherKundliStep: 'CREATE ANOTHER KUNDLI',
    createBirthDetailsBody:
      'Predicta needs only three things first: date, time, and place.',
    createKundliBody:
      'Match the birth place, confirm the timezone, and review the final birth details before Predicta calculates the chart.',
    createKundliHeading: 'Create your Kundli carefully.',
    createKundliStep: 'STEP 1 · CREATE KUNDLI',
    creationDrawerBody:
      'Predicta matches the selected birth place to coordinates and timezone, asks for confirmation before calculation, and then moves you into an active-reading state instead of leaving you inside a setup-only page.',
    creationDrawerTitle: 'What happens after creation',
    createdKundliAskPrompt:
      'Use my newly created Kundli and tell me what I should look at first today.',
    createdKundliChartLabel: 'Created Kundli',
    createdKundliCorrectedBody: (probableTime, originalTime) =>
      `This Kundli uses a probable corrected birth time of ${probableTime}. Original entered time: ${originalTime}.`,
    createdKundliEnteredBody:
      'This Kundli uses the birth time you confirmed. No birth-time recalculation was applied.',
    createdKundliReadyHeading: 'Your Kundli is ready.',
    dateOfBirthLabel: 'Date of birth',
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
    kundliCreatedSection: 'KUNDLI CREATED',
    lifeChapterLabel: 'Life chapter',
    matchedCitySelectedLabel: 'Matched city selected',
    moonPatternLabel: 'Moon pattern',
    nextStepSection: 'NEXT STEP',
    noCorrectionAppliedLabel: 'No correction layer was applied',
    originalEntryLabel: time => `Original entry ${time}`,
    premiumDailySoftLimitError:
      'You have created many Kundlis today. Existing Kundlis still open normally; please pause and try another new Kundli later.',
    probableCorrectedTimeLabel: time => `Probable corrected time ${time}`,
    relationshipHelp:
      'Choose how this saved profile relates to you. Your main profile stays Self and does not need this field.',
    relationshipLabel: 'Relationship to you',
    relationshipPlaceholder: 'Select relationship',
    relationshipRequiredError:
      'Select how this saved profile is related to you before creating or updating it.',
    rectifiedTimeLabel: 'Rectified time',
    requiredBirthDetailsError:
      'Please fill name, birth date, and birth time first.',
    reviewSavedKundliBody:
      'Any change to birth date, time, or place recalculates the chart. Confirm only after the details look exact.',
    reviewSavedKundliHeading: name =>
      `Review ${name}'s birth details carefully.`,
    reviewSavedKundliSection: 'REVIEW SAVED KUNDLI',
    reviewBirthDetails: name => `Review ${name}'s birth details.`,
    kundliSetupSection: 'KUNDLI SETUP',
    nameLabel: 'Name',
    namePlaceholder: 'Your name',
    openLabel: 'Open',
    risingSignLabel: 'Rising sign',
    savedRectifiedNote:
      'This saved Kundli already carries a rectified-time note',
    savedRectifiedTimeLabel: time => `Saved rectified time ${time}`.trim(),
    simpleSummarySection: 'SIMPLE SUMMARY',
    startPredictaFirstBody:
      'One guided reading is the fastest way to turn this chart into a clear starting point. Open the deeper tools only after that first read.',
    startPredictaFirstHeading: 'Start with Predicta first.',
    timeBasisLabel: 'Time basis',
    timezoneLockedLabel: 'Timezone locked before calculation',
    trustDrawerBody:
      'The chart uses the matched place, coordinates, and timezone from the selected city. The primary Vedic view keeps core grahas first and moves supporting refinements into a secondary layer.',
    trustDrawerTitle: 'Why this chart is trustworthy',
    updateDrawerBody:
      'Updating a saved Kundli recalculates the chart from the edited details. Save as new only when you intentionally want two separate records.',
    updateDrawerTitle: 'How updates work',
    whatThisMeansTitle: 'What this means',
  },
  hi: {
    activeKundliBody: getNativeCopy("kundliWizard.activeKundliBody.hi"),
    activeKundliAskPrompt: getNativeCopy("kundliWizard.activeKundliAskPrompt.hi"),
    activeKundliGenericHeading: getNativeCopy("kundliWizard.activeKundliGenericHeading.hi"),
    activeKundliHeading: name => formatNativeCopy("kundliWizard.activeKundliHeading.hi", [name]),
    activeKundliPriorityCopy: getNativeCopy("kundliWizard.activeKundliPriorityCopy.hi"),
    activeKundliSection: getNativeCopy("kundliWizard.activeKundliSection.hi"),
    advancedRefinementsSecondaryLabel: getNativeCopy("kundliWizard.advancedRefinementsSecondaryLabel.hi"),
    askPredictaFirstLabel: getNativeCopy("kundliWizard.askPredictaFirstLabel.hi"),
    askPredictaLabel: getNativeCopy("kundliWizard.askPredictaLabel.hi"),
    birthDateLabel: getNativeCopy("kundliWizard.birthDateLabel.hi"),
    birthPlaceHelp: getNativeCopy("kundliWizard.birthPlaceHelp.hi"),
    birthPlaceChangeLabel: getNativeCopy("kundliWizard.birthPlaceChangeLabel.hi"),
    birthPlaceLabel: getNativeCopy("kundliWizard.birthPlaceLabel.hi"),
    birthPlacePlaceholder: getNativeCopy("kundliWizard.birthPlacePlaceholder.hi"),
    birthPlaceRequiredError: getNativeCopy("kundliWizard.birthPlaceRequiredError.hi"),
    birthTimeLabel: getNativeCopy("kundliWizard.birthTimeLabel.hi"),
    birthTimeApproximate: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.abe190eefa"),
    calculating: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.6c8fdc8295"),
    chartFoundationDrawerBody: getNativeCopy("kundliWizard.chartFoundationDrawerBody.hi"),
    chartFoundationHeading: getNativeCopy("kundliWizard.chartFoundationHeading.hi"),
    chartMethodLabel: getNativeCopy("kundliWizard.chartMethodLabel.hi"),
    continueLabel: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.aa9a542091"),
    confirmedEnteredTimeLabel: time => formatNativeCopy("kundliWizard.confirmedEnteredTimeLabel.hi", [time]),
    coreVedicGrahasFirstLabel: getNativeCopy("kundliWizard.coreVedicGrahasFirstLabel.hi"),
    createAnotherBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.04d60c154e"),
    createAnotherKundli: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.9524ee86a7"),
    createAnotherKundliStep: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.72bfdc185c"),
    createBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.bb01300395"),
    createKundliBody: getNativeCopy("kundliWizard.createKundliBody.hi"),
    createKundliHeading: getNativeCopy("kundliWizard.createKundliHeading.hi"),
    createKundliStep: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.3f1201483c"),
    creationDrawerBody: getNativeCopy("kundliWizard.creationDrawerBody.hi"),
    creationDrawerTitle: getNativeCopy("kundliWizard.creationDrawerTitle.hi"),
    createdKundliAskPrompt: getNativeCopy("kundliWizard.createdKundliAskPrompt.hi"),
    createdKundliChartLabel: getNativeCopy("kundliWizard.createdKundliChartLabel.hi"),
    createdKundliCorrectedBody: (probableTime, originalTime) =>
      formatNativeCopy("kundliWizard.createdKundliCorrectedBody.hi", [probableTime, originalTime]),
    createdKundliEnteredBody: getNativeCopy("kundliWizard.createdKundliEnteredBody.hi"),
    createdKundliReadyHeading: getNativeCopy("kundliWizard.createdKundliReadyHeading.hi"),
    dateOfBirthLabel: getNativeCopy("kundliWizard.dateOfBirthLabel.hi"),
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
    kundliCreatedSection: getNativeCopy("kundliWizard.kundliCreatedSection.hi"),
    lifeChapterLabel: getNativeCopy("kundliWizard.lifeChapterLabel.hi"),
    matchedCitySelectedLabel: getNativeCopy("kundliWizard.matchedCitySelectedLabel.hi"),
    moonPatternLabel: getNativeCopy("kundliWizard.moonPatternLabel.hi"),
    nextStepSection: getNativeCopy("kundliWizard.nextStepSection.hi"),
    noCorrectionAppliedLabel: getNativeCopy("kundliWizard.noCorrectionAppliedLabel.hi"),
    originalEntryLabel: time => formatNativeCopy("kundliWizard.originalEntryLabel.hi", [time]),
    premiumDailySoftLimitError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.4cdc4132e7"),
    probableCorrectedTimeLabel: time => formatNativeCopy("kundliWizard.probableCorrectedTimeLabel.hi", [time]),
    relationshipHelp:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.ac5916328d"),
    relationshipLabel: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.920f52e152"),
    relationshipPlaceholder: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.06da9e136b"),
    relationshipRequiredError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.fa7f447f5e"),
    rectifiedTimeLabel: getNativeCopy("kundliWizard.rectifiedTimeLabel.hi"),
    requiredBirthDetailsError: getNativeCopy("kundliWizard.requiredBirthDetailsError.hi"),
    reviewSavedKundliBody: getNativeCopy("kundliWizard.reviewSavedKundliBody.hi"),
    reviewSavedKundliHeading: name => formatNativeCopy("kundliWizard.reviewSavedKundliHeading.hi", [name]),
    reviewSavedKundliSection: getNativeCopy("kundliWizard.reviewSavedKundliSection.hi"),
    reviewBirthDetails: name => formatNativeCopy("native.apps.web.components.WebKundliWizard.tsx.78c98d45b0", [name]),
    kundliSetupSection: getNativeCopy("kundliWizard.kundliSetupSection.hi"),
    nameLabel: getNativeCopy("kundliWizard.nameLabel.hi"),
    namePlaceholder: getNativeCopy("kundliWizard.namePlaceholder.hi"),
    openLabel: getNativeCopy("kundliWizard.openLabel.hi"),
    risingSignLabel: getNativeCopy("kundliWizard.risingSignLabel.hi"),
    savedRectifiedNote: getNativeCopy("kundliWizard.savedRectifiedNote.hi"),
    savedRectifiedTimeLabel: time => formatNativeCopy("kundliWizard.savedRectifiedTimeLabel.hi", [time]),
    simpleSummarySection: getNativeCopy("kundliWizard.simpleSummarySection.hi"),
    startPredictaFirstBody: getNativeCopy("kundliWizard.startPredictaFirstBody.hi"),
    startPredictaFirstHeading: getNativeCopy("kundliWizard.startPredictaFirstHeading.hi"),
    timeBasisLabel: getNativeCopy("kundliWizard.timeBasisLabel.hi"),
    timezoneLockedLabel: getNativeCopy("kundliWizard.timezoneLockedLabel.hi"),
    trustDrawerBody: getNativeCopy("kundliWizard.trustDrawerBody.hi"),
    trustDrawerTitle: getNativeCopy("kundliWizard.trustDrawerTitle.hi"),
    updateDrawerBody: getNativeCopy("kundliWizard.updateDrawerBody.hi"),
    updateDrawerTitle: getNativeCopy("kundliWizard.updateDrawerTitle.hi"),
    whatThisMeansTitle: getNativeCopy("kundliWizard.whatThisMeansTitle.hi"),
  },
  gu: {
    activeKundliBody: getNativeCopy("kundliWizard.activeKundliBody.gu"),
    activeKundliAskPrompt: getNativeCopy("kundliWizard.activeKundliAskPrompt.gu"),
    activeKundliGenericHeading: getNativeCopy("kundliWizard.activeKundliGenericHeading.gu"),
    activeKundliHeading: name => formatNativeCopy("kundliWizard.activeKundliHeading.gu", [name]),
    activeKundliPriorityCopy: getNativeCopy("kundliWizard.activeKundliPriorityCopy.gu"),
    activeKundliSection: getNativeCopy("kundliWizard.activeKundliSection.gu"),
    advancedRefinementsSecondaryLabel: getNativeCopy("kundliWizard.advancedRefinementsSecondaryLabel.gu"),
    askPredictaFirstLabel: getNativeCopy("kundliWizard.askPredictaFirstLabel.gu"),
    askPredictaLabel: getNativeCopy("kundliWizard.askPredictaLabel.gu"),
    birthDateLabel: getNativeCopy("kundliWizard.birthDateLabel.gu"),
    birthPlaceHelp: getNativeCopy("kundliWizard.birthPlaceHelp.gu"),
    birthPlaceChangeLabel: getNativeCopy("kundliWizard.birthPlaceChangeLabel.gu"),
    birthPlaceLabel: getNativeCopy("kundliWizard.birthPlaceLabel.gu"),
    birthPlacePlaceholder: getNativeCopy("kundliWizard.birthPlacePlaceholder.gu"),
    birthPlaceRequiredError: getNativeCopy("kundliWizard.birthPlaceRequiredError.gu"),
    birthTimeLabel: getNativeCopy("kundliWizard.birthTimeLabel.gu"),
    birthTimeApproximate: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.f92bd5d28b"),
    calculating: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.38007d95c3"),
    chartFoundationDrawerBody: getNativeCopy("kundliWizard.chartFoundationDrawerBody.gu"),
    chartFoundationHeading: getNativeCopy("kundliWizard.chartFoundationHeading.gu"),
    chartMethodLabel: getNativeCopy("kundliWizard.chartMethodLabel.gu"),
    continueLabel: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.9e3014236d"),
    confirmedEnteredTimeLabel: time => formatNativeCopy("kundliWizard.confirmedEnteredTimeLabel.gu", [time]),
    coreVedicGrahasFirstLabel: getNativeCopy("kundliWizard.coreVedicGrahasFirstLabel.gu"),
    createAnotherBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.b2d20cc0da"),
    createAnotherKundli: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.1beb027425"),
    createAnotherKundliStep: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.df15299f0b"),
    createBirthDetailsBody:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.3daa0a51c7"),
    createKundliBody: getNativeCopy("kundliWizard.createKundliBody.gu"),
    createKundliHeading: getNativeCopy("kundliWizard.createKundliHeading.gu"),
    createKundliStep: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.7fa5156756"),
    creationDrawerBody: getNativeCopy("kundliWizard.creationDrawerBody.gu"),
    creationDrawerTitle: getNativeCopy("kundliWizard.creationDrawerTitle.gu"),
    createdKundliAskPrompt: getNativeCopy("kundliWizard.createdKundliAskPrompt.gu"),
    createdKundliChartLabel: getNativeCopy("kundliWizard.createdKundliChartLabel.gu"),
    createdKundliCorrectedBody: (probableTime, originalTime) =>
      formatNativeCopy("kundliWizard.createdKundliCorrectedBody.gu", [probableTime, originalTime]),
    createdKundliEnteredBody: getNativeCopy("kundliWizard.createdKundliEnteredBody.gu"),
    createdKundliReadyHeading: getNativeCopy("kundliWizard.createdKundliReadyHeading.gu"),
    dateOfBirthLabel: getNativeCopy("kundliWizard.dateOfBirthLabel.gu"),
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
    kundliCreatedSection: getNativeCopy("kundliWizard.kundliCreatedSection.gu"),
    lifeChapterLabel: getNativeCopy("kundliWizard.lifeChapterLabel.gu"),
    matchedCitySelectedLabel: getNativeCopy("kundliWizard.matchedCitySelectedLabel.gu"),
    moonPatternLabel: getNativeCopy("kundliWizard.moonPatternLabel.gu"),
    nextStepSection: getNativeCopy("kundliWizard.nextStepSection.gu"),
    noCorrectionAppliedLabel: getNativeCopy("kundliWizard.noCorrectionAppliedLabel.gu"),
    originalEntryLabel: time => formatNativeCopy("kundliWizard.originalEntryLabel.gu", [time]),
    premiumDailySoftLimitError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.df109a4a8f"),
    probableCorrectedTimeLabel: time => formatNativeCopy("kundliWizard.probableCorrectedTimeLabel.gu", [time]),
    relationshipHelp:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.5071b4480b"),
    relationshipLabel: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.142d267dd0"),
    relationshipPlaceholder: getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.9c93179b60"),
    relationshipRequiredError:
      getNativeCopy("native.apps.web.components.WebKundliWizard.tsx.d369f850b5"),
    rectifiedTimeLabel: getNativeCopy("kundliWizard.rectifiedTimeLabel.gu"),
    requiredBirthDetailsError: getNativeCopy("kundliWizard.requiredBirthDetailsError.gu"),
    reviewSavedKundliBody: getNativeCopy("kundliWizard.reviewSavedKundliBody.gu"),
    reviewSavedKundliHeading: name => formatNativeCopy("kundliWizard.reviewSavedKundliHeading.gu", [name]),
    reviewSavedKundliSection: getNativeCopy("kundliWizard.reviewSavedKundliSection.gu"),
    reviewBirthDetails: name => formatNativeCopy("native.apps.web.components.WebKundliWizard.tsx.4b0b53bf8b", [name]),
    kundliSetupSection: getNativeCopy("kundliWizard.kundliSetupSection.gu"),
    nameLabel: getNativeCopy("kundliWizard.nameLabel.gu"),
    namePlaceholder: getNativeCopy("kundliWizard.namePlaceholder.gu"),
    openLabel: getNativeCopy("kundliWizard.openLabel.gu"),
    risingSignLabel: getNativeCopy("kundliWizard.risingSignLabel.gu"),
    savedRectifiedNote: getNativeCopy("kundliWizard.savedRectifiedNote.gu"),
    savedRectifiedTimeLabel: time => formatNativeCopy("kundliWizard.savedRectifiedTimeLabel.gu", [time]),
    simpleSummarySection: getNativeCopy("kundliWizard.simpleSummarySection.gu"),
    startPredictaFirstBody: getNativeCopy("kundliWizard.startPredictaFirstBody.gu"),
    startPredictaFirstHeading: getNativeCopy("kundliWizard.startPredictaFirstHeading.gu"),
    timeBasisLabel: getNativeCopy("kundliWizard.timeBasisLabel.gu"),
    timezoneLockedLabel: getNativeCopy("kundliWizard.timezoneLockedLabel.gu"),
    trustDrawerBody: getNativeCopy("kundliWizard.trustDrawerBody.gu"),
    trustDrawerTitle: getNativeCopy("kundliWizard.trustDrawerTitle.gu"),
    updateDrawerBody: getNativeCopy("kundliWizard.updateDrawerBody.gu"),
    updateDrawerTitle: getNativeCopy("kundliWizard.updateDrawerTitle.gu"),
    whatThisMeansTitle: getNativeCopy("kundliWizard.whatThisMeansTitle.gu"),
  },
};
