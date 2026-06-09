import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_6_SPECIALIST_WORLD_EVIDENCE_ROOM_HANDOFFS';
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

function assertNotIncludes(source, fragment, label) {
  assertGate(!source.includes(fragment), `${label}: must not include ${fragment}`);
}

[
  'docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md',
  'apps/web/lib/predicta-chat-cta.ts',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/web/components/WebEventQuestionComposer.tsx',
  'apps/web/app/dashboard/chat/page.tsx',
  'apps/web/app/globals.css',
  'apps/web/components/WebVedicIntelligencePanel.tsx',
  'apps/web/components/WebKpPredictaPanel.tsx',
  'apps/web/components/WebJaiminiPredictaPanel.tsx',
  'apps/web/components/WebNumerologyPredictaPanel.tsx',
  'apps/web/components/WebSignatureAnalysisInputFlow.tsx',
  'apps/web/components/WebDossierPreview.tsx',
  'packages/config/src/translations/ui.json',
  'packages/types/src/astrology.ts',
  'apps/mobile/src/types/astrology.ts',
  `${path.relative(root, auditDir)}/browser-smoke.json`,
  `${path.relative(root, auditDir)}/phase-6-specialist-handoff-audit.md`,
  `${path.relative(root, auditDir)}/phase-6-manifest.json`,
  `${path.relative(root, auditDir)}/verification.txt`,
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'From Vedic: `Ask Predicta about this dasha/chart/yog`',
  'From KP: `Ask Predicta this event question`',
  'From Jaimini: `Ask Predicta about this destiny chapter`',
  'From Numerology: `Ask Predicta about this current cycle`',
  'From Signature: `Ask Predicta about these confirmed traits`',
  'From Kundli Karma: `Ask Predicta why this Dosh/Shrap/Yog appears`',
  'From Reports: `Ask Predicta about this report section`',
  'Room-safe answers inside specialist worlds',
  'Cross-school synthesis only in main Predicta or explicitly requested mode',
  'User must understand what context is being carried into chat',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 6 roadmap'));

const cta = read('apps/web/lib/predicta-chat-cta.ts');
[
  'carriedContextLabel?: string',
  'eventOracleHandoff?: boolean',
  'evidenceSourceLabel?: string',
  "handoffMode?: 'main_synthesis' | 'room_safe'",
  "setParam(params, 'carriedContextLabel', context.carriedContextLabel)",
  "setParam(params, 'evidenceSourceLabel', context.evidenceSourceLabel)",
  "setParam(params, 'handoffMode', context.handoffMode)",
  "setParam(params, 'eventOracleHandoff', context.eventOracleHandoff ? 'true' : undefined)",
  "return '/dashboard/chat';",
].forEach(fragment => assertIncludes(cta, fragment, 'Predicta chat CTA helper'));

const chat = read('apps/web/components/WebPridictaChat.tsx');
[
  "params.get('carriedContextLabel')",
  "params.get('evidenceSourceLabel')",
  "params.get('eventOracleHandoff') === 'true'",
  'parseHandoffMode(params.get',
  'function formatEvidenceHandoffLine',
  'preAuthEvidenceLine',
  "t('Context carried into Predicta')",
  "translateUiText('Evidence carried', language)",
  "translateUiText('Specialist evidence was carried into this chat.', language)",
  "translateUiText('room-safe specialist mode', language)",
  "translateUiText('main Predicta synthesis mode', language)",
  'evidenceLine',
].forEach(fragment => assertIncludes(chat, fragment, 'Web Predicta chat parser and intro'));

const composer = read('apps/web/components/WebEventQuestionComposer.tsx');
[
  'useSearchParams',
  'getEventOracleHandoffContext',
  'event-question-handoff-strip',
  'copy.handoff.title',
  'copy.handoff.evidenceLabel',
  'copy.handoff.modeLabel',
  'copy.handoff.mainSynthesisMode',
  'copy.handoff.roomSafeMode',
  "searchParams.get('eventOracleHandoff') !== 'true'",
].forEach(fragment => assertIncludes(composer, fragment, 'Primary Predicta handoff banner'));

const chatPage = read('apps/web/app/dashboard/chat/page.tsx');
[
  '<Suspense fallback={<div className="glass-panel event-question-composer" />}>',
  '<WebEventQuestionComposer />',
].forEach(fragment => assertIncludes(chatPage, fragment, 'Main Predicta chat Suspense boundary'));

const css = read('apps/web/app/globals.css');
[
  '.event-question-handoff-strip',
  'overflow-wrap: anywhere',
  'max-width: 680px',
  'min-width: 0',
].forEach(fragment => assertIncludes(css, fragment, 'Primary Predicta handoff CSS'));

const chartTypes = read('packages/types/src/astrology.ts');
const mobileTypes = read('apps/mobile/src/types/astrology.ts');
for (const typeSource of [chartTypes, mobileTypes]) {
  [
    'carriedContextLabel?: string',
    'eventOracleHandoff?: boolean',
    'evidenceSourceLabel?: string',
    "handoffMode?: 'main_synthesis' | 'room_safe'",
  ].forEach(fragment => assertIncludes(typeSource, fragment, 'ChartContext parity'));
}

const vedic = read('apps/web/components/WebVedicIntelligencePanel.tsx');
[
  'const vedicAskHref = buildPredictaChatHref',
  'eventOracleHandoff: true',
  "evidenceSourceLabel: t('Vedic chart, dasha, yog, and Kundli Karma evidence')",
  "handoffMode: 'room_safe'",
  "school: 'PARASHARI'",
  'href={vedicAskHref}',
  "evidenceSourceLabel: translateUiText(\n      'Kundli Karma Dosh, Shrap, Yog, and Lal Kitab evidence'",
].forEach(fragment => assertIncludes(vedic, fragment, 'Vedic and Kundli Karma handoffs'));
assertNotIncludes(vedic, 'href="/dashboard/chat"', 'Vedic handoff must not be raw chat link');

const kp = read('apps/web/components/WebKpPredictaPanel.tsx');
[
  "evidenceSourceLabel: translateUiText(\n      'KP cusp, sub-lord, significator, and timing evidence'",
  "handoffMode: 'room_safe'",
  "school: 'KP'",
  'handoffQuestion',
  'selectedHouse: cusp?.house',
].forEach(fragment => assertIncludes(kp, fragment, 'KP handoff'));

const jaimini = read('apps/web/components/WebJaiminiPredictaPanel.tsx');
[
  "carriedContextLabel: t('Current destiny chapter')",
  "evidenceSourceLabel: t(\n      'Jaimini karaka, Arudha, Karakamsha, and destiny chapter evidence'",
  "handoffMode: 'room_safe'",
  "school: 'JAIMINI'",
].forEach(fragment => assertIncludes(jaimini, fragment, 'Jaimini handoff'));

const numerology = read('apps/web/components/WebNumerologyPredictaPanel.tsx');
[
  "carriedContextLabel: t('Current cycle')",
  "evidenceSourceLabel: t(\n      'Numerology name number, birth number, destiny number, and current cycle evidence'",
  "handoffMode: 'room_safe'",
  "school: 'NUMEROLOGY'",
].forEach(fragment => assertIncludes(numerology, fragment, 'Numerology handoff'));

const signature = read('apps/web/components/WebSignatureAnalysisInputFlow.tsx');
[
  "carriedContextLabel: translateUiText('Confirmed signature traits', language)",
  "evidenceSourceLabel: translateUiText(\n        'Confirmed signature traits and reflective expression evidence'",
  "handoffMode: 'room_safe'",
  "school: 'SIGNATURE'",
  'buildSignatureChatPromptContext',
].forEach(fragment => assertIncludes(signature, fragment, 'Signature handoff'));

const report = read('apps/web/components/WebDossierPreview.tsx');
[
  'function buildReportAskHref',
  'language: SupportedLanguage',
  "evidenceSourceLabel: translateUiText(\n      'Report section memory and generated report context'",
  "handoffMode: 'main_synthesis'",
  'reportSectionPrompt',
  'reportSectionTitle',
  'reportSchoolLane',
].forEach(fragment => assertIncludes(report, fragment, 'Report section handoff'));

const uiEntries = readJson('packages/config/src/translations/ui.json').entries;
for (const key of [
  'ui.eventOracle.evidenceCarried.label',
  'ui.eventOracle.evidenceCarried.generic',
  'ui.eventOracle.evidenceCarried.title',
  'ui.eventOracle.handoffMode.label',
  'ui.eventOracle.handoffMode.mainSynthesis',
  'ui.eventOracle.handoffMode.roomSafe',
  'ui.eventOracle.evidenceLabel.vedic',
  'ui.eventOracle.evidenceLabel.kp',
  'ui.eventOracle.evidenceLabel.jaimini',
  'ui.eventOracle.evidenceLabel.numerology',
  'ui.eventOracle.evidenceLabel.signature',
  'ui.eventOracle.evidenceLabel.kundliKarma',
  'ui.eventOracle.evidenceLabel.report',
  'ui.eventOracle.handoffLabel.currentDestinyChapter',
  'ui.eventOracle.handoffLabel.currentCycle',
  'ui.eventOracle.handoffLabel.confirmedSignatureTraits',
  'ui.eventOracle.handoffLabel.signatureInput',
  'ui.eventOracle.handoffLabel.vedicContext',
]) {
  assertGate(Boolean(uiEntries[key]), `missing UI translation key ${key}`);
  for (const lang of ['en', 'hi', 'gu']) {
    assertGate(Boolean(uiEntries[key]?.[lang]?.trim()), `${key} missing ${lang}`);
  }
}

const eventOracleCopy = readJson('packages/config/src/translations/eventOracle.json').copy;
for (const lang of ['en', 'hi', 'gu']) {
  for (const key of [
    'evidenceLabel',
    'mainSynthesisMode',
    'modeLabel',
    'roomSafeMode',
    'title',
  ]) {
    assertGate(
      Boolean(eventOracleCopy[lang]?.handoff?.[key]?.trim()),
      `eventOracle ${lang} missing handoff.${key}`,
    );
  }
}

const manifest = readJson(`${path.relative(root, auditDir)}/phase-6-manifest.json`);
assertGate(manifest.phase === phaseName, 'manifest phase mismatch');
assertGate(manifest.status === 'GREEN', 'manifest status must be GREEN');
for (const key of [
  'vedicHandoff',
  'kpHandoff',
  'jaiminiHandoff',
  'numerologyHandoff',
  'signatureHandoff',
  'kundliKarmaHandoff',
  'reportSectionHandoff',
  'roomSafeMode',
  'mainSynthesisMode',
  'preAuthContextVisibility',
  'visibleEvidenceSource',
  'localizedHandoffLabels',
]) {
  assertGate(manifest.greenCriteria?.[key] === true, `greenCriteria.${key} must be true`);
}

const browserSmoke = readJson(`${path.relative(root, auditDir)}/browser-smoke.json`);
assertGate(browserSmoke.phase === phaseName, 'browser smoke phase mismatch');
assertGate(
  browserSmoke.checks?.mainPredictaReportHandoff?.hasEvidenceLine === true,
  'browser smoke main handoff evidence line must be true',
);
assertGate(
  browserSmoke.checks?.mainPredictaReportHandoff?.hasModeLine === true,
  'browser smoke main handoff mode line must be true',
);
assertGate(
  browserSmoke.checks?.kpRoomSafeHandoff?.hasEvidenceLine === true,
  'browser smoke KP handoff evidence line must be true',
);
assertGate(
  browserSmoke.checks?.kpRoomSafeHandoff?.hasModeLine === true,
  'browser smoke KP handoff mode line must be true',
);
assertGate(
  browserSmoke.checks?.mainPredictaReportHandoff?.documentScrollWidth === browserSmoke.viewportWidth,
  'browser smoke main handoff must not overflow viewport',
);
assertGate(
  browserSmoke.checks?.kpRoomSafeHandoff?.documentScrollWidth === browserSmoke.viewportWidth,
  'browser smoke KP handoff must not overflow viewport',
);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `${phaseName} passed: specialist-room CTAs carry explicit evidence, room-safe/main-synthesis modes, localized context labels, and chat-visible handoff explanations.`,
);
