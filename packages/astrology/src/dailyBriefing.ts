import type {
  DailyBriefing,
  DailyBriefingCue,
  KundliData,
  SupportedLanguage,
  TransitInsight,
} from '@pridicta/types';

const LABELS: Record<SupportedLanguage, DailyBriefing['labels']> = {
  en: {
    avoidAction: 'Avoid',
    bestAction: 'Best action',
    emotionalWeather: 'Emotional weather',
    eyebrow: 'DAILY COSMIC BRIEFING',
    proof: 'Chart proof',
    remedy: 'Micro-remedy',
    theme: "Today's theme",
  },
  gu: {
    avoidAction: 'ટાળો',
    bestAction: 'શ્રેષ્ઠ પગલું',
    emotionalWeather: 'ભાવનાત્મક વાતાવરણ',
    eyebrow: 'દૈનિક કોસ્મિક બ્રીફિંગ',
    proof: 'ચાર્ટ પુરાવો',
    remedy: 'નાનો ઉપાય',
    theme: 'આજની થીમ',
  },
  hi: {
    avoidAction: 'बचें',
    bestAction: 'सबसे अच्छा कदम',
    emotionalWeather: 'भावनात्मक मौसम',
    eyebrow: 'दैनिक कॉस्मिक ब्रीफिंग',
    proof: 'चार्ट प्रमाण',
    remedy: 'छोटा उपाय',
    theme: 'आज की थीम',
  },
};

export function composeDailyBriefing(
  kundli?: KundliData,
  options: {
    language?: SupportedLanguage;
    nowIso?: string;
  } = {},
): DailyBriefing {
  const language = options.language ?? 'en';
  const date = formatIsoDate(options.nowIso ?? new Date().toISOString());
  const labels = LABELS[language];

  if (!kundli) {
    const pending = buildPendingBriefingCopy(language);

    return {
      askPrompt: pending.askPrompt,
      avoidAction: pending.avoidAction,
      bestAction: pending.bestAction,
      cues: buildPendingCues(language),
      date,
      emotionalWeather: pending.emotionalWeather,
      evidence: pending.evidence,
      id: `daily-briefing-${date}`,
      labels,
      language,
      notification: {
        body: pending.notificationBody,
        deepLink: 'pridicta://kundli',
        title: pending.notificationTitle,
      },
      remedyMicroAction: pending.remedyMicroAction,
      status: 'pending',
      subtitle: pending.subtitle,
      title: pending.title,
      todayTheme: pending.todayTheme,
    };
  }

  const current = kundli.dasha.current;
  const primaryTransit = pickPrimaryTransit(kundli.transits ?? []);
  const strongestHouse = kundli.ashtakavarga.strongestHouses[0];
  const weakestHouse = kundli.ashtakavarga.weakestHouses[0];
  const remedy = kundli.remedies?.[0];
  const firstName = kundli.birthDetails.name.split(' ')[0] || kundli.birthDetails.name;
  const transitPhrase = primaryTransit
    ? `${primaryTransit.planet} moving through ${primaryTransit.sign}`
    : `${current.mahadasha}/${current.antardasha} dasha`;
  const englishTheme = `${firstName}, today favors steady ${labelHouse(strongestHouse)} work while ${transitPhrase} asks for cleaner choices around house ${primaryTransit?.houseFromLagna ?? weakestHouse}.`;
  const englishEmotionalWeather = `${kundli.moonSign} Moon in ${kundli.nakshatra} makes the day easier when emotions are named plainly before decisions are made.`;
  const englishCues = buildCues(kundli, primaryTransit);
  const englishBestAction =
    remedy?.practice ??
    `Use the ${current.mahadasha}/${current.antardasha} period for one focused action before adding new commitments.`;
  const englishAvoidAction = `Avoid forcing house ${weakestHouse} matters. Keep the day simple where routines, timing, or expectations feel unclear.`;
  const englishRemedyMicroAction =
    remedy?.cadence && remedy.practice
      ? `${remedy.practice} Cadence: ${remedy.cadence}.`
      : `Spend 3 quiet minutes reviewing one ${current.mahadasha} priority before reacting.`;
  const localized = localizeBriefingContent({
    avoidAction: englishAvoidAction,
    bestAction: englishBestAction,
    cues: englishCues,
    emotionalWeather: englishEmotionalWeather,
    firstName,
    language,
    remedyMicroAction: englishRemedyMicroAction,
    theme: englishTheme,
    transitPhrase,
    weakHouse: weakestHouse,
  });
  const evidence = [
    `Current dasha: ${current.mahadasha}/${current.antardasha} from ${current.startDate} to ${current.endDate}.`,
    `${kundli.lagna} Lagna and ${kundli.moonSign} Moon anchor the daily reading.`,
    `Ashtakavarga support: house ${strongestHouse}; pressure: house ${weakestHouse}.`,
    primaryTransit
      ? `${primaryTransit.planet} transit is ${primaryTransit.weight} from Lagna house ${primaryTransit.houseFromLagna} and Moon house ${primaryTransit.houseFromMoon}.`
      : 'No priority transit was available, so the briefing leans on dasha and ashtakavarga.',
  ];

  return {
    askPrompt: buildLocalizedAskPrompt(language, date),
    avoidAction: localized.avoidAction,
    bestAction: localized.bestAction,
    cues: localized.cues,
    date,
    emotionalWeather: localized.emotionalWeather,
    evidence,
    id: `daily-briefing-${kundli.id}-${date}`,
    labels,
    language,
    notification: {
      body: `${localized.todayTheme} ${labels.bestAction}: ${localized.bestAction}`,
      deepLink: `pridicta://daily-briefing/${date}`,
      title: 'Your Predicta daily briefing is ready',
    },
    remedyMicroAction: localized.remedyMicroAction,
    status: 'ready',
    subtitle: `${current.mahadasha}/${current.antardasha} timing, transit weather, and chart strength in one glance.`,
    title: `${firstName}'s briefing for ${formatDisplayDate(date)}`,
    todayTheme: localized.todayTheme,
  };
}

