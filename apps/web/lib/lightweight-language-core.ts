import type { SupportedLanguage } from '@pridicta/types';

export const LIGHTWEIGHT_LANGUAGE_STORAGE_KEY = 'pridicta.languagePreference.v1';

export function normalizeLightweightLanguage(
  value?: string | null,
): SupportedLanguage {
  return value === 'hi' || value === 'gu' ? value : 'en';
}
