import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName =
  'PREDICTA_KUNDLI_VALUE_PHASE_3_SWAMSA_KARAKAMSHA_AND_CHALIT_FIRST_CLASS_CHARTS';
const auditRoot = `docs/audits/${phaseName}`;

function readWorkspaceFile(file) {
  return readFileSync(path.join(root, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

function requireFile(relativePath, minimumBytes = 1) {
  const fullPath = path.join(root, relativePath);
  assert.ok(existsSync(fullPath), `${relativePath} exists`);
  const size = statSync(fullPath).size;
  assert.ok(size >= minimumBytes, `${relativePath} has at least ${minimumBytes} bytes`);
  return fullPath;
}

const phaseDoc = readWorkspaceFile('docs/PREDICTA_KUNDLI_REPORT_VALUE_REBUILD_STRICT_PHASES.md');
assertIncludes(phaseDoc, phaseName, 'Phase 3 remains documented');
for (const fragment of [
  'Add Swamsa chart support where calculation evidence exists.',
  'Add Karakamsha chart support where calculation evidence exists.',
  'Support alias handling for `Swamsha`, `Svamsa`, `Karakmasa`, and',
  'Add Chalit chart support for both free and premium users.',
  'Swamsa must explain inner self-direction, soul-style expression',
  'Karakamsha must explain Atmakaraka-linked life direction',
  'Missing calculation evidence is shown as pending/calculation-limited, not',
]) {
  assertIncludes(phaseDoc, fragment, `Phase 3 doc includes ${fragment}`);
}

const soulCharts = readWorkspaceFile('packages/astrology/src/jaiminiSoulCharts.ts');
for (const fragment of [
  "export type JaiminiSoulChartRole = 'SWAMSA' | 'KARAKAMSHA'",
  'normalizeJaiminiSoulChartAlias',
  "normalized === 'swamsha'",
  "normalized === 'svamsa'",
  "normalized === 'karakmasa'",
  'export function resolveAtmakaraka',
  'export function buildSwamsaChart',
  'export function buildKarakamshaChart',
  "name: 'Swamsa Chart'",
  "name: 'Karakamsha Chart'",
]) {
  assertIncludes(soulCharts, fragment, `Jaimini soul chart module includes ${fragment}`);
}

const typeSource = readWorkspaceFile('packages/types/src/astrology.ts');
for (const fragment of [
  "'swamsa'",
  "'karakamsha'",
  "| 'SWAMSA'",
  "| 'KARAKAMSHA'",
  'swamsa: VedicIntelligenceSection &',
  'karakamsha: VedicIntelligenceSection &',
  'chart?: ChartData;',
]) {
  assertIncludes(typeSource, fragment, `shared types include ${fragment}`);
}

const contract = readWorkspaceFile('packages/astrology/src/vedicIntelligenceContract.ts');
for (const fragment of [
  'buildSwamsaChart(kundli)',
  'buildKarakamshaChart(kundli)',
  'buildParashariChalitChart(kundli)',
  'buildSwamsaSection(kundli, swamsaChart)',
  'buildKarakamshaSection(kundli, karakamshaChart)',
  'swamsa: swamsaSection',
  'karakamsha: karakamshaSection',
  "id: 'SWAMSA'",
  "id: 'KARAKAMSHA'",
  'Swamsa is a first-class inner self-direction chart',
  'Karakamsha is a first-class Atmakaraka-linked life-direction chart',
  'Swamsa is pending because verified Navamsa chart evidence is not available',
  'Karakamsha is pending because Atmakaraka or Navamsa planet placement is not available',
]) {
  assertIncludes(contract, fragment, `Vedic intelligence contract includes ${fragment}`);
}

const insights = readWorkspaceFile('packages/astrology/src/chartInsights.ts');
for (const fragment of [
  "profile === 'swamsa'",
  "profile === 'karakamsha'",
  'function composeSwamsaChartInsight',
  'function composeKarakamshaChartInsight',
  "chartType: 'SWAMSA'",
  "chartType: 'KARAKAMSHA'",
  "case 'SWAMSA':",
  "case 'KARAKAMSHA':",
  'inner self-direction',
  'Atmakaraka-linked life direction',
  'not a deterministic fate statement',
]) {
  assertIncludes(insights, fragment, `chart insights include ${fragment}`);
}

const webCharts = readWorkspaceFile('apps/web/components/WebChartsExplorer.tsx');
for (const fragment of [
  "'SWAMSA' | 'KARAKAMSHA'",
  'buildSwamsaChart',
  'buildKarakamshaChart',
  '<option value="SWAMSA">',
  '<option value="KARAKAMSHA">',
  "return 'swamsa'",
  "return 'karakamsha'",
]) {
  assertIncludes(webCharts, fragment, `web chart selector includes ${fragment}`);
}

const mobileCharts = readWorkspaceFile('apps/mobile/src/screens/ChartsScreen.tsx');
for (const fragment of [
  "'SWAMSA' | 'KARAKAMSHA'",
  'buildSwamsaChart',
  'buildKarakamshaChart',
  'FIRST-CLASS SOUL CHARTS',
  "return 'swamsa'",
  "return 'karakamsha'",
]) {
  assertIncludes(mobileCharts, fragment, `mobile chart selector includes ${fragment}`);
}

const webPanel = readWorkspaceFile('apps/web/components/WebVedicIntelligencePanel.tsx');
for (const fragment of [
  'intelligence.swamsa',
  'insightProfile="swamsa"',
  'insightProfile="karakamsha"',
  'sectionTitle="Swamsa Chart"',
  'sectionTitle="Karakamsha Chart"',
]) {
  assertIncludes(webPanel, fragment, `web Vedic panel includes ${fragment}`);
}

const mobilePanel = readWorkspaceFile('apps/mobile/src/components/VedicIntelligencePanel.tsx');
assertIncludes(mobilePanel, 'intelligence.swamsa', 'mobile Vedic panel includes Swamsa section');

const pdfSource = readWorkspaceFile('packages/pdf/src/index.ts');
for (const fragment of [
  'type PdfChartRole = ChartType |',
  "'SWAMSA'",
  "'KARAKAMSHA'",
  'buildSwamsaChart(kundli)',
  'buildKarakamshaChart(kundli)',
  "chartByRole.set('SWAMSA'",
  "chartByRole.set('KARAKAMSHA'",
  "buildClassicalVedicReportSection(intelligence.swamsa, 'SWAMSA', 'Swamsa chart', mode)",
  "buildClassicalVedicReportSection(intelligence.karakamsha, 'KARAKAMSHA', 'Karakamsha', mode)",
]) {
  assertIncludes(pdfSource, fragment, `PDF composer includes ${fragment}`);
}

const renderer = readWorkspaceFile('packages/pdf/src/reportDocument.tsx');
for (const fragment of [
  "snapshot.chartRole === 'SWAMSA'",
  "snapshot.chartRole === 'KARAKAMSHA'",
]) {
  assertIncludes(renderer, fragment, `PDF renderer includes ${fragment}`);
}

const chatActions = readWorkspaceFile('packages/astrology/src/predictaChatActions.ts');
assertIncludes(chatActions, 'Swamsa, Karakamsha', 'Predicta report memory includes Swamsa and Karakamsha');
const followUps = readWorkspaceFile('packages/astrology/src/chatFollowUps.ts');
assertIncludes(followUps, 'Explain my Swamsa chart', 'Predicta follow-ups include Swamsa');
assertIncludes(followUps, 'Explain my Karakamsha chart', 'Predicta follow-ups include Karakamsha');

for (const pdf of [
  `${auditRoot}/artifacts/phase3-free-kundli.pdf`,
  `${auditRoot}/artifacts/phase3-premium-kundli.pdf`,
]) {
  const fullPath = requireFile(pdf, 1_000_000);
  assert.equal(readFileSync(fullPath, { encoding: 'utf8', flag: 'r' }).slice(0, 4), '%PDF');
}

for (const file of [
  `${auditRoot}/artifacts/phase3-free-payload.json`,
  `${auditRoot}/artifacts/phase3-premium-payload.json`,
  `${auditRoot}/artifacts/phase3-surface-matrix.json`,
  `${auditRoot}/screenshots/web-mobile-source-proof.txt`,
  `${auditRoot}/verification.txt`,
]) {
  requireFile(file, 300);
}

console.log(
  'Kundli Value Phase 3 gate passed: Swamsa, Karakamsha, and Chalit are first-class app/report/chart surfaces.',
);
