import type {
  HolisticAnswerPart,
  HolisticFoundationModel,
  HolisticPlanetFocus,
  KundliData,
  PlanetKarmaRemedyProfile,
  PlanetPosition,
} from '@pridicta/types';

const ANSWER_PARTS: HolisticAnswerPart[] = [
  'prediction',
  'chart-proof',
  'timing',
  'karma-pattern',
  'remedy-direction',
  'practical-action',
  'safety-boundary',
];

export const PLANET_KARMA_REMEDY_MAP: PlanetKarmaRemedyProfile[] = [
  {
    conductCorrections: [
      'Speak truthfully without humiliating others.',
      'Respect father, mentors, and rightful authority without losing self-respect.',
      'Lead by example before asking others to follow.',
    ],
    fastingDiscipline:
      'Keep Sunday simple with sunlight, gratitude, and one clean promise.',
    gemstoneCaution:
      'Ruby-style strengthening should be considered only after chart review; conduct comes first.',
    higherExpression: 'dignified leadership, courage, clarity, and dharma',
    karmicLesson: 'ego, father, authority, confidence, and righteous action',
    lifestylePractice: 'Start the day with one visible duty completed before praise is expected.',
    mantraPrayer: 'Surya prayer, Aditya Hridayam, or a simple morning gratitude practice.',
    planet: 'Sun',
    remedyDirections: [
      'Respect father or mentor figures where safe and appropriate.',
      'Practice truthful leadership.',
      'Use morning sunlight and disciplined routine.',
    ],
    sevaCharity: [
      'Support fatherless children, public servants, or dignity-based education.',
      'Help someone become more confident without controlling them.',
    ],
    shadowPattern: 'arrogance, pride, control, weak self-respect, or authority conflict',
  },
  {
    conductCorrections: [
      'Name emotions before reacting.',
      'Keep food, sleep, and water habits gentle and regular.',
      'Do not use mood as a weapon in close relationships.',
    ],
    fastingDiscipline:
      'Keep Monday softer: lighter food, clean water discipline, and emotional honesty.',
    gemstoneCaution:
      'Pearl-style strengthening needs chart review; emotional steadiness comes first.',
    higherExpression: 'nourishment, sensitivity, peace, memory, and emotional intelligence',
    karmicLesson: 'emotions, mother, care, nourishment, public mood, and mental peace',
    lifestylePractice: 'Write one feeling plainly before making a sensitive decision.',
    mantraPrayer: 'Chandra mantra, Shiva prayer, or quiet gratitude to the mother principle.',
    planet: 'Moon',
    remedyDirections: [
      'Care for mother or maternal figures where healthy.',
      'Donate rice, milk, or water support to those in need.',
      'Protect sleep and emotional rhythm.',
    ],
    sevaCharity: [
      'Support mothers, caregivers, children, or food/water causes.',
      'Offer nourishment without emotional bargaining.',
    ],
    shadowPattern: 'mood swings, dependency, insecurity, overreaction, or emotional confusion',
  },
  {
    conductCorrections: [
      'Use strength to protect, not dominate.',
      'Pause before sharp speech.',
      'Turn anger into disciplined action.',
    ],
    fastingDiscipline:
      'Use Tuesday for controlled effort, exercise, and one repaired conflict.',
    gemstoneCaution:
      'Red coral-style strengthening can intensify heat; use only after proper chart review.',
    higherExpression: 'courage, protection, decisiveness, stamina, and clean action',
    karmicLesson: 'anger, courage, siblings, land, competition, and physical drive',
    lifestylePractice: 'Do one physical task fully before arguing or forcing an outcome.',
    mantraPrayer: 'Hanuman Chalisa, Mangal mantra, or prayer for courage with restraint.',
    planet: 'Mars',
    remedyDirections: [
      'Practice physical discipline.',
      'Protect someone vulnerable without aggression.',
      'Avoid impulsive speech and reckless risk.',
    ],
    sevaCharity: [
      'Support soldiers, firefighters, athletes in need, or injured workers.',
      'Help siblings or neighbors through useful action, not advice alone.',
    ],
    shadowPattern: 'anger, impatience, conflict, accidents, or forceful decision-making',
  },
  {
    conductCorrections: [
      'Do not manipulate with words.',
      'Keep promises in trade, writing, and communication.',
      'Ask clarifying questions before judging.',
    ],
    fastingDiscipline:
      'Use Wednesday to simplify accounts, messages, documents, and learning.',
    gemstoneCaution:
      'Emerald-style strengthening needs chart review; honest communication comes first.',
    higherExpression: 'intelligence, skill, humor, trade, learning, and adaptable speech',
    karmicLesson: 'speech, learning, business, calculation, friendship, and nervous habits',
    lifestylePractice: 'Correct one confusion in writing before it becomes a problem.',
    mantraPrayer: 'Budh mantra, Ganesha prayer, or a short learning-focused practice.',
    planet: 'Mercury',
    remedyDirections: [
      'Speak clearly and honestly.',
      'Help students or learners.',
      'Improve one skill through repetition.',
    ],
    sevaCharity: [
      'Donate books, stationery, learning tools, or practical guidance.',
      'Help someone understand a form, document, or decision.',
    ],
    shadowPattern: 'lying, overthinking, nervousness, scattered effort, or clever avoidance',
  },
  {
    conductCorrections: [
      'Respect teachers, elders, and sincere guidance.',
      'Do not use knowledge to dominate.',
      'Keep ethics ahead of convenience.',
    ],
    fastingDiscipline:
      'Use Thursday for study, gratitude, and one wise long-term choice.',
    gemstoneCaution:
      'Yellow sapphire-style strengthening should be chart-specific; wisdom practice comes first.',
    higherExpression: 'wisdom, faith, children, teachers, generosity, and good judgment',
    karmicLesson: 'guru, dharma, children, counsel, ethics, and blessings',
    lifestylePractice: 'Study or teach one useful truth, then apply it in one action.',
    mantraPrayer: 'Guru mantra, Vishnu prayer, or gratitude to a teacher.',
    planet: 'Jupiter',
    remedyDirections: [
      'Respect teachers and elders.',
      'Support education or children.',
      'Practice generosity without superiority.',
    ],
    sevaCharity: [
      'Donate books, food, or education support.',
      'Mentor someone patiently without expecting praise.',
    ],
    shadowPattern: 'false confidence, poor judgment, disrespect for guidance, or moral laziness',
  },
  {
    conductCorrections: [
      'Respect spouse, partners, women, and mutual consent.',
      'Keep pleasure clean, not addictive.',
      'Maintain beauty and cleanliness without vanity.',
    ],
    fastingDiscipline:
      'Use Friday for cleanliness, gratitude, relationship repair, and balanced enjoyment.',
    gemstoneCaution:
      'Diamond-style strengthening should never be casual; relationship conduct comes first.',
    higherExpression: 'love, harmony, beauty, devotion, comfort, art, and diplomacy',
    karmicLesson: 'love, marriage, pleasure, attraction, luxury, art, and compromise',
    lifestylePractice: 'Make one relationship or living space cleaner and kinder.',
    mantraPrayer: 'Shukra mantra, Lakshmi prayer, or devotional gratitude through beauty.',
    planet: 'Venus',
    remedyDirections: [
      'Respect spouse and women.',
      'Practice cleanliness, art, and balanced pleasure.',
      'Avoid exploitation, addiction, or transactional affection.',
    ],
    sevaCharity: [
      'Support women in need, marriage support causes, artists, or dignity kits.',
      'Offer beauty or comfort without expecting control.',
    ],
    shadowPattern: 'overindulgence, relationship imbalance, vanity, lust, or comfort addiction',
  },
  {
    conductCorrections: [
      'Do hard work without resentment.',
      'Respect elderly people, workers, and people with less power.',
      'Keep time, promises, and boundaries.',
    ],
    fastingDiscipline:
      'Use Saturday for one neglected duty, simple food, humility, and service.',
    gemstoneCaution:
      'Blue sapphire-style strengthening can be intense; do not use it without expert chart review.',
    higherExpression: 'discipline, humility, patience, endurance, justice, and mature service',
    karmicLesson: 'hard work, delay, humility, workers, old age, poverty, and responsibility',
    lifestylePractice: 'Finish one delayed responsibility before asking for easier results.',
    mantraPrayer: 'Shani mantra, Hanuman prayer, Shiva prayer, or silent service.',
    planet: 'Saturn',
    remedyDirections: [
      'Serve elderly, poor, disabled, ignored, or working-class people respectfully.',
      'Do honest work and be punctual.',
      'Avoid cruelty, entitlement, and looking down on people below you.',
    ],
    sevaCharity: [
      'Help elderly people, laborers, beggars, cleaners, drivers, or people in hardship.',
      'Donate shoes, blankets, food, or useful support with humility.',
    ],
    shadowPattern: 'fear, delay, laziness, harshness, resentment, loneliness, or class arrogance',
  },
  {
    conductCorrections: [
      'Check facts before chasing shortcuts.',
      'Reduce addiction, obsession, and image-driven choices.',
      'Do not exploit outsiders or unfamiliar systems.',
    ],
    fastingDiscipline:
      'Use Saturday or shadow-period days for decluttering, silence, and clean verification.',
    gemstoneCaution:
      'Hessonite-style strengthening should be rare and chart-specific; mental clarity comes first.',
    higherExpression: 'innovation, worldly strategy, foreign links, research, and fearless adaptation',
    karmicLesson: 'desire, obsession, foreignness, confusion, ambition, and unconventional paths',
    lifestylePractice: 'Before a big desire-driven move, write the risk, proof, and motive clearly.',
    mantraPrayer: 'Rahu mantra, Durga/Bhairav prayer, or a grounding protection practice.',
    planet: 'Rahu',
    remedyDirections: [
      'Declutter life and reduce addictive loops.',
      'Serve marginalized or foreign/outsider communities respectfully.',
      'Truth-check decisions before chasing sudden gains.',
    ],
    sevaCharity: [
      'Support people treated as outsiders or socially ignored.',
      'Help someone with practical technology, documents, or social navigation.',
    ],
    shadowPattern: 'obsession, illusion, shortcuts, addiction, scandal, or restless ambition',
  },
  {
    conductCorrections: [
      'Practice attached detachment: care fully, but do not control the result.',
      'Avoid isolation that becomes bitterness.',
      'Reduce ego in spiritual or intellectual conclusions.',
    ],
    fastingDiscipline:
      'Use Tuesday or Saturday for silence, simplicity, and one selfless action.',
    gemstoneCaution:
      'Cat’s eye-style strengthening is sensitive and should not be casual; spiritual conduct comes first.',
    higherExpression: 'detachment, intuition, moksha, surrender, subtle perception, and release',
    karmicLesson: 'detachment, moksha, isolation, past-life residue, animals, and surrender',
    lifestylePractice: 'Do one good action without announcing it or expecting visible return.',
    mantraPrayer: 'Ketu mantra, Ganesha prayer, Shiva prayer, or quiet surrender practice.',
    planet: 'Ketu',
    remedyDirections: [
      'Feed or help dogs ethically where safe and legal.',
      'Practice spiritual discipline and humility.',
      'Release control over outcomes while still doing the work.',
    ],
    sevaCharity: [
      'Feed dogs safely or support animal rescue without creating dependency or harm.',
      'Help someone quietly without claiming credit.',
    ],
    shadowPattern: 'confusion, isolation, sudden disinterest, escapism, or spiritual ego',
  },
];

