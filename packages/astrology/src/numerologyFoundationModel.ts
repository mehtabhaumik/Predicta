import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import { translateUiText } from '@pridicta/config/uiTranslations';
import type {
  BirthDetails,
  NumerologyCycleInsight,
  NumerologyFrequencyCell,
  NumerologyFoundationProfile,
  NumerologyIdentityDashboard,
  NumerologyMandalaNode,
  NumerologyNameMethod,
  NumerologyNameScannerStep,
  NumerologyNumberInsight,
  NumerologyPatternTone,
  NumerologyYearTimelineMonth,
  SupportedLanguage,
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

const MANDALA_COLORS = [
  '#2F6FED',
  '#10A66A',
  '#D94C9A',
  '#C8A96A',
  '#20A4A8',
  '#8A6BE8',
] as const;

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const CYCLE_ACTIONS: Record<number, { avoid: string; guidance: string; leanInto: string; keyword: string }> = {
  1: {
    avoid: 'forcing everything alone',
    guidance: 'Start cleanly, choose one visible move, and keep the first step simple.',
    keyword: 'Launch',
    leanInto: 'fresh starts and decisive action',
  },
  2: {
    avoid: 'rushing delicate conversations',
    guidance: 'Repair trust, listen closely, and let the next step form through cooperation.',
    keyword: 'Repair',
    leanInto: 'patience, partnership, and emotional timing',
  },
  3: {
    avoid: 'scattering your voice across too many ideas',
    guidance: 'Express the useful message, create with warmth, and finish one visible piece.',
    keyword: 'Express',
    leanInto: 'communication, creativity, and joy',
  },
  4: {
    avoid: 'turning discipline into pressure',
    guidance: 'Build the system, simplify the routine, and let consistency do the heavy lifting.',
    keyword: 'Build',
    leanInto: 'structure, routines, and practical foundations',
  },
  5: {
    avoid: 'change for the sake of escape',
    guidance: 'Move, test, learn, and keep enough structure around the freedom.',
    keyword: 'Explore',
    leanInto: 'adaptability, travel, and useful experiments',
  },
  6: {
    avoid: 'carrying everyone else before yourself',
    guidance: 'Care with boundaries, improve the home base, and make beauty practical.',
    keyword: 'Care',
    leanInto: 'family, service, repair, and responsibility',
  },
  7: {
    avoid: 'withdrawing so far that support cannot reach you',
    guidance: 'Research, reflect, and let quiet focus reveal the cleaner answer.',
    keyword: 'Learn',
    leanInto: 'study, depth, privacy, and spiritual clarity',
  },
  8: {
    avoid: 'measuring worth only through pressure or money',
    guidance: 'Organize resources, negotiate clearly, and make power accountable.',
    keyword: 'Lead',
    leanInto: 'authority, finance, strategy, and results',
  },
  9: {
    avoid: 'reopening cycles that are asking to close',
    guidance: 'Complete, forgive wisely, release clutter, and serve from the bigger view.',
    keyword: 'Close',
    leanInto: 'completion, compassion, and perspective',
  },
};

export function composeNumerologyFoundationModel(
  input?: NumerologyInput | BirthDetails,
  language: SupportedLanguage = 'en',
): NumerologyFoundationProfile {
  const birthDate = input ? resolveBirthDate(input) : '';

  if (!input?.name || !birthDate) {
    return buildPendingNumerologyProfile(language);
  }

  const nameMethod = 'nameMethod' in input ? input.nameMethod : undefined;
  const targetDate =
    ('targetDate' in input ? input.targetDate : undefined) ??
    new Date().toISOString().slice(0, 10);
  const method = nameMethod ?? 'CHALDEAN';
  const normalizedName = normalizeNumerologyName(input.name);
  const nameNumber = calculateNameNumber(input.name, method, language);
  const birthNumber = calculateBirthNumber(birthDate, language);
  const destinyNumber = calculateDestinyNumber(birthDate, language);
  const cycles = calculatePersonalCycles(birthDate, targetDate, language);
  const strengths = uniqueList([
    ...nameNumber.keywords,
    ...birthNumber.keywords,
    ...destinyNumber.keywords,
  ]).slice(0, 6);
  const cautions = uniqueList([
    ...getNumberMeaning(nameNumber.root, language).cautions,
    ...getNumberMeaning(destinyNumber.root, language).cautions,
    ...getNumberMeaning(cycles.personalYear.root, language).cautions,
  ]).slice(0, 5);
  const identityDashboard = buildNumerologyIdentityDashboard({
    birthDate,
    birthNumber,
    cautions,
    destinyNumber,
    language,
    method,
    name: input.name.trim(),
    nameNumber,
    normalizedName,
    personalDay: cycles.personalDay,
    personalMonth: cycles.personalMonth,
    personalYear: cycles.personalYear,
    strengths,
    targetDate,
  });

  return {
    birthDate,
    birthNumber,
    cautions,
    destinyNumber,
    evidence: buildEvidence({
      birthDate,
      birthNumber,
      destinyNumber,
      language,
      method,
      nameNumber,
      normalizedName,
      targetDate,
    }),
    guidance: buildGuidance({
      birthNumber,
      destinyNumber,
      language,
      nameNumber,
      personalDay: cycles.personalDay,
      personalMonth: cycles.personalMonth,
      personalYear: cycles.personalYear,
    }),
    identityDashboard,
    limitations: buildLimitations(language),
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
    summary: buildSummary({
      birthNumber,
      destinyNumber,
      language,
      name: input.name.trim(),
      nameNumber,
      personalDay: cycles.personalDay,
    }),
    targetDate,
  };
}

function resolveBirthDate(input: NumerologyInput | BirthDetails): string {
  return 'birthDate' in input ? input.birthDate : input.date;
}

export function calculateNameNumber(
  name: string,
  method: NumerologyNameMethod = 'CHALDEAN',
  language: SupportedLanguage = 'en',
): NumerologyNumberInsight {
  const normalized = normalizeNumerologyName(name);
  const values = method === 'PYTHAGOREAN' ? PYTHAGOREAN_VALUES : CHALDEAN_VALUES;
  const compound = [...normalized].reduce(
    (total, letter) => total + (values[letter] ?? 0),
    0,
  );

  return buildNumberInsight(compound, language);
}

export function calculateBirthNumber(
  birthDate: string,
  language: SupportedLanguage = 'en',
): NumerologyNumberInsight {
  const { day } = parseIsoDateParts(birthDate);
  return buildNumberInsight(day, language);
}

export function calculateDestinyNumber(
  birthDate: string,
  language: SupportedLanguage = 'en',
): NumerologyNumberInsight {
  parseIsoDateParts(birthDate);
  const digits = birthDate.replace(/\D/g, '');
  return buildNumberInsight(sumDigits(digits), language);
}

export function calculatePersonalCycles(
  birthDate: string,
  targetDate: string,
  language: SupportedLanguage = 'en',
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
  const personalYear = buildCycleInsight(
    personalYearCompound,
    'year',
    targetDate,
    language,
  );
  const personalMonth = buildCycleInsight(
    personalYear.root + target.month,
    'month',
    targetDate,
    language,
  );
  const personalDay = buildCycleInsight(
    personalMonth.root + target.day,
    'day',
    targetDate,
    language,
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

function buildPendingNumerologyProfile(
  language: SupportedLanguage,
): NumerologyFoundationProfile {
  const pending = buildNumberInsight(0, language);
  const today = new Date().toISOString().slice(0, 10);

  return {
    birthDate: '',
    birthNumber: pending,
    cautions: [],
    destinyNumber: pending,
    evidence: [getPendingEvidence(language)],
    guidance: getPendingGuidance(language),
    identityDashboard: buildPendingNumerologyIdentityDashboard(language, today),
    limitations: [getPendingLimitation(language)],
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
    summary: getPendingSummary(language),
    targetDate: today,
  };
}

export function buildNumerologyIdentityDashboard({
  birthDate,
  birthNumber,
  cautions,
  destinyNumber,
  language,
  method,
  name,
  nameNumber,
  normalizedName,
  personalDay,
  personalMonth,
  personalYear,
  strengths,
  targetDate,
}: {
  birthDate: string;
  birthNumber: NumerologyNumberInsight;
  cautions: string[];
  destinyNumber: NumerologyNumberInsight;
  language: SupportedLanguage;
  method: NumerologyNameMethod;
  name: string;
  nameNumber: NumerologyNumberInsight;
  normalizedName: string;
  personalDay: NumerologyCycleInsight;
  personalMonth: NumerologyCycleInsight;
  personalYear: NumerologyCycleInsight;
  strengths: string[];
  targetDate: string;
}): NumerologyIdentityDashboard {
  const scanner = buildNameEnergyScanner(normalizedName, method, nameNumber);
  const frequencyMap = buildNumerologyFrequencyMap({
    birthDate,
    language,
    method,
    normalizedName,
  });
  const missingNumbers = frequencyMap
    .filter(cell => cell.tone === 'missing')
    .map(cell => cell.number);
  const repeatedNumbers = frequencyMap
    .filter(cell => cell.tone === 'repeated' || cell.tone === 'strong')
    .map(cell => cell.number);
  const strongNumbers = frequencyMap
    .filter(cell => cell.tone === 'strong')
    .map(cell => cell.number);
  const currentAction = localizeCycleAction(
    CYCLE_ACTIONS[personalYear.root] ?? CYCLE_ACTIONS[1],
    language,
  );
  const nameFitScore = buildNameFitScore({
    birthNumber,
    destinyNumber,
    language,
    nameNumber,
  });
  const supportiveToolkit = buildSupportiveToolkit({
    destinyNumber,
    language,
    nameNumber,
    personalYear,
  });
  const lifeThemeSentence = buildLifeThemeSentence({
    birthNumber,
    destinyNumber,
    language,
    nameNumber,
  });

  return {
    bestUseOfCurrentCycle: `${currentAction.keyword}: ${currentAction.guidance}`,
    calculationNote: buildCalculationNote({
      birthDate,
      language,
      method,
      name,
      normalizedName,
      targetDate,
    }),
    compatibilityLens: {
      confidence: 'low',
      frictionZones: [],
      howToWorkBetter: translateUiText(
        'Add another person, business, brand, or public name to compare rhythms without mixing other schools.',
        language,
      ),
      limitations: [
        translateUiText(
          'Compatibility needs a confirmed comparison name or birth date before Predicta can score it.',
          language,
        ),
        translateUiText(
          'Numerology compatibility is reflective guidance, not certainty about a relationship or business outcome.',
          language,
        ),
      ],
      status: 'pending',
      supportZones: [],
    },
    currentCycleAvoid: currentAction.avoid,
    currentCycleLeanInto: currentAction.leanInto,
    firstLetterInfluence: buildFirstLetterInfluence(normalizedName, method, language),
    freeInsight: buildFreeInsight({
      currentAction,
      language,
      lifeThemeSentence,
      personalYear,
    }),
    frequencyMap,
    lifeThemeSentence,
    mandalaNodes: buildMandalaNodes({
      birthNumber,
      destinyNumber,
      language,
      nameNumber,
      personalDay,
      personalMonth,
      personalYear,
    }),
    maturityDirection: buildMaturityDirection(destinyNumber, language),
    missingNumbers,
    nameRefinement: {
      comparisonNote:
        translateUiText(
          'Premium name refinement can compare spelling, brand, baby, business, or public-name options when the user provides them.',
          language,
        ),
      currentNameFit: nameFitScore,
      limitations: [
        translateUiText('Predicta never uses fear labels for a name.', language),
        translateUiText(
          'A name score is a reflective fit score, not a demand to change identity.',
          language,
        ),
      ],
      status: 'pending',
      suggestedInputs: [
        translateUiText('alternate spelling', language),
        translateUiText('brand or business name', language),
        translateUiText('baby name', language),
        translateUiText('public or stage name', language),
      ],
    },
    nameScanner: {
      compound: nameNumber.compound,
      method,
      normalizedName,
      reducedExpression: `${scanner.map(step => step.value).join(' + ')} -> ${nameNumber.compound}/${nameNumber.root}`,
      root: nameNumber.root,
      steps: scanner,
    },
    nameStrength: buildNameStrength(nameNumber, language),
    personalYearTimeline: buildPersonalYearTimeline({
      birthDate,
      language,
      targetDate,
    }),
    premiumDetail: buildPremiumDetail({
      birthNumber,
      cautions,
      language,
      missingNumbers,
      nameFitScore,
      nameNumber,
      personalDay,
      personalMonth,
      personalYear,
      destinyNumber,
      strengths,
      strongNumbers,
    }),
    repeatedNumbers,
    reportSummary: buildReportSummary({
      currentAction,
      language,
      lifeThemeSentence,
      personalYear,
    }),
    strongNumbers,
    supportiveToolkit,
  };
}

export function buildNumerologyFrequencyMap({
  birthDate,
  language = 'en',
  method,
  normalizedName,
}: {
  birthDate: string;
  language?: SupportedLanguage;
  method: NumerologyNameMethod;
  normalizedName: string;
}): NumerologyFrequencyCell[] {
  const values = method === 'PYTHAGOREAN' ? PYTHAGOREAN_VALUES : CHALDEAN_VALUES;
  const counts = new Map<number, number>();

  for (let number = 1; number <= 9; number += 1) {
    counts.set(number, 0);
  }

  for (const letter of normalizedName) {
    const value = values[letter];

    if (value) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  for (const digit of birthDate.replace(/\D/g, '')) {
    const value = Number(digit);

    if (value >= 1 && value <= 9) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return Array.from({ length: 9 }, (_, index) => {
    const number = index + 1;
    const count = counts.get(number) ?? 0;
    const tone = resolvePatternTone(count);
    const meaning = getNumberMeaning(number, language);

    return {
      count,
      insight: buildFrequencyInsight(number, count, tone, language),
      keyword: meaning.keywords[0] ?? meaning.label,
      number,
      tone,
    };
  });
}

export function buildPersonalYearTimeline({
  birthDate,
  language,
  targetDate,
}: {
  birthDate: string;
  language: SupportedLanguage;
  targetDate: string;
}): NumerologyYearTimelineMonth[] {
  const { year } = parseIsoDateParts(targetDate);

  return MONTH_LABELS.map((monthLabel, index) => {
    const month = index + 1;
    const date = `${year}-${String(month).padStart(2, '0')}-01`;
    const cycleNumber = calculatePersonalCycles(birthDate, date, language)
      .personalMonth.root;
    const action = CYCLE_ACTIONS[cycleNumber] ?? CYCLE_ACTIONS[1];
    const localizedAction = localizeCycleAction(action, language);

    return {
      cycleNumber,
      guidance: localizedAction.guidance,
      keyword: localizedAction.keyword,
      monthLabel: translateUiText(monthLabel, language),
    };
  });
}

export function buildLifeThemeSentence({
  birthNumber,
  destinyNumber,
  language,
  nameNumber,
}: {
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  language: SupportedLanguage;
  nameNumber: NumerologyNumberInsight;
}): string {
  if (language === 'hi') {
    return formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a7384082fe", [nameNumber.keywords[0] ?? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.7751c27b2e"), destinyNumber.keywords[0] ?? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a61eb801b1"), birthNumber.keywords[0] ?? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f1e36daa89")]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.7e9de291ed", [nameNumber.keywords[0] ?? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.efed2f999d"), destinyNumber.keywords[0] ?? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.bc42b4cf4a"), birthNumber.keywords[0] ?? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.3650639f1a")]);
  }

  return `Your number pattern asks you to turn ${nameNumber.keywords[0] ?? 'inner rhythm'} into ${destinyNumber.keywords[0] ?? 'life direction'} while keeping ${birthNumber.keywords[0] ?? 'instinct'} steady.`;
}

