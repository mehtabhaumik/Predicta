import type {
  BirthDetails,
  NumerologyCycleInsight,
  NumerologyFoundationProfile,
  NumerologyNameMethod,
  NumerologyNumberInsight,
} from '@pridicta/types';

type NumerologyInput = {
  birthDate: string;
  name: string;
  nameMethod?: NumerologyNameMethod;
  targetDate?: string;
};

const CHALDEAN_VALUES: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 8,
  G: 3,
  H: 5,
  I: 1,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 7,
  P: 8,
  Q: 1,
  R: 2,
  S: 3,
  T: 4,
  U: 6,
  V: 6,
  W: 6,
  X: 5,
  Y: 1,
  Z: 7,
};

const PYTHAGOREAN_VALUES: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  I: 9,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  O: 6,
  P: 7,
  Q: 8,
  R: 9,
  S: 1,
  T: 2,
  U: 3,
  V: 4,
  W: 5,
  X: 6,
  Y: 7,
  Z: 8,
};

const NUMBER_MEANINGS: Record<
  number,
  {
    cautions: string[];
    keywords: string[];
    label: string;
    meaning: string;
    strengths: string[];
  }
> = {
  1: {
    cautions: ['ego clashes', 'impatience', 'doing everything alone'],
    keywords: ['leadership', 'initiative', 'identity'],
    label: 'Leader',
    meaning: 'independence, self-direction, confidence, and starting power',
    strengths: ['leading clearly', 'starting new paths', 'taking ownership'],
  },
  2: {
    cautions: ['over-sensitivity', 'dependency', 'decision hesitation'],
    keywords: ['harmony', 'support', 'emotion'],
    label: 'Diplomat',
    meaning: 'cooperation, sensitivity, partnership, and emotional awareness',
    strengths: ['mediating', 'building trust', 'reading emotional tone'],
  },
  3: {
    cautions: ['scattered focus', 'over-talking', 'unfinished ideas'],
    keywords: ['expression', 'creativity', 'joy'],
    label: 'Creator',
    meaning: 'communication, creativity, joy, and visible self-expression',
    strengths: ['speaking well', 'creating', 'lifting the room'],
  },
  4: {
    cautions: ['rigidity', 'overwork', 'fear of change'],
    keywords: ['structure', 'discipline', 'foundation'],
    label: 'Builder',
    meaning: 'order, practical discipline, systems, and steady foundations',
    strengths: ['planning', 'finishing', 'building reliable routines'],
  },
  5: {
    cautions: ['restlessness', 'risk-taking', 'inconsistent discipline'],
    keywords: ['freedom', 'change', 'movement'],
    label: 'Explorer',
    meaning: 'freedom, travel, adaptability, communication, and change',
    strengths: ['adapting fast', 'networking', 'learning through variety'],
  },
  6: {
    cautions: ['over-responsibility', 'control through care', 'people-pleasing'],
    keywords: ['care', 'family', 'beauty'],
    label: 'Nurturer',
    meaning: 'family, service, beauty, responsibility, and emotional repair',
    strengths: ['caring deeply', 'making spaces better', 'protecting family'],
  },
  7: {
    cautions: ['isolation', 'over-analysis', 'distrust'],
    keywords: ['research', 'depth', 'spirituality'],
    label: 'Seeker',
    meaning: 'analysis, spiritual searching, privacy, and deep understanding',
    strengths: ['researching', 'detecting patterns', 'working deeply'],
  },
  8: {
    cautions: ['control issues', 'pressure around money', 'hardness'],
    keywords: ['power', 'money', 'karma'],
    label: 'Strategist',
    meaning: 'power, finance, management, responsibility, and karmic results',
    strengths: ['organizing resources', 'handling pressure', 'building authority'],
  },
  9: {
    cautions: ['emotional extremes', 'savior pattern', 'difficulty closing cycles'],
    keywords: ['completion', 'compassion', 'wisdom'],
    label: 'Humanitarian',
    meaning: 'completion, compassion, wisdom, service, and broad perspective',
    strengths: ['serving generously', 'seeing the big picture', 'forgiving wisely'],
  },
};

