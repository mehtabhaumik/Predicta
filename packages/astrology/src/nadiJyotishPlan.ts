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
          'नाड़ी प्रेडिक्टा से पूछें',
          'નાડી પ્રેડિક્ટાને પૂછો',
        ),
        prompt: handoffQuestion
          ? `Use Nadi Predicta for this question: ${handoffQuestion}`
          : 'Use Nadi Predicta to read my strongest planetary story pattern.',
      },
      {
        id: 'nadi-validation',
        label: localize(language, 'Validate Pattern', 'पैटर्न की पुष्टि', 'પેટર્નની પુષ્ટિ'),
        prompt:
          'Ask me simple validation questions before giving a deeper Nadi reading.',
      },
      {
        id: 'nadi-premium',
        label: localize(language, 'Premium Nadi', 'प्रीमियम नाड़ी', 'પ્રીમિયમ નાડી'),
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
        'प्रेडिक्टा मूल ताड़पत्र पांडुलिपि या निजी परंपरा रिकॉर्ड तक पहुंच का दावा नहीं करती.',
        'પ્રેડિક્ટા મૂળ તાડપત્ર પાંડુલિપિ અથવા ખાનગી પરંપરા રેકોર્ડ સુધી પહોંચવાનો દાવો કરતી નથી.',
      ),
      localize(
        language,
        'This reading is a Nadi-inspired chart-signature layer, not Parashari yoga/dasha analysis and not KP sub-lord judgement.',
        'यह वाचन नाड़ी-प्रेरित चार्ट-सिग्नेचर स्तर है, पराशरी योग/दशा विश्लेषण नहीं और न ही कृष्णमूर्ति सब-लॉर्ड निर्णय.',
        'આ વાંચન નાડી-પ્રેરિત ચાર્ટ-સિગ્નેચર સ્તર છે, પરાશરી યોગ/દશા વિશ્લેષણ નહીં અને કૃષ્ણમૂર્તિ સબ-લોર્ડ નિર્ણય પણ નહીં.',
      ),
      localize(
        language,
        'Nadi-style patterns need validation from the user before deeper event timing is presented.',
        'गहरी घटना-समय बातों से पहले नाड़ी शैली के पैटर्न को उपयोगकर्ता पुष्टि चाहिए.',
        'ઊંડી ઘટના-સમયની વાત પહેલાં નાડી શૈલીના પેટર્નને વપરાશકર્તાની પુષ્ટિ જોઈએ.',
      ),
      localize(
        language,
        'No Nadi answer should promise fixed events, death timing, medical certainty, legal certainty, or financial certainty.',
        'कोई भी नाड़ी उत्तर तय घटनाएं, मृत्यु समय, चिकित्सीय निश्चितता, कानूनी निश्चितता या आर्थिक निश्चितता का वादा नहीं करेगा.',
        'કોઈ પણ નાડી જવાબ નક્કી ઘટનાઓ, મૃત્યુ સમય, તબીબી નિશ્ચિતતા, કાનૂની નિશ્ચિતતા અથવા આર્થિક નિશ્ચિતતાનું વચન નહીં આપે.',
      ),
    ],
    methodSummary: localize(
      language,
      'Predicta Nadi reads planet-to-planet stories: conjunction-style links, trinal links, opposition links, karaka themes, Rahu/Ketu karmic axis, and slow-transit activation. It stays separate from Parashari and KP.',
      'प्रेडिक्टा नाड़ी ग्रह-से-ग्रह कथाएं पढ़ती है: संयोजन शैली के संबंध, त्रिकोण संबंध, विपरीत संबंध, कारक विषय, राहु/केतु कर्म अक्ष और धीमे गोचर की सक्रियता. यह पराशरी और कृष्णमूर्ति पद्धति से अलग रहती है.',
      'પ્રેડિક્ટા નાડી ગ્રહથી ગ્રહ વાર્તાઓ વાંચે છે: સંયોગ શૈલીના સંબંધ, ત્રિકોણ સંબંધ, વિરોધ સંબંધ, કારક વિષયો, રાહુ/કેતુ કર્મ અક્ષ અને ધીમા ગોચરની સક્રિયતા. તે પરાશરી અને કૃષ્ણમૂર્તિ પદ્ધતિથી અલગ રહે છે.',
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
      'प्रीमियम नाड़ी पूर्ण चार्ट-सिग्नेचर वाचन, पुष्टि प्रश्न, कर्म कथा क्रम, गोचर सक्रियता समय, उपाय और अलग नाड़ी रिपोर्ट खोलती है, बिना पराशरी या कृष्णमूर्ति पद्धति मिलाए.',
      'પ્રીમિયમ નાડી સંપૂર્ણ ચાર્ટ-સિગ્નેચર વાંચન, પુષ્ટિ પ્રશ્નો, કર્મકથા ક્રમ, ગોચર સક્રિયતા સમય, ઉપાયો અને અલગ નાડી રિપોર્ટ ખોલે છે, પરાશરી અથવા કૃષ્ણમૂર્તિ પદ્ધતિ મિક્સ કર્યા વગર.',
    ),
    schoolBoundary: localize(
      language,
      'Regular Predicta reads Parashari. KP Predicta reads KP. Nadi Predicta reads Nadi-style planetary stories and validation patterns only.',
      'सामान्य प्रेडिक्टा पराशरी पढ़ती है. कृष्णमूर्ति प्रेडिक्टा कृष्णमूर्ति पद्धति पढ़ती है. नाड़ी प्रेडिक्टा केवल नाड़ी शैली की ग्रह-कथा और पुष्टि पैटर्न पढ़ती है.',
      'સામાન્ય પ્રેડિક્ટા પરાશરી વાંચે છે. કૃષ્ણમૂર્તિ પ્રેડિક્ટા કૃષ્ણમૂર્તિ પદ્ધતિ વાંચે છે. નાડી પ્રેડિક્ટા માત્ર નાડી શૈલીની ગ્રહકથા અને પુષ્ટિ પેટર્ન વાંચે છે.',
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
            'चार्ट-सिग्नेचर गहराई वाला अलग प्रीमियम नाड़ी रीडिंग रूम.',
            'ચાર્ટ-સિગ્નેચર ઊંડાઈ ધરાવતું અલગ પ્રીમિયમ નાડી રીડિંગ રૂમ.',
          )
        : localize(
            language,
            'A separate Nadi reading room. Free gives a useful method summary; Premium unlocks depth.',
            'अलग नाड़ी रीडिंग रूम. फ्री में उपयोगी विधि-सार मिलता है; प्रीमियम गहराई खोलता है.',
            'અલગ નાડી રીડિંગ રૂમ. ફ્રીમાં ઉપયોગી પદ્ધતિ-સાર મળે છે; પ્રીમિયમ ઊંડાઈ ખોલે છે.',
          ),
    title: localize(
      language,
      `${kundli.birthDetails.name}'s Nadi Predicta plan`,
      `${kundli.birthDetails.name} की नाड़ी प्रेडिक्टा योजना`,
      `${kundli.birthDetails.name}ની નાડી પ્રેડિક્ટા યોજના`,
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
        label: localize(language, 'Create Kundli', 'कुंडली बनाएं', 'કુંડળી બનાવો'),
        prompt:
          'Create my Kundli first, then keep my question ready for Nadi Predicta.',
      },
    ],
    depth,
    freePreview: localize(
      language,
      'Nadi Predicta needs a calculated birth profile before it can read planetary story links.',
      'नाड़ी प्रेडिक्टा को ग्रह-कथा संबंध पढ़ने से पहले गणना किया गया जन्म प्रोफाइल चाहिए.',
      'નાડી પ્રેડિક્ટાને ગ્રહકથા સંબંધ વાંચવા પહેલાં ગણતરી કરેલું જન્મ પ્રોફાઇલ જોઈએ.',
    ),
    guardrails: buildGuardrails(language),
    handoffQuestion,
    limitations: [
      localize(
        language,
        'Create a Kundli first so Nadi Predicta has verified birth details.',
        'पहले कुंडली बनाइए ताकि नाड़ी प्रेडिक्टा के पास सत्यापित जन्म विवरण हों.',
        'પહેલા કુંડળી બનાવો જેથી નાડી પ્રેડિક્ટા પાસે ચકાસેલ જન્મ વિગતો હોય.',
      ),
    ],
    methodSummary: localize(
      language,
      'Nadi Predicta will read Nadi-style planetary stories after the birth profile is ready.',
      'जन्म प्रोफाइल तैयार होने के बाद नाड़ी प्रेडिक्टा नाड़ी शैली की ग्रह-कथाएं पढ़ेगी.',
      'જન્મ પ્રોફાઇલ તૈયાર થયા પછી નાડી પ્રેડિક્ટા નાડી શૈલીની ગ્રહકથાઓ વાંચશે.',
    ),
    ownerName: 'You',
    patterns: [],
    premiumOnly: true,
    premiumUnlock: localize(
      language,
      'Premium Nadi unlocks a separate reading room with planetary story links, validation questions, timing activation, and remedies.',
      'प्रीमियम नाड़ी ग्रह-कथा संबंध, पुष्टि प्रश्न, समय सक्रियता और उपायों वाला अलग रीडिंग रूम खोलती है.',
      'પ્રીમિયમ નાડી ગ્રહકથા સંબંધ, પુષ્ટિ પ્રશ્નો, સમય સક્રિયતા અને ઉપાયો ધરાવતો અલગ રીડિંગ રૂમ ખોલે છે.',
    ),
    schoolBoundary: localize(
      language,
      'Nadi Predicta is separate from Regular Parashari Predicta and KP Predicta.',
      'नाड़ी प्रेडिक्टा सामान्य पराशरी प्रेडिक्टा और कृष्णमूर्ति प्रेडिक्टा से अलग है.',
      'નાડી પ્રેડિક્ટા સામાન્ય પરાશરી પ્રેડિક્ટા અને કૃષ્ણમૂર્તિ પ્રેડિક્ટાથી અલગ છે.',
    ),
    status: 'pending',
    storyLens: buildPendingNadiStoryLens(language),
    rahuKetuAxis: {
      balancePractice: localize(language, 'Create the Kundli first.', 'पहले कुंडली बनाएं.', 'પહેલાં કુંડળી બનાવો.'),
      becomesLouder: localize(language, 'Pending until planetary links exist.', 'ग्रह संबंध आने तक लंबित.', 'ગ્રહ સંબંધ આવે ત્યાં સુધી બાકી.'),
      learningToRelease: localize(language, 'Pending until Ketu evidence exists.', 'केतु प्रमाण आने तक लंबित.', 'કેતુ પુરાવો આવે ત્યાં સુધી બાકી.'),
      pullsForward: localize(language, 'Pending until Rahu evidence exists.', 'राहु प्रमाण आने तक लंबित.', 'રાહુ પુરાવો આવે ત્યાં સુધી બાકી.'),
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
      'प्रीमियम नाड़ी रीडिंग रूम शुरू करने के लिए अपनी कुंडली बनाइए.',
      'પ્રીમિયમ નાડી રીડિંગ રૂમ શરૂ કરવા માટે તમારી કુંડળી બનાવો.',
    ),
    title: localize(
      language,
      'Nadi Predicta plan',
      'नाड़ी प्रेडिक्टा योजना',
      'નાડી પ્રેડિક્ટા યોજના',
    ),
    validationQuestions: [
      localize(
        language,
        'Please share or create your birth profile first.',
        'कृपया पहले अपना जन्म प्रोफाइल साझा करें या बनाएं.',
        'કૃપા કરીને પહેલા તમારું જન્મ પ્રોફાઇલ શેર કરો અથવા બનાવો.',
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
          `राहु ${getLocalizedSignName(rahu.sign, language)} में, भाव ${rahu.house} में है.`,
          `રાહુ ${getLocalizedSignName(rahu.sign, language)}માં, ભાવ ${rahu.house}માં છે.`,
        ),
        localize(
          language,
          `Ketu is in ${getLocalizedSignName(ketu.sign, language)}, house ${ketu.house}.`,
          `केतु ${getLocalizedSignName(ketu.sign, language)} में, भाव ${ketu.house} में है.`,
          `કેતુ ${getLocalizedSignName(ketu.sign, language)}માં, ભાવ ${ketu.house}માં છે.`,
        ),
      ],
      freeInsight: localize(
        language,
        'Rahu and Ketu show where life pulls you forward and where it asks for release.',
        'राहु और केतु बताते हैं कि जीवन आपको कहां आगे खींचता है और कहां छोड़ना सिखाता है.',
        'રાહુ અને કેતુ બતાવે છે કે જીવન તમને ક્યાં આગળ ખેંચે છે અને ક્યાં છોડવું શીખવે છે.',
      ),
      id: 'nadi-rahu-ketu-axis',
      lifeAreas: ['general', 'spirituality'],
      meaning: `Rahu pulls toward ${HOUSE_MEANINGS[rahu.house]}; Ketu asks maturity around ${HOUSE_MEANINGS[ketu.house]}.`,
      observation: localize(
        language,
        `Rahu/Ketu axis runs through houses ${rahu.house}/${ketu.house}.`,
        `राहु/केतु अक्ष भाव ${rahu.house}/${ketu.house} से गुजरता है.`,
        `રાહુ/કેતુ અક્ષ ભાવ ${rahu.house}/${ketu.house}માંથી પસાર થાય છે.`,
      ),
      planets: ['Rahu', 'Ketu'],
      premiumDetail: localize(
        language,
        'Premium Nadi reads this as a karmic axis: appetite, unfinished desire, detachment, and the transit periods that awaken this story.',
        'प्रीमियम नाड़ी इसे कर्म अक्ष की तरह पढ़ती है: इच्छा, अधूरी चाह, विरक्ति और वे गोचर समय जो इस कथा को जगाते हैं.',
        'પ્રીમિયમ નાડી તેને કર્મ અક્ષ તરીકે વાંચે છે: ઇચ્છા, અધૂરી કામના, વિરક્તિ અને તે ગોચર સમય જે આ વાર્તાને જગાડે છે.',
      ),
      relation: 'rahu-ketu-axis',
      title: localize(
        language,
        'Rahu-Ketu karmic axis',
        'राहु-केतु कर्म अक्ष',
        'રાહુ-કેતુ કર્મ અક્ષ',
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
        `${firstName}: ${firstSign}, भाव ${first.house}, ${first.nakshatra}.`,
        `${firstName}: ${firstSign}, ભાવ ${first.house}, ${first.nakshatra}.`,
      ),
      localize(
        language,
        `${secondName}: ${secondSign}, house ${second.house}, ${second.nakshatra}.`,
        `${secondName}: ${secondSign}, भाव ${second.house}, ${second.nakshatra}.`,
        `${secondName}: ${secondSign}, ભાવ ${second.house}, ${second.nakshatra}.`,
      ),
      localize(
        language,
        `${relationText} links their karakas.`,
        `${relationText} उनके कारक विषयों को जोड़ता है.`,
        `${relationText} તેમના કારક વિષયોને જોડે છે.`,
      ),
    ],
    freeInsight: localize(
      language,
      `${firstName} and ${secondName} are linked by ${relationText}, so this pattern keeps repeating through ${lifeAreaText}. In plain Nadi language, one life topic keeps waking up another instead of staying isolated.`,
      `${firstName} और ${secondName} ${relationText} से जुड़े हैं, इसलिए यह पैटर्न ${lifeAreaText} के माध्यम से बार-बार दोहराता है. सरल नाड़ी भाषा में, जीवन का एक विषय दूसरे विषय को बार-बार जगाता है.`,
      `${firstName} અને ${secondName} ${relationText}થી જોડાયેલા છે, તેથી આ પેટર્ન ${lifeAreaText} દ્વારા વારંવાર ફરી ઊઠે છે. સરળ નાડી ભાષામાં, જીવનનો એક વિષય બીજાને વારંવાર જગાડે છે.`,
    ),
    id: `nadi-${first.name.toLowerCase()}-${second.name.toLowerCase()}-${relation}`,
    lifeAreas,
    meaning: localize(
      language,
      `${firstName} carries ${PLANET_KARAKAS[first.name]}; ${secondName} carries ${PLANET_KARAKAS[second.name]}. Their link connects ${HOUSE_MEANINGS[first.house]} with ${HOUSE_MEANINGS[second.house]}, so the story tends to repeat through ${lifeAreaText}.`,
      `${firstName} ${PLANET_KARAKAS[first.name]} का विषय लाता है; ${secondName} ${PLANET_KARAKAS[second.name]} का. इनका संबंध ${HOUSE_MEANINGS[first.house]} को ${HOUSE_MEANINGS[second.house]} से जोड़ता है, इसलिए कथा ${lifeAreaText} के माध्यम से दोहराती है.`,
      `${firstName} ${PLANET_KARAKAS[first.name]}નો વિષય લાવે છે; ${secondName} ${PLANET_KARAKAS[second.name]}નો. તેમનો સંબંધ ${HOUSE_MEANINGS[first.house]}ને ${HOUSE_MEANINGS[second.house]} સાથે જોડે છે, તેથી વાર્તા ${lifeAreaText} દ્વારા ફરી આવે છે.`,
    ),
    observation: localize(
      language,
      `${firstName} in ${firstSign} house ${first.house} has a ${relationText} with ${secondName} in ${secondSign} house ${second.house}.`,
      `${firstSign} के भाव ${first.house} में ${firstName} का ${secondSign} के भाव ${second.house} में ${secondName} के साथ ${relationText} है.`,
      `${firstSign}ના ભાવ ${first.house}માં ${firstName}નો ${secondSign}ના ભાવ ${second.house}માં ${secondName} સાથે ${relationText} છે.`,
    ),
    planets: [first.name, second.name],
    premiumDetail: localize(
      language,
      `Premium Nadi reads this as a story chain: ${firstName} theme -> ${secondName} theme, then checks maturity age, slow-transit activation, repeated life evidence, and validation questions before giving event-level guidance.`,
      `प्रीमियम नाड़ी इसे कथा-श्रृंखला की तरह पढ़ती है: ${firstName} विषय -> ${secondName} विषय, फिर परिपक्वता उम्र, धीमे गोचर की सक्रियता, दोहराते जीवन-प्रमाण और पुष्टि प्रश्न देखकर ही घटना-स्तर मार्गदर्शन देती है.`,
      `પ્રીમિયમ નાડી તેને વાર્તા-શૃંખલા તરીકે વાંચે છે: ${firstName} વિષય -> ${secondName} વિષય, પછી પરિપક્વતા ઉંમર, ધીમા ગોચરની સક્રિયતા, પુનરાવર્તિત જીવન-પ્રમાણ અને પુષ્ટિ પ્રશ્નો જોઈને જ ઘટના-સ્તર માર્ગદર્શન આપે છે.`,
    ),
    relation,
    title: localize(
      language,
      `${firstName}-${secondName} story link`,
      `${firstName}-${secondName} कथा संबंध`,
      `${firstName}-${secondName} કથા સંબંધ`,
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
        'इसे सक्रिय कथा मानें, फिर गहराई में जाने से पहले वास्तविक जीवन घटनाओं से पुष्टि करें.',
        'આને સક્રિય વાર્તા માનો, પછી ઊંડે જવા પહેલાં વાસ્તવિક જીવનની ઘટનાઓથી પુષ્ટિ કરો.',
      ),
      id: 'nadi-dasha-activation',
      observation: localize(
        language,
        `${current.mahadasha}/${current.antardasha} touches ${dashaPattern.planets.join(' and ')}.`,
        `${current.mahadasha}/${current.antardasha} ${dashaPattern.planets.join(' और ')} को छूता है.`,
        `${current.mahadasha}/${current.antardasha} ${dashaPattern.planets.join(' અને ')}ને સ્પર્શે છે.`,
      ),
      premiumDetail: localize(
        language,
        'Premium connects this active story to sub-period timing, repeated life themes, and practical remedy discipline.',
        'प्रीमियम इस सक्रिय कथा को उप-काल समय, दोहराते जीवन-विषय और व्यावहारिक उपाय अनुशासन से जोड़ती है.',
        'પ્રીમિયમ આ સક્રિય વાર્તાને ઉપ-કાળ સમય, પુનરાવર્તિત જીવન-વિષયો અને વ્યવહારૂ ઉપાય શિસ્ત સાથે જોડે છે.',
      ),
      timing: `${current.startDate} to ${current.endDate}`,
      title: localize(
        language,
        'Current timing touches a Nadi story',
        'वर्तमान समय एक नाड़ी कथा को छू रहा है',
        'વર્તમાન સમય નાડી વાર્તાને સ્પર્શે છે',
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
              'इस समय का उपयोग स्थिर प्रगति के लिए करें, बिना परिणामों का अधिक वादा किए.',
              'આ સમયનો ઉપયોગ સ્થિર પ્રગતિ માટે કરો, પરિણામોનું વધારે વચન આપ્યા વગર.',
            )
          : localize(
              language,
              'Move slowly, validate facts, and avoid fear-based conclusions.',
              'धीरे चलें, तथ्यों की पुष्टि करें और डर-आधारित निष्कर्षों से बचें.',
              'ધીમે ચાલો, તથ્યોની પુષ્ટિ કરો અને ભય આધારિત નિષ્કર્ષોથી બચો.',
            ),
      id: `nadi-transit-${transit.planet.toLowerCase()}`,
      observation: linkedPattern
        ? localize(
            language,
            `${getLocalizedPlanetName(transit.planet, language)} is moving through ${getLocalizedSignName(transit.sign, language)}, touching a sign used by ${linkedPattern.title}.`,
            `${getLocalizedPlanetName(transit.planet, language)} ${getLocalizedSignName(transit.sign, language)} से गुजर रहा है और ${linkedPattern.title} में उपयोग हुई राशि को छू रहा है.`,
            `${getLocalizedPlanetName(transit.planet, language)} ${getLocalizedSignName(transit.sign, language)}માંથી પસાર થઈ રહ્યો છે અને ${linkedPattern.title}માં આવેલી રાશિને સ્પર્શે છે.`,
          )
        : localize(
            language,
            `${getLocalizedPlanetName(transit.planet, language)} is moving through ${getLocalizedSignName(transit.sign, language)}, house ${transit.houseFromLagna} from Lagna.`,
            `${getLocalizedPlanetName(transit.planet, language)} ${getLocalizedSignName(transit.sign, language)} से गुजर रहा है, लग्न से भाव ${transit.houseFromLagna}.`,
            `${getLocalizedPlanetName(transit.planet, language)} ${getLocalizedSignName(transit.sign, language)}માંથી પસાર થઈ રહ્યો છે, લગ્નથી ભાવ ${transit.houseFromLagna}.`,
          ),
      premiumDetail: localize(
        language,
        'Premium checks whether this slow transit repeats a natal planet story and whether the user has already seen similar events.',
        'प्रीमियम देखती है कि यह धीमा गोचर जन्मकुंडली की उसी ग्रह-कथा को दोहराता है या नहीं और क्या उपयोगकर्ता ने ऐसे ही अनुभव पहले देखे हैं.',
        'પ્રીમિયમ તપાસે છે કે આ ધીમો ગોચર જન્મકુંડળીની એ જ ગ્રહકથાને ફરી જગાડે છે કે નહીં અને વપરાશકર્તાએ આવા અનુભવ પહેલેથી જોયા છે કે નહીં.',
      ),
      timing: transit.calculatedAt,
      title: localize(
        language,
        `${getLocalizedPlanetName(transit.planet, language)} activation`,
        `${getLocalizedPlanetName(transit.planet, language)} सक्रियता`,
        `${getLocalizedPlanetName(transit.planet, language)} સક્રિયતા`,
      ),
      trigger: `${getLocalizedPlanetName(transit.planet, language)} ${localize(language, 'in', 'में', 'માં')} ${getLocalizedSignName(transit.sign, language)}`,
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
  const planetText = top?.planets.join('-') ?? localize(language, 'planet story', 'ग्रह कथा', 'ગ્રહકથા');

  if (!top) {
    return {
      activationSummary: localize(
        language,
        'Activation will become clearer after the first planetary story link is available.',
        'पहला ग्रह-कथा संबंध मिलने के बाद सक्रियता अधिक स्पष्ट होगी.',
        'પહેલો ગ્રહકથા સંબંધ મળ્યા પછી સક્રિયતા વધુ સ્પષ્ટ થશે.',
      ),
      activeLesson: localize(
        language,
        'The active lesson is pending until Predicta can identify the strongest story link.',
        'सबसे मजबूत कथा संबंध दिखने तक सक्रिय पाठ प्रतीक्षारत है.',
        'સૌથી મજબૂત કથા સંબંધ દેખાય ત્યાં સુધી સક્રિય પાઠ બાકી છે.',
      ),
      evidencePath: [
        localize(language, 'Calculated birth profile is required.', 'गणना किया गया जन्म प्रोफाइल चाहिए.', 'ગણતરી કરેલું જન્મ પ્રોફાઇલ જોઈએ.'),
      ],
      hiddenPatternSentence: localize(
        language,
        `${kundli.birthDetails.name}'s Nadi story is waiting for enough planetary-link evidence before Predicta names a pattern.`,
        `${kundli.birthDetails.name} की नाड़ी कथा पैटर्न नाम देने से पहले पर्याप्त ग्रह-संबंध प्रमाण की प्रतीक्षा कर रही है.`,
        `${kundli.birthDetails.name}ની નાડી કથા પેટર્નનું નામ આપતાં પહેલાં પૂરતા ગ્રહ-સંબંધ પુરાવાની રાહ જોઈ રહી છે.`,
      ),
      repeatingPattern: localize(
        language,
        'No repeating pattern is strong enough to name yet.',
        'अभी कोई दोहराता पैटर्न नाम देने जितना मजबूत नहीं है.',
        'હજુ કોઈ દોહરાતું પેટર્ન નામ આપવા જેટલું મજબૂત નથી.',
      ),
      shiftThatHelps: localize(
        language,
        'Validate real-life themes first, then go deeper.',
        'पहले वास्तविक जीवन के विषयों की पुष्टि करें, फिर गहराई में जाएं.',
        'પહેલા વાસ્તવિક જીવનના વિષયો પુષ્ટિ કરો, પછી ઊંડે જાઓ.',
      ),
      strongestThread: localize(language, 'Pending story thread', 'प्रतीक्षारत कथा', 'બાકી કથા'),
      stuckPoint: localize(
        language,
        'The risk is filling missing evidence with spiritual-sounding certainty.',
        'जोखिम यह है कि अधूरे प्रमाण को आध्यात्मिक निश्चितता से भर दिया जाए.',
        'જોખમ એ છે કે અધૂરા પુરાવાને આધ્યાત્મિક નિશ્ચિતતાથી ભરી દેવામાં આવે.',
      ),
      validationBridge: localize(
        language,
        'Predicta should ask validation questions before making event-level statements.',
        'घटना-स्तर कथन से पहले प्रेडिक्टा को पुष्टि प्रश्न पूछने चाहिए.',
        'ઘટના-સ્તરના નિવેદન પહેલાં પ્રેડિક્ટાએ પુષ્ટિ પ્રશ્નો પૂછવા જોઈએ.',
      ),
    };
  }

  return {
    activationSummary: activation
      ? `${activation.title}: ${activation.guidance}`
      : localize(
          language,
          'No timing activation should be overstated yet.',
          'अभी समय सक्रियता को बढ़ा-चढ़ाकर नहीं कहना चाहिए.',
          'હજુ સમય સક્રિયતાને વધારીને કહેવી નહીં.',
        ),
    activeLesson: localize(
      language,
      `The active lesson is to notice how ${planetText} keeps linking ${areaText || 'life areas'} instead of treating each event as isolated.`,
      `सक्रिय पाठ यह देखना है कि ${planetText} कैसे ${areaText || 'जीवन क्षेत्रों'} को जोड़ता रहता है, हर घटना को अलग मानने की जगह.`,
      `સક્રિય પાઠ એ જોવાનો છે કે ${planetText} કેવી રીતે ${areaText || 'જીવન ક્ષેત્રો'}ને જોડતું રહે છે, દરેક ઘટનાને અલગ માનવાના બદલે.`,
    ),
    evidencePath: [
      top.observation,
      ...top.evidence.slice(0, 2),
      activation ? activation.observation : '',
    ].filter(Boolean),
    hiddenPatternSentence: localize(
      language,
      `${kundli.birthDetails.name}'s chart keeps turning ${planetText} into a repeating story through ${areaText || 'linked life areas'}; the shift is validation, patience, and conscious response rather than fixed fate.`,
      `${kundli.birthDetails.name} की कुंडली ${planetText} को ${areaText || 'जुड़े जीवन क्षेत्रों'} में दोहराती कथा बना रही है; बदलाव पुष्टि, धैर्य और सचेत प्रतिक्रिया है, तय भाग्य नहीं.`,
      `${kundli.birthDetails.name}ની કુંડળી ${planetText}ને ${areaText || 'જોડાયેલા જીવન ક્ષેત્રો'}માં દોહરાતી કથા બનાવે છે; ફેરફાર પુષ્ટિ, ધીરજ અને સજાગ પ્રતિભાવ છે, નક્કી ભાગ્ય નહીં.`,
    ),
    repeatingPattern: top.meaning,
    shiftThatHelps: localize(
      language,
      `The helpful shift is to name the ${top.relation.replaceAll('-', ' ')} pattern, validate it in real life, and respond differently when it repeats.`,
      `मददगार बदलाव ${top.relation.replaceAll('-', ' ')} पैटर्न को नाम देना, जीवन में पुष्टि करना और दोहराने पर अलग प्रतिक्रिया देना है.`,
      `મદદરૂપ ફેરફાર ${top.relation.replaceAll('-', ' ')} પેટર્નને નામ આપવું, જીવનમાં પુષ્ટિ કરવી અને ફરી આવે ત્યારે અલગ પ્રતિભાવ આપવો છે.`,
    ),
    strongestThread: top.title,
    stuckPoint: localize(
      language,
      `The stuck point is repeating ${areaText || 'the same linked life theme'} without realizing the same story is being activated again.`,
      `अटकाव ${areaText || 'उसी जुड़े जीवन-विषय'} को दोहराना है, बिना समझे कि वही कथा फिर सक्रिय हो रही है.`,
      `અટકાવ ${areaText || 'એ જ જોડાયેલા જીવન વિષય'}ને દોહરાવવો છે, એ સમજ્યા વગર કે એ જ કથા ફરી સક્રિય થઈ રહી છે.`,
    ),
    validationBridge: localize(
      language,
      `Before going deeper, confirm whether ${planetText} actually shows up in ${areaText || 'these life areas'} in real life.`,
      `गहराई में जाने से पहले पुष्टि करें कि ${planetText} वास्तविक जीवन में ${areaText || 'इन जीवन क्षेत्रों'} में सचमुच दिखता है या नहीं.`,
      `ઊંડે જવા પહેલાં પુષ્ટિ કરો કે ${planetText} વાસ્તવિક જીવનમાં ${areaText || 'આ જીવન ક્ષેત્રો'}માં ખરેખર દેખાય છે કે નહીં.`,
    ),
  };
}

