import type { KundliData } from '@pridicta/types';

export type KundliEditField = 'date' | 'name' | 'place' | 'time';

export type KundliChatCommand =
  | {
      kind: 'create-new';
    }
  | {
      kind: 'delete';
      targetName?: string;
    }
  | {
      field: KundliEditField;
      kind: 'edit-field';
      value: string;
    }
  | {
      kind: 'generic-edit';
    }
  | {
      kind: 'set-active';
      targetName?: string;
    };

export type KundliCommandDecision =
  | 'cancel'
  | 'delete'
  | 'none'
  | 'save-as-new'
  | 'update-existing';

const KUNDLI_WORD_PATTERN =
  /\b(kundli|kundali|kundly|horoscope|chart|profile|janam\s*kundli)\b/i;

export function detectKundliChatCommand(text: string): KundliChatCommand | undefined {
  const normalized = text.trim();

  if (!normalized) {
    return undefined;
  }

  const lower = normalized.toLowerCase();

  if (isCreateNewKundliText(lower)) {
    return { kind: 'create-new' };
  }

  if (
    /\b(delete|remove|erase)\b/i.test(lower) &&
    KUNDLI_WORD_PATTERN.test(lower)
  ) {
    return {
      kind: 'delete',
      targetName: extractTargetName(normalized),
    };
  }

  if (
    (/\b(use|open|switch|select)\b/i.test(lower) ||
      /\b(set|make)\b.*\b(active|current)\b/i.test(lower)) &&
    KUNDLI_WORD_PATTERN.test(lower)
  ) {
    return {
      kind: 'set-active',
      targetName: extractTargetName(normalized),
    };
  }

  if (
    /\b(edit|update|change|correct|fix|rename|set)\b/i.test(lower) &&
    KUNDLI_WORD_PATTERN.test(lower)
  ) {
    const fieldCommand = detectFieldCommand(normalized);
    return fieldCommand ?? { kind: 'generic-edit' };
  }

  return detectFieldCommand(normalized);
}

export function detectKundliCommandDecision(
  text: string,
): KundliCommandDecision {
  const lower = text.trim().toLowerCase();

  if (!lower) {
    return 'none';
  }

  if (/\b(cancel|stop|never mind|nevermind|no|mat karo|rehne do|raheva do)\b/i.test(lower)) {
    return 'cancel';
  }

  if (
    /\b(save|create|make)\b.*\b(new|copy|separate)\b/i.test(lower) ||
    /\b(new kundli|new profile|save as new)\b/i.test(lower)
  ) {
    return 'save-as-new';
  }

  if (
    /\b(update|change|replace|edit)\b.*\b(existing|current|same)\b/i.test(lower) ||
    /\b(update existing|replace current|same kundli)\b/i.test(lower) ||
    /\b(yes|confirm|proceed|do it)\b.*\b(update|change|replace|edit)\b/i.test(lower) ||
    /\b(update it|change it|replace it|yes update|proceed with update)\b/i.test(lower)
  ) {
    return 'update-existing';
  }

  if (
    /\b(delete|remove)\b.*\b(kundli|profile|chart)\b/i.test(lower) ||
    /\bconfirm delete\b/i.test(lower) ||
    /\b(yes|confirm|proceed|do it)\b.*\b(delete|remove)\b/i.test(lower) ||
    /\b(delete|remove)\b.*\b(it|this|yes|confirm)\b/i.test(lower)
  ) {
    return 'delete';
  }

  return 'none';
}

export function findKundliBySpokenName(
  savedKundlis: KundliData[],
  targetName?: string,
): KundliData | undefined {
  const cleanTarget = normalizeName(targetName);

  if (!cleanTarget) {
    return undefined;
  }

  return savedKundlis.find(kundli => {
    const cleanName = normalizeName(kundli.birthDetails.name);

    return cleanName === cleanTarget || cleanName.includes(cleanTarget);
  });
}

export function normalizeKundliTime(value: string): string | undefined {
  const match = value.match(/\b(\d{1,2})(?::|\.|\s)?(\d{2})?\s*(am|pm)?\b/i);

  if (!match) {
    return undefined;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? '00');
  const meridiem = match[3]?.toLowerCase();

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) {
    return undefined;
  }

  if (meridiem === 'pm' && hour < 12) {
    hour += 12;
  }

  if (meridiem === 'am' && hour === 12) {
    hour = 0;
  }

  if (hour > 23) {
    return undefined;
  }

  return `${hour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}`;
}