function buildPendingNumerologyIdentityDashboard(
  language: SupportedLanguage,
  today: string,
): NumerologyIdentityDashboard {
  const pendingFit = {
    confidence: 'low' as const,
    destinySupport: 0,
    expression: 0,
    limitations: [getPendingLimitation(language)],
    publicRhythm: 0,
    score: 0,
    stability: 0,
    summary: getPendingSummary(language),
  };

  return {
    bestUseOfCurrentCycle: getPendingGuidance(language),
    calculationNote: getPendingEvidence(language),
    compatibilityLens: {
      confidence: 'low',
      frictionZones: [],
      howToWorkBetter: getPendingGuidance(language),
      limitations: [getPendingLimitation(language)],
      status: 'pending',
      supportZones: [],
    },
    currentCycleAvoid: translateUiText(
      'guessing before name and birth date are available',
      language,
    ),
    currentCycleLeanInto: translateUiText('adding name and birth date', language),
    firstLetterInfluence: translateUiText('Pending until a name is available.', language),
    freeInsight: getPendingSummary(language),
    frequencyMap: buildNumerologyFrequencyMap({
      birthDate: '',
      language,
      method: 'CHALDEAN',
      normalizedName: '',
    }),
    lifeThemeSentence: getPendingSummary(language),
    mandalaNodes: [],
    maturityDirection: getPendingGuidance(language),
    missingNumbers: [],
    nameRefinement: {
      comparisonNote: translateUiText('Pending until a name is available.', language),
      currentNameFit: pendingFit,
      limitations: [getPendingLimitation(language)],
      status: 'pending',
      suggestedInputs: [],
    },
    nameScanner: {
      compound: 0,
      method: 'CHALDEAN',
      normalizedName: '',
      reducedExpression: translateUiText('Pending', language),
      root: 0,
      steps: [],
    },
    nameStrength: translateUiText('Pending until a name is available.', language),
    personalYearTimeline: [],
    premiumDetail: getPendingSummary(language),
    repeatedNumbers: [],
    reportSummary: getPendingSummary(language),
    strongNumbers: [],
    supportiveToolkit: {
      affirmation: translateUiText(
        'Add your details so Predicta can prepare a number profile.',
        language,
      ),
      colors: [],
      days: [],
      framing: translateUiText(
        'Supportive tools appear only after the number profile is ready.',
        language,
      ),
      habits: [],
      numbers: [],
    },
  };
}