function buildPendingNadiStoryLens(language: SupportedLanguage): NadiChartStoryLens {
  return {
    activationSummary: localize(language, 'Pending timing activation.', 'समय सक्रियता प्रतीक्षारत.', 'સમય સક્રિયતા બાકી.'),
    activeLesson: localize(language, 'Create the Kundli first.', 'पहले कुंडली बनाएं.', 'પહેલા કુંડળી બનાવો.'),
    evidencePath: [
      localize(language, 'No calculated Nadi chart evidence yet.', 'अभी गणना किया गया नाड़ी चार्ट प्रमाण नहीं है.', 'હજુ ગણતરી કરેલો નાડી ચાર્ટ પુરાવો નથી.'),
    ],
    hiddenPatternSentence: localize(
      language,
      'Predicta will name the Nadi story only after calculated chart evidence exists.',
      'गणना किए गए चार्ट प्रमाण के बाद ही प्रेडिक्टा नाड़ी कथा का नाम देगी.',
      'ગણતરી કરેલા ચાર્ટ પુરાવા પછી જ પ્રેડિક્ટા નાડી કથાનું નામ આપશે.',
    ),
    repeatingPattern: localize(language, 'Pending.', 'प्रतीक्षारत.', 'બાકી.'),
    shiftThatHelps: localize(language, 'Create or select a Kundli.', 'कुंडली बनाएं या चुनें.', 'કુંડળી બનાવો અથવા પસંદ કરો.'),
    strongestThread: localize(language, 'Pending story thread', 'प्रतीक्षारत कथा', 'બાકી કથા'),
    stuckPoint: localize(language, 'No interpretation before evidence.', 'प्रमाण से पहले व्याख्या नहीं.', 'પુરાવા પહેલાં અર્થઘટન નહીં.'),
    validationBridge: localize(language, 'Validation comes after the first story thread.', 'पहले कथा संबंध के बाद पुष्टि होगी.', 'પહેલા કથા સંબંધ પછી પુષ્ટિ થશે.'),
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
      'खींचाव के पीछे भागने से पहले ठहरें; पुराने छोड़ने वाले पैटर्न को नाम दें, फिर एक स्थिर कर्म चुनें.',
      'ખેંચાણ પાછળ દોડતા પહેલાં થોભો; જૂના છોડવાના પેટર્નને નામ આપો, પછી એક સ્થિર ક્રિયા પસંદ કરો.',
    ),
    becomesLouder: activation
      ? `${activation.title}: ${activation.timing}`
      : localize(
          language,
          'This axis becomes louder when dasha or slow-transit activation touches the same story.',
          'दशा या धीमा गोचर इसी कथा को छूता है तो यह अक्ष अधिक तेज महसूस होता है.',
          'દશા અથવા ધીમો ગોચર એ જ કથાને સ્પર્શે ત્યારે આ અક્ષ વધુ તેજ લાગે છે.',
        ),
    learningToRelease: ketu
      ? localize(
          language,
          `Ketu in ${getLocalizedSignName(ketu.sign, language)} points to releasing old reflexes around ${HOUSE_MEANINGS[ketu.house]}.`,
          `${getLocalizedSignName(ketu.sign, language)} में केतु ${HOUSE_MEANINGS[ketu.house]} से जुड़े पुराने स्वभाव छोड़ने की सीख देता है.`,
          `${getLocalizedSignName(ketu.sign, language)}માં કેતુ ${HOUSE_MEANINGS[ketu.house]} જોડાયેલી જૂની પ્રતિક્રિયા છોડવાનું શીખવે છે.`,
        )
      : localize(language, 'Ketu release point is pending.', 'केतु छोड़ने का बिंदु लंबित है.', 'કેતુ છોડવાનો બિંદુ બાકી છે.'),
    pullsForward: rahu
      ? localize(
          language,
          `Rahu in ${getLocalizedSignName(rahu.sign, language)} pulls attention toward ${HOUSE_MEANINGS[rahu.house]}.`,
          `${getLocalizedSignName(rahu.sign, language)} में राहु ध्यान को ${HOUSE_MEANINGS[rahu.house]} की ओर खींचता है.`,
          `${getLocalizedSignName(rahu.sign, language)}માં રાહુ ધ્યાનને ${HOUSE_MEANINGS[rahu.house]} તરફ ખેંચે છે.`,
        )
      : axisPattern?.meaning ?? localize(language, 'Rahu pull point is pending.', 'राहु खिंचाव बिंदु लंबित है.', 'રાહુ ખેંચાણ બિંદુ બાકી છે.'),
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
      `${kundli.birthDetails.name} का नाड़ी स्थान तैयार है. सहेजे गए जन्म प्रोफाइल से ग्रह-कथा विवरण मिलते ही प्रेडिक्टा पहला प्रीव्यू तैयार करेगी.`,
      `${kundli.birthDetails.name}નું નાડી સ્થળ તૈયાર છે. સચવાયેલા જન્મ પ્રોફાઇલથી ગ્રહકથા વિગતો મળતા જ પ્રેડિક્ટા પહેલું પ્રિવ્યૂ તૈયાર કરશે.`,
    );
  }
  return localize(
    language,
    `Nadi preview: ${top.title} is the strongest story right now. ${top.meaning}`,
    `नाड़ी प्रीव्यू: ${top.title} अभी सबसे मजबूत कथा है. ${top.meaning}`,
    `નાડી પ્રિવ્યૂ: ${top.title} અત્યારે સૌથી મજબૂત વાર્તા છે. ${top.meaning}`,
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
    `${kundli.birthDetails.name} का प्रीमियम नाड़ी वाचन ${patternText || 'ग्रह-कथा संबंध'} को क्रम में रखेगा, ${activationText || 'वर्तमान समय'} से सक्रियता देखेगा और फिर बिना तय भाग्य का दिखावा किए उसे जीवन-मार्गदर्शन में बदलेगा.`,
    `${kundli.birthDetails.name}નું પ્રીમિયમ નાડી વાંચન ${patternText || 'ગ્રહકથા સંબંધ'}ને ક્રમમાં રાખશે, ${activationText || 'વર્તમાન સમય'}થી સક્રિયતા તપાસશે અને પછી નક્કી ભાગ્યનો દાવો કર્યા વગર તેને જીવન માર્ગદર્શનમાં ફેરવશે.`,
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
      `क्या ${kundli.birthDetails.name} पहले व्यावहारिक जिम्मेदारी से अधिक जुड़ते हैं, या पहले भावनात्मक बेचैनी से?`,
      `શું ${kundli.birthDetails.name} પહેલા વ્યવહારૂ જવાબદારી સાથે વધુ જોડાય છે, કે પહેલા ભાવનાત્મક બેચેની સાથે?`,
    ),
    localize(
      language,
      'Has the same life issue repeated in cycles rather than one isolated event?',
      'क्या वही जीवन-विषय एक अकेली घटना की जगह चक्रों में दोहराया है?',
      'શું એ જ જીવનવિષય એક જ ઘટનાની બદલે ચક્રોમાં ફરી આવ્યો છે?',
    ),
    localize(
      language,
      'Is the current question about an event, a relationship pattern, money/career movement, or spiritual direction?',
      'क्या वर्तमान प्रश्न किसी घटना, संबंध पैटर्न, धन/करियर गति या आध्यात्मिक दिशा के बारे में है?',
      'શું વર્તમાન પ્રશ્ન કોઈ ઘટના, સંબંધ પેટર્ન, ધન/કારકિર્દી ગતિ કે આધ્યાત્મિક દિશા વિશે છે?',
    ),
  ];

  const top = patterns[0];
  if (top) {
    questions.unshift(
      localize(
        language,
        `Before I go deeper: does the ${top.planets.join('-')} theme show up in real life as ${top.lifeAreas.join(', ')}?`,
        `गहराई में जाने से पहले: क्या ${top.planets.join('-')} का विषय वास्तविक जीवन में ${top.lifeAreas.map(area => localizeLifeArea(area, language)).join(', ')} की तरह दिखता है?`,
        `ઊંડે જવા પહેલાં: શું ${top.planets.join('-')}નો વિષય વાસ્તવિક જીવનમાં ${top.lifeAreas.map(area => localizeLifeArea(area, language)).join(', ')} તરીકે દેખાય છે?`,
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
      'वास्तविक ताड़पत्र पांडुलिपि तक पहुंच का दावा न करें.',
      'વાસ્તવિક તાડપત્ર પાંડુલિપિ સુધી પહોંચવાનો દાવો ન કરો.',
    ),
    localize(
      language,
      'Explain that Nadi Predicta reads calculated planetary story patterns, not a verified manuscript record.',
      'स्पष्ट करें कि नाड़ी प्रेडिक्टा गणना किए गए ग्रह-कथा पैटर्न पढ़ती है, सत्यापित पांडुलिपि रिकॉर्ड नहीं.',
      'સ્પષ્ટ કરો કે નાડી પ્રેડિક્ટા ગણતરી કરેલા ગ્રહકથા પેટર્ન વાંચે છે, ચકાસેલ પાંડુલિપિ રેકોર્ડ નહીં.',
    ),
    localize(
      language,
      'Do not mix Nadi with Parashari yoga/dasha or KP sub-lord rules inside the same answer.',
      'एक ही उत्तर में नाड़ी को पराशरी योग/दशा या कृष्णमूर्ति सब-लॉर्ड नियमों के साथ न मिलाएं.',
      'એક જ જવાબમાં નાડીને પરાશરી યોગ/દશા અથવા કૃષ્ણમૂર્તિ સબ-લોર્ડ નિયમો સાથે મિક્સ ન કરો.',
    ),
    localize(
      language,
      'Use validation questions before strong event statements.',
      'मजबूत घटना कथन से पहले पुष्टि प्रश्न पूछें.',
      'મજબૂત ઘટના નિવેદન પહેલાં પુષ્ટિ પ્રશ્નો પૂછો.',
    ),
    localize(
      language,
      'Give guidance, timing themes, and remedies without fear or guaranteed outcomes.',
      'डर या गारंटी वाले परिणामों के बिना मार्गदर्शन, समय-विषय और उपाय दें.',
      'ભય અથવા ગેરંટીવાળા પરિણામો વગર માર્ગદર્શન, સમય-વિષયો અને ઉપાયો આપો.',
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
      'समान राशि संयोजन-शैली संबंध',
      'એક જ રાશિ સંયોગ-શૈલી સંબંધ',
    );
  }
  if (relation === 'trine-link') {
    return localize(language, 'trinal story link', 'त्रिकोण कथा संबंध', 'ત્રિકોણ કથા સંબંધ');
  }
  if (relation === 'opposition-link') {
    return localize(language, 'opposition story link', 'विपरीत कथा संबंध', 'વિરોધ કથા સંબંધ');
  }
  if (relation === 'sequence-link') {
    return localize(language, 'sequence link', 'क्रम संबंध', 'ક્રમ સંબંધ');
  }
  if (relation === 'rahu-ketu-axis') {
    return localize(language, 'karmic axis', 'कर्म अक्ष', 'કર્મ અક્ષ');
  }
  return localize(language, 'karaka link', 'कारक संबंध', 'કારક સંબંધ');
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
    return localize(language, 'career', 'करियर', 'કારકિર્દી');
  }

  if (area === 'wealth') {
    return localize(language, 'wealth', 'धन', 'ધન');
  }

  if (area === 'relationship') {
    return localize(language, 'relationship', 'संबंध', 'સંબંધ');
  }

  if (area === 'wellbeing') {
    return localize(language, 'wellbeing', 'स्वास्थ्य', 'સ્વાસ્થ્ય');
  }

  if (area === 'spirituality') {
    return localize(language, 'spirituality', 'आध्यात्मिकता', 'આધ્યાત્મિકતા');
  }

  return localize(language, 'general', 'सामान्य', 'સામાન્ય');
}
