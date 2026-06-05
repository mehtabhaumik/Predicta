import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const phaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_7_REPORT_CONTRACT_UPGRADE_AGAINST_COMPETITORS';
const priorPhaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_6_FREE_VS_PAID_VALUE_AND_COST_CONTROL_ALIGNMENT';
const auditRoot = join('docs', 'audits', phaseName);
const failures = [];

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

function assertNotIncludes(source, fragment, label) {
  assertGate(!source.includes(fragment), `${label}: must not include ${fragment}`);
}

const requiredFiles = [
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
  'docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md',
  'packages/pdf/src/competitorReportContract.ts',
  'packages/pdf/src/reportArchitecture.ts',
  'packages/pdf/src/reportVoiceContract.ts',
  'packages/config/src/predictaMemory.ts',
  'packages/types/src/astrology.ts',
  'apps/mobile/src/types/astrology.ts',
  'scripts/run-report-final-phase-1-report-voice-gate.mjs',
  'scripts/run-report-final-phase-2-shared-architecture-gate.mjs',
  'scripts/run-report-final-phase-3-depth-contract-gate.mjs',
  'scripts/run-report-final-phase-11-predicta-memory-chat-report-mastery-gate.mjs',
  'scripts/run-report-final-phase-12-golden-artifact-no-go-reaudit.mjs',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_11_PREDICTA_MEMORY_AND_CHAT_REPORT_MASTERY/phase-11-predicta-memory-chat-report-mastery-manifest.json',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-no-go-ledger.json',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/phase-12-golden-artifact-no-go-manifest.json',
];

for (const file of requiredFiles) {
  assertGate(existsSync(file), `missing required file: ${file}`);
}

const priorManifest = readJson(
  join('docs', 'audits', priorPhaseName, 'phase-6-manifest.json'),
);
assertGate(priorManifest.status === 'GREEN', 'Phase 6 manifest must be GREEN before Phase 7.');

const roadmap = read(
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
);
[
  phaseName,
  'Upgrade the report contract before rerunning report phases.',
  'Report voice gates to reject schooling/toolkit/internal language.',
  'Report artifacts gates to verify competitor-response positioning.',
  'Report memory gates to verify Predicta can explain generated report content.',
  'School-boundary gates to verify no report lane mixes methods.',
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
].forEach(fragment => assertIncludes(roadmap, fragment, 'competitor response Phase 7 roadmap'));

const reportRoadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  'Competitor-response report contract is now part of the final report bar',
  'AskSoma, YastroTalk, and Nebula',
  'Report previews, generated report artifacts, and Predicta memory must agree.',
  'Final report gates must fail if primary report bodies become generic',
  'Final report gates must fail if school-specific reports mix methods.',
  'Competitor-response voice checks are present and used by the gate.',
  'Attach the competitor-response report contract to every `PdfReportArchitecture`',
  'Every architecture carries the competitor-response report contract.',
  'The depth contract must align with the competitor-response rule',
].forEach(fragment => assertIncludes(reportRoadmap, fragment, 'final report roadmap contract upgrade'));

const competitorContract = read('packages/pdf/src/competitorReportContract.ts');
[
  'PREDICTA_COMPETITOR_REPORT_POSITION',
  'PREDICTA_COMPETITOR_REPORT_COMPETITORS',
  'AskSoma',
  'YastroTalk',
  'Nebula',
  'PREDICTA_COMPETITOR_REPORT_REQUIRED_QUALITIES',
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
  'PREDICTA_COMPETITOR_REPORT_BANNED_TONE',
  'PREDICTA_COMPETITOR_REPORT_MEMORY_REQUIREMENTS',
  'PREDICTA_COMPETITOR_REPORT_PREVIEW_REQUIREMENTS',
  'PREDICTA_COMPETITOR_REPORT_ARTIFACT_REQUIREMENTS',
  'buildCompetitorReportArchitectureContract',
  'buildCompetitorReportLaneContract',
].forEach(fragment => assertIncludes(competitorContract, fragment, 'competitor report contract source'));

[
  'report as toolkit',
  'report as astrology lesson',
  'internal system contract',
  'method-boundary page as main reading',
  'generic definition instead of prediction',
  'technical proof before user meaning',
  'fear-selling remedy language',
  'psychic certainty or advisor pressure',
  'per-minute astrologer pressure',
  'preview promises more than PDF delivers',
].forEach(fragment => assertIncludes(competitorContract, fragment, 'banned competitor report tone'));

