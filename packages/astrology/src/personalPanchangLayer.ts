import type {
  KundliData,
  PersonalPanchangLayer,
  PersonalPanchangSignal,
  PersonalPanchangTone,
  TransitInsight,
} from '@pridicta/types';

const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

const NAKSHATRAS = [
  'Ashwini',
  'Bharani',
  'Krittika',
  'Rohini',
  'Mrigashira',
  'Ardra',
  'Punarvasu',
  'Pushya',
  'Ashlesha',
  'Magha',
  'Purva Phalguni',
  'Uttara Phalguni',
  'Hasta',
  'Chitra',
  'Swati',
  'Vishakha',
  'Anuradha',
  'Jyeshtha',
  'Mula',
  'Purva Ashadha',
  'Uttara Ashadha',
  'Shravana',
  'Dhanishta',
  'Shatabhisha',
  'Purva Bhadrapada',
  'Uttara Bhadrapada',
  'Revati',
] as const;

const WEEKDAY_LORDS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
] as const;

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

const DAY_LORD_FOCUS: Record<string, string> = {
  Jupiter: 'learning, guidance, dharma, children, and wise planning',
  Mars: 'courage, exercise, direct action, property, and clean boundaries',
  Mercury: 'study, writing, business, messages, and careful decisions',
  Moon: 'emotional steadiness, home rhythm, food, rest, and family care',
  Saturn: 'discipline, duty, patience, service, and finishing pending work',
  Sun: 'confidence, authority, father figures, leadership, and visibility',
  Venus: 'relationships, art, comfort, money habits, and graceful repair',
};

const DAY_LORD_REMEDY: Record<string, string> = {
  Jupiter: 'Respect a teacher or elder, share useful knowledge, and keep one promise made for learning.',
  Mars: 'Move the body, speak directly without anger, and protect someone without dominating them.',
  Mercury: 'Clean up one message, document, or money detail before making a new commitment.',
  Moon: 'Hydrate well, keep food simple, and give care to mother, home, or someone emotionally unsettled.',
  Saturn: 'Do one difficult task on time and serve an elderly, struggling, or ignored person with humility.',
  Sun: 'Take morning light if possible, act honestly with authority, and avoid ego-driven speech.',
  Venus: 'Keep the environment clean, repair one relationship tone, and avoid indulgence that creates regret.',
};

