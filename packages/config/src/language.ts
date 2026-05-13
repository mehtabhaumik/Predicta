import type { SupportedLanguage } from '@pridicta/types';

export const LANGUAGE_STORAGE_KEY = 'pridicta.languagePreference.v1';

export type LanguageLabels = {
  askPridicta: string;
  appLanguage: string;
  chartEvidence: string;
  chatLanguage: string;
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

export type AppShellLabels = {
  access: {
    freePreview: string;
    premiumDepthAvailable: string;
  };
  actions: {
    askPredicta: string;
    close: string;
    openMenu: string;
    closeMenu: string;
  };
  groups: {
    account: string;
    charts: string;
    guidance: string;
    owner: string;
    savedWork: string;
    start: string;
  };
  nav: {
    admin: string;
    allCharts: string;
    birthTime: string;
    chat: string;
    decision: string;
    family: string;
    founderVision: string;
    holisticAstrology: string;
    kpPredicta: string;
    kundli: string;
    legal: string;
    nadiPredicta: string;
    overview: string;
    premium: string;
    redeemPass: string;
    relationship: string;
    remedies: string;
    reports: string;
    safetyPromise: string;
    savedKundlis: string;
    settings: string;
    timeline: string;
    wrapped: string;
  };
  privateSave: {
    body: string;
    title: string;
  };
  topbarDescription: string;
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
    askPridicta: 'Ask Predicta',
    appLanguage: 'App language',
    chartEvidence: 'Chart evidence',
    chatLanguage: 'Predicta replying in',
    confidence: 'Confidence',
    createKundli: 'Create Kundli',
    currentLanguage: 'App language',
    decisionWindows: 'Decision windows',
    evidenceTable: 'Evidence table',
    factor: 'Factor',
    free: 'Free',
    implication: 'Implication',
    keySignal: 'Key signal',
    language: 'Language',
    languageHelper:
      'This translates the app interface. Predicta can still answer in the language you type inside chat.',
    observation: 'Observation',
    premium: 'Premium',
    reading: 'Reading',
    reportDepth: 'Report depth',
    shareSafe: 'Share-safe',
  },
  gu: {
    askPridicta: 'પ્રેડિક્ટાને પૂછો',
    appLanguage: 'એપ ભાષા',
    chartEvidence: 'ચાર્ટનો પુરાવો',
    chatLanguage: 'પ્રેડિક્ટા જવાબ આપશે',
    confidence: 'વિશ્વાસ',
    createKundli: 'કુંડળી બનાવો',
    currentLanguage: 'એપ ભાષા',
    decisionWindows: 'નિર્ણય સમયગાળા',
    evidenceTable: 'પુરાવા ટેબલ',
    factor: 'કારક',
    free: 'ફ્રી',
    implication: 'અર્થ',
    keySignal: 'મુખ્ય સંકેત',
    language: 'ભાષા',
    languageHelper:
      'આ એપના બટન, મેનુ અને લખાણની ભાષા છે. ચેટમાં તમે જે ભાષા લખશો તેમાં પ્રેડિક્ટા જવાબ આપી શકે છે.',
    observation: 'અવલોકન',
    premium: 'પ્રીમિયમ',
    reading: 'વાંચન',
    reportDepth: 'રિપોર્ટની ઊંડાઈ',
    shareSafe: 'શેર-સેફ',
  },
  hi: {
    askPridicta: 'प्रेडिक्टा से पूछें',
    appLanguage: 'ऐप भाषा',
    chartEvidence: 'चार्ट प्रमाण',
    chatLanguage: 'प्रेडिक्टा जवाब दे रही है',
    confidence: 'विश्वास',
    createKundli: 'कुंडली बनाएं',
    currentLanguage: 'ऐप भाषा',
    decisionWindows: 'निर्णय समय',
    evidenceTable: 'प्रमाण तालिका',
    factor: 'कारक',
    free: 'फ्री',
    implication: 'अर्थ',
    keySignal: 'मुख्य संकेत',
    language: 'भाषा',
    languageHelper:
      'यह ऐप के बटन, मेनू और लिखावट की भाषा है. चैट में आप जिस भाषा में लिखेंगे, प्रेडिक्टा उसी भाषा में जवाब दे सकती है.',
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

const APP_SHELL_LABELS: Record<SupportedLanguage, AppShellLabels> = {
  en: {
    access: {
      freePreview: 'Free preview',
      premiumDepthAvailable: 'Premium depth available',
    },
    actions: {
      askPredicta: 'Ask Predicta',
      close: 'Close',
      closeMenu: 'Close dashboard menu',
      openMenu: 'Open dashboard menu',
    },
    groups: {
      account: 'Account',
      charts: 'Charts',
      guidance: 'Guidance',
      owner: 'Owner',
      savedWork: 'Saved Work',
      start: 'Start',
    },
    nav: {
      admin: 'Admin',
      allCharts: 'All Charts',
      birthTime: 'Birth Time',
      chat: 'Chat',
      decision: 'Decision',
      family: 'Family',
      founderVision: 'Founder Vision',
      holisticAstrology: 'Holistic Astrology',
      kpPredicta: 'KP Predicta',
      kundli: 'Kundli',
      legal: 'Legal',
      nadiPredicta: 'Nadi Predicta',
      overview: 'Overview',
      premium: 'Premium',
      redeemPass: 'Redeem Pass',
      relationship: 'Relationship',
      remedies: 'Remedies',
      reports: 'Reports',
      safetyPromise: 'Safety Promise',
      savedKundlis: 'Saved Kundlis',
      settings: 'Settings',
      timeline: 'Timeline',
      wrapped: 'Wrapped',
    },
    privateSave: {
      body: 'This browser remembers your chart. Sign in to keep it across devices.',
      title: 'Private save',
    },
    topbarDescription:
      'Holistic astrology guidance, reports, charts, and saved kundlis.',
  },
  hi: {
    access: {
      freePreview: 'फ्री प्रीव्यू',
      premiumDepthAvailable: 'प्रीमियम गहराई उपलब्ध',
    },
    actions: {
      askPredicta: 'प्रेडिक्टा से पूछें',
      close: 'बंद करें',
      closeMenu: 'डैशबोर्ड मेनू बंद करें',
      openMenu: 'डैशबोर्ड मेनू खोलें',
    },
    groups: {
      account: 'खाता',
      charts: 'चार्ट',
      guidance: 'मार्गदर्शन',
      owner: 'ओनर',
      savedWork: 'सेव किया हुआ',
      start: 'शुरू करें',
    },
    nav: {
      admin: 'एडमिन',
      allCharts: 'सभी चार्ट',
      birthTime: 'जन्म समय',
      chat: 'चैट',
      decision: 'निर्णय',
      family: 'परिवार',
      founderVision: 'फाउंडर विजन',
      holisticAstrology: 'होलिस्टिक ज्योतिष',
      kpPredicta: 'KP प्रेडिक्टा',
      kundli: 'कुंडली',
      legal: 'कानूनी',
      nadiPredicta: 'नाड़ी प्रेडिक्टा',
      overview: 'ओवरव्यू',
      premium: 'प्रीमियम',
      redeemPass: 'पास रिडीम करें',
      relationship: 'रिश्ता',
      remedies: 'उपाय',
      reports: 'रिपोर्ट',
      safetyPromise: 'सुरक्षा वादा',
      savedKundlis: 'सेव कुंडली',
      settings: 'सेटिंग्स',
      timeline: 'टाइमलाइन',
      wrapped: 'रैप्ड',
    },
    privateSave: {
      body: 'यह ब्राउजर आपका चार्ट याद रखता है. दूसरे डिवाइस पर रखने के लिए साइन इन करें.',
      title: 'निजी सेव',
    },
    topbarDescription:
      'होलिस्टिक ज्योतिष मार्गदर्शन, रिपोर्ट, चार्ट और सेव कुंडली.',
  },
  gu: {
    access: {
      freePreview: 'ફ્રી પ્રીવ્યૂ',
      premiumDepthAvailable: 'પ્રીમિયમ ઊંડાઈ ઉપલબ્ધ',
    },
    actions: {
      askPredicta: 'પ્રેડિક્ટાને પૂછો',
      close: 'બંધ કરો',
      closeMenu: 'ડેશબોર્ડ મેનૂ બંધ કરો',
      openMenu: 'ડેશબોર્ડ મેનૂ ખોલો',
    },
    groups: {
      account: 'એકાઉન્ટ',
      charts: 'ચાર્ટ્સ',
      guidance: 'માર્ગદર્શન',
      owner: 'ઓનર',
      savedWork: 'સેવ કરેલું',
      start: 'શરૂ કરો',
    },
    nav: {
      admin: 'એડમિન',
      allCharts: 'બધા ચાર્ટ્સ',
      birthTime: 'જન્મ સમય',
      chat: 'ચેટ',
      decision: 'નિર્ણય',
      family: 'પરિવાર',
      founderVision: 'ફાઉન્ડર વિઝન',
      holisticAstrology: 'હોલિસ્ટિક જ્યોતિષ',
      kpPredicta: 'KP પ્રેડિક્ટા',
      kundli: 'કુંડળી',
      legal: 'કાનૂની',
      nadiPredicta: 'નાડી પ્રેડિક્ટા',
      overview: 'ઓવરવ્યૂ',
      premium: 'પ્રીમિયમ',
      redeemPass: 'પાસ રિડીમ કરો',
      relationship: 'સંબંધ',
      remedies: 'ઉપાયો',
      reports: 'રિપોર્ટ્સ',
      safetyPromise: 'સેફ્ટી પ્રોમિસ',
      savedKundlis: 'સેવ કુંડળી',
      settings: 'સેટિંગ્સ',
      timeline: 'ટાઇમલાઇન',
      wrapped: 'રેપ્ડ',
    },
    privateSave: {
      body: 'આ બ્રાઉઝર તમારો ચાર્ટ યાદ રાખે છે. બીજા ડિવાઇસ માટે સાઇન ઇન કરો.',
      title: 'પ્રાઇવેટ સેવ',
    },
    topbarDescription:
      'હોલિસ્ટિક જ્યોતિષ માર્ગદર્શન, રિપોર્ટ્સ, ચાર્ટ્સ અને સેવ કુંડળી.',
  },
};

export function getAppShellLabels(
  language: SupportedLanguage,
): AppShellLabels {
  return APP_SHELL_LABELS[language] ?? APP_SHELL_LABELS.en;
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