function buildLocalizedAskPrompt(language: SupportedLanguage, date: string): string {
  if (language === 'hi') {
    return `${date} की मेरी दैनिक कॉस्मिक ब्रीफिंग समझाइए. दशा, गोचर, Moon, Lagna, अष्टकवर्ग, उपाय, जोखिम और एक व्यावहारिक अगला कदम शामिल करें.`;
  }
  if (language === 'gu') {
    return `${date} માટે મારી દૈનિક કોસ્મિક બ્રીફિંગ સમજાવો. દશા, ગોચર, Moon, Lagna, અષ્ટકવર્ગ, ઉપાય, જોખમ અને એક વ્યવહારુ આગળનું પગલું ઉમેરો.`;
  }
  return `Explain my daily cosmic briefing for ${date}. Use my dasha, transit weather, Moon, Lagna, ashtakavarga, remedy, risks, and one practical next step.`;
}

function localizeBriefingContent({
  avoidAction,
  bestAction,
  cues,
  emotionalWeather,
  firstName,
  language,
  remedyMicroAction,
  theme,
  transitPhrase,
  weakHouse,
}: {
  avoidAction: string;
  bestAction: string;
  cues: DailyBriefingCue[];
  emotionalWeather: string;
  firstName: string;
  language: SupportedLanguage;
  remedyMicroAction: string;
  theme: string;
  transitPhrase: string;
  weakHouse?: number;
}): Pick<
  DailyBriefing,
  | 'avoidAction'
  | 'bestAction'
  | 'cues'
  | 'emotionalWeather'
  | 'remedyMicroAction'
  | 'todayTheme'
