import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_REVIVAL_V2_PHASE_0_CURRENT_TRUTH_AND_NO_GO_LOCK';
const auditDir = path.join(repoRoot, 'docs/audits', phaseName);
const failures = [];

const requiredPhaseOrder = [
  'PREDICTA_REVIVAL_V2_PHASE_0_CURRENT_TRUTH_AND_NO_GO_LOCK',
  'PREDICTA_REVIVAL_V2_PHASE_1_PRIMARY_ASK_HOME_AND_NAV_CUT',
  'PREDICTA_REVIVAL_V2_PHASE_2_ACTION_FIRST_PAGE_REWRITE',
  'PREDICTA_REVIVAL_V2_PHASE_3_LAYOUT_SPACING_AND_PERSONAL_SPACE_SYSTEM',
  'PREDICTA_REVIVAL_V2_PHASE_4_MOBILE_TABLET_APP_FEEL_REBUILD',
  'PREDICTA_REVIVAL_V2_PHASE_5_KUNDLI_CHART_RENDERING_CONTAINMENT_LOCK',
  'PREDICTA_REVIVAL_V2_PHASE_6_REPORT_EDITORIAL_AND_PREDICTION_REBUILD',
  'PREDICTA_REVIVAL_V2_PHASE_7_REPORT_VISUAL_PREMIUM_AND_PDF_ARTIFACT_GATE',
  'PREDICTA_REVIVAL_V2_PHASE_8_PREDICTA_MASTERY_AND_NO_SCHOOLING_CHAT_GATE',
  'PREDICTA_REVIVAL_V2_PHASE_9_TRANSLATION_ZERO_LEAK_SWEEP',
  'PREDICTA_REVIVAL_V2_PHASE_10_PERFORMANCE_LINK_AND_GOLDEN_JOURNEY_GATE',
];

const evidenceSources = [
  {
    category: 'mobile-tablet-desktop-screenshots',
    path: 'docs/audits/PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT/screenshots',
    minimumFiles: 40,
    requiredFragments: [
      'mobile-360-ask.png',
      'mobile-390-dashboard-report.png',
      'tablet-834-dashboard-kp.png',
      'desktop-1440-dashboard-vedic.png',
    ],
  },
  {
    category: 'golden-user-journey-screenshots',
    path: 'docs/audits/PREDICTA_APP_REVIVAL_PHASE_9_FULL_USER_JOURNEY_GOLDEN_NO_GO_AUDIT/screenshots',
    minimumFiles: 12,
    requiredFragments: [
      'mobile-390-new-visitor-direct-ask.png',
      'mobile-390-zero-credit-deterministic-help.png',
      'desktop-1440-chat-driven-report-composer.png',
    ],
  },
  {
    category: 'competitor-response-screenshots',
    path: 'docs/audits/PREDICTA_COMPETITOR_RESPONSE_PHASE_9_GOLDEN_ARTIFACT_COMPETITOR_NO_GO_REAUDIT/screenshots',
    minimumFiles: 20,
    requiredFragments: [
      'desktop-home-positioning.png',
      'mobile-report-marketplace.png',
      'narrow-mobile-signature-boundary.png',
    ],
  },
  {
    category: 'pdf-golden-artifacts',
    path: 'docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/pdfs',
    minimumFiles: 8,
    requiredFragments: [
      'free-kundli-en.pdf',
      'premium-kundli-en.pdf',
      'kp-report-en.pdf',
      'numerology-report-en.pdf',
      'signature-report-en.pdf',
    ],
  },
];

const requiredFiles = [
  'docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-no-go-ledger.json',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-golden-matrix.json',
  'docs/audits/PREDICTA_COMPETITOR_RESPONSE_PHASE_9_GOLDEN_ARTIFACT_COMPETITOR_NO_GO_REAUDIT/competitor-no-go-issue-ledger.json',
  'docs/audits/PREDICTA_EVENT_ORACLE_PHASE_13_GOLDEN_ARTIFACT_LIVE_SMOKE_AND_NO_GO_AUDIT/artifacts/phase-13-no-go-ledger.json',
  'docs/audits/PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT/golden-chat-transcripts.json',
  'docs/audits/PREDICTA_KUNDLI_KARMA_PHASE_14_GOLDEN_ARTIFACT_NO_GO_AUDIT/golden-no-go-ledger.json',
  'package.json',
];

