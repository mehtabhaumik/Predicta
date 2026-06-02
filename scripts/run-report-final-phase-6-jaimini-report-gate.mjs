import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_6_JAIMINI_REPORT_REBUILD';
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
  'packages/pdf/src/jaiminiReportValueContract.ts',
  `${auditDir}/jaimini-report-rebuild-audit.md`,
  `${auditDir}/phase-6-jaimini-report-rebuild-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Add a Jaimini-specific report value contract',
  'Jaimini reports must preserve technical evidence through Swamsa, Karakamsha,',
  'Jaimini reports must render the Jaimini soul chart surfaces: Swamsa Chart and',
  'D1/D9 Parashari chart pages are excluded from Jaimini report output.',
  'Free Jaimini must include a real destiny-role reading',
  'Premium Jaimini must add Chara Karaka council depth',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 6'));

const contract = read('packages/pdf/src/jaiminiReportValueContract.ts');
[
  'JAIMINI_FINAL_REPORT_REQUIRED_MODULES',
  'JAIMINI_FINAL_REPORT_SECTION_ORDER',
  'buildJaiminiReportValueContract',
  'Jaimini Prediction Opening',
  'Swamsa Chart',
  'Karakamsha Chart',
  'Atmakaraka Soul Role',
  'Amatyakaraka Work Direction',
  'Darakaraka Relationship Mirror',
  'Chara Karaka Council',
  'Arudha Visible Identity',
  'Upapada Relationship Lens',
  'Rashi Drishti',
  'Current Chara Dasha Chapter',
  'Practical Jaimini Guidance',
  'Jaimini Proof Appendix',
  'Jaimini report as renamed Vedic report',
  'Jaimini report as KP event report',
  'D1 or D9 Parashari chart as the Jaimini chart surface',
  'Atmakaraka as a vague soul label without prediction',
  'Chara Dasha as fatalistic timing',
  'Karaka list without user-facing implication',
  'Technical proof before destiny guidance',
].forEach(fragment => assertIncludes(contract, fragment, 'Jaimini report value contract source'));

const pdfIndex = read('packages/pdf/src/index.ts');
[
  "from './jaiminiReportValueContract'",
  'buildJaiminiReportValueContract',
  'buildJaiminiReportSections',
  'What Jaimini is predicting',
  'What Jaimini is predicting with premium depth',
  "reportFocus === 'JAIMINI'",
  "? ['SWAMSA', 'KARAKAMSHA']",
  'includeJaiminiSoulCharts',
  'D1/D9 Parashari chart pages are intentionally excluded from Jaimini report output',
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF Jaimini report composition'));

const snapshotBuilder = sliceFunction(pdfIndex, 'buildPdfChartSnapshots');
[
  "const includeJaiminiSoulCharts = reportFocus === 'JAIMINI';",
  'includeVedicFocusCharts || includeJaiminiSoulCharts',
  "? ['SWAMSA', 'KARAKAMSHA']",
  "chartByRole.set('SWAMSA', swamsaChart)",
  "chartByRole.set('KARAKAMSHA', karakamshaChart)",
].forEach(fragment => assertIncludes(snapshotBuilder, fragment, 'PDF chart snapshot builder'));

const jaiminiSections = sliceFunction(pdfIndex, 'buildJaiminiReportSections');
[
  'jaiminiValueContract.openingPrediction',
  'jaiminiValueContract.timingPromise',
  'jaiminiValueContract.freeDepthPromise',
  'jaiminiValueContract.paidDepthPromise',
  'jaiminiValueContract.actionPromise',
  'What Jaimini is predicting',
  'What Jaimini is predicting with premium depth',
  'Jaimini Soul Compass',
  'Atmakaraka Soul Role',
  'Karakamsha and Swamsa Reading',
  'Arudha Visible Identity',
  'Amatyakaraka Career Dharma',
  'Darakaraka Relationship Mirror',
  'Current Chara Dasha Chapter',
  'Concise Jaimini Evidence Appendix',
  'Full Chara Karaka Council',
  'Chara Dasha Life Map',
  'Darakaraka Relationship Mirror',
  'Practical Jaimini Guidance',
].forEach(fragment => assertIncludes(jaiminiSections, fragment, 'Jaimini section builder'));
assertNotIncludes(jaiminiSections, 'What is Jaimini', 'Jaimini section builder user-facing copy');
assertNotIncludes(jaiminiSections, 'Jaimini is a system', 'Jaimini section builder user-facing copy');
assertNotIncludes(jaiminiSections, 'method lesson', 'Jaimini section builder user-facing copy');
assertNotIncludes(jaiminiSections, 'classroom', 'Jaimini section builder user-facing copy');

const audit = read(`${auditDir}/jaimini-report-rebuild-audit.md`);
[
  'Verdict: GREEN',
  'Jaimini as its own destiny, role, soul-direction, and life-arc',
  'Swamsa Chart',
  'Karakamsha Chart',
  'Atmakaraka',
  'Chara Dasha',
  'D1 or D9 Parashari chart as the Jaimini chart surface',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 6 audit'));

const manifest = readJson(`${auditDir}/phase-6-jaimini-report-rebuild-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.jaiminiValueContractSource === 'packages/pdf/src/jaiminiReportValueContract.ts', 'manifest source mismatch');
assert(manifest.predictionOpeningInserted === true, 'manifest must record prediction opening');
assert(manifest.jaiminiSoulChartsRequired === true, 'manifest must record Jaimini soul chart requirement');
assert(manifest.d1D9ParashariExcluded === true, 'manifest must record D1/D9 exclusion');
assert(manifest.reportLane === 'JAIMINI', 'manifest lane must be JAIMINI');

[
  'Jaimini Prediction Opening',
  'Swamsa Chart',
  'Karakamsha Chart',
  'Atmakaraka Soul Role',
  'Amatyakaraka Work Direction',
  'Darakaraka Relationship Mirror',
  'Chara Karaka Council',
  'Arudha Visible Identity',
  'Upapada Relationship Lens',
  'Rashi Drishti',
  'Current Chara Dasha Chapter',
  'Practical Jaimini Guidance',
  'Jaimini Proof Appendix',
].forEach(module => assert(manifest.requiredModules?.includes(module), `manifest missing Jaimini module ${module}`));

[
  'phase6AuditExists',
  'phase6GatePasses',
  'jaiminiValueContractSourceExists',
  'requiredJaiminiModulesLocked',
  'jaiminiPredictionOpeningUsed',
  'swamsaKarakamshaChartsRequired',
  'd1D9ParashariExcluded',
  'technicalProofAfterPrediction',
  'schoolBoundaryLocked',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed.`);
