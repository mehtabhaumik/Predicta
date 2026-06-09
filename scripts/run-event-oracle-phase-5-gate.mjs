import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_5_MAIN_PREDICTA_CHAT_HERO_EXPERIENCE';
const auditDir = path.join(root, 'docs/audits', phaseName);
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return existsSync(path.join(root, relativePath));
}

function assertGate(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

[
  'docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md',
  'apps/web/components/WebEventQuestionComposer.tsx',
  'packages/config/src/translations/eventOracle.json',
  `${path.relative(root, auditDir)}/browser-smoke.json`,
  `${path.relative(root, auditDir)}/phase-5-chat-hero-audit.md`,
  `${path.relative(root, auditDir)}/phase-5-manifest.json`,
  `${path.relative(root, auditDir)}/verification.txt`,
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'Dashboard hero ask box',
  'Event question chips',
  'Recent prediction threads',
  'Active Kundli context visible',
  'Credit/pass status visible but not noisy',
  'Zero-credit deterministic help still available',
  'Prediction answer card',
  'direct answer first',
  'timing and trigger second',
  'action plan third',
  'evidence collapsed last',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 5 roadmap'));

const component = read('apps/web/components/WebEventQuestionComposer.tsx');
[
  'buildEventOraclePredictionObject',
  'buildEventOracleEvidenceContract',
  'useWebKundliLibrary',
  'getWebPassCostDisplay',
  'PASS_USAGE_UPDATED_EVENT',
  'RECENT_EVENT_THREADS_KEY',
  'event-question-hero',
  'event-question-status-grid',
  'event-question-prediction-card',
  'event-question-direct-answer',
  'event-question-recent-threads',
  'event-question-collapsed-evidence',
  'copy.hero.primaryCta',
  'copy.hero.secondaryCta',
  'copy.hero.deterministicHelp',
  'copy.predictionCard.directAnswerLabel',
  'predictionPreview.directAnswer',
  'predictionPreview.timingWindow.label',
  'predictionPreview.mostLikelyTrigger.summary',
  'predictionPreview.whatToDoNow',
  'predictionPreview.collapsedEvidence',
].forEach(fragment => assertIncludes(component, fragment, 'Event question composer'));

assertGate(
  !component.includes('Free gives a concise answer. Paid Precision Reading'),
  'component must not hardcode long English report CTA copy',
);

const css = read('apps/web/app/globals.css');
[
  '.event-question-hero',
  '.event-question-status-grid',
  '.event-question-hero-actions',
  '.event-question-hero-lower',
  '.event-question-prediction-card',
  '.event-question-prediction-grid',
  '.event-question-collapsed-evidence',
  '.event-question-recent-threads',
  'overflow-wrap: anywhere',
  '@media (max-width: 920px)',
  '@media (max-width: 720px)',
].forEach(fragment => assertIncludes(css, fragment, 'Phase 5 CSS'));

const eventOracleCopy = readJson('packages/config/src/translations/eventOracle.json').copy;
for (const lang of ['en', 'hi', 'gu']) {
  const localized = eventOracleCopy[lang];
  for (const section of ['hero', 'predictionCard', 'recentThreads']) {
    assertGate(Boolean(localized?.[section]), `eventOracle ${lang} missing ${section}`);
  }
  for (const key of [
    'actionTitle',
    'activeKundliEmpty',
    'activeKundliLabel',
    'activeKundliReady',
    'creditQuietBody',
    'creditQuietTitle',
    'deterministicHelp',
    'eyebrow',
    'primaryCta',
    'reportCta',
    'secondaryCta',
    'statusLabel',
    'subtitle',
    'title',
  ]) {
    assertGate(Boolean(localized.hero?.[key]), `eventOracle ${lang} missing hero.${key}`);
  }
  for (const key of [
    'actionPlanLabel',
    'collapsedEvidenceLabel',
    'confidenceLabel',
    'delayLabel',
    'directAnswerLabel',
    'evidencePendingTitle',
    'strengthenLabel',
    'timingTriggerLabel',
  ]) {
    assertGate(Boolean(localized.predictionCard?.[key]), `eventOracle ${lang} missing predictionCard.${key}`);
  }
  for (const key of ['empty', 'openThread', 'title']) {
    assertGate(Boolean(localized.recentThreads?.[key]), `eventOracle ${lang} missing recentThreads.${key}`);
  }
}

for (const lang of ['hi', 'gu']) {
  const joined = JSON.stringify({
    hero: eventOracleCopy[lang].hero,
    predictionCard: eventOracleCopy[lang].predictionCard,
    recentThreads: eventOracleCopy[lang].recentThreads,
  });
  for (const forbidden of [
    'Ask Predicta first',
    'Create Kundli first',
    'Open reports',
    'Direct answer',
    'Recent prediction threads',
    'Prediction card preview',
    'Access status',
  ]) {
    assertGate(!joined.includes(forbidden), `eventOracle ${lang} leaks English phrase ${forbidden}`);
  }
}

const manifest = readJson(`${path.relative(root, auditDir)}/phase-5-manifest.json`);
assertGate(manifest.phase === phaseName, 'manifest phase mismatch');
assertGate(manifest.status === 'GREEN', 'manifest status must be GREEN');
for (const key of [
  'dashboardHeroAskBox',
  'eventQuestionChips',
  'recentPredictionThreads',
  'activeKundliContext',
  'quietCreditPassStatus',
  'zeroCreditDeterministicHelp',
  'predictionAnswerCardOrder',
  'responsiveNoCrowding',
  'localizedDedicatedJsonCopy',
]) {
  assertGate(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`);
}

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: primary Predicta chat hero, active Kundli status, quiet credit status, recent threads, zero-credit help, prediction-card order, responsive CSS, and dedicated translations are green.`,
);
