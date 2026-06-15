import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const phaseName = 'PREDICTA_REVIVAL_V2_PHASE_2_ACTION_FIRST_PAGE_REWRITE';
const auditRoot = 'docs/audits/PREDICTA_REVIVAL_V2_PHASE_2_ACTION_FIRST_PAGE_REWRITE';
const failures = [];

function read(path) {
  return readFileSync(path, 'utf8');
}

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) {
    failures.push(`${label} is missing ${JSON.stringify(needle)}.`);
  }
}

function assertNotIncludes(source, needle, label) {
  if (source.includes(needle)) {
    failures.push(`${label} still includes blocked chatter ${JSON.stringify(needle)}.`);
  }
}

function assertOrder(source, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);

  if (firstIndex === -1 || secondIndex === -1 || firstIndex > secondIndex) {
    failures.push(`${label} must place ${JSON.stringify(first)} before ${JSON.stringify(second)}.`);
  }
}

const packageJson = JSON.parse(read('package.json'));
if (
  packageJson.scripts?.['test:revival-v2-phase-2'] !==
  'node scripts/run-revival-v2-phase-2-action-first-gate.mjs'
) {
  failures.push('package.json must expose test:revival-v2-phase-2.');
}

const worldFrame = read('apps/web/components/PredictaWorldFrame.tsx');
assertIncludes(worldFrame, 'className="predicta-world-primary-actions"', 'PredictaWorldFrame primary actions');
assertIncludes(worldFrame, 'className="predicta-world-context-note"', 'PredictaWorldFrame context drawer');
assertOrder(
  worldFrame,
  'className="predicta-world-primary-actions"',
  'className="predicta-world-context-note"',
  'PredictaWorldFrame action-first order',
);

const vedic = read('apps/web/components/WebVedicIntelligencePanel.tsx');
assertIncludes(vedic, "getEvidenceRoomCopy('vedic', 'title', language)", 'Vedic first-screen title');
assertIncludes(vedic, "getEvidenceRoomCopy('vedic', 'body', language)", 'Vedic first-screen body');
assertIncludes(vedic, '<Link className="button primary" href={vedicAskHref}>', 'Vedic first-screen Ask CTA');
assertIncludes(vedic, '<Link className="button secondary" href="/dashboard/report">', 'Vedic first-screen report CTA');
assertOrder(
  vedic,
  'className="vedic-intelligence-heading"',
  '<ProgressiveGroup',
  'Vedic heading before content groups',
);
assertOrder(
  vedic,
  '<Link className="button primary" href={vedicAskHref}>',
  '<ProgressiveGroup',
  'Vedic first action before progressive reading groups',
);
assertNotIncludes(
  vedic,
  'Start with the essentials, open advanced tables only when you want proof, and use the PDF as the full deep reading surface.',
  'Vedic first-screen copy',
);

const kp = read('apps/web/components/WebKpPredictaPanel.tsx');
assertIncludes(kp, 'body: focusMeaning.guidance', 'KP hero guidance');
assertIncludes(kp, 'title: focusMeaning.whatItSays', 'KP hero answer');
assertNotIncludes(
  kp,
  'Choose a ready question, write your own, or pick “guide me.”',
  'KP hero guidance',
);

const jaimini = read('apps/web/components/WebJaiminiPredictaPanel.tsx');
assertIncludes(jaimini, '<details className="predicta-world-context-note">', 'Jaimini summary drawer');
assertOrder(
  jaimini,
  'className="jaimini-room-cta-row predicta-world-primary-actions"',
  '<details className="predicta-world-context-note">',
  'Jaimini action-before-summary order',
);

const reports = read('apps/web/components/WebDossierPreview.tsx');
assertIncludes(reports, 'className="report-quick-composer glass-panel"', 'Report quick composer');
assertIncludes(reports, 'data-phase13-first-screen-primary-action="true"', 'Report first-screen action marker');
assertIncludes(reports, 'renderInlineReportComposer(selectedReport,', 'Report selected inline composer');
assertOrder(
  reports,
  'className="report-selected-choice"',
  'className="report-marketplace-header"',
  'Report selected action before marketplace explanation',
);

const evidenceRoom = read('apps/web/components/WebEvidenceRoomEntry.tsx');
assertIncludes(evidenceRoom, 'className="evidence-room-entry-actions"', 'Evidence room primary action row');
assertOrder(
  evidenceRoom,
  'className="evidence-room-entry-actions"',
  '<details className="evidence-room-proof-drawer">',
  'Evidence room action before proof drawer',
);

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
    evidenceRooms: 'primary Ask action before proof drawer',
    jaimini: 'summary moved behind compact Read drawer after primary actions',
    kp: 'hero guidance uses current answer and next guidance, not question-schooling copy',
    reports: 'selected report action composer renders before marketplace explanation',
    vedic: 'first heading contains direct Vedic guidance plus Ask and Download actions',
    worldFrame: 'primary actions render before context/proof explanations',
  },
  failures,
};

writeFileSync(join(auditRoot, 'phase-2-action-first-ledger.json'), `${JSON.stringify(ledger, null, 2)}\n`);
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
    '- Every touched major surface puts action/value before explanation.',
    '- Vedic now starts with direct guidance plus Ask/Download actions.',
    '- KP hero guidance uses the active answer, not question-composer instructions.',
    '- Jaimini keeps longer generated summary behind a compact read drawer.',
    '- Reports keep selected report actions immediately under the selected choice.',
    '- Evidence rooms keep proof drawers secondary.',
    '',
    '## Follow-Up',
    '',
    'Phase 3 owns global spacing and personal-space normalization beyond the touched first-screen surfaces.',
  ].join('\n'),
);

console.log(`${phaseName} passed: action-first page rewrite contract is green.`);
