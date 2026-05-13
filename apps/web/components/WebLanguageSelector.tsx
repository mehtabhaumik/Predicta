'use client';

import {
  getLanguageLabels,
  SUPPORTED_LANGUAGE_OPTIONS,
} from '@pridicta/config/language';
import { useLanguagePreference } from '../lib/language-preference';

export function WebLanguageSelector({
  compact = false,
}: {
  compact?: boolean;
}): React.JSX.Element {
  const { language, setLanguage } = useLanguagePreference();
  const labels = getLanguageLabels(language);

  return (
    <div className={compact ? 'language-selector compact' : 'language-selector'}>
      <div className="language-selector-copy">
        <span>{labels.currentLanguage}</span>
        {!compact ? <p>{labels.languageHelper}</p> : null}
      </div>
      <div className="language-options" aria-label={labels.language}>
        {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
          <button
            aria-pressed={language === option.code}
            className={language === option.code ? 'active' : ''}
            key={option.code}
            onClick={event => {
              event.stopPropagation();
              setLanguage(option.code);
            }}
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
