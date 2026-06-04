import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_7_DEDUPING_RANKING_SNAPSHOT_AND_REMEDY_PLAN_ENGINE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

const {
  composeKundliKarmaSnapshot,
} = require('../packages/astrology/src/kundliKarmaSnapshotEngine.ts');

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

const roadmap = read('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md');
[
  phaseName,
  'Rank active conditions by strength, confidence, life relevance, and current',
  'strongest Dosh',
  'strongest Yog',
  'strongest Shrap/Rin indicator',
  'top remedy',
  'top 3 active conditions for app UI',
  'Deduplicate overlapping readings.',
  'Consolidate remedies so the same remedy is not repeated across sections.',
  'why this ranked first',
  'Fearful names do not automatically outrank stronger, clearer, more relevant',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 7 roadmap'));

const engineSource = read('packages/astrology/src/kundliKarmaSnapshotEngine.ts');
[
  'composeKundliKarmaSnapshot',
  'strongestDosh',
  'strongestYog',
  'strongestShrapOrRin',
  'topThreeActiveConditions',
  'buildConsolidatedRemedyPlan',
  'do_not_duplicate',
  'severeWeakPenalty',
  'free_karma_dharma_action',
  'premium_structured_remedy',
  'avoid_list',
  'timing_guidance',
].forEach(fragment => assertIncludes(engineSource, fragment, 'Snapshot engine source'));

const crowded = composeKundliKarmaSnapshot(buildKundli('crowded-ranking', [
  p('Sun', 'Pisces', 5, 335, 8),
  p('Moon', 'Gemini', 12, 72, 6),
  p('Mars', 'Libra', 8, 188, 7),
  p('Mercury', 'Sagittarius', 7, 247, 5),
  p('Jupiter', 'Sagittarius', 22, 262, 5),
  p('Venus', 'Aries', 14, 14, 3),
  p('Saturn', 'Pisces', 7, 337, 8),
  p('Rahu', 'Pisces', 9, 339, 8),
  p('Ketu', 'Virgo', 9, 159, 2),
]));

assert.equal(crowded.generatedBy, 'deterministic_contract', 'snapshot is deterministic');
assert.ok(crowded.topThreeActiveConditions.length === 3, 'top 3 app snapshot exists');
assert.ok(crowded.strongestDosh, 'strongest Dosh exists');
assert.ok(crowded.strongestYog, 'strongest Yog exists');
assert.ok(crowded.strongestShrapOrRin, 'strongest Shrap/Rin exists');
assert.ok(crowded.topRemedy, 'top remedy exists');
assert.ok(crowded.noAiRequiredFor.includes('show Kundli Karma snapshot'), 'snapshot has local-memory/no-AI route hint');
assert.ok(crowded.dedupedItemIds.length > 0, 'overlapping Dosh/Shrap/Yog items are deduped');
assertNoDuplicateRemedies(crowded.remedyPlan);
assertRemedyCategories(crowded.remedyPlan);
assertRankingProof(crowded);
assertNoDoNotDuplicateTopRows(crowded);
assertNoFearCopy(crowded, 'crowded snapshot');

const priority = composeKundliKarmaSnapshot(undefined, {
  intelligencePackets: [
    packet('Priority Fixture', [
      item({
        displayName: 'Pitru Shrap',
        module: 'SHRAP',
        ruleId: 'rule-shrap-pitru',
        status: 'weak',
        strength: 'medium',
        confidence: 'partial',
        summary: 'Partial Pitru Shrap indicator.',
      }),
      item({
        displayName: 'Dhana Yog',
        module: 'SUPPORTIVE_YOG',
        ruleId: 'rule-yog-dhana',
        status: 'present',
        strength: 'high',
        confidence: 'clear',
        summary: 'Clear wealth-building support.',
      }),
      item({
        displayName: 'Manglik / Kuja Dosh',
        module: 'DOSH',
        ruleId: 'rule-dosh-manglik-kuja',
        status: 'present',
        strength: 'medium',
        confidence: 'clear',
        summary: 'Clear relationship pressure.',
      }),
    ]),
  ],
});

const dhanaRank = rankFor(priority, 'Dhana Yog');
const pitruRank = rankFor(priority, 'Pitru Shrap');
assert.ok(
  dhanaRank < pitruRank,
  'severe-sounding weak Shrap indicator must rank below clearer stronger supportive Yog',
);
assert.match(
  itemForRank(priority, 'Dhana Yog').whyThisRankedFirst,
  /ranked here because/i,
  'ranking explanation is available for app tooltips and Predicta chat',
);
assert.match(
  itemForRank(priority, 'Dhana Yog').tooltip,
  /Severe-sounding weak labels do not automatically outrank/i,
  'priority tooltip explains anti-fear ranking rule',
);
assertNoDuplicateRemedies(priority.remedyPlan);
assertRemedyCategories(priority.remedyPlan);
assertNoFearCopy(priority, 'priority snapshot');

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- shared snapshot runtime fixture produced strongest Dosh, strongest Yog, strongest Shrap/Rin, top remedy, and top 3 active conditions',
    '- dedupe removed overlapping do_not_duplicate Dosh/Shrap/Yog rows before the app snapshot',
    '- consolidated remedy plan passed no-duplicate rows and includes free, premium, avoid-list, and timing categories',
    '- ranking explanations and tooltips are available for Predicta chat and app tooltips',
    '- severe-sounding weak indicator ranked below clearer stronger evidence',
    '- fear-selling and duplicate-remedy gates passed',
    '',
  ].join('\n'),
);

