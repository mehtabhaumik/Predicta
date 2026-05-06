import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
} from '@pridicta/config/language';
import type { LanguagePreference, SupportedLanguage } from '../../types/astrology';

export async function loadLanguagePreference(): Promise<LanguagePreference> {
  const raw = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (!raw) {
    return {
      language: 'en',
      updatedAt: new Date().toISOString(),
    };
  }

  const parsed = parseStoredLanguagePreference(raw);

  return {
    language: parsed.language,
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
  };
}

export async function saveLanguagePreference(
  language: SupportedLanguage,
): Promise<LanguagePreference> {
  const preference = {
    language,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(preference));

  return preference;
}

function parseStoredLanguagePreference(raw: string): LanguagePreference {
  try {
    const parsed = JSON.parse(raw) as Partial<LanguagePreference> | string;

    if (typeof parsed === 'string') {
      return {
        language: normalizeLanguage(parsed),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      language: normalizeLanguage(parsed.language),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return {
      language: normalizeLanguage(raw),
      updatedAt: new Date().toISOString(),
    };
  }
}
