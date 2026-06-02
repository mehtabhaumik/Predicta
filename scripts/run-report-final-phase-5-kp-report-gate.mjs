import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_5_KP_REPORT_REBUILD';
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

function sliceFunction(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start === -1) {
    return '';
  }

  const next = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

[
  'docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md',
  'packages/pdf/src/index.ts',
  'packages/pdf/src/kpReportValueContract.ts',
  'packages/astrology/src/chalitBhavKpFoundation.ts',
  `${auditDir}/kp-report-rebuild-audit.md`,
  `${auditDir}/phase-5-kp-report-rebuild-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Add a KP-specific report value contract',
  'KP reports must answer the user with visible outcome prediction',
  'KP chart must be included in KP reports.',
  'KP reports must not render D1/D9 Parashari chart pages.',
  'Free KP must include a real verdict, active areas, caution, timing mood, and',
  'Premium KP must add deeper proof and timing depth, not more jargon.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 5'));

const contract = read('packages/pdf/src/kpReportValueContract.ts');
[
  'KP_FINAL_REPORT_REQUIRED_MODULES',
  'KP_FINAL_REPORT_SECTION_ORDER',
  'buildKpReportValueContract',
  'KP Prediction Opening',
  'KP Event Support Chart',
  'Verdict',
  'Promise',
  'Block',
  'Timing Readiness',
  'Relevant Houses',
  'Cusps and Lord Chains',
  'Significator Hierarchy',
  'Ruling Planets',
  'Dasha Support',
  'Practical Action',
  'Proof Appendix',
  'KP report as toolkit',
  'KP report as astrology lesson',
  'Repeated demand for a user question',
  'D1 or D9 Parashari chart in KP report',
  'Technical proof before practical answer',
  'Timing certainty without KP support',
].forEach(fragment => assertIncludes(contract, fragment, 'KP report value contract source'));

const pdfIndex = read('packages/pdf/src/index.ts');
[
  "from './kpReportValueContract'",
  'buildKpReportValueContract',
  'buildKpReportSections',
  'What KP is predicting',
  'KP Event Support Chart',
  'KP chart remains included as the event-support report chart.',
  'D1/D9 Parashari chart pages are intentionally excluded from KP report output.',
  "reportFocus === 'KP'",
  "? ['KP']",
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF KP report composition'));

const kpSections = sliceFunction(pdfIndex, 'buildKpReportSections');
[
  'kpValueContract.openingPrediction',
  'kpValueContract.timingPromise',
  'kpValueContract.freeDepthPromise',
  'kpValueContract.paidDepthPromise',
  'kpValueContract.actionPromise',
  'What KP is predicting',
  'KP Event Verdict and Prediction',
  'Career, Work, and Results Prediction',
  'Money, Property, and Relationship Prediction',
  'KP Chart Prediction',
  'Timing, Caution, and Action',
  'Final KP Guidance',
].forEach(fragment => assertIncludes(kpSections, fragment, 'KP section builder'));
assertNotIncludes(kpSections, 'questionnaire', 'KP section builder user-facing copy');
assertNotIncludes(kpSections, 'Ask one exact KP question', 'KP section builder user-facing copy');
assertNotIncludes(kpSections, 'needs one concrete event question', 'KP section builder user-facing copy');

const foundation = read('packages/astrology/src/chalitBhavKpFoundation.ts');
[
  'General KP outcome reading from the active birth profile',
  'visible outcome support',
  'narrow timing when needed',
  'KP becomes most useful when the prediction is tied to visible event support',
  'KP can read visible outcome support after calculation',
].forEach(fragment => assertIncludes(foundation, fragment, 'KP deterministic foundation'));
assertNotIncludes(foundation, 'Ask one exact KP question', 'KP deterministic foundation user-facing copy');
assertNotIncludes(foundation, 'ask one exact KP event question', 'KP deterministic foundation user-facing copy');

const audit = read(`${auditDir}/kp-report-rebuild-audit.md`);
[
  'Verdict: GREEN',
  'common-person outcome prediction',
  'KP Event Support Chart',
  'Free KP must include a real verdict',
  'Premium KP must add complete verdict depth',
  'D1 or D9 Parashari chart in KP report',
  'KP remains a KP outcome/event-support lane',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 5 audit'));

const manifest = readJson(`${auditDir}/phase-5-kp-report-rebuild-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.kpValueContractSource === 'packages/pdf/src/kpReportValueContract.ts', 'manifest source mismatch');
assert(manifest.predictionOpeningInserted === true, 'manifest must record prediction opening');
assert(manifest.kpChartRequired === true, 'manifest must record KP chart requirement');
assert(manifest.d1D9ParashariExcluded === true, 'manifest must record D1/D9 exclusion');
assert(manifest.reportLane === 'KP', 'manifest lane must be KP');

[
  'KP Prediction Opening',
  'KP Event Support Chart',
  'Verdict',
  'Promise',
  'Block',
  'Timing Readiness',
  'Relevant Houses',
  'Cusps and Lord Chains',
  'Significator Hierarchy',
  'Ruling Planets',
  'Dasha Support',
  'Practical Action',
  'Proof Appendix',
].forEach(module => assert(manifest.requiredModules?.includes(module), `manifest missing KP module ${module}`));

[
  'phase5AuditExists',
  'phase5GatePasses',
  'kpValueContractSourceExists',
  'requiredKpModulesLocked',
  'kpPredictionOpeningUsed',
  'kpChartRequired',
  'd1D9ParashariExcluded',
  'technicalProofAfterPrediction',
  'schoolBoundaryLocked',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error('Report Final Phase 5 KP report gate failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  'Report Final Phase 5 KP report gate passed: KP prediction opening, KP chart requirement, no D1/D9 Parashari charts, outcome-first copy, technical proof, and school boundaries are locked.',
);