export function composeNumerologyFoundationModel(
  input?: NumerologyInput | BirthDetails,
): NumerologyFoundationProfile {
  const birthDate = input ? resolveBirthDate(input) : '';

  if (!input?.name || !birthDate) {
    return buildPendingNumerologyProfile();
  }

  const nameMethod = 'nameMethod' in input ? input.nameMethod : undefined;
  const targetDate =
    ('targetDate' in input ? input.targetDate : undefined) ??
    new Date().toISOString().slice(0, 10);
  const method = nameMethod ?? 'CHALDEAN';
  const normalizedName = normalizeNumerologyName(input.name);
  const nameNumber = calculateNameNumber(input.name, method);
  const birthNumber = calculateBirthNumber(birthDate);
  const destinyNumber = calculateDestinyNumber(birthDate);
  const cycles = calculatePersonalCycles(birthDate, targetDate);
  const strengths = uniqueList([
    ...nameNumber.keywords,
    ...birthNumber.keywords,
    ...destinyNumber.keywords,
  ]).slice(0, 6);
  const cautions = uniqueList([
    ...NUMBER_MEANINGS[nameNumber.root].cautions,
    ...NUMBER_MEANINGS[destinyNumber.root].cautions,
    ...NUMBER_MEANINGS[cycles.personalYear.root].cautions,
  ]).slice(0, 5);

  return {
    birthDate,
    birthNumber,
    cautions,
    destinyNumber,
    evidence: [
      `Name number ${nameNumber.root} comes from ${method.toLowerCase()} letter values applied to "${normalizedName}".`,
      `Birth number ${birthNumber.root} comes from the birth day in ${birthDate}.`,
      `Destiny number ${destinyNumber.root} comes from the full birth date ${birthDate}.`,
      `Personal year/month/day are calculated for ${targetDate}.`,
    ],
    guidance: buildGuidance({
      birthNumber,
      destinyNumber,
      nameNumber,
      personalDay: cycles.personalDay,
      personalMonth: cycles.personalMonth,
      personalYear: cycles.personalYear,
    }),
    limitations: [
      'Numerology is a guidance layer. It should support reflection, not replace practical judgement.',
      'Name spelling matters. A legal name, common name, and spiritual name can produce different name numbers.',
      'For full Predicta synthesis, numerology should be read with Kundli, dasha, gochar, and remedies.',
    ],
    method: {
      birthNumber: 'DAY_OF_MONTH_REDUCTION',
      destinyNumber: 'FULL_BIRTH_DATE_REDUCTION',
      nameNumber: method,
      personalCycles: 'DOB_PLUS_TARGET_DATE_REDUCTION',
    },
    name: input.name.trim(),
    nameNumber,
    normalizedName,
    personalDay: cycles.personalDay,
    personalMonth: cycles.personalMonth,
    personalYear: cycles.personalYear,
    status: 'ready',
    strengths,
    summary: `${input.name.trim()} carries name number ${nameNumber.root}, birth number ${birthNumber.root}, and destiny number ${destinyNumber.root}. Today sits in a personal day ${cycles.personalDay.root} rhythm.`,
    targetDate,
  };
}

function resolveBirthDate(input: NumerologyInput | BirthDetails): string {
  return 'birthDate' in input ? input.birthDate : input.date;
}

export function calculateNameNumber(
  name: string,
  method: NumerologyNameMethod = 'CHALDEAN',
): NumerologyNumberInsight {
  const normalized = normalizeNumerologyName(name);
  const values = method === 'PYTHAGOREAN' ? PYTHAGOREAN_VALUES : CHALDEAN_VALUES;
  const compound = [...normalized].reduce(
    (total, letter) => total + (values[letter] ?? 0),
    0,
  );

  return buildNumberInsight(compound);
}

export function calculateBirthNumber(birthDate: string): NumerologyNumberInsight {
  const { day } = parseIsoDateParts(birthDate);
  return buildNumberInsight(day);
}

export function calculateDestinyNumber(birthDate: string): NumerologyNumberInsight {
  parseIsoDateParts(birthDate);
  const digits = birthDate.replace(/\D/g, '');
  return buildNumberInsight(sumDigits(digits));
}

