import { proxyAstroApiRequest, readJsonBody } from '../../../lib/astro-api';
import type { BirthDetailsExtractionResult } from '@pridicta/types';

export async function POST(request: Request): Promise<Response> {
  const json = await readJsonBody(request);

  if (!json.ok) {
    return json.response;
  }

  const payload = json.body as { text?: unknown };
  const text = String(payload.text ?? '');
  const rules = extractBirthDetailsWithRules(text);

  try {
    const upstream = await proxyAstroApiRequest(
      '/extract-birth-details',
      payload,
    );

    if (upstream.ok) {
      const aiResult = (await upstream.json()) as BirthDetailsExtractionResult;
      return Response.json(mergeExtractionResults(rules, aiResult));
    }
  } catch {
    // Deterministic parsing keeps chat intake usable when local AI services are unavailable.
  }

  return Response.json(rules);
}

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

function extractBirthDetailsWithRules(
  text: string,
): BirthDetailsExtractionResult {
  const extracted: BirthDetailsExtractionResult['extracted'] = {};
  const name = extractName(text);
  const date = extractDate(text);
  const time = extractTime(text);
  const placeText = extractPlace(text);
  const ambiguities: BirthDetailsExtractionResult['ambiguities'] = [];

  if (name) {
    extracted.name = name;
  }

  if (date) {
    extracted.date = date;
  }

  if (time) {
    extracted.time = time.time;
    extracted.meridiem = time.meridiem;

    if (!time.meridiem && time.wasTwelveHour) {
      ambiguities.push({
        field: 'time',
        issue: 'The time needs AM or PM confirmation.',
        options: [`${time.original} AM`, `${time.original} PM`],
      });
    }
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

  if (!extracted.date) {
    missingFields.push('date');
  }
  if (!extracted.time) {
    missingFields.push('time');
  } else if (ambiguities.length > 0) {
    missingFields.push('am_pm');
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
  const iso = input.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/);

  if (iso) {
    return formatDateParts(iso[1], iso[2], iso[3]);
  }

  const numeric = input.match(
    /\b(?:dob|date\s+of\s+birth|birth\s+date|born)?\s*:?\s*(\d{1,2})(?:st|nd|rd|th)?[-/.](\d{1,2})[-/.](\d{2,4})\b/i,
  );

  if (numeric) {
    const first = Number(numeric[1]);
    const second = Number(numeric[2]);
    const year = normalizeYear(numeric[3]);

    if (first > 12) {
      return formatDateParts(year, numeric[2], numeric[1]);
    }
    if (second > 12) {
      return formatDateParts(year, numeric[1], numeric[2]);
    }
    return formatDateParts(year, numeric[2], numeric[1]);
  }

  const dayMonth = input.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?(?:\s+of)?\s+([A-Za-z]{3,9}),?\s+(\d{2,4})\b/i,
  );

  if (dayMonth) {
    const month = MONTHS[dayMonth[2].toLowerCase()];

    if (month) {
      return formatDateParts(normalizeYear(dayMonth[3]), month, dayMonth[1]);
    }
  }

  const monthDay = input.match(
    /\b([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{2,4})\b/i,
  );

  if (monthDay) {
    const month = MONTHS[monthDay[1].toLowerCase()];

    if (month) {
      return formatDateParts(normalizeYear(monthDay[3]), month, monthDay[2]);
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
  const match =
    input.match(
      /\b(?:birth\s*time|time|born\s+at|at)\s*:?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|morning|evening|night)?\b/i,
    ) ??
    input.match(
      /\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.|morning|evening|night)?\b/i,
    );

  if (!match) {
    return undefined;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? '00');
  const meridiemText = match[3]?.toLowerCase().replaceAll('.', '');
  const meridiem =
    meridiemText === 'am' || meridiemText === 'morning'
      ? 'AM'
      : meridiemText === 'pm' ||
        meridiemText === 'evening' ||
        meridiemText === 'night'
      ? 'PM'
      : undefined;
  const wasTwelveHour = hour <= 12;

  if (meridiem === 'PM' && hour < 12) {
    hour += 12;
  }
  if (meridiem === 'AM' && hour === 12) {
    hour = 0;
  }

  if (hour > 23 || minute > 59) {
    return undefined;
  }

  return {
    meridiem,
    original: match[0].trim(),
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
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
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(
    2,
    '0',
  )}`;
}

function normalizeYear(year: string): string {
  if (year.length === 4) {
    return year;
  }

  return Number(year) > 30 ? `19${year}` : `20${year}`;
}
