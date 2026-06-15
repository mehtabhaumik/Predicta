import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
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
const phaseName = 'PREDICTA_INTELLIGENCE_PHASE_4_MULTI_SCHOOL_CONSULTATION_ENGINE';
const failures = [];

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
  'docs/audits/PREDICTA_INTELLIGENCE_PHASE_3_APP_FUNCTION_MASTERY/verification.txt',
  'packages/astrology/src/predictaMultiSchoolConsultation.ts',
  'packages/astrology/src/predictaChatActions.ts',
  'packages/astrology/src/eventOracleEvidenceContract.ts',
  'packages/astrology/src/eventOraclePredictionEngine.ts',
  'packages/astrology/src/index.ts',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md');
[
  phaseName,
  'Let main Predicta consult the right schools before predicting.',
  'Vedic life foundation, dasha, charts, Yog, Dosh, Shrap, Lal Kitab',
  'KP event promise/block/timing',
  'Jaimini soul role and destiny direction',
  'Numerology cycle support',
  'Signature confirmed traits only',
  'Life Atlas/report context when available',
  'If schools agree, confidence can rise.',
  'If schools conflict, Predicta must say so and lower confidence.',
  'Room-safe mode must not silently mix methods.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'intelligence roadmap phase 4'));

const {
  buildEventOracleEvidenceContract,
  buildEventOraclePredictionObject,
  buildPredictaActionReply,
  composePredictaMultiSchoolConsultation,
  createReadySupportLayer,
  refineEventQuestion,
} = require('../packages/astrology/src/index.ts');

const kundli = buildKundli('phase-four-main');
const question = 'Will I go abroad for work this year?';
const consultation = composePredictaMultiSchoolConsultation({
  kundli,
  question,
});

assert.equal(consultation.status, 'ready', 'main consultation should be ready');
assert.match(consultation.directAnswer, /^(Likely|Delayed|Blocked|Mixed|Possible|Needs clarity):/);
assert.equal(consultation.prediction?.deterministic, true, 'prediction is deterministic');
assert.equal(consultation.prediction?.noGuaranteedOutcome, true, 'prediction avoids guarantee');
assert.ok(consultation.evidenceUsed.length >= 3, 'multi-school evidence must be visible');
for (const layer of ['vedic', 'kp', 'jaimini', 'numerology', 'lifeAtlas']) {
  assert.ok(
    consultation.consultedSchools.includes(layer),
    `consulted schools must include ${layer}`,
  );
}
assert.match(consultation.reply, /Timing:/, 'reply includes timing');
assert.match(consultation.reply, /Most likely trigger:/, 'reply includes trigger');
assert.match(consultation.reply, /Confidence:/, 'reply includes confidence');
assert.match(consultation.reply, /Evidence used:/, 'reply includes evidence');
assert.match(consultation.reply, /Next action:/, 'reply includes next action');
assert.doesNotMatch(consultation.reply, /toolkit|method lesson|how to read|this house represents/i);

const actionReply = buildPredictaActionReply({
  kundli,
  language: 'en',
  text: question,
});
assert.equal(actionReply.handled, true, 'chat action handled');
assert.equal(actionReply.action, 'multi-school-consultation', 'chat action uses consultation');
assert.equal(actionReply.providerDecision, 'deterministic_action', 'chat action stays deterministic');
assert.equal(actionReply.handoff?.href.startsWith('/dashboard/chat?'), true, 'handoff points to main chat');
assert.equal(actionReply.handoff?.context.originalQuestion, question, 'handoff preserves question');
assert.match(actionReply.text ?? '', /Schools consulted:.*vedic.*kp.*jaimini.*numerology/i);
assert.match(actionReply.text ?? '', /I am naming the schools I used/i);

const missingKundli = buildPredictaActionReply({
  language: 'en',
  text: 'When will I get promotion?',
});
assert.equal(missingKundli.action, 'multi-school-consultation');
assert.equal(missingKundli.providerDecision, 'deterministic_action');
assert.match(missingKundli.text ?? '', /Needs Kundli/i);
assert.match(missingKundli.text ?? '', /without spending an AI credit/i);

const roomSafe = buildPredictaActionReply({
  kundli,
  language: 'en',
  predictaSchool: 'KP',
  text: question,
});
assert.equal(roomSafe.action, 'multi-school-consultation', 'room-safe action detected');
assert.equal(roomSafe.providerDecision, 'deterministic_action');
assert.match(roomSafe.text ?? '', /inside KP Predicta/i);
assert.match(roomSafe.text ?? '', /not silently mix/i);
assert.doesNotMatch(roomSafe.text ?? '', /Vedic timing is active/i);

const relationshipConsultation = composePredictaMultiSchoolConsultation({
  kundli,
  question: 'Where is this relationship likely to go?',
});
const signatureFlag = relationshipConsultation.evidenceContract?.missingEvidenceFlags.find(
  flag => flag.layerId === 'signature',
);
assert.equal(signatureFlag?.optional, true, 'signature must be optional missing evidence');
assert.notEqual(
  relationshipConsultation.confidence.level,
  'not_enough_evidence',
  'missing signature must not block all-school answer',
);

const conflictRefinement = refineEventQuestion(
  'Is a meaningful career move likely for me soon?',
  'career_move',
);
const supportiveContract = buildEventOracleEvidenceContract({
  refinement: conflictRefinement,
  layers: Object.fromEntries(
    conflictRefinement.downstream.evidenceRooms.map(layerId => [
      layerId,
      createReadySupportLayer('supports', `${layerId} supports this career move.`),
    ]),
  ),
});
const conflictContract = buildEventOracleEvidenceContract({
  refinement: conflictRefinement,
  layers: {
    jaimini: createReadySupportLayer('blocks', 'Jaimini blocks the career direction for now.'),
    kp: createReadySupportLayer('supports', 'KP supports the event timing.'),
    kundliKarma: createReadySupportLayer('mixed', 'Kundli Karma shows friction and support together.'),
    numerology: createReadySupportLayer('supports', 'Numerology supports the cycle.'),
    vedic: createReadySupportLayer('supports', 'Vedic supports the timing.'),
  },
});
const supportivePrediction = buildEventOraclePredictionObject({
  evidenceContract: supportiveContract,
  refinement: conflictRefinement,
});
const conflictPrediction = buildEventOraclePredictionObject({
  evidenceContract: conflictContract,
  refinement: conflictRefinement,
});
assert.ok(
  conflictPrediction.confidence.score < supportivePrediction.confidence.score,
  'conflict must lower confidence score',
);
assert.ok(conflictContract.conflictScore > supportiveContract.conflictScore, 'conflict score rises');
assert.match(conflictPrediction.directAnswer, /Delayed|Mixed|Blocked|Possible|Needs clarity/);

const source = read('packages/astrology/src/predictaMultiSchoolConsultation.ts');
[
  'composePredictaMultiSchoolConsultation',
  'isPredictaMultiSchoolQuestion',
  'Vedic timing',
  'KP says',
  'Jaimini says',
  'Kundli Karma highlights',
  'Numerology timing color',
  'Signature evidence is optional',
  'Life Atlas context',
  'room_safe_blocked',
  'not silently mix',
  'safeLayer',
].forEach(fragment => assertIncludes(source, fragment, 'multi-school source'));

const actionSource = read('packages/astrology/src/predictaChatActions.ts');
[
  "'multi-school-consultation'",
  'composePredictaMultiSchoolConsultation',
  'buildMultiSchoolConsultationReply',
  'Schools consulted:',
  'I am naming the schools I used',
].forEach(fragment => assertIncludes(actionSource, fragment, 'chat action source'));

const indexSource = read('packages/astrology/src/index.ts');
assertIncludes(
  indexSource,
  "export * from './predictaMultiSchoolConsultation';",
  'astrology export',
);

if (failures.length) {
  console.error(`${phaseName}: FAILED`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName}: passed`);

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

function buildKundli(id) {
  return {
    ashtakavarga: {
      sav: [31, 27, 29, 25, 34, 21, 28, 22, 30, 36, 35, 26],
      strongestHouses: [10, 11, 5],
      weakestHouses: [6, 8, 12],
    },
    birthDetails: {
      date: '1980-08-22',
      latitude: 19.07,
      longitude: 72.88,
      name: `Phase Four ${id}`,
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
      { house: 1, lord: 'Sun', planets: ['Sun', 'Ketu'], sign: 'Leo' },
      { house: 2, lord: 'Mercury', planets: [], sign: 'Virgo' },
      { house: 3, lord: 'Venus', planets: ['Mars'], sign: 'Libra' },
      { house: 4, lord: 'Mars', planets: [], sign: 'Scorpio' },
      { house: 5, lord: 'Jupiter', planets: ['Jupiter'], sign: 'Sagittarius' },
      { house: 6, lord: 'Saturn', planets: ['Saturn'], sign: 'Capricorn' },
      { house: 7, lord: 'Saturn', planets: ['Rahu'], sign: 'Aquarius' },
      { house: 8, lord: 'Jupiter', planets: [], sign: 'Pisces' },
      { house: 9, lord: 'Mars', planets: [], sign: 'Aries' },
      { house: 10, lord: 'Venus', planets: ['Moon'], sign: 'Taurus' },
      { house: 11, lord: 'Mercury', planets: ['Mercury'], sign: 'Gemini' },
      { house: 12, lord: 'Moon', planets: [], sign: 'Cancer' },
    ],
    id,
    lagna: 'Leo',
    moonSign: 'Taurus',
    nakshatra: 'Fixture Star',
    planets: [
      p('Sun', 'Leo', 5, 125, 1),
      p('Moon', 'Taurus', 12, 42, 10),
      p('Mars', 'Libra', 8, 188, 3),
      p('Mercury', 'Gemini', 18, 78, 11),
      p('Jupiter', 'Sagittarius', 22, 262, 5),
      p('Venus', 'Libra', 14, 194, 3),
      p('Saturn', 'Capricorn', 20, 290, 6),
      p('Rahu', 'Aquarius', 16, 316, 7),
      p('Ketu', 'Leo', 16, 136, 1),
    ],
    yogas: [],
  };
}