> {
  if (language === 'hi') {
    return {
      avoidAction: `घर ${weakHouse} से जुड़े विषयों में जल्दबाज़ी न करें. जहां routine, timing या expectations unclear हों, बात सरल रखें.`,
      bestAction: `आज एक focused काम पूरा करें; नए commitments जोड़ने से पहले ${transitPhrase} को practical रूप से संभालें.`,
      cues: cues.map(cue => ({
        ...cue,
        label: cue.area === 'career' ? 'करियर' : cue.area === 'money' ? 'धन' : 'संबंध',
        text: hindiCueText(cue),
      })),
      emotionalWeather:
        'Moon यानी मन का संकेत: भावना को पहले साफ शब्दों में बोलें, फिर निर्णय लें.',
      remedyMicroAction:
        remedyMicroAction === ''
          ? 'तीन शांत मिनट लेकर आज की एक priority लिखें.'
          : `सरल उपाय: ${remedyMicroAction}`,
      todayTheme: `${firstName}, आज steady काम और साफ चुनाव आपकी मदद करेंगे. Sanskrit/Jyotish शब्द आएं तो उनका अर्थ सरल रूप में समझें.`,
    };
  }

  if (language === 'gu') {
    return {
      avoidAction: `ઘર ${weakHouse} સાથે જોડાયેલા વિષયોમાં ઉતાવળ ન કરો. routine, timing અથવા expectations અસ્પષ્ટ હોય ત્યાં વાત સરળ રાખો.`,
      bestAction: `આજે એક focused કામ પૂરું કરો; નવા commitments ઉમેરતા પહેલાં ${transitPhrase} ને practical રીતે સંભાળો.`,
      cues: cues.map(cue => ({
        ...cue,
        label: cue.area === 'career' ? 'કારકિર્દી' : cue.area === 'money' ? 'ધન' : 'સંબંધ',
        text: gujaratiCueText(cue),
      })),
      emotionalWeather:
        'Moon એટલે મનનો સંકેત: નિર્ણય પહેલાં લાગણીને સરળ શબ્દોમાં બોલો.',
      remedyMicroAction:
        remedyMicroAction === ''
          ? 'ત્રણ શાંત મિનિટ લઈને આજની એક priority લખો.'
          : `સરળ ઉપાય: ${remedyMicroAction}`,
      todayTheme: `${firstName}, આજે steady કામ અને સ્પષ્ટ પસંદગી તમને મદદ કરશે. Sanskrit/Jyotish શબ્દ આવે તો તેનો અર્થ સરળ રીતે સમજવો.`,
    };
  }

  return {
    avoidAction,
    bestAction,
    cues,
    emotionalWeather,
    remedyMicroAction,
    todayTheme: theme,
  };
}

function hindiCueText(cue: DailyBriefingCue): string {
  if (cue.area === 'career') {
    return 'काम में visible output और साफ follow-through रखें.';
  }
  if (cue.area === 'money') {
    return 'पैसों में सरल हिसाब और conservative promise बेहतर रहेगा.';
  }
  return 'सीधी और दयालु भाषा इस्तेमाल करें; indirect testing से बचें.';
}

function gujaratiCueText(cue: DailyBriefingCue): string {
  if (cue.area === 'career') {
    return 'કામમાં visible output અને સ્પષ્ટ follow-through રાખો.';
  }
  if (cue.area === 'money') {
    return 'પૈસામાં સરળ હિસાબ અને conservative promise વધુ સારું રહેશે.';
  }
  return 'સીધી અને દયાળુ ભાષા વાપરો; indirect testing ટાળો.';
}

function buildPendingBriefingCopy(language: SupportedLanguage): Pick<
  DailyBriefing,
  | 'askPrompt'
  | 'avoidAction'
  | 'bestAction'
  | 'emotionalWeather'
  | 'evidence'
  | 'remedyMicroAction'
  | 'subtitle'
  | 'title'
  | 'todayTheme'
