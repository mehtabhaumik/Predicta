export type AppLocale = 'en' | 'hi' | 'gu';

export type LocaleDirection = 'ltr';

export type LocaleOption = {
  code: AppLocale;
  label: string;
  nativeLabel: string;
  direction: LocaleDirection;
};

export type LocalizedStringKey =
  | 'settings.language.title'
  | 'settings.language.description'
  | 'settings.language.aiHint'
  | 'settings.language.pdfHint'
  | 'language.english'
  | 'language.hindi'
  | 'language.gujarati';

export type LanguagePreference = {
  locale: AppLocale;
  updatedAt: string;
};
