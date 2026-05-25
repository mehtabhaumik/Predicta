import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import type {
  KundliData,
  NadiChartStoryLens,
  NadiJyotishActivation,
  NadiJyotishInsightDepth,
  NadiJyotishPattern,
  NadiJyotishPremiumPlan,
  PlanetPosition,
  SupportedLanguage,
} from '@pridicta/types';
import {
  getLocalizedPlanetName,
  getLocalizedSignName,
} from './chartLayout';

type Options = {
  depth?: NadiJyotishInsightDepth;
  handoffQuestion?: string;
  language?: SupportedLanguage;
};

const SIGN_ORDER = [
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
];

const PLANET_KARAKAS: Record<string, string> = {
  Jupiter: 'wisdom, children, teachers, faith, growth, and protection',
  Ketu: 'past-life detachment, moksha, research, isolation, and release',
  Mars: 'action, courage, land, siblings, conflict, and decisive effort',
  Mercury: 'speech, trade, learning, analysis, writing, and negotiation',
  Moon: 'mind, mother, nourishment, public mood, and emotional memory',
  Rahu: 'unusual ambition, foreignness, technology, hunger, and obsession',
  Saturn: 'karma, discipline, delay, work, responsibility, and maturity',
  Sun: 'father, authority, vitality, government, status, and self-respect',
  Venus: 'relationships, comfort, beauty, vehicles, pleasure, and agreement',
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity, body, direction, and life approach',
  2: 'family, speech, savings, food habits, and stored wealth',
  3: 'effort, siblings, courage, skills, and self-made movement',
  4: 'home, mother, property, peace, and emotional security',
  5: 'children, learning, creativity, romance, and past merit',
  6: 'service, workload, debts, health discipline, and competition',
  7: 'marriage, partner, clients, contracts, and public exchange',
  8: 'sudden change, inheritance, hidden matters, research, and transformation',
  9: 'dharma, teachers, father, fortune, blessings, and long travel',
  10: 'career, duty, status, public contribution, and authority',
  11: 'income, gains, networks, elder support, and fulfillment',
  12: 'expenses, sleep, retreat, foreign lands, and spiritual letting go',
};

export function composeNadiJyotishPlan(
  kundli?: KundliData,
  options: Options = {},
): NadiJyotishPremiumPlan {
  const depth = options.depth ?? 'FREE';
  const handoffQuestion = options.handoffQuestion?.trim() || undefined;
  const language = options.language ?? 'en';

  if (!kundli) {
    return buildPendingPlan(depth, handoffQuestion, language);
  }

  const patterns = buildPatterns(kundli, depth, language);
  const activations = buildActivations(kundli, patterns, depth, language);
  const storyLens = buildNadiStoryLens(kundli, patterns, activations, language);
  const rahuKetuAxis = buildRahuKetuAxis(kundli, patterns, activations, language);
  const validationQuestions = buildValidationQuestions(kundli, patterns, language);
  const validationStatus = patterns.length >= 3 ? 'partially-confirmed' : 'needs-validation';

  return {
    activations,
    askPrompt: handoffQuestion
      ? `Answer this in Nadi Predicta using Nadi-style planetary links only: ${handoffQuestion}`
      : 'Open my Nadi Predicta reading and explain the strongest planetary story patterns.',
    ctas: [
      {
        id: 'nadi-question',
        label: localize(
          language,
          'Ask Nadi Predicta',
          getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.9f5ad66fa7"),
          getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.21e2678a6a"),
        ),
        prompt: handoffQuestion
          ? `Use Nadi Predicta for this question: ${handoffQuestion}`
          : 'Use Nadi Predicta to read my strongest planetary story pattern.',
      },
      {
        id: 'nadi-validation',
        label: localize(language, 'Validate Pattern', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.02053cce92"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.3ba3bd0bd4")),
        prompt:
          'Ask me simple validation questions before giving a deeper Nadi reading.',
      },
      {
        id: 'nadi-premium',
        label: localize(language, 'Premium Nadi', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1bb0c6d8b3"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.c57f97e3ef")),
        prompt:
          'Show what Premium Nadi depth adds: planet links, timing activations, validation questions, and remedies.',
      },
    ],
    depth,
    freePreview: buildFreePreview(kundli, patterns, language),
    guardrails: buildGuardrails(language),
    handoffQuestion,
    limitations: [
      localize(
        language,
        'Predicta does not claim access to original palm-leaf manuscripts or private lineage records.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.9f8663fe9b"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a1db459fd4"),
      ),
      localize(
        language,
        'This reading is a Nadi-inspired chart-signature layer, not Parashari yoga/dasha analysis and not KP sub-lord judgement.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.208fb30cc6"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.73c248b770"),
      ),
      localize(
        language,
        'Nadi-style patterns need validation from the user before deeper event timing is presented.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e7cee7a020"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f6a11363f7"),
      ),
      localize(
        language,
        'No Nadi answer should promise fixed events, death timing, medical certainty, legal certainty, or financial certainty.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f23a0594ca"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.420d32e063"),
      ),
    ],
    methodSummary: localize(
      language,
      'Predicta Nadi reads planet-to-planet stories: conjunction-style links, trinal links, opposition links, karaka themes, Rahu/Ketu karmic axis, and slow-transit activation. It stays separate from Parashari and KP.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.5219789124"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.3570ee1943"),
    ),
    ownerName: kundli.birthDetails.name,
    patterns,
    premiumOnly: true,
    premiumSynthesis:
      depth === 'PREMIUM'
        ? buildPremiumSynthesis(kundli, patterns, activations, language)
        : undefined,
    premiumUnlock: localize(
      language,
      'Premium Nadi unlocks full chart-signature reading, validation questions, karmic story sequencing, transit activation windows, remedies, and a separate Nadi report without mixing Parashari or KP methods.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.8125eede21"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.ac11db9491"),
    ),
    schoolBoundary: localize(
      language,
      'Regular Predicta reads Parashari. KP Predicta reads KP. Nadi Predicta reads Nadi-style planetary stories and validation patterns only.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.8f13094b23"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1a221604bb"),
    ),
    status: 'ready',
    storyLens,
    rahuKetuAxis,
    validationStatus,
    digest: buildNadiDigest({
      activations,
      depth,
      kundliId: kundli.id,
      patterns,
      rahuKetuAxis,
      storyLens,
      validationQuestions,
      validationStatus,
    }),
    subtitle:
      depth === 'PREMIUM'
        ? localize(
            language,
            'A separate premium Nadi reading room with chart-signature depth.',
            getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1a56f71073"),
            getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.78ed07c8ec"),
          )
        : localize(
            language,
            'A separate Nadi reading room. Free gives a useful method summary; Premium unlocks depth.',
            getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.7a64b5f912"),
            getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.41c6af7ddc"),
          ),
    title: localize(
      language,
      `${kundli.birthDetails.name}'s Nadi Predicta plan`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.0ff948d0ca", [kundli.birthDetails.name]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.0050f9820f", [kundli.birthDetails.name]),
    ),
    validationQuestions,
  };
}

