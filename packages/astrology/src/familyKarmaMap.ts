import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
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
import {
  FAMILY_COMPARISON_MAX_KUNDLIS,
  FAMILY_COMPARISON_MIN_KUNDLIS,
  evaluateFamilyComparisonEligibility,
  getFamilyComparisonEligibilityMessage,
} from './familyVaultComparisonLimits';

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
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c521897718"),
      climate: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2dff81c5d4"),
      communication:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ae93b8ac2e"),
      conclusion:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.cb77e00920"),
      guidance: [
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b615aac328"),
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b86a6df43b"),
      ],
      householdSummary:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c5b9c32001"),
      privacy:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d4839d491d"),
      subtitle:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.10e031b44a"),
      title: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ab57ad01d7"),
    },
    prompts: {
      ask: names =>
        formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.605a3e2e23", [names]),
    },
    labels: {
      householdPressure: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.933797fd4d"),
      repeatedEmotion: value => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.748cf9d9b7", [value]),
      repeatedNakshatra: value => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.cfb412c76b", [value]),
      sharedSupport: houses => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.28cf55b594", [houses]),
      sharedWeakness: houses => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.fea7885435", [houses]),
      timingOverlap: value => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.acb2f2abe3", [value]),
    },
    summary: {
      climate: {
        balanced:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.6fa70f3f4f"),
        careful:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.9a67dd56e3"),
        supportive:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.652e868640"),
      },
      communication: {
        balanced:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1234befd10"),
        careful:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.88275ca9a1"),
        supportive:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.72898a1824"),
      },
      authority: {
        mixed:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.9becd0a5ac"),
        ownerWeighted:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.579cc53237"),
        parentWeighted:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1d782e89a1"),
      },
      caregiving: {
        high:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.eb862889da"),
        low:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.23dfa8f0e0"),
        medium:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ac57bb5e47"),
      },
      ritualMoney: {
        stress:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7b8e51d11c"),
        support:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.78d8e06463"),
      },
    },
    text: {
      householdSummary: (memberCount, supportPair, frictionPair, repeated) =>
        [
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.31e76882d7", [memberCount]),
          supportPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8176930229", [supportPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b9af7fb4d0"),
          frictionPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.459e46530c", [frictionPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e1841a79aa"),
          repeated
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.73ca748a62", [repeated])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.57210d1514"),
        ].join(' '),
      privacyNote:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.48c7956b5e"),
      themeGuidance: {
        dasha:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.eb53c4c79a"),
        moon:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2c835bbb27"),
        nakshatra:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e0814baa1f"),
        pressureChain:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8811382e02"),
        strongHouses:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.69f5997b34"),
        weakHouses:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.fb810829be"),
      },
      influence: {
        supportive: name =>
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.998e344cb3", [name]),
        careful: name =>
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8f7e0ac773", [name]),
        mixed: name =>
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.92ca11c195", [name]),
        caregiving: {
          anchor: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2548348408"),
          shared: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.f8b2d66e60"),
          strain: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b41168595e"),
        },
        authority: {
          owner: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.be69bf04ff"),
          parent: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e07d00984a"),
          equal: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.6864512e61"),
        },
        communication: {
          direct: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1303fb689a"),
          fragile: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1b82ea9e97"),
          uneven: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e46a92489c"),
        },
        healing: {
          careful: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.3bc4972fa6"),
          mixed: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.38f6d55380"),
          supportive: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ca2f8d6223"),
        },
        supportNeed: {
          careful: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b7cb7cf80d"),
          mixed: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d6b2e87779"),
          supportive: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.9c0fcf417c"),
        },
      },
      relationshipCard: {
        supportive: {
          emotional:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.aac68892cb"),
          friction:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2442975c30"),
          practical:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.97a72ecf14"),
          support:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c78dff0b76"),
        },
        careful: {
          emotional:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.3bfd337263"),
          friction:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ab8866c64e"),
          practical:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1e89f0312c"),
          support:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ba441f5739"),
        },
        mixed: {
          emotional:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8f383e3250"),
          friction:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.298d0c45f7"),
          practical:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ba027a6b0f"),
          support:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e47bbcd8ed"),
        },
      },
      dharmaSupport: label =>
        formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2998a77ebd", [label]),
      dharmaRepair: {
        pair: (label, guidance) => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.59b2a28ceb", [label, guidance]),
        theme: guidance => guidance,
      },
      healingGuidance: {
        first: pair =>
          pair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.06378cccf9", [pair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.72f8b68ef0"),
        second: supportPair =>
          supportPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ff35c1eba6", [supportPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7147ef6f37"),
        third: theme =>
          theme
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2a10f27cba", [theme.toLowerCase()])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e0e7d092dc"),
        fourth:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.167960df62"),
      },
      title: memberCount => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1e07e7366c", [memberCount]),
      subtitle: {
        free:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.bd21bfbf29"),
        premium:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e93dc5e215"),
      },
      shareSummary: (memberCount, supportPair, frictionPair, repairPath) =>
        [
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.9a47369f04", [memberCount]),
          supportPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.86ab9b2a28", [supportPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.bc1a1ef1f0"),
          frictionPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.3a26fef142", [frictionPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.335a1f0db1"),
          repairPath ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.10bd5180e1", [repairPath]) : '',
        ]
          .filter(Boolean)
          .join('\n'),
    },
  },
  gu: {
    pending: {
      askPrompt:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.190cf9a541"),
      climate: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.89a2a444cd"),
      communication:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c6b553239d"),
      conclusion:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2684b80dc9"),
      guidance: [
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.81a70fbda7"),
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.4b943cd9bf"),
      ],
      householdSummary:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c40cbc993f"),
      privacy:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.5aec976d87"),
      subtitle:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e9ba350715"),
      title: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.92cf9d926c"),
    },
    prompts: {
      ask: names =>
        formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a65ebcc3bf", [names]),
    },
    labels: {
      householdPressure: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.5773756549"),
      repeatedEmotion: value => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.032fcb9477", [value]),
      repeatedNakshatra: value => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e6fec7bf02", [value]),
      sharedSupport: houses => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.4973204738", [houses]),
      sharedWeakness: houses => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.de903b4536", [houses]),
      timingOverlap: value => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.12cd93eaea", [value]),
    },
    summary: {
      climate: {
        balanced:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.3f9df01ff4"),
        careful:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ddbbec049b"),
        supportive:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.29b3e35390"),
      },
      communication: {
        balanced:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.5101e17277"),
        careful:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8b5b0d6411"),
        supportive:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d8ffe46ada"),
      },
      authority: {
        mixed:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.37020d3aa5"),
        ownerWeighted:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.39c87e678f"),
        parentWeighted:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.70fce16565"),
      },
      caregiving: {
        high:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2021493a80"),
        low:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e31deeb966"),
        medium:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.740e9db824"),
      },
      ritualMoney: {
        stress:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.40f128f977"),
        support:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d87ab5d5e4"),
      },
    },
    text: {
      householdSummary: (memberCount, supportPair, frictionPair, repeated) =>
        [
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a3e95dc26f", [memberCount]),
          supportPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7c636be110", [supportPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2042d982ad"),
          frictionPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ecb07fb39b", [frictionPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.92bd74998c"),
          repeated
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.eacb89a1b9", [repeated])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.76754c385d"),
        ].join(' '),
      privacyNote:
        getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.97ac2aafe5"),
      themeGuidance: {
        dasha:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.6a063d4410"),
        moon:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2988c8e309"),
        nakshatra:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a64383b0fe"),
        pressureChain:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.10ed679498"),
        strongHouses:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c1fa424b05"),
        weakHouses:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.dfd4acf9f2"),
      },
      influence: {
        supportive: name =>
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c42b701a04", [name]),
        careful: name =>
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.bb7d1eaa82", [name]),
        mixed: name =>
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e6bcc90a57", [name]),
        caregiving: {
          anchor: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.89013780ad"),
          shared: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c258e1851d"),
          strain: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a70a7c617f"),
        },
        authority: {
          owner: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.f6d8e65e42"),
          parent: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.eed526b465"),
          equal: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.aa31709c9f"),
        },
        communication: {
          direct: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7552164de4"),
          fragile: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b488365bcb"),
          uneven: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.36a7724cc6"),
        },
        healing: {
          careful: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.51342bc76a"),
          mixed: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.f27d0fa15e"),
          supportive: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d72cf3aba4"),
        },
        supportNeed: {
          careful: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a4b58eeb3e"),
          mixed: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.4488ba11fa"),
          supportive: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.3e096191d5"),
        },
      },
      relationshipCard: {
        supportive: {
          emotional:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7d56fea180"),
          friction:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b719897ad3"),
          practical:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1b1c254b31"),
          support:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.22a85b0436"),
        },
        careful: {
          emotional:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.732da08722"),
          friction:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.78c55e6379"),
          practical:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c0d58130e9"),
          support:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.98319daf13"),
        },
        mixed: {
          emotional:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7202a65ac0"),
          friction:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.9012366130"),
          practical:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2d837fc687"),
          support:
            getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.75fc0fc450"),
        },
      },
      dharmaSupport: label =>
        formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.dbb678a3ce", [label]),
      dharmaRepair: {
        pair: (label, guidance) => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.527e288c4c", [label, guidance]),
        theme: guidance => guidance,
      },
      healingGuidance: {
        first: pair =>
          pair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.6b0596af4b", [pair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8d98278bcd"),
        second: supportPair =>
          supportPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.70673b7271", [supportPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.28ef08aa5d"),
        third: theme =>
          theme
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.319d92f608", [theme.toLowerCase()])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b9a2c7d1ec"),
        fourth:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.0d7976943d"),
      },
      title: memberCount => formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8d04686858", [memberCount]),
      subtitle: {
        free:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.e34435ffee"),
        premium:
          getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.3f19f96067"),
      },
      shareSummary: (memberCount, supportPair, frictionPair, repairPath) =>
        [
          formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7d17453c94", [memberCount]),
          supportPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.33714cfc93", [supportPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a283aca075"),
          frictionPair
            ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a04d36a12c", [frictionPair])
            : getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c1ae58e679"),
          repairPath ? formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.03c38fc2c5", [repairPath]) : '',
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
  const familyInput = input.filter(item => item.kundli);
  const members = familyInput.map((item, index) =>
    toFamilyMemberProfile(item.kundli, item.relationship, index, language),
  );
  const eligibility = evaluateFamilyComparisonEligibility(members.length);

  if (!eligibility.allowed) {
    const eligibilityMessage = getFamilyComparisonEligibilityMessage(eligibility);
    return {
      askPrompt:
        eligibility.reason === 'too_many'
          ? `Help me choose the best ${FAMILY_COMPARISON_MAX_KUNDLIS} saved Kundlis for a focused Family Vault comparison.`
          : copy.pending.askPrompt,
      actionableHealingGuidance:
        eligibility.reason === 'too_many'
          ? [
              `Choose the ${FAMILY_COMPARISON_MAX_KUNDLIS} people most relevant to the current family question.`,
              'Run a second comparison for another branch instead of crowding one reading.',
            ]
          : copy.pending.guidance,
      authorityDependencyPattern: eligibilityMessage,
      caregivingBurdenMap: eligibilityMessage,
      communicationFractureMap:
        eligibility.reason === 'too_many'
          ? 'Predicta blocks 5+ chart comparisons so the family reading does not become noisy or unfair.'
          : copy.pending.communication,
      dharmaRepairPath: undefined,
      householdEmotionalClimate: eligibilityMessage,
      householdSummary:
        eligibility.reason === 'too_many'
          ? 'Too many Kundlis are selected for one Family Vault comparison.'
          : copy.pending.householdSummary,
      influenceMatrix: [],
      members,
      privacyNote:
        eligibility.reason === 'too_many'
          ? 'Your selected Kundlis are preserved. Remove one or more profiles before running the comparison.'
          : copy.pending.privacy,
      relationshipCards: [],
      repeatedThemes: [],
      repeatingKarmaPattern: undefined,
      ritualRoutineMoneyStressMap: eligibilityMessage,
      whoAmplifiesPressure: undefined,
      whoCalmsTheHouse: undefined,
      whoNeedsGentlerHandling: undefined,
      fastestHealingPair: undefined,
      repeatedRoutineMoneyTension: undefined,
      shareSummary:
        eligibility.reason === 'too_many'
          ? `Predicta Family Karma Map supports ${FAMILY_COMPARISON_MIN_KUNDLIS}-${FAMILY_COMPARISON_MAX_KUNDLIS} saved Kundlis at a time.`
          : language === 'hi'
          ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7f90aebb0f")
          : language === 'gu'
            ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.bad0f58797")
            : 'Predicta Family Karma Map is waiting for two or more saved profiles.',
      status: 'pending',
      strongestFrictionPair: undefined,
      strongestSupportPair: undefined,
      subtitle: eligibility.reason === 'too_many' ? eligibilityMessage : copy.pending.subtitle,
      title:
        eligibility.reason === 'too_many'
          ? 'Select a focused family circle'
          : copy.pending.title,
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
          ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.0d8d9ce842")
          : language === 'gu'
            ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2800b852b6")
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
          ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.5d6a7e961f")
          : language === 'gu'
            ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c898f89a60")
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
          ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.6d88c0f851")
          : language === 'gu'
            ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.6c5bc64a3c")
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
          ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c1e43cd17f")
          : language === 'gu'
            ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.56e867e93a")
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
          ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.81c46fa5ec")
          : language === 'gu'
            ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a478a87831")
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
          ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.5c484cdb3a")
          : language === 'gu'
            ? getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.fca328c7ce")
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
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a4320397b1", [supportPair])
  }
  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.9841891ac0", [supportPair]);
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
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.087860d2a7", [fallbackPair]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.60d10ae45d", [fallbackPair]);
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
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.f4375c2b6e", [fallbackMember.name]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7f96bcb1d2", [fallbackMember.name]);
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
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b85232ed9f", [supportPair]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.0020d70de6", [supportPair]);
  }
  return `${supportPair} is the pair most likely to repair quickly after strain.`;
}

