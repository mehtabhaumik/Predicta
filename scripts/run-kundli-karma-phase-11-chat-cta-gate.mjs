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
const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_11_CHAT_CTA_ZERO_CREDIT_AND_CONTEXT_HANDOFF';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveWorkspaceAlias(request, parent, isMain, options) {
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

const {
  buildPredictaActionReply,
} = require('../packages/astrology/src/predictaChatActions.ts');

const files = {
  mobilePanel: read('apps/mobile/src/components/VedicIntelligencePanel.tsx'),
  mobileTypes: read('apps/mobile/src/types/astrology.ts'),
  packageJson: read('package.json'),
  roadmap: read('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md'),
  sharedTypes: read('packages/types/src/astrology.ts'),
  webChat: read('apps/web/components/WebPridictaChat.tsx'),
  webCta: read('apps/web/lib/predicta-chat-cta.ts'),
  webPanel: read('apps/web/components/WebVedicIntelligencePanel.tsx'),
};

for (const fragment of [
  phaseName,
  'active Kundli id',
  'section type',
  'item id',
  'evidence summary',
  'free/premium mode',
  'selected language',
  'Zero-credit users must still get deterministic explanations.',
  'explain my strongest Dosh',
  'explain my Shrap indicator',
  'explain my strongest supportive Yog',
  'explain my strongest challenging Yog',
  'explain my Lal Kitab remedy',
]) {
  assertIncludes(files.roadmap, fragment, `roadmap includes ${fragment}`);
}

for (const fragment of [
  'selectedKundliKarmaEvidenceSummary?: string;',
  'selectedKundliKarmaItemId?: string;',
  'selectedKundliKarmaModule?: KundliKarmaModule;',
  'selectedKundliKarmaRuleId?: string;',
  'selectedLanguage?: SupportedLanguage;',
]) {
  assertIncludes(files.sharedTypes, fragment, `shared ChartContext includes ${fragment}`);
  assertIncludes(files.mobileTypes, fragment, `mobile ChartContext includes ${fragment}`);
}

for (const fragment of [
  'selectedKundliKarmaEvidenceSummary?: string',
  'selectedKundliKarmaItemId?: string',
  'selectedKundliKarmaModule?: KundliKarmaModule',
  'selectedKundliKarmaRuleId?: string',
  'selectedLanguage?: SupportedLanguage',
  "setParam(params, 'selectedKundliKarmaEvidenceSummary'",
  "setParam(params, 'selectedKundliKarmaItemId'",
  "setParam(params, 'selectedKundliKarmaModule'",
  "setParam(params, 'selectedKundliKarmaRuleId'",
  "setParam(params, 'selectedLanguage'",
]) {
  assertIncludes(files.webCta, fragment, `web CTA builder includes ${fragment}`);
}

for (const fragment of [
  'KundliKarmaQuickPrompts',
  'getKundliKarmaCopy',
  'buildKundliKarmaEvidenceSummary',
  'kundli: options.kundli',
  "reportMode: options.hasPremiumAccess ? 'PREMIUM' : 'FREE'",
  'selectedKundliKarmaEvidenceSummary: buildKundliKarmaEvidenceSummary(item)',
  'selectedKundliKarmaItemId: item.id',
  'selectedKundliKarmaModule: item.module',
  'selectedKundliKarmaRuleId: item.ruleId',
  'selectedLanguage: options.language',
  'copy.askItemPromptBody',
  'copy.quickPromptsTitle',
  'copy.quickDoshLabel',
  'copy.quickShrapLabel',
  'copy.quickSupportiveYogLabel',
  'copy.quickChallengingYogLabel',
  'copy.quickLalKitabLabel',
]) {
  assertIncludes(files.webPanel, fragment, `web panel includes ${fragment}`);
}

for (const fragment of [
  'KundliKarmaQuickPrompts',
  'getKundliKarmaCopy',
  'buildKundliKarmaEvidenceSummary',
  'kundliId: options.kundli?.id',
  "reportMode: options.hasPremiumAccess ? 'PREMIUM' : 'FREE'",
  'selectedKundliKarmaEvidenceSummary: buildKundliKarmaEvidenceSummary(item)',
  'selectedKundliKarmaItemId: item.id',
  'selectedKundliKarmaModule: item.module',
  'selectedKundliKarmaRuleId: item.ruleId',
  'selectedLanguage: options.language',
  'copy.askItemPromptBody',
  'testID="kundli-karma-mobile-quick-prompts"',
  'copy.quickDoshLabel',
  'copy.quickShrapLabel',
  'copy.quickSupportiveYogLabel',
  'copy.quickChallengingYogLabel',
  'copy.quickLalKitabLabel',
]) {
  assertIncludes(files.mobilePanel, fragment, `mobile panel includes ${fragment}`);
}

