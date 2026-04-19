import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LOCALE, normalizeLocale } from '@pridicta/config';
import type { AppLocale, LanguagePreference } from '@pridicta/types';

const LANGUAGE_PREFERENCE_KEY = 'predicta.languagePreference.v1';

export async function loadLanguagePreference(): Promise<LanguagePreference> {
  const raw = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);

  if (!raw) {
    return {
      locale: DEFAULT_LOCALE,
      updatedAt: new Date().toISOString(),
    };
  }

  const parsed = JSON.parse(raw) as Partial<LanguagePreference>;

  return {
    locale: normalizeLocale(parsed.locale),
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
  };
}

export async function saveLanguagePreference(
  locale: AppLocale,
): Promise<LanguagePreference> {
  const preference = {
    locale: normalizeLocale(locale),
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, JSON.stringify(preference));

  return preference;
}
