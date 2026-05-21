import type {
  FamilyInfluenceMatrixRow,
  FamilyKarmaMap,
  FamilyKarmaTheme,
  FamilyMemberProfile,
  FamilyRelationshipGuidance,
  FamilyRelationshipLabel,
  KundliData,
  PairComparisonTone,
  SupportedLanguage,
} from '@pridicta/types';
import { composePairComparison } from './pairComparison';

type FamilyKarmaInput = {
  kundli: KundliData;
  relationship?: FamilyRelationshipLabel;
};

type FamilyKarmaOptions = {
  depth?: 'FREE' | 'PREMIUM';
  language?: SupportedLanguage;
};

type HouseholdCopy = {
  pending: {
    askPrompt: string;
    climate: string;
    communication: string;
    conclusion: string;
    guidance: string[];
    householdSummary: string;
    privacy: string;
    subtitle: string;
    title: string;
  };
  prompts: {
    ask: (names: string) => string;
  };
  labels: {
    householdPressure: string;
    repeatedEmotion: (value: string) => string;
    repeatedNakshatra: (value: string) => string;
    sharedSupport: (houses: string) => string;
    sharedWeakness: (houses: string) => string;
    timingOverlap: (value: string) => string;
  };
  summary: {
    climate: {
      balanced: string;
      careful: string;
      supportive: string;
    };
    communication: {
      balanced: string;
      careful: string;
      supportive: string;
    };
    authority: {
      mixed: string;
      ownerWeighted: string;
      parentWeighted: string;
    };
    caregiving: {
      low: string;
      medium: string;
      high: string;
    };
    ritualMoney: {
      support: string;
      stress: string;
    };
  };
  text: {
    householdSummary: (
      memberCount: number,
      supportPair?: string,
      frictionPair?: string,
      repeated?: string,
    ) => string;
    privacyNote: string;
    themeGuidance: {
      moon: string;
      nakshatra: string;
      weakHouses: string;
      strongHouses: string;
      dasha: string;
      pressureChain: string;
    };
    influence: {
      supportive: (name: string) => string;
      careful: (name: string) => string;
      mixed: (name: string) => string;
      caregiving: {
        anchor: string;
        shared: string;
        strain: string;
      };
      authority: {
        owner: string;
        parent: string;
        equal: string;
      };
      communication: {
        direct: string;
        fragile: string;
        uneven: string;
      };
      healing: {
        supportive: string;
        careful: string;
        mixed: string;
      };
      supportNeed: {
        supportive: string;
        careful: string;
        mixed: string;
      };
    };
    relationshipCard: {
      supportive: {
        emotional: string;
        support: string;
        friction: string;
        practical: string;
      };
      careful: {
        emotional: string;
        support: string;
        friction: string;
        practical: string;
      };
      mixed: {
        emotional: string;
        support: string;
        friction: string;
        practical: string;
      };
    };
    dharmaSupport: (label: string) => string;
    dharmaRepair: {
      pair: (label: string, guidance: string) => string;
      theme: (guidance: string) => string;
    };
    healingGuidance: {
      first: (pair?: string) => string;
      second: (supportPair?: string) => string;
      third: (theme?: string) => string;
      fourth: string;
    };
    title: (memberCount: number) => string;
    subtitle: {
      free: string;
      premium: string;
    };
    shareSummary: (
      memberCount: number,
      supportPair?: string,
      frictionPair?: string,
      repairPath?: string,
    ) => string;
  };
};

const CARE_SENSITIVE_HOUSES = new Set([4, 6, 8, 12]);
const MONEY_HOUSES = new Set([2, 11]);
const ROUTINE_HOUSES = new Set([4, 6]);
const PARENTISH_RELATIONSHIPS = new Set([
  'mother',
  'father',
  'grandmother',
  'grandfather',
  'mother-in-law',
  'father-in-law',
  'maternal-aunt',
  'paternal-aunt',
  'aunt',
  'maternal-uncle',
  'paternal-uncle',
  'uncle',
  'mentor',
  'manager',
]);