function buildGuidance({
  birthNumber,
  destinyNumber,
  language,
  nameNumber,
  personalDay,
  personalMonth,
  personalYear,
}: {
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  language: SupportedLanguage;
  nameNumber: NumerologyNumberInsight;
  personalDay: NumerologyCycleInsight;
  personalMonth: NumerologyCycleInsight;
  personalYear: NumerologyCycleInsight;
}): string {
  if (language === 'hi') {
    return [
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a236786f29", [nameNumber.root]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.8a6a3db811", [birthNumber.root]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.057fbfede3", [destinyNumber.root]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.9b0e36a27e", [personalYear.root, personalMonth.root, personalDay.root]),
    ].join(' ');
  }

  if (language === 'gu') {
    return [
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b244c873cb", [nameNumber.root]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.fd1505088e", [birthNumber.root]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.208ce845fe", [destinyNumber.root]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.77ddcc8299", [personalYear.root, personalMonth.root, personalDay.root]),
    ].join(' ');
  }

  return [
    `Name number ${nameNumber.root} shows how the name projects into the world.`,
    `Birth number ${birthNumber.root} shows instinctive style.`,
    `Destiny number ${destinyNumber.root} shows the longer life direction.`,
    `Personal year ${personalYear.root}, month ${personalMonth.root}, and day ${personalDay.root} show the current timing rhythm.`,
  ].join(' ');
}

