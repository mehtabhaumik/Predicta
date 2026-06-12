'use client';

import {
  getLanguageLabels,
  SUPPORTED_LANGUAGE_OPTIONS,
} from '@pridicta/config/language';
import { type KeyboardEvent, useRef } from 'react';
import { useLanguagePreference } from '../lib/language-preference';

export function WebLanguageSelector({
  compact = false,
  hideCompactLabel = false,
}: {
  compact?: boolean;
  hideCompactLabel?: boolean;
}): React.JSX.Element {
  const { language, setLanguage } = useLanguagePreference();
  const labels = getLanguageLabels(language);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function moveSelection(event: KeyboardEvent<HTMLElement>, direction: number) {
    const currentIndex = SUPPORTED_LANGUAGE_OPTIONS.findIndex(
      option => option.code === language,
    );
    const nextIndex =
      (currentIndex + direction + SUPPORTED_LANGUAGE_OPTIONS.length) %
      SUPPORTED_LANGUAGE_OPTIONS.length;
    const nextOption = SUPPORTED_LANGUAGE_OPTIONS[nextIndex];

    event.preventDefault();
    setLanguage(nextOption.code);
    optionRefs.current[nextIndex]?.focus();
  }

  function onLanguageKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      moveSelection(event, 1);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      moveSelection(event, -1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setLanguage(SUPPORTED_LANGUAGE_OPTIONS[0].code);
      optionRefs.current[0]?.focus();
      return;
    }

    if (event.key === 'End') {
      const lastIndex = SUPPORTED_LANGUAGE_OPTIONS.length - 1;
      event.preventDefault();
      setLanguage(SUPPORTED_LANGUAGE_OPTIONS[lastIndex].code);
      optionRefs.current[lastIndex]?.focus();
    }
  }

  if (compact && hideCompactLabel) {
    return (
      <label className="language-selector compact compact-hide-label compact-language-select">
        <span className="sr-only">{labels.language}</span>
        <select
          aria-label={labels.language}
          onChange={event => {
            setLanguage(event.target.value as typeof language);
          }}
          value={language}
        >
          {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
            <option key={option.code} value={option.code}>
              {option.nativeName}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div
      className={[
        'language-selector',
        compact ? 'compact' : '',
        compact && hideCompactLabel ? 'compact-hide-label' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="language-selector-copy">
        <span>{labels.currentLanguage}</span>
        {!compact ? <p>{labels.languageHelper}</p> : null}
      </div>
      <div
        className="language-options"
        aria-label={labels.language}
        role="radiogroup"
      >
        {SUPPORTED_LANGUAGE_OPTIONS.map((option, index) => (
          <button
            aria-checked={language === option.code}
            className={language === option.code ? 'active' : ''}
            key={option.code}
            onClick={event => {
              event.stopPropagation();
              setLanguage(option.code);
            }}
            onKeyDown={onLanguageKeyDown}
            ref={element => {
              optionRefs.current[index] = element;
            }}
            role="radio"
            tabIndex={language === option.code ? 0 : -1}
            title={option.aiInstruction}
            type="button"
          >
            <strong>{option.nativeName}</strong>
            {!compact ? <span>{option.englishName}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