for (const file of requiredFiles) {
  assertGate(exists(file), `missing required Phase 0 evidence file: ${file}`);
}

const packageJson = JSON.parse(read('package.json'));
assertGate(
  packageJson.scripts?.['test:revival-v2-phase-0'] ===
    'node scripts/run-revival-v2-phase-0-current-truth-gate.mjs',
  'package.json must expose test:revival-v2-phase-0',
);

const roadmap = read('docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md');
assertIncludes(roadmap, 'Status: `NO-GO`', 'revival v2.1 roadmap');
for (const phase of requiredPhaseOrder) {
  assertIncludes(roadmap, phase, 'revival v2.1 approved execution order');
}
for (const rule of [
  'Predicta Chat is the primary product doorway.',
  'No page may open with long chatter before value or action.',
  'Every card, chip, badge, pill, CTA, dropdown, label, and form field needs',
  'No text, label, planet, degree, sign number, badge, pill, or CTA may leak',
  'Reports must predict and guide first. They must not school the user.',
  'All user-facing copy must come from dedicated translation JSON/config files.',
]) {
  assertIncludes(roadmap, rule, 'revival v2.1 non-negotiable rules');
}

const evidence = evidenceSources.map(source => {
  const files = listFiles(source.path);
  const missingFragments = source.requiredFragments.filter(
    fragment => !files.some(file => file.endsWith(fragment)),
  );
  assertGate(
    files.length >= source.minimumFiles,
    `${source.category}: expected at least ${source.minimumFiles} files, got ${files.length}`,
  );
  assertGate(
    missingFragments.length === 0,
    `${source.category}: missing required evidence ${missingFragments.join(', ')}`,
  );
  return {
    category: source.category,
    fileCount: files.length,
    path: source.path,
    sampleFiles: files.slice(0, 12),
  };
});

const reportFinalNoGo = readJson(
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-no-go-ledger.json',
);
assertGate(reportFinalNoGo.verdict === 'GREEN', 'final report Phase 12 must be green before V2.1 baseline');
assertGate(
  reportFinalNoGo.issueLedger?.critical === 0 && reportFinalNoGo.issueLedger?.major === 0,
  'final report Phase 12 must have zero critical/major issues',
);

const competitorNoGo = readJson(
  'docs/audits/PREDICTA_COMPETITOR_RESPONSE_PHASE_9_GOLDEN_ARTIFACT_COMPETITOR_NO_GO_REAUDIT/competitor-no-go-issue-ledger.json',
);
assertGate(
  Array.isArray(competitorNoGo.critical) &&
    competitorNoGo.critical.length === 0 &&
    Array.isArray(competitorNoGo.major) &&
    competitorNoGo.major.length === 0,
  'competitor response Phase 9 must have zero critical/major issues before V2.1 baseline',
);

const eventOracleNoGo = readJson(
  'docs/audits/PREDICTA_EVENT_ORACLE_PHASE_13_GOLDEN_ARTIFACT_LIVE_SMOKE_AND_NO_GO_AUDIT/artifacts/phase-13-no-go-ledger.json',
);
assertGate(
  Array.isArray(eventOracleNoGo.critical) &&
    eventOracleNoGo.critical.length === 0 &&
    Array.isArray(eventOracleNoGo.major) &&
    eventOracleNoGo.major.length === 0,
  'event oracle Phase 13 must have zero critical/major issues before V2.1 baseline',
);

const chatTranscripts = readJson(
  'docs/audits/PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT/golden-chat-transcripts.json',
);
assertGate(
  Array.isArray(chatTranscripts) && chatTranscripts.length >= 39,
  'Phase 10 golden chat transcripts must cover at least 39 transcript cases',
);

