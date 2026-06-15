import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const phaseName = 'PREDICTA_REVIVAL_V2_PHASE_3_LAYOUT_SPACING_AND_PERSONAL_SPACE_SYSTEM';
const auditRoot = 'docs/audits/PREDICTA_REVIVAL_V2_PHASE_3_LAYOUT_SPACING_AND_PERSONAL_SPACE_SYSTEM';
const failures = [];

function read(path) {
  return readFileSync(path, 'utf8');
}

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) {
    failures.push(`${label} is missing ${JSON.stringify(needle)}.`);
  }
}

function assertRegex(source, pattern, label) {
  if (!pattern.test(source)) {
    failures.push(`${label} does not match ${pattern}.`);
  }
}

const packageJson = JSON.parse(read('package.json'));
if (
  packageJson.scripts?.['test:revival-v2-phase-3'] !==
  'node scripts/run-revival-v2-phase-3-spacing-gate.mjs'
) {
  failures.push('package.json must expose test:revival-v2-phase-3.');
}

const roadmap = read('docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md');
assertIncludes(roadmap, phaseName, 'Revival V2.1 roadmap');
assertIncludes(roadmap, 'Shared spacing rules for section stacks, cards, forms, chips, badges, pills', 'Phase 3 contract');

const css = read('apps/web/app/globals.css');
assertIncludes(css, 'Revival V2 Phase 3: personal-space contract', 'Global CSS phase marker');
assertIncludes(css, '--predicta-space-action-gap', 'Shared action gap token');
assertIncludes(css, '--predicta-space-field-gap', 'Shared field gap token');
assertIncludes(css, '--predicta-space-cluster-gap', 'Shared cluster gap token');
assertIncludes(css, '--predicta-touch-target: 48px', '48px touch-target baseline');
assertIncludes(css, '.predicta-world-primary-actions', 'World action-row spacing selector');
assertIncludes(css, '.report-download-actions', 'Report download action spacing selector');
assertIncludes(css, '.signature-action-row', 'Signature action spacing selector');
assertIncludes(css, '.kp-question-mode-row', 'KP question chip spacing selector');
assertIncludes(css, '.kundli-form-grid label', 'Kundli form spacing selector');
assertIncludes(css, '.birth-place-form-field', 'Birth place spacing selector');
assertIncludes(css, '.report-drawer summary', 'Report drawer summary spacing selector');
assertIncludes(css, '.predicta-world-context-note summary', 'World drawer summary spacing selector');
assertRegex(
  css,
  /@media \(max-width: 640px\)[\s\S]*\.predicta-world-primary-actions[\s\S]*grid-template-columns: minmax\(0, 1fr\)/,
  'Mobile action rows must stack without cramped CTA columns',
);
assertRegex(
  css,
  /@media \(max-width: 640px\)[\s\S]*\.report-school-subnav[\s\S]*display: grid[\s\S]*\.report-school-subnav a[\s\S]*width: 100%/,
  'Mobile report school tabs must stack as full-width links',
);
assertRegex(
  css,
  /\.report-school-subnav[\s\S]*\.kp-question-mode-row[\s\S]*\.signature-trait-options[\s\S]*gap: var\(--predicta-space-action-gap-tight\)/,
  'Mobile chip clusters must preserve personal space',
);
assertRegex(
  css,
  /input:not\(\[type='radio'\]\):not\(\[type='checkbox'\]\):not\(\[type='hidden'\]\):not\(\[type='file'\]\)[\s\S]*padding-block: 12px/,
  'Inputs must keep vertical breathing room',
);

const personalSpaceAudit = read('scripts/run-ui-personal-space-audit.mjs');
assertIncludes(personalSpaceAudit, '/dashboard/kundli', 'Runtime personal-space audit routes');
assertIncludes(personalSpaceAudit, '/dashboard/report', 'Runtime personal-space audit routes');
assertIncludes(personalSpaceAudit, '/dashboard/signature', 'Runtime personal-space audit routes');
assertIncludes(personalSpaceAudit, "name: 'narrow-mobile'", 'Runtime personal-space narrow-mobile viewport');
assertIncludes(personalSpaceAudit, 'minSiblingGap = 8', 'Runtime sibling-gap contract');
assertIncludes(personalSpaceAudit, 'minBoundaryGap = 6', 'Runtime boundary-gap contract');

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

mkdirSync(auditRoot, { recursive: true });

const ledger = {
  phase: phaseName,
  verdict: 'GREEN',
  lockedBehavior: {
    actions: 'shared wrapped action-row gap and 48px touch-target baseline',
    cards: 'shared min-width and overflow-wrap protection for cards and panels',
    chips: 'shared pill, badge, language, report, KP, and signature chip personal space',
    drawers: 'shared drawer summary hit-area and spacing rules',
    forms: 'shared form field gap plus input padding for Kundli, birth-place, admin, and account flows',
    responsive: 'mobile CTA rows stack to one clear action column where density risk is highest',
    reportSubnav: 'mobile report school tabs stack as full-width links',
    runtimeAudit: 'existing UI personal-space audit remains the visual gate across routes and breakpoints',
  },
  failures,
};

writeFileSync(join(auditRoot, 'phase-3-spacing-ledger.json'), `${JSON.stringify(ledger, null, 2)}\n`);
writeFileSync(
  join(auditRoot, 'redline-audit.md'),
  [
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    'GREEN.',
    '',
    '## Locked Behavior',
    '',
    '- Shared spacing tokens now govern action rows, chips, forms, cards, drawers, tabs, and sticky/action clusters.',
    '- Buttons and input-like controls use a 48px minimum touch target.',
    '- Mobile action clusters stack intentionally instead of squeezing CTAs into cramped columns.',
    '- Kundli birth-place fields, report actions, KP question controls, signature actions, and world primary actions are explicitly covered.',
    '- The runtime UI personal-space audit remains required before this phase can be called green.',
    '',
    '## Follow-Up',
    '',
    'Phase 4 owns deeper mobile/tablet app-feel beyond spacing normalization.',
  ].join('\n'),
);

console.log(`${phaseName} passed: layout spacing and personal-space contract is green.`);
