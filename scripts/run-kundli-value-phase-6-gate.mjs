import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_KUNDLI_VALUE_PHASE_6_WEB_MOBILE_PROGRESSIVE_DISCLOSURE';
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

const phaseDoc = readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
for (const fragment of [
  phaseName,
  'Adopt useful AstroSage-level content on web/mobile without turning the app into',
  '`Birth Snapshot`',
  '`Charts`',
  '`What This Means`',
  '`Current Timing`',
  '`Classical Tables`',
  '`Ask Predicta`',
  '`Download Full Report`',
  'Keep screens clean, calm, and progressively disclosed.',
  'Tables must be collapsible or horizontally safe on mobile.',
]) {
  assertIncludes(phaseDoc, fragment, `Phase 6 doc includes ${fragment}`);
}

const packageJson = readWorkspaceFile('package.json');
assertIncludes(
  packageJson,
  '"test:kundli-value-phase-6": "node scripts/run-kundli-value-phase-6-gate.mjs"',
  'package exposes Phase 6 gate',
);

const webPanel = readWorkspaceFile('apps/web/components/WebVedicIntelligencePanel.tsx');
for (const fragment of [
  'Clean Vedic snapshot, not a 56-page wall',
  'BIRTH SNAPSHOT',
  'Panchang, Avakhada, Ghatak and favorable points',
  'CHARTS',
  'Focus charts first, full library deliberately',
  'WHAT THIS MEANS',
  'Short predictive cards per focus chart',
  'CURRENT TIMING',
  'Mahadasha Phala without clutter',
  'CLASSICAL TABLES',
  'Open proof only when needed',
  'ASK PREDICTA',
  'Download Full Report',
  '<details className="vedic-disclosure"',
  'Open full chart library',
  'buildParashariChalitChart',
  'composeChartInsight',
  "id: 'MOON'",
  "id: 'CHALIT'",
  'insightProfile="swamsa"',
  'insightProfile="karakamsha"',
]) {
  assertIncludes(webPanel, fragment, `web progressive panel includes ${fragment}`);
}
assertNotIncludes(webPanel, 'Shared Vedic intelligence contract', 'web panel no longer opens as a contract dump');

const mobilePanel = readWorkspaceFile('apps/mobile/src/components/VedicIntelligencePanel.tsx');
for (const fragment of [
  'Clean Vedic snapshot, not a report wall',
  'BIRTH SNAPSHOT',
  'CHARTS',
  'WHAT THIS MEANS',
  'CURRENT TIMING',
  'Classical Tables',
  'ASK PREDICTA',
  'Download Full Report',
  'showClassicalTables',
  'showSoulCharts',
  'DisclosureButton',
  'onAskPrompt',
  'onDownloadFullReport',
  'buildParashariChalitChart',
  'composeChartInsight',
  "id: 'MOON'",
  "id: 'CHALIT'",
  'intelligence.swamsa',
  'intelligence.karakamsha',
]) {
  assertIncludes(mobilePanel, fragment, `mobile progressive panel includes ${fragment}`);
}
assertNotIncludes(mobilePanel, 'Shared Vedic intelligence', 'mobile panel no longer opens as a contract dump');

const mobileCharts = readWorkspaceFile('apps/mobile/src/screens/ChartsScreen.tsx');
for (const fragment of [
  'onAskPrompt={prompt =>',
  "sourceScreen: 'Vedic Progressive Disclosure'",
  'onDownloadFullReport={() => navigation.navigate(routes.Report)}',
]) {
  assertIncludes(mobileCharts, fragment, `mobile Charts screen wires ${fragment}`);
}

const css = readWorkspaceFile('apps/web/app/globals.css');
for (const fragment of [
  '.vedic-progressive-group',
  '.vedic-progressive-heading',
  '.vedic-classical-stack',
  '.vedic-disclosure',
  '.vedic-action-band',
  '@media (max-width: 820px)',
]) {
  assertIncludes(css, fragment, `web CSS supports progressive layout ${fragment}`);
}

const audit = JSON.parse(
  readWorkspaceFile(`${auditRoot}/artifacts/phase6-progressive-disclosure-audit.json`),
);
assert.equal(audit.status, 'strict-audit-ready', 'audit status is strict-audit-ready');
assert.deepEqual(audit.hierarchy, [
  'Birth Snapshot',
  'Charts',
  'What This Means',
  'Current Timing',
  'Classical Tables',
  'Ask Predicta',
  'Download Full Report',
]);
assert.equal(audit.nonClutterPolicy.pdfIsDeepSurface, true, 'audit locks PDF as deep surface');

const screenshot = `${auditRoot}/screenshots/web-vedic-progressive-disclosure.png`;
requireFile(screenshot, 50_000);
for (const file of [
  `${auditRoot}/artifacts/phase6-progressive-disclosure-audit.json`,
  `${auditRoot}/screenshots/mobile-source-proof.txt`,
  `${auditRoot}/verification.txt`,
]) {
  requireFile(file, 300);
}

console.log(
  'Kundli Value Phase 6 gate passed: web/mobile Vedic surfaces use progressive disclosure without hiding focus charts or report CTA.',
);