> & {
  notificationBody: string;
  notificationTitle: string;
} {
  if (language === 'hi') {
    return {
      askPrompt:
        'मेरी कुंडली बनने के बाद दशा, गोचर, Moon, Lagna, अष्टकवर्ग और उपाय के प्रमाण से दैनिक कॉस्मिक ब्रीफिंग बनाइए.',
      avoidAction: 'Generic horoscope को निजी मार्गदर्शन न मानें.',
      bestAction: 'सत्यापित जन्म विवरण से अपनी कुंडली बनाएं.',
      emotionalWeather:
        'Moon, Lagna और गोचर संदर्भ calculate होने तक प्रतीक्षा में.',
      evidence: [
        'अभी कोई सक्रिय कुंडली नहीं है.',
        'दैनिक ब्रीफिंग के लिए दशा, गोचर, Moon, Lagna और अष्टकवर्ग data चाहिए.',
        'Chart-aware daily guidance खोलने के लिए कुंडली बनाएं.',
      ],
      notificationBody: 'Personal daily briefing खोलने के लिए कुंडली बनाएं.',
      notificationTitle: 'आपकी Predicta briefing प्रतीक्षा में है',
      remedyMicroAction: 'अभी उपाय नहीं. पहले verified chart बनाएं.',
      subtitle: 'Real chart calculation के बाद personal daily briefing दिखेगी.',
      title: 'Daily briefing प्रतीक्षा में',
      todayTheme: 'आपका personal day map अभी तैयार नहीं है.',
    };
  }

  if (language === 'gu') {
    return {
      askPrompt:
        'મારી કુંડળી બને પછી દશા, ગોચર, Moon, Lagna, અષ્ટકવર્ગ અને ઉપાયના પુરાવાથી દૈનિક કોસ્મિક બ્રીફિંગ બનાવો.',
      avoidAction: 'Generic horoscope ને વ્યક્તિગત માર્ગદર્શન ન માનો.',
      bestAction: 'ચકાસેલા જન્મવિગતોથી તમારી કુંડળી બનાવો.',
      emotionalWeather:
        'Moon, Lagna અને ગોચર context calculate થાય ત્યાં સુધી pending.',
      evidence: [
        'હજુ કોઈ active કુંડળી નથી.',
        'દૈનિક briefing માટે દશા, ગોચર, Moon, Lagna અને અષ્ટકવર્ગ data જોઈએ.',
        'Chart-aware daily guidance unlock કરવા કુંડળી બનાવો.',
      ],
      notificationBody: 'Personal daily briefing unlock કરવા કુંડળી બનાવો.',
      notificationTitle: 'તમારી Predicta briefing રાહ જોઈ રહી છે',
      remedyMicroAction: 'હજુ ઉપાય નથી. પહેલા verified chart બનાવો.',
      subtitle: 'Real chart calculation પછી personal daily briefing દેખાશે.',
      title: 'Daily briefing waiting',
      todayTheme: 'તમારો personal day map હજુ તૈયાર નથી.',
    };
  }

  return {
    askPrompt:
      'Create my daily cosmic briefing after my kundli is generated, using dasha, transit, Moon, Lagna, and remedy evidence.',
    avoidAction: 'Do not treat a generic horoscope as personal guidance.',
    bestAction: 'Create your kundli from verified birth details.',
    emotionalWeather: 'Pending until Moon, Lagna, and transit context are calculated.',
    evidence: [
      'No kundli is active yet.',
      'Daily briefing needs dasha, transit, Moon, Lagna, and ashtakavarga data.',
      'Generate a kundli to unlock chart-aware daily guidance.',
    ],
    notificationBody: 'Create your kundli to unlock a personal daily briefing.',
    notificationTitle: 'Your Predicta briefing is waiting',
    remedyMicroAction: 'No remedy yet. First create a verified chart.',
    subtitle: 'A personal daily briefing appears after real chart calculation.',
    title: 'Daily briefing waiting',
    todayTheme: 'Your personal day map is not ready yet.',
  };
}