for (const laneFragment of [
  'Vedic artifacts must include chart-backed prediction',
  'KP artifacts must include a KP chart',
  'Jaimini artifacts must include Swamsa/Karakamsha',
  'Numerology artifacts must include number signature',
  'Signature artifacts must include confirmed visible traits',
  'Life Atlas artifacts must include soul portrait',
]) {
  assertIncludes(competitorContract, laneFragment, 'lane-specific artifact contract');
}

const architecture = read('packages/pdf/src/reportArchitecture.ts');
[
  'CompetitorReportArchitectureContract',
  'competitorResponseContract: CompetitorReportArchitectureContract',
  'buildCompetitorReportArchitectureContract',
  'competitorResponseContract: buildCompetitorReportArchitectureContract',
].forEach(fragment => assertIncludes(architecture, fragment, 'report architecture competitor contract'));
assertNotIncludes(architecture, "case 'NADI'", 'report architecture final lane switch');

const voice = read('packages/pdf/src/reportVoiceContract.ts');
[
  'report as toolkit',
  'report as guided reading',
  'astrology lesson',
  'technical proof before user meaning',
  'supporting proof after user meaning',
  'how to use this report',
  'what this report is saying',
  'use this report as a starting point',
  'use this prediction as grounded guidance',
  'internal system contract',
  'short confidence note',
].forEach(fragment => assertIncludes(voice, fragment, 'report voice competitor rewrites'));

const memory = read('packages/config/src/predictaMemory.ts');
[
  'competitorResponseRule',
  'AskSoma, YastroTalk, and Nebula',
  'Report contract upgrade rule',
  'Generated report context carries the competitor-response report rule',
  'generatedReportContext',
  'reportSectionMemory',
  'no fear-selling, no psychic confusion, and no per-minute pressure',
].forEach(fragment => assertIncludes(memory, fragment, 'Predicta memory competitor report mastery'));

for (const file of ['packages/types/src/astrology.ts', 'apps/mobile/src/types/astrology.ts']) {
  assertIncludes(read(file), 'competitorResponseRule?: string', `${file} generated report context type`);
}

const phase1Gate = read('scripts/run-report-final-phase-1-report-voice-gate.mjs');
[
  'packages/pdf/src/competitorReportContract.ts',
  'Competitor-response voice checks are present and used by the gate.',
  'competitor report contract',
  'technical proof before user meaning',
].forEach(fragment => assertIncludes(phase1Gate, fragment, 'updated report voice gate'));

const phase2Gate = read('scripts/run-report-final-phase-2-shared-architecture-gate.mjs');
[
  'packages/pdf/src/competitorReportContract.ts',
  'Attach the competitor-response report contract to every `PdfReportArchitecture`',
  'competitorResponseContract: CompetitorReportArchitectureContract',
  'competitor report architecture contract',
].forEach(fragment => assertIncludes(phase2Gate, fragment, 'updated report architecture gate'));

const phase3Gate = read('scripts/run-report-final-phase-3-depth-contract-gate.mjs');
[
  'packages/pdf/src/competitorReportContract.ts',
  'The depth contract must align with the competitor-response rule',
  'competitorResponseContract: CompetitorReportArchitectureContract',
  'competitor free-vs-paid report contract',
].forEach(fragment => assertIncludes(phase3Gate, fragment, 'updated report depth gate'));

const phase11Gate = read('scripts/run-report-final-phase-11-predicta-memory-chat-report-mastery-gate.mjs');
[
  'competitorResponseRule',
  'Generated report context carries the competitor-response report rule',
  'Competitor-response report standard is active.',
].forEach(fragment => assertIncludes(phase11Gate, fragment, 'updated report memory gate'));

const phase12Gate = read('scripts/run-report-final-phase-12-golden-artifact-no-go-reaudit.mjs');
[
  'packages/pdf/src/competitorReportContract.ts',
  'Report becomes generic, overtechnical, toolkit-like, or emotionally flat',
  'Preview promises more than generated artifact delivers',
  'Predicta memory cannot answer report-section questions',
  'competitor report no-go contract',
].forEach(fragment => assertIncludes(phase12Gate, fragment, 'updated golden artifact no-go gate'));

