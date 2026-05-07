import { env } from '../../config/env';
import type { BirthDetailsExtractionResult } from '../../types/astrology';
import { findBirthPlaceCandidates } from '../location/locationService';

const MONTHS: Record<string, string> = {
  apr: '04',
  april: '04',
  aug: '08',
  august: '08',
  dec: '12',
  december: '12',
  feb: '02',
  february: '02',
  jan: '01',
  january: '01',
  jul: '07',
  july: '07',
  jun: '06',
  june: '06',
  mar: '03',
  march: '03',
  may: '05',
  nov: '11',
  november: '11',
  oct: '10',
  october: '10',
  sep: '09',
  sept: '09',
  september: '09',
};

export async function extractBirthDetailsFromText(
  input: string,
): Promise<BirthDetailsExtractionResult> {
  const aiResult = await extractWithBackendAI(input);
  const rulesResult = extractWithRules(input);
  const baseResult = aiResult
    ? mergeExtractionResults(rulesResult, aiResult)
    : rulesResult;
  const placeText =
    baseResult.extracted.city ?? baseResult.extracted.placeText ?? '';

  if (placeText) {
    const candidates = await findBirthPlaceCandidates(placeText);

    if (candidates.length === 1) {
      baseResult.extracted.city = candidates[0].city;
      baseResult.extracted.state = candidates[0].state;
      baseResult.extracted.country = candidates[0].country;
      baseResult.missingFields = baseResult.missingFields.filter(
        field => !['birth_place', 'country', 'state', 'city'].includes(field),
      );
    } else if (candidates.length > 1) {
      baseResult.ambiguities.push({
        field: 'birth_place',
        issue: 'This birth place could refer to more than one location.',
        options: candidates.map(candidate =>
          [candidate.city, candidate.state, candidate.country]
            .filter(Boolean)
            .join(', '),
        ),
      });
    }
  }

  return normalizeExtractionResult(baseResult);
}

async function extractWithBackendAI(
  input: string,
): Promise<BirthDetailsExtractionResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);
  const response = await fetch(`${env.astrologyApiUrl}/extract-birth-details`, {
    body: JSON.stringify({ text: input }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal: controller.signal,
  }).catch(() => null);
  clearTimeout(timeout);

  if (!response?.ok) {
    return null;
  }

  try {
    return (await response.json()) as BirthDetailsExtractionResult;
  } catch {
    return null;
  }
}

export function extractWithRules(input: string): BirthDetailsExtractionResult {
  const extracted: BirthDetailsExtractionResult['extracted'] = {};
  const ambiguities: BirthDetailsExtractionResult['ambiguities'] = [];
  const name = extractName(input);
  const date = extractDate(input);
  const time = extractTime(input);
  const placeText = extractPlace(input);

  if (name) {
    extracted.name = name;
  }

  if (date) {
    extracted.date = date;
  }

  if (time?.time) {
    extracted.time = time.time;
    extracted.meridiem = time.meridiem;
  }

  if (placeText) {
    const parts = placeText
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    extracted.placeText = placeText;
    extracted.city = parts[0] ?? placeText;
    extracted.state = parts[1];
    extracted.country = parts.length > 2 ? parts[2] : undefined;
  }

  const missingFields: BirthDetailsExtractionResult['missingFields'] = [];

  if (!extracted.name) {
    missingFields.push('name');
  }

  if (!extracted.date) {
    missingFields.push('date');
  }

  if (!extracted.time) {
    missingFields.push('time');
  } else if (!time?.meridiem && time?.wasTwelveHour) {
    missingFields.push('am_pm');
    ambiguities.push({
      field: 'time',
      issue: 'The time needs AM or PM confirmation.',
      options: [`${time.original} AM`, `${time.original} PM`],
    });
  }

  if (!extracted.placeText) {
    missingFields.push('birth_place');
  }

  return {
    ambiguities,
    confidence:
      [extracted.date, extracted.time, extracted.placeText].filter(Boolean)
        .length / 3,
    extracted,
    missingFields,
  };
}