function buildPendingPlan(
  depth: NadiJyotishInsightDepth,
  handoffQuestion?: string,
  language: SupportedLanguage = 'en',
): NadiJyotishPremiumPlan {
  return {
    activations: [],
    askPrompt:
      'Create my Kundli first, then open Nadi Predicta with my question.',
    ctas: [
      {
        id: 'create-kundli',
        label: localize(language, 'Create Kundli', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.7cacfebde9"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.c0e4dc5abd")),
        prompt:
          'Create my Kundli first, then keep my question ready for Nadi Predicta.',
      },
    ],
    depth,
    freePreview: localize(
      language,
      'Nadi Predicta needs a calculated birth profile before it can read planetary story links.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a97fd5c951"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.3391051674"),
    ),
    guardrails: buildGuardrails(language),
    handoffQuestion,
    limitations: [
      localize(
        language,
        'Create a Kundli first so Nadi Predicta has verified birth details.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.4b052f29b9"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.bb89e6afb7"),
      ),
    ],
    methodSummary: localize(
      language,
      'Nadi Predicta will read Nadi-style planetary stories after the birth profile is ready.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.d298d2e027"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.65c69a2356"),
    ),
    ownerName: 'You',
    patterns: [],
    premiumOnly: true,
    premiumUnlock: localize(
      language,
      'Premium Nadi unlocks a separate reading room with planetary story links, validation questions, timing activation, and remedies.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.71fbfd49d8"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a06ed37a6d"),
    ),
    schoolBoundary: localize(
      language,
      'Nadi Predicta is separate from Regular Parashari Predicta and KP Predicta.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.715e413f09"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.6b12e23b8e"),
    ),
    status: 'pending',
    storyLens: buildPendingNadiStoryLens(language),
    rahuKetuAxis: {
      balancePractice: localize(language, 'Create the Kundli first.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.89252b3f69"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.8acc4e17f3")),
      becomesLouder: localize(language, 'Pending until planetary links exist.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a3d004745e"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.c425425816")),
      learningToRelease: localize(language, 'Pending until Ketu evidence exists.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.835110ec63"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.d363e6b904")),
      pullsForward: localize(language, 'Pending until Rahu evidence exists.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.10b2daa054"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.70aa82f2a8")),
    },
    validationStatus: 'needs-validation',
    digest: {
      activeStoryFocus: 'Pending Nadi story focus',
      activationWindows: [],
      depthAvailable: depth,
      giftInsidePattern: 'Pending until a Kundli exists.',
      latestReportSummary:
        'Nadi report leads with strongest story thread, gift, lesson, activation, and practice, with evidence in a Story Evidence Appendix.',
      nextPractice: 'Create the Kundli first.',
      rahuKetuAxisSummary: 'Pending until Rahu/Ketu evidence exists.',
      repeatingLesson: 'Pending until a Kundli exists.',
      storyEvidenceAvailability: 'pending',
      strongestStoryThread: 'Pending',
      validationQuestions: [],
      validationStatus: 'needs-validation',
    },
    subtitle: localize(
      language,
      'Create your Kundli to begin the premium Nadi reading room.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.4bf1222674"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1fe70b8964"),
    ),
    title: localize(
      language,
      'Nadi Predicta plan',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.ac5e13cc45"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1f1ca4e4bb"),
    ),
    validationQuestions: [
      localize(
        language,
        'Please share or create your birth profile first.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a034563c15"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.6f72925cb0"),
      ),
    ],
  };
}

function buildPatterns(
  kundli: KundliData,
  depth: NadiJyotishInsightDepth,
  language: SupportedLanguage,
): NadiJyotishPattern[] {
  const planets = kundli.planets.filter(planet => PLANET_KARAKAS[planet.name]);
  const patterns: NadiJyotishPattern[] = [];

  for (let index = 0; index < planets.length; index += 1) {
    for (let next = index + 1; next < planets.length; next += 1) {
      const first = planets[index];
      const second = planets[next];
      const relation = getNadiRelation(first, second);
      if (!relation) {
        continue;
      }
      patterns.push(buildPattern(first, second, relation, language));
    }
  }

  const rahu = planets.find(planet => planet.name === 'Rahu');
  const ketu = planets.find(planet => planet.name === 'Ketu');
  if (rahu && ketu) {
    patterns.push({
      confidence: 'medium',
      evidence: [
        localize(
          language,
          `Rahu is in ${getLocalizedSignName(rahu.sign, language)}, house ${rahu.house}.`,
          formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.db25b6ba83", [getLocalizedSignName(rahu.sign, language), rahu.house]),
          formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.3a75d7ebc4", [getLocalizedSignName(rahu.sign, language), rahu.house]),
        ),
        localize(
          language,
          `Ketu is in ${getLocalizedSignName(ketu.sign, language)}, house ${ketu.house}.`,
          formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.6eb7c9133c", [getLocalizedSignName(ketu.sign, language), ketu.house]),
          formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.697e8c0dc0", [getLocalizedSignName(ketu.sign, language), ketu.house]),
        ),
      ],
      freeInsight: localize(
        language,
        'Rahu and Ketu show where life pulls you forward and where it asks for release.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.2ed35f3ef3"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.660710ba4d"),
      ),
      id: 'nadi-rahu-ketu-axis',
      lifeAreas: ['general', 'spirituality'],
      meaning: `Rahu pulls toward ${HOUSE_MEANINGS[rahu.house]}; Ketu asks maturity around ${HOUSE_MEANINGS[ketu.house]}.`,
      observation: localize(
        language,
        `Rahu/Ketu axis runs through houses ${rahu.house}/${ketu.house}.`,
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.ca8d9e340f", [rahu.house, ketu.house]),
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e03f101947", [rahu.house, ketu.house]),
      ),
      planets: ['Rahu', 'Ketu'],
      premiumDetail: localize(
        language,
        'Premium Nadi reads this as a karmic axis: appetite, unfinished desire, detachment, and the transit periods that awaken this story.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fd6dc70f13"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fb672b6779"),
      ),
      relation: 'rahu-ketu-axis',
      title: localize(
        language,
        'Rahu-Ketu karmic axis',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a053a1ea60"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.5dca588e68"),
      ),
      weight: 'mixed',
    });
  }

  return patterns
    .sort((a, b) => patternRank(a) - patternRank(b))
    .slice(0, depth === 'PREMIUM' ? 8 : 4);
}

function buildPattern(
  first: PlanetPosition,
  second: PlanetPosition,
  relation: NadiJyotishPattern['relation'],
  language: SupportedLanguage,
): NadiJyotishPattern {
  const relationText = relationLabel(relation, language);
  const firstName = getLocalizedPlanetName(first.name, language);
  const secondName = getLocalizedPlanetName(second.name, language);
  const firstSign = getLocalizedSignName(first.sign, language);
  const secondSign = getLocalizedSignName(second.sign, language);
  const lifeAreas = Array.from(
    new Set([...areasForPlanet(first.name), ...areasForPlanet(second.name)]),
  );
  const lifeAreaText = lifeAreas
    .map(area => localizeLifeArea(area, language))
    .join(', ');
  const weight = patternWeight(first.name, second.name, relation);

  return {
    confidence: relation === 'same-sign' ? 'high' : 'medium',
    evidence: [
      localize(
        language,
        `${firstName}: ${firstSign}, house ${first.house}, ${first.nakshatra}.`,
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a779377b25", [firstName, firstSign, first.house, first.nakshatra]),
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fdd35cabf2", [firstName, firstSign, first.house, first.nakshatra]),
      ),
      localize(
        language,
        `${secondName}: ${secondSign}, house ${second.house}, ${second.nakshatra}.`,
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a779377b25", [secondName, secondSign, second.house, second.nakshatra]),
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fdd35cabf2", [secondName, secondSign, second.house, second.nakshatra]),
      ),
      localize(
        language,
        `${relationText} links their karakas.`,
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.d24474eb6e", [relationText]),
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.46bbdb4e82", [relationText]),
      ),
    ],
    freeInsight: localize(
      language,
      `${firstName} and ${secondName} are linked by ${relationText}, so this pattern keeps repeating through ${lifeAreaText}. In plain Nadi language, one life topic keeps waking up another instead of staying isolated.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.071fb06eef", [firstName, secondName, relationText, lifeAreaText]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.57723038b0", [firstName, secondName, relationText, lifeAreaText]),
    ),
    id: `nadi-${first.name.toLowerCase()}-${second.name.toLowerCase()}-${relation}`,
    lifeAreas,
    meaning: localize(
      language,
      `${firstName} carries ${PLANET_KARAKAS[first.name]}; ${secondName} carries ${PLANET_KARAKAS[second.name]}. Their link connects ${HOUSE_MEANINGS[first.house]} with ${HOUSE_MEANINGS[second.house]}, so the story tends to repeat through ${lifeAreaText}.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.dbb0dc9e86", [firstName, PLANET_KARAKAS[first.name], secondName, PLANET_KARAKAS[second.name], HOUSE_MEANINGS[first.house], HOUSE_MEANINGS[second.house], lifeAreaText]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e1bae47961", [firstName, PLANET_KARAKAS[first.name], secondName, PLANET_KARAKAS[second.name], HOUSE_MEANINGS[first.house], HOUSE_MEANINGS[second.house], lifeAreaText]),
    ),
    observation: localize(
      language,
      `${firstName} in ${firstSign} house ${first.house} has a ${relationText} with ${secondName} in ${secondSign} house ${second.house}.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f0dd4544c4", [firstSign, first.house, firstName, secondSign, second.house, secondName, relationText]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.57383c5a75", [firstSign, first.house, firstName, secondSign, second.house, secondName, relationText]),
    ),
    planets: [first.name, second.name],
    premiumDetail: localize(
      language,
      `Premium Nadi reads this as a story chain: ${firstName} theme -> ${secondName} theme, then checks maturity age, slow-transit activation, repeated life evidence, and validation questions before giving event-level guidance.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.c133c2c900", [firstName, secondName]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.749ce77983", [firstName, secondName]),
    ),
    relation,
    title: localize(
      language,
      `${firstName}-${secondName} story link`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.d048df2d53", [firstName, secondName]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.b70178c387", [firstName, secondName]),
    ),
    weight,
  };
}

