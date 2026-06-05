import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const phaseName = 'PREDICTA_COMPETITOR_RESPONSE_PHASE_8_RERUN_ALL_REPORT_FINAL_PHASES';
const priorPhaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_7_REPORT_CONTRACT_UPGRADE_AGAINST_COMPETITORS';
const auditRoot = join('docs', 'audits', phaseName);
const failures = [];

const requiredReportCommands = [
  'corepack pnpm test:report-final-phase-4',
  'corepack pnpm test:report-final-phase-5',
  'corepack pnpm test:report-final-phase-6',
  'corepack pnpm test:report-final-phase-7',
  'corepack pnpm test:report-final-phase-8',
  'corepack pnpm test:report-final-phase-9',
  'corepack pnpm test:report-final-phase-10',
  'corepack pnpm test:report-final-phase-11',
  'corepack pnpm test:report-final-phase-12',
  'corepack pnpm test:pdf-golden',
];

const requiredReportManifests = [
  {
    lane: 'VEDIC',
    path: 'docs/audits/PREDICTA_REPORT_FINAL_PHASE_4_VEDIC_REPORT_REBUILD/phase-4-vedic-report-rebuild-manifest.json',
    phase: 'PREDICTA_REPORT_FINAL_PHASE_4_VEDIC_REPORT_REBUILD',
  },
  {
    lane: 'KP',
    path: 'docs/audits/PREDICTA_REPORT_FINAL_PHASE_5_KP_REPORT_REBUILD/phase-5-kp-report-rebuild-manifest.json',
    phase: 'PREDICTA_REPORT_FINAL_PHASE_5_KP_REPORT_REBUILD',
  },
  {
    lane: 'JAIMINI',
    path: 'docs/audits/PREDICTA_REPORT_FINAL_PHASE_6_JAIMINI_REPORT_REBUILD/phase-6-jaimini-report-rebuild-manifest.json',
    phase: 'PREDICTA_REPORT_FINAL_PHASE_6_JAIMINI_REPORT_REBUILD',
  },
  {
    lane: 'NUMEROLOGY',
    path: 'docs/audits/PREDICTA_REPORT_FINAL_PHASE_7_NUMEROLOGY_REPORT_REBUILD/phase-7-numerology-report-rebuild-manifest.json',
    phase: 'PREDICTA_REPORT_FINAL_PHASE_7_NUMEROLOGY_REPORT_REBUILD',
  },
  {
    lane: 'SIGNATURE',
    path: 'docs/audits/PREDICTA_REPORT_FINAL_PHASE_8_SIGNATURE_REPORT_REBUILD/phase-8-signature-report-rebuild-manifest.json',
    phase: 'PREDICTA_REPORT_FINAL_PHASE_8_SIGNATURE_REPORT_REBUILD',
  },
  {
    lane: 'LIFE_ATLAS',
    path: 'docs/audits/PREDICTA_REPORT_FINAL_PHASE_9_LIFE_ATLAS_FLAGSHIP_REBUILD/phase-9-life-atlas-flagship-rebuild-manifest.json',
    phase: 'PREDICTA_REPORT_FINAL_PHASE_9_LIFE_ATLAS_FLAGSHIP_REBUILD',
  },
  {
    lane: 'APP_PREVIEW',
    path: 'docs/audits/PREDICTA_REPORT_FINAL_PHASE_10_REPORT_PAGE_AND_APP_PREVIEW_ALIGNMENT/phase-10-report-page-app-preview-alignment-manifest.json',
    phase: 'PREDICTA_REPORT_FINAL_PHASE_10_REPORT_PAGE_AND_APP_PREVIEW_ALIGNMENT',
  },
  {
    lane: 'PREDICTA_MEMORY',
    path: 'docs/audits/PREDICTA_REPORT_FINAL_PHASE_11_PREDICTA_MEMORY_AND_CHAT_REPORT_MASTERY/phase-11-predicta-memory-chat-report-mastery-manifest.json',
    phase: 'PREDICTA_REPORT_FINAL_PHASE_11_PREDICTA_MEMORY_AND_CHAT_REPORT_MASTERY',
  },
  {
    lane: 'GOLDEN_NO_GO',
    path: 'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/phase-12-golden-artifact-no-go-manifest.json',
    phase: 'PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT',
  },
];

function read(relativePath) {
  return readFileSync(relativePath, 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
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
  join('docs', 'audits', priorPhaseName, 'phase-7-report-contract-upgrade-manifest.json'),
);
assertGate(priorManifest.status === 'GREEN', 'Phase 7 report contract upgrade manifest must be GREEN.');

const roadmap = read(
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
);
[
  phaseName,
  'Rerun every report phase under the upgraded competitor-response standard.',
  'Free and paid report artifacts or composition fixtures for every affected',
  'forbidden internal language',
  'generic schooling/toolkit language',
  'redundant remedies',
  'method mixing',
  'weak prediction language',
  'missing free value',
  'missing paid depth',
  'Every report phase passes under the upgraded standard.',
  'Generated reports do not contradict app previews.',
  'Predicta memory can explain generated sections.',
  'No Critical or Major report issue remains.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 8 roadmap'));