function buildPendingCues(language: SupportedLanguage): DailyBriefingCue[] {
  const copy = {
    en: [
      ['Career', 'Pending until the chart is calculated.'],
      ['Money', 'Pending until dasha and house strength are available.'],
      ['Relationship', 'Pending until Moon and Venus context are available.'],
    ],
    gu: [
      ['કારકિર્દી', 'Chart calculate થાય ત્યાં સુધી pending.'],
      ['ધન', 'દશા અને house strength મળે ત્યાં સુધી pending.'],
      ['સંબંધ', 'Moon અને Venus context મળે ત્યાં સુધી pending.'],
    ],
    hi: [
      ['करियर', 'Chart calculate होने तक प्रतीक्षा में.'],
      ['धन', 'दशा और house strength मिलने तक प्रतीक्षा में.'],
      ['संबंध', 'Moon और Venus context मिलने तक प्रतीक्षा में.'],
    ],
  }[language];

  return [
    {
      area: 'career',
      label: copy[0][0],
      text: copy[0][1],
      weight: 'neutral',
    },
    {
      area: 'money',
      label: copy[1][0],
      text: copy[1][1],
      weight: 'neutral',
    },
    {
      area: 'relationship',
      label: copy[2][0],
      text: copy[2][1],
      weight: 'neutral',
    },
  ];
}

function buildCues(
  kundli: KundliData,
  primaryTransit?: TransitInsight,
): DailyBriefingCue[] {
  const strongest = kundli.ashtakavarga.strongestHouses;
  const weakest = kundli.ashtakavarga.weakestHouses;

  return [
    {
      area: 'career',
      label: 'Career',
      text: strongest.includes(10)
        ? 'Use work hours for visible output and clean follow-through.'
        : `Keep career choices tied to ${kundli.dasha.current.mahadasha} discipline rather than urgency.`,
      weight: strongest.includes(10) ? 'supportive' : 'mixed',
    },
    {
      area: 'money',
      label: 'Money',
      text: weakest.includes(2) || weakest.includes(11)
        ? 'Keep spending and promises conservative today.'
        : 'Money choices are better handled through simple numbers and written priorities.',
      weight: weakest.includes(2) || weakest.includes(11) ? 'challenging' : 'neutral',
    },
    {
      area: 'relationship',
      label: 'Relationship',
      text: primaryTransit?.houseFromMoon === 7
        ? 'Listen twice before deciding what someone meant.'
        : 'Use direct, kind words. Avoid testing people indirectly.',
      weight: primaryTransit?.houseFromMoon === 7 ? 'mixed' : 'neutral',
    },
  ];
}

function pickPrimaryTransit(transits: TransitInsight[]): TransitInsight | undefined {
  const priority = ['Saturn', 'Jupiter', 'Rahu', 'Ketu', 'Mars', 'Moon'];

  return [...transits].sort((a, b) => {
    const priorityDelta = priorityIndex(priority, a.planet) - priorityIndex(priority, b.planet);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return weightScore(b.weight) - weightScore(a.weight);
  })[0];
}

function priorityIndex(priority: string[], planet: string): number {
  const index = priority.indexOf(planet);

  return index === -1 ? priority.length : index;
}

function weightScore(weight: TransitInsight['weight']): number {
  switch (weight) {
    case 'challenging':
      return 4;
    case 'mixed':
      return 3;
    case 'supportive':
      return 2;
    case 'neutral':
      return 1;
  }
}

function labelHouse(house?: number): string {
  switch (house) {
    case 1:
      return 'body and direction';
    case 2:
      return 'money and speech';
    case 3:
      return 'effort and courage';
    case 4:
      return 'home and inner stability';
    case 5:
      return 'learning and creativity';
    case 6:
      return 'routine and problem solving';
    case 7:
      return 'partnership';
    case 8:
      return 'change and patience';
    case 9:
      return 'study and guidance';
    case 10:
      return 'career';
    case 11:
      return 'gains and networks';
    case 12:
      return 'rest and release';
    default:
      return 'practical';
  }
}

function formatIsoDate(value: string): string {
  return value.slice(0, 10);
}

function formatDisplayDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
