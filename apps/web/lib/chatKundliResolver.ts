import {
  buildBirthDetailsFromResolvedPlace,
  findBirthPlaceCandidates,
  isBirthDetailsSufficientForKundli,
} from '@pridicta/ai';
import type { AstrologyMemory, KundliData } from '@pridicta/types';

type WebKundliResolutionResult = {
  kundli?: KundliData;
  failureReason?: 'ambiguous_place' | 'missing_fields' | 'request_failed';
};

export async function resolveKundliFromChatMemory(input: {
  backendUrl: string;
  fallbackName?: string;
  memory?: AstrologyMemory;
}): Promise<WebKundliResolutionResult> {
  const birthDetails = input.memory?.birthDetails;

  if (!birthDetails || !isBirthDetailsSufficientForKundli(birthDetails)) {
    return {
      failureReason: 'missing_fields',
    };
  }

  if (
    birthDetails?.latitude !== undefined &&
    birthDetails.longitude !== undefined &&
    birthDetails.timezone
  ) {
    return {
      kundli: await requestKundli(input.backendUrl, {
        ...birthDetails,
        name: birthDetails.name?.trim() || input.fallbackName?.trim() || 'Predicta Seeker',
      }),
    };
  }

  const candidates = findBirthPlaceCandidates(birthDetails.place);

  if (candidates.length !== 1) {
    return {
      failureReason: 'ambiguous_place',
    };
  }

  try {
    const resolvedBirthDetails = buildBirthDetailsFromResolvedPlace({
      date: birthDetails.date,
      isTimeApproximate: birthDetails.isTimeApproximate,
      name:
        birthDetails.name?.trim() || input.fallbackName?.trim() || 'Predicta Seeker',
      originalPlaceText: birthDetails.originalPlaceText ?? birthDetails.place,
      resolvedPlace: candidates[0],
      time: birthDetails.time,
    });

    return {
      kundli: await requestKundli(input.backendUrl, resolvedBirthDetails),
    };
  } catch {
    return {
      failureReason: 'request_failed',
    };
  }
}

async function requestKundli(
  backendUrl: string,
  birthDetails: NonNullable<AstrologyMemory['birthDetails']>,
): Promise<KundliData> {
  const response = await fetch(`${backendUrl}/generate-kundli`, {
    body: JSON.stringify(birthDetails),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Kundli generation failed.');
  }

  return (await response.json()) as KundliData;
}