function buildNameEnergyScanner(
  normalizedName: string,
  method: NumerologyNameMethod,
  nameNumber: NumerologyNumberInsight,
): NumerologyNameScannerStep[] {
  const values = method === 'PYTHAGOREAN' ? PYTHAGOREAN_VALUES : CHALDEAN_VALUES;
  const steps = [...normalizedName].map(letter => ({
    letter,
    value: values[letter] ?? 0,
  }));
  const scannedTotal = steps.reduce((total, step) => total + step.value, 0);

  if (scannedTotal !== nameNumber.compound) {
    return steps.filter(step => step.value > 0);
  }

  return steps;
}

function buildMandalaNodes({
  birthNumber,
  destinyNumber,
  language,
  nameNumber,
  personalDay,
  personalMonth,
  personalYear,
}: {
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  language: SupportedLanguage;
  nameNumber: NumerologyNumberInsight;
  personalDay: NumerologyCycleInsight;
  personalMonth: NumerologyCycleInsight;
  personalYear: NumerologyCycleInsight;
}): NumerologyMandalaNode[] {
  return [
    ['name', 'Name', nameNumber],
    ['birth', 'Birth', birthNumber],
    ['destiny', 'Destiny', destinyNumber],
    ['personal-year', 'Personal Year', personalYear],
    ['personal-month', 'Personal Month', personalMonth],
    ['personal-day', 'Personal Day', personalDay],
  ].map(([id, label, insight], index) => {
    const numberInsight = insight as NumerologyNumberInsight;

    return {
      accessibleLabel: buildMandalaAccessibleLabel({
        label: label as string,
        language,
        insight: numberInsight,
      }),
      colorToken: MANDALA_COLORS[index],
      id: id as NumerologyMandalaNode['id'],
      keyword: numberInsight.keywords[0] ?? numberInsight.label,
      label: translateUiText(label as string, language),
      number: numberInsight.root,
      shortMeaning: numberInsight.simpleMeaning,
    };
  });
}

function buildMandalaAccessibleLabel({
  insight,
  label,
  language,
}: {
  insight: NumerologyNumberInsight;
  label: string;
  language: SupportedLanguage;
}): string {
  const localizedLabel = translateUiText(label, language);

  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.mandalaAccessibleLabel.hi', [
      localizedLabel,
      insight.root,
      insight.label,
      insight.simpleMeaning,
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.mandalaAccessibleLabel.gu', [
      localizedLabel,
      insight.root,
      insight.label,
      insight.simpleMeaning,
    ]);
  }

  return `${localizedLabel} number ${insight.root}, ${insight.label}: ${insight.simpleMeaning}`;
}

type LocalizedCycleAction = {
  avoid: string;
  guidance: string;
  leanInto: string;
  keyword: string;
};

function localizeCycleAction(
  action: (typeof CYCLE_ACTIONS)[number],
  language: SupportedLanguage,
): LocalizedCycleAction {
  return {
    avoid: translateUiText(action.avoid, language),
    guidance: translateUiText(action.guidance, language),
    keyword: translateUiText(action.keyword, language),
    leanInto: translateUiText(action.leanInto, language),
  };
}

function buildCalculationNote({
  birthDate,
  language,
  method,
  name,
  normalizedName,
  targetDate,
}: {
  birthDate: string;
  language: SupportedLanguage;
  method: NumerologyNameMethod;
  name: string;
  normalizedName: string;
  targetDate: string;
}): string {
  const visibleName = normalizedName || name;

  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.calculationNote.hi', [
      method,
      visibleName,
      birthDate,
      targetDate,
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.calculationNote.gu', [
      method,
      visibleName,
      birthDate,
      targetDate,
    ]);
  }

  return `${method} name values for ${visibleName}; birth and destiny numbers from ${birthDate}; personal cycles calculated for ${targetDate}.`;
}

function buildMaturityDirection(
  destinyNumber: NumerologyNumberInsight,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.maturityDirection.hi', [
      destinyNumber.root,
      destinyNumber.simpleMeaning,
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.maturityDirection.gu', [
      destinyNumber.root,
      destinyNumber.simpleMeaning,
    ]);
  }

  return `The destiny ${destinyNumber.root} pattern matures through ${destinyNumber.simpleMeaning}.`;
}

