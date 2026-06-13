'use client';

import type { SupportedLanguage } from '@pridicta/types';
import { useEffect, useState } from 'react';
import {
  LIGHTWEIGHT_LANGUAGE_STORAGE_KEY,
  normalizeLightweightLanguage,
} from './lightweight-public-copy';

const LANGUAGE_CHANGE_EVENT = 'pridicta-language-change';

export function useLightweightLanguagePreference(): {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
} {
  const [language, setLanguageState] =
    useState<SupportedLanguage>(readStoredLanguage);

  useEffect(() => {
    setLanguageState(readStoredLanguage());

    function handleStorage(event: StorageEvent) {
      if (event.key === LIGHTWEIGHT_LANGUAGE_STORAGE_KEY) {
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

  function setLanguage(nextLanguage: SupportedLanguage): void {
    const normalized = normalizeLightweightLanguage(nextLanguage);

    try {
      const now = new Date().toISOString();
      window.localStorage.setItem(
        LIGHTWEIGHT_LANGUAGE_STORAGE_KEY,
        JSON.stringify({
          appLanguage: normalized,
          chartLanguage: normalized,
          language: normalized,
          predictaReplyLanguage: normalized,
          predictaStylePreference: 'balanced',
          reportLanguage: normalized,
          updatedAt: now,
        }),
      );
      window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
    } catch {
      // Language preference is best-effort on public, performance-critical routes.
    }

    setLanguageState(normalized);
  }

  return {
    language,
    setLanguage,
  };
}

function readStoredLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return 'en';
  }

  return readLanguageFromValue(
    window.localStorage.getItem(LIGHTWEIGHT_LANGUAGE_STORAGE_KEY),
  );
}

function readLanguageFromValue(value: string | null): SupportedLanguage {
  if (!value) {
    return 'en';
  }

  try {
    const parsed = JSON.parse(value) as
      | string
      | {
          appLanguage?: string;
          language?: string;
        };

    return typeof parsed === 'string'
      ? normalizeLightweightLanguage(parsed)
      : normalizeLightweightLanguage(parsed.appLanguage ?? parsed.language);
  } catch {
    return normalizeLightweightLanguage(value);
  }
}
