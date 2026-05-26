import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName =
  'PREDICTA_PRE_LIVE_PHASE_13_REPORT_PAGE_MOBILE_DENSITY_AND_COMPOSER_POLISH';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

await mkdir(auditRoot, { recursive: true });

const webReport = readWorkspaceFile('apps/web/components/WebDossierPreview.tsx');
const mobileReport = readWorkspaceFile('apps/mobile/src/screens/ReportScreen.tsx');
const buyerGate = readWorkspaceFile('scripts/run-end-to-end-buyer-rejection-test.mjs');
const webCss = readWorkspaceFile('apps/web/app/globals.css');

assertIncludes(
  webReport,
  'data-phase13-first-screen-primary-action="true"',
  'web report has a first-screen primary composer contract marker',
);
assertIncludes(
  webReport,
  'className="report-quick-composer glass-panel"',
  'web report renders the compact composer before the marketplace',
);
assertIncludes(
  webReport,
  'renderInlineReportComposer(selectedReport,',
  'web selected report renders its action composer immediately in the top selected option',
);
assertIncludes(
  webReport,
  'attachStickyRef: true',
  'web sticky mini bar observes the primary composer, not a hidden lower composer',
);
assertIncludes(
  webReport,
  'className="report-marketplace-selector"',
  'web school marketplace is progressive disclosure',
);
assertIncludes(
  webReport,
  'open={isReportMarketplaceOpen}',
  'web marketplace drawer is controlled by explicit report-world state',
);
assertIncludes(
  webReport,
  'report-inline-customize',
  'web Vedic builder keeps custom sections behind progressive disclosure',
);
assert.doesNotMatch(
  webReport,
  /<div className="dossier-toolbar">/,
  'web report no longer keeps a duplicate global depth toolbar under the composer',
);
assertIncludes(
  webCss,
  '.report-quick-composer',
  'web report quick composer has dedicated layout styling',
);
assertIncludes(
  webCss,
  '.report-marketplace-selector',
  'web report marketplace drawer has dedicated styling',
);

assertIncludes(
  mobileReport,
  'REPORT COMPOSER',
  'mobile report starts with the composer, not the long marketplace',
);
assertIncludes(
  mobileReport,
  'renderInlineReportComposer(selectedReport)',
  'mobile selected report renders immediate inline download actions',
);
assertIncludes(
  mobileReport,
  'showReportMarketplace ? (',
  'mobile marketplace is hidden until the user asks to change report worlds',
);
assertIncludes(
  mobileReport,
  'Customize language and sections',
  'mobile custom language/section controls are progressive disclosure',
);
assertIncludes(
  mobileReport,
  'Recommended by Predicta is selected by default',
  'mobile Vedic custom selection is understandable without a tutorial',
);
assert.doesNotMatch(
  mobileReport,
  /REPORT DELIVERY[\s\S]*<GlowButton/,
  'mobile does not keep duplicate lower download buttons after the composer',
);

assertIncludes(
  buyerGate,
  'firstScreenButtons',
  'buyer gate reports first-screen action density',
);
assertIncludes(
  buyerGate,
  'firstScreenFormControls',
  'buyer gate reports first-screen form density',
);
assertIncludes(
  buyerGate,
  'report first screen exposes too many actions',
  'buyer gate fails excessive report first-screen action density',
);

writeFileSync(
  path.join(auditRoot, 'composer-contract.txt'),
  [
    'Report page composer contract:',
    '- Web starts with a compact selected-report composer.',
    '- Web still renders the full school-separated marketplace, but behind a change-report drawer.',
    '- The selected report composer remains rendered directly under selected product cards when the drawer is open.',
    '- Vedic uses Recommended by Predicta by default and hides advanced section selection behind customization.',
    '- Mobile starts with the selected-report composer and hides marketplace/language/section options behind explicit actions.',
    '- Buyer rejection gate now records and enforces first-screen report density.',
  ].join('\n'),
);

writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}`,
    '',
    'Source gate: PASS',
    '',
    'Required follow-up commands for green:',
    '- corepack pnpm test:pre-live-phase-13',
    '- corepack pnpm --filter @pridicta/web typecheck',
    '- corepack pnpm --filter @pridicta/mobile exec tsc --noEmit',
    '- corepack pnpm build:web',
    '- PREDICTA_BUYER_BASE_URL=http://127.0.0.1:3009 corepack pnpm test:buyer-rejection',
    '- PREDICTA_VISUAL_BASE_URL=http://127.0.0.1:3009 PREDICTA_VISUAL_OUTPUT_DIR=docs/audits/PREDICTA_PRE_LIVE_PHASE_13_REPORT_PAGE_MOBILE_DENSITY_AND_COMPOSER_POLISH/screenshots corepack pnpm test:visual-proof',
    '- git diff --check',
  ].join('\n'),
);

console.log(
  JSON.stringify(
    {
      auditRoot: path.relative(repoRoot, auditRoot),
      status: 'passed',
    },
    null,
    2,
  ),
);

function readWorkspaceFile(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  assert.ok(existsSync(fullPath), `${relativePath} exists`);
  return readFileSync(fullPath, 'utf8');
}

function assertIncludes(source, fragment, message) {
  assert.ok(source.includes(fragment), message);
}