const noGoLedger = {
  critical: [],
  major: [
    {
      id: 'v2-1-major-primary-doorway-reverify',
      phaseOwner: 'PREDICTA_REVIVAL_V2_PHASE_1_PRIMARY_ASK_HOME_AND_NAV_CUT',
      issue:
        'Predicta Chat is now contractually the primary product doorway, but V2.1 has not yet re-verified landing, nav, dashboard, and legacy entry points under the new controlling roadmap.',
      whyItHurts:
        'If users still enter through dashboard/control-panel paths, the product feels like software navigation instead of a premium astrology guide.',
      requiredFix:
        'Make Ask Predicta unmistakable on landing and primary mobile nav, keep specialist worlds secondary, and prove direct ask in one click/tap.',
    },
    {
      id: 'v2-1-major-action-first-pages',
      phaseOwner: 'PREDICTA_REVIVAL_V2_PHASE_2_ACTION_FIRST_PAGE_REWRITE',
      issue:
        'Action-first route hierarchy is not yet re-audited under V2.1 across Vedic, KP, Jaimini, Numerology, Signature, Reports, Pricing, Account, Family, Redeem Pass, and Kundli.',
      whyItHurts:
        'Any long chatter before value makes users feel lectured instead of helped.',
      requiredFix:
        'Every major route must show meaning/action first, compact support second, and evidence only after the user has a reason to open it.',
    },
    {
      id: 'v2-1-major-personal-space-system',
      phaseOwner: 'PREDICTA_REVIVAL_V2_PHASE_3_LAYOUT_SPACING_AND_PERSONAL_SPACE_SYSTEM',
      issue:
        'Global margin, padding, form, chip, badge, pill, CTA, dropdown, and label personal-space rules are not yet locked by the V2.1 roadmap.',
      whyItHurts:
        'Cramped UI makes the app feel unfinished even when the astrology engine is strong.',
      requiredFix:
        'Create and enforce route-level personal-space checks for stacked containers, forms, action groups, chips, badges, pills, dropdowns, and sticky bars.',
    },
    {
      id: 'v2-1-major-chart-containment-trust',
      phaseOwner: 'PREDICTA_REVIVAL_V2_PHASE_5_KUNDLI_CHART_RENDERING_CONTAINMENT_LOCK',
      issue:
        'Kundli chart containment remains a trust-critical V2.1 blocker because planet, degree, sign, and house labels have previously leaked across chart boundaries.',
      whyItHurts:
        'A leaked label can imply a planet belongs to the wrong house, which destroys prediction trust.',
      requiredFix:
        'Lock web, mobile, and PDF chart label placement so labels use available in-house space and never cross boundaries.',
    },
    {
      id: 'v2-1-major-report-visual-editorial-reaudit',
      phaseOwner:
        'PREDICTA_REVIVAL_V2_PHASE_6_REPORT_EDITORIAL_AND_PREDICTION_REBUILD / PREDICTA_REVIVAL_V2_PHASE_7_REPORT_VISUAL_PREMIUM_AND_PDF_ARTIFACT_GATE',
      issue:
        'Report final gates are green, but V2.1 requires another app-preview plus PDF artifact audit focused on premium feel, prediction-first editing, chart width, watermark, orphan pages, and no schooling.',
      whyItHurts:
        'Reports are the biggest perceived-value surface; a technically green report can still feel basic, verbose, or visually under-premium.',
      requiredFix:
        'Regenerate free and paid artifacts for all six lanes, inspect rendered pages, and fail on filler, weak prediction, repeated remedies, sparse pages, or chart defects.',
    },
    {
      id: 'v2-1-major-translation-zero-leak',
      phaseOwner: 'PREDICTA_REVIVAL_V2_PHASE_9_TRANSLATION_ZERO_LEAK_SWEEP',
      issue:
        'Translation gates exist, but V2.1 has not yet run a dedicated zero-leak sweep across hidden drawers, modals, forms, errors, empty states, reports, and chat after the latest intelligence updates.',
      whyItHurts:
        'Mixed English/Hindi/Gujarati copy is a trust break for astrology users and makes the app feel patched together.',
      requiredFix:
        'Dump and audit visible/hidden copy in English, Hindi, and Gujarati, then move remaining user-facing hardcoded copy to JSON/config sources.',
    },
  ],
  medium: [
    {
      id: 'v2-1-medium-mobile-tablet-reproof',
      phaseOwner: 'PREDICTA_REVIVAL_V2_PHASE_4_MOBILE_TABLET_APP_FEEL_REBUILD',
      issue:
        'Existing mobile/tablet screenshots are available, but V2.1 needs a refreshed post-intelligence pass across 360, 390, 430, 768, 834, 1024, and desktop.',
      requiredFix:
        'Re-run mobile/tablet screenshots and fail on overflow, hidden CTAs, cramped touch targets, or sticky overlap.',
    },
    {
      id: 'v2-1-medium-golden-journey-reproof',
      phaseOwner: 'PREDICTA_REVIVAL_V2_PHASE_10_PERFORMANCE_LINK_AND_GOLDEN_JOURNEY_GATE',
      issue:
        'Existing golden journeys are strong, but the final V2.1 gate must prove fast links, stable ask flow, deterministic zero-credit help, report download, pass redemption, and language switching together.',
      requiredFix:
        'Run build, typecheck, link, overflow, spacing, translation, chart, report, and golden journey gates as one release-style proof.',
    },
  ],
  minor: [
    {
      id: 'v2-1-minor-historical-nadi-artifacts',
      phaseOwner: 'PREDICTA_REVIVAL_V2_PHASE_0_CURRENT_TRUTH_AND_NO_GO_LOCK',
      issue:
        'Some historical screenshot/PDF evidence still contains Nadi-era filenames even though active product taxonomy is Jaimini.',
      requiredFix:
        'Do not treat historical Nadi artifacts as active product proof; future screenshots must use active Jaimini lanes.',
    },
  ],
};