export function normalizeKundliDate(value: string): string | undefined {
  const iso = value.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);

  if (iso) {
    return formatDateParts(iso[1], iso[2], iso[3]);
  }

  const slash = value.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);

  if (!slash) {
    return undefined;
  }

  const year = slash[3].length === 2 ? `19${slash[3]}` : slash[3];

  return formatDateParts(year, slash[2], slash[1]);
}

function detectFieldCommand(text: string): KundliChatCommand | undefined {
  const timeMatch = text.match(
    /\b(?:birth\s*time|time)\b\s*(?:to|as|=|:)?\s*([0-9:. ]+\s*(?:am|pm)?)\b/i,
  );
  const normalizedTime = timeMatch
    ? normalizeKundliTime(timeMatch[1])
    : undefined;

  if (normalizedTime) {
    return {
      field: 'time',
      kind: 'edit-field',
      value: normalizedTime,
    };
  }

  const dateMatch = text.match(
    /\b(?:dob|date\s*of\s*birth|birth\s*date|date)\b\s*(?:to|as|=|:)?\s*([0-9/-]{6,10})\b/i,
  );
  const normalizedDate = dateMatch
    ? normalizeKundliDate(dateMatch[1])
    : undefined;

  if (normalizedDate) {
    return {
      field: 'date',
      kind: 'edit-field',
      value: normalizedDate,
    };
  }

  const placeMatch = text.match(
    /\b(?:birth\s*place|birthplace|place|city)\b\s*(?:to|as|=|:)?\s*([a-zA-Z ,.'-]{3,})$/i,
  );

  if (placeMatch?.[1]) {
    return {
      field: 'place',
      kind: 'edit-field',
      value: cleanTrailingWords(placeMatch[1]),
    };
  }

  const nameMatch = text.match(
    /\b(?:name|rename|save\s*this\s*as)\b\s*(?:to|as|=|:)?\s*([a-zA-Z .'-]{2,})$/i,
  );

  if (nameMatch?.[1]) {
    return {
      field: 'name',
      kind: 'edit-field',
      value: cleanTrailingWords(nameMatch[1]),
    };
  }

  return undefined;
}

function extractTargetName(text: string): string | undefined {
  const quoted = text.match(/["']([^"']{2,})["']/);

  if (quoted?.[1]) {
    return quoted[1].trim();
  }

  const named = text.match(/\b(?:for|of|named|called)\s+([a-zA-Z .'-]{2,})/i);

  if (named?.[1]) {
    return cleanTrailingWords(named[1]);
  }

  const direct = text.match(
    /\b(?:delete|remove|use|open|switch|select|set)\s+([a-zA-Z .'-]{2,})\s+(?:kundli|kundali|horoscope|chart|profile)\b/i,
  );

  if (direct?.[1]) {
    return cleanTrailingWords(direct[1]);
  }

  return undefined;
}

function cleanTrailingWords(value: string): string {
  return value
    .replace(/\b(kundli|kundali|horoscope|chart|profile)\b/gi, '')
    .replace(/[.?!]+$/g, '')
    .trim();
}

function formatDateParts(year: string, month: string, day: string): string | undefined {
  const yyyy = Number(year);
  const mm = Number(month);
  const dd = Number(day);

  if (
    Number.isNaN(yyyy) ||
    Number.isNaN(mm) ||
    Number.isNaN(dd) ||
    yyyy < 1900 ||
    mm < 1 ||
    mm > 12 ||
    dd < 1 ||
    dd > 31
  ) {
    return undefined;
  }

  return `${yyyy.toString().padStart(4, '0')}-${mm
    .toString()
    .padStart(2, '0')}-${dd.toString().padStart(2, '0')}`;
}

function isCreateNewKundliText(text: string): boolean {
  return (
    /\b(create|make|start|new|another)\b/i.test(text) &&
    KUNDLI_WORD_PATTERN.test(text)
  );
}

function normalizeName(value?: string): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