function buildFreeInsight({
  currentAction,
  language,
  lifeThemeSentence,
  personalYear,
}: {
  currentAction: LocalizedCycleAction;
  language: SupportedLanguage;
  lifeThemeSentence: string;
  personalYear: NumerologyCycleInsight;
}): string {
  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.freeInsight.hi', [
      lifeThemeSentence,
      personalYear.root,
      currentAction.leanInto,
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.freeInsight.gu', [
      lifeThemeSentence,
      personalYear.root,
      currentAction.leanInto,
    ]);
  }

  return `${lifeThemeSentence} For now, use the personal year ${personalYear.root} rhythm to lean into ${currentAction.leanInto}.`;
}

function buildReportSummary({
  currentAction,
  language,
  lifeThemeSentence,
  personalYear,
}: {
  currentAction: LocalizedCycleAction;
  language: SupportedLanguage;
  lifeThemeSentence: string;
  personalYear: NumerologyCycleInsight;
}): string {
  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.reportSummary.hi', [
      lifeThemeSentence,
      currentAction.keyword,
      personalYear.root,
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.reportSummary.gu', [
      lifeThemeSentence,
      currentAction.keyword,
      personalYear.root,
    ]);
  }

  return `${lifeThemeSentence} Current cycle: ${currentAction.keyword.toLowerCase()} through ${personalYear.root}.`;
}

function buildNameStrength(
  nameNumber: NumerologyNumberInsight,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.nameStrength.hi', [
      nameNumber.root,
      nameNumber.simpleMeaning,
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.nameStrength.gu', [
      nameNumber.root,
      nameNumber.simpleMeaning,
    ]);
  }

  return `Name root ${nameNumber.root} leans toward ${nameNumber.simpleMeaning}.`;
}

function buildNameFitSummary(score: number, language: SupportedLanguage): string {
  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.nameFitSummary.hi', [score]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.nameFitSummary.gu', [score]);
  }

  return `Current name alignment: ${score}/100, framed as supportive fit rather than good or bad naming.`;
}

function buildWeeklyDestinyHabit(
  destinyNumber: NumerologyNumberInsight,
  language: SupportedLanguage,
): string {
  const keyword = destinyNumber.keywords[0] ?? translateUiText('life direction', language);

  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.weeklyDestinyHabit.hi', [keyword]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.weeklyDestinyHabit.gu', [keyword]);
  }

  return `Keep one weekly action tied to ${keyword}.`;
}

function buildPremiumDetail({
  birthNumber,
  cautions,
  destinyNumber,
  language,
  missingNumbers,
  nameFitScore,
  nameNumber,
  personalDay,
  personalMonth,
  personalYear,
  strengths,
  strongNumbers,
}: {
  birthNumber: NumerologyNumberInsight;
  cautions: string[];
  destinyNumber: NumerologyNumberInsight;
  language: SupportedLanguage;
  missingNumbers: number[];
  nameFitScore: NumerologyIdentityDashboard['nameRefinement']['currentNameFit'];
  nameNumber: NumerologyNumberInsight;
  personalDay: NumerologyCycleInsight;
  personalMonth: NumerologyCycleInsight;
  personalYear: NumerologyCycleInsight;
  strengths: string[];
  strongNumbers: number[];
}): string {
  const strong = strongNumbers.join(', ') || translateUiText('none', language);
  const missing = missingNumbers.join(', ') || translateUiText('none', language);
  const topStrengths = strengths.slice(0, 3).join(', ');
  const topCautions = cautions.slice(0, 2).join(', ');

  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.premiumDetail.hi', [
      nameNumber.compound,
      nameNumber.root,
      nameFitScore.score,
      birthNumber.root,
      destinyNumber.root,
      personalYear.root,
      personalMonth.root,
      personalDay.root,
      strong,
      missing,
      topStrengths,
      topCautions,
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.premiumDetail.gu', [
      nameNumber.compound,
      nameNumber.root,
      nameFitScore.score,
      birthNumber.root,
      destinyNumber.root,
      personalYear.root,
      personalMonth.root,
      personalDay.root,
      strong,
      missing,
      topStrengths,
      topCautions,
    ]);
  }

  return [
    `Name rhythm: ${nameNumber.compound}/${nameNumber.root} with ${nameFitScore.score}/100 current-name fit.`,
    `Birth code: birth ${birthNumber.root}, destiny ${destinyNumber.root}.`,
    `Current cycle: year ${personalYear.root}, month ${personalMonth.root}, day ${personalDay.root}.`,
    `Pattern map: strong ${strong}, missing ${missing}.`,
    `Guidance: ${topStrengths} with care around ${topCautions}.`,
  ].join(' ');
}

function buildNameFitScore({
  birthNumber,
  destinyNumber,
  language,
  nameNumber,
}: {
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  language: SupportedLanguage;
  nameNumber: NumerologyNumberInsight;
}): NumerologyIdentityDashboard['nameRefinement']['currentNameFit'] {
  const expression = scoreRootCompatibility(nameNumber.root, destinyNumber.root);
  const stability = scoreRootCompatibility(nameNumber.root, birthNumber.root);
  const publicRhythm = 60 + ((nameNumber.compound % 9) * 4);
  const destinySupport = scoreRootCompatibility(destinyNumber.root, birthNumber.root);
  const score = Math.round(
    (expression + stability + publicRhythm + destinySupport) / 4,
  );

  return {
    confidence: 'medium',
    destinySupport,
    expression,
    limitations: [
      translateUiText(
        'This is a reflective name fit score, not a verdict on identity.',
        language,
      ),
      translateUiText(
        'Compare alternate names only when the user provides them.',
        language,
      ),
    ],
    publicRhythm,
    score,
    stability,
    summary: buildNameFitSummary(score, language),
  };
}

