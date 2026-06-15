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
  'PREDICTA_INTELLIGENCE_PHASE_8_TRANSLATION_NATIVE_TONE_CHAT_GATE';
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
  if (!condition) failures.push(message);
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

[
  'docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md',
  'packages/astrology/src/predictaChatActions.ts',
  'packages/astrology/src/predictaMultiSchoolConsultation.ts',
  'packages/config/src/predictaUx.ts',
  'packages/config/src/translations/predictaUx.json',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md');
[
  phaseName,
  'Make Predicta sound natural in English, Hindi, and Gujarati.',
  'Native-tone fixtures for all major answer modes.',
  'No Hindi/Gujarati leakage in English mode.',
  'No English leakage in Hindi/Gujarati except approved canonical terms.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'intelligence roadmap phase 8'));

const packageJson = JSON.parse(read('package.json'));
assertGate(
  packageJson.scripts?.['test:predicta-intelligence-phase-8'] ===
    'node scripts/run-predicta-intelligence-phase-8-native-tone-gate.mjs',
  'package.json must expose test:predicta-intelligence-phase-8',
);

const predictaUxSource = read('packages/config/src/predictaUx.ts');
[
  'getPredictaChatLabel',
  'getPredictaChatPhrase',
  'PredictaChatLabelId',
  'PredictaChatPhraseId',
].forEach(fragment => assertIncludes(predictaUxSource, fragment, 'predictaUx native chat contract'));

const translations = JSON.parse(read('packages/config/src/translations/predictaUx.json'));
for (const language of ['en', 'hi', 'gu']) {
  assertGate(translations.copy[language]?.chatLabels, `${language}: chatLabels missing`);
  assertGate(translations.copy[language]?.chatPhrases, `${language}: chatPhrases missing`);
  for (const key of [
    'directAnswer',
    'timing',
    'confidence',
    'actionRemedy',
    'evidence',
    'schoolsConsulted',
    'eventVerdict',
  ]) {
    assertGate(
      typeof translations.copy[language].chatLabels[key] === 'string',
      `${language}: chat label ${key} missing`,
    );
  }
}

assertGate(
  /[\u0900-\u097F]/.test(translations.copy.hi.chatLabels.directAnswer),
  'Hindi direct-answer label must use Devanagari',
);
assertGate(
  /[\u0A80-\u0AFF]/.test(translations.copy.gu.chatLabels.directAnswer),
  'Gujarati direct-answer label must use Gujarati script',
);

const { buildPredictaActionReply } = require('../packages/astrology/src/predictaChatActions.ts');

const kundli = buildKundli();
const cases = [
  {
    id: 'multi-school-foreign-travel',
    text: 'Will I get foreign work travel or relocation soon?',
    expectedAction: 'multi-school-consultation',
  },
  {
    id: 'decision-property',
    text: 'Should I buy property in the next six months?',
    expectedAction: 'decision-timing',
  },
  {
    id: 'kp-event-question',
    predictaSchool: 'KP',
    text: 'KP Predicta: will my promotion happen?',
    expectedAction: 'kp-predicta',
  },
  {
    id: 'jaimini-destiny',
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
    id: 'signature-confirmed-traits',
    predictaSchool: 'SIGNATURE',
    text:
      'Signature Predicta context observed traits: baseline upward, slant right, pressure medium, spacing balanced, legibility partial, flourish moderate, speed moderate.',
    expectedAction: 'signature-predicta',
  },
  {
    id: 'kundli-karma-snapshot',
    text: 'Show my Kundli Karma snapshot and top 3 Dosh Shrap Yog Lal Kitab signals.',
    expectedAction: 'kundli-karma',
  },
  {
    id: 'mahadasha-current',
    text: 'Show my current Mahadasha and timing.',
    expectedAction: 'mahadasha',
  },
];

const transcript = [];
for (const testCase of cases) {
  const english = buildReply(testCase, 'en');
  assertEnglishClean(testCase.id, english.text);
  transcript.push({
    action: english.action,
    id: `${testCase.id}-en`,
    preview: strip(english.text).slice(0, 320),
  });

  for (const language of ['hi', 'gu']) {
    const reply = buildReply(testCase, language);
    assertNativeClean(testCase.id, language, reply.text);
    transcript.push({
      action: reply.action,
      id: `${testCase.id}-${language}`,
      preview: strip(reply.text).slice(0, 320),
    });
  }
}

if (failures.length) {
  throw new assert.AssertionError({
    message: `${phaseName} failed:\n- ${failures.join('\n- ')}`,
  });
}

mkdirSync(auditDir, { recursive: true });
writeFileSync(
  path.join(auditDir, 'phase-8-manifest.json'),
  `${JSON.stringify(
    {
      phase: phaseName,
      status: 'green',
      strictAudit: true,
      transcriptAssertions: {
        englishHasNoNativeScriptLeak: true,
        nativeHasNoEnglishBodyLabels: true,
        nativeMajorAnswerModesCovered: true,
        translationFileBackedChatLabels: true,
      },
      transcript,
    },
    null,
    2,
  )}\n`,
);

console.log(`${phaseName}: passed`);

function buildReply(testCase, language) {
  const reply = buildPredictaActionReply({
    hasPremiumAccess: false,
    kundli,
    language,
    predictaSchool: testCase.predictaSchool,
    text:
      language === 'hi'
        ? `कृपया हिंदी में जवाब दें. ${testCase.text}`
        : language === 'gu'
          ? `કૃપા કરીને ગુજરાતી માં જવાબ આપો. ${testCase.text}`
          : testCase.text,
  });
  assertGate(reply.handled, `${testCase.id}-${language}: reply must be handled`);
  assertGate(
    reply.action === testCase.expectedAction,
    `${testCase.id}-${language}: expected ${testCase.expectedAction}, got ${reply.action}`,
  );
  return reply;
}

function assertEnglishClean(id, text = '') {
  const normalized = strip(text);
  assertGate(!/[\u0900-\u097F]/.test(normalized), `${id}-en: Devanagari leaked into English`);
  assertGate(!/[\u0A80-\u0AFF]/.test(normalized), `${id}-en: Gujarati leaked into English`);
  assertGate(/\bDirect answer:/i.test(normalized), `${id}-en: English should keep direct-answer label`);
  assertGate(/\bConfidence:/i.test(normalized), `${id}-en: English should keep confidence label`);
}

function assertNativeClean(id, language, text = '') {
  const normalized = strip(text);
  const scriptPattern = language === 'hi' ? /[\u0900-\u097F]/ : /[\u0A80-\u0AFF]/;
  assertGate(scriptPattern.test(normalized), `${id}-${language}: native script missing`);
  for (const pattern of nativeBannedEnglishPatterns()) {
    assertGate(
      !pattern.test(normalized),
      `${id}-${language}: leaked English pattern ${pattern}`,
    );
  }
}

function nativeBannedEnglishPatterns() {
  return [
    /\bDirect answer:/i,
    /\bTiming:/i,
    /\bConfidence:/i,
    /\bEvidence:/i,
    /\bEvidence used:/i,
    /\bEvent verdict:/i,
    /\bMost likely trigger:/i,
    /\bAction\/remedy:/i,
    /\bNext step:/i,
    /\bSchools consulted:/i,
    /\bObserved traits:/i,
    /\bSignature reading is ready/i,
    /\bSignature Predicta mode:/i,
    /\bThe signature rhythm/i,
    /\bConfidence expression:/i,
    /\bWriting rhythm:/i,
    /\bConsistency:/i,
    /\bPremium depth is active/i,
    /\bFree insight/i,
    /\bProof:/i,
    /\bTiming windows:/i,
    /\bLife balance:/i,
    /\bKarma support:/i,
    /\bBoundary:/i,
    /\bGuidance:/i,
    /\bUseful next questions/i,
    /\bNo AI credit/i,
    /\bTop active conditions:/i,
    /\bWriting rhythm\b/i,
    /\bcusp\b/i,
    /\bsub-lord\b/i,
    /\bsignificator\b/i,
    /\bruling planets\b/i,
    /\bgeneric chart\b/i,
    /\bPaid action\b/i,
    /\blimit\b/i,
    /\bin house\b/i,
  ];
}

function strip(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

function buildKundli() {
  return {
    id: 'phase-8-kundli',
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
      { house: 11, planets: ['Jupiter', 'Venus'], sign: 'Gemini' },
      { house: 12, planets: ['Rahu'], sign: 'Cancer' },
      { house: 6, planets: ['Ketu'], sign: 'Capricorn' },
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