const REMEDY_PRIORITY = [
  'Conduct correction first: change the behavior connected to the planet.',
  'Seva and charity second: serve the people, beings, or causes ruled by the planet.',
  'Mantra or prayer third: repeatable devotion without fear.',
  'Fasting or discipline fourth: simple weekly restraint if health and circumstances allow.',
  'Lifestyle practice fifth: one visible habit the user can actually keep.',
  'Gemstones last: only with chart-specific review and never as pressure buying.',
];

const SAFETY_RULES = [
  'Remedies are guidance for steadiness, not guaranteed outcome control.',
  'No remedy should replace urgent care, professional advice, or real-world responsibility.',
  'Do not recommend expensive, risky, or obsessive practices by default.',
  'Use wording such as “traditionally believed to pacify” instead of “this will definitely fix.”',
];

export function composeHolisticFoundationModel(
  kundli?: KundliData,
): HolisticFoundationModel {
  if (!kundli) {
    return {
      activePlanetFocus: [],
      answerParts: ANSWER_PARTS,
      askPrompt:
        'Create my Kundli, then explain my chart through prediction, timing, karma pattern, remedy, practical action, and safety boundary.',
      planetRemedyMap: PLANET_KARMA_REMEDY_MAP,
      remedyPriority: REMEDY_PRIORITY,
      safetyRules: SAFETY_RULES,
      status: 'pending',
      subtitle:
        'Create a Kundli so Predicta can connect remedies to real dasha, planet, house, and transit evidence.',
      title: 'Holistic Jyotish foundation is waiting.',
    };
  }

  const activePlanetFocus = buildActivePlanetFocus(kundli);

  return {
    activePlanetFocus,
    answerParts: ANSWER_PARTS,
    askPrompt:
      'Explain my current life question holistically: prediction, chart proof, timing, karma pattern, safe remedy, practical action, and boundaries.',
    planetRemedyMap: PLANET_KARMA_REMEDY_MAP,
    remedyPriority: REMEDY_PRIORITY,
    safetyRules: SAFETY_RULES,
    status: 'ready',
    subtitle:
      'Every serious answer should combine chart proof, timing, karmic pattern, remedy direction, practical action, and safety.',
    title: `${kundli.birthDetails.name}'s holistic Jyotish foundation`,
  };
}

