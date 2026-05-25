import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName =
  'PREDICTA_KUNDLI_VALUE_PHASE_5_VEDIC_REPORT_STRUCTURE_MAHADASHA_AND_REMEDY_STREAMLINE';
const auditRoot = `docs/audits/${phaseName}`;

function readWorkspaceFile(file) {
  return readFileSync(path.join(root, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

function assertNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), label);
}

function requireFile(relativePath, minimumBytes = 1) {
  const fullPath = path.join(root, relativePath);
  assert.ok(existsSync(fullPath), `${relativePath} exists`);
  const size = statSync(fullPath).size;
  assert.ok(size >= minimumBytes, `${relativePath} has at least ${minimumBytes} bytes`);
  return fullPath;
}

function extractBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `${startMarker} exists`);
  assert.ok(end > start, `${endMarker} follows ${startMarker}`);
  return source.slice(start, end);
}

function assertOrder(source, fragments, label) {
  let cursor = -1;

  for (const fragment of fragments) {
    const index = source.indexOf(fragment);
    assert.ok(index > cursor, `${label}: ${fragment} appears in approved order`);
    cursor = index;
  }
}

const phaseDoc = readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
for (const fragment of [
  phaseName,
  'Rebuild Vedic report order and remove redundancy.',
  'Core Charts First:',
  'Mahadasha Phala:',
  'One consolidated remedy/action plan.',
  'Full remedy guidance appears once.',
  'Repeated remedy blocks are not allowed.',
  'Mahadasha Phala is a dedicated section after core chart readings.',
  'Generated artifacts prove no duplicate remedy blocks.',
]) {
  assertIncludes(phaseDoc, fragment, `Phase 5 doc includes ${fragment}`);
}

const packageJson = readWorkspaceFile('package.json');
assertIncludes(
  packageJson,
  '"test:kundli-value-phase-5": "node scripts/run-kundli-value-phase-5-gate.mjs"',
  'package exposes Phase 5 gate',
);

const pdf = readWorkspaceFile('packages/pdf/src/index.ts');
for (const fragment of [
  'buildVedicReportStructureSections',
  'buildCoreChartInterpretationSection',
  'buildPremiumVargaInterpretationSections',
  'Phase 5 order lock',
  'Approved focus chart order: D1/Rashi -> Moon/Chandra Lagna -> D9/Navamsa -> D10/Dashamsa -> Chalit.',
  'Core chart interpretation',
  'Core chart interpretation with premium depth',
  'Premium varga predictive sections',
  'supporting practice reference',
  'Consolidated remedy/action plan',
  'This is the only full remedy/action plan in the report.',
]) {
  assertIncludes(pdf, fragment, `PDF composer includes ${fragment}`);
}

const structureBlock = extractBlock(
  pdf,
  'function buildVedicReportStructureSections',
  'function buildCoreChartInterpretationSection',
);
assertOrder(
  structureBlock,
  [
    'buildBirthAndCalculationSection(kundli)',
    'buildVedicSnapshotReportSection(intelligence, mode)',
    "buildClassicalVedicReportSection(intelligence.panchang, 'PANCHANG', 'Panchang', mode)",
    "intelligence.avakhadaChakra",
    'intelligence.ghatakFavorable',
    'buildCoreChartInterpretationSection(kundli, chartTypes, intelligence, mode, language)',
    '...buildHouseWisePlanetTableSections(intelligence, mode)',
    'buildBeneficMaleficReportSection(intelligence, mode)',
    'buildMahadashaPhalaReportSection(intelligence, mode)',
    '...buildFriendshipTableSections(intelligence, mode)',
    '...buildChalitTableReportSections(intelligence, mode)',
    'intelligence.samsa',
    'intelligence.swamsa',
    'intelligence.karakamsha',
    'intelligence.ashtakavarga',
    'intelligence.prastarashtakavarga',
    'buildPremiumVargaInterpretationSections(kundli, chartTypes, mode, language)',
  ],
  'Vedic report structure',
);

