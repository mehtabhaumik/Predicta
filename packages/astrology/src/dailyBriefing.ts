import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
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
    avoidAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.dd1f1c5678"),
    bestAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.c1b04052a8"),
    emotionalWeather: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.ab19a438b8"),
    eyebrow: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.8a82fbe34d"),
    proof: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.7e2d581bfd"),
    remedy: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.dd1c059e84"),
    theme: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.a957de9cda"),
  },
  hi: {
    avoidAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.e0d10c98ec"),
    bestAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.c2b9d3434a"),
    emotionalWeather: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.30b254fb05"),
    eyebrow: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.beb8c523e5"),
    proof: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.53cc4db45e"),
    remedy: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.36106fbe5f"),
    theme: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.ca27ce10e9"),
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
    return formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.b740e70de6", [date]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.efb9e5e1be", [date]);
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
      avoidAction: formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.c324d235ef", [weakHouse]),
      bestAction: formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.e3d81fa5f1", [transitPhrase]),
      cues: cues.map(cue => ({
        ...cue,
        label: cue.area === 'career' ? getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.3968c1424c") : cue.area === 'money' ? getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.4a727823f0") : getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.9d4cd64169"),
        text: hindiCueText(cue),
      })),
      emotionalWeather:
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.7c493d81a8"),
      remedyMicroAction:
        remedyMicroAction === ''
          ? getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.b5b11afae6")
          : formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.225960ffc3", [remedyMicroAction]),
      todayTheme: formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.a41b9fdead", [firstName]),
    };
  }

  if (language === 'gu') {
    return {
      avoidAction: formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.b9af0d4bb9", [weakHouse]),
      bestAction: formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.cd1fca0d88", [transitPhrase]),
      cues: cues.map(cue => ({
        ...cue,
        label: cue.area === 'career' ? getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.0de6a39828") : cue.area === 'money' ? getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.a0cf33e8c0") : getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.a870d9ae3e"),
        text: gujaratiCueText(cue),
      })),
      emotionalWeather:
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.af948174fd"),
      remedyMicroAction:
        remedyMicroAction === ''
          ? getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.ed37506765")
          : formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.d249f4bda6", [remedyMicroAction]),
      todayTheme: formatNativeCopy("native.packages.astrology.src.dailyBriefing.ts.0ed11bf63a", [firstName]),
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
    return getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.dbc0f543c3");
  }
  if (cue.area === 'money') {
    return getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.be5202f357");
  }
  return getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.3f95a9b107");
}

function gujaratiCueText(cue: DailyBriefingCue): string {
  if (cue.area === 'career') {
    return getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.aaab67ae56");
  }
  if (cue.area === 'money') {
    return getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.d8aa4526fe");
  }
  return getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.9f66808863");
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
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.78b46af0fc"),
      avoidAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.5fa42fd7a9"),
      bestAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.373a86f065"),
      emotionalWeather:
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.07b9023877"),
      evidence: [
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.86d6c3a377"),
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.66417aae31"),
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.7c61bd0dfe"),
      ],
      notificationBody: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.682c1fa071"),
      notificationTitle: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.d5daec55a1"),
      remedyMicroAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.5283fbb87f"),
      subtitle: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.23c87a8dec"),
      title: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.950a91c0a5"),
      todayTheme: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.0926de4292"),
    };
  }

  if (language === 'gu') {
    return {
      askPrompt:
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.a79d49d309"),
      avoidAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.fce6d3e1a7"),
      bestAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.557d6d278b"),
      emotionalWeather:
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.d36002c9af"),
      evidence: [
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.ecee209247"),
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.a98ceebb51"),
        getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.3ec20e60b0"),
      ],
      notificationBody: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.081ad33645"),
      notificationTitle: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.b435c97801"),
      remedyMicroAction: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.7c5f02cc23"),
      subtitle: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.03072009c1"),
      title: 'Daily briefing waiting',
      todayTheme: getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.80b286ed84"),
    };
  }

  return {
    askPrompt:
      'Create my daily cosmic briefing after my kundli is generated, using dasha, transit, Moon, Lagna, and remedy evidence.',
    avoidAction: 'Do not treat a generic horoscope as personal guidance.',
    bestAction: 'Create your kundli from verified birth details.',
    emotionalWeather: 'Pending until Moon, Lagna, and transit context are calculated.',
    evidence: [
      'Create or select a Kundli first.',
      'Daily briefing uses dasha, transit, Moon, Lagna, and ashtakavarga data.',
      'Create a Kundli to prepare chart-aware daily guidance.',
    ],
    notificationBody: 'Create your kundli to unlock a personal daily briefing.',
    notificationTitle: 'Your Predicta briefing is waiting',
    remedyMicroAction: 'No remedy yet. First create a verified chart.',
    subtitle: 'A personal daily briefing appears after real chart calculation.',
    title: 'Daily briefing waiting',
    todayTheme: 'Create a Kundli to prepare your personal day map.',
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
      [getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.0de6a39828"), getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.0d8a26d4ae")],
      [getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.a0cf33e8c0"), getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.701c33b2ee")],
      [getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.a870d9ae3e"), getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.4cbaec883b")],
    ],
    hi: [
      [getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.3968c1424c"), getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.9f8a367737")],
      [getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.4a727823f0"), getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.0b98227f88")],
      [getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.9d4cd64169"), getNativeCopy("native.packages.astrology.src.dailyBriefing.ts.c36a02d14f")],
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
        : 'Use direct, kind words. Avoid turning silence into a test.',
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
