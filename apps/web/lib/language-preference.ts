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
  chartLanguage: SupportedLanguage;
  language: SupportedLanguage;
  predictaReplyLanguage: SupportedLanguage;
  reportLanguage: SupportedLanguage;
  setAppLanguage: (language: SupportedLanguage) => void;
  setChartLanguage: (language: SupportedLanguage) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setPredictaReplyLanguage: (language: SupportedLanguage) => void;
  setReportLanguage: (language: SupportedLanguage) => void;
} {
  const [preference, setPreferenceState] = useState<LanguagePreference>(() =>
    buildLanguagePreference('en'),
  );

  useEffect(() => {
    setPreferenceState(readStoredPreference());

    function handleStorage(event: StorageEvent) {
      if (event.key === LANGUAGE_STORAGE_KEY) {
        setPreferenceState(readPreferenceFromValue(event.newValue));
      }
    }

    function handleLocalChange() {
      setPreferenceState(readStoredPreference());
    }

    window.addEventListener('storage', handleStorage);
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLocalChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLocalChange);
    };
  }, []);

  const updatePreference = useCallback((patch: Partial<LanguagePreference>) => {
    const currentPreference = readStoredPreference();
    const nextPreference = normalizePreference({
      ...currentPreference,
      ...patch,
      updatedAt: new Date().toISOString(),
    });

    localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(nextPreference));
    saveWebAutoSaveMemory({
      language: {
        selected: nextPreference.appLanguage ?? nextPreference.language,
        updatedAt: nextPreference.updatedAt,
      },
    });
    setPreferenceState(nextPreference);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }, []);

  const setAppLanguage = useCallback(
    (nextLanguage: SupportedLanguage) => {
      updatePreference({
        appLanguage: nextLanguage,
        language: nextLanguage,
      });
    },
    [updatePreference],
  );
  const setChartLanguage = useCallback(
    (nextLanguage: SupportedLanguage) =>
      updatePreference({ chartLanguage: nextLanguage }),
    [updatePreference],
  );
  const setReportLanguage = useCallback(
    (nextLanguage: SupportedLanguage) =>
      updatePreference({ reportLanguage: nextLanguage }),
    [updatePreference],
  );
  const setPredictaReplyLanguage = useCallback(
    (nextLanguage: SupportedLanguage) =>
      updatePreference({ predictaReplyLanguage: nextLanguage }),
    [updatePreference],
  );
  const appLanguage = preference.appLanguage ?? preference.language;

  return {
    appLanguage,
    chartLanguage: preference.chartLanguage ?? appLanguage,
    language: appLanguage,
    predictaReplyLanguage: preference.predictaReplyLanguage ?? appLanguage,
    reportLanguage: preference.reportLanguage ?? appLanguage,
    setAppLanguage,
    setChartLanguage,
    setLanguage: setAppLanguage,
    setPredictaReplyLanguage,
    setReportLanguage,
  };
}

function readStoredPreference(): LanguagePreference {
  return readPreferenceFromValue(localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

function readPreferenceFromValue(value: string | null): LanguagePreference {
  if (!value) {
    return buildLanguagePreference('en');
  }

  try {
    const parsed = JSON.parse(value) as Partial<LanguagePreference> | string;

    if (typeof parsed === 'string') {
      return buildLanguagePreference(normalizeLanguage(parsed));
    }

    return normalizePreference(parsed);
  } catch {
    return buildLanguagePreference(normalizeLanguage(value));
  }
}

function buildLanguagePreference(language: SupportedLanguage): LanguagePreference {
  return {
    appLanguage: language,
    chartLanguage: language,
    language,
    predictaReplyLanguage: language,
    reportLanguage: language,
    updatedAt: new Date().toISOString(),
  };
}

function normalizePreference(
  preference: Partial<LanguagePreference>,
): LanguagePreference {
  const appLanguage = normalizeLanguage(
    preference.appLanguage ?? preference.language,
  );

  return {
    appLanguage,
    chartLanguage: preference.chartLanguage
      ? normalizeLanguage(preference.chartLanguage)
      : appLanguage,
    language: appLanguage,
    predictaReplyLanguage: preference.predictaReplyLanguage
      ? normalizeLanguage(preference.predictaReplyLanguage)
      : appLanguage,
    reportLanguage: preference.reportLanguage
      ? normalizeLanguage(preference.reportLanguage)
      : appLanguage,
    updatedAt: preference.updatedAt ?? new Date().toISOString(),
  };
}