function buildActivations(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
  depth: NadiJyotishInsightDepth,
  language: SupportedLanguage,
): NadiJyotishActivation[] {
  const current = kundli.dasha.current;
  const dashaPattern = patterns.find(pattern =>
    pattern.planets.some(
      planet =>
        planet === current.mahadasha || planet === current.antardasha,
    ),
  );
  const activations: NadiJyotishActivation[] = [];

  if (dashaPattern) {
    activations.push({
      guidance: localize(
        language,
        'Treat this as an active story, then validate with real-life events before going deeper.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.2454797da2"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.39c8895916"),
      ),
      id: 'nadi-dasha-activation',
      observation: localize(
        language,
        `${current.mahadasha}/${current.antardasha} touches ${dashaPattern.planets.join(' and ')}.`,
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a8296bb301", [current.mahadasha, current.antardasha, dashaPattern.planets.join(getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a3094d0683"))]),
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.19a03aa6aa", [current.mahadasha, current.antardasha, dashaPattern.planets.join(getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1891205ad7"))]),
      ),
      premiumDetail: localize(
        language,
        'Premium connects this active story to sub-period timing, repeated life themes, and practical remedy discipline.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.bf800c3df8"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.3d7224dbbf"),
      ),
      timing: `${current.startDate} to ${current.endDate}`,
      title: localize(
        language,
        'Current timing touches a Nadi story',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.240e0f3763"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.c038d8cb7b"),
      ),
      trigger: `${getLocalizedPlanetName(current.mahadasha, language)}/${getLocalizedPlanetName(current.antardasha, language)}`,
    });
  }

  const slowTransits = (kundli.transits ?? []).filter(transit =>
    ['Saturn', 'Jupiter', 'Rahu', 'Ketu'].includes(transit.planet),
  );
  slowTransits.slice(0, depth === 'PREMIUM' ? 4 : 2).forEach(transit => {
    const linkedPattern = patterns.find(pattern =>
      pattern.evidence.some(item => item.includes(transit.sign)),
    );
    activations.push({
      guidance:
        transit.weight === 'supportive'
          ? localize(
              language,
              'Use this window for steady progress without overpromising outcomes.',
              getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.8876648ab3"),
              getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e2cbb60e62"),
            )
          : localize(
              language,
              'Move slowly, validate facts, and avoid fear-based conclusions.',
              getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.0969a7a63b"),
              getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.b508b1a644"),
            ),
      id: `nadi-transit-${transit.planet.toLowerCase()}`,
      observation: linkedPattern
        ? localize(
            language,
            `${getLocalizedPlanetName(transit.planet, language)} is moving through ${getLocalizedSignName(transit.sign, language)}, touching a sign used by ${linkedPattern.title}.`,
            formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.94955991c0", [getLocalizedPlanetName(transit.planet, language), getLocalizedSignName(transit.sign, language), linkedPattern.title]),
            formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.065b9c3b45", [getLocalizedPlanetName(transit.planet, language), getLocalizedSignName(transit.sign, language), linkedPattern.title]),
          )
        : localize(
            language,
            `${getLocalizedPlanetName(transit.planet, language)} is moving through ${getLocalizedSignName(transit.sign, language)}, house ${transit.houseFromLagna} from Lagna.`,
            formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fa275b2b39", [getLocalizedPlanetName(transit.planet, language), getLocalizedSignName(transit.sign, language), transit.houseFromLagna]),
            formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.9a6e1b5a0e", [getLocalizedPlanetName(transit.planet, language), getLocalizedSignName(transit.sign, language), transit.houseFromLagna]),
          ),
      premiumDetail: localize(
        language,
        'Premium checks whether this slow transit repeats a natal planet story and whether the user has already seen similar events.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1ec1858d04"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f94e498e4e"),
      ),
      timing: transit.calculatedAt,
      title: localize(
        language,
        `${getLocalizedPlanetName(transit.planet, language)} activation`,
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.d7c38dcff0", [getLocalizedPlanetName(transit.planet, language)]),
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e3a1dff753", [getLocalizedPlanetName(transit.planet, language)]),
      ),
      trigger: `${getLocalizedPlanetName(transit.planet, language)} ${localize(language, 'in', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.eebf7a05f0"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.0472453dd0"))} ${getLocalizedSignName(transit.sign, language)}`,
    });
  });

  return activations.slice(0, depth === 'PREMIUM' ? 5 : 3);
}

