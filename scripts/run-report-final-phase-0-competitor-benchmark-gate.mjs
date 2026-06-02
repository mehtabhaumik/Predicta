import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_0_COMPETITOR_BENCHMARK_AND_REDLINE_LOCK';
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
  `${auditDir}/competitor-benchmark-redline-audit.md`,
  `${auditDir}/phase-0-competitor-benchmark-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  '# Predicta Reports Final Value Rebuild Strict Phases',
  phaseName,
  'PREDICTA_REPORT_FINAL_PHASE_1_REPORT_VOICE_AND_PREDICTION_CONTRACT',
  'PREDICTA_REPORT_FINAL_PHASE_2_SHARED_REPORT_ARCHITECTURE_ENGINE',
  'PREDICTA_REPORT_FINAL_PHASE_3_FREE_VS_PAID_DEPTH_CONTRACT',
  'PREDICTA_REPORT_FINAL_PHASE_4_VEDIC_REPORT_REBUILD',
  'PREDICTA_REPORT_FINAL_PHASE_5_KP_REPORT_REBUILD',
  'PREDICTA_REPORT_FINAL_PHASE_6_JAIMINI_REPORT_REBUILD',
  'PREDICTA_REPORT_FINAL_PHASE_7_NUMEROLOGY_REPORT_REBUILD',
  'PREDICTA_REPORT_FINAL_PHASE_8_SIGNATURE_REPORT_REBUILD',
  'PREDICTA_REPORT_FINAL_PHASE_9_LIFE_ATLAS_FLAGSHIP_REBUILD',
  'PREDICTA_REPORT_FINAL_PHASE_10_REPORT_PAGE_AND_APP_PREVIEW_ALIGNMENT',
  'PREDICTA_REPORT_FINAL_PHASE_11_PREDICTA_MEMORY_AND_CHAT_REPORT_MASTERY',
  'PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT',
  'Reports must predict, guide, and satisfy',
  'technical evidence -> plain prediction',
  'Free reports are not hollow previews',
  'Vedic, KP, Jaimini, Numerology, Signature, and Life Atlas reports stay',
  'No report may look like an internal system contract',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap'));
assertNotIncludes(roadmap, 'Nadi report lane', 'final report roadmap');
assertNotIncludes(roadmap, '`NADI`', 'final report roadmap');

const audit = read(`${auditDir}/competitor-benchmark-redline-audit.md`);
[
  'Verdict: GREEN',
  'AstroSage free reports',
  'AstroSage Kundli',
  'AstroSage KP',
  'KP methodology/products',
  'Astro.com samples',
  'CHANI app tour',
  'Jaimini sources',
  'Numerology samples',
  'Signature/graphology sources',
  'Life purpose / Soul Blueprint products',
  'technical evidence',
  'plain prediction',
  'timing / current relevance',
  'what helps',
  'what blocks',
  'what to do next',
  'confidence / caution',
  '| Vedic |',
  '| KP |',
  '| Jaimini |',
  '| Numerology |',
  '| Signature |',
  '| Life Atlas |',
  'Free reports must:',
  'Paid reports must:',
  'Banned Report Behaviors',
  'Defect To Future Phase Map',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 0 audit'));
assertNotIncludes(audit, '| Nadi |', 'Phase 0 audit');

const manifest = readJson(`${auditDir}/phase-0-competitor-benchmark-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.implementationChanged === false, 'Phase 0 must not change report rendering implementation');
assert(manifest.createdFinalRoadmap === true, 'final roadmap must be created');
assert(manifest.nadiLaneAllowed === false, 'Nadi lane must not be allowed');
assert(manifest.sourceBacked === true, 'benchmark must be source-backed');

const expectedLanes = ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'];
for (const lane of expectedLanes) {
  assert(manifest.reportLanes?.includes(lane), `manifest is missing report lane ${lane}`);
}
assert(!manifest.reportLanes?.includes('NADI'), 'manifest must not include NADI lane');

[
  'https://www.astrosage.com/free/',
  'https://www.astrosage.com/kundli/',
  'https://www.astrosage.com/kpastrology/',
  'https://ishvaram.com/kp-astrology/',
  'https://www.astro.com/samples/samples_e.htm?nhor=27',
  'https://chaninicholas.zendesk.com/hc/en-us/articles/8711720295187-A-Tour-of-the-CHANI-App',
  'https://diastrologer.com/blog/jaimini-atmakaraka-explained',
  'https://www.astronumero.org/wp-content/uploads/numerology-template-3-personal-analysis-detailed.pdf',
  'https://storyincolor.com/graphology/signature-analysis',
  'https://www.phlighteraimes.com/blueprint-session',
].forEach(url => assert(manifest.sourceUrls?.includes(url), `manifest missing source URL ${url}`));

[
  'phase0AuditExists',
  'phase0GatePasses',
  'noReportRenderingImplementationChanged',
  'sixReportLanesPresent',
  'noNadiLane',
  'freePaidValueContractLocked',
  'bannedReportBehaviorsLocked',
  'defectsMappedToFuturePhases',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error('Report Final Phase 0 competitor benchmark gate failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  'Report Final Phase 0 competitor benchmark gate passed: source-backed redlines, six report lanes, free/paid value split, banned behaviors, and future phase mapping are locked with no report rendering implementation changes.',
);
