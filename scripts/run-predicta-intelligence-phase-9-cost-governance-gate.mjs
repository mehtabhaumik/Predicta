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
  'PREDICTA_INTELLIGENCE_PHASE_9_COST_GOVERNANCE_AND_AI_USAGE_PROOF';
const auditDir = path.join(repoRoot, 'docs/audits', phaseName);
const failures = [];
const RealDate = Date;
const fixedAuditDate = new RealDate('2026-06-15T06:30:00.000Z');

globalThis.Date = class PredictaCostGovernanceAuditDate extends RealDate {
  constructor(...args) {
    if (args.length === 0) {
      super(fixedAuditDate.getTime());
      return;
    }
    super(...args);
  }

  static now() {
    return fixedAuditDate.getTime();
  }

  static parse(value) {
    return RealDate.parse(value);
  }

  static UTC(...args) {
    return RealDate.UTC(...args);
  }
};

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
  'docs/audits/PREDICTA_MONETIZATION_PHASE_8_AI_COST_GOVERNANCE_AND_ABUSE_PROTECTION/ai-cost-governance-audit.md',
  'packages/config/src/predictaAiUsageProof.ts',
  'packages/config/src/aiCostGovernance.ts',
  'packages/astrology/src/predictaChatActions.ts',
  'apps/web/app/api/ask-pridicta/route.ts',
  'backend/astro_api/ai.py',
  'backend/astro_api/ai_telemetry.py',
  'backend/astro_api/ai_routing_policy.py',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const packageJson = JSON.parse(read('package.json'));
assertGate(
  packageJson.scripts?.['test:predicta-intelligence-phase-9'] ===
    'node scripts/run-predicta-intelligence-phase-9-cost-governance-gate.mjs',
  'package.json must expose test:predicta-intelligence-phase-9',
);

