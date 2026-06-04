import type {
  KundliKarmaDepthContract,
  KundliKarmaEvidenceKind,
  KundliKarmaFixture,
  KundliKarmaIntelligence,
  KundliKarmaItem,
  KundliKarmaModule,
  KundliKarmaRuleProvenance,
  KundliKarmaSourceReference,
} from '@pridicta/types';

export type {
  KundliKarmaActivation,
  KundliKarmaConfidence,
  KundliKarmaCrossReference,
  KundliKarmaDepth,
  KundliKarmaDepthContract,
  KundliKarmaEvidence,
  KundliKarmaEvidenceKind,
  KundliKarmaFixture,
  KundliKarmaIntelligence,
  KundliKarmaItem,
  KundliKarmaItemStatus,
  KundliKarmaModule,
  KundliKarmaReduction,
  KundliKarmaRemedy,
  KundliKarmaRuleProvenance,
  KundliKarmaSourceReference,
  KundliKarmaStrength,
} from '@pridicta/types';

export const KUNDLI_KARMA_CONTRACT_VERSION = 1;

export const KUNDLI_KARMA_DEPTH_CONTRACT: KundliKarmaDepthContract = {
  free: {
    includesDetailedRemedies: false,
    includesEvidenceSummary: true,
    maxVisibleItems: 3,
  },
  premium: {
    includesDetailedRemedies: true,
    includesEvidenceSummary: true,
    maxVisibleItems: 'all',
  },
};

export const KUNDLI_KARMA_SOURCE_REFERENCES: KundliKarmaSourceReference[] = [
  {
    id: 'source-sanatan-jyoti-dosh-report',
    title: 'Sanatan Jyoti Dosh Report',
    url: 'https://www.sanatanjyoti.com/kundli/dosha-report',
    usage: 'coverage_benchmark',
  },
  {
    id: 'source-omastrology-yog-analysis',
    title: 'OmAstrology Yog Analysis',
    url: 'https://www.omastrology.com/astrology-report/astrology-yoga-analysis/',
    usage: 'coverage_benchmark',
  },
  {
    id: 'source-shreekundli-yog-guide',
    title: 'ShreeKundli Yog Guide',
    url: 'https://www.shreekundli.com/vedic-astrology/yoga',
    usage: 'rule_context',
  },
  {
    id: 'source-ishvaram-lal-kitab',
    title: 'Ishvaram Lal Kitab',
    url: 'https://ishvaram.com/lal-kitab/',
    usage: 'rule_context',
  },
  {
    id: 'source-astrosage-lal-kitab-report',
    title: 'AstroSage Lal Kitab Report',
    url: 'https://www.astrosage.com/free/lal-kitab-report.asp',
    usage: 'coverage_benchmark',
  },
  {
    id: 'source-astrosage-lal-kitab-pdf',
    title: 'AstroSage Lal Kitab PDF',
    url: 'https://www.astrosage.com/lalkitab/lalkitab.pdf',
    usage: 'rule_context',
  },
  {
    id: 'source-onekundli-sample-report',
    title: 'OneKundli Sample Report',
    url: 'https://onekundli.com/wp-content/uploads/2025/05/OneKundli-Sample-Report_organized.pdf',
    usage: 'coverage_benchmark',
  },
  {
    id: 'source-lal-kitab-overview',
    title: 'Lal Kitab Overview',
    url: 'https://en.wikipedia.org/wiki/Lal_Kitab',
    usage: 'safety_context',
  },
];

const PLANET_HOUSE: KundliKarmaEvidenceKind[] = ['planet_house', 'chart_support'];
const PLANET_AXIS: KundliKarmaEvidenceKind[] = ['axis', 'planet_degree', 'chart_support'];
const PLANET_CONJUNCTION: KundliKarmaEvidenceKind[] = [
  'conjunction',
  'planet_house',
  'planet_sign',
  'chart_support',
];
const LORDSHIP: KundliKarmaEvidenceKind[] = ['lordship', 'planet_house', 'chart_support'];
const LAL_KITAB_HOUSE: KundliKarmaEvidenceKind[] = ['lal_kitab_house', 'planet_house'];

