import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_4_VEDIC_REPORT_REBUILD';
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
  'packages/pdf/src/index.ts',
  'packages/pdf/src/vedicReportValueContract.ts',
  `${auditDir}/vedic-report-rebuild-audit.md`,
  `${auditDir}/phase-4-vedic-report-rebuild-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Add a Vedic-specific report value contract',
  'Vedic reports must start with birth/calculation context, then a direct',
  'Required Vedic coverage must include',
  'Mahadasha Phala must remain a dedicated section',
  'Remedies must appear as one consolidated action plan.',
  'Premium must add deeper varga interpretation, contradictions, timing windows',
  'Free must keep useful chart-backed prediction and essential evidence.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 4'));

const valueContract = read('packages/pdf/src/vedicReportValueContract.ts');
[
  'VEDIC_FINAL_REPORT_REQUIRED_MODULES',
  'VEDIC_FINAL_REPORT_SECTION_ORDER',
  'buildVedicReportValueContract',
  'Birth Snapshot',
  'Core Charts: D1, Moon, D9, D10, Chalit',
  'Panchang',
  'Avakhada Chakra',
  'Ghatak and Favorable Factors',
  'House-wise Planet Table',
  'Benefics and Malefics',
  'Mahadasha Phala',
  'Friendship Table',
  'Chalit Table',
  'Samsa',
  'Swamsa',
  'Karakamsha',
  'Ashtakavarga',
  'Prastarashtakavarga',
  'Yogas',
  'Consolidated Remedy Action Plan',
  'Vedic report as chart glossary',
  'Meaning column that only defines the area',
  'Mahadasha scattered outside its own section',
  'Repeated remedies in multiple places',
  'Premium pages that add length without sharper prediction',
  'Classical tables without user-facing implication',
].forEach(fragment => assertIncludes(valueContract, fragment, 'Vedic report value contract source'));

const pdfIndex = read('packages/pdf/src/index.ts');
[
  "from './vedicReportValueContract'",
  'buildVedicValueOpeningSection(kundli, intelligence, mode)',
  'function buildVedicValueOpeningSection',
  'What your Kundli is saying',
  'buildCoreChartInterpretationSection',
  'buildMahadashaPhalaReportSection',
  'buildClassicalVedicReportSection(intelligence.panchang',
  'intelligence.avakhadaChakra',
  'intelligence.ghatakFavorable',
  'buildHouseWisePlanetTableSections',
  'buildBeneficMaleficReportSection',
  'buildFriendshipTableSections',
  'buildChalitTableReportSections',
  'buildClassicalVedicReportSection(intelligence.samsa',
  'buildClassicalVedicReportSection(intelligence.swamsa',
  'buildClassicalVedicReportSection(intelligence.karakamsha',
  'buildClassicalVedicReportSection(intelligence.ashtakavarga',
  'buildClassicalVedicReportSection(',
  'intelligence.prastarashtakavarga',
  'buildPremiumVargaInterpretationSections',
  'buildYogaSection',
  'buildRemedySection',
  'Consolidated remedy/action plan',
  'This section is the dedicated Mahadasha Phala reading',
  'The technical note is kept in proof',
  'The practical guidance is simple',
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF Vedic report composition'));

assertNotIncludes(pdfIndex, "eyebrow: 'VEDIC INTELLIGENCE CONTRACT'", 'Vedic user-facing section labels');

const structureStart = pdfIndex.indexOf('function buildVedicReportStructureSections');
const structureEnd = pdfIndex.indexOf('function buildVedicValueOpeningSection');
const vedicStructure = structureStart > -1 && structureEnd > structureStart
  ? pdfIndex.slice(structureStart, structureEnd)
  : '';
assert(vedicStructure.length > 0, 'Vedic report structure function must be present');

const openingIndex = vedicStructure.indexOf('buildVedicValueOpeningSection(kundli, intelligence, mode)');
const chartIndex = vedicStructure.indexOf('buildCoreChartInterpretationSection(kundli, chartTypes, intelligence, mode, language)');
const mahadashaIndex = vedicStructure.indexOf('buildMahadashaPhalaReportSection(intelligence, mode)');
const remedyIndex = pdfIndex.indexOf('function buildRemedySection');
assert(openingIndex > -1 && chartIndex > openingIndex, 'Vedic opening must appear before core chart interpretation');
assert(mahadashaIndex > chartIndex, 'Mahadasha section must appear after core chart interpretation');
assert(remedyIndex > mahadashaIndex, 'Consolidated remedy section must remain after Mahadasha implementation source');

const audit = read(`${auditDir}/vedic-report-rebuild-audit.md`);
[
  'Verdict: GREEN',
  'prediction first',
  'Required Vedic Coverage',
  'Free Vedic must give useful chart-backed prediction',
  'Premium Vedic must add full diagnosis',
  'Vedic remains Parashari/Vedic',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 4 audit'));

const manifest = readJson(`${auditDir}/phase-4-vedic-report-rebuild-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.vedicValueContractSource === 'packages/pdf/src/vedicReportValueContract.ts', 'manifest source mismatch');
assert(manifest.predictionOpeningInserted === true, 'manifest must record prediction opening');
assert(manifest.reportLane === 'VEDIC', 'manifest lane must be VEDIC');

[
  'Birth Snapshot',
  'Core Charts: D1, Moon, D9, D10, Chalit',
  'Panchang',
  'Avakhada Chakra',
  'Ghatak and Favorable Factors',
  'House-wise Planet Table',
  'Benefics and Malefics',
  'Mahadasha Phala',
  'Friendship Table',
  'Chalit Table',
  'Samsa',
  'Swamsa',
  'Karakamsha',
  'Ashtakavarga',
  'Prastarashtakavarga',
  'Yogas',
  'Consolidated Remedy Action Plan',
].forEach(module => assert(manifest.requiredModules?.includes(module), `manifest missing Vedic module ${module}`));

[
  'phase4AuditExists',
  'phase4GatePasses',
  'vedicValueContractSourceExists',
  'requiredVedicModulesLocked',
  'vedicPredictionOpeningUsed',
  'mahadashaDedicatedSectionPresent',
  'consolidatedRemedyActionPlanPresent',
  'premiumDepthIsNotPagePadding',
  'schoolBoundaryLocked',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error('Report Final Phase 4 Vedic report gate failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  'Report Final Phase 4 Vedic report gate passed: Vedic required modules, prediction-first opening, Mahadasha section, consolidated remedies, premium depth guardrails, and school boundaries are locked.',
);
