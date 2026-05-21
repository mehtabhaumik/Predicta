import type {
  KundliData,
  MatchmakingAnalysis,
  MatchmakingCategoryId,
  MatchmakingDepth,
  MatchmakingDetailSection,
  MatchmakingScoreBand,
  MatchmakingScoreBreakdown,
  PlanetPosition,
  SupportedLanguage,
} from '@pridicta/types';

type MatchmakingOptions = {
  depth?: MatchmakingDepth;
  language?: SupportedLanguage;
};

type Copy = {
  bandLabels: Record<MatchmakingScoreBand, string>;
  pending: {
    askPrompt: string;
    baseline: string;
    conclusion: string;
    familyRisk: string;
    premiumUnlock: string;
    support: string;
    subtitle: string;
    timing: string;
    title: string;
  };
  titles: Record<MatchmakingCategoryId, string>;
  sectionTitles: {
    familyBlending: string;
    practicalAdvice: string;
    pressurePoints: string;
    scoreLogic: string;
    supportPotential: string;
    timing: string;
  };
  sentences: {
    askPrompt: (boy: string, girl: string) => string;
    baseline: string;
    conclusion: Record<MatchmakingScoreBand, string>;
    emotionalStrong: string;
    emotionalWeak: string;
    familyStrong: string;
    familyWeak: string;
    premiumUnlock: string;
    scoreBandExplanation: Record<MatchmakingScoreBand, string>;
    subtitle: string;
    supportPotential: string;
    timing: string;
    traditional: string;
  };
};