function buildRepeatedRoutineMoneyTension(
  ritualRoutineMoneyStressMap: string,
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a81e515d11", [ritualRoutineMoneyStressMap]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.38ea148787", [ritualRoutineMoneyStressMap]);
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
      self: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.bb64a0f542"),
      spouse: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.936c9c3bcf"),
      partner: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8837ebf260"),
      fiance: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.52d171c113"),
      son: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.9d1ada82ab"),
      daughter: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.78ece2bd0d"),
      mother: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.952ce081b6"),
      father: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7898283bd4"),
      brother: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.431a779b03"),
      sister: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a105e9ac83"),
      cousin: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.4fa18ce66f"),
      'maternal-aunt': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d3790369a9"),
      'paternal-aunt': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.0d6687a270"),
      aunt: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8912f1fad2"),
      'maternal-uncle': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8f7ef6000a"),
      'paternal-uncle': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.3189797b9f"),
      uncle: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.22b3724bce"),
      grandmother: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.f0936160c4"),
      grandfather: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a227561e60"),
      'mother-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b89ab7f666"),
      'father-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7f415a0005"),
      'sister-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.9a2320cd39"),
      'brother-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.fab00ab3d8"),
      'aunt-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.93d5a3006d"),
      'uncle-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.0e054dea41"),
      niece: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7971e5b2fa"),
      nephew: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b7267e650e"),
      friend: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.740727fc5f"),
      'best-friend': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2a6a547038"),
      'co-worker': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.10eda161fe"),
      manager: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.5d14c13bb7"),
      'business-partner': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.713b5c7904"),
      mentor: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.106fb7e732"),
      student: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d786fb4e34"),
      other: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.03d46de7bb"),
    };
    return map[value] ?? english;
  }

  if (language === 'gu') {
    const map: Partial<Record<FamilyRelationshipLabel, string>> = {
      self: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.ebe10731db"),
      spouse: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1e0a69e2ab"),
      partner: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d1f17591f7"),
      fiance: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.8bcc7fd9fe"),
      son: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.2eadada20b"),
      daughter: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.76059c124b"),
      mother: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.5efcd5d8a5"),
      father: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.7ed4b48e6b"),
      brother: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a829bd389e"),
      sister: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d163ec2566"),
      cousin: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.f04bd4d78b"),
      'maternal-aunt': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.4d3897d0a8"),
      'paternal-aunt': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.cdcc30cd53"),
      aunt: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.acf44fafce"),
      'maternal-uncle': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.40f2b919e2"),
      'paternal-uncle': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.6af1244650"),
      uncle: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1ac007a855"),
      grandmother: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.6da27c2e12"),
      grandfather: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.1c09a5b0a4"),
      'mother-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.78d8f25b70"),
      'father-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.954cb631b1"),
      'sister-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.c23cbbc5da"),
      'brother-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.f32bb1f317"),
      'aunt-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.83cc3a48e2"),
      'uncle-in-law': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.0d0ec140af"),
      niece: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.3fb6483c01"),
      nephew: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.d1d2203a45"),
      friend: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.55e1390c02"),
      'best-friend': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.a1b7a4c96c"),
      'co-worker': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.937dd2006a"),
      manager: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.42951580b4"),
      'business-partner': getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.702e711fdf"),
      mentor: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.b3b9ca035c"),
      student: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.4b7a886f19"),
      other: getNativeCopy("native.packages.astrology.src.familyKarmaMap.ts.24bec44d1e"),
    };
    return map[value] ?? english;
  }

  return english;
}