export const KUNDLI_KARMA_RULE_PROVENANCE: KundliKarmaRuleProvenance[] = [
  rule('rule-dosh-manglik-kuja', 'DOSH', 'Manglik / Kuja Dosh', 'Dosh', PLANET_HOUSE, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-strong-dosh-manglik', 'fixture-dosh-manglik-present', 'fixture-dosh-manglik-cancelled'], 'implemented'),
  rule('rule-dosh-kaal-sarp', 'DOSH', 'Kaal Sarp Dosh', 'Dosh', PLANET_AXIS, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-dosh-kaal-sarp-present'], 'implemented'),
  rule('rule-dosh-pitra', 'DOSH', 'Pitra Dosh', 'Dosh', LORDSHIP, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-dosh-pitra-weak'], 'implemented'),
  rule('rule-dosh-shrapit', 'DOSH', 'Shrapit Dosh', 'Dosh', PLANET_CONJUNCTION, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-overlap-shrapit-dedupe', 'fixture-dosh-shrapit-present'], 'implemented'),
  rule('rule-dosh-guru-chandal', 'DOSH', 'Guru Chandal Dosh', 'Dosh', PLANET_CONJUNCTION, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-dosh-guru-chandal-present'], 'implemented'),
  rule('rule-dosh-grahan', 'DOSH', 'Grahan Dosh', 'Dosh', PLANET_CONJUNCTION, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-dosh-grahan-present'], 'implemented'),
  rule('rule-dosh-kemadruma', 'DOSH', 'Kemadruma Dosh', 'Dosh', ['planet_house', 'chart_support'], [
    'source-sanatan-jyoti-dosh-report',
    'source-shreekundli-yog-guide',
  ], ['fixture-dosh-kemadruma-present'], 'implemented'),
  rule('rule-dosh-vish', 'DOSH', 'Vish Dosh', 'Dosh', PLANET_CONJUNCTION, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-dosh-vish-weak'], 'implemented'),
  rule('rule-dosh-angarak', 'DOSH', 'Angarak Dosh', 'Dosh', PLANET_CONJUNCTION, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-dosh-angarak-present'], 'implemented'),
  rule('rule-dosh-daridra', 'DOSH', 'Daridra Dosh', 'Dosh', LORDSHIP, [
    'source-sanatan-jyoti-dosh-report',
    'source-shreekundli-yog-guide',
  ], ['fixture-dosh-daridra-weak'], 'implemented'),
  rule('rule-dosh-paap-kartari', 'DOSH', 'Paap Kartari Dosh', 'Dosh', ['planet_house', 'aspect'], [
    'source-sanatan-jyoti-dosh-report',
    'source-shreekundli-yog-guide',
  ], ['fixture-dosh-paap-kartari-present'], 'implemented'),
  rule('rule-dosh-arishta-balarishta', 'DOSH', 'Arishta / Balarishta Dosh', 'Dosh', [
    'planet_house',
    'lordship',
    'chart_support',
  ], ['source-sanatan-jyoti-dosh-report'], ['fixture-dosh-arishta-needs-data'], 'needs_data', [
    'High-safety rule family. Later phases must avoid medical, death, or certainty claims.',
  ]),
  rule('rule-dosh-nadi-compatibility-only', 'DOSH', 'Nadi Dosh', 'Dosh', ['context_boundary'], [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-dosh-nadi-blocked-context'], 'blocked_context', ['Single-person Kundli Karma must not activate Nadi Dosh.']),
  rule('rule-shrap-pitru', 'SHRAP', 'Pitru Shrap', 'Shrap', LORDSHIP, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-shrap-pitru-present'], 'implemented'),
  rule('rule-shrap-matru', 'SHRAP', 'Matru Shrap', 'Shrap', LORDSHIP, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-strong-shrap-indicator', 'fixture-shrap-matru-weak'], 'implemented'),
  rule('rule-shrap-guru', 'SHRAP', 'Guru Shrap', 'Shrap', LORDSHIP, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-shrap-guru-present'], 'implemented'),
  rule('rule-shrap-sarpa-naga', 'SHRAP', 'Sarpa / Naga Shrap', 'Shrap', PLANET_AXIS, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-shrap-sarpa-naga-present'], 'implemented'),
  rule('rule-shrap-preta', 'SHRAP', 'Preta Shrap', 'Shrap', ['missing_data'], [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-needs-data-preta-shrap'], 'needs_data', [
    'Must remain needs_data until deterministic evidence and safety language are approved.',
  ]),
  rule('rule-shrap-bhratri-bandhu', 'SHRAP', 'Bhratri / Bandhu Shrap', 'Shrap', LORDSHIP, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-shrap-bhratri-bandhu-weak'], 'implemented'),
  rule('rule-shrap-stree-patni', 'SHRAP', 'Stree / Patni Shrap', 'Shrap', LORDSHIP, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-shrap-stree-patni-present'], 'implemented'),
  rule('rule-shrap-deva-brahma', 'SHRAP', 'Deva / Brahma Shrap', 'Shrap', LORDSHIP, [
    'source-sanatan-jyoti-dosh-report',
  ], ['fixture-shrap-deva-brahma-weak'], 'implemented'),
  rule('rule-yog-raja', 'SUPPORTIVE_YOG', 'Raja Yog', 'Yog', LORDSHIP, [
    'source-omastrology-yog-analysis',
    'source-shreekundli-yog-guide',
  ], []),
  rule('rule-yog-dhana', 'SUPPORTIVE_YOG', 'Dhana Yog', 'Yog', LORDSHIP, [
    'source-omastrology-yog-analysis',
    'source-shreekundli-yog-guide',
  ], ['fixture-supportive-yog-dhana']),
  rule('rule-yog-gajakesari', 'SUPPORTIVE_YOG', 'Gajakesari Yog', 'Yog', PLANET_CONJUNCTION, [
    'source-omastrology-yog-analysis',
    'source-shreekundli-yog-guide',
  ], []),
  rule('rule-yog-panch-mahapurush', 'SUPPORTIVE_YOG', 'Panch Mahapurush Yog', 'Yog', [
    'planet_house',
    'planet_sign',
    'chart_support',
  ], ['source-shreekundli-yog-guide'], []),
  rule('rule-yog-budhaditya', 'SUPPORTIVE_YOG', 'Budhaditya Yog', 'Yog', PLANET_CONJUNCTION, [
    'source-omastrology-yog-analysis',
    'source-shreekundli-yog-guide',
  ], []),
  rule('rule-yog-challenging-kemadruma', 'CHALLENGING_YOG', 'Kemadruma Yog', 'Yog', [
    'planet_house',
    'chart_support',
  ], ['source-shreekundli-yog-guide'], ['fixture-challenging-yog-kemadruma']),
  rule('rule-yog-challenging-shrapit', 'CHALLENGING_YOG', 'Shrapit Yog', 'Yog', PLANET_CONJUNCTION, [
    'source-shreekundli-yog-guide',
  ], ['fixture-overlap-shrapit-dedupe']),
  rule('rule-lal-kitab-planet-house', 'LAL_KITAB', 'Lal Kitab planet-in-house reading', 'Lal Kitab', LAL_KITAB_HOUSE, [
    'source-ishvaram-lal-kitab',
    'source-astrosage-lal-kitab-report',
    'source-astrosage-lal-kitab-pdf',
  ], []),
  rule('rule-lal-kitab-rin', 'LAL_KITAB', 'Lal Kitab Rin / debt indicators', 'Lal Kitab', LAL_KITAB_HOUSE, [
    'source-ishvaram-lal-kitab',
    'source-astrosage-lal-kitab-report',
    'source-onekundli-sample-report',
  ], ['fixture-lal-kitab-rin-upay']),
  rule('rule-lal-kitab-upay', 'LAL_KITAB', 'Lal Kitab planet-wise upay', 'Lal Kitab', LAL_KITAB_HOUSE, [
    'source-ishvaram-lal-kitab',
    'source-astrosage-lal-kitab-pdf',
  ], ['fixture-lal-kitab-rin-upay']),
];

export const KUNDLI_KARMA_FIXTURES: KundliKarmaFixture[] = [
  fixture('fixture-clean-no-alert', 'Clean no-alert chart', 'clean_no_alert', {
    calculationStatus: 'ready',
    items: [
      item({
        displayName: 'Kundli Karma baseline',
        id: 'clean-no-alert-baseline',
        module: 'DOSH',
        ruleId: 'rule-dosh-manglik-kuja',
        status: 'not_present',
        summary: 'No major Dosh signal is raised in this fixture.',
        whyPresent: 'The tested Dosh evidence is not present in this clean fixture.',
      }),
    ],
    missingData: [],
    noAiRequiredFor: ['show clean Kundli Karma snapshot'],
    summary: 'No major Kundli Karma alert is raised by this deterministic fixture.',
    topSignals: ['No major Dosh alert'],
  }),
  fixture('fixture-strong-dosh-manglik', 'Strong Dosh chart', 'strong_dosh', {
    items: [
      item({
        displayName: 'Manglik / Kuja Dosh',
        evidenceKind: 'planet_house',
        id: 'strong-manglik-dosh',
        module: 'DOSH',
        planet: 'Mars',
        ruleId: 'rule-dosh-manglik-kuja',
        status: 'present',
        strength: 'high',
        summary: 'Mars pressure is strongly visible in the relationship-delivery houses.',
        whyPresent: 'Mars is placed in a tested Manglik house with D1 support.',
      }),
    ],
    summary: 'This fixture proves a strong Dosh item can carry exact evidence and calm remedy framing.',
    topSignals: ['Manglik / Kuja Dosh'],
  }),
  fixture('fixture-strong-shrap-indicator', 'Strong Shrap indicator chart', 'strong_shrap_indicator', {
    items: [
      item({
        displayName: 'Matru Shrap',
        evidenceKind: 'lordship',
        id: 'strong-matru-shrap-indicator',
        module: 'SHRAP',
        planet: 'Moon',
        ruleId: 'rule-shrap-matru',
        status: 'weak',
        strength: 'medium',
        summary: 'A maternal-line karmic pressure indicator is visible but must be read gently.',
        whyPresent: 'Moon and fourth-house evidence require review before stronger language is used.',
      }),
    ],
    summary: 'This fixture proves Shrap output remains indicator-based rather than certainty-based.',
    topSignals: ['Matru Shrap indicator'],
  }),
  fixture('fixture-supportive-yog-dhana', 'Supportive Yog chart', 'supportive_yog', {
    items: [
      item({
        displayName: 'Dhana Yog',
        evidenceKind: 'lordship',
        id: 'supportive-dhana-yog',
        module: 'SUPPORTIVE_YOG',
        planet: 'Jupiter',
        ruleId: 'rule-yog-dhana',
        status: 'present',
        strength: 'high',
        summary: 'Resource-building support is visible through wealth-house connections.',
        whyPresent: 'Wealth-house lordship evidence supports a Dhana Yog contract item.',
      }),
    ],
    summary: 'This fixture proves supportive Yog output can be predictive without becoming a lesson.',
    topSignals: ['Dhana Yog'],
  }),
  fixture('fixture-challenging-yog-kemadruma', 'Challenging Yog chart', 'challenging_yog', {
    items: [
      item({
        displayName: 'Kemadruma Yog',
        evidenceKind: 'chart_support',
        id: 'challenging-kemadruma-yog',
        module: 'CHALLENGING_YOG',
        planet: 'Moon',
        ruleId: 'rule-yog-challenging-kemadruma',
        status: 'present',
        strength: 'medium',
        summary: 'Moon support needs deliberate rebuilding through routine and reliable support.',
        whyPresent: 'The fixture marks Moon isolation evidence for the later engine.',
      }),
    ],
    summary: 'This fixture proves challenging Yog output can guide without fear language.',
    topSignals: ['Kemadruma Yog'],
  }),
  fixture('fixture-lal-kitab-rin-upay', 'Lal Kitab Rin and upay chart', 'lal_kitab_rin_upay', {
    items: [
      item({
        displayName: 'Lal Kitab Rin / debt indicator',
        evidenceKind: 'lal_kitab_house',
        id: 'lal-kitab-rin-upay',
        module: 'LAL_KITAB',
        planet: 'Saturn',
        remedies: [
          {
            depth: 'free',
            description: 'Practice one safe service action consistently before adding another remedy.',
            id: 'lal-kitab-free-one-remedy',
            safetyNote: 'One safe remedy at a time; do not mix remedy lists.',
            title: 'One steady service remedy',
            tradition: 'lal_kitab',
          },
        ],
        ruleId: 'rule-lal-kitab-rin',
        status: 'present',
        strength: 'medium',
        summary: 'A practical Lal Kitab remedy path is available in this fixture.',
        whyPresent: 'The fixture marks planet-in-house Lal Kitab evidence for later engine rules.',
      }),
    ],
    summary: 'This fixture proves Lal Kitab output stays separate and remedy-safe.',
    topSignals: ['Lal Kitab Rin indicator'],
  }),
  fixture('fixture-overlap-shrapit-dedupe', 'Overlapping Shrapit dedupe chart', 'overlap_dedupe', {
    items: [
      item({
        crossReferences: [
          {
            itemId: 'overlap-shrapit-yog',
            module: 'CHALLENGING_YOG',
            note: 'Same Saturn-Rahu evidence; do not duplicate the full reading.',
            relationship: 'do_not_duplicate',
            ruleId: 'rule-yog-challenging-shrapit',
          },
        ],
        displayName: 'Shrapit Dosh',
        evidenceKind: 'conjunction',
        id: 'overlap-shrapit-dosh',
        module: 'DOSH',
        planet: 'Saturn',
        relatedPlanet: 'Rahu',
        ruleId: 'rule-dosh-shrapit',
        status: 'present',
        strength: 'high',
        summary: 'Saturn-Rahu pressure should be read once, then cross-referenced across modules.',
        whyPresent: 'The fixture marks shared Saturn-Rahu evidence for Dosh and challenging Yog dedupe.',
      }),
    ],
    summary: 'This fixture proves overlapping Shrapit evidence must be deduped across modules.',
    topSignals: ['Shrapit cross-reference'],
  }),
  fixture('fixture-needs-data-preta-shrap', 'Needs-data Shrap fixture', 'needs_data', {
    calculationStatus: 'needs_data',
    items: [
      item({
        displayName: 'Preta Shrap',
        evidenceKind: 'missing_data',
        id: 'needs-data-preta-shrap',
        module: 'SHRAP',
        ruleId: 'rule-shrap-preta',
        status: 'needs_data',
        strength: 'none',
        summary: 'This Shrap indicator is known but not implemented until safe deterministic evidence exists.',
        whyPresent: 'The rule is intentionally pending; Predicta must not fake a reading.',
      }),
    ],
    missingData: ['approved deterministic Preta Shrap rule evidence'],
    summary: 'This fixture proves needs_data output is honest and non-predictive.',
    topSignals: ['Preta Shrap pending'],
  }),
  fixture('fixture-no-ai-local-memory', 'No-AI local memory fixture', 'no_ai_local_memory', {
    items: [
      item({
        displayName: 'Kundli Karma local memory summary',
        evidenceKind: 'context_boundary',
        id: 'no-ai-local-memory-summary',
        module: 'DOSH',
        ruleId: 'rule-dosh-manglik-kuja',
        status: 'not_present',
        summary: 'Predicta can answer a snapshot question from deterministic contract data.',
        whyPresent: 'No AI is required when the deterministic Kundli Karma packet is already available.',
      }),
    ],
    noAiRequiredFor: [
      'show top Kundli Karma signals',
      'explain Dosh/Shrap/Yog/Lal Kitab status from deterministic packet',
      'show missing data honestly',
    ],
    summary: 'This fixture proves Predicta can answer from local deterministic memory without spending AI.',
    topSignals: ['Local memory answer available'],
  }),
];

export function getKundliKarmaRuleProvenance(ruleId: string): KundliKarmaRuleProvenance | undefined {
  return KUNDLI_KARMA_RULE_PROVENANCE.find(ruleItem => ruleItem.id === ruleId);
}

export function getKundliKarmaFixture(fixtureId: string): KundliKarmaFixture | undefined {
  return KUNDLI_KARMA_FIXTURES.find(fixtureItem => fixtureItem.id === fixtureId);
}

function rule(
  id: string,
  module: KundliKarmaModule,
  displayName: string,
  canonicalTerm: KundliKarmaRuleProvenance['canonicalTerm'],
  requiredInputs: KundliKarmaEvidenceKind[],
  sourceReferenceIds: string[],
  fixtureIds: string[],
  implementationStatus: KundliKarmaRuleProvenance['implementationStatus'] = fixtureIds.length
    ? 'contract_fixture'
    : 'pending_engine',
  variationNotes: string[] = [],
): KundliKarmaRuleProvenance {
  return {
    canonicalTerm,
    displayName,
    fixtureIds,
    id,
    implementationStatus,
    module,
    requiredInputs,
    sourceReferenceIds,
    variationNotes,
  };
}

function fixture(
  id: string,
  label: string,
  purpose: KundliKarmaFixture['purpose'],
  expected: Partial<KundliKarmaIntelligence>,
): KundliKarmaFixture {
  return {
    deterministic: true,
    expected: {
      calculationStatus: expected.calculationStatus ?? 'ready',
      depthContract: KUNDLI_KARMA_DEPTH_CONTRACT,
      generatedBy: 'deterministic_contract',
      items: expected.items ?? [],
      missingData: expected.missingData ?? [],
      noAiRequiredFor: expected.noAiRequiredFor ?? [],
      safetyNotes: [
        'No curse language.',
        'No guaranteed outcomes.',
        'No expensive fear-based remedy pressure.',
      ],
      subjectName: 'Phase 2 Fixture',
      summary: expected.summary ?? 'Deterministic Kundli Karma fixture.',
      topSignals: expected.topSignals ?? [],
      version: KUNDLI_KARMA_CONTRACT_VERSION,
    },
    id,
    label,
    purpose,
  };
}

function item({
  crossReferences = [],
  displayName,
  evidenceKind = 'planet_house',
  id,
  module,
  planet,
  relatedPlanet,
  remedies = [],
  ruleId,
  status,
  strength = 'medium',
  summary,
  whyPresent,
}: {
  crossReferences?: KundliKarmaItem['crossReferences'];
  displayName: string;
  evidenceKind?: KundliKarmaEvidenceKind;
  id: string;
  module: KundliKarmaModule;
  planet?: string;
  relatedPlanet?: string;
  remedies?: KundliKarmaItem['remedies'];
  ruleId: string;
  status: KundliKarmaItem['status'];
  strength?: KundliKarmaItem['strength'];
  summary: string;
  whyPresent: string;
}): KundliKarmaItem {
  const sourceReferenceIds = getKundliKarmaRuleProvenance(ruleId)?.sourceReferenceIds ?? [];
  return {
    activation: {
      confidence: status === 'needs_data' ? 'uncertain' : 'partial',
      summary:
        status === 'needs_data'
          ? 'Activation is not interpreted until deterministic evidence exists.'
          : 'Activation will be resolved by later dasha/transit engines.',
    },
    confidence: status === 'present' ? 'clear' : 'partial',
    crossReferences,
    displayName,
    evidence: [
      {
        chart: evidenceKind === 'lal_kitab_house' ? undefined : 'D1',
        description: whyPresent,
        house: status === 'not_present' || status === 'needs_data' ? undefined : 7,
        id: `${id}-evidence-1`,
        kind: evidenceKind,
        planet,
        relatedPlanet,
        sign: status === 'not_present' || status === 'needs_data' ? undefined : 'Aries',
        weight: strength,
      },
    ],
    id,
    meaningForUser:
      status === 'needs_data'
        ? 'Predicta does not give a reading until the missing evidence is available.'
        : 'This contract item must become direct guidance in later interpretation phases.',
    module,
    reductions: [],
    remedies: remedies.length
      ? remedies
      : [
          {
            depth: 'free',
            description: 'Use one simple dharma-based action and avoid fear-based remedy pressure.',
            id: `${id}-free-remedy`,
            safetyNote: 'Safe, low-cost, and non-coercive.',
            title: 'Simple dharma action',
            tradition: 'karma_dharma',
          },
        ],
    ruleId,
    sourceReferenceIds,
    status,
    strength,
    summary,
    whyPresent,
  };
}