export function getPlanetKarmaRemedyProfile(
  planet: string,
): PlanetKarmaRemedyProfile | undefined {
  return PLANET_KARMA_REMEDY_MAP.find(
    item => item.planet.toLowerCase() === planet.toLowerCase(),
  );
}

function buildActivePlanetFocus(kundli: KundliData): HolisticPlanetFocus[] {
  const current = kundli.dasha.current;
  const candidates = [
    {
      planet: current.mahadasha,
      priority: 'high' as const,
      whyItMatters: `${current.mahadasha} Mahadasha sets the main life chapter until ${current.endDate}.`,
    },
    {
      planet: current.antardasha,
      priority: 'medium' as const,
      whyItMatters: `${current.antardasha} Antardasha is the active sub-period inside the current Mahadasha.`,
    },
    ...buildTransitCandidates(kundli),
  ];

  const used = new Set<string>();
  return candidates
    .filter(candidate => {
      const key = candidate.planet.toLowerCase();
      if (used.has(key) || !getPlanetKarmaRemedyProfile(candidate.planet)) {
        return false;
      }
      used.add(key);
      return true;
    })
    .slice(0, 4)
    .map(candidate => buildPlanetFocus(kundli, candidate));
}

function buildTransitCandidates(kundli: KundliData): Array<{
  planet: string;
  priority: 'low' | 'medium' | 'high';
  whyItMatters: string;
}> {
  return (kundli.transits ?? [])
    .filter(transit => ['Saturn', 'Jupiter', 'Rahu', 'Ketu'].includes(transit.planet))
    .slice(0, 2)
    .map(transit => ({
      planet: transit.planet,
      priority: transit.weight === 'challenging' ? 'high' : 'medium',
      whyItMatters: `${transit.planet} Gochar is ${transit.weight} from Lagna house ${transit.houseFromLagna} and Moon house ${transit.houseFromMoon}.`,
    }));
}

