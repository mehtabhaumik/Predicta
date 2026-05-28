import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const phase = 'PREDICTA_AUDIT_1_PHASE_7A_DESIGN_TOKEN_SINGLE_SOURCE_OF_TRUTH';
const artifactRoot = path.join(
  repoRoot,
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7a-design-token-single-source-of-truth',
);
const artifactPath = path.join(artifactRoot, 'phase-7a-design-token-drift-report.json');

const requiredTokenShape = {
  breakpoints: [
    'mobile320',
    'mobile360',
    'mobile390',
    'mobile430',
    'landscape568',
    'tablet768',
    'tablet834',
    'laptop1024',
    'desktop1280',
    'desktop1440',
    'ultrawide1728',
  ],
  colors: [
    'base',
    'raised',
    'glass',
    'porcelain',
    'ink',
    'muted',
    'disabled',
    'magenta',
    'blue',
    'green',
    'gold',
    'danger',
    'warning',
    'success',
  ],
  elevation: ['base', 'raised', 'floating', 'modal', 'toast'],
  motion: ['instantMs', 'fastMs', 'standardMs', 'slowMs', 'revealMs', 'scanMs', 'ambientMs'],
  radius: ['card', 'panel', 'chip', 'input', 'modal', 'chart', 'reportPlate'],
  spacing: [
    'pageGutter',
    'pageGutterMobile',
    'sectionGap',
    'cardPadding',
    'rowGap',
    'compactGap',
    'touchSpacing',
  ],
  typography: [
    'display',
    'pageTitle',
    'sectionTitle',
    'cardTitle',
    'body',
    'caption',
    'metadata',
    'table',
    'formLabel',
    'pill',
  ],
  zIndex: ['base', 'raised', 'sticky', 'overlay', 'modal', 'toast', 'critical'],
};

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function countMatches(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

function assertIncludes(source, label, required) {
  for (const item of required) {
    assert.ok(source.includes(item), `${label} must include ${item}`);
  }
}

function assertObjectKeys(source, familyName, keys) {
  assertIncludes(source, `token family ${familyName}`, keys.map(key => `${key}:`));
}

const tokenSource = read('packages/ui-tokens/src/index.ts');
const webGlobalsSource = read('apps/web/app/globals.css');
const webPrimitiveSource = read('apps/web/components/ui/DesignSystemPrimitives.tsx');
const mobileColorsSource = read('apps/mobile/src/theme/colors.ts');
const pdfPackageSource = read('packages/pdf/package.json');
const pdfReportSource = read('packages/pdf/src/reportDocument.tsx');
const roadmapSource = read('docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md');
const auditReadmeSource = read('docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/README.md');
const pkg = JSON.parse(read('package.json'));

assertIncludes(tokenSource, 'single source token contract', [
  'predictaDesignTokens',
  'nativeThemeTokens',
  'pdfThemeTokens',
  'cssCustomProperties',
  'PredictaDesignTokens',
  'PredictaPrimitiveClass',
]);
assertObjectKeys(tokenSource, 'colors', requiredTokenShape.colors);
assertObjectKeys(tokenSource, 'typography', requiredTokenShape.typography);
assertObjectKeys(tokenSource, 'spacing', requiredTokenShape.spacing);
assertObjectKeys(tokenSource, 'radius', requiredTokenShape.radius);
assertObjectKeys(tokenSource, 'elevation', requiredTokenShape.elevation);
assertObjectKeys(tokenSource, 'motion', requiredTokenShape.motion);
assertObjectKeys(tokenSource, 'zIndex', requiredTokenShape.zIndex);
assertObjectKeys(tokenSource, 'breakpoints', requiredTokenShape.breakpoints);

assertIncludes(webPrimitiveSource, 'web token import', ["from '@pridicta/ui-tokens'"]);
assertIncludes(mobileColorsSource, 'native mobile token import', [
  "from '@pridicta/ui-tokens'",
  'nativeThemeTokens.background',
  'nativeThemeTokens.gradientMuted',
]);
assertIncludes(pdfPackageSource, 'PDF package token dependency', ['"@pridicta/ui-tokens": "workspace:*"']);
assertIncludes(pdfReportSource, 'PDF token import', [
  "from '@pridicta/ui-tokens'",
  'pdfThemeTokens.cover.background',
  'pdfThemeTokens.interior.background',
]);
assertIncludes(webGlobalsSource, 'web CSS token aliases', [
  '--predicta-bg',
  '--predicta-panel',
  '--predicta-color-blue',
  '--predicta-radius-card',
  '--predicta-space-card',
  '--predicta-z-sticky',
]);

assert.equal(
  pkg.scripts['test:audit1-phase-7a'],
  'node scripts/run-audit1-phase-7a-design-token-single-source-gate.mjs',
);
assertIncludes(roadmapSource, 'roadmap phase 7A', [
  'PREDICTA_AUDIT_1_PHASE_7A_DESIGN_TOKEN_SINGLE_SOURCE_OF_TRUTH',
  'Raw color/radius/shadow/font-size/z-index additions fail a design-token gate',
]);
assertIncludes(auditReadmeSource, 'audit readme phase 7A', [
  'PREDICTA_AUDIT_1_PHASE_7A_DESIGN_TOKEN_SINGLE_SOURCE_OF_TRUTH',
  'phase-7a-design-token-drift-report.json',
]);

const webCssMetrics = {
  borderRadiusDeclarations: countMatches(webGlobalsSource, /border-radius\s*:/g),
  boxShadowDeclarations: countMatches(webGlobalsSource, /box-shadow\s*:/g),
  cssVariableReads: countMatches(webGlobalsSource, /var\(--/g),
  hardcodedHexColors: countMatches(webGlobalsSource, /#[0-9a-fA-F]{3,8}\b/g),
  hardcodedRgbaColors: countMatches(webGlobalsSource, /rgba?\(/g),
  zIndexDeclarations: countMatches(webGlobalsSource, /z-index\s*:/g),
};
const platformMetrics = {
  mobileHardcodedHexColors: countMatches(mobileColorsSource, /#[0-9a-fA-F]{3,8}\b/g),
  mobileHardcodedRgbaColors: countMatches(mobileColorsSource, /rgba?\(/g),
  pdfTokenReferences: countMatches(pdfReportSource, /pdfThemeTokens\./g),
  tokenContractExports: countMatches(tokenSource, /export const /g),
  webPrimitiveTokenReferences: countMatches(webPrimitiveSource, /primitiveClasses\./g),
};

assert.ok(webCssMetrics.cssVariableReads >= 970, 'web CSS must keep consuming token aliases heavily');
assert.ok(webCssMetrics.hardcodedHexColors <= 135, 'web raw hex count must not exceed the Phase 7A locked baseline');
assert.ok(webCssMetrics.hardcodedRgbaColors <= 1243, 'web raw rgba count must not exceed the Phase 7A locked baseline');
assert.equal(platformMetrics.mobileHardcodedHexColors, 0, 'mobile theme must not define local hex colors');
assert.equal(platformMetrics.mobileHardcodedRgbaColors, 0, 'mobile theme must not define local rgba colors');
assert.ok(platformMetrics.pdfTokenReferences >= 5, 'PDF renderer must read its theme through pdfThemeTokens');
assert.ok(platformMetrics.webPrimitiveTokenReferences >= 11, 'web primitives must read class names from primitiveClasses');

const rawAdditionViolations = [];
const diff = execFileSync('git', ['diff', '--unified=0', 'HEAD', '--', '.', ':!pnpm-lock.yaml'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
let currentFile = '';
for (const line of diff.split('\n')) {
  if (line.startsWith('diff --git ')) {
    currentFile = line.split(' b/')[1] ?? '';
    continue;
  }
  if (!line.startsWith('+') || line.startsWith('+++')) {
    continue;
  }

  const added = line.slice(1);
  const hasRawVisualValue =
    /#[0-9a-fA-F]{3,8}\b/.test(added) ||
    /rgba?\(/.test(added) ||
    /border-radius\s*:\s*\d/.test(added) ||
    /box-shadow\s*:\s*(?!var\()/.test(added) ||
    /font-size\s*:\s*\d/.test(added) ||
    /z-index\s*:\s*\d/.test(added);

  if (!hasRawVisualValue) {
    continue;
  }

  const allowed =
    currentFile === 'packages/ui-tokens/src/index.ts' ||
    currentFile === 'scripts/run-audit1-phase-7a-design-token-single-source-gate.mjs' ||
    currentFile.startsWith('docs/audits/') ||
    added.includes('--predicta-') ||
    added.includes('pdfThemeTokens.') ||
    added.includes('nativeThemeTokens.');

  if (!allowed) {
    rawAdditionViolations.push({ file: currentFile, line: added.trim() });
  }
}
assert.deepEqual(rawAdditionViolations, [], 'raw visual additions must use tokens or be explicitly allowlisted');

const report = {
  artifactPath: path.relative(repoRoot, artifactPath),
  audit2OriginalBaseline: {
    note: 'Baseline values documented in Audit 2 roadmap before token lock.',
    webHexColors: 64,
    webRgbaValues: 474,
    webRadii: 23,
    webShadows: 52,
    webFontSizeDeclarations: 123,
    webPxValues: 157,
  },
  generatedAt: new Date().toISOString(),
  phase,
  platformMetrics,
  rawAdditionViolations,
  requiredTokenShape,
  status: 'green',
  webCssMetrics,
};

await mkdir(artifactRoot, { recursive: true });
await writeFile(artifactPath, `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify(report, null, 2));
console.log(`${phase} passed: design tokens are the source of truth and raw visual additions are gated.`);
