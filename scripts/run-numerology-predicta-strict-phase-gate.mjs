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
  astrologyModel: await readWorkspaceFile('packages/astrology/src/numerologyFoundationModel.ts'),
  astrologyTypes: await readWorkspaceFile('packages/types/src/astrology.ts'),
  mobile: await readWorkspaceFile('apps/mobile/src/screens/NumerologyPredictaScreen.tsx'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  phase: await readWorkspaceFile('docs/PREDICTA_NUMEROLOGY_PREDICTA_STRICT_PHASE.md'),
  reportPage: await readWorkspaceFile('apps/web/components/WebDossierPreview.tsx'),
  web: await readWorkspaceFile('apps/web/components/WebNumerologyPredictaPanel.tsx'),
};

for (const phrase of [
  'NumerologyIdentityDashboard',
  'NumerologyMandalaNode',
  'NumerologyFrequencyCell',
  'NumerologyNameFitScore',
  'NumerologyCompatibilityLens',
  'NumerologySupportiveToolkit',
  'identityDashboard',
]) {
  assertIncludes(files.astrologyTypes, phrase, `shared types expose ${phrase}`);
}

for (const phrase of [
  'buildNumerologyIdentityDashboard',
  'buildNumerologyFrequencyMap',
  'buildPersonalYearTimeline',
  'buildLifeThemeSentence',
  'buildNameFitScore',
  'compatibilityLens',
  'nameRefinement',
  'supportiveToolkit',
]) {
  assertIncludes(files.astrologyModel, phrase, `shared model builds ${phrase}`);
}

for (const phrase of [
  'Your Number Signature',
  'PERSONAL NUMBER MANDALA',
  'Name Energy Scanner',
  'Name Rhythm',
  'Birth Code',
  'Current Cycle',
  'Personal Year Timeline',
  'Strengths & Cautions',
  'Missing / Repeated Number Pattern',
  'Name Refinement',
  'Compatibility',
  'Ask Numerology Predicta',
  'Life Theme Sentence',
  'Name Fit Score',
  'Best Use Of This Cycle',
  'Numerology Compatibility Lens',
  'Lucky/Supportive Toolkit',
]) {
  assertIncludes(files.web + files.mobile, phrase, `web/mobile Numerology UX includes ${phrase}`);
}

for (const phrase of [
  'identityDashboard: profile.identityDashboard',
  'lifeThemeSentence',
  'nameScanner',
  'personalYearTimeline',
  'compatibilityLens',
]) {
  assertIncludes(files.aiContext + files.astrologyTypes, phrase, `Predicta context exposes ${phrase}`);
}

for (const phrase of [
  'Your Number Signature',
  'Life Theme Sentence',
  'Best Use Of This Cycle',
  'Name Energy Scanner',
  'Name Fit Score',
  'Personal Year Timeline',
  'Compatibility',
  'How Predicta calculated your numbers',
  'Missing / Repeated Number Pattern',
]) {
  assertIncludes(files.pdf, phrase, `PDF Numerology dossier includes ${phrase}`);
}

for (const phrase of [
  'Vedic Reports',
  'KP Reports',
  'Jaimini Reports',
  'Numerology Reports',
  'Signature Reports',
]) {
  assertIncludes(files.reportPage, phrase, `report marketplace keeps school lane ${phrase}`);
}

for (const banned of [
  'guarantees success',
  'life will fail',
  'fixed destiny',
  'bad name',
  'cursed',
  'doomed',
]) {
  assert.ok(
    !files.web.includes(banned) &&
      !files.mobile.includes(banned) &&
      !files.pdf.includes(banned) &&
      !files.astrologyModel.includes(banned),
    `Numerology implementation avoids banned fear phrase: ${banned}`,
  );
}

assertIncludes(
  files.phase,
  'Do not say a number guarantees success',
  'phase file retains anti-guarantee rule',
);
assertIncludes(
  files.web + files.mobile,
  'Reduced-motion friendly',
  'scanner has a readable reduced-motion fallback',
);
assertIncludes(
  files.astrologyModel,
  "status: 'pending'",
  'missing comparison inputs return pending states',
);

console.log('Numerology Predicta strict phase gate passed: contract, web/mobile dashboard, PDF dossier, context, lane separation, and safety language are locked.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.toLowerCase().includes(phrase.toLowerCase()), label);
}