function buildPlanetFocus(
  kundli: KundliData,
  candidate: {
    planet: string;
    priority: 'low' | 'medium' | 'high';
    whyItMatters: string;
  },
): HolisticPlanetFocus {
  const profile = getPlanetKarmaRemedyProfile(candidate.planet);
  const placement = findPlanet(kundli, candidate.planet);
  const chartEvidence = buildChartEvidence(kundli, candidate.planet, placement);

  if (!profile) {
    return {
      chartEvidence,
      karmicPattern: `${candidate.planet} needs practical discipline and calm observation.`,
      mantraDevotion: 'Use simple prayer or quiet reflection without fear.',
      planet: candidate.planet,
      practicalAction: 'Choose one small corrective action this week.',
      priority: candidate.priority,
      remedyDirection: 'Use safe, affordable, repeatable practice.',
      safetyNote: SAFETY_RULES[0],
      simpleRemedy: 'One steady routine, no fear, no pressure buying.',
      whyItMatters: candidate.whyItMatters,
    };
  }

  return {
    chartEvidence,
    karmicPattern: `${profile.planet} teaches ${profile.karmicLesson}. Its higher expression is ${profile.higherExpression}; its shadow can show as ${profile.shadowPattern}.`,
    mantraDevotion: profile.mantraPrayer,
    planet: profile.planet,
    practicalAction: profile.lifestylePractice,
    priority: candidate.priority,
    remedyDirection: profile.remedyDirections[0],
    safetyNote:
      'Traditionally, this is believed to pacify the planet. It is not a guarantee and should not replace real-world action.',
    simpleRemedy: [
      profile.conductCorrections[0],
      profile.sevaCharity[0],
    ].join(' '),
    whyItMatters: candidate.whyItMatters,
  };
}

function buildChartEvidence(
  kundli: KundliData,
  planet: string,
  placement?: PlanetPosition,
): string[] {
  const evidence = [
    `Current dasha: ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`,
  ];

  if (placement) {
    evidence.push(
      `${planet} is in ${placement.sign}, house ${placement.house}, ${placement.nakshatra} pada ${placement.pada}${placement.retrograde ? ', retrograde' : ''}.`,
    );
  }

  const house = placement
    ? kundli.houses.find(item => item.house === placement.house)
    : undefined;
  if (house) {
    evidence.push(
      `House ${house.house} is ${house.sign}; lord ${house.lord}; planets here: ${house.planets.join(', ') || 'none'}.`,
    );
  }

  const transit = (kundli.transits ?? []).find(item => item.planet === planet);
  if (transit) {
    evidence.push(
      `${planet} transit is ${transit.weight} from Lagna house ${transit.houseFromLagna} and Moon house ${transit.houseFromMoon}.`,
    );
  }

  return evidence.slice(0, 4);
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(
    planet => planet.name.toLowerCase() === name.toLowerCase(),
  );
}
