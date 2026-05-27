import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_KUNDLI_VALUE_PHASE_7_KP_NADI_SCHOOL_BOUNDARY_AND_CHART_CORRECTION';
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
}

const phaseDoc = readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
for (const fragment of [
  phaseName,
  'KP must not show D1 as the primary chart surface.',
  'KP chart display must be Bhav Chalit / cusp-oriented where a chart is needed.',
  'Nadi must be karmic-story first.',
  'Nadi must not show Vedic D1 as a generic personality chart dump.',
  'Nadi must not use KP cusp logic.',
]) {
  assertIncludes(phaseDoc, fragment, `Phase 7 doc includes ${fragment}`);
}

const packageJson = readWorkspaceFile('package.json');
assertIncludes(
  packageJson,
  '"test:kundli-value-phase-7": "node scripts/run-kundli-value-phase-7-gate.mjs"',
  'package exposes Phase 7 gate',
);

const chartLayout = readWorkspaceFile('packages/astrology/src/chartLayout.ts');
for (const fragment of [
  'KP Bhav Chalit Cusp Chart',
  'KP Bhav Chalit house',
  'chalit|kp|cusp',
  "name: 'Nadi Chart Anchor'",
]) {
  assertIncludes(chartLayout, fragment, `chart layout includes ${fragment}`);
}
assertNotIncludes(
  chartLayout,
  "name: 'KP Horoscope'",
  'KP preview chart is not labelled as generic KP Horoscope/D1 preview',
);

const webKp = readWorkspaceFile('apps/web/components/WebKpPredictaPanel.tsx');
for (const fragment of [
  'KP Predicta stays inside Krishnamurti Paddhati',
  'EVENT VERDICT COMPASS',
  'KP JUDGEMENT PATH',
  'KP current answer',
  'Proof drawer',
  'KP cusps, star lords, sub lords',
  'Question-To-Proof Path',
]) {
  assertIncludes(webKp, fragment, `web KP keeps event-first boundary ${fragment}`);
}
assertNotIncludes(webKp, '<WebKundliChart', 'web KP room does not render a D1 chart component');

const mobileKp = readWorkspaceFile('apps/mobile/src/components/KpPredictaPanel.tsx');
for (const fragment of [
  'EVENT VERDICT COMPASS',
  'KP JUDGEMENT PATH',
  'PROOF DRAWER',
  '12 cusps with star and sub lords',
  'KP SIGNIFICATOR MAP',
]) {
  assertIncludes(mobileKp, fragment, `mobile KP keeps event-first boundary ${fragment}`);
}
assertNotIncludes(mobileKp, '<KundliChart', 'mobile KP room does not render a D1 chart component');

const webNadi = readWorkspaceFile('apps/web/components/WebNadiPredictaPanel.tsx');
for (const fragment of [
  'Nadi Predicta is its own premium world',
  'HIDDEN PATTERN SENTENCE',
  'Strongest story thread',
  'RAHU-KETU AXIS CARD',
  'STORY LINKS',
  'ACTIVATION WINDOWS',
  'Validation Bridge',
  'Do not mix Parashari or KP',
  'Do not claim palm-leaf manuscript access',
]) {
  assertIncludes(webNadi, fragment, `web Nadi keeps story-first boundary ${fragment}`);
}
assertNotIncludes(webNadi, '<WebKundliChart', 'web Nadi room does not render a generic D1 chart dump');
assertNotIncludes(webNadi, 'kp.cusps', 'web Nadi does not read KP cusps');

const mobileNadi = readWorkspaceFile('apps/mobile/src/screens/NadiPredictaScreen.tsx');
for (const fragment of [
  'HIDDEN PATTERN SENTENCE',
  'KARMIC STORY MAP',
  'RAHU-KETU AXIS CARD',
  'STORY LINKS',
  'ACTIVATION WINDOWS',
  'Validation Bridge',
  'Do not mix Parashari or KP',
  'Do not claim palm-leaf manuscript access',
]) {
  assertIncludes(mobileNadi, fragment, `mobile Nadi keeps story-first boundary ${fragment}`);
}
assertNotIncludes(mobileNadi, '<KundliChart', 'mobile Nadi room does not render a generic D1 chart dump');
assertNotIncludes(mobileNadi, 'kp.cusps', 'mobile Nadi does not read KP cusps');

