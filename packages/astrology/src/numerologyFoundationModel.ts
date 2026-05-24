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
  const currentAction = CYCLE_ACTIONS[personalYear.root] ?? CYCLE_ACTIONS[1];
  const nameFitScore = buildNameFitScore({
    birthNumber,
    destinyNumber,
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
    calculationNote: `${method} name values for ${normalizedName || name}; birth and destiny numbers from ${birthDate}; personal cycles calculated for ${targetDate}.`,
    compatibilityLens: {
      confidence: 'low',
      frictionZones: [],
      howToWorkBetter:
        'Add another person, business, brand, or public name to compare rhythms without mixing other schools.',
      limitations: [
        'Compatibility needs a confirmed comparison name or birth date before Predicta can score it.',
        'Numerology compatibility is reflective guidance, not certainty about a relationship or business outcome.',
      ],
      status: 'pending',
      supportZones: [],
    },
    currentCycleAvoid: currentAction.avoid,
    currentCycleLeanInto: currentAction.leanInto,
    firstLetterInfluence: buildFirstLetterInfluence(normalizedName, method),
    freeInsight: `${lifeThemeSentence} For now, use the personal year ${personalYear.root} rhythm to lean into ${currentAction.leanInto}.`,
    frequencyMap,
    lifeThemeSentence,
    mandalaNodes: buildMandalaNodes({
      birthNumber,
      destinyNumber,
      nameNumber,
      personalDay,
      personalMonth,
      personalYear,
    }),
    maturityDirection: `The destiny ${destinyNumber.root} pattern matures through ${destinyNumber.simpleMeaning}.`,
    missingNumbers,
    nameRefinement: {
      comparisonNote:
        'Premium name refinement can compare spelling, brand, baby, business, or public-name options when the user provides them.',
      currentNameFit: nameFitScore,
      limitations: [
        'Predicta never uses fear labels for a name.',
        'A name score is a reflective fit score, not a demand to change identity.',
      ],
      status: 'pending',
      suggestedInputs: [
        'alternate spelling',
        'brand or business name',
        'baby name',
        'public or stage name',
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
    nameStrength: `Name root ${nameNumber.root} leans toward ${nameNumber.simpleMeaning}.`,
    personalYearTimeline: buildPersonalYearTimeline({
      birthDate,
      language,
      targetDate,
    }),
    premiumDetail: [
      `Name rhythm: ${nameNumber.compound}/${nameNumber.root} with ${nameFitScore.score}/100 current-name fit.`,
      `Birth code: birth ${birthNumber.root}, destiny ${destinyNumber.root}.`,
      `Current cycle: year ${personalYear.root}, month ${personalMonth.root}, day ${personalDay.root}.`,
      `Pattern map: strong ${strongNumbers.join(', ') || 'none'}, missing ${missingNumbers.join(', ') || 'none'}.`,
      `Guidance: ${strengths.slice(0, 3).join(', ')} with care around ${cautions.slice(0, 2).join(', ')}.`,
    ].join(' '),
    repeatedNumbers,
    reportSummary: `${lifeThemeSentence} Current cycle: ${currentAction.keyword.toLowerCase()} through ${personalYear.root}.`,
    strongNumbers,
    supportiveToolkit,
  };
}

export function buildNumerologyFrequencyMap({
  birthDate,
  method,
  normalizedName,
}: {
  birthDate: string;
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
    const meaning = getNumberMeaning(number, 'en');

    return {
      count,
      insight: buildFrequencyInsight(number, count, tone),
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

    return {
      cycleNumber,
      guidance: action.guidance,
      keyword: action.keyword,
      monthLabel,
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
    return `आपका अंक पैटर्न ${nameNumber.keywords[0] ?? 'लय'} को ${destinyNumber.keywords[0] ?? 'दिशा'} में बदलने और ${birthNumber.keywords[0] ?? 'स्वभाव'} को संतुलित रखने के लिए कहता है.`;
  }

  if (language === 'gu') {
    return `તમારો અંક પેટર્ન ${nameNumber.keywords[0] ?? 'લય'} ને ${destinyNumber.keywords[0] ?? 'દિશા'} માં ફેરવવા અને ${birthNumber.keywords[0] ?? 'સ્વભાવ'} ને સંતુલિત રાખવા કહે છે.`;
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
    currentCycleAvoid: 'guessing before name and birth date are available',
    currentCycleLeanInto: 'adding name and birth date',
    firstLetterInfluence: 'Pending until a name is available.',
    freeInsight: getPendingSummary(language),
    frequencyMap: buildNumerologyFrequencyMap({
      birthDate: '',
      method: 'CHALDEAN',
      normalizedName: '',
    }),
    lifeThemeSentence: getPendingSummary(language),
    mandalaNodes: [],
    maturityDirection: getPendingGuidance(language),
    missingNumbers: [],
    nameRefinement: {
      comparisonNote: 'Pending until a name is available.',
      currentNameFit: pendingFit,
      limitations: [getPendingLimitation(language)],
      status: 'pending',
      suggestedInputs: [],
    },
    nameScanner: {
      compound: 0,
      method: 'CHALDEAN',
      normalizedName: '',
      reducedExpression: 'Pending',
      root: 0,
      steps: [],
    },
    nameStrength: 'Pending until a name is available.',
    personalYearTimeline: [],
    premiumDetail: getPendingSummary(language),
    repeatedNumbers: [],
    reportSummary: getPendingSummary(language),
    strongNumbers: [],
    supportiveToolkit: {
      affirmation: 'Add your details so Predicta can prepare a number profile.',
      colors: [],
      days: [],
      framing: 'Supportive tools appear only after the number profile is ready.',
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
      `नाम अंक ${nameNumber.root} बताता है कि नाम दुनिया में कैसी छाप भेजता है.`,
      `जन्म अंक ${birthNumber.root} सहज स्वभाव दिखाता है.`,
      `भाग्य अंक ${destinyNumber.root} लंबी जीवन-दिशा दिखाता है.`,
      `निजी वर्ष ${personalYear.root}, महीना ${personalMonth.root} और दिन ${personalDay.root} वर्तमान समय की लय दिखाते हैं.`,
    ].join(' ');
  }

  if (language === 'gu') {
    return [
      `નામ અંક ${nameNumber.root} બતાવે છે કે નામ દુનિયામાં કેવી છાપ મૂકે છે.`,
      `જન્મ અંક ${birthNumber.root} સહજ સ્વભાવ બતાવે છે.`,
      `ભાગ્ય અંક ${destinyNumber.root} લાંબી જીવન-દિશા બતાવે છે.`,
      `વ્યક્તિગત વર્ષ ${personalYear.root}, મહિનો ${personalMonth.root} અને દિવસ ${personalDay.root} વર્તમાન સમયની લય બતાવે છે.`,
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
      accessibleLabel: `${label} number ${numberInsight.root}, ${numberInsight.label}: ${numberInsight.simpleMeaning}`,
      colorToken: MANDALA_COLORS[index],
      id: id as NumerologyMandalaNode['id'],
      keyword: numberInsight.keywords[0] ?? numberInsight.label,
      label: label as string,
      number: numberInsight.root,
      shortMeaning: numberInsight.simpleMeaning,
    };
  });
}

function buildNameFitScore({
  birthNumber,
  destinyNumber,
  nameNumber,
}: {
  birthNumber: NumerologyNumberInsight;
  destinyNumber: NumerologyNumberInsight;
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
      'This is a reflective name fit score, not a verdict on identity.',
      'Compare alternate names only when the user provides them.',
    ],
    publicRhythm,
    score,
    stability,
    summary: `Current name alignment: ${score}/100, framed as supportive fit rather than good or bad naming.`,
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
        ? 'मैं अपनी संख्या-लय को व्यावहारिक, शांत और जागरूक चुनावों में बदलता/बदलती हूं.'
        : language === 'gu'
          ? 'હું મારી અંક-લયને વ્યવહારુ, શાંત અને જાગૃત પસંદગીઓમાં ફેરવું છું.'
          : 'I turn my number rhythm into practical, calm, and conscious choices.',
    colors: uniqueList([
      ...(colorMap[nameNumber.root] ?? []),
      ...(colorMap[destinyNumber.root] ?? []),
    ]).slice(0, 3),
    days: uniqueList([
      ...(dayMap[personalYear.root] ?? []),
      ...(dayMap[nameNumber.root] ?? []),
    ]).slice(0, 2),
    framing:
      'Use these as gentle alignment cues for focus and reflection, not as guaranteed lucky rules.',
    habits: [
      CYCLE_ACTIONS[personalYear.root]?.guidance ?? CYCLE_ACTIONS[1].guidance,
      `Keep one weekly action tied to ${destinyNumber.keywords[0] ?? 'life direction'}.`,
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
): string {
  const firstLetter = normalizedName[0];

  if (!firstLetter) {
    return 'Pending until a name is available.';
  }

  const values = method === 'PYTHAGOREAN' ? PYTHAGOREAN_VALUES : CHALDEAN_VALUES;
  const value = values[firstLetter] ?? 0;
  const meaning = getNumberMeaning(reduceToRoot(value), 'en');

  return `${firstLetter} carries a ${value} vibration, giving the name an opening tone of ${meaning.keywords.join(', ')}.`;
}

function buildFrequencyInsight(
  number: number,
  count: number,
  tone: NumerologyPatternTone,
): string {
  const meaning = getNumberMeaning(number, 'en');

  if (tone === 'missing') {
    return `${meaning.label} is quiet in the visible name/date pattern, so ${meaning.keywords[0]} may need conscious practice.`;
  }

  if (tone === 'strong') {
    return `${meaning.label} is strongly repeated, making ${meaning.keywords[0]} a visible emphasis.`;
  }

  if (tone === 'repeated') {
    return `${meaning.label} repeats enough to be noticeable without dominating the map.`;
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
          ? 'प्रतीक्षा'
          : language === 'gu'
            ? 'બાકી'
            : 'Pending',
      root,
      simpleMeaning:
        language === 'hi'
          ? 'नाम और जन्म तिथि की प्रतीक्षा'
          : language === 'gu'
            ? 'નામ અને જન્મ તારીખની રાહમાં'
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
    return `${name} में नाम अंक ${nameNumber.root}, जन्म अंक ${birthNumber.root} और भाग्य अंक ${destinyNumber.root} की संयुक्त लय है. आज निजी दिन ${personalDay.root} की दिशा सक्रिय है.`;
  }

  if (language === 'gu') {
    return `${name} માં નામ અંક ${nameNumber.root}, જન્મ અંક ${birthNumber.root} અને ભાગ્ય અંક ${destinyNumber.root} ની સંયુક્ત લય છે. આજે વ્યક્તિગત દિવસ ${personalDay.root} ની દિશા સક્રિય છે.`;
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
      `नाम अंक ${nameNumber.root} "${normalizedName}" पर ${method.toLowerCase()} अक्षर मान लगाकर निकाला गया है.`,
      `जन्म अंक ${birthNumber.root} जन्म दिन ${birthDate} से निकाला गया है.`,
      `भाग्य अंक ${destinyNumber.root} पूरी जन्म तिथि ${birthDate} से निकाला गया है.`,
      `निजी वर्ष, महीना और दिन ${targetDate} के लिए निकाले गए हैं.`,
    ];
  }

  if (language === 'gu') {
    return [
      `નામ અંક ${nameNumber.root} "${normalizedName}" પર ${method.toLowerCase()} અક્ષર મૂલ્યો લગાવીને કાઢવામાં આવ્યો છે.`,
      `જન્મ અંક ${birthNumber.root} જન્મ દિવસ ${birthDate} પરથી કાઢવામાં આવ્યો છે.`,
      `ભાગ્ય અંક ${destinyNumber.root} સંપૂર્ણ જન્મ તારીખ ${birthDate} પરથી કાઢવામાં આવ્યો છે.`,
      `વ્યક્તિગત વર્ષ, મહિનો અને દિવસ ${targetDate} માટે કાઢવામાં આવ્યા છે.`,
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
      'अंक ज्योतिष मार्गदर्शन की परत है. यह चिंतन में मदद करे, व्यावहारिक निर्णय की जगह न ले.',
      'नाम की वर्तनी मायने रखती है. कानूनी नाम, रोज़ का नाम और आध्यात्मिक नाम अलग नाम अंक दे सकते हैं.',
      'पूर्ण प्रेडिक्टा संयुक्त सार के लिए अंक ज्योतिष को कुंडली, दशा, गोचर और उपाय के साथ अलग परत की तरह पढ़ना चाहिए.',
    ];
  }

  if (language === 'gu') {
    return [
      'અંક જ્યોતિષ માર્ગદર્શનની એક પરત છે. તે વિચારમાં મદદ કરે, પરંતુ વ્યાવહારિક નિર્ણયની જગ્યા લેતી નથી.',
      'નામની જોડણી મહત્વની છે. કાનૂની નામ, રોજિંદું નામ અને આધ્યાત્મિક નામ અલગ નામ અંક આપી શકે છે.',
      'પૂર્ણ પ્રેડિક્ટા સંયુક્ત સાર માટે અંક જ્યોતિષને કુંડળી, દશા, ગોચર અને ઉપાયો સાથે અલગ પરત તરીકે વાંચવું જોઈએ.',
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
    return 'अंक प्रोफाइल तैयार करने के लिए नाम और जन्म तिथि जोड़ें.';
  }

  if (language === 'gu') {
    return 'અંક પ્રોફાઇલ તૈયાર કરવા માટે નામ અને જન્મ તારીખ ઉમેરો.';
  }

  return 'Add name and birth date to prepare a numerology profile.';
}

function getPendingGuidance(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'नाम, जन्म अंक, भाग्य अंक और निजी समय निकालने के लिए नाम और जन्म तिथि जोड़ें.';
  }

  if (language === 'gu') {
    return 'નામ અંક, જન્મ અંક, ભાગ્ય અંક અને વ્યક્તિગત સમય કાઢવા માટે નામ અને જન્મ તારીખ ઉમેરો.';
  }

  return 'Add name and birth date to calculate name, birth, destiny, and personal timing numbers.';
}

function getPendingLimitation(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'अंक ज्योतिष के लिए नाम और जन्म तिथि चाहिए.';
  }

  if (language === 'gu') {
    return 'અંક જ્યોતિષ માટે નામ અને જન્મ તારીખ જોઈએ.';
  }

  return 'Numerology needs a name and birth date.';
}

function getPendingSummary(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'अंक प्रोफाइल नाम और जन्म तिथि की प्रतीक्षा में है.';
  }

  if (language === 'gu') {
    return 'અંક પ્રોફાઇલ નામ અને જન્મ તારીખની રાહમાં છે.';
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
  1: 'नेता',
  2: 'समन्वयक',
  3: 'रचनाकार',
  4: 'निर्माता',
  5: 'अन्वेषक',
  6: 'पालनकर्ता',
  7: 'खोजी',
  8: 'रणनीतिकार',
  9: 'लोकसेवी',
};

const HINDI_NUMBER_MEANINGS: Record<number, string> = {
  1: 'स्वतंत्रता, आत्म-निर्देशन, आत्मविश्वास और शुरुआत की शक्ति',
  2: 'सहयोग, संवेदनशीलता, साझेदारी और भावनात्मक जागरूकता',
  3: 'संचार, रचनात्मकता, आनंद और खुली आत्म-अभिव्यक्ति',
  4: 'व्यवस्था, व्यावहारिक अनुशासन, प्रणाली और स्थिर नींव',
  5: 'स्वतंत्रता, यात्रा, अनुकूलन, संवाद और परिवर्तन',
  6: 'परिवार, सेवा, सौंदर्य, जिम्मेदारी और भावनात्मक मरम्मत',
  7: 'विश्लेषण, आध्यात्मिक खोज, निजता और गहरी समझ',
  8: 'शक्ति, धन, प्रबंधन, जिम्मेदारी और कर्मफल',
  9: 'पूर्णता, करुणा, बुद्धि, सेवा और व्यापक दृष्टि',
};

const HINDI_NUMBER_KEYWORDS: Record<number, string[]> = {
  1: ['नेतृत्व', 'पहल', 'पहचान'],
  2: ['सामंजस्य', 'सहयोग', 'भावना'],
  3: ['अभिव्यक्ति', 'रचनात्मकता', 'आनंद'],
  4: ['संरचना', 'अनुशासन', 'नींव'],
  5: ['स्वतंत्रता', 'परिवर्तन', 'गति'],
  6: ['देखभाल', 'परिवार', 'सौंदर्य'],
  7: ['अनुसंधान', 'गहराई', 'आध्यात्मिकता'],
  8: ['शक्ति', 'धन', 'कर्म'],
  9: ['पूर्णता', 'करुणा', 'बुद्धि'],
};

const HINDI_NUMBER_STRENGTHS: Record<number, string[]> = {
  1: ['स्पष्ट नेतृत्व', 'नई शुरुआत', 'जिम्मेदारी लेना'],
  2: ['मध्यस्थता', 'विश्वास बनाना', 'भावनात्मक स्वर समझना'],
  3: ['अच्छा बोलना', 'रचना करना', 'माहौल हल्का करना'],
  4: ['योजना बनाना', 'काम पूरा करना', 'विश्वसनीय दिनचर्या बनाना'],
  5: ['तेजी से ढलना', 'नेटवर्क बनाना', 'विविध अनुभव से सीखना'],
  6: ['गहराई से देखभाल', 'स्थान बेहतर बनाना', 'परिवार की रक्षा करना'],
  7: ['शोध करना', 'पैटर्न पकड़ना', 'गहराई से काम करना'],
  8: ['संसाधन व्यवस्थित करना', 'दबाव संभालना', 'प्रभाव बनाना'],
  9: ['उदार सेवा', 'बड़ी तस्वीर देखना', 'समझदारी से क्षमा करना'],
};

const HINDI_NUMBER_CAUTIONS: Record<number, string[]> = {
  1: ['अहं टकराव', 'अधीरता', 'सब कुछ अकेले करना'],
  2: ['अतिसंवेदनशीलता', 'निर्भरता', 'निर्णय में हिचक'],
  3: ['बिखरा ध्यान', 'बहुत बोलना', 'अधूरे विचार'],
  4: ['कठोरता', 'अधिक काम', 'परिवर्तन का डर'],
  5: ['बेचैनी', 'अनावश्यक जोखिम', 'अनुशासन में अस्थिरता'],
  6: ['अधिक जिम्मेदारी', 'देखभाल के बहाने नियंत्रण', 'सबको खुश करने की प्रवृत्ति'],
  7: ['अलगाव', 'अतिविश्लेषण', 'अविश्वास'],
  8: ['नियंत्रण की समस्या', 'धन का दबाव', 'कठोरता'],
  9: ['भावनात्मक अतिशयता', 'उद्धारक प्रवृत्ति', 'चक्र बंद करने में कठिनाई'],
};

const GUJARATI_NUMBER_LABELS: Record<number, string> = {
  1: 'નેતા',
  2: 'સમન્વયક',
  3: 'રચનાકાર',
  4: 'નિર્માતા',
  5: 'અન્વેષક',
  6: 'પોષક',
  7: 'શોધક',
  8: 'રણનીતિકાર',
  9: 'લોકહિતકારી',
};

const GUJARATI_NUMBER_MEANINGS: Record<number, string> = {
  1: 'સ્વતંત્રતા, સ્વ-દિશા, આત્મવિશ્વાસ અને શરૂઆતની શક્તિ',
  2: 'સહયોગ, સંવેદનશીલતા, ભાગીદારી અને ભાવનાત્મક જાગૃતિ',
  3: 'અભિવ્યક્તિ, સર્જનાત્મકતા, આનંદ અને ખુલ્લી સ્વ-અભિવ્યક્તિ',
  4: 'ક્રમ, વ્યવહારુ અનુશાસન, પ્રણાલી અને સ્થિર પાયો',
  5: 'સ્વતંત્રતા, પ્રવાસ, અનુકૂલન, સંવાદ અને પરિવર્તન',
  6: 'પરિવાર, સેવા, સૌંદર્ય, જવાબદારી અને લાગણીસભર સમારકામ',
  7: 'વિશ્લેષણ, આધ્યાત્મિક શોધ, ગોપનીયતા અને ઊંડી સમજ',
  8: 'શક્તિ, ધન, સંચાલન, જવાબદારી અને કર્મફળ',
  9: 'પૂર્ણતા, કરુણા, જ્ઞાન, સેવા અને વ્યાપક દૃષ્ટિ',
};

const GUJARATI_NUMBER_KEYWORDS: Record<number, string[]> = {
  1: ['નેતૃત્વ', 'પહેલ', 'ઓળખ'],
  2: ['સામંજસ્ય', 'સહકાર', 'ભાવના'],
  3: ['અભિવ્યક્તિ', 'સર્જનાત્મકતા', 'આનંદ'],
  4: ['રચના', 'અનુશાસન', 'પાયો'],
  5: ['સ્વતંત્રતા', 'પરિવર્તન', 'ગતિ'],
  6: ['કાળજી', 'પરિવાર', 'સૌંદર્ય'],
  7: ['શોધ', 'ઊંડાણ', 'આધ્યાત્મિકતા'],
  8: ['શક્તિ', 'ધન', 'કર્મ'],
  9: ['પૂર્ણતા', 'કરુણા', 'જ્ઞાન'],
};

const GUJARATI_NUMBER_STRENGTHS: Record<number, string[]> = {
  1: ['સ્પષ્ટ નેતૃત્વ', 'નવી શરૂઆત', 'જવાબદારી લેવો'],
  2: ['મધ્યસ્થતા', 'વિશ્વાસ બાંધવો', 'ભાવનાત્મક સ્વર વાંચવો'],
  3: ['સારું બોલવું', 'સર્જન કરવું', 'માહોલ હળવો કરવો'],
  4: ['યોજનાબદ્ધ કામ', 'કાર્ય પૂર્ણ કરવું', 'વિશ્વસનીય નિયમિતતા બાંધવી'],
  5: ['ઝડપી અનુકૂલન', 'નેટવર્કિંગ', 'વૈવિધ્યમાંથી શીખવું'],
  6: ['ઊંડે સુધી કાળજી', 'સ્થળ સુધારવું', 'પરિવારનું રક્ષણ'],
  7: ['શોધખોળ', 'પેટર્ન ઓળખવું', 'ઊંડાણપૂર્વક કામ'],
  8: ['સાધનો ગોઠવવા', 'દબાણ સંભાળવું', 'અધિકાર બાંધવો'],
  9: ['ઉદાર સેવા', 'મોટી તસવીર જોવી', 'સમજદારીથી માફ કરવું'],
};

const GUJARATI_NUMBER_CAUTIONS: Record<number, string[]> = {
  1: ['અહં અથડામણ', 'અધીરાઈ', 'બધું એકલા કરવું'],
  2: ['અતિસંવેદનશીલતા', 'આસરિતતા', 'નિર્ણયમાં હચકાટ'],
  3: ['વિખરાયેલ ધ્યાન', 'વધારે બોલવું', 'અધૂરા વિચારો'],
  4: ['કઠોરતા', 'વધારે કામ', 'પરિવર્તનનો ભય'],
  5: ['બેચેની', 'જોખમ લેવાની આદત', 'અનુશાસનમાં અસ્થિરતા'],
  6: ['વધારે જવાબદારી', 'કાળજીના નામે નિયંત્રણ', 'બધાને ખુશ કરવાની ટેવ'],
  7: ['અલગાવ', 'અતિ-વિશ્લેષણ', 'અવિશ્વાસ'],
  8: ['નિયંત્રણની સમસ્યા', 'ધનનું દબાણ', 'કઠોરતા'],
  9: ['લાગણીના અતિરેક', 'ઉદ્ધારક વૃત્તિ', 'ચક્ર પૂર્ણ કરવામાં મુશ્કેલી'],
};