const phase11Manifest = readJson(
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_11_PREDICTA_MEMORY_AND_CHAT_REPORT_MASTERY/phase-11-predicta-memory-chat-report-mastery-manifest.json',
);
assertGate(phase11Manifest.status === 'GREEN', 'Phase 11 manifest must remain GREEN.');
assertGate(
  phase11Manifest.generatedReportContextFields?.includes('competitorResponseRule'),
  'Phase 11 manifest must record competitorResponseRule.',
);
assertGate(
  phase11Manifest.strictRules?.includes('Competitor-response report standard is active.'),
  'Phase 11 manifest must record competitor-response strict rule.',
);

const noGoLedger = readJson(
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-no-go-ledger.json',
);
[
  'Report becomes generic, overtechnical, toolkit-like, or emotionally flat',
  'Preview promises more than generated artifact delivers',
  'Predicta memory cannot answer report-section questions',
].forEach(fragment =>
  assertGate(noGoLedger.blockedBehaviorsAudited?.includes(fragment), `Phase 12 no-go ledger missing ${fragment}`),
);

const phase12Manifest = readJson(
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/phase-12-golden-artifact-no-go-manifest.json',
);
assertGate(phase12Manifest.status === 'GREEN', 'Phase 12 manifest must remain GREEN.');
[
  'Competitor-response standard is enforced: prediction-first, emotionally useful, evidence-backed, timing-aware, practical, school-bound, no fear/fluff/per-minute-pressure.',
  'Report previews must not promise more than generated artifacts and generatedReportContext can explain.',
].forEach(rule =>
  assertGate(phase12Manifest.strictReleaseRules?.includes(rule), `Phase 12 manifest missing ${rule}`),
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
  competitors: ['AskSoma', 'YastroTalk', 'Nebula'],
  upgradedContracts: [
    'report voice gate',
    'report architecture gate',
    'free-vs-paid depth gate',
    'report memory gate',
    'golden artifact no-go gate',
  ],
  requiredQualities: [
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
  ],
  finalReportLanes: ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'],
  nadiFinalReportLane: false,
  verificationCommands: [
    'corepack pnpm test:competitor-response-phase-7',
    'corepack pnpm test:report-final-phase-1',
    'corepack pnpm test:report-final-phase-2',
    'corepack pnpm test:report-final-phase-3',
    'corepack pnpm test:report-final-phase-11',
    'corepack pnpm test:report-final-phase-12',
    'corepack pnpm --filter @pridicta/pdf typecheck',
    'corepack pnpm --filter @pridicta/config typecheck',
    'corepack pnpm --filter @pridicta/types typecheck',
    'corepack pnpm --filter @pridicta/mobile typecheck',
    'git diff --check',
  ],
};

writeFileSync(
  join(auditRoot, 'phase-7-report-contract-upgrade-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

writeFileSync(
  join(auditRoot, 'report-contract-upgrade-audit.md'),
  [
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    'GREEN after source-contract and gate-upgrade audit.',
    '',
    '## What Changed',
    '',
    '- Added `packages/pdf/src/competitorReportContract.ts` as the shared competitor-response report contract.',
    '- Attached `competitorResponseContract` to every `PdfReportArchitecture`.',
    '- Tightened report voice, architecture, free-vs-paid, memory, and final no-go gates.',
    '- Added `competitorResponseRule` to generated report memory context across shared and mobile types.',
    '- Updated Phase 11 and Phase 12 report-final audit artifacts so future gates fail on preview overpromise, generic/toolkit tone, or report-memory gaps.',
    '',
    '## Strict Standard',
    '',
    'Predicta reports must be prediction-first, emotionally useful, evidence-backed, timing-aware, practical, school-bound, and free of fear/fluff/per-minute-pressure tone. Life Atlas remains the only synthesis lane.',
  ].join('\n'),
);

writeFileSync(
  join(auditRoot, 'verification.txt'),
  `${[
    `${phaseName}: PASS`,
    '- Prior Phase 6 manifest is GREEN.',
    '- Report final roadmap carries competitor-response report rules.',
    '- Shared PDF architecture carries competitorResponseContract.',
    '- Report voice, architecture, depth, memory, and final no-go gates were upgraded.',
    '- Predicta generated report memory carries competitorResponseRule.',
    '- No Nadi final report lane was restored.',
  ].join('\n')}\n`,
);

console.log(`${phaseName} passed: report contract, gates, memory, and no-go ledgers are upgraded against competitors.`);
