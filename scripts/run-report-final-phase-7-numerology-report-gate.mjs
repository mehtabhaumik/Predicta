import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_7_NUMEROLOGY_REPORT_REBUILD';
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
  'packages/pdf/src/numerologyReportValueContract.ts',
  `${auditDir}/numerology-report-rebuild-audit.md`,
  `${auditDir}/phase-7-numerology-report-rebuild-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Add a Numerology-specific report value contract',
  'Numerology reports must preserve technical evidence through Personal Number',
  'Numerology reports must not render D1/D9 Parashari chart pages',
  'Free Numerology must include core number identity',
  'Premium Numerology must add deeper name scanner',
  'Missing numbers must be framed as practice cues',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 7'));

const contract = read('packages/pdf/src/numerologyReportValueContract.ts');
[
  'NUMEROLOGY_FINAL_REPORT_REQUIRED_MODULES',
  'NUMEROLOGY_FINAL_REPORT_SECTION_ORDER',
  'buildNumerologyReportValueContract',
  'Numerology Prediction Opening',
  'Personal Number Mandala',
  'Name Rhythm',
  'Name Energy Scanner',
  'Birth Code',
  'Destiny Direction',
  'Current Cycle Action Plan',
  'Missing / Repeated Number Grid',
  'Strengths and Cautions',
  'Work Relationship Money Self-expression Guidance',
  'Name Fit Score',
  'Name Refinement',
  'Compatibility Lens',
  'Personal Year Timeline',
  'Supportive Rhythm Guide',
  'Number Calculation Appendix',
  'Numerology report as renamed Kundli report',
  'D1 or D9 Parashari chart in Numerology report',
  'Vedic graha table in Numerology report',
  'Sunrise chart note in Numerology report',
  'Number definitions without user-facing guidance',
  'Fear-based missing number language',
  'Name change pressure or guaranteed success claim',
  'Technical calculation proof before number prediction',
].forEach(fragment => assertIncludes(contract, fragment, 'Numerology report value contract source'));

const pdfIndex = read('packages/pdf/src/index.ts');
[
  "from './numerologyReportValueContract'",
  'buildNumerologyReportValueContract',
  'buildNumerologyReportSections',
  'What your numbers are predicting',
  'What your numbers are predicting with premium depth',
  'Birth-chart plate pages are intentionally excluded from Numerology report output.',
  'Vedic graha placement tables are intentionally excluded from Numerology report output.',
  'Numerology chart atmosphere notes are intentionally excluded from Numerology report output.',
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF Numerology report composition'));

const chartTypes = sliceFunction(pdfIndex, 'getReportChartTypes');
[
  "['JAIMINI', 'LIFE_ATLAS', 'KP', 'NUMEROLOGY', 'SIGNATURE'].includes(reportFocus)",
  'return []',
].forEach(fragment => assertIncludes(chartTypes, fragment, 'Numerology chart exclusion'));

const numerologySections = sliceFunction(pdfIndex, 'buildNumerologyReportSections');
[
  'numerologyValueContract.openingPrediction',
  'numerologyValueContract.timingPromise',
  'numerologyValueContract.freeDepthPromise',
  'numerologyValueContract.paidDepthPromise',
  'numerologyValueContract.actionPromise',
  'What your numbers are predicting',
  'What your numbers are predicting with premium depth',
  'Your Number Signature',
  'Name Rhythm and Energy Scanner',
  'Birth Code and Destiny Direction',
  'Current Cycle Action Plan',
  'Missing / Repeated Number Grid',
  'Strengths, Cautions, and Life Areas',
  'Name Fit Score and Refinement',
  'Compatibility and Supportive Rhythm',
  'Personal Year Timeline',
  'Number Calculation Evidence',
].forEach(fragment => assertIncludes(numerologySections, fragment, 'Numerology section builder'));
assertNotIncludes(numerologySections, 'D1 / Rashi', 'Numerology section builder');
assertNotIncludes(numerologySections, 'D9 / Navamsa', 'Numerology section builder');
assertNotIncludes(numerologySections, 'House-wise graha placement', 'Numerology section builder');
assertNotIncludes(numerologySections, 'FUN CHART NOTE', 'Numerology section builder');
assertNotIncludes(numerologySections, 'guaranteed success', 'Numerology section builder');
assertNotIncludes(numerologySections, 'fear score', 'Numerology section builder user-facing copy');

const audit = read(`${auditDir}/numerology-report-rebuild-audit.md`);
[
  'Verdict: GREEN',
  'Number Identity Dossier',
  'What your numbers are predicting',
  'Personal Number Mandala',
  'Missing / Repeated Number Grid',
  'Name Fit Score',
  'D1 or D9 Parashari chart in Numerology report',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 7 audit'));

const manifest = readJson(`${auditDir}/phase-7-numerology-report-rebuild-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.numerologyValueContractSource === 'packages/pdf/src/numerologyReportValueContract.ts', 'manifest source mismatch');
assert(manifest.predictionOpeningInserted === true, 'manifest must record prediction opening');
assert(manifest.birthChartPagesExcluded === true, 'manifest must record birth chart exclusion');
assert(manifest.vedicGrahaTablesExcluded === true, 'manifest must record Vedic table exclusion');
assert(manifest.reportLane === 'NUMEROLOGY', 'manifest lane must be NUMEROLOGY');

[
  'Numerology Prediction Opening',
  'Personal Number Mandala',
  'Name Rhythm',
  'Name Energy Scanner',
  'Birth Code',
  'Destiny Direction',
  'Current Cycle Action Plan',
  'Missing / Repeated Number Grid',
  'Strengths and Cautions',
  'Work Relationship Money Self-expression Guidance',
  'Name Fit Score',
  'Name Refinement',
  'Compatibility Lens',
  'Personal Year Timeline',
  'Supportive Rhythm Guide',
  'Number Calculation Appendix',
].forEach(module => assert(manifest.requiredModules?.includes(module), `manifest missing Numerology module ${module}`));

[
  'phase7AuditExists',
  'phase7GatePasses',
  'numerologyValueContractSourceExists',
  'requiredNumerologyModulesLocked',
  'numerologyPredictionOpeningUsed',
  'birthChartPagesExcluded',
  'vedicGrahaTablesExcluded',
  'technicalProofAfterPrediction',
  'schoolBoundaryLocked',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed.`);