console.log(
  'Kundli Karma Phase 7 gate passed: dedupe, ranking, snapshot, remedy consolidation, ranking explanations, and anti-fear priority rules are green.',
);

function assertNoDuplicateRemedies(remedyPlan) {
  const keys = remedyPlan.map(row => `${row.category}-${row.title}-${row.description}`.toLowerCase());
  assert.equal(new Set(keys).size, keys.length, 'consolidated remedy plan has no duplicate remedy rows');
}

function assertRemedyCategories(remedyPlan) {
  for (const category of ['free_karma_dharma_action', 'premium_structured_remedy', 'avoid_list', 'timing_guidance']) {
    assert.ok(remedyPlan.some(row => row.category === category), `remedy plan includes ${category}`);
  }
}

function assertRankingProof(snapshot) {
  for (const condition of snapshot.topThreeActiveConditions) {
    assert.ok(condition.whyThisRankedFirst.includes('ranked here because'), `${condition.item.displayName}: ranking explanation exists`);
    assert.ok(condition.tooltip.includes('Rank uses status'), `${condition.item.displayName}: tooltip exists`);
    assert.ok(condition.item.ruleId, `${condition.item.displayName}: rule id exists`);
    assert.ok(condition.item.evidence.length > 0, `${condition.item.displayName}: evidence exists`);
  }
}

function assertNoDoNotDuplicateTopRows(snapshot) {
  for (const condition of snapshot.topThreeActiveConditions) {
    assert.equal(
      condition.item.crossReferences.some(reference => reference.relationship === 'do_not_duplicate'),
      false,
      `${condition.item.displayName}: do_not_duplicate rows should be removed from top snapshot`,
    );
  }
}

function assertNoFearCopy(snapshot, label) {
  const serialized = JSON.stringify(snapshot);
  for (const pattern of [/you are cursed/i, /guaranteed failure/i, /only premium can save/i, /must buy/i, /will ruin/i, /will destroy/i, /death/i]) {
    assert.ok(!pattern.test(serialized), `${label}: banned phrase ${pattern}`);
  }
}

function rankFor(snapshot, displayName) {
  return itemForRank(snapshot, displayName).rank;
}

function itemForRank(snapshot, displayName) {
  const condition = snapshot.rankedConditions.find(row => row.item.displayName === displayName);
  assert.ok(condition, `missing ranked condition ${displayName}`);
  return condition;
}

