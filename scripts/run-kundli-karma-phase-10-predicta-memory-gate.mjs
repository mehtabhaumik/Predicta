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
const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_10_PREDICTA_INTELLIGENCE_LOCAL_MEMORY_INTEGRATION';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveWorkspaceAlias(request, parent, isMain, options) {
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

const {
  buildPredictaActionReply,
} = require('../packages/astrology/src/predictaChatActions.ts');
const {
  buildAIContext,
} = require('../packages/ai/src/contextBuilder.ts');
const {
  buildAIContext: buildMobileAIContext,
} = require('../apps/mobile/src/services/ai/contextBuilder.ts');

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

const roadmap = read('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md');
[
  phaseName,
  'Add Kundli Karma modules to Predicta memory',
  'Add Jaimini Jyotish alias handling',
  'local_memory_answer',
  'deterministic_action',
  'missing_data_question',
  'ai_required',
  'blocked_needs_credit',
  'No OpenAI/Gemini call is made for deterministic/local-memory answers.',
  'AI-credit exhaustion does not block deterministic Kundli Karma explanations.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 10 roadmap'));

const chatSource = read('packages/astrology/src/predictaChatActions.ts');
[
  "'kundli-karma'",
  'PredictaProviderDecisionLabel',
  'buildKundliKarmaLocalMemoryReply',
  'composeKundliKarmaSnapshot',
  'composeKundliKarmaDoshIntelligence',
  'composeKundliKarmaShrapIntelligence',
  'composeKundliKarmaYogIntelligence',
  'composeKundliKarmaLalKitabIntelligence',
  'isGeminiJyotishAlias',
  "'local_memory_answer'",
].forEach(fragment => assertIncludes(chatSource, fragment, 'Predicta chat local-memory source'));

const webContextSource = read('packages/ai/src/contextBuilder.ts');
const mobileContextSource = read('apps/mobile/src/services/ai/contextBuilder.ts');
[
  'kundliKarmaIntelligence: compactKundliKarmaMemory(kundliData)',
  'composeKundliKarmaSnapshot',
  'composeKundliKarmaDoshIntelligence',
  'composeKundliKarmaShrapIntelligence',
  'composeKundliKarmaYogIntelligence',
  'composeKundliKarmaLalKitabIntelligence',
].forEach(fragment => {
  assertIncludes(webContextSource, fragment, 'web/shared AI context Kundli Karma memory');
  assertIncludes(mobileContextSource, fragment, 'mobile AI context Kundli Karma memory');
});

const webChatSource = read('apps/web/components/WebPridictaChat.tsx');
const mobileChatSource = read('apps/mobile/src/screens/ChatScreen.tsx');
assertIncludes(webChatSource, 'chartContext: messageContext', 'web chat passes selected Kundli Karma context');
assertIncludes(mobileChatSource, 'chartContext: activeChartContext', 'mobile chat passes selected Kundli Karma context');
assertIncludes(webChatSource, 'actionReply.providerDecision', 'web chat records provider decision');
assertIncludes(mobileChatSource, 'actionReply.providerDecision', 'mobile chat records provider decision');