mkdirSync(auditDir, { recursive: true });
writeFileSync(path.join(auditDir, 'phase-0-no-go-ledger.json'), json(noGoLedger));
writeFileSync(path.join(auditDir, 'phase-0-evidence-manifest.json'), json({
  evidence,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  priorGreenLedgers: {
    competitorResponse: 'zero critical/major',
    eventOracle: 'zero critical/major',
    finalReports: 'zero critical/major',
    goldenChatTranscriptCount: chatTranscripts.length,
  },
}));

writeFileSync(
  path.join(auditDir, 'screenshot-evidence-ledger.md'),
  [
    `# ${phaseName} Screenshot Evidence Ledger`,
    '',
    'Phase 0 does not create product changes. It locks current screenshot evidence from the latest app-revival, competitor-response, and event-oracle gates as the baseline for V2.1.',
    '',
    ...evidence
      .filter(item => item.category.includes('screenshots'))
      .flatMap(item => [
        `## ${item.category}`,
        '',
        `- Source: \`${item.path}\``,
        `- File count: \`${item.fileCount}\``,
        `- Samples: ${item.sampleFiles.map(file => `\`${file}\``).join(', ')}`,
        '',
      ]),
  ].join('\n'),
);

writeFileSync(
  path.join(auditDir, 'pdf-evidence-ledger.md'),
  [
    `# ${phaseName} PDF Evidence Ledger`,
    '',
    'Phase 0 locks existing PDF/report artifact evidence. Later V2.1 phases must regenerate and visually re-audit these, not rely on the baseline alone.',
    '',
    '- Final report golden matrix: `docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-golden-matrix.json`',
    '- Final report no-go ledger: `docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-no-go-ledger.json`',
    '- PDF artifact directory: `docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT/pdfs`',
    `- PDF artifact count: \`${evidence.find(item => item.category === 'pdf-golden-artifacts')?.fileCount ?? 0}\``,
    '',
    '## V2.1 Redline',
    '',
    'Reports remain a V2.1 NO-GO area until they are re-audited for prediction-first writing, visual premium feel, no orphan pages, no chart leakage, no redundant remedies, and no schooling tone.',
    '',
  ].join('\n'),
);

writeFileSync(
  path.join(auditDir, 'route-evidence.json'),
  json({
    auditedRouteFamilies: [
      'landing',
      'ask',
      'dashboard',
      'vedic',
      'kp',
      'jaimini',
      'numerology',
      'signature',
      'reports',
      'pricing',
      'account/settings',
      'family',
      'redeem pass',
      'kundli',
    ],
    evidenceSources: evidence.filter(item => item.category.includes('screenshots')),
    noImplementationInPhase0: true,
  }),
);