const ZODIAC = [
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

const FIRE_SIGNS = new Set(['Aries', 'Leo', 'Sagittarius']);
const EARTH_SIGNS = new Set(['Taurus', 'Virgo', 'Capricorn']);
const AIR_SIGNS = new Set(['Gemini', 'Libra', 'Aquarius']);
const WATER_SIGNS = new Set(['Cancer', 'Scorpio', 'Pisces']);
const MANGLIK_HOUSES = new Set([1, 4, 7, 8, 12]);
const SUPPORTIVE_HOUSES = new Set([1, 4, 5, 7, 9, 10, 11]);
const CHALLENGING_HOUSES = new Set([6, 8, 12]);
const SUPPORTIVE_ELEMENT_PAIRS = new Set([
  'fire-air',
  'air-fire',
  'earth-water',
  'water-earth',
]);

const COPY: Record<SupportedLanguage, Copy> = {
  en: {
    bandLabels: {
      'difficult-serious-alignment': 'Difficult without serious alignment',
      'mixed-workable': 'Mixed, workable with maturity',
      'strong-manageable': 'Strong with manageable friction',
      'structurally-strained': 'Structurally strained',
      'unusually-strong': 'Unusually strong',
    },
    pending: {
      askPrompt:
        'Explain what Matchmaking will compare once one boy Kundli and one girl Kundli are selected. Keep it humane, Vedic, and non-fatalistic.',
      baseline:
        'Predicta will explain the traditional baseline once both charts are selected.',
      conclusion:
        'Pick one boy Kundli and one girl Kundli before asking for a marriage or long-term partnership read.',
      familyRisk:
        'Family blending and pressure signals appear after both charts are selected.',
      premiumUnlock:
        'Premium depth adds score logic, pressure points, support potential, family blending guidance, and timing-sensitive advice.',
      support:
        'Support potential appears after both charts are selected.',
      subtitle:
        'Choose one boy profile and one girl profile for a dedicated Vedic matchmaking read.',
      timing:
        'Timing notes appear after both charts are selected.',
      title: 'Choose a boy Kundli and a girl Kundli.',
    },
    titles: {
      'conflict-recovery': 'Conflict recovery',
      'dharma-alignment': 'Dharma alignment',
      'emotional-compatibility': 'Emotional compatibility',
      'family-adaptation': 'Family adaptation',
      'long-term-stability': 'Long-term stability',
      'traditional-foundation': 'Traditional foundation',
    },
    sectionTitles: {
      familyBlending: 'Family blending risk',
      practicalAdvice: 'Practical advice',
      pressurePoints: 'Marriage pressure points',
      scoreLogic: 'Why the score looks like this',
      supportPotential: 'Support potential',
      timing: 'Timing notes',
    },
    sentences: {
      askPrompt: (boy, girl) =>
        `Evaluate the matchmaking between ${boy} and ${girl} using traditional Vedic compatibility, D1, D9, Venus, Jupiter, Mars balance, dasha timing, family blending, and practical marriage guidance.`,
      baseline:
        'This score blends a traditional compatibility baseline with emotional, dharma, family, conflict, and long-term stability overlays.',
      conclusion: {
        'difficult-serious-alignment':
          'This match is not impossible, but it needs very sober expectation-setting before commitment.',
        'mixed-workable':
          'This match is workable when both people have emotional maturity and do not expect effortless harmony.',
        'strong-manageable':
          'This match has enough support to move forward carefully, provided the known friction points are handled early.',
        'structurally-strained':
          'This match carries structural strain. It should not be rushed or romanticized.',
        'unusually-strong':
          'This match shows rare steadiness across attraction, family adjustment, and long-term growth.',
      },
      emotionalStrong:
        'The emotional and affection rhythm shows enough warmth to keep repair possible after disagreement.',
      emotionalWeak:
        'The emotional rhythm needs more translation, patience, and reassurance than either person may assume at first.',
      familyStrong:
        'Family adjustment looks more manageable because the home, speech, and duty indicators do not all pull in opposite directions.',
      familyWeak:
        'Family adjustment may be a real test here, especially around expectation, household tone, and invisible duty load.',
      premiumUnlock:
        'Premium depth adds score logic, pressure points, support potential, family blending guidance, and timing-sensitive advice.',
      scoreBandExplanation: {
        'difficult-serious-alignment':
          'The marriage promise exists, but strain shows up faster unless both people enter it with discipline and clarity.',
        'mixed-workable':
          'There is enough substance here, but maturity matters more than chemistry.',
        'strong-manageable':
          'The charts show support, but not the kind that excuses poor communication or weak boundaries.',
        'structurally-strained':
          'Too many core rhythms are pulling apart at once. A number alone should not hide that.',
        'unusually-strong':
          'Several foundational layers support each other instead of cancelling each other out.',
      },
      subtitle:
        'Classical Vedic matching with karma, dharma, family pressure, and life-impact interpretation.',
      supportPotential:
        'Support potential is strongest when the couple actively uses the steadier chart layers instead of testing each other through silence.',
      timing:
        'Current dasha timing is not destiny, but it does tell you whether the charts are carrying similar lessons or very different pressure at the same time.',
      traditional:
        'Traditional matching looks at the Moon, the 7th house path, Mars balance, and marriage-supporting chart layers before making any conclusion.',
    },
  },
  hi: {
    bandLabels: {
      'difficult-serious-alignment': 'गंभीर सामंजस्य के बिना कठिन',
      'mixed-workable': 'मिश्रित, परिपक्वता के साथ संभव',
      'strong-manageable': 'मजबूत, संभालने योग्य घर्षण के साथ',
      'structurally-strained': 'संरचनात्मक रूप से तनावपूर्ण',
      'unusually-strong': 'असाधारण रूप से मजबूत',
    },
    pending: {
      askPrompt:
        'समझाएं कि एक लड़के और एक लड़की की कुंडली चुनने के बाद मैचमेकिंग क्या देखेगी. भाषा मानवीय, वैदिक और गैर-नियतिवादी रखें.',
      baseline:
        'दोनों चार्ट चुने जाने पर प्रेडिक्टा पारंपरिक आधार समझाएगी.',
      conclusion:
        'विवाह या दीर्घकालीन साझेदारी रीडिंग से पहले एक लड़के और एक लड़की की कुंडली चुनें.',
      familyRisk:
        'दोनों चार्ट चुने जाने के बाद ही पारिवारिक मेल और दबाव संकेत दिखेंगे.',
      premiumUnlock:
        'प्रीमियम में स्कोर का तर्क, दबाव बिंदु, सहारा क्षमता, परिवार मेल मार्गदर्शन और समय-संवेदनशील सलाह जुड़ती है.',
      support:
        'सहारा क्षमता दोनों चार्ट चुने जाने के बाद दिखेगी.',
      subtitle:
        'एक लड़के और एक लड़की की प्रोफाइल चुनें और समर्पित वैदिक विवाह मिलान पढ़ें.',
      timing:
        'समय नोट्स दोनों चार्ट चुने जाने के बाद दिखेंगे.',
      title: 'एक लड़के और एक लड़की की कुंडली चुनें.',
    },
    titles: {
      'conflict-recovery': 'विवाद के बाद सुधार',
      'dharma-alignment': 'धर्म सामंजस्य',
      'emotional-compatibility': 'भावनात्मक संगति',
      'family-adaptation': 'परिवार अनुकूलन',
      'long-term-stability': 'दीर्घकालीन स्थिरता',
      'traditional-foundation': 'पारंपरिक आधार',
    },
    sectionTitles: {
      familyBlending: 'परिवार मेल का जोखिम',
      practicalAdvice: 'व्यावहारिक सलाह',
      pressurePoints: 'विवाह दबाव बिंदु',
      scoreLogic: 'यह स्कोर ऐसा क्यों है',
      supportPotential: 'सहारा क्षमता',
      timing: 'समय नोट्स',
    },
    sentences: {
      askPrompt: (boy, girl) =>
        `${boy} और ${girl} के बीच विवाह मिलान को पारंपरिक वैदिक संगति, D1, D9, शुक्र, बृहस्पति, मंगल संतुलन, दशा समय, परिवार मेल और व्यावहारिक विवाह मार्गदर्शन के साथ पढ़ें.`,
      baseline:
        'यह स्कोर पारंपरिक वैदिक आधार को भावनात्मक, धर्म, परिवार, विवाद और दीर्घकालीन स्थिरता की परतों के साथ जोड़ता है.',
      conclusion: {
        'difficult-serious-alignment':
          'यह मिलान असंभव नहीं है, लेकिन प्रतिबद्धता से पहले बहुत साफ अपेक्षाएँ चाहिए.',
        'mixed-workable':
          'यह मिलान परिपक्वता के साथ संभव है, बशर्ते दोनों लोग सहज सामंजस्य की उम्मीद न करें.',
        'strong-manageable':
          'यह मिलान आगे बढ़ सकता है, यदि ज्ञात घर्षण बिंदुओं को जल्दी संभाला जाए.',
        'structurally-strained':
          'इस मिलान में संरचनात्मक तनाव है. इसे जल्दी या कल्पना में सुंदर मानकर नहीं चलना चाहिए.',
        'unusually-strong':
          'इस मिलान में आकर्षण, परिवार समायोजन और दीर्घकालीन विकास के बीच दुर्लभ स्थिरता दिखती है.',
      },
      emotionalStrong:
        'भावनात्मक और स्नेह की लय में इतनी गर्माहट है कि असहमति के बाद सुधार संभव रहे.',
      emotionalWeak:
        'भावनात्मक लय को उतना सरल मत मानिए. यहां अधिक धैर्य, अनुवाद और आश्वासन चाहिए.',
      familyStrong:
        'घर, वाणी और कर्तव्य संकेत एक-दूसरे को पूरी तरह नहीं काट रहे, इसलिए पारिवारिक समायोजन थोड़ा आसान लग रहा है.',
      familyWeak:
        'परिवार का समायोजन यहां वास्तविक परीक्षा बन सकता है, खासकर अपेक्षा, घर के स्वर और अदृश्य जिम्मेदारी को लेकर.',
      premiumUnlock:
        'प्रीमियम में स्कोर का तर्क, दबाव बिंदु, सहारा क्षमता, परिवार मेल मार्गदर्शन और समय-संवेदनशील सलाह जुड़ती है.',
      scoreBandExplanation: {
        'difficult-serious-alignment':
          'विवाह की संभावना है, लेकिन स्पष्टता और अनुशासन के बिना तनाव जल्दी बढ़ेगा.',
        'mixed-workable':
          'यहां आधार है, पर रसायन से अधिक परिपक्वता काम आएगी.',
        'strong-manageable':
          'चार्ट में सहारा है, पर वह कमजोर संवाद या सीमाहीनता को माफ नहीं करेगा.',
        'structurally-strained':
          'बहुत से मुख्य संकेत एक-दूसरे से दूर जा रहे हैं. सिर्फ एक संख्या इसे नहीं छिपा सकती.',
        'unusually-strong':
          'कई बुनियादी परतें एक-दूसरे का समर्थन कर रही हैं, काट नहीं रही.',
      },
      subtitle:
        'शास्त्रीय वैदिक मिलान को कर्म, धर्म, परिवार दबाव और जीवन-प्रभाव की भाषा में पढ़ें.',
      supportPotential:
        'सहारा क्षमता सबसे अधिक तब खुलती है जब यह जोड़ी शांत चार्ट-स्तरों को सचेत रूप से जीती है, एक-दूसरे की परीक्षा नहीं लेती.',
      timing:
        'चल रही दशा भाग्य नहीं तय करती, पर यह जरूर बताती है कि दोनों चार्ट एक जैसे पाठ उठा रहे हैं या एक ही समय अलग दबाव.',
      traditional:
        'पारंपरिक मिलान चंद्र, सप्तम भाव पथ, मंगल संतुलन और विवाह-सहायक चार्ट परतों को देखकर निष्कर्ष बनाता है.',
    },
  },
  gu: {
    bandLabels: {
      'difficult-serious-alignment': 'ગંભીર મેળવણી વગર કઠિન',
      'mixed-workable': 'મિશ્ર, પરિપક્વતા સાથે શક્ય',
      'strong-manageable': 'મજબૂત, સંભાળી શકાય તેવા ઘર્ષણ સાથે',
      'structurally-strained': 'રચનાત્મક રીતે તણાવગ્રસ્ત',
      'unusually-strong': 'અસાધારણ રીતે મજબૂત',
    },
    pending: {
      askPrompt:
        'સમજાવો કે એક છોકરા અને એક છોકરીની કુંડળી પસંદ થયા પછી મેચમેકિંગ શું જોશે. ભાષા માનવીય, વૈદિક અને બિન-નિયતિવાદી રાખો.',
      baseline:
        'બન્ને ચાર્ટ પસંદ થયા પછી પ્રેડિક્ટા પરંપરાગત આધાર સમજાવશે.',
      conclusion:
        'લગ્ન અથવા લાંબા ગાળાની ભાગીદારી વાંચન પહેલાં એક છોકરા અને એક છોકરીની કુંડળી પસંદ કરો.',
      familyRisk:
        'બન્ને ચાર્ટ પસંદ થયા પછી જ પરિવાર મેળ અને દબાણ સંકેતો દેખાશે.',
      premiumUnlock:
        'પ્રીમિયમમાં સ્કોરનું તર્ક, દબાણ બિંદુઓ, સહારો શક્તિ, પરિવાર મેળ માર્ગદર્શન અને સમય-સચેત સલાહ ઉમેરાય છે.',
      support:
        'સહારો શક્તિ બન્ને ચાર્ટ પસંદ થયા પછી દેખાશે.',
      subtitle:
        'એક છોકરા અને એક છોકરીની પ્રોફાઇલ પસંદ કરો અને સમર્પિત વૈદિક લગ્ન મિલાન વાંચો.',
      timing:
        'સમય નોંધો બન્ને ચાર્ટ પસંદ થયા પછી દેખાશે.',
      title: 'એક છોકરા અને એક છોકરીની કુંડળી પસંદ કરો.',
    },
    titles: {
      'conflict-recovery': 'ઘર્ષણ પછી સુધાર',
      'dharma-alignment': 'ધર્મ મેળવણી',
      'emotional-compatibility': 'ભાવનાત્મક સુસંગતતા',
      'family-adaptation': 'પરિવાર અનુકૂલન',
      'long-term-stability': 'દીર્ઘકાલીન સ્થિરતા',
      'traditional-foundation': 'પરંપરાગત આધાર',
    },
    sectionTitles: {
      familyBlending: 'પરિવાર મેળનો જોખમ',
      practicalAdvice: 'પ્રાયોગિક સલાહ',
      pressurePoints: 'લગ્ન દબાણ બિંદુઓ',
      scoreLogic: 'આ સ્કોર આવો કેમ છે',
      supportPotential: 'સહારો શક્તિ',
      timing: 'સમય નોંધો',
    },
    sentences: {
      askPrompt: (boy, girl) =>
        `${boy} અને ${girl} વચ્ચેના લગ્ન મિલાનને પરંપરાગત વૈદિક સુસંગતતા, D1, D9, શુક્ર, ગુરુ, મંગળ સંતુલન, દશા સમય, પરિવાર મેળ અને પ્રાયોગિક લગ્ન માર્ગદર્શન સાથે વાંચો.`,
      baseline:
        'આ સ્કોર પરંપરાગત વૈદિક આધારને ભાવનાત્મક, ધર્મ, પરિવાર, ઘર્ષણ અને દીર્ઘકાલીન સ્થિરતાની પરતો સાથે જોડે છે.',
      conclusion: {
        'difficult-serious-alignment':
          'આ મેળ અશક્ય નથી, પણ પ્રતિબદ્ધતા પહેલાં બહુ સ્પષ્ટ અપેક્ષાઓ જોઈએ.',
        'mixed-workable':
          'આ મેળ પરિપક્વતા સાથે શક્ય છે, જો બન્ને સહજ સુમેળની અપેક્ષા ન રાખે.',
        'strong-manageable':
          'આ મેળ આગળ વધી શકે છે, જો જાણીતા ઘર્ષણ બિંદુઓ વહેલા સંભાળવામાં આવે.',
        'structurally-strained':
          'આ મેળમાં રચનાત્મક તણાવ છે. તેને ઉતાવળમાં અથવા કલ્પનામાં સુંદર માનીને આગળ ન વધવું.',
        'unusually-strong':
          'આ મેળમાં આકર્ષણ, પરિવાર મેળવણી અને દીર્ઘકાલીન વિકાસ વચ્ચે દુર્લભ સ્થિરતા દેખાય છે.',
      },
      emotionalStrong:
        'ભાવનાત્મક અને સ્નેહની લયમાં એટલી ઉષ્ણતા છે કે અસહમતિ પછી સુધાર શક્ય રહે.',
      emotionalWeak:
        'અહીં વધુ અનુવાદ, ધીરજ અને આશ્વાસન જોઈએ, જેટલું શરૂઆતમાં લાગતું નથી.',
      familyStrong:
        'ઘર, વાણી અને ફરજના સંકેતો એકબીજાને સંપૂર્ણ રીતે કાપતા નથી, તેથી પરિવાર મેળવણી થોડી સહેલી લાગે છે.',
      familyWeak:
        'પરિવાર મેળવણી અહીં વાસ્તવિક પરીક્ષા બની શકે છે, ખાસ કરીને અપેક્ષા, ઘરના સ્વર અને અદૃશ્ય ફરજને લઈને.',
      premiumUnlock:
        'પ્રીમિયમમાં સ્કોરનું તર્ક, દબાણ બિંદુઓ, સહારો શક્તિ, પરિવાર મેળ માર્ગદર્શન અને સમય-સચેત સલાહ ઉમેરાય છે.',
      scoreBandExplanation: {
        'difficult-serious-alignment':
          'લગ્નની શક્યતા છે, પણ સ્પષ્ટતા અને અનુશાસન વિના તણાવ ઝડપથી વધશે.',
        'mixed-workable':
          'અહીં આધાર છે, પણ રસાયણથી વધુ પરિપક્વતા કામ લાગશે.',
        'strong-manageable':
          'ચાર્ટમાં સહારો છે, પણ તે નબળા સંવાદ અથવા મર્યાદા વિનાના વર્તનને માફ નહીં કરે.',
        'structurally-strained':
          'ઘણા મુખ્ય સંકેતો એકબીજાથી દૂર ખેંચાઈ રહ્યા છે. એક આંકડો આ સત્ય છુપાવી શકતો નથી.',
        'unusually-strong':
          'ઘણી બેઝિક પરતો એકબીજાને ટેકો આપે છે, કાપતી નથી.',
      },
      subtitle:
        'શાસ્ત્રીય વૈદિક મિલાનને કર્મ, ધર્મ, પરિવાર દબાણ અને જીવન-પ્રભાવની ભાષામાં વાંચો.',
      supportPotential:
        'સહારો શક્તિ ત્યારે વધારે ખીલે છે જ્યારે આ જોડી શાંત ચાર્ટ-સ્તરોને જાગૃત રીતે જીવે છે, એકબીજાની કસોટી કરતી નથી.',
      timing:
        'ચાલતી દશા ભાગ્ય નક્કી કરતી નથી, પણ એ બતાવે છે કે બન્ને ચાર્ટ સમાન પાઠ ઉઠાવી રહ્યા છે કે અલગ દબાણ.',
      traditional:
        'પરંપરાગત મિલાન ચંદ્ર, સાતમા ભાવનો માર્ગ, મંગળ સંતુલન અને લગ્ન-સહાયક ચાર્ટ પરતો જોઈને નિષ્કર્ષ આપે છે.',
    },
  },
};

export function composeMatchmakingAnalysis(
  boy?: KundliData,
  girl?: KundliData,
  options: MatchmakingOptions = {},
): MatchmakingAnalysis {
  const language = options.language ?? 'en';
  const copy = COPY[language] ?? COPY.en;
  const depth = options.depth ?? 'FREE';

  if (!boy || !girl) {
    return {
      askPrompt: copy.pending.askPrompt,
      boyName: boy?.birthDetails.name ?? pendingName(language, 'boy'),
      cautionAreas: [],
      familyBlendingRisk: copy.pending.familyRisk,
      girlName: girl?.birthDetails.name ?? pendingName(language, 'girl'),
      overallConclusion: copy.pending.conclusion,
      overallScore: 0,
      practicalAdvice: [],
      premiumSections: [],
      premiumUnlock: copy.pending.premiumUnlock,
      scoreBand: 'mixed-workable',
      scoreBandExplanation: copy.pending.premiumUnlock,
      scoreBandLabel: copy.bandLabels['mixed-workable'],
      scoreBreakdown: [],
      shareSummary: copy.pending.title,
      status: 'pending',
      strengths: [],
      subtitle: copy.pending.subtitle,
      supportPotential: copy.pending.support,
      timingNote: copy.pending.timing,
      title: copy.pending.title,
      traditionalBaseline: copy.pending.baseline,
    };
  }

  const breakdown = buildScoreBreakdown(boy, girl, language);
  const overallScore = breakdown.reduce((sum, item) => sum + item.score, 0);
  const scoreBand = resolveScoreBand(overallScore);
  const strengths = breakdown
    .slice()
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(item => `${item.title}: ${item.summary}`);
  const cautionAreas = breakdown
    .slice()
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .map(item => `${item.title}: ${item.summary}`);
  const premiumSections = buildPremiumSections(
    boy,
    girl,
    breakdown,
    scoreBand,
    language,
  );

  return {
    askPrompt: copy.sentences.askPrompt(
      boy.birthDetails.name,
      girl.birthDetails.name,
    ),
    boyName: boy.birthDetails.name,
    cautionAreas,
    familyBlendingRisk:
      categoryById(breakdown, 'family-adaptation').score >= 10
        ? copy.sentences.familyStrong
        : copy.sentences.familyWeak,
    girlName: girl.birthDetails.name,
    overallConclusion: copy.sentences.conclusion[scoreBand],
    overallScore,
    practicalAdvice: buildPracticalAdvice(breakdown, language),
    premiumSections:
      depth === 'PREMIUM'
        ? premiumSections
        : premiumSections.slice(0, 3),
    premiumUnlock: copy.sentences.premiumUnlock,
    scoreBand,
    scoreBandExplanation: copy.sentences.scoreBandExplanation[scoreBand],
    scoreBandLabel: copy.bandLabels[scoreBand],
    scoreBreakdown: breakdown,
    shareSummary: [
      `${boy.birthDetails.name} + ${girl.birthDetails.name}`,
      `${copy.bandLabels[scoreBand]} · ${overallScore}/100`,
      copy.sentences.conclusion[scoreBand],
    ].join('\n'),
    status: 'ready',
    strengths,
    subtitle: copy.sentences.subtitle,
    supportPotential:
      categoryById(breakdown, 'emotional-compatibility').score >= 10
        ? copy.sentences.emotionalStrong
        : copy.sentences.emotionalWeak,
    timingNote: copy.sentences.timing,
    title:
      language === 'hi'
        ? `${boy.birthDetails.name} और ${girl.birthDetails.name} का विवाह मिलान`
        : language === 'gu'
          ? `${boy.birthDetails.name} અને ${girl.birthDetails.name}નું લગ્ન મિલાન`
          : `${boy.birthDetails.name} and ${girl.birthDetails.name} Matchmaking`,
    traditionalBaseline: copy.sentences.traditional,
  };
}

function buildScoreBreakdown(
  boy: KundliData,
  girl: KundliData,
  language: SupportedLanguage,
): MatchmakingScoreBreakdown[] {
  const copy = COPY[language] ?? COPY.en;
  return [
    scoreTraditionalFoundation(boy, girl, copy),
    scoreEmotionalCompatibility(boy, girl, copy),
    scoreDharmaAlignment(boy, girl, copy),
    scoreFamilyAdaptation(boy, girl, copy),
    scoreConflictRecovery(boy, girl, copy),
    scoreLongTermStability(boy, girl, copy),
  ];
}

function scoreTraditionalFoundation(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const moonScore = elementCompatibilityScore(boy.moonSign, girl.moonSign, 8);
  const seventhScore =
    Math.round(
      ((seventhLordSupport(boy) + seventhLordSupport(girl)) / 2) * 10,
    ) / 10;
  const manglikScore = marsBalanceScore(boy, girl);
  const score = clampScore(Math.round(moonScore + seventhScore + manglikScore), 20);
  return {
    evidence: [
      `${boy.birthDetails.name}: ${boy.moonSign} Moon, ${seventhLordEvidence(boy)}.`,
      `${girl.birthDetails.name}: ${girl.moonSign} Moon, ${seventhLordEvidence(girl)}.`,
      manglikEvidence(boy, girl),
    ],
    id: 'traditional-foundation',
    maxScore: 20,
    score,
    summary:
      score >= 15
        ? copy.sentences.baseline
        : copy.sentences.traditional,
    title: copy.titles['traditional-foundation'],
  };
}

function scoreEmotionalCompatibility(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const moon = elementCompatibilityScore(boy.moonSign, girl.moonSign, 6);
  const venus = planetElementScore(boy, girl, 'Venus', 5);
  const mercury = planetElementScore(boy, girl, 'Mercury', 4);
  const score = clampScore(Math.round(moon + venus + mercury), 15);
  return {
    evidence: [
      `${boy.birthDetails.name}: ${boy.moonSign} Moon and ${planetLine(boy, 'Venus')}.`,
      `${girl.birthDetails.name}: ${girl.moonSign} Moon and ${planetLine(girl, 'Venus')}.`,
      `Mercury rhythm: ${planetLine(boy, 'Mercury')} / ${planetLine(girl, 'Mercury')}.`,
    ],
    id: 'emotional-compatibility',
    maxScore: 15,
    score,
    summary: score >= 10 ? copy.sentences.emotionalStrong : copy.sentences.emotionalWeak,
    title: copy.titles['emotional-compatibility'],
  };
}

function scoreDharmaAlignment(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const d9Asc = elementCompatibilityScore(
    boy.charts.D9?.ascendantSign ?? boy.lagna,
    girl.charts.D9?.ascendantSign ?? girl.lagna,
    6,
  );
  const jupiter = planetElementScore(boy, girl, 'Jupiter', 5);
  const dasha = dashaHarmonyScore(boy, girl, 4);
  const score = clampScore(Math.round(d9Asc + jupiter + dasha), 15);
  return {
    evidence: [
      `${boy.birthDetails.name}: D9 ${boy.charts.D9?.ascendantSign ?? boy.lagna}, ${planetLine(boy, 'Jupiter')}.`,
      `${girl.birthDetails.name}: D9 ${girl.charts.D9?.ascendantSign ?? girl.lagna}, ${planetLine(girl, 'Jupiter')}.`,
      `Current dasha timing: ${boy.dasha.current.mahadasha}/${boy.dasha.current.antardasha} and ${girl.dasha.current.mahadasha}/${girl.dasha.current.antardasha}.`,
    ],
    id: 'dharma-alignment',
    maxScore: 15,
    score,
    summary:
      score >= 10
        ? supportiveSentence(copy, 'dharma')
        : cautionSentence(copy, 'dharma'),
    title: copy.titles['dharma-alignment'],
  };
}

function scoreFamilyAdaptation(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const familySupport =
    houseSupportScore(boy, [2, 4, 11], 7) +
    houseSupportScore(girl, [2, 4, 11], 7);
  const moonBlend = elementCompatibilityScore(boy.moonSign, girl.moonSign, 4);
  const score = clampScore(Math.round(familySupport / 2 + moonBlend), 15);
  return {
    evidence: [
      `${boy.birthDetails.name}: strongest houses ${boy.ashtakavarga.strongestHouses.join(', ')}, weakest houses ${boy.ashtakavarga.weakestHouses.join(', ')}.`,
      `${girl.birthDetails.name}: strongest houses ${girl.ashtakavarga.strongestHouses.join(', ')}, weakest houses ${girl.ashtakavarga.weakestHouses.join(', ')}.`,
      `Family tone leans on houses 2, 4, and 11 for speech, home, and support network stability.`,
    ],
    id: 'family-adaptation',
    maxScore: 15,
    score,
    summary: score >= 10 ? copy.sentences.familyStrong : copy.sentences.familyWeak,
    title: copy.titles['family-adaptation'],
  };
}

function scoreConflictRecovery(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const mars = planetElementScore(boy, girl, 'Mars', 7);
  const mercury = planetElementScore(boy, girl, 'Mercury', 4);
  const dasha = dashaHarmonyScore(boy, girl, 4);
  const score = clampScore(Math.round(mars + mercury + dasha), 15);
  return {
    evidence: [
      `Mars pattern: ${planetLine(boy, 'Mars')} / ${planetLine(girl, 'Mars')}.`,
      `Mercury pattern: ${planetLine(boy, 'Mercury')} / ${planetLine(girl, 'Mercury')}.`,
      `Dasha pressure: ${boy.dasha.current.mahadasha} vs ${girl.dasha.current.mahadasha}.`,
    ],
    id: 'conflict-recovery',
    maxScore: 15,
    score,
    summary:
      score >= 10
        ? supportiveSentence(copy, 'conflict')
        : cautionSentence(copy, 'conflict'),
    title: copy.titles['conflict-recovery'],
  };
}

function scoreLongTermStability(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const seventh = seventhLordSupport(boy) + seventhLordSupport(girl);
  const d9 = d9MarriageSupport(boy) + d9MarriageSupport(girl);
  const jupiterVenus =
    planetElementScore(boy, girl, 'Venus', 5) +
    planetElementScore(boy, girl, 'Jupiter', 5);
  const score = clampScore(
    Math.round(seventh + d9 + jupiterVenus / 2),
    20,
  );
  return {
    evidence: [
      `${boy.birthDetails.name}: ${seventhLordEvidence(boy)} and D9 ${d9Evidence(boy)}.`,
      `${girl.birthDetails.name}: ${seventhLordEvidence(girl)} and D9 ${d9Evidence(girl)}.`,
      `Venus/Jupiter support: ${planetLine(boy, 'Venus')} / ${planetLine(girl, 'Jupiter')}.`,
    ],
    id: 'long-term-stability',
    maxScore: 20,
    score,
    summary:
      score >= 14
        ? supportiveSentence(copy, 'stability')
        : cautionSentence(copy, 'stability'),
    title: copy.titles['long-term-stability'],
  };
}

function buildPremiumSections(
  boy: KundliData,
  girl: KundliData,
  breakdown: MatchmakingScoreBreakdown[],
  scoreBand: MatchmakingScoreBand,
  language: SupportedLanguage,
): MatchmakingDetailSection[] {
  const copy = COPY[language] ?? COPY.en;
  return [
    {
      evidence: breakdown.flatMap(item => item.evidence).slice(0, 5),
      guidance:
        scoreBand === 'structurally-strained'
          ? cautionSentence(copy, 'commitment')
          : supportiveSentence(copy, 'commitment'),
      id: 'score-logic',
      summary: breakdown
        .map(item => `${item.title}: ${item.score}/${item.maxScore}`)
        .join(' · '),
      title: copy.sectionTitles.scoreLogic,
    },
    {
      evidence: categoryById(breakdown, 'family-adaptation').evidence,
      guidance: copy.sentences.familyStrong,
      id: 'family-blending',
      summary:
        categoryById(breakdown, 'family-adaptation').score >= 10
          ? copy.sentences.familyStrong
          : copy.sentences.familyWeak,
      title: copy.sectionTitles.familyBlending,
    },
    {
      evidence: categoryById(breakdown, 'conflict-recovery').evidence,
      guidance: cautionSentence(copy, 'conflict'),
      id: 'pressure-points',
      summary:
        `${boy.birthDetails.name} and ${girl.birthDetails.name} should name conflict speed, silence patterns, and family expectation load before taking promises as understood.`,
      title: copy.sectionTitles.pressurePoints,
    },
    {
      evidence: categoryById(breakdown, 'emotional-compatibility').evidence,
      guidance: supportiveSentence(copy, 'repair'),
      id: 'support-potential',
      summary: copy.sentences.supportPotential,
      title: copy.sectionTitles.supportPotential,
    },
    {
      evidence: categoryById(breakdown, 'dharma-alignment').evidence,
      guidance: copy.sentences.timing,
      id: 'timing',
      summary:
        `The present dasha sequence is ${boy.dasha.current.mahadasha}/${boy.dasha.current.antardasha} for ${boy.birthDetails.name} and ${girl.dasha.current.mahadasha}/${girl.dasha.current.antardasha} for ${girl.birthDetails.name}.`,
      title: copy.sectionTitles.timing,
    },
    {
      evidence: breakdown
        .slice()
        .sort((left, right) => right.score - left.score)
        .slice(0, 3)
        .map(item => `${item.title}: ${item.summary}`),
      guidance: buildPracticalAdvice(breakdown, language).join(' '),
      id: 'practical-advice',
      summary: buildPracticalAdvice(breakdown, language).join(' '),
      title: copy.sectionTitles.practicalAdvice,
    },
  ];
}

function buildPracticalAdvice(
  breakdown: MatchmakingScoreBreakdown[],
  language: SupportedLanguage,
): string[] {
  const copy = COPY[language] ?? COPY.en;
  const lowest = breakdown
    .slice()
    .sort((left, right) => left.score - right.score)
    .slice(0, 2)
    .map(item => item.id);
  const notes: string[] = [];

  if (lowest.includes('family-adaptation')) {
    notes.push(
      language === 'hi'
        ? 'रिश्ता आगे बढ़ाने से पहले परिवार की अपेक्षाएँ, रहने की शैली और जिम्मेदारी विभाजन पर साफ बात करें.'
        : language === 'gu'
          ? 'સંબંધ આગળ વધારતા પહેલાં પરિવારની અપેક્ષા, રહેવાની રીત અને જવાબદારી વહેંચણી પર સ્પષ્ટ વાત કરો.'
          : 'Before progressing, speak clearly about family expectations, living style, and invisible duty load.',
    );
  }

  if (lowest.includes('conflict-recovery')) {
    notes.push(
      language === 'hi'
        ? 'सहमति से पहले यह देखें कि असहमति आने पर दोनों कैसे शांत होते हैं.'
        : language === 'gu'
          ? 'સહમતિ પહેલાં જુઓ કે અસહમતિ આવે ત્યારે બન્ને કેવી રીતે શાંત થાય છે.'
          : 'Before commitment, test how both people repair after disagreement instead of how they behave on good days.',
    );
  }

  if (!notes.length) {
    notes.push(
      copy.sentences.supportPotential,
      copy.sentences.timing,
    );
  }

  return notes.slice(0, 3);
}

function resolveScoreBand(score: number): MatchmakingScoreBand {
  if (score >= 85) {
    return 'unusually-strong';
  }
  if (score >= 70) {
    return 'strong-manageable';
  }
  if (score >= 55) {
    return 'mixed-workable';
  }
  if (score >= 40) {
    return 'difficult-serious-alignment';
  }
  return 'structurally-strained';
}

function categoryById(
  breakdown: MatchmakingScoreBreakdown[],
  id: MatchmakingCategoryId,
): MatchmakingScoreBreakdown {
  return breakdown.find(item => item.id === id) ?? breakdown[0];
}

function supportiveSentence(copy: Copy, area: 'commitment' | 'conflict' | 'dharma' | 'repair' | 'stability'): string {
  if (area === 'commitment') {
    return copy.sentences.supportPotential;
  }
  if (area === 'conflict') {
    return copy.sentences.emotionalStrong;
  }
  if (area === 'dharma') {
    return copy.sentences.baseline;
  }
  if (area === 'repair') {
    return copy.sentences.emotionalStrong;
  }
  return copy.sentences.supportPotential;
}

function cautionSentence(copy: Copy, area: 'commitment' | 'conflict' | 'dharma' | 'stability'): string {
  if (area === 'commitment') {
    return copy.sentences.familyWeak;
  }
  if (area === 'conflict') {
    return copy.sentences.emotionalWeak;
  }
  if (area === 'dharma') {
    return copy.sentences.timing;
  }
  return copy.sentences.familyWeak;
}

function pendingName(language: SupportedLanguage, role: 'boy' | 'girl'): string {
  if (language === 'hi') {
    return role === 'boy' ? 'लड़का' : 'लड़की';
  }
  if (language === 'gu') {
    return role === 'boy' ? 'છોકરો' : 'છોકરી';
  }
  return role === 'boy' ? 'Boy' : 'Girl';
}

function seventhLordSupport(kundli: KundliData): number {
  const seventhHouse = kundli.houses.find(item => item.house === 7);
  const lord = seventhHouse?.lord;
  const placement = lord ? findPlanet(kundli, lord) : undefined;
  if (!placement) {
    return 2;
  }
  if (SUPPORTIVE_HOUSES.has(placement.house)) {
    return 6;
  }
  if (CHALLENGING_HOUSES.has(placement.house)) {
    return 2;
  }
  return 4;
}

function seventhLordEvidence(kundli: KundliData): string {
  const seventhHouse = kundli.houses.find(item => item.house === 7);
  if (!seventhHouse) {
    return '7th house support is pending';
  }
  const placement = findPlanet(kundli, seventhHouse.lord);
  return placement
    ? `7th lord ${placement.name} in house ${placement.house}`
    : `7th lord ${seventhHouse.lord} needs chart review`;
}

function marsBalanceScore(boy: KundliData, girl: KundliData): number {
  const boyMars = findPlanet(boy, 'Mars');
  const girlMars = findPlanet(girl, 'Mars');
  const boyManglik = Boolean(boyMars && MANGLIK_HOUSES.has(boyMars.house));
  const girlManglik = Boolean(girlMars && MANGLIK_HOUSES.has(girlMars.house));
  if (boyManglik === girlManglik) {
    return 6;
  }
  return 3;
}

function manglikEvidence(boy: KundliData, girl: KundliData): string {
  const boyMars = findPlanet(boy, 'Mars');
  const girlMars = findPlanet(girl, 'Mars');
  const boyFlag = boyMars && MANGLIK_HOUSES.has(boyMars.house) ? 'sensitive' : 'balanced';
  const girlFlag = girlMars && MANGLIK_HOUSES.has(girlMars.house) ? 'sensitive' : 'balanced';
  return `Mars balance: ${boy.birthDetails.name} is ${boyFlag}; ${girl.birthDetails.name} is ${girlFlag}.`;
}

function d9MarriageSupport(kundli: KundliData): number {
  const d9 = kundli.charts.D9;
  if (!d9?.planetDistribution?.length) {
    return 3;
  }
  const venus = findPlanetInDistribution(d9.planetDistribution, 'Venus');
  const jupiter = findPlanetInDistribution(d9.planetDistribution, 'Jupiter');
  let score = 2;
  if (venus && SUPPORTIVE_HOUSES.has(venus.house)) {
    score += 2;
  }
  if (jupiter && SUPPORTIVE_HOUSES.has(jupiter.house)) {
    score += 2;
  }
  return score;
}

function d9Evidence(kundli: KundliData): string {
  const d9 = kundli.charts.D9;
  if (!d9) {
    return 'D9 support pending';
  }
  return `${d9.ascendantSign} D9 ascendant with ${d9.planetDistribution.length} tracked placements`;
}

function dashaHarmonyScore(
  first: KundliData,
  second: KundliData,
  maxScore: number,
): number {
  if (first.dasha.current.mahadasha === second.dasha.current.mahadasha) {
    return maxScore;
  }
  if (
    elementOfPlanet(first.dasha.current.mahadasha) ===
    elementOfPlanet(second.dasha.current.mahadasha)
  ) {
    return Math.max(2, maxScore - 1);
  }
  return Math.max(1, maxScore - 3);
}

function houseSupportScore(
  kundli: KundliData,
  houses: number[],
  maxScore: number,
): number {
  const strongHits = kundli.ashtakavarga.strongestHouses.filter(house =>
    houses.includes(house),
  ).length;
  const weakHits = kundli.ashtakavarga.weakestHouses.filter(house =>
    houses.includes(house),
  ).length;
  return clampRange(maxScore / 2 + strongHits * 1.5 - weakHits * 1.2, 1, maxScore);
}

function planetElementScore(
  first: KundliData,
  second: KundliData,
  planetName: string,
  maxScore: number,
): number {
  const firstPlanet = findPlanet(first, planetName);
  const secondPlanet = findPlanet(second, planetName);
  if (!firstPlanet || !secondPlanet) {
    return Math.round(maxScore / 2);
  }
  return elementCompatibilityScore(firstPlanet.sign, secondPlanet.sign, maxScore);
}

function elementCompatibilityScore(
  firstSign: string,
  secondSign: string,
  maxScore: number,
): number {
  const firstElement = signElement(firstSign);
  const secondElement = signElement(secondSign);
  if (!firstElement || !secondElement) {
    return Math.round(maxScore / 2);
  }
  if (firstElement === secondElement) {
    return maxScore - 1;
  }
  if (SUPPORTIVE_ELEMENT_PAIRS.has(`${firstElement}-${secondElement}`)) {
    return maxScore;
  }
  const distance = zodiacDistance(firstSign, secondSign);
  if (distance === 3 || distance === 7 || distance === 9) {
    return Math.max(2, maxScore - 2);
  }
  return Math.max(1, Math.round(maxScore * 0.45));
}

function signElement(sign: string): 'air' | 'earth' | 'fire' | 'water' | undefined {
  if (FIRE_SIGNS.has(sign)) return 'fire';
  if (EARTH_SIGNS.has(sign)) return 'earth';
  if (AIR_SIGNS.has(sign)) return 'air';
  if (WATER_SIGNS.has(sign)) return 'water';
  return undefined;
}

function zodiacDistance(firstSign: string, secondSign: string): number {
  const firstIndex = ZODIAC.indexOf(firstSign as (typeof ZODIAC)[number]);
  const secondIndex = ZODIAC.indexOf(secondSign as (typeof ZODIAC)[number]);
  if (firstIndex < 0 || secondIndex < 0) {
    return 0;
  }
  const raw = Math.abs(firstIndex - secondIndex);
  return Math.min(raw, 12 - raw);
}

function elementOfPlanet(planet: string): 'air' | 'earth' | 'fire' | 'water' | 'mixed' {
  if (planet === 'Sun' || planet === 'Mars' || planet === 'Ketu') return 'fire';
  if (planet === 'Mercury' || planet === 'Saturn' || planet === 'Rahu') return 'air';
  if (planet === 'Venus') return 'earth';
  if (planet === 'Moon' || planet === 'Jupiter') return 'water';
  return 'mixed';
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(
    planet => planet.name.toLowerCase() === name.toLowerCase(),
  );
}

function findPlanetInDistribution(
  planets: PlanetPosition[],
  name: string,
): PlanetPosition | undefined {
  return planets.find(
    planet => planet.name.toLowerCase() === name.toLowerCase(),
  );
}

function planetLine(kundli: KundliData, name: string): string {
  const placement = findPlanet(kundli, name);
  if (!placement) {
    return `${name} pending`;
  }
  return `${name} in ${placement.sign}, house ${placement.house}`;
}

function clampScore(score: number, maxScore: number): number {
  return Math.max(0, Math.min(maxScore, score));
}

function clampRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
