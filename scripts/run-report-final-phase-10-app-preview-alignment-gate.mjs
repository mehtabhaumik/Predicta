import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_10_REPORT_PAGE_AND_APP_PREVIEW_ALIGNMENT';
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
  'packages/config/src/pricing.ts',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/app/globals.css',
  'apps/mobile/src/screens/ReportScreen.tsx',
  `${auditDir}/report-page-app-preview-alignment-audit.md`,
  `${auditDir}/phase-10-report-page-app-preview-alignment-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const productIds = [
  'KUNDLI',
  'VEDIC',
  'KP',
  'JAIMINI',
  'CAREER',
  'MARRIAGE',
  'WEALTH',
  'SADESATI',
  'DASHA',
  'COMPATIBILITY',
  'LIFE_ATLAS',
  'NUMEROLOGY',
  'SIGNATURE',
  'REMEDIES',
];

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'shared report preview alignment contract',
  'exactly three preview bullets',
  'Web report composer must render the preview bridge',
  'Mobile report composer must render the same preview bridge',
  'Signature preview must keep the confirmed-traits-only boundary',
  'Life Atlas preview must remain non-technical',
  'test:report-final-phase-10',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 10'));

const pricing = read('packages/config/src/pricing.ts');
[
  'export type ReportPreviewAlignment',
  'compactPromise: string',
  'downloadNudge: string',
  'focusLine: string',
  'previewBullets: string[]',
  "const REPORT_PREVIEW_ALIGNMENT: Record<ReportMarketplaceProduct['id'], ReportPreviewAlignment>",
  'export function getReportPreviewAlignment',
  'previewBullets: [...REPORT_PREVIEW_ALIGNMENT[reportFocus].previewBullets]',
].forEach(fragment => assertIncludes(pricing, fragment, 'pricing preview alignment contract'));

const alignmentStart = pricing.indexOf('const REPORT_PREVIEW_ALIGNMENT');
const alignmentEnd = pricing.indexOf('export function getReportMarketplaceProducts');
const alignmentSource = pricing.slice(alignmentStart, alignmentEnd);
productIds.forEach(productId => {
  const blockStart = alignmentSource.indexOf(`  ${productId}: {`);
  assert(blockStart !== -1, `REPORT_PREVIEW_ALIGNMENT missing ${productId}`);
  if (blockStart === -1) {
    return;
  }

  const nextProductStart = productIds
    .map(id => alignmentSource.indexOf(`  ${id}: {`, blockStart + 1))
    .filter(index => index !== -1)
    .sort((a, b) => a - b)[0];
  const block = alignmentSource.slice(
    blockStart,
    nextProductStart === undefined ? alignmentSource.length : nextProductStart,
  );
  assertIncludes(block, 'compactPromise:', `${productId} preview alignment`);
  assertIncludes(block, 'downloadNudge:', `${productId} preview alignment`);
  assertIncludes(block, 'focusLine:', `${productId} preview alignment`);
  assertIncludes(block, 'previewBullets:', `${productId} preview alignment`);

  const bulletMatch = block.match(/previewBullets:\s*\[([^\]]+)\]/);
  assert(Boolean(bulletMatch), `${productId} preview bullets must be inline and auditable`);
  if (bulletMatch) {
    const bulletCount = (bulletMatch[1].match(/'/g) ?? []).length / 2;
    assert(bulletCount === 3, `${productId} must have exactly 3 preview bullets, found ${bulletCount}`);
  }
});
assert(
  (alignmentSource.match(/previewBullets:/g) ?? []).length === productIds.length,
  'REPORT_PREVIEW_ALIGNMENT must define one previewBullets array per product',
);

const web = read('apps/web/components/WebDossierPreview.tsx');
[
  'getReportPreviewAlignment',
  'selectedReportPreviewAlignment',
  'const previewAlignment = getReportPreviewAlignment(product.id)',
  'className="report-preview-focus-line"',
  'className="report-app-preview-bridge"',
  'data-report-final-phase10-preview="compact"',
  'previewAlignment.compactPromise',
  'previewAlignment.previewBullets.map',
  'previewAlignment.downloadNudge',
  'renderInlineReportComposer(selectedReport,',
  'attachStickyRef: true',
].forEach(fragment => assertIncludes(web, fragment, 'web report preview alignment'));
assertNotIncludes(web, 'data-report-final-phase10-preview="full"', 'web report preview alignment');

const css = read('apps/web/app/globals.css');
[
  '.report-preview-focus-line',
  '.report-app-preview-bridge',
  '.report-app-preview-bridge ul',
  '.report-app-preview-bridge li',
].forEach(fragment => assertIncludes(css, fragment, 'web report preview CSS'));

const mobile = read('apps/mobile/src/screens/ReportScreen.tsx');
[
  'getReportPreviewAlignment',
  'selectedReportPreviewAlignment',
  'const previewAlignment = getReportPreviewAlignment(product.id)',
  'testID="report-final-phase10-preview"',
  'previewAlignment.focusLine',
  'previewAlignment.compactPromise',
  'previewAlignment.previewBullets.map',
  'previewAlignment.downloadNudge',
  'renderInlineReportComposer(selectedReport)',
].forEach(fragment => assertIncludes(mobile, fragment, 'mobile report preview alignment'));
assertNotIncludes(mobile, 'kundli,\n        kundli,', 'mobile report preview alignment');

const audit = read(`${auditDir}/report-page-app-preview-alignment-audit.md`);
[
  'GREEN after scoped implementation audit',
  'shared preview alignment',
  'exactly three preview bullets',
  'data-report-final-phase10-preview="compact"',
  'testID="report-final-phase10-preview"',
  'No full report chapters',
  'Mobile duplicate Kundli object key risk was checked',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 10 audit'));

const manifest = readJson(`${auditDir}/phase-10-report-page-app-preview-alignment-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(
  manifest.sharedPreviewContract?.source === 'packages/config/src/pricing.ts',
  'manifest shared preview source mismatch',
);
assert(
  manifest.sharedPreviewContract?.requiredBulletCountPerProduct === 3,
  'manifest must require three bullets',
);
assert(
  manifest.surfaces?.web?.marker === 'data-report-final-phase10-preview="compact"',
  'manifest web marker mismatch',
);
assert(
  manifest.surfaces?.mobile?.marker === 'testID="report-final-phase10-preview"',
  'manifest mobile marker mismatch',
);
[
  'App previews must not become full report walls.',
  'PDF remains the deep reading surface.',
  'Vedic customization remains progressive.',
  'Signature previews use confirmed visible traits only.',
  'Life Atlas previews remain non-technical and user-facing.',
  'All report products use one shared preview source of truth.',
].forEach(rule => assert(manifest.strictRules?.includes(rule), `manifest missing strict rule ${rule}`));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed.`);
