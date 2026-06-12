import type { SupportedLanguage } from '@pridicta/types';

const HTML_LANG_BY_APP_LANGUAGE: Record<SupportedLanguage, string> = {
  en: 'en',
  gu: 'gu',
  hi: 'hi',
};

export function applyPredictaDocumentLanguage(language: SupportedLanguage): void {
  if (typeof document === 'undefined') {
    return;
  }

  const htmlLanguage = HTML_LANG_BY_APP_LANGUAGE[language] ?? 'en';
  document.documentElement.lang = htmlLanguage;
  document.documentElement.dir = 'ltr';
  document.documentElement.dataset.predictaLanguage = language;
}