function buildSupportiveToolkit({
  destinyNumber,
  language,
  nameNumber,
  personalYear,
}: {
  destinyNumber: NumerologyNumberInsight;
  language: SupportedLanguage;
  nameNumber: NumerologyNumberInsight;
  personalYear: NumerologyCycleInsight;
}): NumerologyIdentityDashboard['supportiveToolkit'] {
  const colorMap: Record<number, string[]> = {
    1: ['sun gold', 'clear white'],
    2: ['pearl', 'soft blue'],
    3: ['saffron', 'warm yellow'],
    4: ['earth brown', 'deep green'],
    5: ['teal', 'silver'],
    6: ['rose', 'cream'],
    7: ['indigo', 'mist grey'],
    8: ['navy', 'charcoal'],
    9: ['crimson', 'copper'],
  };
  const dayMap: Record<number, string[]> = {
    1: ['Sunday'],
    2: ['Monday'],
    3: ['Thursday'],
    4: ['Saturday'],
    5: ['Wednesday'],
    6: ['Friday'],
    7: ['Monday', 'Thursday'],
    8: ['Saturday'],
    9: ['Tuesday'],
  };

  return {
    affirmation:
      language === 'hi'
        ? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b4a368faee")
        : language === 'gu'
          ? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.9959867eea")
          : 'I turn my number rhythm into practical, calm, and conscious choices.',
    colors: uniqueList([
      ...(colorMap[nameNumber.root] ?? []),
      ...(colorMap[destinyNumber.root] ?? []),
    ]).slice(0, 3).map(color => translateUiText(color, language)),
    days: uniqueList([
      ...(dayMap[personalYear.root] ?? []),
      ...(dayMap[nameNumber.root] ?? []),
    ]).slice(0, 2).map(day => translateUiText(day, language)),
    framing:
      translateUiText(
        'Use these as gentle alignment cues for focus and reflection, not as guaranteed lucky rules.',
        language,
      ),
    habits: [
      localizeCycleAction(
        CYCLE_ACTIONS[personalYear.root] ?? CYCLE_ACTIONS[1],
        language,
      ).guidance,
      buildWeeklyDestinyHabit(destinyNumber, language),
    ],
    numbers: uniqueList([
      String(nameNumber.root),
      String(destinyNumber.root),
      String(personalYear.root),
    ]).map(Number),
  };
}

function buildFirstLetterInfluence(
  normalizedName: string,
  method: NumerologyNameMethod,
  language: SupportedLanguage,
): string {
  const firstLetter = normalizedName[0];

  if (!firstLetter) {
    return translateUiText('Pending until a name is available.', language);
  }

  const values = method === 'PYTHAGOREAN' ? PYTHAGOREAN_VALUES : CHALDEAN_VALUES;
  const value = values[firstLetter] ?? 0;
  const meaning = getNumberMeaning(reduceToRoot(value), language);
  const keywords = meaning.keywords.join(', ');

  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.firstLetterInfluence.hi', [
      firstLetter,
      value,
      keywords,
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.firstLetterInfluence.gu', [
      firstLetter,
      value,
      keywords,
    ]);
  }

  return `${firstLetter} carries a ${value} vibration, giving the name an opening tone of ${keywords}.`;
}

function buildFrequencyInsight(
  number: number,
  count: number,
  tone: NumerologyPatternTone,
  language: SupportedLanguage,
): string {
  const meaning = getNumberMeaning(number, language);

  if (tone === 'missing') {
    if (language === 'hi') {
      return formatNativeCopy('numerologyDashboard.frequencyMissing.hi', [
        meaning.label,
        meaning.keywords[0] ?? meaning.label,
      ]);
    }

    if (language === 'gu') {
      return formatNativeCopy('numerologyDashboard.frequencyMissing.gu', [
        meaning.label,
        meaning.keywords[0] ?? meaning.label,
      ]);
    }

    return `${meaning.label} is quiet in the visible name/date pattern, so ${meaning.keywords[0]} may need conscious practice.`;
  }

  if (tone === 'strong') {
    if (language === 'hi') {
      return formatNativeCopy('numerologyDashboard.frequencyStrong.hi', [
        meaning.label,
        meaning.keywords[0] ?? meaning.label,
      ]);
    }

    if (language === 'gu') {
      return formatNativeCopy('numerologyDashboard.frequencyStrong.gu', [
        meaning.label,
        meaning.keywords[0] ?? meaning.label,
      ]);
    }

    return `${meaning.label} is strongly repeated, making ${meaning.keywords[0]} a visible emphasis.`;
  }

  if (tone === 'repeated') {
    if (language === 'hi') {
      return formatNativeCopy('numerologyDashboard.frequencyRepeated.hi', [
        meaning.label,
      ]);
    }

    if (language === 'gu') {
      return formatNativeCopy('numerologyDashboard.frequencyRepeated.gu', [
        meaning.label,
      ]);
    }

    return `${meaning.label} repeats enough to be noticeable without dominating the map.`;
  }

  if (language === 'hi') {
    return formatNativeCopy('numerologyDashboard.frequencyBalanced.hi', [
      meaning.label,
    ]);
  }

  if (language === 'gu') {
    return formatNativeCopy('numerologyDashboard.frequencyBalanced.gu', [
      meaning.label,
    ]);
  }

  return `${meaning.label} appears once, giving a balanced supporting tone.`;
}

function resolvePatternTone(count: number): NumerologyPatternTone {
  if (count === 0) {
    return 'missing';
  }

  if (count >= 3) {
    return 'strong';
  }

  if (count === 2) {
    return 'repeated';
  }

  return 'balanced';
}

function scoreRootCompatibility(first: number, second: number): number {
  if (!first || !second) {
    return 0;
  }

  if (first === second) {
    return 92;
  }

  const distance = Math.abs(first - second);
  return Math.max(58, 88 - distance * 5);
}

function buildCycleInsight(
  compound: number,
  period: NumerologyCycleInsight['period'],
  date: string,
  language: SupportedLanguage,
): NumerologyCycleInsight {
  return {
    ...buildNumberInsight(compound, language),
    date,
    period,
  };
}

