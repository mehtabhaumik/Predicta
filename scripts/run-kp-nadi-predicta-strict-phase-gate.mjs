import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const files = {
  aiContext: await readWorkspaceFile('packages/ai/src/contextBuilder.ts'),
  astrologyTypes: await readWorkspaceFile('packages/types/src/astrology.ts'),
  kpFoundation: await readWorkspaceFile('packages/astrology/src/chalitBhavKpFoundation.ts'),
  mobileContext: await readWorkspaceFile('apps/mobile/src/services/ai/contextBuilder.ts'),
  mobileKp: await readWorkspaceFile('apps/mobile/src/components/KpPredictaPanel.tsx'),
  mobileNadi: await readWorkspaceFile('apps/mobile/src/screens/NadiPredictaScreen.tsx'),
  mobileTypes: await readWorkspaceFile('apps/mobile/src/types/astrology.ts'),
  nadiPlan: await readWorkspaceFile('packages/astrology/src/nadiJyotishPlan.ts'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  phase: await readWorkspaceFile('docs/PREDICTA_KP_NADI_PREDICTA_STRICT_PHASE.md'),
  reportPage: await readWorkspaceFile('apps/web/components/WebDossierPreview.tsx'),
  webKp: await readWorkspaceFile('apps/web/components/WebKpPredictaPanel.tsx'),
  webNadi: await readWorkspaceFile('apps/web/components/WebNadiPredictaPanel.tsx'),
};

for (const phrase of [
  'KpPredictaDigest',
  'selectedEventCategory',
  'exactUserEventQuestion',
  'questionClarityState',
  'currentVerdict',
  'promiseBlockTimingConfidenceSummary',
  'proofAvailability',
  'NadiPredictaDigest',
  'activeStoryFocus',
  'rahuKetuAxisSummary',
  'validationStatus',
  'storyEvidenceAvailability',
]) {
  assertIncludes(files.astrologyTypes + files.mobileTypes, phrase, `shared/mobile types expose ${phrase}`);
}

for (const verdict of [
  'Likely',
  'Delayed',
  'Needs more clarity',
  'Not enough proof',
  'Mixed promise',
]) {
  assertIncludes(files.astrologyTypes + files.mobileTypes + files.kpFoundation, verdict, `KP verdict label ${verdict}`);
}

assert.ok(
  !files.astrologyTypes.includes('Not enough proof yet') && !files.kpFoundation.includes('Not enough proof yet'),
  'KP uses approved Not enough proof label, not the old label',
);

for (const phrase of [
  'career',
  'money',
  'marriage',
  'property',
  'education',
  'travel',
  'custom',
  'EVENT VERDICT COMPASS',
  'Question-To-Proof Path',
  'Ask Exact Question Wizard',
  'Proof drawer',
  'WHAT ARE YOU ASKING?',
]) {
  assertIncludes(files.webKp + files.mobileKp, phrase, `KP web/mobile first-view UX includes ${phrase}`);
}

for (const phrase of [
  'buildKpDigest',
  'eventVerdictCompass',
  'questionToProofPath',
  'timingReadinessState',
  'KP report leads with event answer',
]) {
  assertIncludes(files.kpFoundation, phrase, `KP shared contract includes ${phrase}`);
}

for (const phrase of [
  'KARMIC STORY MAP',
  'RAHU-KETU AXIS CARD',
  'HIDDEN PATTERN SENTENCE',
  'Validation Bridge',
  'ACTIVATION WINDOWS',
  'Past Pattern',
  'Current Lesson',
  'Next Practice',
  'Story evidence',
]) {
  assertIncludes(files.webNadi + files.mobileNadi, phrase, `Nadi web/mobile first-view UX includes ${phrase}`);
}

for (const phrase of [
  'buildRahuKetuAxis',
  'buildNadiDigest',
  'rahuKetuAxis',
  'validationStatus',
  'partially-confirmed',
  'needs-validation',
  'does not claim access to original palm-leaf manuscripts',
]) {
  assertIncludes(files.nadiPlan, phrase, `Nadi shared contract includes ${phrase}`);
}

for (const phrase of [
  'digest: plan.digest',
  'rahuKetuAxis: plan.rahuKetuAxis',
  'validationStatus: plan.validationStatus',
]) {
  assertIncludes(files.aiContext + files.mobileContext, phrase, `Predicta context digest includes ${phrase}`);
}

for (const phrase of [
  'KP event answer and Proof Appendix',
  'Proof Appendix: technical cusp chains',
  'Nadi karmic story and Story Evidence Appendix',
  'Story Evidence Appendix: planetary story map',
  'Rahu-Ketu Axis Card',
  'Past Pattern -> Current Lesson -> Next Practice',
]) {
  assertIncludes(files.pdf, phrase, `PDF/report composition includes ${phrase}`);
}

for (const phrase of [
  'Vedic Reports',
  'KP Reports',
  'Nadi Reports',
  'Numerology Reports',
  'Signature Reports',
]) {
  assertIncludes(files.reportPage, phrase, `report marketplace keeps lane ${phrase}`);
}

assert.ok(
  !files.nadiPlan.includes('sub lord judgement') || files.nadiPlan.includes('not KP sub-lord judgement'),
  'Nadi only mentions KP sub-lord logic as a boundary',
);
assert.ok(
  !files.kpFoundation.includes('Numerology') && !files.kpFoundation.includes('Signature'),
  'KP foundation does not mix Numerology or Signature',
);
assert.ok(
  !files.nadiPlan.includes('Numerology') && !files.nadiPlan.includes('Signature'),
  'Nadi plan does not mix Numerology or Signature',
);
assert.ok(
  files.phase.includes('Do not mark this phase green from code review alone.'),
  'phase file retains strict green-light rule',
);

console.log('KP/Nadi Predicta strict phase gate passed: contracts, UX hierarchy, reports, context, and boundaries are locked.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}