function packet(subjectName, items) {
  return {
    calculationStatus: 'ready',
    depthContract: {
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
    },
    generatedBy: 'deterministic_contract',
    items,
    missingData: [],
    noAiRequiredFor: ['show custom snapshot'],
    safetyNotes: ['Custom deterministic packet.'],
    subjectName,
    summary: 'Custom ranking packet.',
    topSignals: items.map(row => row.displayName),
    version: 1,
  };
}

function item({
  confidence,
  displayName,
  module,
  ruleId,
  status,
  strength,
  summary,
}) {
  return {
    activation: {
      confidence: confidence === 'clear' ? 'clear' : 'partial',
      summary: confidence === 'clear' ? `${displayName} is currently active.` : `${displayName} is background guidance.`,
    },
    confidence,
    crossReferences: [],
    displayName,
    evidence: [
      {
        chart: 'D1',
        degree: 12,
        description: `${displayName} deterministic fixture evidence.`,
        house: 5,
        id: `${ruleId}-fixture-evidence`,
        kind: module === 'LAL_KITAB' ? 'lal_kitab_house' : 'planet_house',
        planet: 'Jupiter',
        sign: 'Sagittarius',
        weight: strength,
      },
    ],
    id: ruleId.replace('rule-', ''),
    meaningForUser: `${displayName} gives practical guidance without fear.`,
    module,
    reductions: [],
    remedies: [
      {
        depth: 'free',
        description: `${displayName}: one simple karma/dharma action.`,
        id: `${ruleId}-free`,
        safetyNote: 'Safe, low-cost, and non-coercive.',
        title: 'Simple dharma action',
        tradition: 'karma_dharma',
      },
      {
        depth: 'premium',
        description: `${displayName}: structured premium plan with timing and avoid-list.`,
        id: `${ruleId}-premium`,
        safetyNote: 'No fear-based pressure.',
        title: 'Structured premium plan',
        tradition: 'vedic',
      },
    ],
    ruleId,
    sourceReferenceIds: ['source-shreekundli-yog-guide'],
    status,
    strength,
    summary,
    whyPresent: `${displayName} fixture is deterministic.`,
  };
}

function p(name, sign, degree, absoluteLongitude, house) {
  return {
    absoluteLongitude,
    degree,
    house,
    name,
    nakshatra: 'Fixture Star',
    pada: 1,
    retrograde: false,
    sign,
  };
}

function buildKundli(id, planets) {
  return {
    ashtakavarga: {},
    birthDetails: {
      date: '1980-08-22',
      latitude: 19.07,
      longitude: 72.88,
      name: `Snapshot Fixture ${id}`,
      place: 'Mumbai, India',
      time: '06:30',
      timezone: 'Asia/Kolkata',
    },
    calculationMeta: {},
    charts: {},
    dasha: {
      current: {
        antardasha: 'Mars',
        endDate: '2027-01-01',
        mahadasha: 'Saturn',
        startDate: '2025-01-01',
      },
      timeline: [],
    },
    houses: [
      { house: 1, lord: 'Sun', planets: [], sign: 'Leo' },
      { house: 2, lord: 'Mercury', planets: [], sign: 'Virgo' },
      { house: 3, lord: 'Venus', planets: [], sign: 'Libra' },
      { house: 4, lord: 'Mars', planets: [], sign: 'Scorpio' },
      { house: 5, lord: 'Jupiter', planets: [], sign: 'Sagittarius' },
      { house: 6, lord: 'Saturn', planets: [], sign: 'Capricorn' },
      { house: 7, lord: 'Saturn', planets: [], sign: 'Aquarius' },
      { house: 8, lord: 'Jupiter', planets: [], sign: 'Pisces' },
      { house: 9, lord: 'Mars', planets: [], sign: 'Aries' },
      { house: 10, lord: 'Venus', planets: [], sign: 'Taurus' },
      { house: 11, lord: 'Mercury', planets: [], sign: 'Gemini' },
      { house: 12, lord: 'Moon', planets: [], sign: 'Cancer' },
    ],
    id,
    lagna: 'Leo',
    moonSign: 'Taurus',
    nakshatra: 'Fixture Star',
    planets,
    yogas: [],
  };
}