function mergeExtractionResults(
  rules: BirthDetailsExtractionResult,
  aiResult: BirthDetailsExtractionResult,
): BirthDetailsExtractionResult {
  const extracted = {
    ...rules.extracted,
    ...Object.fromEntries(
      Object.entries(aiResult.extracted ?? {}).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
      ),
    ),
  };
  const missing = new Set(aiResult.missingFields ?? rules.missingFields);

  if (extracted.name) {
    missing.delete('name');
  }
  if (extracted.date) {
    missing.delete('date');
  }
  if (extracted.time) {
    missing.delete('time');
  }
  if (extracted.placeText || extracted.city) {
    missing.delete('birth_place');
    missing.delete('country');
    missing.delete('state');
    missing.delete('city');
  }

  return {
    ambiguities: [...(rules.ambiguities ?? []), ...(aiResult.ambiguities ?? [])],
    confidence: Math.max(rules.confidence ?? 0, aiResult.confidence ?? 0),
    extracted,
    missingFields: Array.from(missing),
  };
}

function extractName(input: string): string | undefined {
  const match = input.match(
    /\b(?:name|my\s+name\s+is)\s*(?:is|:)?\s+([A-Za-z][A-Za-z\s.'-]{1,60})(?:\n|,|$)/i,
  );

  return match?.[1]?.replace(/[\s.,]+$/, '').trim();
}

function extractDate(input: string): string | undefined {
  const iso = input.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);

  if (iso) {
    return formatDateParts(iso[1], iso[2], iso[3]);
  }

  const numeric = input.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);

  if (numeric) {
    const year = normalizeYear(numeric[3]);
    return formatDateParts(year, numeric[2], numeric[1]);
  }

  const named = input.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})\b/i);

  if (named) {
    const month = MONTHS[named[2].toLowerCase()];

    if (month) {
      return formatDateParts(normalizeYear(named[3]), month, named[1]);
    }
  }

  return undefined;
}

function extractTime(input: string):
  | {
      meridiem?: 'AM' | 'PM';
      original: string;
      time: string;
      wasTwelveHour: boolean;
    }
  | undefined {
  const time =
    input.match(
      /\b(?:time|born at|birth time is|at)\s+(\d{1,2})(?::(\d{2}))?\s*(?:in the\s+)?(am|pm|morning|evening|night)?\b/i,
    ) ?? input.match(/\b(\d{1,2}):(\d{2})\s*(am|pm|morning|evening|night)?\b/i);

  if (!time) {
    return undefined;
  }

  const original = time[0].trim();
  let hours = Number(time[1]);
  const minutes = Number(time[2] ?? '00');
  const meridiemText =
    time[3]?.toLowerCase() ??
    input.match(/\b(am|pm|morning|evening|night)\b/i)?.[1]?.toLowerCase();
  const meridiem =
    meridiemText === 'am' || meridiemText === 'morning'
      ? 'AM'
      : meridiemText === 'pm' ||
        meridiemText === 'evening' ||
        meridiemText === 'night'
      ? 'PM'
      : undefined;
  const wasTwelveHour = hours <= 12;

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  if (hours > 23 || minutes > 59) {
    return undefined;
  }

  return {
    meridiem,
    original,
    time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0',
    )}`,
    wasTwelveHour,
  };
}

function extractPlace(input: string): string | undefined {
  const match = input.match(
    /\b(?:birth\s*place|birthplace|place|born\s+in|from)\s*(?:is|:)?\s+([A-Za-z][A-Za-z\s.,'-]{1,100})(?:\n|$)/i,
  );

  return match?.[1]?.replace(/[.\s]+$/, '').trim();
}

function formatDateParts(year: string, month: string, day: string): string {
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function normalizeYear(year: string): string {
  if (year.length === 4) {
    return year;
  }

  const numericYear = Number(year);
  return numericYear > 30 ? `19${year}` : `20${year}`;
}

function normalizeExtractionResult(
  result: BirthDetailsExtractionResult,
): BirthDetailsExtractionResult {
  return {
    ambiguities: result.ambiguities ?? [],
    confidence: Math.max(0, Math.min(1, result.confidence ?? 0)),
    extracted: result.extracted ?? {},
    missingFields: Array.from(new Set(result.missingFields ?? [])),
  };
}