function buildNadiStoryLens(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
  activations: NadiJyotishActivation[],
  language: SupportedLanguage,
): NadiChartStoryLens {
  const top = patterns[0];
  const activation = activations[0];
  const areaText = top?.lifeAreas
    .slice(0, 2)
    .map(area => localizeLifeArea(area, language))
    .join(', ');
  const planetText = top?.planets.join('-') ?? localize(language, 'planet story', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1abbb9b898"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.c8bf18b1a3"));

  if (!top) {
    return {
      activationSummary: localize(
        language,
        'Activation will become clearer after the first planetary story link is available.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.2ae4512182"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.86fee6b282"),
      ),
      activeLesson: localize(
        language,
        'The active lesson is pending until Predicta can identify the strongest story link.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.891e897cb5"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a439c7ef88"),
      ),
      evidencePath: [
        localize(language, 'Calculated birth profile is required.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1f1b4824a4"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.2050df6eaf")),
      ],
      hiddenPatternSentence: localize(
        language,
        `${kundli.birthDetails.name}'s Nadi story is waiting for enough planetary-link evidence before Predicta names a pattern.`,
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.97f6701c8f", [kundli.birthDetails.name]),
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.07cd4fa866", [kundli.birthDetails.name]),
      ),
      repeatingPattern: localize(
        language,
        'No repeating pattern is strong enough to name yet.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.95ce53d534"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.10f9086513"),
      ),
      shiftThatHelps: localize(
        language,
        'Validate real-life themes first, then go deeper.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.8f2cafc580"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.4c73f8a770"),
      ),
      strongestThread: localize(language, 'Pending story thread', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e5e64b4a6e"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.0e90d7a999")),
      stuckPoint: localize(
        language,
        'The risk is filling missing evidence with spiritual-sounding certainty.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.5816d1fcbe"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.4365fe8a66"),
      ),
      validationBridge: localize(
        language,
        'Predicta should ask validation questions before making event-level statements.',
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.2f62668284"),
        getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.734811489a"),
      ),
    };
  }

  return {
    activationSummary: activation
      ? `${activation.title}: ${activation.guidance}`
      : localize(
          language,
          'No timing activation should be overstated yet.',
          getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.4b2464957e"),
          getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.47304bf0b5"),
        ),
    activeLesson: localize(
      language,
      `The active lesson is to notice how ${planetText} keeps linking ${areaText || 'life areas'} instead of treating each event as isolated.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.159b427597", [planetText, areaText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f9162708c3")]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fd00fbdf75", [planetText, areaText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.212738a504")]),
    ),
    evidencePath: [
      top.observation,
      ...top.evidence.slice(0, 2),
      activation ? activation.observation : '',
    ].filter(Boolean),
    hiddenPatternSentence: localize(
      language,
      `${kundli.birthDetails.name}'s chart keeps turning ${planetText} into a repeating story through ${areaText || 'linked life areas'}; the shift is validation, patience, and conscious response rather than fixed fate.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.6e9d0970d1", [kundli.birthDetails.name, planetText, areaText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.12cfddc891")]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.d9a91bacf6", [kundli.birthDetails.name, planetText, areaText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.5bf976285c")]),
    ),
    repeatingPattern: top.meaning,
    shiftThatHelps: localize(
      language,
      `The helpful shift is to name the ${top.relation.replaceAll('-', ' ')} pattern, validate it in real life, and respond differently when it repeats.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.b9cedc7207", [top.relation.replaceAll('-', ' ')]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.546defa301", [top.relation.replaceAll('-', ' ')]),
    ),
    strongestThread: top.title,
    stuckPoint: localize(
      language,
      `The stuck point is repeating ${areaText || 'the same linked life theme'} without realizing the same story is being activated again.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e71712c0e9", [areaText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.74633e6e49")]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.653e34f782", [areaText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.88140558c5")]),
    ),
    validationBridge: localize(
      language,
      `Before going deeper, confirm whether ${planetText} actually shows up in ${areaText || 'these life areas'} in real life.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.71f5806960", [planetText, areaText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1f6af3fc76")]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a319467de8", [planetText, areaText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f4680d367f")]),
    ),
  };
}

function buildPendingNadiStoryLens(language: SupportedLanguage): NadiChartStoryLens {
  return {
    activationSummary: localize(language, 'Pending timing activation.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fbb0d418c5"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fe32b2e7af")),
    activeLesson: localize(language, 'Create the Kundli first.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.89252b3f69"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e9dab0f6d2")),
    evidencePath: [
      localize(language, 'No calculated Nadi chart evidence yet.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.7cef50ceee"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1c70949e04")),
    ],
    hiddenPatternSentence: localize(
      language,
      'Predicta will name the Nadi story only after calculated chart evidence exists.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.4c862ee615"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.3c643fbb16"),
    ),
    repeatingPattern: localize(language, 'Pending.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.22fa16cf88"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.b633ba7126")),
    shiftThatHelps: localize(language, 'Create or select a Kundli.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.977cbda57f"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fc58244313")),
    strongestThread: localize(language, 'Pending story thread', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e5e64b4a6e"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.0e90d7a999")),
    stuckPoint: localize(language, 'No interpretation before evidence.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.9a4feaa782"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.50a3435978")),
    validationBridge: localize(language, 'Validation comes after the first story thread.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.8be6e8086a"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.b1471d1d66")),
  };
}

function buildRahuKetuAxis(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
  activations: NadiJyotishActivation[],
  language: SupportedLanguage,
) {
  const axisPattern = patterns.find(pattern => pattern.relation === 'rahu-ketu-axis');
  const rahu = kundli.planets.find(planet => planet.name === 'Rahu');
  const ketu = kundli.planets.find(planet => planet.name === 'Ketu');
  const activation = activations[0];

  return {
    balancePractice: localize(
      language,
      'Pause before chasing the pull; name the old release pattern, then choose one grounded action.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.cc241b5342"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.cca63021cf"),
    ),
    becomesLouder: activation
      ? `${activation.title}: ${activation.timing}`
      : localize(
          language,
          'This axis becomes louder when dasha or slow-transit activation touches the same story.',
          getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.0ab24457bf"),
          getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.434c58552c"),
        ),
    learningToRelease: ketu
      ? localize(
          language,
          `Ketu in ${getLocalizedSignName(ketu.sign, language)} points to releasing old reflexes around ${HOUSE_MEANINGS[ketu.house]}.`,
          formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e08c6ae8fd", [getLocalizedSignName(ketu.sign, language), HOUSE_MEANINGS[ketu.house]]),
          formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1049f215a7", [getLocalizedSignName(ketu.sign, language), HOUSE_MEANINGS[ketu.house]]),
        )
      : localize(language, 'Ketu release point is pending.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.4c8f2e06ba"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.afc5c9b612")),
    pullsForward: rahu
      ? localize(
          language,
          `Rahu in ${getLocalizedSignName(rahu.sign, language)} pulls attention toward ${HOUSE_MEANINGS[rahu.house]}.`,
          formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.ec7062041b", [getLocalizedSignName(rahu.sign, language), HOUSE_MEANINGS[rahu.house]]),
          formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.63b0d5eb44", [getLocalizedSignName(rahu.sign, language), HOUSE_MEANINGS[rahu.house]]),
        )
      : axisPattern?.meaning ?? localize(language, 'Rahu pull point is pending.', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.7272bcfe08"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.aece3e3c84")),
  };
}

function buildNadiDigest({
  activations,
  depth,
  kundliId,
  patterns,
  rahuKetuAxis,
  storyLens,
  validationQuestions,
  validationStatus,
}: {
  activations: NadiJyotishActivation[];
  depth: NadiJyotishInsightDepth;
  kundliId?: string;
  patterns: NadiJyotishPattern[];
  rahuKetuAxis: ReturnType<typeof buildRahuKetuAxis>;
  storyLens: NadiChartStoryLens;
  validationQuestions: string[];
  validationStatus: NadiJyotishPremiumPlan['validationStatus'];
}): NadiJyotishPremiumPlan['digest'] {
  return {
    activeKundliId: kundliId,
    activeStoryFocus: patterns[0]?.title ?? 'Pending Nadi story focus',
    activationWindows: activations.map(item => `${item.title}: ${item.timing}`),
    depthAvailable: depth,
    giftInsidePattern: storyLens.shiftThatHelps,
    latestReportSummary:
      'Nadi report leads with strongest story thread, gift, lesson, activation, and practice, with evidence in a Story Evidence Appendix.',
    nextPractice: rahuKetuAxis.balancePractice,
    rahuKetuAxisSummary: `${rahuKetuAxis.pullsForward} ${rahuKetuAxis.learningToRelease}`,
    repeatingLesson: storyLens.activeLesson,
    storyEvidenceAvailability: patterns.length ? 'ready' : 'pending',
    strongestStoryThread: storyLens.strongestThread,
    validationQuestions: validationQuestions.slice(0, 5),
    validationStatus,
  };
}

function buildFreePreview(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
  language: SupportedLanguage,
): string {
  const top = patterns[0];
  if (!top) {
    return localize(
      language,
      `${kundli.birthDetails.name}'s Nadi space is ready. Predicta will prepare the first preview once planetary story details are available from the saved birth profile.`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.c8e98e0abf", [kundli.birthDetails.name]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.04e0131eea", [kundli.birthDetails.name]),
    );
  }
  return localize(
    language,
    `Nadi preview: ${top.title} is the strongest story right now. ${top.meaning}`,
    formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.7c0fdf351c", [top.title, top.meaning]),
    formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.9b3af7a1c7", [top.title, top.meaning]),
  );
}