const webLibrary = readWorkspaceFile('apps/web/components/WebSavedKundlis.tsx');
for (const fragment of [
  'buildLibraryPreviewChart(kundli, school)',
  "chartName =",
  "'KP Bhav Chalit Cusp Chart'",
  "'Nadi Chart Anchor'",
  "schoolOverride={school === 'KP' ? 'KP' : school === 'NADI' ? 'NADI' : 'PARASHARI'}",
]) {
  assertIncludes(webLibrary, fragment, `web library preview respects school boundary ${fragment}`);
}

const mobileLibrary = readWorkspaceFile('apps/mobile/src/screens/SavedKundlisScreen.tsx');
for (const fragment of [
  'buildSchoolPreviewChart',
  "buildSchoolPreviewChart(kundli, school)",
  "buildSchoolPreviewChart(record.kundliData, school)",
  "'KP Bhav Chalit Cusp Chart'",
  "'Nadi Chart Anchor'",
]) {
  assertIncludes(mobileLibrary, fragment, `mobile library preview respects school boundary ${fragment}`);
}

const reportComposer = readWorkspaceFile('packages/pdf/src/index.ts');
for (const fragment of [
  "case 'KP':",
  'buildKpReportSections(kundli, mode)',
  "case 'NADI':",
  'buildNadiReportSections(kundli, mode)',
  'KP Event Verdict',
  'Nadi Strongest Story Thread',
  'D1/D9 Parashari chart pages are intentionally excluded from Nadi report output',
]) {
  assertIncludes(reportComposer, fragment, `PDF report lanes keep KP/Nadi separate ${fragment}`);
}

const chatActions = readWorkspaceFile('packages/astrology/src/predictaChatActions.ts');
for (const fragment of [
  'That belongs to KP Predicta. I am regular Parashari Predicta here',
  'buildKpPredictaReply',
  'buildNadiPredictaReply',
  'I will not mix it into Parashari or KP',
]) {
  assertIncludes(chatActions, fragment, `chat action boundary includes ${fragment}`);
}

const nadiPlan = readWorkspaceFile('packages/astrology/src/nadiJyotishPlan.ts');
for (const fragment of [
  'Do not mix Nadi with Parashari yoga/dasha or KP sub-lord rules inside the same answer.',
  'Predicta does not claim access to original palm-leaf manuscripts',
]) {
  assertIncludes(nadiPlan, fragment, `Nadi plan boundary includes ${fragment}`);
}

const audit = JSON.parse(
  readWorkspaceFile(`${auditRoot}/artifacts/phase7-school-boundary-audit.json`),
);
assert.equal(audit.status, 'strict-audit-ready', 'audit status is strict-audit-ready');
assert.equal(audit.kp.primaryChartSurface, 'Bhav Chalit / cusp-oriented', 'KP audit locks cusp-oriented chart surface');
assert.equal(audit.nadi.primarySurface, 'karmic-story-first', 'Nadi audit locks story-first surface');
assert.equal(audit.schoolSeparation.reportsRemainSeparate, true, 'reports remain separate');
assert.equal(audit.schoolSeparation.chatRoomBoundary, true, 'chat room boundary remains locked');

for (const file of [
  `${auditRoot}/artifacts/phase7-school-boundary-audit.json`,
  `${auditRoot}/screenshots/web-kp-school-boundary.png`,
  `${auditRoot}/screenshots/web-nadi-story-first.png`,
  `${auditRoot}/screenshots/web-kp-source-proof.txt`,
  `${auditRoot}/screenshots/web-nadi-source-proof.txt`,
  `${auditRoot}/screenshots/mobile-kp-nadi-source-proof.txt`,
  `${auditRoot}/verification.txt`,
]) {
  requireFile(file, 300);
}

for (const file of [
  `${auditRoot}/screenshots/web-kp-school-boundary.png`,
  `${auditRoot}/screenshots/web-nadi-story-first.png`,
]) {
  requireFile(file, 50_000);
}

console.log(
  'Kundli Value Phase 7 gate passed: KP/Nadi chart boundaries, report lanes, and chat room boundaries are locked.',
);