function buildNumberInsight(
  compound: number,
  language: SupportedLanguage = 'en',
): NumerologyNumberInsight {
  const root = reduceToRoot(compound);
  if (root === 0) {
    return {
      compound,
      keywords: [],
      label:
        language === 'hi'
          ? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.44f60df260")
          : language === 'gu'
            ? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.577270f404")
            : 'Pending',
      root,
      simpleMeaning:
        language === 'hi'
          ? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f5522d020e")
          : language === 'gu'
            ? getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.28f77b17e9")
            : 'waiting for name and birth date',
    };
  }

  const meaning = getNumberMeaning(root, language);

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

function buildSummary({
  birthNumber,
  destinyNumber,
  language,
  name,
  nameNumber,
  personalDay,
}: {
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  language: SupportedLanguage;
  name: string;
  nameNumber: NumerologyNumberInsight;
  personalDay: NumerologyCycleInsight;
}): string {
  if (language === 'hi') {
    return formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e5bd892dc3", [name, nameNumber.root, birthNumber.root, destinyNumber.root, personalDay.root]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e0f4940ad9", [name, nameNumber.root, birthNumber.root, destinyNumber.root, personalDay.root]);
  }

  return `${name} carries name number ${nameNumber.root}, birth number ${birthNumber.root}, and destiny number ${destinyNumber.root}. Today sits in a personal day ${personalDay.root} rhythm.`;
}

function buildEvidence({
  birthDate,
  birthNumber,
  destinyNumber,
  language,
  method,
  nameNumber,
  normalizedName,
  targetDate,
}: {
  birthDate: string;
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
  language: SupportedLanguage;
  method: NumerologyNameMethod;
  nameNumber: NumerologyNumberInsight;
  normalizedName: string;
  targetDate: string;
}): string[] {
  if (language === 'hi') {
    return [
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a6a403c3ee", [nameNumber.root, normalizedName, method.toLowerCase()]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.df18ec1801", [birthNumber.root, birthDate]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b3b125c701", [destinyNumber.root, birthDate]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.871dbd082e", [targetDate]),
    ];
  }

  if (language === 'gu') {
    return [
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.6d4503347a", [nameNumber.root, normalizedName, method.toLowerCase()]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.aed390a3fe", [birthNumber.root, birthDate]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ff4bcbbd45", [destinyNumber.root, birthDate]),
      formatNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ecc9794af7", [targetDate]),
    ];
  }

  return [
    `Name number ${nameNumber.root} comes from ${method.toLowerCase()} letter values applied to "${normalizedName}".`,
    `Birth number ${birthNumber.root} comes from the birth day in ${birthDate}.`,
    `Destiny number ${destinyNumber.root} comes from the full birth date ${birthDate}.`,
    `Personal year/month/day are calculated for ${targetDate}.`,
  ];
}

function buildLimitations(language: SupportedLanguage): string[] {
  if (language === 'hi') {
    return [
      getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.63d886f292"),
      getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.8243b94e1f"),
      getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.7ad1335325"),
    ];
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b5e3345f3f"),
      getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.d8afb0a229"),
      getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.1a3d692bc2"),
    ];
  }

  return [
    'Numerology is a guidance layer. It should support reflection, not replace practical judgement.',
    'Name spelling matters. A legal name, common name, and spiritual name can produce different name numbers.',
    'For full Predicta synthesis, numerology should be read with Kundli, dasha, gochar, and remedies.',
  ];
}

function getPendingEvidence(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.cc534b5de1");
  }

  if (language === 'gu') {
    return getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.6b199c662b");
  }

  return 'Add name and birth date to prepare a numerology profile.';
}

function getPendingGuidance(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.53249a73ab");
  }

  if (language === 'gu') {
    return getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.15e9e779ab");
  }

  return 'Add name and birth date to calculate name, birth, destiny, and personal timing numbers.';
}

function getPendingLimitation(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.6d54419174");
  }

  if (language === 'gu') {
    return getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ccb026fc16");
  }

  return 'Numerology needs a name and birth date.';
}

function getPendingSummary(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.34b4b01e64");
  }

  if (language === 'gu') {
    return getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f9444262a4");
  }

  return 'Numerology profile is waiting for name and birth date.';
}

function getNumberMeaning(
  root: number,
  language: SupportedLanguage,
): (typeof NUMBER_MEANINGS)[number] {
  const meaning = NUMBER_MEANINGS[root] ?? NUMBER_MEANINGS[9];

  if (language === 'hi') {
    return {
      cautions: HINDI_NUMBER_CAUTIONS[root] ?? meaning.cautions,
      keywords: HINDI_NUMBER_KEYWORDS[root] ?? meaning.keywords,
      label: HINDI_NUMBER_LABELS[root] ?? meaning.label,
      meaning: HINDI_NUMBER_MEANINGS[root] ?? meaning.meaning,
      strengths: HINDI_NUMBER_STRENGTHS[root] ?? meaning.strengths,
    };
  }

  if (language === 'gu') {
    return {
      cautions: GUJARATI_NUMBER_CAUTIONS[root] ?? meaning.cautions,
      keywords: GUJARATI_NUMBER_KEYWORDS[root] ?? meaning.keywords,
      label: GUJARATI_NUMBER_LABELS[root] ?? meaning.label,
      meaning: GUJARATI_NUMBER_MEANINGS[root] ?? meaning.meaning,
      strengths: GUJARATI_NUMBER_STRENGTHS[root] ?? meaning.strengths,
    };
  }

  return meaning;
}

const HINDI_NUMBER_LABELS: Record<number, string> = {
  1: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.9e7a9842a2"),
  2: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.4f3e3ad92c"),
  3: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.5d8223c2fb"),
  4: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.fd3d395466"),
  5: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ae9196edc0"),
  6: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.3c3bc883da"),
  7: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ba1388c56c"),
  8: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.d09eeb3568"),
  9: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.bf742455f7"),
};

const HINDI_NUMBER_MEANINGS: Record<number, string> = {
  1: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.64a249c30f"),
  2: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.7577a9e1aa"),
  3: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.438bf77e57"),
  4: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.50d30ded87"),
  5: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.3e1e69df2f"),
  6: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.eba316709d"),
  7: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.59f40ff40e"),
  8: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.d6990381dd"),
  9: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.6d3552c1b3"),
};