function buildPremiumSynthesis(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
  activations: NadiJyotishActivation[],
  language: SupportedLanguage,
): string {
  const patternText = patterns
    .slice(0, 3)
    .map(pattern => pattern.title)
    .join(', ');
  const activationText = activations
    .slice(0, 2)
    .map(activation => activation.trigger)
    .join(', ');
  return localize(
    language,
    `${kundli.birthDetails.name}'s Premium Nadi reading will sequence ${patternText || 'planetary story links'}, check activation through ${activationText || 'current timing'}, and then turn that story into life guidance without pretending fixed fate.`,
    formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.20885edc07", [kundli.birthDetails.name, patternText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f32db91e32"), activationText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.861a1654a1")]),
    formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.da23f3b0d7", [kundli.birthDetails.name, patternText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.467abefc5a"), activationText || getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.062add62ef")]),
  );
}

function buildValidationQuestions(
  kundli: KundliData,
  patterns: NadiJyotishPattern[],
  language: SupportedLanguage,
): string[] {
  const questions = [
    localize(
      language,
      `Does ${kundli.birthDetails.name} relate more to practical responsibility first, or emotional restlessness first?`,
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.d79b8fad7f", [kundli.birthDetails.name]),
      formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.39e6bcea1a", [kundli.birthDetails.name]),
    ),
    localize(
      language,
      'Has the same life issue repeated in cycles rather than one isolated event?',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.cc23ca7945"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.20a3993575"),
    ),
    localize(
      language,
      'Is the current question about an event, a relationship pattern, money/career movement, or spiritual direction?',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e2c73c0c38"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.942cd03cc0"),
    ),
  ];

  const top = patterns[0];
  if (top) {
    questions.unshift(
      localize(
        language,
        `Before I go deeper: does the ${top.planets.join('-')} theme show up in real life as ${top.lifeAreas.join(', ')}?`,
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f4e4783e0c", [top.planets.join('-'), top.lifeAreas.map(area => localizeLifeArea(area, language)).join(', ')]),
        formatNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.180566eb23", [top.planets.join('-'), top.lifeAreas.map(area => localizeLifeArea(area, language)).join(', ')]),
      ),
    );
  }

  return questions;
}