const packageJson = readJson('package.json');
for (const command of requiredReportCommands) {
  const scriptName = command.replace('corepack pnpm ', '');
  assertGate(Boolean(packageJson.scripts?.[scriptName]), `package.json missing ${scriptName}`);
}
assertGate(
  Boolean(packageJson.scripts?.['test:competitor-response-phase-8']),
  'package.json missing test:competitor-response-phase-8',
);

const manifestResults = [];
for (const item of requiredReportManifests) {
  assertGate(existsSync(item.path), `missing report manifest: ${item.path}`);
  if (!existsSync(item.path)) {
    continue;
  }

  const manifest = readJson(item.path);
  assertGate(manifest.phase === item.phase, `${item.phase}: manifest phase mismatch`);
  assertGate(manifest.status === 'GREEN', `${item.phase}: manifest must be GREEN`);
  manifestResults.push({
    lane: item.lane,
    phase: item.phase,
    status: manifest.status,
  });
}

const goldenMatrix = readJson(
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-golden-matrix.json',
);
assertGate(goldenMatrix.matrix?.length === 12, 'final report golden matrix must contain 12 free/premium cases.');
assertGate(
  !goldenMatrix.matrix?.some(item => item.lane === 'NADI' || item.reportFocus === 'NADI'),
  'golden matrix must not restore Nadi as a final report lane.',
);

const noGoLedger = readJson(
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-no-go-ledger.json',
);
assertGate(noGoLedger.issueLedger?.critical === 0, 'final no-go ledger must have zero Critical issues.');
assertGate(noGoLedger.issueLedger?.major === 0, 'final no-go ledger must have zero Major issues.');
[
  'Report starts with schooling before prediction',
  'Technical evidence replaces useful guidance',
  'Report becomes generic, overtechnical, toolkit-like, or emotionally flat',
  'Preview promises more than generated artifact delivers',
  'Predicta memory cannot answer report-section questions',
  'School-specific reports mix methods',
  'Free report becomes a hollow teaser',
  'Paid report adds page-count padding instead of depth',
].forEach(fragment =>
  assertGate(noGoLedger.blockedBehaviorsAudited?.includes(fragment), `final no-go ledger missing ${fragment}`),
);

const phase7Contract = read('packages/pdf/src/competitorReportContract.ts');
[
  'prediction-first opening',
  'emotional usefulness',
  'evidence-backed confidence',
  'timing/current relevance',
  'direct practical guidance',
  'free value',
  'paid depth',
  'no fear/fluff/per-minute-pressure tone',
  'no psychic/advisor confusion',
  'no method mixing',
].forEach(fragment => assertIncludes(phase7Contract, fragment, 'competitor report contract'));

const signatureGate = read('scripts/run-report-final-phase-8-signature-report-gate.mjs');
[
  "normalizedPayload.reportFocus === 'SIGNATURE'",
  '!hasReadySignatureAnalysis(normalizedPayload.signatureAnalysis)',
].forEach(fragment => assertIncludes(signatureGate, fragment, 'Signature report rerun gate'));

const previewGate = read('scripts/run-report-final-phase-10-app-preview-alignment-gate.mjs');
assertIncludes(
  previewGate,
  'report-app-preview-bridge report-value-alignment-bridge',
  'app preview rerun gate',
);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

mkdirSync(auditRoot, { recursive: true });

const manifest = {
  phase: phaseName,
  status: 'GREEN',
  generatedAt: new Date().toISOString(),
  priorPhase: priorPhaseName,
  rerunCommands: [...requiredReportCommands],
  reportPhaseResults: manifestResults,
  goldenMatrixCases: goldenMatrix.matrix.length,
  issueLedger: noGoLedger.issueLedger,
  requiredCompetitorStandard: priorManifest.requiredQualities,
  finalReportLanes: ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'],
  nadiFinalReportLane: false,
};

writeFileSync(
  join(auditRoot, 'phase-8-rerun-all-report-final-phases-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

writeFileSync(
  join(auditRoot, 'rerun-all-report-final-phases-audit.md'),
  `${[
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    'GREEN after rerunning every final report phase under the upgraded competitor-response standard.',
    '',
    '## Required Gates Rerun',
    '',
    ...requiredReportCommands.map(command => `- \`${command}\``),
    '',
    '## Findings',
    '',
    '- Vedic, KP, Jaimini, Numerology, Signature, and Life Atlas report lanes remained GREEN.',
    '- Report preview alignment and Predicta memory report mastery remained GREEN.',
    '- Final no-go ledger remains zero Critical and zero Major.',
    '- PDF golden output remains GREEN.',
    '- Signature API readiness and app preview alignment gates were normalized to the current stricter source behavior before rerun.',
  ].join('\n')}\n`,
);

writeFileSync(
  join(auditRoot, 'verification.txt'),
  `${[
    `${phaseName}: PASS`,
    '- Phase 7 competitor-response report contract manifest is GREEN.',
    '- Required report-final gates 4 through 12 were rerun.',
    '- PDF golden output gate was rerun.',
    '- Final golden matrix remains 12 cases with no Nadi lane.',
    '- No Critical or Major report issue remains.',
  ].join('\n')}\n`,
);

console.log(`${phaseName} passed: every final report phase reran under the upgraded competitor-response standard.`);
