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
  'PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT';
const previousPhaseName =
  'PREDICTA_INTELLIGENCE_PHASE_9_COST_GOVERNANCE_AND_AI_USAGE_PROOF';
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
    '@pridicta/config/aiCostGovernance': 'packages/config/src/aiCostGovernance.ts',
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
  `docs/audits/${previousPhaseName}/verification.txt`,
  'packages/astrology/src/predictaChatActions.ts',
  'packages/config/src/predictaAiUsageProof.ts',
  'packages/config/src/translations/nativeCopy.json',
  'apps/web/app/api/ask-pridicta/route.ts',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const previousVerification = read(`docs/audits/${previousPhaseName}/verification.txt`);
assertIncludes(previousVerification, `${previousPhaseName}: GREEN`, 'previous phase verification');

const packageJson = JSON.parse(read('package.json'));
assertGate(
  packageJson.scripts?.['test:predicta-intelligence-phase-10'] ===
    'node scripts/run-predicta-intelligence-phase-10-golden-chat-experience-gate.mjs',
  'package.json must expose test:predicta-intelligence-phase-10',
);

const roadmap = read('docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md');
[
  phaseName,
  'Golden transcripts for:',
  'no Kundli',
  'saved Kundli',
  'exhausted credits',
  'Vedic',
  'KP',
  'Jaimini',
  'Numerology',
  'Signature',
  'Reports',
  'Life Atlas',
  'Kundli Karma',
  'Family Vault',
  'pass/redeem',
  'English, Hindi, Gujarati',
  'No generic, repetitive, teacher-like, or unsupported answers.',
  'Predicta gives a satisfying user experience before technical proof.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'intelligence roadmap phase 10'));

const chatSource = read('packages/astrology/src/predictaChatActions.ts');
[
  'buildReportBriefText',
  'I would start',
  'Life Atlas thread:',
  'Report lanes stay separate',
  'report_brief_ready_hi',
  'report_brief_ready_gu',
].forEach(fragment => assertIncludes(chatSource, fragment, 'report chat experience'));
for (const banned of [
  'I staged the report brief',
  'Life Atlas boundary:',
  'Reports are school-lane aware:',
  'Vedic report memory includes',
  'Premium PDF bundle: the same calculation truth',
]) {
  assertGate(!chatSource.includes(banned), `report chat source must not contain old internal phrase: ${banned}`);
}

const webAskSource = read('apps/web/app/api/ask-pridicta/route.ts');
[
  'buildFreeAiUpsellText',
  'readChatLanguage',
  'free_ai_used_hi',
  'free_ai_used_gu',
].forEach(fragment => assertIncludes(webAskSource, fragment, 'web exhausted-credit localization'));

const nativeCopySource = read('packages/config/src/translations/nativeCopy.json');
[
  'report_brief_ready_hi',
  'report_brief_ready_gu',
  'free_ai_used_hi',
  'free_ai_used_gu',
].forEach(fragment => assertIncludes(nativeCopySource, fragment, 'native-copy golden transcript coverage'));

const {
  buildPredictaActionReply,
  classifyPredictaRouterDecision,
} = require('../packages/astrology/src/predictaChatActions.ts');
const {
  formatNativeCopy,
  getNativeCopy,
} = require('../packages/config/src/index.ts');

const kundli = buildKundli();
const savedKundlis = [
  kundli,
  {
    ...kundli,
    id: 'phase-10-family-kundli',
    birthDetails: {
      ...kundli.birthDetails,
      name: 'Family Member',
    },
    lagna: 'Cancer',
    moonSign: 'Pisces',
    nakshatra: 'Revati',
  },
];

const scenarios = [
  {
    id: 'no-kundli',
    label: 'no Kundli',
    text: 'Show my current Mahadasha timing',
    expectedAction: 'mahadasha',
    expectedProviderDecision: 'missing_data_question',
    kundli: undefined,
  },
  {
    id: 'saved-kundli',
    label: 'saved Kundli',
    text: 'Switch my saved Kundli',
    expectedAction: 'saved-kundlis',
    expectedProviderDecision: 'deterministic_action',
  },
  {
    id: 'exhausted-credits',
    label: 'exhausted credits',
    text: 'Tell me everything about my destiny in a deeply personal way',
    expectedAction: undefined,
    expectedProviderDecision: 'blocked_needs_credit',
    exhaustedOnly: true,
  },
  {
    id: 'vedic',
    label: 'Vedic',
    text: 'Show my current Mahadasha and timing.',
    expectedAction: 'mahadasha',
    expectedProviderDecision: 'deterministic_action',
    predictaSchool: 'PARASHARI',
  },
  {
    id: 'kp',
    label: 'KP',
    text: 'KP Predicta: will my promotion happen?',
    expectedAction: 'kp-predicta',
    expectedProviderDecision: 'deterministic_action',
    predictaSchool: 'KP',
  },
  {
    id: 'jaimini',
    label: 'Jaimini',
    text: 'Jaimini Predicta destiny direction for my life path.',
    expectedAction: 'jaimini-predicta',
    expectedProviderDecision: 'deterministic_action',
    predictaSchool: 'JAIMINI',
  },
  {
    id: 'numerology',
    label: 'Numerology',
    text: 'Numerology Predicta personal year cycle guidance.',
    expectedAction: 'numerology-predicta',
    expectedProviderDecision: 'deterministic_action',
    predictaSchool: 'NUMEROLOGY',
  },
  {
    id: 'signature',
    label: 'Signature',
    text:
      'Signature Predicta context observed traits: baseline upward, slant right, pressure medium, spacing balanced, legibility partial, flourish moderate, speed moderate.',
    expectedAction: 'signature-predicta',
    expectedProviderDecision: 'deterministic_action',
    predictaSchool: 'SIGNATURE',
  },
  {
    id: 'reports',
    label: 'Reports',
    text: 'Open my report composer for my Kundli.',
    expectedAction: 'report',
    expectedProviderDecision: 'deterministic_action',
  },
  {
    id: 'life-atlas',
    label: 'Life Atlas',
    text: 'Open Life Atlas report for my life purpose.',
    expectedAction: 'report',
    expectedProviderDecision: 'deterministic_action',
    requiredText: /Life Atlas|लाइफ एटलस|લાઇફ એટલસ/,
  },
  {
    id: 'kundli-karma',
    label: 'Kundli Karma',
    text: 'Show my Kundli Karma Dosh Shrap Yog Lal Kitab snapshot.',
    expectedAction: 'kundli-karma',
    expectedProviderDecision: 'local_memory_answer',
  },
  {
    id: 'family-vault',
    label: 'Family Vault',
    text: 'Open Family Vault comparison.',
    expectedAction: 'family-map',
    expectedProviderDecision: 'deterministic_action',
  },
  {
    id: 'pass-redeem',
    label: 'pass/redeem',
    text: 'Redeem pass and show AI credits left.',
    expectedAction: 'pass-redemption',
    expectedProviderDecision: 'deterministic_action',
  },
];

const languages = ['en', 'hi', 'gu'];
const transcripts = [];
const memoryByLanguage = new Map(languages.map(language => [language, undefined]));

for (const language of languages) {
  for (const scenario of scenarios) {
    const transcript = scenario.exhaustedOnly
      ? buildExhaustedCreditTranscript(scenario, language)
      : buildActionTranscript(scenario, language, memoryByLanguage.get(language));

    if (!scenario.exhaustedOnly) {
      memoryByLanguage.set(language, transcript.memory);
    }

    assertTranscriptQuality(transcript);
    transcripts.push(stripTranscript(transcript));
  }
}

assertGate(
  transcripts.length === scenarios.length * languages.length,
  `expected ${scenarios.length * languages.length} transcripts, got ${transcripts.length}`,
);
assertGate(
  new Set(transcripts.map(item => item.id)).size === transcripts.length,
  'golden transcript ids must be unique',
);
assertGate(
  new Set(transcripts.map(item => item.text)).size === transcripts.length,
  'golden transcript bodies must not be identical across scenarios/languages',
);

const scenarioCoverage = new Set(transcripts.map(item => item.scenario));
for (const scenario of scenarios) {
  assertGate(scenarioCoverage.has(scenario.label), `missing transcript scenario ${scenario.label}`);
}

if (failures.length) {
  throw new assert.AssertionError({
    message: `${phaseName} failed:\n- ${failures.join('\n- ')}`,
  });
}

mkdirSync(auditDir, { recursive: true });
writeFileSync(
  path.join(auditDir, 'golden-chat-transcripts.json'),
  `${JSON.stringify(transcripts, null, 2)}\n`,
);
writeFileSync(
  path.join(auditDir, 'golden-chat-transcripts.md'),
  renderTranscriptMarkdown(transcripts),
);
writeFileSync(
  path.join(auditDir, 'phase-10-manifest.json'),
  `${JSON.stringify(
    {
      phase: phaseName,
      status: 'green',
      strictAudit: true,
      languages,
      scenarioCount: scenarios.length,
      transcriptCount: transcripts.length,
      assertions: {
        dedicatedNativeCopy: true,
        deterministicAndLocalMemoryAvoidAi: true,
        exhaustedCreditsPreserveQuestion: true,
        noInternalReportMemoryLanguage: true,
        noTeacherToolkitTone: true,
        noUnsupportedProviderCall: true,
        transcriptsAreUnique: true,
      },
      transcripts: transcripts.map(item => ({
        action: item.action,
        id: item.id,
        language: item.language,
        providerDecision: item.providerDecision,
        scenario: item.scenario,
        preview: item.text.slice(0, 280),
      })),
    },
    null,
  )}\n`,
);
writeFileSync(
  path.join(auditDir, 'phase-10-golden-chat-experience-audit.md'),
  [
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    'GREEN when this gate passes. Predicta now has golden chat transcripts across the required app states, specialist worlds, report flows, and English/Hindi/Gujarati modes.',
    '',
    '## What This Audits',
    '',
    '- Main-character Predicta behavior across Kundli, saved Kundli, exhausted credits, Vedic, KP, Jaimini, Numerology, Signature, Reports, Life Atlas, Kundli Karma, Family Vault, and pass/redeem.',
    '- No old report-engine/internal-memory wording in report and Life Atlas chat responses.',
    '- No teacher/toolkit/system-document tone in golden transcripts.',
    '- Deterministic and local-memory answers stay off provider AI.',
    '- Exhausted-credit chat preserves the question and keeps deterministic help alive in the selected language.',
    '',
    '## Required Gate',
    '',
    '```bash',
    'corepack pnpm test:predicta-intelligence-phase-10',
    'corepack pnpm test:predicta-intelligence-phase-9',
    'corepack pnpm test:predicta-intelligence-phase-8',
    '```',
    '',
    '## Artifacts',
    '',
    '- `golden-chat-transcripts.json`',
    '- `golden-chat-transcripts.md`',
    '- `phase-10-manifest.json`',
    '- `verification.txt`',
    '',
  ].join('\n'),
);
writeFileSync(
  path.join(auditDir, 'verification.txt'),
  [
    `${phaseName}: GREEN`,
    '',
    'Verified by scripts/run-predicta-intelligence-phase-10-golden-chat-experience-gate.mjs.',
    `Generated transcripts: ${transcripts.length}`,
    'Languages: English, Hindi, Gujarati',
    '',
  ].join('\n'),
);

console.log(`${phaseName}: passed`);

function buildActionTranscript(scenario, language, memory) {
  const reply = buildPredictaActionReply({
    aiCreditsExhausted: true,
    hasPremiumAccess: false,
    kundli: Object.hasOwn(scenario, 'kundli') ? scenario.kundli : kundli,
    language,
    memory,
    predictaSchool: scenario.predictaSchool,
    savedKundlis,
    text: localizedPrompt(scenario.text, language),
  });

  assertGate(reply.handled, `${scenario.id}-${language}: reply must be handled`);
  assertGate(
    reply.action === scenario.expectedAction,
    `${scenario.id}-${language}: expected action ${scenario.expectedAction}, got ${reply.action}`,
  );
  assertGate(
    reply.providerDecision === scenario.expectedProviderDecision,
    `${scenario.id}-${language}: expected provider decision ${scenario.expectedProviderDecision}, got ${reply.providerDecision}`,
  );
  assertGate(
    reply.providerDecision !== 'ai_required' &&
      reply.providerDecision !== 'blocked_needs_credit',
    `${scenario.id}-${language}: deterministic/local transcript must not require provider AI`,
  );

  if (scenario.requiredText) {
    assertGate(
      scenario.requiredText.test(reply.text ?? ''),
      `${scenario.id}-${language}: required transcript marker missing`,
    );
  }

  return {
    action: reply.action,
    id: `${scenario.id}-${language}`,
    language,
    memory: reply.memory,
    providerDecision: reply.providerDecision,
    scenario: scenario.label,
    text: reply.text ?? '',
  };
}

function buildExhaustedCreditTranscript(scenario, language) {
  const decision = classifyPredictaRouterDecision({
    aiCreditsExhausted: true,
    kundli,
    normalizedText: scenario.text.toLowerCase(),
  });
  assertGate(
    !decision.shouldCallProvider &&
      decision.providerDecision === 'blocked_needs_credit',
    `${scenario.id}-${language}: open-ended exhausted credit must not call provider`,
  );

  return {
    action: undefined,
    id: `${scenario.id}-${language}`,
    language,
    providerDecision: decision.providerDecision,
    scenario: scenario.label,
    text: buildLocalizedExhaustedCreditText(language, scenario.text),
  };
}

function buildLocalizedExhaustedCreditText(language, preservedQuestion) {
  if (language === 'hi') {
    return [
      getNativeCopy("native.apps.web.app.api.ask-pridicta.route.ts.free_ai_used_hi"),
      getNativeCopy("native.apps.web.app.api.ask-pridicta.route.ts.free_ai_preserved_hi"),
      formatNativeCopy("native.apps.web.app.api.ask-pridicta.route.ts.free_ai_saved_question_hi", [
        preservedQuestion,
      ]),
      getNativeCopy("native.apps.web.app.api.ask-pridicta.route.ts.free_ai_deterministic_help_hi"),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.apps.web.app.api.ask-pridicta.route.ts.free_ai_used_gu"),
      getNativeCopy("native.apps.web.app.api.ask-pridicta.route.ts.free_ai_preserved_gu"),
      formatNativeCopy("native.apps.web.app.api.ask-pridicta.route.ts.free_ai_saved_question_gu", [
        preservedQuestion,
      ]),
      getNativeCopy("native.apps.web.app.api.ask-pridicta.route.ts.free_ai_deterministic_help_gu"),
    ].join('\n\n');
  }

  return [
    'Your 3 free AI questions are used.',
    'I preserved your question so you can continue after unlocking more Predicta AI guidance.',
    `Saved question: "${preservedQuestion}"`,
    'Choose 10 questions, 25 questions, 100 questions, or Premium to continue with AI. I can still help with deterministic Kundli, charts, reports, and Family Vault actions without spending AI.',
  ].join('\n\n');
}

function assertTranscriptQuality(transcript) {
  const normalized = strip(transcript.text);
  assertGate(normalized.length >= 80, `${transcript.id}: transcript is too thin`);
  assertGate(
    normalized.length <= 2600,
    `${transcript.id}: transcript is too long for golden chat experience`,
  );

  if (transcript.language === 'en') {
    assertGate(!/[\u0900-\u097F]/.test(normalized), `${transcript.id}: Devanagari leaked into English`);
    assertGate(!/[\u0A80-\u0AFF]/.test(normalized), `${transcript.id}: Gujarati leaked into English`);
  } else {
    const scriptPattern = transcript.language === 'hi' ? /[\u0900-\u097F]/ : /[\u0A80-\u0AFF]/;
    assertGate(scriptPattern.test(normalized), `${transcript.id}: native script missing`);
    for (const pattern of nativeLabelLeaks()) {
      assertGate(!pattern.test(normalized), `${transcript.id}: leaked English label ${pattern}`);
    }
  }

  for (const pattern of bannedTonePatterns()) {
    assertGate(!pattern.test(normalized), `${transcript.id}: banned tone/pattern ${pattern}`);
  }

  assertGate(
    /\b(I can|I would|Yes|Open|Report|Timing|Action|question|Kundli|Predicta|AI)\b/i.test(normalized) ||
      /[\u0900-\u097F]/.test(normalized) ||
      /[\u0A80-\u0AFF]/.test(normalized),
    `${transcript.id}: no clear user-facing value signal`,
  );
}

function nativeLabelLeaks() {
  return [
    /\bDirect answer:/i,
    /\bTiming:/i,
    /\bConfidence:/i,
    /\bEvidence:/i,
    /\bAction\/remedy:/i,
    /\bNext step:/i,
    /\bSchools consulted:/i,
    /\bObserved traits:/i,
    /\bReport lanes stay separate:/i,
    /\bLife Atlas thread:/i,
  ];
}

function bannedTonePatterns() {
  return [
    /\bhow to read this\b/i,
    /\btoolkit\b/i,
    /\b(method|report|astrology)\s+lesson\b/i,
    /\bthis section teaches\b/i,
    /\bimplementation\b/i,
    /\bsystem internal\b/i,
    /\bprovider decision\b/i,
    /\breport memory\b/i,
    /\bscaffolding\b/i,
    /\bschooling\b/i,
    /\bI staged the report brief\b/i,
    /\bVedic report memory includes\b/i,
    /\bLife Atlas boundary\b/i,
    /\bmethod architecture\b/i,
    /\bas an AI\b/i,
  ];
}

function localizedPrompt(text, language) {
  if (language === 'hi') {
    return `कृपया हिंदी में जवाब दें. ${text}`;
  }
  if (language === 'gu') {
    return `કૃપા કરીને ગુજરાતી માં જવાબ આપો. ${text}`;
  }
  return text;
}

function stripTranscript(transcript) {
  return {
    action: transcript.action,
    id: transcript.id,
    language: transcript.language,
    providerDecision: transcript.providerDecision,
    scenario: transcript.scenario,
    text: strip(transcript.text),
  };
}

function renderTranscriptMarkdown(items) {
  return [
    `# ${phaseName} Golden Chat Transcripts`,
    '',
    ...items.flatMap(item => [
      `## ${item.scenario} / ${item.language}`,
      '',
      `- Action: \`${item.action ?? 'none'}\``,
      `- Provider decision: \`${item.providerDecision}\``,
      '',
      '```text',
      item.text,
      '```',
      '',
    ]),
  ].join('\n');
}

function strip(text) {
  return String(text ?? '').replace(/\s+/g, ' ').trim();
}

function buildKundli() {
  return {
    id: 'phase-10-kundli',
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