function buildGuardrails(language: SupportedLanguage): string[] {
  return [
    localize(
      language,
      'Do not claim real palm-leaf manuscript access.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.bfd388ab85"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.696e65d6f4"),
    ),
    localize(
      language,
      'Explain that Nadi Predicta reads calculated planetary story patterns, not a verified manuscript record.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.5a376ee64c"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f7779dea93"),
    ),
    localize(
      language,
      'Do not mix Nadi with Parashari yoga/dasha or KP sub-lord rules inside the same answer.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.047172c4d8"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.c94db5e4ed"),
    ),
    localize(
      language,
      'Use validation questions before strong event statements.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.fbba613f0a"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.1cd586a803"),
    ),
    localize(
      language,
      'Give guidance, timing themes, and remedies without fear or guaranteed outcomes.',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.43c4af1024"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.8056809da3"),
    ),
  ];
}

function getNadiRelation(
  first: PlanetPosition,
  second: PlanetPosition,
): NadiJyotishPattern['relation'] | undefined {
  const distance = signDistance(first.sign, second.sign);
  if (distance === 0) {
    return 'same-sign';
  }
  if (distance === 4 || distance === 8) {
    return 'trine-link';
  }
  if (distance === 6) {
    return 'opposition-link';
  }
  if (distance === 1 || distance === 11) {
    return 'sequence-link';
  }
  if (first.house === second.house) {
    return 'karaka-link';
  }
  return undefined;
}