const roadmap = read('docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md');
[
  phaseName,
  'Protect AI cost while improving intelligence.',
  'Telemetry for every provider decision.',
  'Proof that deterministic/local-memory paths avoid AI.',
  'AI only for true synthesis, premium writing, nuanced follow-up, or paid',
  'Clear exhausted-credit behavior.',
  'A shared AI usage proof contract',
  'No free or zero-credit path can invoke Gemini validator or premium models.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'intelligence roadmap phase 9'));

const proofSource = read('packages/config/src/predictaAiUsageProof.ts');
[
  'PREDICTA_AI_USAGE_PROOF_VERSION',
  'PREDICTA_LOCAL_MEMORY_ACTIONS',
  'PREDICTA_DETERMINISTIC_ACTIONS',
  'PREDICTA_AI_ALLOWED_INTENT_CATEGORIES',
  'PREDICTA_ZERO_CREDIT_CAPABILITIES',
  'PREDICTA_EXHAUSTED_CREDIT_BEHAVIOR',
  'predictaProviderDecisionForAction',
].forEach(fragment => assertIncludes(proofSource, fragment, 'AI usage proof contract'));

for (const capability of [
  'birth_detail_parsing',
  'kundli_creation',
  'saved_kundli_actions',
  'chart_snapshot',
  'mahadasha_summary',
  'gochar_summary',
  'panchang',
  'dosh_shrap_yog_lal_kitab_snapshot',
  'report_navigation',
  'family_vault_navigation',
  'pass_redemption_help',
]) {
  assertIncludes(proofSource, capability, 'zero-credit capability contract');
}

for (const category of [
  'open_ended_personal_synthesis',
  'premium_report_writing',
  'nuanced_follow_up',
  'paid_precision_reading',
]) {
  assertIncludes(proofSource, category, 'AI-allowed category contract');
}

const chatActionsSource = read('packages/astrology/src/predictaChatActions.ts');
[
  'predictaProviderDecisionForAction',
  'providerDecision === \'missing_data_question\'',
  'shouldCallProvider: providerDecision === \'ai_required\'',
  'localMemoryUsed: routerDecision.providerDecision === \'local_memory_answer\'',
].forEach(fragment => assertIncludes(chatActionsSource, fragment, 'Predicta router usage proof'));

const webAskSource = read('apps/web/app/api/ask-pridicta/route.ts');
[
  'aiCostGovernance',
  'entitlementSource',
  'productCreditSource',
  'buildFreeAiUpsellResponse',
  "provider: 'deterministic'",
  'preservedQuestion',
  'I can still help with deterministic Kundli, charts, reports, and Family Vault actions without spending AI.',
  'isProviderAiResponse(response)',
].forEach(fragment => assertIncludes(webAskSource, fragment, 'web ask-pridicta cost proof'));

const backendAiSource = read('backend/astro_api/ai.py');
[
  'record_ai_telemetry_event(',
  'entitlement_source_for_chat(',
  'product_credit_source_for_chat(',
  'allow_gemini_fallback=request.userPlan == "PREMIUM"',
  'evaluate_feature_spend(',
  'provider="deterministic"',
  'actual_model = "jyotish-deterministic-v1"',
  'provider_cached_input_tokens=',
  'provider_input_tokens=',
  'provider_output_tokens=',
].forEach(fragment => assertIncludes(backendAiSource, fragment, 'backend AI telemetry proof'));

const telemetrySource = read('backend/astro_api/ai_telemetry.py');
[
  'DEFAULT_AI_PRICING_USD_PER_MILLION',
  'estimate_cost_usd',
  'entitlementSource=entitlement_source',
  'productCreditSource=product_credit_source',
  'cacheHit=cache_state == "hit"',
  'providerInputTokens=provider_input',
  'providerOutputTokens=provider_output',
].forEach(fragment => assertIncludes(telemetrySource, fragment, 'AI telemetry cost proof'));

const routingSource = read('backend/astro_api/ai_routing_policy.py');
[
  'free-budget: deterministic first, OpenAI mini only, no premium multi-model pipeline',
  'gemini-validator-is-for-paid-premium-reports-only',
  'primary_provider="deterministic"',
].forEach(fragment => assertIncludes(routingSource, fragment, 'routing policy cost proof'));

const {
  PREDICTA_AI_ALLOWED_INTENT_CATEGORIES,
  PREDICTA_DETERMINISTIC_ACTIONS,
  PREDICTA_EXHAUSTED_CREDIT_BEHAVIOR,
  PREDICTA_LOCAL_MEMORY_ACTIONS,
  PREDICTA_ZERO_CREDIT_CAPABILITIES,
  predictaProviderDecisionForAction,
} = require('../packages/config/src/predictaAiUsageProof.ts');
const {
  assertFreeModelAllowed,
  assertGeminiValidatorAllowed,
  evaluateAiFeatureSpend,
} = require('../packages/config/src/aiCostGovernance.ts');
const {
  buildPredictaActionReply,
  classifyPredictaRouterDecision,
} = require('../packages/astrology/src/predictaChatActions.ts');

assertGate(
  PREDICTA_LOCAL_MEMORY_ACTIONS.includes('kundli-karma'),
  'Kundli Karma definition path must be local memory',
);
assertGate(
  PREDICTA_DETERMINISTIC_ACTIONS.includes('create-kundli') &&
    PREDICTA_DETERMINISTIC_ACTIONS.includes('mahadasha') &&
    PREDICTA_DETERMINISTIC_ACTIONS.includes('transit-gochar') &&
    PREDICTA_DETERMINISTIC_ACTIONS.includes('report') &&
    PREDICTA_DETERMINISTIC_ACTIONS.includes('pass-redemption'),
  'deterministic action contract must include core zero-credit app actions',
);
assertGate(
  PREDICTA_AI_ALLOWED_INTENT_CATEGORIES.includes('open_ended_personal_synthesis') &&
    PREDICTA_AI_ALLOWED_INTENT_CATEGORIES.includes('paid_precision_reading'),
  'AI-allowed categories must be explicit and narrow',
);
assertGate(
  PREDICTA_ZERO_CREDIT_CAPABILITIES.length >= 12,
  'zero-credit capability list must be broad enough to keep Predicta useful after credits are exhausted',
);
assertGate(
  PREDICTA_EXHAUSTED_CREDIT_BEHAVIOR.provider === 'deterministic' &&
    PREDICTA_EXHAUSTED_CREDIT_BEHAVIOR.preserveQuestion,
  'exhausted-credit behavior must be deterministic and preserve the question',
);

const kundli = buildKundli();
const deterministicSamples = [
  {
    id: 'create-kundli-no-ai',
    expectedAction: 'create-kundli',
    expectedDecision: 'deterministic_action',
    kundli: undefined,
    text: 'Create a Kundli for me',
  },
  {
    id: 'saved-kundli-no-ai',
    expectedAction: 'saved-kundlis',
    expectedDecision: 'deterministic_action',
    kundli,
    text: 'Switch my saved Kundli',
  },
  {
    id: 'mahadasha-no-ai',
    expectedAction: 'mahadasha',
    expectedDecision: 'deterministic_action',
    kundli,
    text: 'Show my current Mahadasha',
  },
  {
    id: 'gochar-no-ai',
    expectedAction: 'transit-gochar',
    expectedDecision: 'deterministic_action',
    kundli,
    text: 'Show today Gochar transit summary',
  },
  {
    id: 'panchang-no-ai',
    expectedAction: 'personal-panchang',
    expectedDecision: 'deterministic_action',
    kundli,
    text: 'Show my personal Panchang',
  },
  {
    id: 'report-navigation-no-ai',
    expectedAction: 'report',
    expectedDecision: 'deterministic_action',
    kundli,
    text: 'Open my reports and download free Kundli report',
  },
  {
    id: 'family-vault-no-ai',
    expectedAction: 'family-map',
    expectedDecision: 'deterministic_action',
    kundli,
    text: 'Open Family Vault comparison',
  },
  {
    id: 'pass-help-no-ai',
    expectedAction: 'pass-redemption',
    expectedDecision: 'deterministic_action',
    kundli,
    text: 'How many AI credits are left in my pass?',
  },
  {
    id: 'kundli-karma-definition-local-memory',
    expectedAction: 'kundli-karma',
    expectedDecision: 'local_memory_answer',
    kundli: undefined,
    text: 'What is Dosh Shrap Yog and Lal Kitab?',
  },
];

const transcript = [];
for (const sample of deterministicSamples) {
  const reply = buildPredictaActionReply({
    aiCreditsExhausted: true,
    kundli: sample.kundli,
    language: 'en',
    text: sample.text,
  });
  assertGate(reply.handled, `${sample.id}: must be handled locally`);
  assertGate(
    reply.action === sample.expectedAction,
    `${sample.id}: expected action ${sample.expectedAction}, got ${reply.action}`,
  );
  assertGate(
    reply.providerDecision === sample.expectedDecision,
    `${sample.id}: expected provider decision ${sample.expectedDecision}, got ${reply.providerDecision}`,
  );
  assertGate(
    reply.providerDecision !== 'ai_required' &&
      reply.providerDecision !== 'blocked_needs_credit',
    `${sample.id}: zero-credit capability must not require AI or credits`,
  );
  transcript.push({
    id: sample.id,
    action: reply.action,
    providerDecision: reply.providerDecision,
    preview: strip(reply.text ?? '').slice(0, 260),
  });
}

const openEndedDecision = classifyPredictaRouterDecision({
  aiCreditsExhausted: false,
  kundli,
  normalizedText: 'Tell me everything about my destiny in a deeply personal way',
});
assertGate(
  openEndedDecision.shouldCallProvider &&
    openEndedDecision.providerDecision === 'ai_required' &&
    openEndedDecision.reason === 'open_ended_ai_required',
  'open-ended synthesis must be AI-gated when credits are available',
);

const exhaustedDecision = classifyPredictaRouterDecision({
  aiCreditsExhausted: true,
  kundli,
  normalizedText: 'Tell me everything about my destiny in a deeply personal way',
});
assertGate(
  !exhaustedDecision.shouldCallProvider &&
    exhaustedDecision.providerDecision === 'blocked_needs_credit' &&
    exhaustedDecision.reason === 'open_ended_blocked_needs_credit',
  'open-ended synthesis must be blocked without spending AI when credits are exhausted',
);

const missingDataDecision = classifyPredictaRouterDecision({
  action: 'mahadasha',
  aiCreditsExhausted: true,
  kundli: undefined,
  normalizedText: 'Show my current Mahadasha',
});
assertGate(
  !missingDataDecision.shouldCallProvider &&
    missingDataDecision.providerDecision === 'missing_data_question',
  'missing Kundli must ask for data without spending AI',
);

assertGate(
  predictaProviderDecisionForAction('kundli-karma') === 'local_memory_answer',
  'shared proof contract must classify Kundli Karma as local memory',
);
assertGate(
  predictaProviderDecisionForAction('mahadasha') === 'deterministic_action',
  'shared proof contract must classify Mahadasha as deterministic',
);
assertGate(
  predictaProviderDecisionForAction('unknown-open-ended') === 'ai_required',
  'unknown open-ended intent must require AI only after entitlement checks',
);

assertGate(
  assertFreeModelAllowed('gpt-5.4-mini').allowed &&
    !assertFreeModelAllowed('gpt-5.5').allowed,
  'free model governance must allow mini and block premium',
);
assertGate(
  !assertGeminiValidatorAllowed({
    paidPremiumReport: false,
    userPlan: 'FREE',
  }).allowed &&
    assertGeminiValidatorAllowed({
      paidPremiumReport: true,
      userPlan: 'PREMIUM',
    }).allowed,
  'Gemini validator governance must block free and allow paid premium report',
);
assertGate(
  !evaluateAiFeatureSpend({
    estimatedCostUsd: 999,
    feature: 'freeChatAnswer',
  }).allowed,
  'free chat spend stop threshold must block unsafe cost',
);

if (failures.length) {
  throw new assert.AssertionError({
    message: `${phaseName} failed:\n- ${failures.join('\n- ')}`,
  });
}

mkdirSync(auditDir, { recursive: true });
writeFileSync(
  path.join(auditDir, 'phase-9-ai-usage-proof-audit.md'),
  [
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    'GREEN when this gate passes. Predicta now has an explicit AI usage proof contract instead of relying on scattered cost-control assumptions.',
    '',
    '## Strict Proof',
    '',
    '- Local-memory and deterministic app actions are listed in `packages/config/src/predictaAiUsageProof.ts`.',
    '- The chat router uses the shared proof contract for provider decisions.',
    '- Zero-credit samples prove Kundli creation, saved Kundlis, Mahadasha, Gochar, Panchang, reports, Family Vault, pass help, and Kundli Karma definition do not require AI.',
    '- Open-ended synthesis is AI-gated only when credits are available and blocked into deterministic preserved-question upsell when credits are exhausted.',
    '- Backend telemetry records provider, model, entitlement source, product credit source, cache state, provider token usage, estimated tokens, and estimated cost.',
    '',
    '## Required Gate',
    '',
    '```bash',
    'corepack pnpm test:predicta-intelligence-phase-9',
    'corepack pnpm test:monetization-phase-8',
    '```',
    '',
  ].join('\n'),
);
writeFileSync(
  path.join(auditDir, 'phase-9-manifest.json'),
  `${JSON.stringify(
    {
      phase: phaseName,
      status: 'green',
      strictAudit: true,
      aiAllowedCategories: [...PREDICTA_AI_ALLOWED_INTENT_CATEGORIES],
      exhaustedCreditBehavior: PREDICTA_EXHAUSTED_CREDIT_BEHAVIOR,
      providerAssertions: {
        deterministicSamplesAvoidAi: true,
        exhaustedOpenEndedDoesNotCallProvider: true,
        freeGeminiValidatorBlocked: true,
        freePremiumModelBlocked: true,
        openEndedSynthesisAiGated: true,
      },
      transcript,
      zeroCreditCapabilities: [...PREDICTA_ZERO_CREDIT_CAPABILITIES],
    },
    null,
    2,
  )}\n`,
);
writeFileSync(
  path.join(auditDir, 'verification.txt'),
  [
    `${phaseName}: GREEN`,
    '',
    'Verified by scripts/run-predicta-intelligence-phase-9-cost-governance-gate.mjs.',
    'Companion governance gate required: corepack pnpm test:monetization-phase-8.',
    '',
    'Next phase:',
    'PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT',
    '',
  ].join('\n'),
);

console.log(`${phaseName}: passed`);

function strip(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function buildKundli() {
  return {
    id: 'phase-9-kundli',
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
