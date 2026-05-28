import { strict as assert } from 'node:assert';
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const phase =
  'PREDICTA_AUDIT_1_PHASE_7_GLOBAL_LAYOUT_TOKEN_AND_COMPONENT_SYSTEM_LOCK';
const artifactRoot = path.join(
  repoRoot,
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7-global-layout-token-component-system-lock',
);
const artifactPath = path.join(artifactRoot, 'phase-7-design-system-drift-metrics.json');

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function countMatches(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

function uniqueMatches(source, pattern) {
  return Array.from(new Set(source.match(pattern) ?? [])).sort();
}

function assertIncludes(source, label, required) {
  for (const item of required) {
    assert.ok(source.includes(item), `${label} must include ${item}`);
  }
}

const tokensSource = read('packages/ui-tokens/src/index.ts');
const globalsSource = read('apps/web/app/globals.css');
const mobileColorsSource = read('apps/mobile/src/theme/colors.ts');
const pdfPackageSource = read('packages/pdf/package.json');
const pdfReportDocumentSource = read('packages/pdf/src/reportDocument.tsx');
const primitivesSource = read('apps/web/components/ui/DesignSystemPrimitives.tsx');
const roadmapSource = read('docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md');
const auditReadmeSource = read('docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/README.md');
const pkg = JSON.parse(read('package.json'));

assertIncludes(tokensSource, 'ui tokens', [
  'semanticColors',
  'typography',
  'spacing',
  'radii',
  'elevation',
  'motion',
  'zIndex',
  'breakpoints',
  'primitiveClasses',
  'routeSpecificCssExceptionAllowlist',
  'cssCustomProperties',
]);

assertIncludes(tokensSource, 'ui token primitive classes', [
  'pageShell',
  'sectionStack',
  'card',
  'actionRow',
  'tabs',
  'table',
  'form',
  'emptyState',
  'loadingState',
  'modal',
  'stickyCta',
]);

const exceptionMatches = tokensSource.match(/'[^']+'/g) ?? [];
const routeExceptionCount = exceptionMatches.filter(item =>
  ['kundli-chart', 'signature', 'report', 'dashboard-shell', 'landing-intro'].includes(
    item.replaceAll("'", ''),
  ),
).length;
assert.ok(routeExceptionCount <= 5, 'route-specific CSS exceptions must stay limited');

assertIncludes(mobileColorsSource, 'mobile colors', [
  "from '@pridicta/ui-tokens'",
  'nativeThemeTokens.background',
  'nativeThemeTokens.gradient',
  'nativeThemeTokens.success',
]);

assertIncludes(pdfPackageSource, 'pdf package', ['"@pridicta/ui-tokens": "workspace:*"']);
assertIncludes(pdfReportDocumentSource, 'pdf report document', [
  "from '@pridicta/ui-tokens'",
  'pdfThemeTokens.cover.blueGlow',
  'pdfThemeTokens.cover.greenGlow',
  'pdfThemeTokens.cover.magentaGlow',
  'pdfThemeTokens.interior.background',
]);

assertIncludes(primitivesSource, 'web primitive components', [
  "from '@pridicta/ui-tokens'",
  'PredictaPageShell',
  'PredictaSectionStack',
  'PredictaCard',
  'PredictaActionRow',
  'PredictaTabs',
  'PredictaTable',
  'PredictaForm',
  'PredictaEmptyState',
  'PredictaLoadingState',
  'PredictaModal',
  'PredictaStickyCta',
]);

assertIncludes(globalsSource, 'globals.css token aliases', [
  'Audit 1 Phase 7: CSS aliases mirror @pridicta/ui-tokens',
  '--predicta-bg',
  '--predicta-panel',
  '--predicta-border',
  '--predicta-radius-card',
  '--predicta-space-page',
  '--predicta-z-sticky',
]);

assertIncludes(globalsSource, 'globals.css primitive classes', [
  '.predicta-page-shell',
  '.predicta-section-stack',
  '.predicta-card',
  '.predicta-action-row',
  '.predicta-tabs',
  '.predicta-table',
  '.predicta-form',
  '.predicta-empty-state',
  '.predicta-loading-state',
  '.predicta-modal',
  '.predicta-sticky-cta',
]);

assert.equal(
  pkg.scripts['test:audit1-phase-7'],
  'node scripts/run-audit1-phase-7-design-system-lock-gate.mjs',
);

assertIncludes(roadmapSource, 'roadmap phase 7', [
  'PREDICTA_AUDIT_1_PHASE_7_GLOBAL_LAYOUT_TOKEN_AND_COMPONENT_SYSTEM_LOCK',
  'Token usage is enforced by a source gate',
  'Audit 2 design-system drift metrics are saved as an artifact',
]);

assertIncludes(auditReadmeSource, 'audit readme phase 7', [
  'PREDICTA_AUDIT_1_PHASE_7_GLOBAL_LAYOUT_TOKEN_AND_COMPONENT_SYSTEM_LOCK',
  'phase-7-design-system-drift-metrics.json',
]);

const cssMetrics = {
  borderRadiusDeclarations: countMatches(globalsSource, /border-radius\s*:/g),
  boxShadowDeclarations: countMatches(globalsSource, /box-shadow\s*:/g),
  cssVariableReads: countMatches(globalsSource, /var\(--/g),
  hardcodedHexColors: countMatches(globalsSource, /#[0-9a-fA-F]{3,8}\b/g),
  hardcodedRgbaColors: countMatches(globalsSource, /rgba?\(/g),
  importantDeclarations: countMatches(globalsSource, /!important/g),
  lineCount: globalsSource.split('\n').length,
  mediaQueries: countMatches(globalsSource, /@media\b/g),
  zIndexDeclarations: countMatches(globalsSource, /z-index\s*:/g),
};

const sourceMetrics = {
  mobileHardcodedHexColors: countMatches(mobileColorsSource, /#[0-9a-fA-F]{3,8}\b/g),
  pdfTokenReferences: countMatches(pdfReportDocumentSource, /pdfThemeTokens\./g),
  primitiveExports: countMatches(primitivesSource, /export function Predicta/g),
  tokenExports: countMatches(tokensSource, /export const /g),
};

assert.ok(cssMetrics.cssVariableReads > cssMetrics.hardcodedHexColors, 'CSS must favor token variable reads over raw hex values');
assert.ok(sourceMetrics.primitiveExports >= 11, 'all required web primitives must be exported');
assert.ok(sourceMetrics.mobileHardcodedHexColors <= 1, 'mobile theme must consume shared tokens instead of local color literals');
assert.ok(sourceMetrics.pdfTokenReferences >= 4, 'PDF renderer must consume shared semantic tokens');

const report = {
  artifactPath: path.relative(repoRoot, artifactPath),
  cssMetrics,
  generatedAt: new Date().toISOString(),
  phase,
  primitiveClasses: uniqueMatches(globalsSource, /\.predicta-[a-z-]+/g),
  routeSpecificCssExceptionAllowlist: [
    'kundli-chart',
    'signature',
    'report',
    'dashboard-shell',
    'landing-intro',
  ],
  sourceMetrics,
  status: 'green',
  tokenFamilies: [
    'semanticColors',
    'typography',
    'spacing',
    'radii',
    'elevation',
    'motion',
    'zIndex',
    'breakpoints',
    'primitiveClasses',
  ],
};

await mkdir(artifactRoot, { recursive: true });
await writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report, null, 2));
console.log(`${phase} passed: shared tokens, primitives, drift metrics, and source gate are green.`);
