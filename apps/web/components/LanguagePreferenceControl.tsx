'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  getAiLanguageInstruction,
  getLocalizedString,
  normalizeLocale,
  SUPPORTED_LOCALES,
} from '@pridicta/config/locales';
import type { AppLocale } from '@pridicta/types';

const STORAGE_KEY = 'predicta.languagePreference.v1';

export function LanguagePreferenceControl(): React.JSX.Element {
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      setLocale(normalizeLocale(window.localStorage.getItem(STORAGE_KEY)));
    } catch {
      setLocale(DEFAULT_LOCALE);
    }
  }, []);

  const aiInstruction = useMemo(
    () => getAiLanguageInstruction(locale),
    [locale],
  );

  function handleSelect(nextLocale: AppLocale) {
    setLocale(nextLocale);

    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // Local persistence is a convenience only; the UI can continue safely.
    }
  }

  return (
    <div className="settings-stack">
      <div className="setting-row language-setting-row">
        <div>
          <strong>
            {getLocalizedString('settings.language.title', locale)}
          </strong>
          <span>
            {getLocalizedString('settings.language.description', locale)}
          </span>
        </div>
        <div className="language-choice-grid" role="group" aria-label="Language preference">
          {SUPPORTED_LOCALES.map(option => (
            <button
              aria-pressed={locale === option.code}
              className={`language-choice${
                locale === option.code ? ' active' : ''
              }`}
              key={option.code}
              onClick={() => handleSelect(option.code)}
              type="button"
            >
              <span>{option.nativeLabel}</span>
              <small>{option.label}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="setting-row">
        <div>
          <strong>Pridicta replies</strong>
          <span>{aiInstruction}</span>
        </div>
      </div>
      <div className="setting-row">
        <div>
          <strong>PDF language</strong>
          <span>
            {getLocalizedString('settings.language.pdfHint', locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
