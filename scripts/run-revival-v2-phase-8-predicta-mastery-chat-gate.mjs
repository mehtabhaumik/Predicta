import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import Module from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const repoRoot = process.cwd();
const phaseName =
  'PREDICTA_REVIVAL_V2_PHASE_8_PREDICTA_MASTERY_AND_NO_SCHOOLING_CHAT_GATE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

installTypeScriptRequireHook();
installWorkspaceAliasResolver();

const failures = [];
const {
  buildPredictaChatHref,
} = require('../apps/web/lib/predicta-chat-cta.ts');

assertRoadmapContract();
assertSourceHandoffContracts();
assertPredictaMemoryContract();
assertChatTranscriptContract();
const hrefAudit = assertCtaHrefContract();

if (failures.length) {
  throw new assert.AssertionError({
    message: `${phaseName} failed:\n- ${failures.join('\n- ')}`,
  });
}

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'handoff-url-audit.json'),
  `${JSON.stringify(hrefAudit, null, 2)}\n`,
);
writeFileSync(
  path.join(auditRoot, 'phase-8-manifest.json'),
  `${JSON.stringify(
    {
      phase: phaseName,
      status: 'GREEN',
      strictAudit: true,
      checks: [
        'roadmap Phase 8 contract is present',
        'web Predicta CTA URLs carry source, selected section, school, report, and handoff context',
        'web chat hydrates URL context, preserves pre-auth questions, stores specialist memory, and normalizes room-safe context',
        'mobile context builder carries generated report context, active context, app memory digest, and report section memory',
        'Predicta memory contains section-aware handoff rules for Vedic, KP, Jaimini, Numerology, Signature, Life Atlas, and Kundli Karma',
        'golden chat transcripts cover all major worlds and report handoffs in English, Hindi, and Gujarati',
        'no-schooling/toolkit/internal-language patterns are rejected in transcript artifacts',
      ],
      handoffSamples: hrefAudit.map(item => ({
        id: item.id,
        sourceScreen: item.params.sourceScreen,
        school: item.params.school,
        reportFocus: item.params.reportFocus,
        selectedSection: item.params.selectedSection,
      })),
    },
    null,
    2,
  )}\n`,
);
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: GREEN`,
    '',
    'Verified by scripts/run-revival-v2-phase-8-predicta-mastery-chat-gate.mjs.',
    'Golden chat transcript coverage is delegated to and checked from PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT.',
    'Every checked handoff URL carries source context; report handoffs carry report focus/mode/lane/section metadata; specialist room handoffs carry room-safe school context.',
    '',
  ].join('\n'),
);

console.log(
  `${phaseName} passed: Predicta source-context handoffs, golden chat transcripts, and no-schooling mastery gates are green.`,
);

function assertRoadmapContract() {
  const roadmap = read('docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md');
  const packageJson = JSON.parse(read('package.json'));

  [
    phaseName,
    'Make the app UI and chat reinforce the same prediction-first experience.',
    'Every page handoff into Predicta carries source context.',
    'Predicta gives direct answers, not lessons, unless user asks to learn.',
    'App surfaces do not promise what chat/report context cannot explain.',
    'Golden chat transcripts pass for all major worlds and report handoffs.',
  ].forEach(fragment =>
    assertGate(roadmap.includes(fragment), `roadmap missing ${fragment}`),
  );

  assertGate(
    packageJson.scripts?.['test:revival-v2-phase-8'] ===
      'node scripts/run-revival-v2-phase-8-predicta-mastery-chat-gate.mjs',
    'package.json must expose test:revival-v2-phase-8',
  );
}

function assertSourceHandoffContracts() {
  const cta = read('apps/web/lib/predicta-chat-cta.ts');
  const webChat = read('apps/web/components/WebPridictaChat.tsx');
  const webMemory = read('apps/web/lib/web-auto-save-memory.ts');
  const mobileContext = read('apps/mobile/src/services/ai/contextBuilder.ts');
  const mobileStore = read('apps/mobile/src/store/useAppStore.ts');
  const followUps = read('packages/astrology/src/chatFollowUps.ts');

  [
    "sourceScreen: string",
    "handoffMode?: 'main_synthesis' | 'room_safe'",
    'handoffQuestion?: string',
    'reportAvailableSections?: string[]',
    'reportFocus?: string',
    'reportMode?: ReportMemoryDepth',
    'reportSchoolLane?: ReportSchoolLaneId',
    'reportSectionId?: string',
    'reportSectionPrompt?: string',
    'reportSectionTitle?: string',
    "setParam(params, 'sourceScreen', context.sourceScreen)",
    "setParam(params, 'prompt', context.prompt ?? context.selectedSection)",
    "'autoSend'",
    "setParam(params, 'school', context.school)",
    "setParam(params, 'from', context.from)",
    "setParam(params, 'handoffQuestion', context.handoffQuestion)",
    "setParam(params, 'selectedSection', context.selectedSection)",
    "setParam(params, 'reportFocus', context.reportFocus)",
    "setParam(params, 'reportMode', context.reportMode)",
    "setParam(params, 'reportSchoolLane', context.reportSchoolLane)",
    "setListParam(params, 'reportAvailableSections', context.reportAvailableSections)",
    "setListParam(params, 'reportSelectedSections', context.reportSelectedSections)",
  ].forEach(fragment => assertIncludes(cta, fragment, 'web Predicta CTA helper'));

  [
    'normalizeContextForRoom',
    'syncSpecialistContext',
    'persistActiveChatContext',
    'hydrateWebSpecialistContextSync',
    'saveWebSpecialistPredictaContext',
    'chartContextFromParams',
    'ctaContextFromParams',
    'buildSchoolContextIntro',
    'buildCtaContextIntro',
    'formatEvidenceHandoffLine',
    'Your question is ready',
    'Context carried into Predicta',
    'Predicta will keep this question ready after sign-in',
  ].forEach(fragment => assertIncludes(webChat, fragment, 'web Predicta chat'));

  [
    'buildWebSpecialistPredictaContextSnapshot',
    'handoffFrom: context.handoffFrom',
    'handoffQuestion: context.handoffQuestion',
    'selectedSection: context.selectedSection',
    'reportFocus: context.reportFocus',
    'reportMode: context.reportMode',
    'reportSchoolLane: context.reportSchoolLane',
    'reportSectionTitle: context.reportSectionTitle',
    'sourceScreen: context.sourceScreen',
  ].forEach(fragment => assertIncludes(webMemory, fragment, 'web auto-save memory'));

  [
    'buildGeneratedReportMemoryContext',
    'generatedReportContext',
    'reportSectionMemory',
    'findPredictaReportSectionMemory',
    'activeContext: chartContext',
    'appMemoryDigest: PREDICTA_APP_MEMORY_DIGEST',
    'chartContext.reportFocus',
    'chartContext.reportAvailableSections',
    'chartContext.reportSelectedSections',
  ].forEach(fragment => assertIncludes(mobileContext, fragment, 'mobile AI context builder'));

  [
    'context?.sourceScreen',
    'context?.selectedSection',
    "context?.predictaSchool === 'KP'",
    "context?.predictaSchool === 'JAIMINI'",
    "context?.predictaSchool === 'NADI'",
    "return 'JAIMINI'",
  ].forEach(fragment => assertIncludes(mobileStore, fragment, 'mobile chat session context'));

  [
    'buildSchoolHandoffHref',
    "setHrefParam(params, 'handoffQuestion', context.handoffQuestion)",
    "setHrefParam(params, 'from', context.handoffFrom)",
    "setHrefParam(params, 'school', context.predictaSchool)",
    "setHrefParam(params, 'sourceScreen', context.sourceScreen)",
    "params.set('handoffMode', 'room_safe')",
  ].forEach(fragment => assertIncludes(followUps, fragment, 'chat follow-up handoffs'));

  assertNoRawAskWithoutSource();
}

function assertPredictaMemoryContract() {
  const memory = read('packages/config/src/predictaMemory.ts');

  [
    'Predicta must try deterministic app actions, saved context, generatedReportContext, reportSectionMemory, and local memory before spending AI.',
    'Vedic report/chat handoff: answer the life prediction first',
    'KP report/chat handoff: answer the event verdict first',
    'Jaimini report/chat handoff: answer soul role and destiny direction first',
    'Numerology report/chat handoff: answer the number-cycle meaning first',
    'Signature report/chat handoff: answer only from confirmed visible traits',
    'Life Atlas report/chat handoff: answer the human life chapter first',
    'Kundli Karma handoff: answer Dosh, Shrap, Yog, and Lal Kitab',
    'Report chat mastery follows the same rhythm as the PDFs: prediction and guidance first, school-specific evidence second, practical action third, safety/limits last.',
    'If a preview promises prediction, timing, evidence, or paid depth, the generated report and generatedReportContext must be able to explain it.',
  ].forEach(fragment => assertIncludes(memory, fragment, 'Predicta memory'));
}

function assertChatTranscriptContract() {
  const verification = read(
    'docs/audits/PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT/verification.txt',
  );
  const transcripts = JSON.parse(
    read('docs/audits/PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT/golden-chat-transcripts.json'),
  );
  const manifest = JSON.parse(
    read('docs/audits/PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT/phase-10-manifest.json'),
  );

  assertIncludes(
    verification,
    'PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT: GREEN',
    'golden chat verification',
  );
  assertGate(manifest.transcriptCount === 39, 'golden chat manifest must contain 39 transcripts');
  assertGate(transcripts.length === 39, 'golden chat transcript artifact must contain 39 transcripts');

  for (const language of ['en', 'hi', 'gu']) {
    assertGate(
      transcripts.some(item => item.language === language),
      `golden transcripts missing ${language}`,
    );
  }

  for (const scenario of [
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
  ]) {
    assertGate(
      transcripts.some(item => item.scenario === scenario),
      `golden transcripts missing scenario ${scenario}`,
    );
  }

  const banned = [
    /\bhow to read this\b/i,
    /\btoolkit\b/i,
    /\bmethod lesson\b/i,
    /\bschooling\b/i,
    /\bimplementation\b/i,
    /\bsystem internal\b/i,
    /\bprovider decision\b/i,
    /\breport memory\b/i,
    /\bscaffolding\b/i,
    /\bas an AI\b/i,
  ];
  for (const item of transcripts) {
    assertGate(item.text.length >= 80, `${item.id} transcript too thin`);
    assertGate(item.text.length <= 2600, `${item.id} transcript too long`);
    for (const pattern of banned) {
      assertGate(!pattern.test(item.text), `${item.id} contains banned chat tone ${pattern}`);
    }
  }
}

function assertCtaHrefContract() {
  const samples = [
    {
      id: 'vedic-room',
      context: {
        handoffMode: 'room_safe',
        handoffQuestion: 'What is my current Mahadasha asking me to do?',
        prompt: 'Give my Vedic prediction first, then the dasha proof.',
        school: 'PARASHARI',
        selectedSection: 'Mahadasha Phala',
        sourceScreen: 'Vedic Room',
      },
      expected: {
        autoSend: 'true',
        handoffMode: 'room_safe',
        school: 'PARASHARI',
        sourceScreen: 'Vedic Room',
      },
    },
    {
      id: 'kp-room',
      context: {
        from: 'PARASHARI',
        handoffMode: 'room_safe',
        handoffQuestion: 'Will my promotion happen in the next six months?',
        prompt: 'Answer the promotion verdict first.',
        school: 'KP',
        selectedSection: 'KP event verdict',
        sourceScreen: 'KP Predicta',
      },
      expected: {
        from: 'PARASHARI',
        handoffMode: 'room_safe',
        school: 'KP',
        sourceScreen: 'KP Predicta',
      },
    },
    {
      id: 'jaimini-room',
      context: {
        handoffMode: 'room_safe',
        handoffQuestion: 'What is my soul role and destiny direction?',
        prompt: 'Answer my Jaimini soul role first.',
        school: 'JAIMINI',
        selectedSection: 'Jaimini soul role',
        sourceScreen: 'Jaimini Predicta',
      },
      expected: {
        handoffMode: 'room_safe',
        school: 'JAIMINI',
        sourceScreen: 'Jaimini Predicta',
      },
    },
    {
      id: 'numerology-room',
      context: {
        handoffMode: 'room_safe',
        prompt: 'What is my current number cycle saying?',
        school: 'NUMEROLOGY',
        selectedSection: 'Personal year cycle',
        sourceScreen: 'Numerology Predicta',
      },
      expected: {
        handoffMode: 'room_safe',
        school: 'NUMEROLOGY',
        sourceScreen: 'Numerology Predicta',
      },
    },
    {
      id: 'signature-room',
      context: {
        handoffMode: 'room_safe',
        prompt: 'Explain only my confirmed visible signature traits.',
        school: 'SIGNATURE',
        selectedSection: 'Confirmed Signature Trait Map',
        sourceScreen: 'Signature Predicta',
      },
      expected: {
        handoffMode: 'room_safe',
        school: 'SIGNATURE',
        sourceScreen: 'Signature Predicta',
      },
    },
    {
      id: 'life-atlas-report',
      context: {
        prompt: 'Explain my Life Atlas hidden thread first.',
        reportAvailableSections: ['Opening Soul Portrait', 'Hidden Thread', 'Current Life Chapter'],
        reportFocus: 'LIFE_ATLAS',
        reportMode: 'PREMIUM',
        reportSchoolLane: 'SYNTHESIS',
        reportSectionId: 'hidden-thread',
        reportSectionTitle: 'Hidden Thread',
        reportSelectedSections: ['Opening Soul Portrait', 'Hidden Thread'],
        reportSubjectName: 'Bhaumik Mehta',
        reportType: 'Premium Predicta Life Atlas',
        selectedSection: 'Hidden Thread',
        sourceScreen: 'Report',
      },
      expected: {
        autoSend: 'true',
        reportFocus: 'LIFE_ATLAS',
        reportMode: 'PREMIUM',
        reportSchoolLane: 'SYNTHESIS',
        reportSectionTitle: 'Hidden Thread',
        sourceScreen: 'Report',
      },
    },
    {
      id: 'kundli-karma',
      context: {
        prompt: 'Explain this Dosh without fear and give one remedy.',
        school: 'PARASHARI',
        selectedKundliKarmaEvidenceSummary: 'Saturn and Rahu pressure is active but mitigated.',
        selectedKundliKarmaItemId: 'shrapit-dosh',
        selectedKundliKarmaModule: 'dosh',
        selectedKundliKarmaRuleId: 'saturn-rahu-pressure',
        selectedSection: 'Kundli Karma: Shrapit Dosh',
        sourceScreen: 'Kundli Karma Room',
      },
      expected: {
        selectedKundliKarmaItemId: 'shrapit-dosh',
        selectedKundliKarmaModule: 'dosh',
        sourceScreen: 'Kundli Karma Room',
      },
    },
  ];

  return samples.map(sample => {
    const href = buildPredictaChatHref(sample.context);
    assertGate(href.startsWith('/ask?'), `${sample.id}: href must start with /ask?`);
    const params = Object.fromEntries(new URLSearchParams(href.slice('/ask?'.length)));

    Object.entries(sample.expected).forEach(([key, value]) =>
      assertGate(params[key] === value, `${sample.id}: expected ${key}=${value}, got ${params[key]}`),
    );
    assertGate(Boolean(params.sourceScreen), `${sample.id}: sourceScreen missing`);
    assertGate(
      Boolean(params.prompt || params.selectedSection || params.handoffQuestion),
      `${sample.id}: no actionable prompt/section/question`,
    );

    return {
      href,
      id: sample.id,
      params,
    };
  });
}

function assertNoRawAskWithoutSource() {
  const files = [
    'apps/web/components/HeroSection.tsx',
    'apps/web/components/WebProfileSettings.tsx',
    'apps/web/components/WebRedeemPassForm.tsx',
  ];
  for (const file of files) {
    const source = read(file);
    const rawAskMatches = source.match(/\/ask\?[^`"'}\s)]+/g) ?? [];
    for (const href of rawAskMatches) {
      assertGate(
        /sourceScreen=/.test(href),
        `${file}: raw Predicta href must carry sourceScreen (${href})`,
      );
    }
  }
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function installTypeScriptRequireHook() {
  require.extensions['.ts'] = require.extensions['.tsx'] = (module, filename) => {
    const source = readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        resolveJsonModule: true,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: filename,
    }).outputText;
    module._compile(output, filename);
  };
}

function installWorkspaceAliasResolver() {
  const originalResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function resolveWorkspaceAlias(request, parent, isMain, options) {
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
}