const coreChartBlock = extractBlock(
  pdf,
  'function buildCoreChartInterpretationSection',
  'function buildPremiumVargaInterpretationSections',
);
assertOrder(
  coreChartBlock,
  [
    "label: 'D1/Rashi'",
    "label: 'Moon/Chandra Lagna'",
    "label: 'D9/Navamsa'",
    "label: 'D10/Dashamsa'",
    "label: 'Chalit'",
  ],
  'Core chart interpretation order',
);

const reportSetBlock = extractBlock(pdf, 'const vedicCore = [', '];\n\n  if (mode ===');
assertOrder(
  reportSetBlock,
  [
    '...buildVedicReportStructureSections(kundli, chartTypes, mode, language)',
    '...focusSections',
    'buildExecutiveSummary(kundli, mode)',
    'buildHolisticReportSynthesisSection(kundli, mode)',
    'buildPlanetaryStrengthSection(kundli, mode)',
    'buildTransitSection(kundli, mode)',
    'buildRectificationSection(kundli)',
    'buildGuidanceSection(kundli, mode)',
    'buildLimitationsSection(kundli, mode)',
    'buildRemedySection(kundli)',
  ],
  'Vedic core section append order',
);
assertNotIncludes(reportSetBlock, 'buildDashaSection(kundli, mode)', 'Vedic core does not include duplicate generic dasha section');

const mahadashaIndex = structureBlock.indexOf('buildMahadashaPhalaReportSection(intelligence, mode)');
const chartIndex = structureBlock.indexOf('buildCoreChartInterpretationSection(kundli, chartTypes, intelligence, mode, language)');
const evidenceIndex = structureBlock.indexOf('...buildHouseWisePlanetTableSections(intelligence, mode)');
assert.ok(chartIndex >= 0 && evidenceIndex > chartIndex && mahadashaIndex > evidenceIndex, 'Mahadasha Phala appears after core chart interpretation and planet/house evidence');

const remedyMatches = pdf.match(/title: 'Consolidated remedy\/action plan'/g) ?? [];
assert.equal(remedyMatches.length, 1, 'Full remedy/action plan title appears once in source');
assertNotIncludes(pdf, "title: 'Practical guidance and remedies'", 'old duplicated remedy guidance title is not used');

const translations = readWorkspaceFile('packages/pdf/src/translations/reportLabels.json');
for (const fragment of [
  '"Core chart interpretation"',
  '"Core chart interpretation with premium depth"',
  '"Practical next steps"',
  '"Consolidated remedy/action plan"',
  '"CORE CHARTS FIRST"',
  '"PREMIUM VARGAS"',
]) {
  assertIncludes(translations, fragment, `localized report labels include ${fragment}`);
}

const audit = JSON.parse(readWorkspaceFile(`${auditRoot}/artifacts/phase5-structure-audit.json`));
assert.equal(audit.status, 'strict-audit-ready', 'structure audit is strict-audit-ready');
assert.deepEqual(audit.approvedOrder.slice(0, 5), [
  'Celestial cover',
  'Birth Snapshot',
  'Core Charts First',
  'Core chart interpretation',
  'Planet and house evidence',
]);
assert.equal(audit.dedupeRules.fullRemedySectionCount, 1, 'audit records one full remedy section');

for (const pdfArtifact of [
  `${auditRoot}/artifacts/phase5-free-kundli.pdf`,
  `${auditRoot}/artifacts/phase5-premium-kundli.pdf`,
]) {
  const fullPath = requireFile(pdfArtifact, 1_000_000);
  assert.equal(readFileSync(fullPath, { encoding: 'utf8', flag: 'r' }).slice(0, 4), '%PDF');
}

for (const file of [
  `${auditRoot}/artifacts/phase5-free-payload.json`,
  `${auditRoot}/artifacts/phase5-premium-payload.json`,
  `${auditRoot}/artifacts/phase5-structure-audit.json`,
  `${auditRoot}/screenshots/web-mobile-source-proof.txt`,
  `${auditRoot}/verification.txt`,
]) {
  requireFile(file, 300);
}

console.log(
  'Kundli Value Phase 5 gate passed: Vedic report order, dedicated Mahadasha Phala, premium vargas, and one consolidated remedy plan are locked.',
);