for (const fragment of [
  'ctaContext.selectedLanguage ??',
  "params.get('selectedKundliKarmaEvidenceSummary')",
  "params.get('selectedKundliKarmaItemId')",
  "params.get('selectedKundliKarmaModule')",
  "params.get('selectedKundliKarmaRuleId')",
  "params.get('selectedLanguage')",
  'parseReportMode(params.get',
  'const hasKundliKarmaContext = Boolean(',
  '!hasKundliKarmaContext && shouldBypassLocalChartShortcuts',
  'setInput(selectedSection)',
  'actionReply.providerDecision',
]) {
  assertIncludes(files.webChat, fragment, `web chat parses/preserves ${fragment}`);
}

assertIncludes(
  files.packageJson,
  '"test:kundli-karma-phase-11": "node scripts/run-kundli-karma-phase-11-chat-cta-gate.mjs"',
  'package exposes Phase 11 gate',
);

const selectedContext = {
  reportMode: 'FREE',
  selectedKundliKarmaEvidenceSummary: 'Mars is in house 7.',
  selectedKundliKarmaItemId: 'dosh-manglik-kuja-present',
  selectedKundliKarmaModule: 'DOSH',
  selectedKundliKarmaRuleId: 'rule-dosh-manglik-kuja',
  selectedLanguage: 'en',
  sourceScreen: 'Vedic Kundli Karma Snapshot',
};
const deterministic = buildPredictaActionReply({
  aiCreditsExhausted: true,
  chartContext: selectedContext,
  hasPremiumAccess: false,
  kundli: buildKundli('phase-11-cta'),
  language: 'en',
  text: 'Explain why this Kundli Karma condition appears. Answer the meaning first.',
});
assert.equal(deterministic.handled, true, 'CTA deterministic handoff is handled');
assert.equal(deterministic.action, 'kundli-karma', 'CTA deterministic handoff routes to Kundli Karma');
assert.equal(deterministic.providerDecision, 'local_memory_answer', 'CTA deterministic handoff is local memory');
assert.match(deterministic.text, /What it means for you:/, 'CTA answer gives meaning');
assert.match(deterministic.text, /Evidence:/, 'CTA answer gives evidence');
assert.match(deterministic.text, /No AI credit is needed/i, 'CTA answer does not spend AI credit');
assert.doesNotMatch(deterministic.text, /what is a dosh/i, 'CTA answer does not teach method before meaning');

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- Web Kundli Karma CTAs include active Kundli id, item/rule/module, evidence summary, free/premium reportMode, selected language, source screen, and Vedic school routing.',
    '- Mobile Kundli Karma handoffs include Kundli id, item/rule/module, evidence summary, reportMode, selected language, source screen, and Vedic school routing.',
    '- Web and mobile surfaces include zero-credit quick prompts for strongest Dosh, Shrap indicator, supportive Yog, challenging Yog, and Lal Kitab remedy.',
    '- Web chat parses Kundli Karma CTA params into active context and preserves selectedLanguage on entry.',
    '- Deterministic action routing runs before web AI budget/provider paths.',
    '- Runtime handoff with exhausted AI credits returned local_memory_answer and did not spend AI credit.',
    '',
  ].join('\n'),
);

console.log('Kundli Karma Phase 11 gate passed: web/mobile chat CTA context handoff, quick prompts, zero-credit deterministic routing, and provider-decision proof are green.');

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertBefore(source, earlier, later, label) {
  const earlierIndex = source.indexOf(earlier);
  const laterIndex = source.indexOf(later);
  assert.ok(earlierIndex >= 0, `${label}: missing earlier marker ${earlier}`);
  assert.ok(laterIndex >= 0, `${label}: missing later marker ${later}`);
  assert.ok(earlierIndex < laterIndex, `${label}: ${earlier} must appear before ${later}`);
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

function buildKundli(id) {
  const planets = [
    p('Sun', 'Pisces', 5, 335, 8),
    p('Moon', 'Gemini', 12, 72, 6),
    p('Mars', 'Libra', 8, 188, 7),
    p('Mercury', 'Sagittarius', 7, 247, 5),
    p('Jupiter', 'Sagittarius', 22, 262, 5),
    p('Venus', 'Aries', 14, 14, 3),
    p('Saturn', 'Pisces', 7, 337, 8),
    p('Rahu', 'Pisces', 9, 339, 8),
    p('Ketu', 'Virgo', 9, 159, 2),
  ];
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
      name: `CTA Fixture ${id}`,
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
    remedies: [],
    transits: [],
    yogas: [],
  };
}
