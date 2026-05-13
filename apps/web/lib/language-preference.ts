'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
} from '@pridicta/config/language';
import type { LanguagePreference, SupportedLanguage } from '@pridicta/types';
import { saveWebAutoSaveMemory } from './web-auto-save-memory';

const LANGUAGE_CHANGE_EVENT = 'pridicta-language-change';

export function useLanguagePreference(): {
  appLanguage: SupportedLanguage;
  language: SupportedLanguage;
  setAppLanguage: (language: SupportedLanguage) => void;
  setLanguage: (language: SupportedLanguage) => void;
} {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    setLanguageState(readStoredLanguage());

    function handleStorage(event: StorageEvent) {
      if (event.key === LANGUAGE_STORAGE_KEY) {
        setLanguageState(readLanguageFromValue(event.newValue));
      }
    }

    function handleLocalChange() {
      setLanguageState(readStoredLanguage());
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLocalChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLocalChange);
    };
  }, []);

  const setAppLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    const preference: LanguagePreference = {
      appLanguage: nextLanguage,
      language: nextLanguage,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(preference));
    saveWebAutoSaveMemory({
      language: {
        selected: nextLanguage,
        updatedAt: preference.updatedAt,
      },
    });
    setLanguageState(nextLanguage);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  return { appLanguage: language, language, setAppLanguage, setLanguage: setAppLanguage };
}

function readStoredLanguage(): SupportedLanguage {
  return readLanguageFromValue(localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

function readLanguageFromValue(value: string | null): SupportedLanguage {
  if (!value) {
    return 'en';
  }

  try {
    const parsed = JSON.parse(value) as Partial<LanguagePreference> | string;

    return typeof parsed === 'string'
      ? normalizeLanguage(parsed)
      : normalizeLanguage(parsed.appLanguage ?? parsed.language);
  } catch {
    return normalizeLanguage(value);
  }
}
