import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_9_LIFE_ATLAS_FLAGSHIP_REBUILD';
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
  'packages/pdf/src/lifeAtlasReportValueContract.ts',
  'packages/astrology/src/lifeAtlasReport.ts',
  'packages/pdf/src/reportDocument.tsx',
  `${auditDir}/life-atlas-flagship-rebuild-audit.md`,
  `${auditDir}/phase-9-life-atlas-flagship-rebuild-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Add a Life Atlas-specific report value contract',
  'Life Atlas must preserve the emotional flagship structure',
  'Free Life Atlas must feel complete',
  'Premium Life Atlas must add deeper narrative',
  'Technical evidence must stay late as a calm appendix',
  'Life Atlas must not claim Akashic Records',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 9'));

const contract = read('packages/pdf/src/lifeAtlasReportValueContract.ts');
[
  'LIFE_ATLAS_FINAL_REPORT_REQUIRED_MODULES',
  'LIFE_ATLAS_FINAL_REPORT_SECTION_ORDER',
  'buildLifeAtlasReportValueContract',
  'Life Atlas Flagship Opening',
  'Opening Soul Portrait',
  'Personal Snapshot',
  'Strategic Life Abstract',
  'Why You Came Here',
  'Life Journey Arc',
  'Destiny Pattern',
  'Current Life Chapter',
  'Gifts You Carry',
  'Karmic Lessons',
  'Love Work Money Purpose',
  'The Hidden Thread',
  'What Is Intended For You',
  'Next 12-24 Months',
  'Soul Practices',
  'Final Letter From Predicta',
  'Premium Relationship Mirror',
  'Premium Work Money Mission Blueprint',
  'Premium Shadow-to-Gift Map',
  'Premium Integration Plan',
  'How Predicta Built This Reading Appendix',
  'Life Atlas as technical proof document',
  'Life Atlas as school lesson',
  'Evidence appendix before soul portrait',
  'Akashic Records or unsupported mystical source claim',
  'Fixed fate guarantee',
  'Fear-based destiny language',
].forEach(fragment => assertIncludes(contract, fragment, 'Life Atlas report value contract source'));

const pdfIndex = read('packages/pdf/src/index.ts');
[
  "from './lifeAtlasReportValueContract'",
  'buildLifeAtlasReportValueContract',
  'buildLifeAtlasReportSections',
  'Your Life Atlas Begins Here',
  'lifeAtlasValueContract.flagshipOpening',
  'lifeAtlasValueContract.freeDepthPromise',
  'lifeAtlasValueContract.paidDepthPromise',
  'lifeAtlasValueContract.appendixPromise',
  'atlas.sections',
  'How Predicta Built This Reading',
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF Life Atlas report composition'));

const lifeAtlasSections = sliceFunction(pdfIndex, 'buildLifeAtlasReportSections');
[
  'flagshipOpening',
  'Your Life Atlas Begins Here',
  'lifeAtlasValueContract.flagshipOpening',
  'lifeAtlasValueContract.evidencePromise',
  'lifeAtlasValueContract.appendixPromise',
  'Required Life Atlas modules',
  'Required Life Atlas order',
].forEach(fragment => assertIncludes(lifeAtlasSections, fragment, 'Life Atlas section builder'));
assertNotIncludes(lifeAtlasSections, 'Life Atlas prediction:', 'Life Atlas section builder');
assertNotIncludes(lifeAtlasSections, 'method lesson', 'Life Atlas section builder');
assertNotIncludes(lifeAtlasSections, 'classroom', 'Life Atlas section builder');
assertNotIncludes(lifeAtlasSections, 'technical proof', 'Life Atlas section builder');

const atlasSource = read('packages/astrology/src/lifeAtlasReport.ts');
[
  'Opening Soul Portrait',
  'Your Life Journey Arc',
  'Destiny Pattern',
  'Current Life Chapter',
  'The Hidden Thread',
  'Final Letter From Predicta',
  'Relationship Mirror',
  'Work, Money, and Mission Blueprint',
  'Shadow-to-Gift Map',
  'Premium Integration Plan',
].forEach(fragment => assertIncludes(atlasSource, fragment, 'Life Atlas astrology source'));
assertNotIncludes(atlasSource, 'repeating classroom', 'Life Atlas astrology source');

const documentSource = read('packages/pdf/src/reportDocument.tsx');
[
  'The strengths and lessons you carry',
  'Your gifts and repeating lessons are named together',
  'prediction and action',
].forEach(fragment => assertIncludes(documentSource, fragment, 'Life Atlas document renderer'));

const audit = read(`${auditDir}/life-atlas-flagship-rebuild-audit.md`);
[
  'Verdict: GREEN',
  'emotional flagship report',
  'Your Life Atlas Begins Here',
  'Opening Soul Portrait',
  'The Hidden Thread',
  'Final Letter From Predicta',
  'Life Atlas as technical proof document',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 9 audit'));

const manifest = readJson(`${auditDir}/phase-9-life-atlas-flagship-rebuild-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.lifeAtlasValueContractSource === 'packages/pdf/src/lifeAtlasReportValueContract.ts', 'manifest source mismatch');
assert(manifest.flagshipOpeningInserted === true, 'manifest must record flagship opening');
assert(manifest.evidenceAppendixLate === true, 'manifest must record late appendix');
assert(manifest.mainReadingHumanFirst === true, 'manifest must record human-first main reading');
assert(manifest.reportLane === 'LIFE_ATLAS', 'manifest lane must be LIFE_ATLAS');

[
  'Life Atlas Flagship Opening',
  'Opening Soul Portrait',
  'Personal Snapshot',
  'Strategic Life Abstract',
  'Why You Came Here',
  'Life Journey Arc',
  'Destiny Pattern',
  'Current Life Chapter',
  'Gifts You Carry',
  'Karmic Lessons',
  'Love Work Money Purpose',
  'The Hidden Thread',
  'What Is Intended For You',
  'Next 12-24 Months',
  'Soul Practices',
  'Final Letter From Predicta',
  'Premium Relationship Mirror',
  'Premium Work Money Mission Blueprint',
  'Premium Shadow-to-Gift Map',
  'Premium Integration Plan',
  'How Predicta Built This Reading Appendix',
].forEach(module => assert(manifest.requiredModules?.includes(module), `manifest missing Life Atlas module ${module}`));

[
  'phase9AuditExists',
  'phase9GatePasses',
  'lifeAtlasValueContractSourceExists',
  'requiredLifeAtlasModulesLocked',
  'lifeAtlasFlagshipOpeningUsed',
  'lifeAtlasPredictionPrefixRemoved',
  'evidenceAppendixAfterHumanReading',
  'freePaidDepthLocked',
  'unsupportedMysticalClaimsBanned',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed.`);