export function composePersonalPanchangLayer(
  kundli?: KundliData,
  options: {
    nowIso?: string;
  } = {},
): PersonalPanchangLayer {
  const now = new Date(options.nowIso ?? new Date().toISOString());
  const date = now.toISOString().slice(0, 10);
  const weekday = WEEKDAY_NAMES[now.getDay()];
  const weekdayLord = WEEKDAY_LORDS[now.getDay()];

  if (!kundli) {
    return {
      askPrompt:
        'Create my Kundli, then show my personal Panchang for today with Moon rhythm, tithi, best actions, cautions, and remedy.',
      avoidFor: ['Final muhurta selection', 'High-stakes decisions without a personal chart'],
      bestFor: ['Simple planning', 'Daily routine', 'Creating your Kundli'],
      date,
      evidence: [
        `${weekday} is ruled by ${weekdayLord}.`,
        'No Kundli is selected yet, so this is a day-lord preview.',
      ],
      limitations: ['Create a Kundli to personalize this with Moon, tithi, dasha, and chart focus.'],
      moonNakshatra: 'Unknown',
      moonSign: 'Unknown',
      paksha: 'Unknown',
      personalRemedy: DAY_LORD_REMEDY[weekdayLord],
      signals: [
        buildSignal(
          'weekday-lord',
          'Day lord',
          weekdayLord,
          DAY_LORD_FOCUS[weekdayLord],
          'steady',
        ),
      ],
      status: 'pending',
      subtitle: 'A simple day-lord preview until your Kundli is ready.',
      tithi: 'Unknown',
      title: 'Personal Panchang is waiting.',
      todayFocus: DAY_LORD_FOCUS[weekdayLord],
      weekday,
      weekdayLord,
    };
  }

  const moonTransit = findTransit(kundli, 'Moon');
  const sunTransit = findTransit(kundli, 'Sun');
  const moonLongitude = moonTransit ? absoluteLongitude(moonTransit) : undefined;
  const sunLongitude = sunTransit ? absoluteLongitude(sunTransit) : undefined;
  const moonNakshatra =
    moonLongitude === undefined ? kundli.nakshatra : nakshatraFromLongitude(moonLongitude);
  const tithi =
    moonLongitude === undefined || sunLongitude === undefined
      ? 'Needs current Sun/Moon transit'
      : tithiName(moonLongitude, sunLongitude);
  const paksha = resolvePaksha(tithi);
  const dashaLord = kundli.dasha.current.mahadasha;
  const todayFocus = buildTodayFocus(weekdayLord, moonNakshatra, dashaLord);
  const tone = resolveTone(moonTransit, weekdayLord, dashaLord);
  const bestFor = buildBestFor(weekdayLord, moonNakshatra, tone);
  const avoidFor = buildAvoidFor(weekdayLord, tone);
  const signals: PersonalPanchangSignal[] = [
    buildSignal(
      'weekday-lord',
      'Day lord',
      weekdayLord,
      DAY_LORD_FOCUS[weekdayLord],
      dashaLord === weekdayLord ? 'supportive' : 'steady',
    ),
    buildSignal(
      'tithi',
      'Tithi',
      tithi,
      paksha === 'Shukla'
        ? 'Build, begin, repair, and grow with moderation.'
        : paksha === 'Krishna'
          ? 'Simplify, review, release, and finish pending work.'
          : 'Tithi needs current Sun and Moon transits.',
      paksha === 'Unknown' ? 'careful' : 'steady',
    ),
    buildSignal(
      'moon-rhythm',
      'Moon rhythm',
      moonNakshatra,
      `Current Moon rhythm is read against natal ${kundli.nakshatra}. Keep the mind steady before judging the day.`,
      moonTransit?.weight === 'challenging' ? 'careful' : 'supportive',
    ),
    buildSignal(
      'dasha-lord',
      'Current chapter',
      `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
      `${dashaLord} Mahadasha remains the larger background behind today's Panchang.`,
      'steady',
    ),
  ];

  return {
    askPrompt:
      'Read my personal Panchang for today with weekday lord, tithi, Moon nakshatra, current dasha, best actions, cautions, and one remedy.',
    avoidFor,
    bestFor,
    date,
    evidence: [
      `${weekday} is ruled by ${weekdayLord}.`,
      moonTransit
        ? `Current Moon is in ${moonTransit.sign}, house ${moonTransit.houseFromLagna} from Lagna and house ${moonTransit.houseFromMoon} from Moon.`
        : 'Current Moon transit was not available, so natal Moon rhythm is used carefully.',
      sunTransit ? `Current Sun is in ${sunTransit.sign}.` : 'Current Sun transit was not available.',
      `Current dasha is ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`,
    ],
    limitations: [
      'This is a personal daily planning layer, not a full muhurta selection.',
      'High-stakes medical, legal, financial, travel, or marriage decisions still need qualified guidance and exact muhurta review.',
      'Tithi and Moon-star depend on available current sky transit data.',
    ],
    moonNakshatra,
    moonSign: moonTransit?.sign ?? kundli.moonSign,
    natalNakshatra: kundli.nakshatra,
    paksha,
    personalRemedy: buildRemedy(weekdayLord, dashaLord),
    signals,
    status: 'ready',
    subtitle:
      'Today through weekday lord, tithi, Moon rhythm, and your current dasha.',
    tithi,
    title: `${kundli.birthDetails.name}'s Personal Panchang`,
    todayFocus,
    weekday,
    weekdayLord,
  };
}

function findTransit(kundli: KundliData, planet: string): TransitInsight | undefined {
  return (kundli.transits ?? []).find(
    transit => transit.planet.toLowerCase() === planet.toLowerCase(),
  );
}

function absoluteLongitude(transit: TransitInsight): number {
  return normalizeDegrees(signOffset(transit.sign) + transit.degree);
}

function signOffset(sign: string): number {
  const index = SIGNS.findIndex(item => item.toLowerCase() === sign.toLowerCase());
  return Math.max(0, index) * 30;
}

