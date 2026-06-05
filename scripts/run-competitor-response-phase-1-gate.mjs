import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_1_BRAND_PROMISE_COPY_AND_NAVIGATION_ALIGNMENT';
const phase0Name =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_0_BENCHMARK_REDLINE_AND_POSITION_LOCK';
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

function assertIncludes(source, fragment, label) {
  assert(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertNotIncludes(source, fragment, label) {
  assert(!source.includes(fragment), `${label}: must not include ${fragment}`);
}

[
  `docs/audits/${phase0Name}/phase-0-manifest.json`,
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
  'packages/config/src/translations/competitorResponse.json',
  'packages/config/src/competitorResponse.ts',
  `${auditDir}/brand-promise-copy-audit.md`,
  `${auditDir}/phase-1-manifest.json`,
  `${auditDir}/verification.txt`,
].forEach(file => assert(exists(file), `missing required file ${file}`));

const phase0Manifest = readJson(`docs/audits/${phase0Name}/phase-0-manifest.json`);
assert(phase0Manifest.status === 'GREEN', 'Phase 0 manifest must be GREEN');

const roadmap = read(
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
);
[
  phaseName,
  'Landing page hero and value proposition.',
  'Dashboard welcome copy.',
  'Report marketplace intro.',
  'Pricing/pass descriptions where they explain AI/report value.',
  'Translation JSON files for all user-facing copy touched.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'roadmap phase 1'));

const copyJsonRaw = read('packages/config/src/translations/competitorResponse.json');
const copyJson = JSON.parse(copyJsonRaw);
assert(copyJson.version === 1, 'competitorResponse translation version must be 1');

for (const language of ['en', 'hi', 'gu']) {
  assert(copyJson.copy?.[language], `missing ${language} competitor response copy`);
  for (const key of ['hero', 'landing', 'dashboard', 'reportPage', 'headerTagline']) {
    assert(copyJson.copy?.[language]?.[key], `missing ${language}.${key}`);
  }
}

[
  'evidence-backed',
  'Real guidance',
  'not fear or fluff',
  'without per-minute pressure',
  'Prediction first',
  'Chart math first',
  'specialist',
  'Life Atlas is the only approved synthesis report',
].forEach(fragment =>
  assertIncludes(copyJsonRaw, fragment, 'competitor response translation copy'),
);

[
  'psychic marketplace',
  'unlock your destiny',
  'per-minute astrologer',
  'Nadi report',
].forEach(fragment =>
  assertNotIncludes(copyJsonRaw, fragment, 'competitor response translation copy'),
);

const configSource = read('packages/config/src/competitorResponse.ts');
assertIncludes(configSource, 'getCompetitorResponseCopy', 'competitor response source');
assertIncludes(configSource, 'translations/competitorResponse.json', 'competitor response source');

const exportsSource = read('packages/config/src/index.ts');
assertIncludes(exportsSource, "export * from './competitorResponse';", 'config exports');

const hero = read('apps/web/components/HeroSection.tsx');
assertIncludes(hero, 'getCompetitorResponseCopy(language).hero', 'HeroSection');
assertNotIncludes(hero, 'const heroCopy', 'HeroSection local copy');
assertNotIncludes(hero, 'Holistic Vedic astrology + AI', 'HeroSection old promise');

const landing = read('apps/web/app/page.tsx');
assertIncludes(landing, 'getCompetitorResponseCopy(language).landing', 'landing page');
assertNotIncludes(landing, 'const landingCopy', 'landing page local copy');
assertNotIncludes(landing, 'Your personal holistic astrology companion', 'landing old promise');

const dashboard = read('apps/web/app/dashboard/page.tsx');
assertIncludes(dashboard, 'getCompetitorResponseCopy(language).dashboard', 'dashboard page');
assertIncludes(dashboard, 'competitorCopy.readyTitle', 'dashboard ready title');
assertNotIncludes(dashboard, 'Your holistic astrology cockpit.', 'dashboard old promise');
assertNotIncludes(dashboard, 'START WITH LIFE NEED', 'dashboard duplicate/old eyebrow');

const reportPage = read('apps/web/app/dashboard/report/page.tsx');
assertIncludes(reportPage, 'getCompetitorResponseCopy(language).reportPage', 'report page');
assertNotIncludes(reportPage, 'const reportPageCopy', 'report page local copy');
assertNotIncludes(reportPage, 'Pick the report you actually need.', 'report page old title');

const header = read('apps/web/components/WebHeader.tsx');
assertIncludes(header, 'getCompetitorResponseCopy(language)', 'web header');
assertIncludes(header, 'responseCopy.headerTagline', 'web header tagline');
assertNotIncludes(header, "tagline: 'Holistic astrology'", 'web header old tagline');

const audit = read(`${auditDir}/brand-promise-copy-audit.md`);
[
  'Status: GREEN',
  'Updated Source Of Truth',
  'Surfaces Aligned',
  'Strict Redline Checks',
  'Known Deferred Work',
  'WebDossierPreview',
].forEach(fragment => assertIncludes(audit, fragment, 'phase 1 audit'));

const manifest = readJson(`${auditDir}/phase-1-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(
  manifest.lockedBrandPromise ===
    'Predicta is the premium evidence-backed astrology intelligence app for people who want real guidance, not fear, fluff, or per-minute pressure.',
  'manifest locked promise mismatch',
);
[
  'dedicatedTranslationSourceExists',
  'heroUsesDedicatedCopy',
  'landingUsesDedicatedCopy',
  'dashboardUsesDedicatedCopy',
  'reportPageUsesDedicatedCopy',
  'headerTaglineUsesDedicatedCopy',
  'activeBrandCopyHasNoNadi',
  'deferredReportLaneScopeDeclared',
  'phaseGatePasses',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`));

const packageJson = read('package.json');
assertIncludes(
  packageJson,
  '"test:competitor-response-phase-1": "node scripts/run-competitor-response-phase-1-gate.mjs"',
  'package script',
);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: brand promise source of truth, wired first-touch surfaces, navigation tagline alignment, no active Nadi copy, and phase scope are green.`,
);
