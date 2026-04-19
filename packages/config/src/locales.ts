import type {
  AppLocale,
  LocaleOption,
  LocalizedStringKey,
} from '@pridicta/types';

export const DEFAULT_LOCALE: AppLocale = 'en';

export const SUPPORTED_LOCALES: LocaleOption[] = [
  {
    code: 'en',
    direction: 'ltr',
    label: 'English',
    nativeLabel: 'English',
  },
  {
    code: 'hi',
    direction: 'ltr',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
  },
  {
    code: 'gu',
    direction: 'ltr',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
  },
];

export const CORE_ASTROLOGY_TERMS = [
  'Kundli',
  'Jyotish',
  'Dasha',
  'Mahadasha',
  'Antardasha',
  'Nakshatra',
  'Lagna',
  'Navamsha',
  'Dashamsha',
  'Ashtakavarga',
  'Yoga',
] as const;

const STRINGS: Record<AppLocale, Record<LocalizedStringKey, string>> = {
  en: {
    'language.english': 'English',
    'language.gujarati': 'Gujarati',
    'language.hindi': 'Hindi',
    'settings.language.aiHint':
      'Predicta will answer in this language when it can do so safely and clearly.',
    'settings.language.description':
      'Choose the language for guidance, report preferences, and future static UI.',
    'settings.language.pdfHint':
      'PDF language is a preference hook. Full translated reports can be gated by Premium or report credits later.',
    'settings.language.title': 'Language preference',
  },
  gu: {
    'language.english': 'English',
    'language.gujarati': 'ગુજરાતી',
    'language.hindi': 'હિન્દી',
    'settings.language.aiHint':
      'Predicta સલામત અને સ્પષ્ટ હોય ત્યારે આ ભાષામાં જવાબ આપશે.',
    'settings.language.description':
      'માર્ગદર્શન, રિપોર્ટ પસંદગી અને ભવિષ્યના UI માટે ભાષા પસંદ કરો.',
    'settings.language.pdfHint':
      'PDF ભાષા હાલમાં પસંદગી હૂક છે. સંપૂર્ણ અનુવાદિત રિપોર્ટ પછી Premium અથવા report creditsથી ખુલશે.',
    'settings.language.title': 'ભાષા પસંદગી',
  },
  hi: {
    'language.english': 'English',
    'language.gujarati': 'गुजराती',
    'language.hindi': 'हिन्दी',
    'settings.language.aiHint':
      'Predicta सुरक्षित और स्पष्ट होने पर इसी भाषा में उत्तर देगा.',
    'settings.language.description':
      'मार्गदर्शन, रिपोर्ट preference, और future UI के लिए भाषा चुनें.',
    'settings.language.pdfHint':
      'PDF language अभी preference hook है. पूर्ण translated reports बाद में Premium या report credits से जुड़ सकते हैं.',
    'settings.language.title': 'भाषा preference',
  },
};

export function normalizeLocale(locale?: string | null): AppLocale {
  return SUPPORTED_LOCALES.some(option => option.code === locale)
    ? (locale as AppLocale)
    : DEFAULT_LOCALE;
}

export function getLocaleOption(locale?: string | null): LocaleOption {
  const normalized = normalizeLocale(locale);
  return SUPPORTED_LOCALES.find(option => option.code === normalized)!;
}

export function getLocalizedString(
  key: LocalizedStringKey,
  locale?: string | null,
): string {
  const normalized = normalizeLocale(locale);
  return STRINGS[normalized][key] ?? STRINGS[DEFAULT_LOCALE][key];
}

export function getAiLanguageInstruction(locale?: string | null): string {
  const option = getLocaleOption(locale);

  if (option.code === 'en') {
    return 'Respond in English. Keep core Vedic terms such as Kundli, Dasha, Lagna, Nakshatra, and Yoga clear and consistent.';
  }

  return `Respond primarily in ${option.label} (${option.nativeLabel}) when safe and clear. Keep core Vedic terms such as Kundli, Dasha, Lagna, Nakshatra, and Yoga in a recognizable form, with short explanations when useful. If a technical term becomes unclear in translation, use the Sanskrit/Vedic term plus a simple explanation.`;
}

export function getPdfLanguageLabel(locale?: string | null): string {
  const option = getLocaleOption(locale);
  return `${option.label} (${option.nativeLabel})`;
}
