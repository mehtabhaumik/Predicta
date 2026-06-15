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
  'PREDICTA_INTELLIGENCE_PHASE_7_PREDICTION_REMEDY_AND_SATISFACTION_GATE';
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
  'packages/astrology/src/predictaMultiSchoolConsultation.ts',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md');
[
  phaseName,
  'Make Predicta satisfying, not merely correct.',
  'Career promotion/job change.',
  'Foreign travel/relocation.',
  'Dosh/Shrap/Yog/Lal Kitab remedy.',
  'Answers provide prediction/guidance, timing where available, remedy/action,',
  'No answer reads like a lesson unless user asked to learn.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'intelligence roadmap phase 7'));

const chatActionsSource = read('packages/astrology/src/predictaChatActions.ts');
[
  'Direct answer:',
  'Action/remedy:',
  'Timing:',
  'Confidence:',
  'Evidence:',
].forEach(fragment => assertIncludes(chatActionsSource, fragment, 'predictaChatActions satisfaction frame'));

const multiSchoolSource = read('packages/astrology/src/predictaMultiSchoolConsultation.ts');
[
  'Direct answer:',
  'Most likely trigger:',
  'Action/remedy:',
  'Evidence used:',
].forEach(fragment => assertIncludes(multiSchoolSource, fragment, 'multi-school satisfaction frame'));

const { buildPredictaActionReply } = require('../packages/astrology/src/predictaChatActions.ts');

const kundli = buildKundli();
const cases = [
  {
    id: 'career-promotion-job-change',
    text: 'Will I get a promotion or job change soon?',
    expectedAction: 'multi-school-consultation',
  },
  {
    id: 'foreign-travel-relocation',
    text: 'Will I get foreign work travel or relocation soon?',
    expectedAction: 'multi-school-consultation',
  },
  {
    id: 'marriage-relationship-timing',
    text: 'When will my marriage or relationship settle?',
    expectedAction: 'multi-school-consultation',
  },
  {
    id: 'money-property',
    text: 'Should I buy property in the next six months?',
    expectedAction: 'decision-timing',
  },
  {
    id: 'family-child-matching',
    text: 'Will family child or matching matters improve?',
    expectedAction: 'multi-school-consultation',
  },
  {
    id: 'kp-event-question',
    predictaSchool: 'KP',
    text: 'KP Predicta: will my promotion happen?',
    expectedAction: 'kp-predicta',
  },
  {
    id: 'jaimini-destiny-direction',
    predictaSchool: 'JAIMINI',
    text: 'Jaimini Predicta destiny direction for my life path.',
    expectedAction: 'jaimini-predicta',
  },
  {
    id: 'numerology-cycle',
    predictaSchool: 'NUMEROLOGY',
    text: 'Numerology Predicta personal year cycle guidance.',
    expectedAction: 'numerology-predicta',
  },
  {
    id: 'signature-reflection',
    predictaSchool: 'SIGNATURE',
    text:
      'Signature Predicta context observed traits: baseline upward, slant right, pressure medium, spacing balanced, legibility partial, flourish moderate, speed moderate.',
    expectedAction: 'signature-predicta',
    signatureMode: true,
  },
  {
    id: 'kundli-karma-remedy',
    text: 'Show my Kundli Karma Dosh Shrap Yog and Lal Kitab remedy.',
    expectedAction: 'kundli-karma',
  },
];

const transcript = cases.map(testCase => {
  const reply = buildPredictaActionReply({
    hasPremiumAccess: false,
    kundli,
    language: 'en',
    predictaSchool: testCase.predictaSchool,
    text: testCase.text,
  });
  assertGate(reply.handled, `${testCase.id}: reply must be handled`);
  assertGate(
    reply.action === testCase.expectedAction,
    `${testCase.id}: expected ${testCase.expectedAction}, got ${reply.action}`,
  );
  assertSatisfyingAnswer(testCase.id, reply.text ?? '', testCase.signatureMode);
  return {
    action: reply.action,
    id: testCase.id,
    preview: strip(reply.text ?? '').slice(0, 420),
  };
});

if (failures.length) {
  throw new assert.AssertionError({
    message: `${phaseName} failed:\n- ${failures.join('\n- ')}`,
  });
}

mkdirSync(auditDir, { recursive: true });
writeFileSync(
  path.join(auditDir, 'phase-7-manifest.json'),
  `${JSON.stringify(
    {
      phase: phaseName,
      status: 'green',
      strictAudit: true,
      transcriptAssertions: {
        actionOrRemedy: true,
        confidence: true,
        evidence: true,
        noSchoolingTone: true,
        predictionOrGuidanceFirst: true,
        timingWhereAvailable: true,
      },
      transcript,
    },
    null,
    2,
  )}\n`,
);

console.log(`${phaseName}: passed`);

function assertSatisfyingAnswer(id, text, signatureMode = false) {
  const normalized = strip(text);
  assertGate(
    /\bDirect answer:/i.test(normalized),
    `${id}: must include a direct answer`,
  );
  assertGate(/\bTiming:/i.test(normalized), `${id}: must include timing`);
  assertGate(/\bConfidence:/i.test(normalized), `${id}: must include confidence`);
  assertGate(
    /\b(Action\/remedy|Free safe remedy|Start safely with|Remedy:|Next step:)/i.test(normalized),
    `${id}: must include action or remedy`,
  );
  assertGate(
    /\b(Evidence used:|Evidence:|Number proof:|Significators:|Observed traits:|Why this appears:)/i.test(
      normalized,
    ),
    `${id}: must include evidence`,
  );
  assertGate(
    !/\b(mode: I will|what I am checking|how to read this|this section teaches|lesson:)\b/i.test(
      normalized,
    ),
    `${id}: answer must not read like a lesson/toolkit`,
  );
  if (!signatureMode) {
    assertGate(
      /\b(likely|possible|verdict|direction|support|pressure|timing|window|trigger|improve|settle|decision|guidance)\b/i.test(
        normalized,
      ),
      `${id}: must give prediction or practical guidance`,
    );
  }
}

function strip(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function buildKundli() {
  return {
    id: 'phase-7-kundli',
    ashtakavarga: {
      bhinnashtakavarga: {},
      sav: {
        houses: [
          { house: 1, score: 31 },
          { house: 10, score: 34 },
          { house: 11, score: 36 },
        ],
        strongestHouses: [11, 10, 1],
        weakestHouses: [8, 12, 6],
      },
      strongestHouses: [11, 10, 1],
      totalScore: 337,
      weakestHouses: [8, 12, 6],
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
      timeline: [
        {
          antardashas: [
            {
              antardasha: 'Saturn',
              endDate: '2027-08-22',
              startDate: '2024-08-22',
            },
            {
              antardasha: 'Mercury',
              endDate: '2029-06-22',
              startDate: '2027-08-23',
            },
          ],
          endDate: '2044-08-22',
          mahadasha: 'Venus',
          startDate: '2024-08-22',
        },
      ],
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
    numerology: undefined,
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
      {
        degree: 19.8,
        house: 11,
        isCombust: false,
        isRetrograde: false,
        name: 'Venus',
        nakshatra: 'Ardra',
        sign: 'Gemini',
      },
      {
        degree: 26.6,
        house: 12,
        isCombust: false,
        isRetrograde: true,
        name: 'Rahu',
        nakshatra: 'Punarvasu',
        sign: 'Cancer',
      },
      {
        degree: 26.6,
        house: 6,
        isCombust: false,
        isRetrograde: true,
        name: 'Ketu',
        nakshatra: 'Uttara Ashadha',
        sign: 'Capricorn',
      },
    ],
  };
}
