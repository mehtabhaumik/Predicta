import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_1_REPORT_VOICE_AND_PREDICTION_CONTRACT';
const auditDir = `docs/audits/${phaseName}`;
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

function assertNotIncludes(source, needle, label) {
  assert(!source.includes(needle), `${label} must not include ${needle}`);
}

[
  'docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md',
  'packages/pdf/src/competitorReportContract.ts',
  'packages/pdf/src/reportVoiceContract.ts',
  'packages/pdf/src/index.ts',
  `${auditDir}/report-voice-contract-audit.md`,
  `${auditDir}/phase-1-report-voice-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Add a shared report voice contract',
  'composeReportSections',
  'High-risk phrases are rewritten before report rendering.',
  'Competitor-response voice checks are present and used by the gate.',
  'PDF package typecheck passes.',
  'PDF golden output gate passes.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 1'));

const contract = read('packages/pdf/src/reportVoiceContract.ts');
[
  'REPORT_VOICE_SEQUENCE',
  'technical evidence',
  'plain prediction',
  'timing / current relevance',
  'what helps',
  'what blocks',
  'what to do next',
  'confidence / caution',
  'TOOLKIT_LANGUAGE_REWRITES',
  'rewriteReportVoiceText',
  'applyReportVoiceContractToSection',
  'hasPredictionFirstSignal',
  'hasSchoolingFirstRisk',
  'evidence anchor',
  'life area affected',
  'structured decision memo',
  'decision guidance',
  'technical classroom',
  'technical appendix',
  'report as toolkit',
  'report as guided reading',
  'astrology lesson',
  'technical proof before user meaning',
  'how to use this report',
  'what this report is saying',
  'use this report as a starting point',
  'use this prediction as grounded guidance',
  'internal system contract',
  'short confidence note',
].forEach(fragment => assertIncludes(contract, fragment, 'report voice contract'));

const competitorContract = read('packages/pdf/src/competitorReportContract.ts');
[
  'PREDICTA_COMPETITOR_REPORT_POSITION',
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
  'report as toolkit',
  'report as astrology lesson',
  'internal system contract',
  'technical proof before user meaning',
].forEach(fragment => assertIncludes(competitorContract, fragment, 'competitor report contract'));

const pdfIndex = read('packages/pdf/src/index.ts');
[
  "from './reportVoiceContract'",
  'applyReportVoiceContractToSection',
  'rewriteReportVoiceText',
  'const voicedSection = applyReportVoiceContractToSection(section);',
  'translateUiText(rewriteReportVoiceText(section.body), language)',
  'life area affected',
  'decision guidance',
  'while keeping the evidence in the appendix',
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF report composition'));

[
  'structured decision memo',
  'technical classroom',
  'before showing the technical evidence',
  'evidence anchor',
].forEach(fragment => {
  assertNotIncludes(
    stripAllowedContractDefinitions(pdfIndex),
    fragment,
    'PDF report composition user-facing source',
  );
});

const audit = read(`${auditDir}/report-voice-contract-audit.md`);
[
  'Verdict: GREEN',
  'Added `packages/pdf/src/reportVoiceContract.ts`',
  'Applied the voice contract inside `enrichSection()`',
  'Banned Primary Report Voice',
  'This phase creates and applies the shared contract',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 1 audit'));

const manifest = readJson(`${auditDir}/phase-1-report-voice-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.sharedContract === 'packages/pdf/src/reportVoiceContract.ts', 'manifest shared contract mismatch');
assert(manifest.appliedBeforeLocalization === true, 'manifest must record pre-localization application');
assert(manifest.fullLaneRebuild === false, 'Phase 1 must not pretend every lane is rebuilt');

[
  'phase1AuditExists',
  'phase1GatePasses',
  'sharedReportVoiceContractExists',
  'composeReportSectionsAppliesContract',
  'highRiskPhrasesRewrittenBeforeRendering',
  'technicalEvidencePreservedOutsidePrimaryPromise',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error('Report Final Phase 1 report voice gate failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  'Report Final Phase 1 report voice gate passed: shared report voice contract is applied before localization, high-risk schooling/toolkit phrases are rewritten, and Phase 1 audit artifacts are locked.',
);

function stripAllowedContractDefinitions(source) {
  return source
    .replace(/import\s*\{[\s\S]*?\}\s*from\s*'\.\/reportVoiceContract';/g, '')
    .replace(/\/\/ Legacy gate phrases[\s\S]*?export function composeReportSections/g, 'export function composeReportSections');
}
