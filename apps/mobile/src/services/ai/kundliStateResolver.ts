import type {
  BirthDetailsDraft,
  KundliData,
} from '../../types/astrology';
import { generateKundli } from '../astrology/astroEngine';
import {
  buildBirthDetailsFromResolvedPlace,
  findBirthPlaceCandidates,
} from '../location/locationService';

export type KundliResolutionResult = {
  kundli?: KundliData;
  missingFields: Array<'date' | 'time' | 'place'>;
  resolvedPlaceLabel?: string;
};

function resolveDraftPlaceText(draft?: BirthDetailsDraft): string | undefined {
  if (!draft) {
    return undefined;
  }

  return (
    [draft.city, draft.state, draft.country].filter(Boolean).join(', ') ||
    draft.placeText
  );
}

export async function resolveKundliFromDraft(input: {
  draft?: BirthDetailsDraft;
  fallbackName?: string;
}): Promise<KundliResolutionResult> {
  const draft = input.draft;
  const missingFields: Array<'date' | 'time' | 'place'> = [];

  if (!draft?.date) {
    missingFields.push('date');
  }
  if (!draft?.time) {
    missingFields.push('time');
  }

  const placeText = resolveDraftPlaceText(draft);
  if (!placeText) {
    missingFields.push('place');
  }

  if (missingFields.length > 0 || !draft?.date || !draft?.time || !placeText) {
    return {
      missingFields,
    };
  }

  const candidates = await findBirthPlaceCandidates(placeText);
  if (candidates.length !== 1) {
    return {
      missingFields: ['place'],
      resolvedPlaceLabel: placeText,
    };
  }

  const birthDetails = buildBirthDetailsFromResolvedPlace({
    date: draft.date,
    isTimeApproximate: draft.isTimeApproximate,
    name: input.fallbackName?.trim() || 'Predicta Seeker',
    originalPlaceText: draft.placeText,
    resolvedPlace: candidates[0],
    time: draft.time,
  });

  return {
    kundli: await generateKundli(birthDetails),
    missingFields: [],
    resolvedPlaceLabel: birthDetails.place,
  };
}