const COPY: Record<SupportedLanguage, HouseholdCopy> = {
  en: {
    pending: {
      askPrompt:
        'Explain what Family Karma Map will do once two or more saved profiles are selected. Keep the tone privacy-first, useful, and non-blaming.',
      climate: 'Household climate appears after at least two real profiles are selected.',
      communication:
        'Communication fracture and repair notes appear after the map has enough family evidence.',
      conclusion:
        'Add at least two saved profiles before asking Predicta for a real household map.',
      guidance: [
        'Save two or more real profiles first.',
        'Use Family Karma Map for care and repair, not blame.',
      ],
      householdSummary:
        'Family Karma Map opens once at least two real profiles are present.',
      privacy:
        'Family Karma Map stays private by default. It should explain repeating household patterns without blame, fear labels, or assigning one life to another person.',
      subtitle:
        'Add at least two saved profiles to see repeated karma patterns, support zones, and care guidance.',
      title: 'Add family profiles to unlock the map.',
    },
    prompts: {
      ask: names =>
        `Explain the Family Karma Map for ${names}. Use household climate, strongest support pair, strongest friction pair, repeating karma, dharma repair path, caregiving burden, communication fracture, and one practical healing direction. Keep it privacy-first and non-blaming.`,
    },
    labels: {
      householdPressure: 'Household pressure chain',
      repeatedEmotion: value => `${value} Moon family pattern`,
      repeatedNakshatra: value => `${value} karmic echo`,
      sharedSupport: houses => `Shared support in houses ${houses}`,
      sharedWeakness: houses => `Shared sensitivity in houses ${houses}`,
      timingOverlap: value => `${value} timing overlap`,
    },
    summary: {
      climate: {
        balanced:
          'The household climate is mixed but workable. Different people calm the house in different ways, so clarity matters more than intensity.',
        careful:
          'The household climate is carrying visible pressure. More than one bond is reacting at once, so small triggers can spread quickly.',
        supportive:
          'The household climate has enough warmth and usable support that repair can happen without every issue becoming a household drama.',
      },
      communication: {
        balanced:
          'Communication is uneven rather than broken. This house needs cleaner timing and fewer layered conversations.',
        careful:
          'Communication fractures show up under pressure, especially when one person goes silent and another keeps pushing.',
        supportive:
          'Communication can repair well here when the house names the issue early instead of letting it pile up.',
      },
      authority: {
        mixed:
          'Authority is shared or unclear, so unspoken expectations can create friction faster than direct disagreement.',
        ownerWeighted:
          'The owner profile or partner layer is carrying too much emotional authority, so the house may wait on one person’s tone before settling.',
        parentWeighted:
          'Parent or elder energy is setting the emotional temperature strongly, so boundaries and respect need to be balanced carefully.',
      },
      caregiving: {
        high:
          'Caregiving burden is concentrated. One or two people are likely absorbing the emotional cleanup, household duty, or invisible responsibility load.',
        low:
          'Caregiving burden looks lighter. Support can still improve, but the house is not leaning entirely on one person to hold it together.',
        medium:
          'Caregiving burden is shared, but not evenly. The house should name who carries follow-up, logistics, and emotional repair.',
      },
      ritualMoney: {
        stress:
          'Routine, money, or household logistics are likely to become a stress amplifier unless the family uses explicit structures.',
        support:
          'Routine and money can become a support anchor if the house keeps simple agreements and repeats them consistently.',
      },
    },
    text: {
      householdSummary: (memberCount, supportPair, frictionPair, repeated) =>
        [
          `${memberCount} saved profiles are active in this household map.`,
          supportPair
            ? `The strongest support pair right now is ${supportPair}.`
            : 'A clear support pair has not formed yet.',
          frictionPair
            ? `The strongest friction pair right now is ${frictionPair}.`
            : 'No dominant friction pair is repeating yet.',
          repeated
            ? `The clearest repeating household pattern is ${repeated}.`
            : 'The household pattern is still forming and needs more repeated evidence.',
        ].join(' '),
      privacyNote:
        'Use this map for reflection and better handling, not for blame, labeling, or forcing one person to carry another person’s destiny.',
      themeGuidance: {
        dasha:
          'Do not compare who is struggling more. Similar timing often means similar pressure is loud at once.',
        moon:
          'When the same emotional style repeats, the house needs gentler pacing before advice or correction.',
        nakshatra:
          'This is a good theme to channel through ritual, routine, service, or a repeated family repair habit.',
        pressureChain:
          'When more than one pair is carrying friction, the fix is usually cleaner routines and clearer emotional boundaries, not more blame.',
        strongHouses:
          'Use these as the house support anchors for routines, celebrations, logistics, and repair.',
        weakHouses:
          'Treat these houses as family care zones. Build structure there before tension becomes personal.',
      },
      influence: {
        supportive: name =>
          `${name} often acts as a support anchor when household pressure rises.`,
        careful: name =>
          `${name} is tied into one or more pressure chains, so handling around them must stay gentler and clearer.`,
        mixed: name =>
          `${name} sits in a mixed influence zone and may need cleaner expectations than advice.`,
        caregiving: {
          anchor: 'Often becomes the emotional anchor or practical caretaker.',
          shared: 'Shares care work, but should not be left to guess what others need.',
          strain: 'May be absorbing more emotional or practical cleanup than is visible.',
        },
        authority: {
          owner: 'Carries visible household authority or sets the tone quickly.',
          parent: 'Parent or elder role shapes expectations strongly around this person.',
          equal: 'Needs explicit agreements because authority is shared or blurred.',
        },
        communication: {
          direct: 'Repairs better through direct, short conversations.',
          fragile: 'Can be pulled into silence or defensive loops when tension rises.',
          uneven: 'Needs calmer timing because mixed signals can travel through the house quickly.',
        },
        healing: {
          careful: 'Begin repair with one low-pressure conversation and one visible change in routine.',
          mixed: 'Give this person one clear role and one clear reassurance path.',
          supportive: 'Use this person as part of the repair bridge, not as the entire solution.',
        },
        supportNeed: {
          careful: 'Needs gentler handling and clearer boundaries during family pressure.',
          mixed: 'Needs cleaner expectations than emotional guessing.',
          supportive: 'Can help stabilize the house when included early and clearly.',
        },
      },
      relationshipCard: {
        supportive: {
          emotional:
            'This bond can calm the room when both people stay honest about what they need.',
          friction:
            'Friction is manageable here if the house does not overload this pair with everyone else’s emotion.',
          practical:
            'Use this pair as a repair bridge for the home, not as the only place where emotional labor gets dumped.',
          support:
            'This pair carries natural support energy and can steady the house when pressure rises.',
        },
        careful: {
          emotional:
            'This bond is carrying active pressure, so small misunderstandings can feel bigger than they are.',
          friction:
            'This pair needs earlier repair, slower reactions, and clearer boundaries around obligation.',
          practical:
            'Start with shorter, cleaner conversations and remove one invisible duty before asking for emotional repair.',
          support:
            'Support is possible here, but it needs deliberate structure instead of assumption.',
        },
        mixed: {
          emotional:
            'This bond moves between support and strain depending on timing, so clarity matters more than intensity.',
          friction:
            'Friction is not constant, but uneven communication can make the same issue repeat.',
          practical:
            'Give this pair one practical responsibility and one emotional rule so the bond stops carrying mixed signals.',
          support:
            'This pair can help the household, but only when expectations are spoken plainly.',
        },
      },
      dharmaSupport: label =>
        `The dharma support path for ${label} is steadier when duty is named clearly instead of assumed emotionally.`,
      dharmaRepair: {
        pair: (label, guidance) => `Start with ${label}. ${guidance}`,
        theme: guidance => guidance,
      },
      healingGuidance: {
        first: pair =>
          pair
            ? `Start with the ${pair} bond first. Repair the loudest strain before trying to heal the whole house at once.`
            : 'Start with the loudest emotional strain before trying to heal the whole house at once.',
        second: supportPair =>
          supportPair
            ? `Use ${supportPair} as a support bridge, but do not make that pair carry all the family repair work.`
            : 'Use the calmest pair as a support bridge, but do not make them carry all the family repair work.',
        third: theme =>
          theme
            ? `Build one repeated family habit around ${theme.toLowerCase()} so repair becomes structural, not just emotional.`
            : 'Build one repeated family habit so repair becomes structural, not just emotional.',
        fourth:
          'Name one duty rule, one money rule, and one communication rule for the house so pressure has fewer places to hide.',
      },
      title: memberCount => `Family Karma Map for ${memberCount} profiles`,
      subtitle: {
        free:
          'Shared themes and pairwise patterns are grouped into gentle guidance, not blame.',
        premium:
          'Household themes, pairwise guidance, and influence patterns are arranged into practical family repair signals.',
      },
      shareSummary: (memberCount, supportPair, frictionPair, repairPath) =>
        [
          `Predicta Family Karma Map: ${memberCount} profiles`,
          supportPair
            ? `Strongest support pair: ${supportPair}`
            : 'Strongest support pair: still forming',
          frictionPair
            ? `Strongest friction pair: ${frictionPair}`
            : 'Strongest friction pair: still forming',
          repairPath ? `Repair path: ${repairPath}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
    },
  },
  hi: {
    pending: {
      askPrompt:
        'समझाएं कि दो या अधिक सेव प्रोफाइल चुने जाने पर परिवार कर्म नक्शा क्या करेगा. भाषा गोपनीयता-प्रथम, उपयोगी और दोषारोपण-रहित रखें.',
      climate: 'कम से कम दो वास्तविक प्रोफाइल चुने जाने के बाद ही घर का भावनात्मक वातावरण दिखेगा.',
      communication:
        'नक्शे के पास पर्याप्त पारिवारिक संकेत होने पर ही संवाद दरार और सुधार संकेत दिखेंगे.',
      conclusion:
        'वास्तविक पारिवारिक नक्शे के लिए कम से कम दो सेव प्रोफाइल जोड़ें.',
      guidance: [
        'पहले दो या अधिक वास्तविक प्रोफाइल सेव करें.',
        'परिवार कर्म नक्शा देखभाल और सुधार के लिए है, दोष देने के लिए नहीं.',
      ],
      householdSummary:
        'कम से कम दो वास्तविक प्रोफाइल आने पर परिवार कर्म नक्शा खुलता है.',
      privacy:
        'परिवार कर्म नक्शा डिफॉल्ट रूप से निजी रहता है. इसका काम दोहराए गए घरेलू संकेत समझाना है, किसी एक व्यक्ति पर डर या दोष नहीं डालना.',
      subtitle:
        'दो या अधिक सेव प्रोफाइल जोड़ें और दोहराए गए कर्म संकेत, सहारा क्षेत्र और देखभाल मार्गदर्शन देखें.',
      title: 'नक्शा खोलने के लिए पारिवारिक प्रोफाइल जोड़ें.',
    },
    prompts: {
      ask: names =>
        `${names} के लिए परिवार कर्म नक्शा समझाएं. घर का भावनात्मक वातावरण, सबसे मजबूत सहारा जोड़ी, सबसे अधिक घर्षण जोड़ी, दोहराया गया कर्म संकेत, धर्म सुधार मार्ग, देखभाल का भार, संवाद दरार और एक व्यावहारिक सुधार दिशा शामिल करें. भाषा गोपनीयता-प्रथम और दोषरहित रखें.`,
    },
    labels: {
      householdPressure: 'घर का दबाव श्रृंखला',
      repeatedEmotion: value => `${value} चंद्र पारिवारिक संकेत`,
      repeatedNakshatra: value => `${value} कर्म प्रतिध्वनि`,
      sharedSupport: houses => `साझा सहारा भाव ${houses}`,
      sharedWeakness: houses => `साझा संवेदनशील भाव ${houses}`,
      timingOverlap: value => `${value} समय ओवरलैप`,
    },
    summary: {
      climate: {
        balanced:
          'घर का वातावरण मिश्रित है पर संभाला जा सकता है. अलग लोग अलग तरह से शांति लाते हैं, इसलिए तीव्रता से अधिक स्पष्टता जरूरी है.',
        careful:
          'घर का वातावरण स्पष्ट दबाव में है. एक से अधिक रिश्ते एक साथ प्रतिक्रिया कर रहे हैं, इसलिए छोटे ट्रिगर भी जल्दी फैल सकते हैं.',
        supportive:
          'घर के वातावरण में इतनी गर्माहट और उपयोगी सहारा है कि हर बात घरेलू नाटक बने बिना सुधार हो सकता है.',
      },
      communication: {
        balanced:
          'संवाद टूटा हुआ नहीं, पर असमान है. इस घर को साफ समय और कम परतदार बातचीत चाहिए.',
        careful:
          'दबाव के समय संवाद दरार दिखती है, खासकर जब एक व्यक्ति चुप हो जाए और दूसरा दबाव बनाए रखे.',
        supportive:
          'यहां संवाद जल्दी सुधर सकता है, यदि मुद्दे को शुरुआत में नाम दिया जाए और जमा न होने दिया जाए.',
      },
      authority: {
        mixed:
          'अधिकार साझा या अस्पष्ट है, इसलिए अनकही अपेक्षाएं सीधे मतभेद से भी जल्दी घर्षण पैदा कर सकती हैं.',
        ownerWeighted:
          'मालिक प्रोफाइल या जीवनसाथी स्तर बहुत अधिक भावनात्मक अधिकार उठा रहा है, इसलिए घर का संतुलन एक व्यक्ति के मूड पर टिक सकता है.',
        parentWeighted:
          'माता-पिता या बड़े का प्रभाव घर का भावनात्मक तापमान बहुत तय कर रहा है, इसलिए मर्यादा और सीमा दोनों का संतुलन चाहिए.',
      },
      caregiving: {
        high:
          'देखभाल का भार केंद्रित है. एक या दो लोग भावनात्मक सफाई, घरेलू जिम्मेदारी या अदृश्य बोझ अधिक उठा रहे हैं.',
        low:
          'देखभाल का भार हल्का दिखता है. सहारा फिर भी बेहतर हो सकता है, पर घर पूरी तरह एक ही व्यक्ति पर नहीं टिका है.',
        medium:
          'देखभाल का भार साझा है, पर समान नहीं. घर को साफ कहना होगा कि फॉलो-अप, व्यवस्था और भावनात्मक सुधार कौन संभालेगा.',
      },
      ritualMoney: {
        stress:
          'दिनचर्या, धन या घरेलू व्यवस्था तनाव बढ़ाने वाली परत बन सकती है, यदि घर साफ संरचना न रखे.',
        support:
          'दिनचर्या और धन सहारा बन सकते हैं, यदि घर सरल नियम बनाए और उन्हें दोहराए.',
      },
    },
    text: {
      householdSummary: (memberCount, supportPair, frictionPair, repeated) =>
        [
          `${memberCount} सेव प्रोफाइल इस घर के नक्शे में सक्रिय हैं.`,
          supportPair
            ? `अभी सबसे मजबूत सहारा जोड़ी ${supportPair} है.`
            : 'अभी कोई स्पष्ट सहारा जोड़ी नहीं बनी है.',
          frictionPair
            ? `अभी सबसे अधिक घर्षण वाली जोड़ी ${frictionPair} है.`
            : 'अभी कोई प्रमुख दोहराया गया घर्षण जोड़ा नहीं दिख रहा.',
          repeated
            ? `सबसे स्पष्ट दोहराया गया घरेलू संकेत ${repeated} है.`
            : 'घरेलू पैटर्न अभी बन रहा है और और अधिक संकेत चाहता है.',
        ].join(' '),
      privacyNote:
        'इस नक्शे का उपयोग समझ और बेहतर संभाल के लिए करें, दोष, लेबल या किसी एक व्यक्ति पर दूसरे की नियति लादने के लिए नहीं.',
      themeGuidance: {
        dasha:
          'कौन अधिक संघर्ष कर रहा है, इसकी तुलना न करें. समान समय का अर्थ है कि समान दबाव एक साथ तेज हो सकता है.',
        moon:
          'जब एक ही भावनात्मक शैली दोहरती है, तो घर को सलाह या सुधार से पहले नरम गति चाहिए.',
        nakshatra:
          'इस संकेत को विधि, दिनचर्या, सेवा या दोहराए गए पारिवारिक सुधार अभ्यास में बदलना अच्छा रहता है.',
        pressureChain:
          'जब एक से अधिक जोड़ी घर्षण ढो रही हो, तो उपाय अधिक दोष नहीं बल्कि साफ दिनचर्या और साफ सीमाएं होती हैं.',
        strongHouses:
          'इन भावों को घर के सहारा बिंदु बनाएं: दिनचर्या, उत्सव, व्यवस्था और सुधार यहीं से मजबूत होंगे.',
        weakHouses:
          'इन भावों को पारिवारिक देखभाल क्षेत्र मानें. तनाव व्यक्तिगत बनने से पहले यहां संरचना बनाएं.',
      },
      influence: {
        supportive: name =>
          `${name} घर के दबाव के समय अक्सर सहारा केंद्र की तरह काम करता/करती है.`,
        careful: name =>
          `${name} एक या अधिक दबाव श्रृंखलाओं से जुड़ा/जुड़ी है, इसलिए इनके आसपास संभाल अधिक नरम और स्पष्ट रहनी चाहिए.`,
        mixed: name =>
          `${name} मिश्रित प्रभाव क्षेत्र में है और इन्हें सलाह से अधिक साफ अपेक्षाएं चाहिए.`,
        caregiving: {
          anchor: 'अक्सर भावनात्मक सहारा या व्यावहारिक देखभाल का केंद्र बन जाता/जाती है.',
          shared: 'देखभाल साझा करता/करती है, पर दूसरों की जरूरत का अनुमान लगाने पर नहीं छोड़ा जाना चाहिए.',
          strain: 'दिखने से अधिक भावनात्मक या व्यावहारिक सफाई उठा रहा/रही हो सकता/सकती है.',
        },
        authority: {
          owner: 'घर की दिशा या भावनात्मक स्वर जल्दी तय कर देता/देती है.',
          parent: 'माता-पिता या बड़े की भूमिका अपेक्षाओं को इनके आसपास मजबूत करती है.',
          equal: 'अधिकार साझा या धुंधला है, इसलिए साफ समझौते जरूरी हैं.',
        },
        communication: {
          direct: 'छोटी और सीधी बातचीत से जल्दी सुधार हो सकता है.',
          fragile: 'तनाव बढ़ने पर चुप्पी या बचाव वाले चक्र में जा सकता/सकती है.',
          uneven: 'शांत समय की जरूरत है, क्योंकि मिश्रित संकेत पूरे घर में जल्दी फैलते हैं.',
        },
        healing: {
          careful: 'सुधार एक हल्की बातचीत और दिनचर्या के एक दिखने वाले बदलाव से शुरू करें.',
          mixed: 'इन्हें एक साफ भूमिका और एक साफ आश्वासन मार्ग दें.',
          supportive: 'इन्हें सुधार का पुल बनाएं, पूरा समाधान नहीं.',
        },
        supportNeed: {
          careful: 'पारिवारिक दबाव में अधिक नरम संभाल और साफ सीमाएं चाहिए.',
          mixed: 'भावनात्मक अनुमान नहीं, साफ अपेक्षाएं चाहिए.',
          supportive: 'अगर शुरुआत में शामिल किया जाए तो घर को स्थिर कर सकते/सकती हैं.',
        },
      },
      relationshipCard: {
        supportive: {
          emotional:
            'यह रिश्ता कमरे को शांत कर सकता है, यदि दोनों लोग अपनी जरूरतें ईमानदारी से रखें.',
          friction:
            'यहां घर्षण संभालने योग्य है, यदि पूरे घर का भावनात्मक बोझ इसी जोड़ी पर न डाला जाए.',
          practical:
            'इस जोड़ी को घर के सुधार-पुल की तरह उपयोग करें, पूरा भावनात्मक बोझ उठाने वाली जगह की तरह नहीं.',
          support:
            'इस जोड़ी में स्वाभाविक सहारा ऊर्जा है और दबाव के समय घर को थाम सकती है.',
        },
        careful: {
          emotional:
            'यह रिश्ता सक्रिय दबाव में है, इसलिए छोटी गलतफहमी भी अपेक्षा से बड़ी लग सकती है.',
          friction:
            'इस जोड़ी को जल्दी सुधार, धीमी प्रतिक्रिया और कर्तव्य के आसपास साफ सीमा चाहिए.',
          practical:
            'भावनात्मक सुधार मांगने से पहले छोटी साफ बातचीत और एक अदृश्य जिम्मेदारी हटाएं.',
          support:
            'यहां सहारा संभव है, पर अनुमान से नहीं, संरचना से आएगा.',
        },
        mixed: {
          emotional:
            'यह रिश्ता समय के अनुसार सहारा और तनाव दोनों देता है, इसलिए स्पष्टता तीव्रता से अधिक जरूरी है.',
          friction:
            'घर्षण स्थायी नहीं, पर असमान संवाद एक ही मुद्दे को बार-बार लौटा सकता है.',
          practical:
            'इस जोड़ी को एक व्यावहारिक जिम्मेदारी और एक भावनात्मक नियम दें, ताकि संकेत मिश्रित न रहें.',
          support:
            'यह जोड़ी घर की मदद कर सकती है, लेकिन तभी जब अपेक्षाएं साफ कही जाएं.',
        },
      },
      dharmaSupport: label =>
        `${label} के लिए धर्म सहारा तब स्थिर होता है, जब कर्तव्य भावनात्मक अनुमान से नहीं, साफ शब्दों में कहा जाए.`,
      dharmaRepair: {
        pair: (label, guidance) => `${label} से शुरुआत करें. ${guidance}`,
        theme: guidance => guidance,
      },
      healingGuidance: {
        first: pair =>
          pair
            ? `${pair} वाले रिश्ते से शुरुआत करें. पूरे घर को एक साथ ठीक करने से पहले सबसे तेज घर्षण को संभालें.`
            : 'पूरे घर को एक साथ ठीक करने से पहले सबसे तेज घर्षण को संभालें.',
        second: supportPair =>
          supportPair
            ? `${supportPair} को सहारा पुल की तरह रखें, पर पूरे परिवार का सुधार सिर्फ इसी जोड़ी पर न छोड़ें.`
            : 'सबसे शांत जोड़ी को सहारा पुल बनाएं, पर सारा सुधार उन्हीं पर न छोड़ें.',
        third: theme =>
          theme
            ? `${theme.toLowerCase()} के आसपास एक दोहराया जाने वाला पारिवारिक अभ्यास बनाएं, ताकि सुधार सिर्फ भावनात्मक न रहकर संरचनात्मक बने.`
            : 'एक दोहराया जाने वाला पारिवारिक अभ्यास बनाएं, ताकि सुधार सिर्फ भावनात्मक न रहकर संरचनात्मक बने.',
        fourth:
          'घर के लिए एक कर्तव्य नियम, एक धन नियम और एक संवाद नियम तय करें, ताकि दबाव को छिपने की जगह कम मिले.',
      },
      title: memberCount => `${memberCount} प्रोफाइल का परिवार कर्म नक्शा`,
      subtitle: {
        free:
          'साझा संकेत और जोड़ी पैटर्न को नरम मार्गदर्शन में रखा गया है, दोष में नहीं.',
        premium:
          'घरेलू संकेत, जोड़ी मार्गदर्शन और प्रभाव पैटर्न को व्यावहारिक पारिवारिक सुधार संकेतों में रखा गया है.',
      },
      shareSummary: (memberCount, supportPair, frictionPair, repairPath) =>
        [
          `प्रेडिक्टा परिवार कर्म नक्शा: ${memberCount} प्रोफाइल`,
          supportPair
            ? `सबसे मजबूत सहारा जोड़ी: ${supportPair}`
            : 'सबसे मजबूत सहारा जोड़ी: अभी बन रही है',
          frictionPair
            ? `सबसे अधिक घर्षण जोड़ी: ${frictionPair}`
            : 'सबसे अधिक घर्षण जोड़ी: अभी बन रही है',
          repairPath ? `सुधार मार्ग: ${repairPath}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
    },
  },
  gu: {
    pending: {
      askPrompt:
        'સમજાવો કે બે અથવા વધુ સાચવેલી પ્રોફાઇલ પસંદ થયા પછી પરિવાર કર્મ નકશો શું કરશે. ભાષા ગોપનીયતા-પ્રથમ, ઉપયોગી અને દોષારોપણ વિના રાખો.',
      climate: 'ઓછામાં ઓછા બે સાચા પ્રોફાઇલ પસંદ થયા પછી જ ઘરનું ભાવનાત્મક વાતાવરણ દેખાશે.',
      communication:
        'નકશા પાસે પૂરતા પરિવાર સંકેત થયા પછી જ સંવાદ તૂટણ અને સુધાર નોંધો દેખાશે.',
      conclusion:
        'સાચો ઘરેલુ નકશો માંગતા પહેલાં ઓછામાં ઓછા બે સાચવેલી પ્રોફાઇલ ઉમેરો.',
      guidance: [
        'પહેલાં બે અથવા વધુ સાચી પ્રોફાઇલ સાચવો.',
        'પરિવાર કર્મ નકશો કાળજી અને સુધાર માટે છે, દોષારોપણ માટે નહીં.',
      ],
      householdSummary:
        'ઓછામાં ઓછા બે સાચા પ્રોફાઇલ આવ્યા પછી પરિવાર કર્મ નકશો ખૂલે છે.',
      privacy:
        'પરિવાર કર્મ નકશો મૂળભૂત રીતે ખાનગી રહે છે. તેનું કામ ફરી આવતા ઘરેલુ સંકેતો સમજાવવાનું છે, કોઈ એક વ્યક્તિ પર ભય કે દોષ મૂકવાનું નથી.',
      subtitle:
        'બે અથવા વધુ સાચવેલી પ્રોફાઇલ ઉમેરો અને ફરી આવતા કર્મ સંકેતો, સહારો ક્ષેત્રો અને કાળજી માર્ગદર્શન જુઓ.',
      title: 'નકશો ખોલવા માટે પરિવાર પ્રોફાઇલ ઉમેરો.',
    },
    prompts: {
      ask: names =>
        `${names} માટે પરિવાર કર્મ નકશો સમજાવો. ઘરનું ભાવનાત્મક વાતાવરણ, સૌથી મજબૂત સહારો જોડી, સૌથી વધુ ઘર્ષણ જોડી, ફરી આવતો કર્મ સંકેત, ધર્મ સુધાર માર્ગ, કાળજીનો ભાર, સંવાદ તૂટણ અને એક પ્રાયોગિક સુધાર દિશા સામેલ કરો. ભાષા ગોપનીયતા-પ્રથમ અને નિર્દોષ રાખો.`,
    },
    labels: {
      householdPressure: 'ઘરનું દબાણ સાંકળ',
      repeatedEmotion: value => `${value} ચંદ્ર પરિવાર સંકેત`,
      repeatedNakshatra: value => `${value} કર્મ પ્રતિધ્વનિ`,
      sharedSupport: houses => `સાંઝા સહારો ભાવ ${houses}`,
      sharedWeakness: houses => `સાંઝા સંવેદનશીલ ભાવ ${houses}`,
      timingOverlap: value => `${value} સમય આવર્તન`,
    },
    summary: {
      climate: {
        balanced:
          'ઘરનું વાતાવરણ મિશ્ર છે પરંતુ સંભાળી શકાય એવું છે. અલગ લોકો અલગ રીતે શાંતિ લાવે છે, તેથી તીવ્રતા કરતા સ્પષ્ટતા વધુ જરૂરી છે.',
        careful:
          'ઘરનું વાતાવરણ સ્પષ્ટ દબાણમાં છે. એકથી વધુ સંબંધ એકસાથે પ્રતિક્રિયા કરી રહ્યા છે, તેથી નાનાં ટ્રિગર પણ ઝડપથી ફેલાઈ શકે છે.',
        supportive:
          'ઘરમાં એટલું ઉષ્મા અને ઉપયોગી સહારો છે કે દરેક વાત ઘરેલુ નાટક બન્યા વગર સુધરી શકે છે.',
      },
      communication: {
        balanced:
          'સંવાદ તૂટેલો નથી, પરંતુ અસમાન છે. આ ઘરને વધુ સ્વચ્છ સમય અને ઓછી સ્તરવાળી વાતચીત જોઈએ.',
        careful:
          'દબાણ વખતે સંવાદ તૂટણ દેખાય છે, ખાસ કરીને જ્યારે એક વ્યક્તિ મૌન થાય અને બીજી દબાણ વધારતી રહે.',
        supportive:
          'અહીં સંવાદ ઝડપથી સુધરી શકે છે, જો મુદ્દાને શરૂઆતમાં જ નામ આપવામાં આવે.',
      },
      authority: {
        mixed:
          'સત્તા વહેંચાયેલી અથવા અસ્પષ્ટ છે, એટલે અનકહેલી અપેક્ષાઓ સીધા મતભેદ કરતાં પણ વહેલું ઘર્ષણ લાવી શકે છે.',
        ownerWeighted:
          'માલિક પ્રોફાઇલ અથવા જીવનસાથી સ્તર ખૂબ જ ભાવનાત્મક સત્તા લઈ રહ્યું છે, તેથી ઘરનો સંતુલન એક જ વ્યક્તિના સ્વર પર અટકી શકે છે.',
        parentWeighted:
          'માતા-પિતા અથવા વડીલની ઊર્જા ઘરનું ભાવનાત્મક તાપમાન મજબૂતીથી નક્કી કરે છે, તેથી માન અને સીમા બંનેનું સંતુલન જોઈએ.',
      },
      caregiving: {
        high:
          'કાળજીનો ભાર કેન્દ્રિત છે. એક કે બે લોકો ભાવનાત્મક સફાઈ, ઘરેલુ ફરજ અથવા અદૃશ્ય જવાબદારી વધારે ઉઠાવી રહ્યા છે.',
        low:
          'કાળજીનો ભાર હળવો દેખાય છે. સહારો સુધરી શકે છે, પરંતુ ઘર પૂરું એક જ વ્યક્તિ પર ટકેલું નથી.',
        medium:
          'કાળજીનો ભાર વહેંચાયેલો છે, પરંતુ સમાન રીતે નહીં. ઘરએ સ્પષ્ટ કહેવું પડશે કે અનુસરણ, વ્યવસ્થા અને ભાવનાત્મક સુધાર કોણ સંભાળશે.',
      },
      ritualMoney: {
        stress:
          'દિનચર્યા, પૈસા અથવા ઘરેલુ ગોઠવણ તણાવ વધારતી પરત બની શકે છે, જો ઘર સ્પષ્ટ માળખું ન રાખે.',
        support:
          'દિનચર્યા અને પૈસા સહારો બની શકે છે, જો ઘર સરળ નિયમો બનાવે અને તેમને સતત જાળવે.',
      },
    },
    text: {
      householdSummary: (memberCount, supportPair, frictionPair, repeated) =>
        [
          `${memberCount} સાચવેલી પ્રોફાઇલ આ ઘરેલુ નકશામાં સક્રિય છે.`,
          supportPair
            ? `હાલની સૌથી મજબૂત સહારો જોડી ${supportPair} છે.`
            : 'હાલ કોઈ સ્પષ્ટ સહારો જોડી बनी નથી.',
          frictionPair
            ? `હાલની સૌથી વધુ ઘર્ષણ જોડી ${frictionPair} છે.`
            : 'હાલ કોઈ પ્રબળ ફરી આવતી ઘર્ષણ જોડી દેખાતી નથી.',
          repeated
            ? `સૌથી સ્પષ્ટ ફરી આવતો ઘરેલુ સંકેત ${repeated} છે.`
            : 'ઘરેલુ પેટર્ન હજુ બની રહ્યું છે અને વધુ સંકેતો માંગે છે.',
        ].join(' '),
      privacyNote:
        'આ નકશાનો ઉપયોગ સમજ અને સારી સંભાળ માટે કરો, દોષ, લેબલ કે કોઈ એક વ્યક્તિ પર બીજાનું ભાગ્ય લાદવા માટે નહીં.',
      themeGuidance: {
        dasha:
          'કોણ વધુ સંઘર્ષ કરે છે તેની તુલના ન કરો. સમાન સમયનો અર્થ છે કે સમાન દબાણ એકસાથે તેજ થઈ શકે છે.',
        moon:
          'જ્યારે એક જ ભાવનાત્મક શૈલી ફરી આવે, ત્યારે ઘરને સલાહ કે સુધાર પહેલાં વધુ નરમ ગતિ જોઈએ.',
        nakshatra:
          'આ સંકેતને વિધિ, દિનચર્યા, સેવા અથવા ફરી આવતા પરિવાર સુધાર અભ્યાસમાં ફેરવવો સારો રહે છે.',
        pressureChain:
          'જ્યારે એકથી વધુ જોડી ઘર્ષણ વહન કરે, ત્યારે ઉપાય વધુ દોષ નહીં પણ વધુ સ્વચ્છ દિનચર્યા અને વધુ સ્પષ્ટ સીમાઓ છે.',
        strongHouses:
          'આ ભાવોને ઘરનું સહારો કેન્દ્ર બનાવો: દિનચર્યા, ઉજવણી, ગોઠવણ અને સુધાર અહીંથી મજબૂત થશે.',
        weakHouses:
          'આ ભાવોને પરિવાર કાળજી ક્ષેત્ર માનો. તણાવ વ્યક્તિગત બને તે પહેલાં અહીં માળખું બનાવો.',
      },
      influence: {
        supportive: name =>
          `${name} ઘરેલુ દબાણ વધે ત્યારે વારંવાર સહારો કેન્દ્ર તરીકે કામ કરે છે.`,
        careful: name =>
          `${name} એક અથવા વધુ દબાણ સાંકળ સાથે જોડાયેલ છે, તેથી તેમની આસપાસ વ્યવહાર વધુ નરમ અને વધુ સ્પષ્ટ રહેવું જોઈએ.`,
        mixed: name =>
          `${name} મિશ્ર અસર વિસ્તારમાં છે અને તેમને સલાહ કરતાં વધુ સ્વચ્છ અપેક્ષાઓ જોઈએ.`,
        caregiving: {
          anchor: 'વારંવાર ભાવનાત્મક સહારો અથવા પ્રાયોગિક સંભાળનો આધાર બને છે.',
          shared: 'કાળજી વહેંચે છે, પરંતુ બીજાઓ શું ઈચ્છે છે તેનું અનુમાન કરવા પર મૂકવું નહીં.',
          strain: 'દેખાતું હોય તે કરતા વધુ ભાવનાત્મક કે પ્રાયોગિક સફાઈ ઉઠાવી રહ્યો/રહી હોઈ શકે છે.',
        },
        authority: {
          owner: 'ઘરની દિશા અથવા ભાવનાત્મક સ્વર ઝડપથી નક્કી કરે છે.',
          parent: 'માતા-પિતા અથવા વડીલની ભૂમિકા તેમની આસપાસ અપેક્ષાઓ મજબૂત બનાવે છે.',
          equal: 'સત્તા વહેંચાયેલી અથવા ધૂંધળી છે, તેથી સ્પષ્ટ સમજૂતી જરૂરી છે.',
        },
        communication: {
          direct: 'ટૂંકી અને સીધી વાતચીતથી ઝડપથી સુધરી શકે છે.',
          fragile: 'તણાવ વધે ત્યારે મૌન અથવા બચાવ ચક્રમાં જઈ શકે છે.',
          uneven: 'શાંત સમયની જરૂર છે, કારણ કે મિશ્ર સંકેતો આખા ઘરમાં ઝડપથી ફેલાઈ શકે છે.',
        },
        healing: {
          careful: 'સુધાર એક હળવી વાતચીત અને દિનચર્યાના એક દેખાતા બદલાવથી શરૂ કરો.',
          mixed: 'આ વ્યક્તિને એક સ્વચ્છ ભૂમિકા અને એક સ્વચ્છ આશ્વાસન માર્ગ આપો.',
          supportive: 'આ વ્યક્તિને સુધારનો પુલ બનાવો, સંપૂર્ણ ઉકેલ નહીં.',
        },
        supportNeed: {
          careful: 'પરિવાર દબાણમાં વધુ નરમ સંભાળ અને વધુ સ્પષ્ટ સીમાઓ જોઈએ.',
          mixed: 'ભાવનાત્મક અનુમાન નહીં, વધુ સ્પષ્ટ અપેક્ષાઓ જોઈએ.',
          supportive: 'શરૂઆતમાં સામેલ કરવામાં આવે તો ઘર ને સ્થિર કરી શકે છે.',
        },
      },
      relationshipCard: {
        supportive: {
          emotional:
            'આ જોડાણ રૂમને શાંત કરી શકે છે, જો બન્ને લોકો પોતાની જરૂરિયાતો સાચાઈથી કહે.',
          friction:
            'અહીં ઘર્ષણ સંભાળી શકાય એવું છે, જો આખા ઘરની ભાવનાત્મક ફરજ આ જોડી પર ન નાખવામાં આવે.',
          practical:
            'આ જોડીનો ઉપયોગ ઘર સુધારના પુલ તરીકે કરો, આખો ભાવનાત્મક ભાર વહન કરતી જગ્યાની જેમ નહીં.',
          support:
            'આ જોડીમાં સ્વાભાવિક સહારો છે અને દબાણ સમયે ઘર ને થંભાવી શકે છે.',
        },
        careful: {
          emotional:
            'આ જોડાણ સક્રિય દબાણમાં છે, એટલે નાની ગેરસમજ પણ અપેક્ષા કરતા મોટી લાગી શકે છે.',
          friction:
            'આ જોડી ને વહેલો સુધાર, ધીમો પ્રતિસાદ અને ફરજ આસપાસ વધુ સ્પષ્ટ સીમાઓ જોઈએ.',
          practical:
            'ભાવનાત્મક સુધાર માંગતા પહેલાં ટૂંકી સ્વચ્છ વાતચીત અને એક અદૃશ્ય ફરજ દૂર કરો.',
          support:
            'અહીં સહારો શક્ય છે, પરંતુ અનુમાનથી નહીં, માળખાથી આવશે.',
        },
        mixed: {
          emotional:
            'આ જોડાણ સમયમાં સહારો અને તણાવ બંને આપે છે, તેથી તીવ્રતા કરતાં સ્પષ્ટતા વધુ જરૂરી છે.',
          friction:
            'ઘર્ષણ સ્થિર નથી, પરંતુ અસમાન સંવાદ એ જ મુદ્દાને ફરી ફરી પાછો લાવી શકે છે.',
          practical:
            'આ જોડી ને એક પ્રાયોગિક જવાબદારી અને એક ભાવનાત્મક નિયમ આપો, જેથી સંકેત મિશ્ર ન રહે.',
          support:
            'આ જોડી ઘર માટે ઉપયોગી બની શકે છે, પરંતુ અપેક્ષાઓ સ્પષ્ટ રીતે કહેવામાં આવે ત્યારે જ.',
        },
      },
      dharmaSupport: label =>
        `${label} માટેનો ધર્મ સહારો ત્યારે સ્થિર થાય છે જ્યારે ફરજ ભાવનાત્મક અનુમાનથી નહીં, સ્પષ્ટ શબ્દોમાં કહેવામાં આવે.`,
      dharmaRepair: {
        pair: (label, guidance) => `${label} થી શરૂઆત કરો. ${guidance}`,
        theme: guidance => guidance,
      },
      healingGuidance: {
        first: pair =>
          pair
            ? `${pair} ના સંબંધથી શરૂઆત કરો. આખું ઘર એકસાથે સુધારવા પહેલાં સૌથી ઊંચો ઘર્ષણ પહેલો સંભાળો.`
            : 'આખું ઘર એકસાથે સુધારવા પહેલાં સૌથી ઊંચો ઘર્ષણ પહેલો સંભાળો.',
        second: supportPair =>
          supportPair
            ? `${supportPair} ને સહારો પુલ તરીકે રાખો, પરંતુ આખો પરિવાર સુધાર ફક્ત આ જોડી પર ન છોડો.`
            : 'સૌથી શાંત જોડી ને સહારો પુલ બનાવો, પરંતુ આખો સુધાર એમની પર ન છોડો.',
        third: theme =>
          theme
            ? `${theme.toLowerCase()} આસપાસ એક ફરી આવતો પરિવાર અભ્યાસ બનાવો, જેથી સુધાર ફક્ત ભાવનાત્મક નહીં રહે પરંતુ માળખાકીય બને.`
            : 'એક ફરી આવતો પરિવાર અભ્યાસ બનાવો, જેથી સુધાર ફક્ત ભાવનાત્મક નહીં રહે પરંતુ માળખાકીય બને.',
        fourth:
          'ઘર માટે એક ફરજ નિયમ, એક પૈસા નિયમ અને એક સંવાદ નિયમ નક્કી કરો, જેથી દબાણને છુપાવાની જગ્યાઓ ઓછી મળે.',
      },
      title: memberCount => `${memberCount} પ્રોફાઇલનો પરિવાર કર્મ નકશો`,
      subtitle: {
        free:
          'સાંઝા સંકેત અને જોડી પેટર્ન ને નરમ માર્ગદર્શન તરીકે ગોઠવાયા છે, દોષ તરીકે નહીં.',
        premium:
          'ઘરેલુ સંકેત, જોડી માર્ગદર્શન અને અસર પેટર્ન ને પ્રાયોગિક પરિવાર સુધાર સંકેતોમાં ગોઠવાયા છે.',
      },
      shareSummary: (memberCount, supportPair, frictionPair, repairPath) =>
        [
          `પ્રેડિક્ટા પરિવાર કર્મ નકશો: ${memberCount} પ્રોફાઇલ`,
          supportPair
            ? `સૌથી મજબૂત સહારો જોડી: ${supportPair}`
            : 'સૌથી મજબૂત સહારો જોડી: હજુ બની રહી છે',
          frictionPair
            ? `સૌથી વધુ ઘર્ષણ જોડી: ${frictionPair}`
            : 'સૌથી વધુ ઘર્ષણ જોડી: હજુ બની રહી છે',
          repairPath ? `સુધાર માર્ગ: ${repairPath}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
    },
  },
};

export function composeFamilyKarmaMap(
  input: FamilyKarmaInput[] = [],
  options: FamilyKarmaOptions = {},
): FamilyKarmaMap {
  const language = options.language ?? 'en';
  const copy = COPY[language] ?? COPY.en;
  const familyInput = input.filter(item => item.kundli).slice(0, 8);
  const members = familyInput.map((item, index) =>
    toFamilyMemberProfile(item.kundli, item.relationship, index, language),
  );

  if (members.length < 2) {
    return {
      askPrompt: copy.pending.askPrompt,
      actionableHealingGuidance: copy.pending.guidance,
      authorityDependencyPattern: copy.pending.conclusion,
      caregivingBurdenMap: copy.pending.conclusion,
      communicationFractureMap: copy.pending.communication,
      dharmaRepairPath: undefined,
      householdEmotionalClimate: copy.pending.climate,
      householdSummary: copy.pending.householdSummary,
      influenceMatrix: [],
      members,
      privacyNote: copy.pending.privacy,
      relationshipCards: [],
      repeatedThemes: [],
      repeatingKarmaPattern: undefined,
      ritualRoutineMoneyStressMap: copy.pending.conclusion,
      whoAmplifiesPressure: undefined,
      whoCalmsTheHouse: undefined,
      whoNeedsGentlerHandling: undefined,
      fastestHealingPair: undefined,
      repeatedRoutineMoneyTension: undefined,
      shareSummary:
        language === 'hi'
          ? 'प्रेडिक्टा परिवार कर्म नक्शा दो या अधिक सेव प्रोफाइल की प्रतीक्षा कर रहा है.'
          : language === 'gu'
            ? 'પ્રેડિક્ટા પરિવાર કર્મ નકશો બે અથવા વધુ સાચવેલી પ્રોફાઇલની રાહ જોઈ રહ્યું છે.'
            : 'Predicta Family Karma Map is waiting for two or more saved profiles.',
      status: 'pending',
      strongestFrictionPair: undefined,
      strongestSupportPair: undefined,
      subtitle: copy.pending.subtitle,
      title: copy.pending.title,
    };
  }

  const pairCards = buildRelationshipCards(familyInput, members, language, options.depth);
  const repeatedThemes = buildRepeatedThemes(familyInput, members, pairCards, language);
  const supportPair = strongestPair(pairCards, 'supportive');
  const frictionPair = strongestPair(pairCards, 'careful');
  const repeatingKarmaPattern = repeatedThemes[0]?.summary;
  const dharmaRepairPath = buildDharmaRepairPath(pairCards, repeatedThemes, language);
  const householdEmotionalClimate = buildHouseholdEmotionalClimate(pairCards, language);
  const authorityDependencyPattern = buildAuthorityDependencyPattern(members, pairCards, language);
  const caregivingBurdenMap = buildCaregivingBurdenMap(
    familyInput,
    members,
    pairCards,
    language,
  );
  const communicationFractureMap = buildCommunicationFractureMap(
    familyInput,
    pairCards,
    language,
  );
  const ritualRoutineMoneyStressMap = buildRitualRoutineMoneyStressMap(
    familyInput,
    language,
  );
  const influenceMatrix = buildInfluenceMatrix(members, pairCards, language);
  const whoCalmsTheHouse = buildWhoCalmsTheHouse(supportPair?.label, language);
  const whoAmplifiesPressure = buildWhoAmplifiesPressure(
    frictionPair?.label,
    pairCards,
    language,
  );
  const whoNeedsGentlerHandling = buildWhoNeedsGentlerHandling(
    members,
    pairCards,
    language,
  );
  const fastestHealingPair = buildFastestHealingPair(supportPair?.label, language);
  const repeatedRoutineMoneyTension = buildRepeatedRoutineMoneyTension(
    ritualRoutineMoneyStressMap,
    language,
  );
  const actionableHealingGuidance = buildActionableHealingGuidance(
    frictionPair?.label,
    supportPair?.label,
    repeatedThemes[0]?.title,
    language,
  );

  return {
    askPrompt: copy.prompts.ask(members.map(member => member.name).join(', ')),
    actionableHealingGuidance,
    authorityDependencyPattern,
    caregivingBurdenMap,
    communicationFractureMap,
    dharmaRepairPath,
    fastestHealingPair,
    householdEmotionalClimate,
    householdSummary: copy.text.householdSummary(
      members.length,
      supportPair?.label,
      frictionPair?.label,
      repeatedThemes[0]?.title,
    ),
    influenceMatrix,
    members,
    privacyNote: copy.text.privacyNote,
    relationshipCards: pairCards,
    repeatedThemes,
    repeatedRoutineMoneyTension,
    repeatingKarmaPattern,
    ritualRoutineMoneyStressMap,
    shareSummary: copy.text.shareSummary(
      members.length,
      supportPair?.label,
      frictionPair?.label,
      dharmaRepairPath,
    ),
    status: 'ready',
    strongestFrictionPair: frictionPair?.label,
    strongestSupportPair: supportPair?.label,
    subtitle:
      options.depth === 'PREMIUM'
        ? copy.text.subtitle.premium
        : copy.text.subtitle.free,
    title: copy.text.title(members.length),
    whoAmplifiesPressure,
    whoCalmsTheHouse,
    whoNeedsGentlerHandling,
  };
}

function toFamilyMemberProfile(
  kundli: KundliData,
  relationshipOverride: FamilyRelationshipLabel | undefined,
  index: number,
  language: SupportedLanguage,
): FamilyMemberProfile {
  const relationship =
    relationshipOverride ?? kundli.relationshipToOwner ?? (index === 0 ? 'self' : 'other');
  return {
    currentDasha: `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
    id: kundli.id,
    isOwnerProfile: kundli.isOwnerProfile ?? relationship === 'self',
    lagna: kundli.lagna,
    moonSign: kundli.moonSign,
    nakshatra: kundli.nakshatra,
    name: kundli.birthDetails.name,
    relationship,
    relationshipColorToken: kundli.relationshipColorToken ?? 'sage',
    relationshipDisplayLabel: relationshipLabel(relationship, language),
  };
}

function buildRelationshipCards(
  input: FamilyKarmaInput[],
  members: FamilyMemberProfile[],
  language: SupportedLanguage,
  depth: 'FREE' | 'PREMIUM' = 'FREE',
): FamilyRelationshipGuidance[] {
  const cards: FamilyRelationshipGuidance[] = [];
  const copy = COPY[language] ?? COPY.en;

  for (let firstIndex = 0; firstIndex < input.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < input.length; secondIndex += 1) {
      const first = input[firstIndex]?.kundli;
      const second = input[secondIndex]?.kundli;
      const firstMember = members[firstIndex];
      const secondMember = members[secondIndex];

      if (!first || !second || !firstMember || !secondMember) {
        continue;
      }

      const pair = composePairComparison(first, second, { depth });
      const relationshipTone = pair.overallTone;
      const toneCopy = copy.text.relationshipCard[relationshipTone];

      cards.push({
        careArea:
          relationshipTone === 'careful'
            ? toneCopy.practical
            : relationshipTone === 'supportive'
              ? toneCopy.support
              : toneCopy.friction,
        dharmaSupport: copy.text.dharmaSupport(
          `${firstMember.name} / ${secondMember.name}`,
        ),
        emotionalPattern: toneCopy.emotional,
        evidence: pair.freeHighlights.flatMap(item => item.evidence).slice(0, 4),
        firstMemberId: firstMember.id,
        frictionPattern: toneCopy.friction,
        id: `${firstMember.id}-${secondMember.id}`,
        label: `${firstMember.name} (${firstMember.relationshipDisplayLabel}) / ${secondMember.name} (${secondMember.relationshipDisplayLabel})`,
        practicalGuidance: toneCopy.practical,
        secondMemberId: secondMember.id,
        supportPattern: toneCopy.support,
        tone: relationshipTone,
      });
    }
  }

  return cards.slice(0, 16);
}

function buildRepeatedThemes(
  input: FamilyKarmaInput[],
  members: FamilyMemberProfile[],
  pairCards: FamilyRelationshipGuidance[],
  language: SupportedLanguage,
): FamilyKarmaTheme[] {
  const copy = COPY[language] ?? COPY.en;
  const themes: FamilyKarmaTheme[] = [];
  const repeatedMoonSigns = repeatedGroup(members, member => member.moonSign);
  const repeatedNakshatras = repeatedGroup(members, member => member.nakshatra);
  const repeatedMahadashas = repeatedGroup(
    members,
    member => member.currentDasha.split('/')[0] ?? member.currentDasha,
  );
  const sharedWeakHouses = repeatedHouses(
    input.map(item => item.kundli.ashtakavarga.weakestHouses.slice(0, 3)),
  );
  const sharedStrongHouses = repeatedHouses(
    input.map(item => item.kundli.ashtakavarga.strongestHouses.slice(0, 3)),
  );

  if (repeatedMoonSigns) {
    themes.push({
      evidence: [
        `Repeated Moon sign: ${repeatedMoonSigns.key}.`,
        `Members: ${repeatedMoonSigns.items.map(member => member.name).join(', ')}.`,
      ],
      guidance: copy.text.themeGuidance.moon,
      id: `moon-${repeatedMoonSigns.key.toLowerCase()}`,
      members: repeatedMoonSigns.items.map(member => member.id),
      summary:
        language === 'hi'
          ? 'एक जैसा चंद्र संकेत बताता है कि घर एक ही भावनात्मक भाषा में सांत्वना भी देता है और ट्रिगर भी होता है.'
          : language === 'gu'
            ? 'એક જેવો ચંદ્ર સંકેત બતાવે છે કે ઘર એક જ ભાવનાત્મક ભાષામાં સાંત્વના પણ આપે છે અને ટ્રિગર પણ થાય છે.'
            : 'A repeated Moon sign suggests the household reacts through a familiar emotional language, which can comfort and trigger at the same time.',
      title: copy.labels.repeatedEmotion(repeatedMoonSigns.key),
    });
  }

  if (repeatedNakshatras) {
    themes.push({
      evidence: [
        `Repeated nakshatra: ${repeatedNakshatras.key}.`,
        `Members: ${repeatedNakshatras.items.map(member => member.name).join(', ')}.`,
      ],
      guidance: copy.text.themeGuidance.nakshatra,
      id: `nakshatra-${repeatedNakshatras.key.toLowerCase()}`,
      members: repeatedNakshatras.items.map(member => member.id),
      summary:
        language === 'hi'
          ? 'दोहराया गया नक्षत्र अक्सर बताता है कि परिवार की वही कहानी अलग-अलग लोगों से फिर सामने आती है.'
          : language === 'gu'
            ? 'ફરી આવતો નક્ષત્ર ઘણી વાર બતાવે છે કે પરિવારની એ જ વાર્તા અલગ અલગ લોકો દ્વારા ફરી સામે આવે છે.'
            : 'A repeated nakshatra often points to the same family script showing up through different people.',
      title: copy.labels.repeatedNakshatra(repeatedNakshatras.key),
    });
  }

  if (repeatedMahadashas) {
    themes.push({
      evidence: [
        `Repeated Mahadasha: ${repeatedMahadashas.key}.`,
        `Members: ${repeatedMahadashas.items.map(member => member.name).join(', ')}.`,
      ],
      guidance: copy.text.themeGuidance.dasha,
      id: `dasha-${repeatedMahadashas.key.toLowerCase()}`,
      members: repeatedMahadashas.items.map(member => member.id),
      summary:
        language === 'hi'
          ? 'साझी महादशा एक ही जीवन-पाठ को पूरे घर में एक साथ तेज कर सकती है.'
          : language === 'gu'
            ? 'સાંઝી મહાદશા એક જ જીવનપાઠને આખા ઘરમાં એકસાથે તેજ કરી શકે છે.'
            : 'A shared Mahadasha can make the same life lesson echo across the house at the same time.',
      title: copy.labels.timingOverlap(repeatedMahadashas.key),
    });
  }

  if (sharedWeakHouses.length) {
    themes.push({
      evidence: [`Repeated weak houses: ${sharedWeakHouses.join(', ')}.`],
      guidance: copy.text.themeGuidance.weakHouses,
      id: 'shared-sensitive-houses',
      members: members.map(member => member.id),
      summary:
        language === 'hi'
          ? 'दोहराए गए कमज़ोर भाव बताते हैं कि यहीं योजना, धैर्य या भावनात्मक संरचना की सबसे अधिक जरूरत है.'
          : language === 'gu'
            ? 'ફરી આવતા નબળા ભાવ બતાવે છે કે અહીં યોજના, ધૈર્ય અથવા ભાવનાત્મક માળખાની સૌથી વધારે જરૂર છે.'
            : 'Repeated lower-support houses show where the family may need more planning, patience, or emotional structure.',
      title: copy.labels.sharedWeakness(sharedWeakHouses.join(', ')),
    });
  }

  if (sharedStrongHouses.length) {
    themes.push({
      evidence: [`Repeated strong houses: ${sharedStrongHouses.join(', ')}.`],
      guidance: copy.text.themeGuidance.strongHouses,
      id: 'shared-support-houses',
      members: members.map(member => member.id),
      summary:
        language === 'hi'
          ? 'दोहराए गए मजबूत भाव बताते हैं कि घर के पास पहले से कुछ प्राकृतिक सहारा मौजूद है.'
          : language === 'gu'
            ? 'ફરી આવતા મજબૂત ભાવ બતાવે છે કે ઘર પાસે પહેલેથી કેટલીક સ્વાભાવિક સહારો શક્તિ છે.'
            : 'Repeated stronger houses show where the household already has usable support or natural flow.',
      title: copy.labels.sharedSupport(sharedStrongHouses.join(', ')),
    });
  }

  if (pairCards.filter(card => card.tone === 'careful').length >= 2) {
    themes.push({
      evidence: pairCards
        .filter(card => card.tone === 'careful')
        .slice(0, 3)
        .map(card => `${card.label}: ${card.frictionPattern}`),
      guidance: copy.text.themeGuidance.pressureChain,
      id: 'pressure-chain',
      members: members.map(member => member.id),
      summary:
        language === 'hi'
          ? 'एक से अधिक रिश्ते दबाव उठा रहे हैं, इसलिए समस्या व्यक्ति-स्तर से निकलकर घर-स्तर की बन रही है.'
          : language === 'gu'
            ? 'એકથી વધુ સંબંધ દબાણ વહન કરી રહ્યા છે, એટલે સમસ્યા વ્યક્તિ સ્તરથી વધી ઘર સ્તરની બની રહી છે.'
            : 'More than one relationship pair is carrying pressure, so the issue is becoming household-level rather than person-level.',
      title: copy.labels.householdPressure,
    });
  }

  return themes.slice(0, 6);
}

function buildInfluenceMatrix(
  members: FamilyMemberProfile[],
  pairCards: FamilyRelationshipGuidance[],
  language: SupportedLanguage,
): FamilyInfluenceMatrixRow[] {
  const copy = COPY[language] ?? COPY.en;

  return members.map(member => {
    const relatedCards = pairCards.filter(
      card => card.firstMemberId === member.id || card.secondMemberId === member.id,
    );
    const supportiveCount = relatedCards.filter(card => card.tone === 'supportive').length;
    const carefulCount = relatedCards.filter(card => card.tone === 'careful').length;
    const tone: PairComparisonTone =
      supportiveCount > carefulCount
        ? 'supportive'
        : carefulCount > supportiveCount
          ? 'careful'
          : 'mixed';

    return {
      authorityPattern: authorityRole(member, language),
      caregivingRole: caregivingRole(member, carefulCount, language),
      communicationRisk: communicationRisk(tone, language),
      healingKey: copy.text.influence.healing[tone],
      influence:
        tone === 'supportive'
          ? copy.text.influence.supportive(member.name)
          : tone === 'careful'
            ? copy.text.influence.careful(member.name)
            : copy.text.influence.mixed(member.name),
      influenceTone: tone,
      memberId: member.id,
      name: member.name,
      relationshipDisplayLabel: member.relationshipDisplayLabel,
      supportNeed: copy.text.influence.supportNeed[tone],
    };
  });
}

function buildHouseholdEmotionalClimate(
  pairCards: FamilyRelationshipGuidance[],
  language: SupportedLanguage,
): string {
  const copy = COPY[language] ?? COPY.en;
  const supportiveCount = pairCards.filter(card => card.tone === 'supportive').length;
  const carefulCount = pairCards.filter(card => card.tone === 'careful').length;

  if (carefulCount >= supportiveCount + 1) {
    return copy.summary.climate.careful;
  }
  if (supportiveCount > carefulCount) {
    return copy.summary.climate.supportive;
  }
  return copy.summary.climate.balanced;
}

function buildAuthorityDependencyPattern(
  members: FamilyMemberProfile[],
  pairCards: FamilyRelationshipGuidance[],
  language: SupportedLanguage,
): string {
  const copy = COPY[language] ?? COPY.en;
  const ownerSupport = pairCards.filter(
    card =>
      card.tone !== 'mixed' &&
      members.find(member => member.isOwnerProfile && (member.id === card.firstMemberId || member.id === card.secondMemberId)),
  ).length;
  const parentCount = members.filter(member =>
    PARENTISH_RELATIONSHIPS.has(member.relationship),
  ).length;

  if (parentCount >= 2) {
    return copy.summary.authority.parentWeighted;
  }
  if (ownerSupport >= 2) {
    return copy.summary.authority.ownerWeighted;
  }
  return copy.summary.authority.mixed;
}

function buildCaregivingBurdenMap(
  input: FamilyKarmaInput[],
  members: FamilyMemberProfile[],
  pairCards: FamilyRelationshipGuidance[],
  language: SupportedLanguage,
): string {
  const copy = COPY[language] ?? COPY.en;
  const pressureRows = pairCards.filter(card => card.tone === 'careful').length;
  const sensitiveOverlap = repeatedHouses(
    input.map(item => item.kundli.ashtakavarga.weakestHouses.filter(house => CARE_SENSITIVE_HOUSES.has(house)).slice(0, 3)),
  ).length;
  const caregivingProfiles = members.filter(member =>
    ['self', 'spouse', 'mother', 'father', 'daughter', 'son'].includes(member.relationship),
  ).length;
  const score = pressureRows + sensitiveOverlap + (caregivingProfiles >= 3 ? 1 : 0);

  if (score >= 4) {
    return copy.summary.caregiving.high;
  }
  if (score >= 2) {
    return copy.summary.caregiving.medium;
  }
  return copy.summary.caregiving.low;
}

function buildCommunicationFractureMap(
  input: FamilyKarmaInput[],
  pairCards: FamilyRelationshipGuidance[],
  language: SupportedLanguage,
): string {
  const copy = COPY[language] ?? COPY.en;
  const carefulCount = pairCards.filter(card => card.tone === 'careful').length;
  const mercuryMismatchCount = input.reduce((count, current, index) => {
    const next = input[index + 1];
    if (!next?.kundli) {
      return count;
    }
    const currentMercury = planetSign(current.kundli, 'Mercury');
    const nextMercury = planetSign(next.kundli, 'Mercury');
    return currentMercury && nextMercury && currentMercury !== nextMercury ? count + 1 : count;
  }, 0);

  if (carefulCount >= 2 || mercuryMismatchCount >= 2) {
    return copy.summary.communication.careful;
  }
  if (pairCards.filter(card => card.tone === 'supportive').length >= 2) {
    return copy.summary.communication.supportive;
  }
  return copy.summary.communication.balanced;
}

function buildRitualRoutineMoneyStressMap(
  input: FamilyKarmaInput[],
  language: SupportedLanguage,
): string {
  const copy = COPY[language] ?? COPY.en;
  const weakRoutineMoney = repeatedHouses(
    input.map(item =>
      item.kundli.ashtakavarga.weakestHouses
        .filter(house => ROUTINE_HOUSES.has(house) || MONEY_HOUSES.has(house))
        .slice(0, 3),
    ),
  );
  const strongRoutineMoney = repeatedHouses(
    input.map(item =>
      item.kundli.ashtakavarga.strongestHouses
        .filter(house => ROUTINE_HOUSES.has(house) || MONEY_HOUSES.has(house))
        .slice(0, 3),
    ),
  );

  if (weakRoutineMoney.length >= strongRoutineMoney.length && weakRoutineMoney.length > 0) {
    return copy.summary.ritualMoney.stress;
  }
  return copy.summary.ritualMoney.support;
}

function buildActionableHealingGuidance(
  frictionPair: string | undefined,
  supportPair: string | undefined,
  repeatedTheme: string | undefined,
  language: SupportedLanguage,
): string[] {
  const copy = COPY[language] ?? COPY.en;
  return [
    copy.text.healingGuidance.first(frictionPair),
    copy.text.healingGuidance.second(supportPair),
    copy.text.healingGuidance.third(repeatedTheme),
    copy.text.healingGuidance.fourth,
  ];
}

function buildWhoCalmsTheHouse(
  supportPair: string | undefined,
  language: SupportedLanguage,
): string | undefined {
  if (!supportPair) {
    return undefined;
  }

  if (language === 'hi') {
    return `${supportPair} घर को सबसे जल्दी शांत कर सकते हैं.`
  }
  if (language === 'gu') {
    return `${supportPair} ઘરનો તણાવ સૌથી ઝડપથી શાંત કરી શકે છે.`;
  }
  return `${supportPair} is the clearest calming anchor in the house.`;
}

function buildWhoAmplifiesPressure(
  frictionPair: string | undefined,
  pairCards: FamilyRelationshipGuidance[],
  language: SupportedLanguage,
): string | undefined {
  const fallbackPair =
    frictionPair ??
    pairCards.find(card => card.tone === 'mixed')?.label ??
    pairCards[0]?.label;

  if (!fallbackPair) {
    return undefined;
  }

  if (language === 'hi') {
    return `${fallbackPair} में दबाव जल्दी बढ़ सकता है, इसलिए यहां प्रतिक्रिया से पहले ठहराव चाहिए.`;
  }
  if (language === 'gu') {
    return `${fallbackPair} માં દબાણ ઝડપથી વધી શકે છે, તેથી અહીં પ્રતિભાવ પહેલા વિરામ જોઈએ.`;
  }
  return `${fallbackPair} is where pressure can spread fastest unless the tone is slowed down early.`;
}

function buildWhoNeedsGentlerHandling(
  members: FamilyMemberProfile[],
  pairCards: FamilyRelationshipGuidance[],
  language: SupportedLanguage,
): string | undefined {
  const carefulCounts = new Map<string, number>();

  pairCards
    .filter(card => card.tone === 'careful')
    .forEach(card => {
      carefulCounts.set(
        card.firstMemberId,
        (carefulCounts.get(card.firstMemberId) ?? 0) + 1,
      );
      carefulCounts.set(
        card.secondMemberId,
        (carefulCounts.get(card.secondMemberId) ?? 0) + 1,
      );
    });

  const gentlerMember = members
    .map(member => ({
      member,
      score: carefulCounts.get(member.id) ?? 0,
    }))
    .sort((first, second) => second.score - first.score)[0];

  const fallbackMember =
    gentlerMember?.score && gentlerMember.score > 0
      ? gentlerMember.member
      : members.find(member => !member.isOwnerProfile) ?? members[0];

  if (!fallbackMember) {
    return undefined;
  }

  if (language === 'hi') {
    return `${fallbackMember.name} को सबसे नरम और साफ़ व्यवहार की जरूरत है, खासकर दबाव वाले दिनों में.`;
  }
  if (language === 'gu') {
    return `${fallbackMember.name} ને સૌથી નરમ અને સ્પષ્ટ વ્યવહાર જોઈએ, ખાસ કરીને દબાણવાળા દિવસોમાં.`;
  }
  return `${fallbackMember.name} needs the gentlest handling when the house is already under pressure.`;
}

function buildFastestHealingPair(
  supportPair: string | undefined,
  language: SupportedLanguage,
): string | undefined {
  if (!supportPair) {
    return undefined;
  }

  if (language === 'hi') {
    return `${supportPair} सबसे जल्दी संभल और फिर से संतुलित हो सकते हैं.`;
  }
  if (language === 'gu') {
    return `${supportPair} સૌથી ઝડપથી સંભળી અને ફરી સંતુલિત થઈ શકે છે.`;
  }
  return `${supportPair} is the pair most likely to repair quickly after strain.`;
}

function buildRepeatedRoutineMoneyTension(
  ritualRoutineMoneyStressMap: string,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return `दिनचर्या और धन का दोहराया तनाव: ${ritualRoutineMoneyStressMap}`;
  }
  if (language === 'gu') {
    return `દિનચર્યા અને પૈસાનો ફરી આવતો તણાવ: ${ritualRoutineMoneyStressMap}`;
  }
  return `Repeated routine or money tension: ${ritualRoutineMoneyStressMap}`;
}

function buildDharmaRepairPath(
  pairCards: FamilyRelationshipGuidance[],
  repeatedThemes: FamilyKarmaTheme[],
  language: SupportedLanguage,
): string | undefined {
  const copy = COPY[language] ?? COPY.en;
  const carefulPair = pairCards.find(card => card.tone === 'careful');
  if (carefulPair) {
    return copy.text.dharmaRepair.pair(carefulPair.label, carefulPair.practicalGuidance);
  }
  return repeatedThemes[0]
    ? copy.text.dharmaRepair.theme(repeatedThemes[0].guidance)
    : undefined;
}

function strongestPair(
  pairCards: FamilyRelationshipGuidance[],
  tone: PairComparisonTone,
): FamilyRelationshipGuidance | undefined {
  return pairCards.find(card => card.tone === tone);
}

function repeatedGroup(
  members: FamilyMemberProfile[],
  selector: (member: FamilyMemberProfile) => string,
): { key: string; items: FamilyMemberProfile[] } | undefined {
  const groups = new Map<string, FamilyMemberProfile[]>();
  members.forEach(member => {
    const key = selector(member);
    const current = groups.get(key) ?? [];
    current.push(member);
    groups.set(key, current);
  });
  return [...groups.entries()]
    .map(([key, items]) => ({ key, items }))
    .filter(group => group.items.length >= 2)
    .sort((first, second) => second.items.length - first.items.length)[0];
}

function repeatedHouses(houseGroups: number[][]): number[] {
  const counts = new Map<number, number>();
  houseGroups.flat().forEach(house => {
    counts.set(house, (counts.get(house) ?? 0) + 1);
  });
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((first, second) => second[1] - first[1])
    .map(([house]) => house)
    .slice(0, 3);
}

function authorityRole(
  member: FamilyMemberProfile,
  language: SupportedLanguage,
): string {
  const copy = COPY[language] ?? COPY.en;
  if (member.isOwnerProfile || member.relationship === 'spouse' || member.relationship === 'partner') {
    return copy.text.influence.authority.owner;
  }
  if (PARENTISH_RELATIONSHIPS.has(member.relationship)) {
    return copy.text.influence.authority.parent;
  }
  return copy.text.influence.authority.equal;
}

function caregivingRole(
  member: FamilyMemberProfile,
  carefulCount: number,
  language: SupportedLanguage,
): string {
  const copy = COPY[language] ?? COPY.en;
  if (
    ['mother', 'father', 'self', 'spouse', 'partner', 'daughter', 'son'].includes(
      member.relationship,
    ) &&
    carefulCount >= 2
  ) {
    return copy.text.influence.caregiving.strain;
  }
  if (member.isOwnerProfile || member.relationship === 'mother' || member.relationship === 'spouse') {
    return copy.text.influence.caregiving.anchor;
  }
  return copy.text.influence.caregiving.shared;
}

function communicationRisk(
  tone: PairComparisonTone,
  language: SupportedLanguage,
): string {
  const copy = COPY[language] ?? COPY.en;
  if (tone === 'supportive') {
    return copy.text.influence.communication.direct;
  }
  if (tone === 'careful') {
    return copy.text.influence.communication.fragile;
  }
  return copy.text.influence.communication.uneven;
}

function planetSign(kundli: KundliData, planetName: string): string | undefined {
  return kundli.planets.find(planet => planet.name === planetName)?.sign;
}

function relationshipLabel(
  value: FamilyRelationshipLabel,
  language: SupportedLanguage,
): string {
  const english = value
    .split('-')
    .map(part => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');

  if (language === 'hi') {
    const map: Partial<Record<FamilyRelationshipLabel, string>> = {
      self: 'स्वयं',
      spouse: 'जीवनसाथी',
      partner: 'साथी',
      fiance: 'मंगेतर',
      son: 'पुत्र',
      daughter: 'पुत्री',
      mother: 'माता',
      father: 'पिता',
      brother: 'भाई',
      sister: 'बहन',
      cousin: 'कज़िन',
      'maternal-aunt': 'मौसी',
      'paternal-aunt': 'बुआ',
      aunt: 'आंटी',
      'maternal-uncle': 'मामा',
      'paternal-uncle': 'चाचा',
      uncle: 'अंकल',
      grandmother: 'दादी/नानी',
      grandfather: 'दादा/नाना',
      'mother-in-law': 'सास',
      'father-in-law': 'ससुर',
      'sister-in-law': 'ननद/भाभी',
      'brother-in-law': 'देवर/जीजा',
      'aunt-in-law': 'ससुराल की आंटी',
      'uncle-in-law': 'ससुराल के अंकल',
      niece: 'भतीजी/भांजी',
      nephew: 'भतीजा/भांजा',
      friend: 'मित्र',
      'best-friend': 'सबसे करीबी मित्र',
      'co-worker': 'सहकर्मी',
      manager: 'प्रबंधक',
      'business-partner': 'व्यावसायिक साथी',
      mentor: 'मार्गदर्शक',
      student: 'विद्यार्थी',
      other: 'अन्य',
    };
    return map[value] ?? english;
  }

  if (language === 'gu') {
    const map: Partial<Record<FamilyRelationshipLabel, string>> = {
      self: 'સ્વ',
      spouse: 'જીવનસાથી',
      partner: 'સાથી',
      fiance: 'મંગેતર',
      son: 'પુત્ર',
      daughter: 'પુત્રી',
      mother: 'માતા',
      father: 'પિતા',
      brother: 'ભાઈ',
      sister: 'બહેન',
      cousin: 'કઝિન',
      'maternal-aunt': 'માસી',
      'paternal-aunt': 'ફોઈ',
      aunt: 'આન્ટી',
      'maternal-uncle': 'મામા',
      'paternal-uncle': 'કાકા',
      uncle: 'અંકલ',
      grandmother: 'દાદી/નાની',
      grandfather: 'દાદા/નાના',
      'mother-in-law': 'સાસુ',
      'father-in-law': 'સસરા',
      'sister-in-law': 'નણંદ/ભાવી',
      'brother-in-law': 'દેવર/જેઠ/જીજા',
      'aunt-in-law': 'સસરિયાની આન્ટી',
      'uncle-in-law': 'સસરિયાના અંકલ',
      niece: 'ભત્રીજી/ભાણજી',
      nephew: 'ભત્રીજો/ભાણજો',
      friend: 'મિત્ર',
      'best-friend': 'સૌથી નજીકનો મિત્ર',
      'co-worker': 'સહકર્મી',
      manager: 'મેનેજર',
      'business-partner': 'વ્યવસાયિક ભાગીદાર',
      mentor: 'માર્ગદર્શક',
      student: 'વિદ્યાર્થી',
      other: 'અન્ય',
    };
    return map[value] ?? english;
  }

  return english;
}
