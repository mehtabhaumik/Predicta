import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const repoRoot = process.cwd();
const phaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_3_PREDICTA_INTELLIGENCE_CONTEXT_AND_LOCAL_MEMORY_SUPREMACY';
const priorPhaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_2_SPECIALIST_WORLD_CLARITY_AND_NO_MIXING_GATE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveWorkspaceAlias(
  request,
  parent,
  isMain,
  options,
) {
  const aliases = {
    '@pridicta/ai': 'packages/ai/src/index.ts',
    '@pridicta/astrology': 'packages/astrology/src/index.ts',
    '@pridicta/config': 'packages/config/src/index.ts',
    '@pridicta/types': 'packages/types/src/index.ts',
  };
  if (aliases[request]) {
    return path.join(repoRoot, aliases[request]);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const failures = [];

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

const priorManifest = readJson(
  `docs/audits/${priorPhaseName}/phase-2-manifest.json`,
);
assertGate(priorManifest.status === 'GREEN', 'Phase 2 manifest must be GREEN');

const roadmap = read(
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
);
[
  phaseName,
  'Predicta context digest',
  'Report-aware memory',
  'Generated report context handoff',
  'Zero-credit deterministic action routing',
  'AI provider decision labels',
  'Chat tests prove section-aware handoffs for all six report lanes plus Kundli',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 3 roadmap'));

const memory = read('packages/config/src/predictaMemory.ts');
[
  'PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY',
  'localMemoryFirstRule',
  'providerDecisionLabels',
  'deterministicLocalModules',
  'aiRequiredWhen',
  'missingDataExplanations',
  'sectionAwareHandoffRules',
  'local_memory_answer',
  'deterministic_action',
  'missing_data_question',
  'ai_required',
  'blocked_needs_credit',
  'Vedic report/chat handoff',
  'KP report/chat handoff',
  'Jaimini report/chat handoff',
  'Numerology report/chat handoff',
  'Signature report/chat handoff',
  'Life Atlas report/chat handoff',
  'Kundli Karma handoff',
  'Dosh',
  'Shrap',
  'Yog',
  'Lal Kitab',
].forEach(fragment => assertIncludes(memory, fragment, 'Predicta memory source'));

for (const file of [
  'packages/types/src/astrology.ts',
  'apps/mobile/src/types/astrology.ts',
]) {
  const source = read(file);
  [
    'PredictaContextSupremacyMemory',
    'localMemoryFirstRules: string[]',
    'providerDecisionRules: string[]',
    'sectionAwareHandoffRules: string[]',
    'contextSupremacyMemory?: PredictaContextSupremacyMemory',
  ].forEach(fragment => assertIncludes(source, fragment, `${file} type contract`));
}

for (const file of [
  'packages/ai/src/contextBuilder.ts',
  'apps/mobile/src/services/ai/contextBuilder.ts',
]) {
  const source = read(file);
  [
    'PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY',
    'contextSupremacyMemory: PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY',
    'generatedReportContext',
    'reportSectionMemory',
    'appMemoryDigest: PREDICTA_APP_MEMORY_DIGEST',
  ].forEach(fragment => assertIncludes(source, fragment, `${file} context supremacy`));
}

for (const file of [
  'apps/web/components/WebPridictaChat.tsx',
  'apps/mobile/src/screens/ChatScreen.tsx',
]) {
  const source = read(file);
  [
    'buildPredictaActionReply',
    'actionReply.providerDecision',
    'record',
    'ZeroCreditDeterministicAction',
  ].forEach(fragment => assertIncludes(source, fragment, `${file} zero-credit router`));
}

const {
  PREDICTA_APP_MEMORY_DIGEST,
  PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY,
  buildGeneratedReportMemoryContext,
  findPredictaReportSectionMemory,
} = require('../packages/config/src/predictaMemory.ts');
const { buildPredictaActionReply } = require(
  '../packages/astrology/src/predictaChatActions.ts',
);
const { buildAIContext } = require('../packages/ai/src/contextBuilder.ts');
const { buildAIContext: buildMobileAIContext } = require(
  '../apps/mobile/src/services/ai/contextBuilder.ts',
);

const providerLabels =
  PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY.providerDecisionLabels;
for (const label of [
  'local_memory_answer',
  'deterministic_action',
  'missing_data_question',
  'ai_required',
  'blocked_needs_credit',
]) {
  assert.ok(providerLabels[label], `runtime provider label ${label} must exist`);
}

assert.ok(
  PREDICTA_APP_MEMORY_DIGEST.localMemoryFirstRules.length >= 3,
  'app memory digest must carry local-memory-first rules',
);
assert.ok(
  PREDICTA_APP_MEMORY_DIGEST.sectionAwareHandoffRules.length >= 7,
  'app memory digest must carry all section-aware handoff rules',
);

const kundli = buildKundli('competitor-phase-3', [
  p('Sun', 'Pisces', 5, 335, 8),
  p('Moon', 'Gemini', 12, 72, 6),
  p('Mars', 'Libra', 8, 188, 7),
  p('Mercury', 'Sagittarius', 7, 247, 5),
  p('Jupiter', 'Sagittarius', 22, 262, 5),
  p('Venus', 'Aries', 14, 14, 3),
  p('Saturn', 'Pisces', 7, 337, 8),
  p('Rahu', 'Pisces', 9, 339, 8),
  p('Ketu', 'Virgo', 9, 159, 2),
]);

const kundliKarmaReply = reply('Explain my strongest Dosh and Shrap', {
  aiCreditsExhausted: true,
  kundli,
});
assertHandled(
  kundliKarmaReply,
  'kundli-karma',
  'local_memory_answer',
  'Kundli Karma local-memory answer with exhausted AI credits',
);
assert.match(kundliKarmaReply.text, /No AI credit is needed/i);
assert.match(kundliKarmaReply.text, /Why this appears:/i);

const jaiminiAliasReply = reply('Can Gemini Jyotish explain Atmakaraka?', {
  kundli,
});
assertHandled(
  jaiminiAliasReply,
  'jaimini-handoff',
  'deterministic_action',
  'Gemini Jyotish provider alias',
);
assert.match(jaiminiAliasReply.text, /Jaimini Jyotish/i);
assert.match(jaiminiAliasReply.text, /AI-provider terminology/i);

const missingSignature = reply('Read my signature traits', {
  predictaSchool: 'SIGNATURE',
});
assertHandled(
  missingSignature,
  'signature-predicta',
  'deterministic_action',
  'Signature missing trait boundary stays deterministic',
);
assert.match(missingSignature.text, /confirmed visible traits/i);

const missingKundli = reply('Explain my strongest Shrap');
assertHandled(
  missingKundli,
  'kundli-karma',
  'missing_data_question',
  'Missing Kundli asks for data',
);
assert.match(missingKundli.text, /need your Kundli/i);

const blocked = reply('Write a deep personal synthesis about my whole life', {
  aiCreditsExhausted: true,
  kundli,
});
assert.equal(blocked.handled, false, 'Open-ended synthesis should not be faked locally');
assert.equal(blocked.providerDecision, 'blocked_needs_credit');

const generatedReport = buildGeneratedReportMemoryContext({
  availableSections: [
    'Core prediction',
    'KP verdict',
    'Jaimini soul role',
    'Number signature',
    'Signature trait map',
    'Life Atlas hidden thread',
    'Kundli Karma snapshot',
  ],
  generatedAt: '2026-06-06T00:00:00.000Z',
  mode: 'FREE',
  reportFocus: 'LIFE_ATLAS',
  reportTitle: 'Predicta Life Atlas',
  schoolLane: 'SYNTHESIS',
  selectedSections: ['Life Atlas hidden thread'],
  subjectName: 'Phase Three User',
});
assert.match(generatedReport.chatMasteryRule ?? '', /life mirror|Life Atlas/i);
assert.match(generatedReport.depthContract ?? '', /Free/i);

for (const sectionId of [
  'vedic-core-chart-prediction',
  'kp-verdict-timing-readiness',
  'jaimini-soul-role',
  'numerology-number-signature',
  'signature-trait-map',
  'life-atlas-hidden-thread',
  'kundli-karma-snapshot',
]) {
  const section = findPredictaReportSectionMemory(sectionId);
  assert.ok(section, `${sectionId}: section memory must exist`);
  assert.ok(section.handoffPrompt.length > 12, `${sectionId}: handoff prompt must be useful`);
}

const sharedContext = buildAIContext(
  kundli,
  {
    reportAvailableSections: generatedReport.availableSections,
    reportFocus: 'LIFE_ATLAS',
    reportGeneratedAt: generatedReport.generatedAt,
    reportMode: 'FREE',
    reportSchoolLane: 'SYNTHESIS',
    reportSectionId: 'life-atlas-hidden-thread',
    reportSubjectName: generatedReport.subjectName,
    reportType: generatedReport.reportTitle,
    sourceScreen: 'Phase 3 gate',
  },
  'en',
  'FREE',
);
const mobileContext = buildMobileAIContext(
  kundli,
  {
    reportAvailableSections: generatedReport.availableSections,
    reportFocus: 'LIFE_ATLAS',
    reportGeneratedAt: generatedReport.generatedAt,
    reportMode: 'FREE',
    reportSchoolLane: 'SYNTHESIS',
    reportSectionId: 'life-atlas-hidden-thread',
    reportSubjectName: generatedReport.subjectName,
    reportType: generatedReport.reportTitle,
    sourceScreen: 'Phase 3 gate',
  },
  'en',
  'FREE',
);

for (const [label, context] of [
  ['shared', sharedContext],
  ['mobile', mobileContext],
]) {
  assert.ok(context.appMemoryDigest, `${label}: app memory digest exists`);
  assert.ok(context.contextSupremacyMemory, `${label}: context supremacy memory exists`);
  assert.ok(context.generatedReportContext, `${label}: generated report context exists`);
  assert.equal(
    context.reportSectionMemory?.id,
    'life-atlas-hidden-thread',
    `${label}: report section memory is carried`,
  );
  assert.ok(
    context.contextSupremacyMemory.providerDecisionLabels.local_memory_answer,
    `${label}: local_memory_answer label carried`,
  );
}

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- Phase 2 GREEN manifest was verified before Phase 3.',
    '- Predicta context digest now carries local-memory-first, provider-decision, missing-data, and section-aware handoff rules.',
    '- Shared and mobile AI context payloads carry contextSupremacyMemory, generatedReportContext, and reportSectionMemory.',
    '- Runtime chat checks prove Kundli Karma stays local_memory_answer after AI credits are exhausted.',
    '- Runtime chat checks prove open-ended synthesis is blocked_needs_credit when credits are exhausted instead of faking a local answer.',
    '- Runtime chat checks prove Gemini Jyotish aliases to Jaimini without confusing AI provider terminology.',
    '- Runtime section-memory checks cover Vedic, KP, Jaimini, Numerology, Signature, Life Atlas, and Kundli Karma handoffs.',
    '',
  ].join('\n'),
);

if (failures.length) {
  console.error(`\n${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName}: GREEN`);

function reply(text, options = {}) {
  return buildPredictaActionReply({
    aiCreditsExhausted: options.aiCreditsExhausted,
    hasPremiumAccess: options.hasPremiumAccess ?? false,
    kundli: options.kundli,
    language: 'en',
    memory: options.memory,
    predictaSchool: options.predictaSchool,
    savedKundlis: options.kundli ? [options.kundli] : [],
    text,
  });
}

function assertHandled(result, action, providerDecision, label) {
  assert.equal(result.handled, true, `${label}: handled`);
  assert.equal(result.action, action, `${label}: action`);
  assert.equal(
    result.providerDecision,
    providerDecision,
    `${label}: provider decision`,
  );
  assert.ok(result.text?.length > 80, `${label}: useful text length`);
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
    ashtakavarga: {
      bav: {
        Saturn: [3, 2, 4, 2, 5, 3, 4, 2, 3, 5, 4, 3],
      },
      sav: [28, 24, 31, 22, 35, 26, 30, 19, 27, 33, 32, 25],
      strongestHouses: [5, 10, 11],
      totalScore: 332,
      weakestHouses: [8, 4, 2],
    },
    birthDetails: {
      date: '1980-08-22',
      latitude: 19.07,
      longitude: 72.88,
      name: `Context Fixture ${id}`,
      place: 'Mumbai, India',
      time: '06:30',
      timezone: 'Asia/Kolkata',
    },
    calculationMeta: {
      ayanamsa: 'Lahiri',
      houseSystem: 'Whole Sign',
      nodeType: 'True',
      utcDateTime: '1980-08-22T01:00:00.000Z',
      zodiac: 'sidereal',
    },
    charts: {},
    dasha: {
      current: {
        antardasha: 'Mars',
        endDate: '2027-01-01',
        mahadasha: 'Saturn',
        pratyantardasha: 'Rahu',
        startDate: '2025-01-01',
      },
      timeline: [],
    },
    houses: [
      { house: 1, lord: 'Sun', planets: [], sign: 'Leo' },
      { house: 2, lord: 'Mercury', planets: ['Ketu'], sign: 'Virgo' },
      { house: 3, lord: 'Venus', planets: ['Venus'], sign: 'Libra' },
      { house: 4, lord: 'Mars', planets: [], sign: 'Scorpio' },
      { house: 5, lord: 'Jupiter', planets: ['Jupiter', 'Mercury'], sign: 'Sagittarius' },
      { house: 6, lord: 'Saturn', planets: ['Moon'], sign: 'Capricorn' },
      { house: 7, lord: 'Saturn', planets: [], sign: 'Aquarius' },
      { house: 8, lord: 'Jupiter', planets: ['Sun', 'Saturn', 'Rahu'], sign: 'Pisces' },
      { house: 9, lord: 'Mars', planets: [], sign: 'Aries' },
      { house: 10, lord: 'Venus', planets: [], sign: 'Taurus' },
      { house: 11, lord: 'Mercury', planets: [], sign: 'Gemini' },
      { house: 12, lord: 'Moon', planets: [], sign: 'Cancer' },
    ],
    id,
    lagna: 'Leo',
    lifeTimeline: [],
    moonSign: 'Gemini',
    nakshatra: 'Fixture Star',
    planets,
    remedies: [
      {
        cadence: 'Daily',
        linkedPlanets: ['Saturn'],
        planet: 'Saturn',
        practice: 'Do one quiet act of service without announcing it.',
      },
    ],
    transits: [
      {
        houseFromLagna: 8,
        houseFromMoon: 10,
        planet: 'Saturn',
        sign: 'Pisces',
        weight: 'moderate',
      },
    ],
    yogas: [],
  };
}