export function calculatePersonalCycles(
  birthDate: string,
  targetDate: string,
): {
  personalDay: NumerologyCycleInsight;
  personalMonth: NumerologyCycleInsight;
  personalYear: NumerologyCycleInsight;
} {
  const birth = parseIsoDateParts(birthDate);
  const target = parseIsoDateParts(targetDate);
  const personalYearCompound = sumDigits(
    `${birth.month}${birth.day}${target.year}`,
  );
  const personalYear = buildCycleInsight(personalYearCompound, 'year', targetDate);
  const personalMonth = buildCycleInsight(
    personalYear.root + target.month,
    'month',
    targetDate,
  );
  const personalDay = buildCycleInsight(
    personalMonth.root + target.day,
    'day',
    targetDate,
  );

  return {
    personalDay,
    personalMonth,
    personalYear,
  };
}

export function normalizeNumerologyName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}

function buildPendingNumerologyProfile(): NumerologyFoundationProfile {
  const pending = buildNumberInsight(0);
  const today = new Date().toISOString().slice(0, 10);

  return {
    birthDate: '',
    birthNumber: pending,
    cautions: [],
    destinyNumber: pending,
    evidence: ['Add name and birth date to prepare a numerology profile.'],
    guidance: 'Add name and birth date to calculate name, birth, destiny, and personal timing numbers.',
    limitations: ['Numerology needs a name and birth date.'],
    method: {
      birthNumber: 'DAY_OF_MONTH_REDUCTION',
      destinyNumber: 'FULL_BIRTH_DATE_REDUCTION',
      nameNumber: 'CHALDEAN',
      personalCycles: 'DOB_PLUS_TARGET_DATE_REDUCTION',
    },
    name: 'Predicta Seeker',
    nameNumber: pending,
    normalizedName: '',
    personalDay: { ...pending, date: today, period: 'day' },
    personalMonth: { ...pending, date: today, period: 'month' },
    personalYear: { ...pending, date: today, period: 'year' },
    status: 'pending',
    strengths: [],
    summary: 'Numerology profile is waiting for name and birth date.',
    targetDate: today,
  };
}

function buildGuidance({
  birthNumber,
  destinyNumber,
  nameNumber,
  personalDay,
  personalMonth,
  personalYear,
}: {
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  nameNumber: NumerologyNumberInsight;
  personalDay: NumerologyCycleInsight;
  personalMonth: NumerologyCycleInsight;
  personalYear: NumerologyCycleInsight;
}): string {
  return [
    `Name number ${nameNumber.root} shows how the name projects into the world.`,
    `Birth number ${birthNumber.root} shows instinctive style.`,
    `Destiny number ${destinyNumber.root} shows the longer life direction.`,
    `Personal year ${personalYear.root}, month ${personalMonth.root}, and day ${personalDay.root} show the current timing rhythm.`,
  ].join(' ');
}

function buildCycleInsight(
  compound: number,
  period: NumerologyCycleInsight['period'],
  date: string,
): NumerologyCycleInsight {
  return {
    ...buildNumberInsight(compound),
    date,
    period,
  };
}

function buildNumberInsight(compound: number): NumerologyNumberInsight {
  const root = reduceToRoot(compound);
  if (root === 0) {
    return {
      compound,
      keywords: [],
      label: 'Pending',
      root,
      simpleMeaning: 'waiting for name and birth date',
    };
  }

  const meaning = NUMBER_MEANINGS[root] ?? NUMBER_MEANINGS[9];

  return {
    compound,
    keywords: meaning.keywords,
    label: meaning.label,
    root,
    simpleMeaning: meaning.meaning,
  };
}

function parseIsoDateParts(date: string): {
  day: number;
  month: number;
  year: number;
} {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    throw new Error('Numerology date must use YYYY-MM-DD format.');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error('Numerology date is not a valid calendar date.');
  }

  return {
    day,
    month,
    year,
  };
}

function reduceToRoot(value: number): number {
  const absolute = Math.abs(Math.trunc(value));

  if (absolute === 0) {
    return 0;
  }

  let current = absolute;

  while (current > 9) {
    current = sumDigits(String(current));
  }

  return current;
}

function sumDigits(value: string | number): number {
  return String(value)
    .replace(/\D/g, '')
    .split('')
    .reduce((total, digit) => total + Number(digit), 0);
}

function uniqueList(items: string[]): string[] {
  return [...new Set(items)];
}
