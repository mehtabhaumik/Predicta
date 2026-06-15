import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import Module from 'node:module';
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
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const repoRoot = process.cwd();
const phaseName =
  'PREDICTA_INTELLIGENCE_PHASE_6_ANTI_REPETITION_AND_CONVERSATION_MEMORY';
const auditDir = path.join(repoRoot, 'docs/audits', phaseName);
const failures = [];

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveWorkspaceAlias(
  request,
  parent,
  isMain,
  options,
) {
  const aliases = {
    '@pridicta/astrology': 'packages/astrology/src/index.ts',
    '@pridicta/config': 'packages/config/src/index.ts',
    '@pridicta/config/uiTranslations': 'packages/config/src/uiTranslations.ts',
    '@pridicta/types': 'packages/types/src/index.ts',
  };
  if (aliases[request]) {
    return path.join(repoRoot, aliases[request]);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

[
  'docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md',
  'packages/astrology/src/predictaChatActions.ts',
  'packages/config/src/predictaUx.ts',
  'packages/config/src/translations/predictaUx.json',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md');
[
  phaseName,
  'Stop broken-record behavior.',
  'Track recent response patterns',
  'Summarize prior context compactly',
  'Multi-turn transcript audit shows variation and correct context recall.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'intelligence roadmap phase 6'));

const chatActionsSource = read('packages/astrology/src/predictaChatActions.ts');
[
  'recentResponsePatterns',
  'recentOpenings',
  'recentUpsellActions',
  'activeContext',
  'lastUserGoal',
  'summarizePredictaConversationContext',
  'buildActiveConversationContext',
  'buildOpeningPatternId',
  'buildResponsePatternIds',
  'getPredictaResponseOpening',
  'actionCount > 1',
].forEach(fragment => assertIncludes(chatActionsSource, fragment, 'predictaChatActions'));

const predictaUxSource = read('packages/config/src/predictaUx.ts');
assertIncludes(predictaUxSource, 'getPredictaResponseOpening', 'predictaUx');
assertIncludes(predictaUxSource, 'responseOpenings', 'predictaUx');

const translations = JSON.parse(read('packages/config/src/translations/predictaUx.json'));
for (const language of ['en', 'hi', 'gu']) {
  const openings = translations.copy[language]?.responseOpenings;
  assertGate(Array.isArray(openings), `${language} responseOpenings missing`);
  assertGate(openings.length >= 3, `${language} needs at least 3 openings`);
  openings.forEach((opening, index) => {
    assertGate(
      typeof opening === 'string' && opening.length > 0 && opening.length <= 120,
      `${language} opening ${index} must be short`,
    );
  });
}

const {
  buildPredictaActionReply,
  summarizePredictaConversationContext,
} = require('../packages/astrology/src/predictaChatActions.ts');

const kundli = buildKundli();
let memory;

const firstChart = buildPredictaActionReply({
  chartContext: {
    chartName: 'Rashi Chart',
    chartType: 'D1',
    predictaSchool: 'PARASHARI',
    selectedHouse: 10,
    selectedPlanet: 'Saturn',
  },
  kundli,
  language: 'en',
  memory,
  text: 'Show my chart.',
});
memory = firstChart.memory;

const secondChart = buildPredictaActionReply({
  chartContext: {
    chartName: 'Rashi Chart',
    chartType: 'D1',
    predictaSchool: 'PARASHARI',
    selectedHouse: 10,
    selectedPlanet: 'Saturn',
  },
  kundli,
  language: 'en',
  memory,
  text: 'Show my chart again.',
});
memory = secondChart.memory;

assertGate(firstChart.handled, 'first chart turn must be handled');
assertGate(secondChart.handled, 'second chart turn must be handled');
assertGate(
  firstLine(firstChart.text) !== firstLine(secondChart.text),
  'repeated chart action must vary opening line',
);
assertGate(
  secondChart.text.includes('Context remembered:'),
  'second chart turn must summarize remembered context',
);
assertGate(
  secondChart.text.includes('chart: Rashi Chart'),
  'context summary must remember selected chart',
);
assertGate(
  secondChart.text.includes('house: 10'),
  'context summary must remember selected house',
);
assertGate(
  memory.activeContext?.selectedPlanet === 'Saturn',
  'active context must remember selected planet',
);
assertGate(
  memory.recentResponsePatterns?.includes('action:chart'),
  'memory must track recent response pattern',
);
assertGate(
  memory.recentOpenings?.length >= 2,
  'memory must track recent openings',
);

const firstDasha = buildPredictaActionReply({
  kundli,
  language: 'en',
  memory,
  text: 'Show my mahadasha.',
});
memory = firstDasha.memory;
const secondDasha = buildPredictaActionReply({
  kundli,
  language: 'en',
  memory,
  text: 'Show my mahadasha again.',
});
memory = secondDasha.memory;

assertGate(
  firstDasha.text.includes('Go deeper option:'),
  'first dasha turn may include one upgrade path',
);
assertGate(
  !secondDasha.text.includes('Go deeper option:'),
  'repeated dasha turn must suppress repeated upsell',
);
assertGate(
  summarizePredictaConversationContext(memory).includes('goal: Show my mahadasha again.'),
  'summary helper must expose compact last user goal',
);

const repeatedOpening = [
  firstLine(firstChart.text),
  firstLine(secondChart.text),
  firstLine(firstDasha.text),
  firstLine(secondDasha.text),
];
assertGate(
  new Set(repeatedOpening).size >= 3,
  'multi-turn transcript must show at least three opening variants',
);

if (failures.length) {
  throw new assert.AssertionError({
    message: `${phaseName} failed:\n- ${failures.join('\n- ')}`,
  });
}

mkdirSync(auditDir, { recursive: true });
writeFileSync(
  path.join(auditDir, 'phase-6-manifest.json'),
  `${JSON.stringify(
    {
      phase: phaseName,
      status: 'green',
      strictAudit: true,
      transcriptAssertions: {
        contextRecall: true,
        openingVariation: true,
        patternTracking: true,
        repeatedUpsellSuppression: true,
      },
      transcriptSample: {
        openings: repeatedOpening,
        rememberedContext: summarizePredictaConversationContext(memory),
      },
    },
    null,
    2,
  )}\n`,
);

console.log(`${phaseName}: passed`);

function firstLine(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .find(Boolean);
}

function buildKundli() {
  return {
    id: 'phase-6-kundli',
    ashtakavarga: {
      bhinnashtakavarga: {},
      sav: {
        houses: [
          { house: 1, score: 31 },
          { house: 10, score: 34 },
          { house: 11, score: 36 },
        ],
        strongestHouses: [11, 10],
        weakestHouses: [8, 12],
      },
    },
    birthDetails: {
      date: '1980-08-22',
      name: 'Bhaumik Mehta',
      place: 'Petlad, Gujarat, India',
      time: '06:30',
    },
    dasha: {
      current: {
        antardasha: 'Saturn',
        endDate: '2027-08-22',
        mahadasha: 'Venus',
        startDate: '2024-08-22',
      },
    },
    houses: [
      { house: 1, planets: ['Sun'], sign: 'Leo' },
      { house: 5, planets: ['Moon'], sign: 'Sagittarius' },
      { house: 10, planets: ['Saturn'], sign: 'Taurus' },
      { house: 11, planets: ['Jupiter'], sign: 'Gemini' },
    ],
    lagna: 'Leo',
    moonSign: 'Sagittarius',
    nakshatra: 'Mula',
    planets: [
      {
        degree: 5.5,
        house: 1,
        isCombust: false,
        isRetrograde: false,
        name: 'Sun',
        nakshatra: 'Magha',
        sign: 'Leo',
      },
      {
        degree: 11.8,
        house: 5,
        isCombust: false,
        isRetrograde: false,
        name: 'Moon',
        nakshatra: 'Mula',
        sign: 'Sagittarius',
      },
      {
        degree: 2.7,
        house: 10,
        isCombust: false,
        isRetrograde: false,
        name: 'Saturn',
        nakshatra: 'Krittika',
        sign: 'Taurus',
      },
      {
        degree: 22.4,
        house: 11,
        isCombust: false,
        isRetrograde: false,
        name: 'Jupiter',
        nakshatra: 'Punarvasu',
        sign: 'Gemini',
      },
    ],
  };
}