const HINDI_NUMBER_KEYWORDS: Record<number, string[]> = {
  1: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ebd28e6ef6"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.680aa6745d"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.93ccc33645")],
  2: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.c026fe845c"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f0cba40bb5"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.956bf5affd")],
  3: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.25abcbd3aa"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b269ed25b0"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.782985cb68")],
  4: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.23a1d4589f"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b91619dc76"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ca6d5b27f1")],
  5: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.64428d178f"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.1fff57011f"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.9a4e8b4162")],
  6: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.0b7fdcfc02"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e54f837797"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.99cedbca78")],
  7: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ee1e80d776"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.71d2beb2cf"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b2637a1b95")],
  8: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ed8fc47126"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.4a727823f0"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a87de9316a")],
  9: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b2a5b5b441"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.18e414b636"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e084867897")],
};

const HINDI_NUMBER_STRENGTHS: Record<number, string[]> = {
  1: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.71dc9fba75"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.eb918b9f69"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.edaab0320e")],
  2: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.afea731585"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a5bc63d5cf"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ff4b7a1be6")],
  3: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.95745e7121"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.0d762c7017"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.11d5730374")],
  4: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.86fe8c30f2"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.6e8368f2fe"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.7a2da3fad5")],
  5: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.17f3863a04"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.74a9b518ab"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.9cebdf98dd")],
  6: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.3b8671a214"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.cf68768e91"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.11baafd24c")],
  7: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.507a6d9ae8"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a1e1e33447"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.2d3007c177")],
  8: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.40750d4152"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.14d7130764"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.82fd0f2350")],
  9: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.eb7ee789d2"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.210d39f06d"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.cad49a5a62")],
};

const HINDI_NUMBER_CAUTIONS: Record<number, string[]> = {
  1: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.683eacc879"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ac83cc9b12"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ca766e602c")],
  2: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e4f44ffaa7"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b8855e6e5f"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.07265340e0")],
  3: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.2da1250ea1"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.218ef40d6d"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f7fa6ceb6a")],
  4: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a086330882"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.899e4d4302"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e7c8a93015")],
  5: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.dc3ec7858a"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.2e7b022b84"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e1c4580a7d")],
  6: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ed66b405be"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.14d8132f8e"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e6a980e0a8")],
  7: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.7f0cb4b89d"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a0f8152119"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.bea67941e8")],
  8: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e43b3cdfc1"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b9e5ad98da"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a086330882")],
  9: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.1631accfc1"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.4d7566ecd6"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.6d395b805b")],
};

const GUJARATI_NUMBER_LABELS: Record<number, string> = {
  1: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.98545e19c1"),
  2: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ac0bc5ef37"),
  3: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.5f9f684371"),
  4: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.4694f22d69"),
  5: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ab770ed05e"),
  6: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f36f689718"),
  7: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.d7f646ecae"),
  8: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.429e1f518b"),
  9: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a629916ddc"),
};

const GUJARATI_NUMBER_MEANINGS: Record<number, string> = {
  1: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.8b3d282abc"),
  2: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.37c9d923a3"),
  3: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f00b9f769c"),
  4: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.4ea9ce6a0f"),
  5: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.480d03e38f"),
  6: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.aee26f9102"),
  7: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.35db7b7980"),
  8: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ca4bd7a525"),
  9: getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.813cd0d607"),
};

const GUJARATI_NUMBER_KEYWORDS: Record<number, string[]> = {
  1: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.fec62cfb47"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.95892eb1c5"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.89369a4cad")],
  2: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.c05b580201"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.7cb39b9856"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.4186f190c0")],
  3: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e2668111b5"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.1d01b4e7fd"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.8de5fdc0ad")],
  4: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.04e24fa8b2"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.6c3e02ce45"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.22392c6eb0")],
  5: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.35a6d007a9"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.c3dce661bc"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b673aaf416")],
  6: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a6d53b1f38"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.1a6e5f54df"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.07774c6e6f")],
  7: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.83aa535e47"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.32594b0143"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.43589e1d94")],
  8: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a46b154e3d"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a0cf33e8c0"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.9e5104ffee")],
  9: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ae478aa10f"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.1f33ac1dae"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b67556d464")],
};

const GUJARATI_NUMBER_STRENGTHS: Record<number, string[]> = {
  1: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.57c35ecb9b"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.762e7cb5f1"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f72b63ba6c")],
  2: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.1b4c6fe253"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.e76b1350fe"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b9bfd9a2eb")],
  3: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.9e1c2177ff"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.6bf4f789fc"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.9040cdffdf")],
  4: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.d95633fbe0"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.db68f244fd"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.8eb75652dc")],
  5: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ec3f1e4375"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.52ff9bc625"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.69b23200eb")],
  6: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a6c6577df6"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.efc540b88d"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.252dda4a53")],
  7: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.4356349d55"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a3314978b8"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.3f851fb6f8")],
  8: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.863773d208"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.583d81cead"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.4ae69c6479")],
  9: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a9acc2baf5"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.38f9862cc9"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b3c120dca9")],
};

const GUJARATI_NUMBER_CAUTIONS: Record<number, string[]> = {
  1: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.9fce1e5912"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ea9d6d8af9"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.a4f5e5d2ba")],
  2: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.2d9edcaf3d"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.61a3dabfe8"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.44974e1aef")],
  3: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.5d40543f38"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.fca7919814"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.cf076beb69")],
  4: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ee1989b117"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.876c55a732"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.b8ad10fa2f")],
  5: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ba541bcad8"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.2d75e46762"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.35f58892a1")],
  6: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.4413380f84"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f836a73bd0"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.7ff93e65cf")],
  7: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.f0f21454b9"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.c09b886bd7"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.2978f431dd")],
  8: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.2d6f4f1978"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.af0dd8c216"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.ee1989b117")],
  9: [getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.7c0bd9211d"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.3b0b5e5e68"), getNativeCopy("native.packages.astrology.src.numerologyFoundationModel.ts.65051bc7ef")],
};