function nakshatraFromLongitude(longitude: number): string {
  const index = Math.floor(normalizeDegrees(longitude) / (360 / 27));
  return NAKSHATRAS[clamp(index, 0, NAKSHATRAS.length - 1)];
}

function tithiName(moonLongitude: number, sunLongitude: number): string {
  const elongation = normalizeDegrees(moonLongitude - sunLongitude);
  const tithiNumber = Math.floor(elongation / 12) + 1;
  const names = [
    'Pratipada',
    'Dwitiya',
    'Tritiya',
    'Chaturthi',
    'Panchami',
    'Shashthi',
    'Saptami',
    'Ashtami',
    'Navami',
    'Dashami',
    'Ekadashi',
    'Dwadashi',
    'Trayodashi',
    'Chaturdashi',
    'Purnima',
  ];
  const paksha = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const name =
    tithiNumber <= 15
      ? names[tithiNumber - 1]
      : tithiNumber === 30
        ? 'Amavasya'
        : names[Math.min(13, tithiNumber - 16)] ?? 'Amavasya';
  return `${paksha} ${name}`;
}

function resolvePaksha(tithi: string): PersonalPanchangLayer['paksha'] {
  if (tithi.startsWith('Shukla')) {
    return 'Shukla';
  }
  if (tithi.startsWith('Krishna')) {
    return 'Krishna';
  }
  return 'Unknown';
}

function buildTodayFocus(
  weekdayLord: string,
  moonNakshatra: string,
  dashaLord: string,
): string {
  if (weekdayLord === dashaLord) {
    return `${weekdayLord} is both day lord and Mahadasha lord, so keep the day focused on ${DAY_LORD_FOCUS[weekdayLord]}.`;
  }
  return `${weekdayLord} sets the daily tone for ${DAY_LORD_FOCUS[weekdayLord]}, while ${dashaLord} remains the larger life chapter. Moon in ${moonNakshatra} colors the mental rhythm.`;
}

function buildBestFor(
  weekdayLord: string,
  moonNakshatra: string,
  tone: PersonalPanchangTone,
): string[] {
  const baseline = [
    DAY_LORD_FOCUS[weekdayLord].split(',').slice(0, 2).join(' and '),
    `Moon rhythm work around ${moonNakshatra}`,
    'Small commitments you can complete today',
  ];
  if (tone === 'supportive') {
    return ['Starting one clear task', ...baseline].slice(0, 4);
  }
  if (tone === 'careful') {
    return ['Review before action', 'Repair and simplify', ...baseline].slice(0, 4);
  }
  return baseline;
}

function buildAvoidFor(weekdayLord: string, tone: PersonalPanchangTone): string[] {
  const baseline = [
    'Fear-based prediction',
    'High-stakes decisions without real-world review',
  ];
  if (weekdayLord === 'Mars') {
    baseline.unshift('Angry replies and impulsive confrontation');
  } else if (weekdayLord === 'Saturn') {
    baseline.unshift('Skipping duty, deadlines, or humility');
  } else if (weekdayLord === 'Rahu') {
    baseline.unshift('Shortcuts and obsession');
  } else {
    baseline.unshift('Overcommitting before checking details');
  }
  if (tone === 'careful') {
    baseline.unshift('Rushing because the mind feels pressured');
  }
  return baseline.slice(0, 4);
}

function buildRemedy(weekdayLord: string, dashaLord: string): string {
  const dayRemedy = DAY_LORD_REMEDY[weekdayLord];
  if (weekdayLord === dashaLord) {
    return `${dayRemedy} Because ${weekdayLord} is also your Mahadasha lord, keep it practical and consistent.`;
  }
  return dayRemedy;
}

function resolveTone(
  moonTransit: TransitInsight | undefined,
  weekdayLord: string,
  dashaLord: string,
): PersonalPanchangTone {
  if (moonTransit?.weight === 'challenging') {
    return 'careful';
  }
  if (weekdayLord === dashaLord || moonTransit?.weight === 'supportive') {
    return 'supportive';
  }
  return 'steady';
}

function buildSignal(
  id: string,
  label: string,
  value: string,
  meaning: string,
  tone: PersonalPanchangTone,
): PersonalPanchangSignal {
  return {
    id,
    label,
    meaning,
    tone,
    value,
  };
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