writeFileSync(
  path.join(auditDir, 'report-redline-ledger.md'),
  [
    `# ${phaseName} Report Redline Ledger`,
    '',
    'Current final report gates are green, but V2.1 intentionally does not accept that as the end of report work.',
    '',
    '## Locked Baseline',
    '',
    '- Report matrix covers Vedic, KP, Jaimini, Numerology, Signature, and Life Atlas in free and premium modes.',
    '- Nadi is not an active final report lane.',
    '- Signature report generation remains blocked without confirmed traits.',
    '- App preview alignment and Predicta report memory are green.',
    '',
    '## V2.1 Redlines For Later Phases',
    '',
    '- Free and paid artifacts must be regenerated again.',
    '- Reports must predict and guide before technical proof.',
    '- Reports must not teach the user how astrology works unless the user asks.',
    '- Technical tables stay, but meaning must be direct and useful.',
    '- Remedies must be consolidated, not repeated.',
    '- PDFs must pass premium visual, watermark, contrast, chart-width, and pagination review.',
    '',
  ].join('\n'),
);

writeFileSync(
  path.join(auditDir, 'command-baseline.md'),
  [
    `# ${phaseName} Command Baseline`,
    '',
    'The following commands are the required Phase 0 verification set for this checkpoint:',
    '',
    '```bash',
    'corepack pnpm test:revival-v2-phase-0',
    'corepack pnpm test:predicta-intelligence-phase-10',
    'corepack pnpm test:report-final-phase-12',
    'corepack pnpm test:translation-trust',
    'corepack pnpm test:global-translation-coverage',
    'git diff --check',
    '```',
    '',
    'Runtime screenshot and full golden journey gates are intentionally assigned to later implementation phases because Phase 0 must not start product implementation.',
    '',
  ].join('\n'),
);

writeFileSync(
  path.join(auditDir, 'redline-audit.md'),
  [
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    'GREEN as a baseline lock only. Product status remains `NO-GO` under the V2.1 roadmap until phases 1-10 are completed and committed.',
    '',
    '## What Was Locked',
    '',
    '- V2.1 is the controlling revival roadmap.',
    '- The exact approved phase order is preserved.',
    '- Existing screenshot, route, PDF, report, translation, competitor, Event Oracle, Kundli Karma, and golden chat evidence is inventoried.',
    '- A V2.1-specific no-go ledger now defines the implementation backlog.',
    '- No product implementation is included in this phase.',
    '',
    '## Major No-Go Themes',
    '',
    ...noGoLedger.major.map(issue => `- ${issue.id}: ${issue.issue}`),
    '',
    '## Next Phase',
    '',
    '`PREDICTA_REVIVAL_V2_PHASE_1_PRIMARY_ASK_HOME_AND_NAV_CUT`',
    '',
  ].join('\n'),
);

writeFileSync(
  path.join(auditDir, 'phase-0-manifest.json'),
  json({
    phase: phaseName,
    status: 'green-baseline-only',
    productStatusAfterPhase0: 'NO-GO',
    nextPhase: 'PREDICTA_REVIVAL_V2_PHASE_1_PRIMARY_ASK_HOME_AND_NAV_CUT',
    noImplementationInPhase0: true,
    issueCounts: {
      critical: noGoLedger.critical.length,
      major: noGoLedger.major.length,
      medium: noGoLedger.medium.length,
      minor: noGoLedger.minor.length,
    },
    requiredPhaseOrder,
  }),
);

writeFileSync(
  path.join(auditDir, 'verification.txt'),
  [
    `${phaseName}: GREEN BASELINE ONLY`,
    '',
    'Product status remains NO-GO under V2.1.',
    'No implementation begins until this baseline is committed.',
    'Next phase: PREDICTA_REVIVAL_V2_PHASE_1_PRIMARY_ASK_HOME_AND_NAV_CUT',
    '',
  ].join('\n'),
);

if (failures.length) {
  throw new assert.AssertionError({
    message: `${phaseName} failed:\n- ${failures.join('\n- ')}`,
  });
}

console.log(`${phaseName}: passed`);

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function listFiles(relativePath) {
  const absolute = path.join(repoRoot, relativePath);
  if (!existsSync(absolute)) {
    return [];
  }
  return readdirSync(absolute, { recursive: true, withFileTypes: true })
    .filter(entry => entry.isFile())
    .map(entry => path.join(relativePath, entry.name))
    .sort();
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}