function signDistance(first: string, second: string): number {
  const firstIndex = SIGN_ORDER.indexOf(first);
  const secondIndex = SIGN_ORDER.indexOf(second);
  if (firstIndex < 0 || secondIndex < 0) {
    return -1;
  }
  return (secondIndex - firstIndex + 12) % 12;
}

function relationLabel(
  relation: NadiJyotishPattern['relation'],
  language: SupportedLanguage,
): string {
  if (relation === 'same-sign') {
    return localize(
      language,
      'same-sign conjunction-style link',
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.164f0081ca"),
      getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.7437a28f48"),
    );
  }
  if (relation === 'trine-link') {
    return localize(language, 'trinal story link', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.8b6d34b5ab"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.07f57f7d14"));
  }
  if (relation === 'opposition-link') {
    return localize(language, 'opposition story link', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.19485b7889"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.0f9aea8a84"));
  }
  if (relation === 'sequence-link') {
    return localize(language, 'sequence link', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.e12cbc0e90"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.6652e87836"));
  }
  if (relation === 'rahu-ketu-axis') {
    return localize(language, 'karmic axis', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.667b859012"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.f8bd1a881e"));
  }
  return localize(language, 'karaka link', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.5559a543b3"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.aba2d89499"));
}

function areasForPlanet(planet: string): NadiJyotishPattern['lifeAreas'] {
  if (planet === 'Venus') {
    return ['relationship', 'wealth'];
  }
  if (planet === 'Jupiter') {
    return ['spirituality', 'general'];
  }
  if (planet === 'Saturn') {
    return ['career', 'wellbeing'];
  }
  if (planet === 'Mercury') {
    return ['career', 'general'];
  }
  if (planet === 'Mars') {
    return ['wealth', 'career'];
  }
  if (planet === 'Moon') {
    return ['general', 'wellbeing'];
  }
  if (planet === 'Sun') {
    return ['general', 'career'];
  }
  if (planet === 'Rahu') {
    return ['career', 'general'];
  }
  if (planet === 'Ketu') {
    return ['spirituality', 'wellbeing'];
  }
  return ['general'];
}