const kundli = buildKundli('phase-10-memory', [
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
const challengingKundli = buildKundli('phase-10-challenging-yog', [
  p('Sun', 'Pisces', 5, 335, 8),
  p('Moon', 'Gemini', 12, 72, 6),
  p('Mars', 'Gemini', 8, 68, 2),
  p('Mercury', 'Virgo', 18, 168, 6),
  p('Jupiter', 'Capricorn', 22, 292, 1),
  p('Venus', 'Libra', 14, 194, 4),
  p('Saturn', 'Cancer', 20, 110, 12),
  p('Rahu', 'Pisces', 7, 337, 8),
  p('Ketu', 'Virgo', 7, 157, 2),
]);

const definition = reply('What is Dosh and Shrap?');
assertHandled(definition, 'kundli-karma', 'local_memory_answer', 'definition question');
assert.match(definition.text, /Dosh.*Shrap.*Yog.*Lal Kitab/s, 'definition covers all modules');
assert.match(definition.text, /No AI credit is needed/i, 'definition is zero-credit local memory');

const topDosh = reply('Explain my strongest Dosh', { kundli });
assertHandled(topDosh, 'kundli-karma', 'local_memory_answer', 'top Dosh');
assert.match(topDosh.text, /Why this appears:/, 'Dosh answer explains why present');
assert.match(topDosh.text, /Evidence:/, 'Dosh answer includes evidence');
assert.match(topDosh.text, /Activation:/, 'Dosh answer includes activation');
assert.match(topDosh.text, /Free safe remedy:/, 'Dosh free answer includes free remedy');

const shrap = reply('Explain my strongest Shrap indicator', { kundli });
assertHandled(shrap, 'kundli-karma', 'local_memory_answer', 'Shrap indicator');
assert.match(shrap.text, /Shrap|Rin|debt/i, 'Shrap answer names Shrap/Rin safely');
assert.doesNotMatch(shrap.text, /you are cursed/i, 'Shrap answer avoids cursed language');

const supportive = reply('Show my supportive Yog', { kundli });
assertHandled(supportive, 'kundli-karma', 'local_memory_answer', 'supportive Yog');
assert.match(supportive.text, /Yog/i, 'supportive Yog answer names Yog');

const challenging = reply('Show my challenging Yog', { kundli: challengingKundli });
assertHandled(challenging, 'kundli-karma', 'local_memory_answer', 'challenging Yog');
assert.match(challenging.text, /What it means for you:/, 'challenging Yog explains user meaning');

const lalKitab = reply('Give my Lal Kitab upay', { kundli });
assertHandled(lalKitab, 'kundli-karma', 'local_memory_answer', 'Lal Kitab upay');
assert.match(lalKitab.text, /Lal Kitab|Rin|upay|remedy/i, 'Lal Kitab answer includes remedy language');

const notPresent = reply('Why is Nadi Dosh not present?', { kundli });
assertHandled(notPresent, 'kundli-karma', 'local_memory_answer', 'not present or blocked context');
assert.match(notPresent.text, /blocked for this context|not present/i, 'not-present/blocked-context answer is honest');

const pending = reply('Explain my Preta Shrap', { kundli });
assertHandled(pending, 'kundli-karma', 'local_memory_answer', 'pending evidence');
assert.match(pending.text, /pending|not enough clean evidence|honest/i, 'pending answer is honest');

const premium = reply('Explain my strongest Dosh', {
  hasPremiumAccess: true,
  kundli,
});
assert.match(premium.text, /Premium remedy depth|Premium depth is active/i, 'premium depth is richer');
assert.notEqual(premium.text, topDosh.text, 'free and premium text differ');

const roomBoundary = reply('Explain my strongest Dosh', {
  kundli,
  predictaSchool: 'KP',
});
assertHandled(roomBoundary, 'vedic-handoff', 'deterministic_action', 'room-boundary handoff');
assert.match(roomBoundary.text, /Vedic|Parashari/i, 'KP room hands Vedic Kundli Karma to Vedic');

const alias = reply('Can Gemini Jyotish explain my Atmakaraka?', { kundli });
assertHandled(alias, 'jaimini-handoff', 'deterministic_action', 'Gemini Jyotish alias');
assert.match(alias.text, /Jaimini Jyotish/i, 'Gemini Jyotish alias points to Jaimini');
assert.match(alias.text, /AI-provider terminology/i, 'alias preserves Gemini provider boundary');

const exhausted = reply('Explain my strongest Dosh', {
  aiCreditsExhausted: true,
  kundli,
});
assertHandled(exhausted, 'kundli-karma', 'local_memory_answer', 'exhausted AI credits still local');
assert.match(exhausted.text, /No AI credit is needed/i, 'AI exhaustion does not block deterministic Kundli Karma');

const missed = reply('Write a deep poetic essay about my life', {
  aiCreditsExhausted: true,
  kundli,
});
assert.equal(missed.handled, false, 'open-ended unmatched prompt is not falsely handled');
assert.equal(missed.providerDecision, 'blocked_needs_credit', 'exhausted open-ended prompt is classified as blocked_needs_credit');

const missingKundli = reply('Explain my strongest Shrap indicator');
assertHandled(missingKundli, 'kundli-karma', 'missing_data_question', 'own Kundli Karma needs Kundli');
assert.match(missingKundli.text, /need your Kundli/i, 'missing Kundli is explained gently');

const sharedContext = buildAIContext(kundli, undefined, 'en', 'FREE');
const mobileContext = buildMobileAIContext(kundli, undefined, 'en', 'FREE');
for (const [label, context] of [['shared', sharedContext], ['mobile', mobileContext]]) {
  assert.ok(context.kundliKarmaIntelligence, `${label} context includes Kundli Karma intelligence`);
  assert.equal(context.kundliKarmaIntelligence.generatedBy, 'deterministic_contract', `${label} context is deterministic`);
  assert.ok(context.kundliKarmaIntelligence.items.length >= 3, `${label} context includes Kundli Karma items`);
  assert.ok(context.kundliKarmaIntelligence.noAiRequiredFor.length >= 3, `${label} context has no-AI hints`);
}

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- Predicta local-memory router handles Dosh, Shrap, Yog, and Lal Kitab as kundli-karma.',
    '- Definition, top Dosh, Shrap indicator, supportive Yog, challenging Yog, Lal Kitab upay, not-present/blocked, pending, and premium-depth matrix passed.',
    '- Gemini Jyotish alias is routed to Jaimini Jyotish while preserving Gemini as provider terminology.',
    '- Provider decisions classify local deterministic answers as local_memory_answer or deterministic_action.',
    '- AI-credit exhaustion does not block deterministic Kundli Karma answers and blocks only unmatched AI-required prompts.',
    '- Web and mobile chat pass selected context and record providerDecision telemetry.',
    '- Shared and mobile AI context builders include compact Kundli Karma deterministic memory.',
    '',
  ].join('\n'),
);

console.log('Kundli Karma Phase 10 gate passed: Predicta local memory, provider-decision labels, web/mobile context, alias handling, and zero-credit deterministic answers are green.');

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
  assert.equal(result.providerDecision, providerDecision, `${label}: provider decision`);
  assert.ok(result.text?.length > 120, `${label}: useful text length`);
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
      name: `Memory Fixture ${id}`,
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
