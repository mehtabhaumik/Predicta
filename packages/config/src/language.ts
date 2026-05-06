import type { SupportedLanguage } from '@pridicta/types';

export const LANGUAGE_STORAGE_KEY = 'pridicta.languagePreference.v1';

export type LanguageLabels = {
  askPridicta: string;
  chartEvidence: string;
  createKundli: string;
  confidence: string;
  currentLanguage: string;
  decisionWindows: string;
  evidenceTable: string;
  factor: string;
  free: string;
  implication: string;
  keySignal: string;
  language: string;
  languageHelper: string;
  observation: string;
  premium: string;
  reportDepth: string;
  reading: string;
  shareSafe: string;
};

export type LanguageOption = {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
  aiInstruction: string;
};

export const SUPPORTED_LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    aiInstruction:
      'Answer in clear English. Keep Sanskrit terms only when useful and explain them simply.',
    code: 'en',
    englishName: 'English',
    nativeName: 'English',
  },
  {
    aiInstruction:
      'Answer in natural Hindi using Devanagari. Keep Jyotish/Sanskrit terms readable and explain them in simple Hindi.',
    code: 'hi',
    englishName: 'Hindi',
    nativeName: 'हिन्दी',
  },
  {
    aiInstruction:
      'Answer in natural Gujarati using Gujarati script. Keep Jyotish/Sanskrit terms readable and explain them in simple Gujarati.',
    code: 'gu',
    englishName: 'Gujarati',
    nativeName: 'ગુજરાતી',
  },
];

export const LANGUAGE_LABELS: Record<SupportedLanguage, LanguageLabels> = {
  en: {
    askPridicta: 'Ask Pridicta',
    chartEvidence: 'Chart evidence',
    confidence: 'Confidence',
    createKundli: 'Create Kundli',
    currentLanguage: 'Current language',
    decisionWindows: 'Decision windows',
    evidenceTable: 'Evidence table',
    factor: 'Factor',
    free: 'Free',
    implication: 'Implication',
    keySignal: 'Key signal',
    language: 'Language',
    languageHelper:
      'Pridicta will use this language for AI answers, reports, daily briefings, and share-safe summaries.',
    observation: 'Observation',
    premium: 'Premium',
    reading: 'Reading',
    reportDepth: 'Report depth',
    shareSafe: 'Share-safe',
  },
  gu: {
    askPridicta: 'પ્રિડિક્ટાને પૂછો',
    chartEvidence: 'ચાર્ટનો પુરાવો',
    confidence: 'વિશ્વાસ',
    createKundli: 'કુંડળી બનાવો',
    currentLanguage: 'હાલની ભાષા',
    decisionWindows: 'નિર્ણય સમયગાળા',
    evidenceTable: 'પુરાવા ટેબલ',
    factor: 'કારક',
    free: 'ફ્રી',
    implication: 'અર્થ',
    keySignal: 'મુખ્ય સંકેત',
    language: 'ભાષા',
    languageHelper:
      'પ્રિડિક્ટા AI જવાબો, રિપોર્ટ, દૈનિક બ્રીફિંગ અને શેર-સેફ સારાંશ માટે આ ભાષા વાપરશે.',
    observation: 'અવલોકન',
    premium: 'પ્રીમિયમ',
    reading: 'વાંચન',
    reportDepth: 'રિપોર્ટની ઊંડાઈ',
    shareSafe: 'શેર-સેફ',
  },
  hi: {
    askPridicta: 'प्रिडिक्टा से पूछें',
    chartEvidence: 'चार्ट प्रमाण',
    confidence: 'विश्वास',
    createKundli: 'कुंडली बनाएं',
    currentLanguage: 'वर्तमान भाषा',
    decisionWindows: 'निर्णय समय',
    evidenceTable: 'प्रमाण तालिका',
    factor: 'कारक',
    free: 'फ्री',
    implication: 'अर्थ',
    keySignal: 'मुख्य संकेत',
    language: 'भाषा',
    languageHelper:
      'प्रिडिक्टा AI उत्तरों, रिपोर्ट, दैनिक ब्रीफिंग और शेयर-सेफ सारांश में इस भाषा का उपयोग करेगा.',
    observation: 'अवलोकन',
    premium: 'प्रीमियम',
    reading: 'रीडिंग',
    reportDepth: 'रिपोर्ट गहराई',
    shareSafe: 'शेयर-सेफ',
  },
};

export function getLanguageLabels(language: SupportedLanguage): LanguageLabels {
  return LANGUAGE_LABELS[language] ?? LANGUAGE_LABELS.en;
}

export function getLanguageOption(language: SupportedLanguage): LanguageOption {
  return (
    SUPPORTED_LANGUAGE_OPTIONS.find(option => option.code === language) ??
    SUPPORTED_LANGUAGE_OPTIONS[0]
  );
}

export function getConfidenceLabel(
  language: SupportedLanguage,
  confidence: 'low' | 'medium' | 'high',
): string {
  const labels: Record<SupportedLanguage, Record<typeof confidence, string>> = {
    en: {
      high: 'high',
      low: 'low',
      medium: 'medium',
    },
    gu: {
      high: 'ઊંચો',
      low: 'ઓછો',
      medium: 'મધ્યમ',
    },
    hi: {
      high: 'ऊंचा',
      low: 'कम',
      medium: 'मध्यम',
    },
  };

  return labels[language]?.[confidence] ?? labels.en[confidence];
}

export function normalizeLanguage(value?: string | null): SupportedLanguage {
  return SUPPORTED_LANGUAGE_OPTIONS.some(option => option.code === value)
    ? (value as SupportedLanguage)
    : 'en';
}
