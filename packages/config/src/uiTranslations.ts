import type { SupportedLanguage } from '@pridicta/types';
import uiTranslations from './translations/ui.json';

type UiTranslationRecord = Record<SupportedLanguage, string>;

export type UiTranslationKey = keyof typeof uiTranslations.entries;

const UI_TRANSLATION_ENTRIES: Record<string, UiTranslationRecord> =
  uiTranslations.entries;
const UI_SOURCE_TO_KEY = new Map<string, string>(
  Object.entries(UI_TRANSLATION_ENTRIES).map(([key, entry]) => [
    getTranslationKey(entry.en),
    key,
  ]),
);

export function getTranslationKey(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function translateUiKey(
  key: UiTranslationKey | string,
  language: SupportedLanguage,
): string {
  const entry = UI_TRANSLATION_ENTRIES[key];

  if (!entry) {
    return key;
  }

  if (language === 'en') {
    return entry.en;
  }

  const translated = entry[language]?.trim();
  return translated || entry.en;
}

export function translateUiText(
  value: string,
  language: SupportedLanguage,
): string {
  if (!value.trim()) {
    return value;
  }

  const leading = value.match(/^\s*/)?.[0] ?? '';
  const trailing = value.match(/\s*$/)?.[0] ?? '';
  const normalized = getTranslationKey(value);
  const key = UI_SOURCE_TO_KEY.get(normalized);

  if (!key || language === 'en') {
    return value;
  }

  return `${leading}${translateUiKey(key, language)}${trailing}`;
}

export function hasUiTranslation(
  value: string,
  language: SupportedLanguage,
): boolean {
  if (language === 'en') {
    return false;
  }

  const key = UI_SOURCE_TO_KEY.get(getTranslationKey(value));
  if (!key) {
    return false;
  }

  return Boolean(UI_TRANSLATION_ENTRIES[key]?.[language]?.trim());
}

export function getMissingUiTranslationKeys(
  language: Exclude<SupportedLanguage, 'en'>,
): UiTranslationKey[] {
  return Object.entries(UI_TRANSLATION_ENTRIES)
    .filter(([, entry]) => !entry[language]?.trim())
    .map(([key]) => key as UiTranslationKey);
}

export function getUiTranslationDebugSnapshot(): {
  keys: string[];
  missingGujarati: string[];
  missingHindi: string[];
  total: number;
} {
  return {
    keys: Object.keys(UI_TRANSLATION_ENTRIES),
    missingGujarati: getMissingUiTranslationKeys('gu'),
    missingHindi: getMissingUiTranslationKeys('hi'),
    total: Object.keys(UI_TRANSLATION_ENTRIES).length,
  };
}