function patternWeight(
  first: string,
  second: string,
  relation: NadiJyotishPattern['relation'],
): NadiJyotishPattern['weight'] {
  const pair = new Set([first, second]);
  if (pair.has('Saturn') && (pair.has('Rahu') || pair.has('Mars'))) {
    return 'challenging';
  }
  if (pair.has('Jupiter') && (pair.has('Venus') || pair.has('Moon'))) {
    return 'supportive';
  }
  if (relation === 'opposition-link' || pair.has('Rahu') || pair.has('Ketu')) {
    return 'mixed';
  }
  return 'neutral';
}

function patternRank(pattern: NadiJyotishPattern): number {
  const relationRank: Record<NadiJyotishPattern['relation'], number> = {
    'same-sign': 0,
    'rahu-ketu-axis': 1,
    'trine-link': 2,
    'opposition-link': 3,
    'sequence-link': 4,
    'karaka-link': 5,
  };
  return relationRank[pattern.relation];
}

function localize(
  language: SupportedLanguage,
  en: string,
  hi: string,
  gu: string,
): string {
  if (language === 'hi') {
    return hi;
  }

  if (language === 'gu') {
    return gu;
  }

  return en;
}

function localizeLifeArea(
  area: NadiJyotishPattern['lifeAreas'][number],
  language: SupportedLanguage,
): string {
  if (area === 'career') {
    return localize(language, 'career', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.3968c1424c"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.0de6a39828"));
  }

  if (area === 'wealth') {
    return localize(language, 'wealth', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.4a727823f0"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a0cf33e8c0"));
  }

  if (area === 'relationship') {
    return localize(language, 'relationship', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.9d4cd64169"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.a870d9ae3e"));
  }

  if (area === 'wellbeing') {
    return localize(language, 'wellbeing', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.c6ed8f708a"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.8648ceb3b0"));
  }

  if (area === 'spirituality') {
    return localize(language, 'spirituality', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.b2637a1b95"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.43589e1d94"));
  }

  return localize(language, 'general', getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.4b5c7ff538"), getNativeCopy("native.packages.astrology.src.nadiJyotishPlan.ts.20b6231dd7"));
}
