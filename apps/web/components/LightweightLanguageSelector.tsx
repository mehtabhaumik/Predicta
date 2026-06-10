'use client';

import type { KeyboardEvent } from 'react';
import { useRef } from 'react';
import {
  getLightweightLanguageLabels,
  LIGHTWEIGHT_LANGUAGE_OPTIONS,
} from '../lib/lightweight-public-copy';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';

export function LightweightLanguageSelector({
  compact = false,
  hideCompactLabel = false,
}: {
  compact?: boolean;
  hideCompactLabel?: boolean;
}): React.JSX.Element {
  const { language, setLanguage } = useLightweightLanguagePreference();
  const labels = getLightweightLanguageLabels(language);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function moveSelection(event: KeyboardEvent<HTMLElement>, direction: number) {
    const currentIndex = LIGHTWEIGHT_LANGUAGE_OPTIONS.findIndex(
      option => option.code === language,
    );
    const nextIndex =
      (currentIndex + direction + LIGHTWEIGHT_LANGUAGE_OPTIONS.length) %
      LIGHTWEIGHT_LANGUAGE_OPTIONS.length;
    const nextOption = LIGHTWEIGHT_LANGUAGE_OPTIONS[nextIndex];

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
      setLanguage(LIGHTWEIGHT_LANGUAGE_OPTIONS[0].code);
      optionRefs.current[0]?.focus();
      return;
    }

    if (event.key === 'End') {
      const lastIndex = LIGHTWEIGHT_LANGUAGE_OPTIONS.length - 1;
      event.preventDefault();
      setLanguage(LIGHTWEIGHT_LANGUAGE_OPTIONS[lastIndex].code);
      optionRefs.current[lastIndex]?.focus();
    }
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
        aria-label={labels.language}
        className="language-options"
        role="radiogroup"
      >
        {LIGHTWEIGHT_LANGUAGE_OPTIONS.map((option, index) => (
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

