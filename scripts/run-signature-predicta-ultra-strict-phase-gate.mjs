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
  mobile: await readWorkspaceFile('apps/mobile/src/screens/SignaturePredictaScreen.tsx'),
  model: await readWorkspaceFile('packages/astrology/src/signatureAnalysisModel.ts'),
  pdf: await readWorkspaceFile('packages/pdf/src/index.ts'),
  phase: await readWorkspaceFile('docs/PREDICTA_SIGNATURE_PREDICTA_ULTRA_STRICT_PHASE.md'),
  reportPage: await readWorkspaceFile('apps/web/components/WebDossierPreview.tsx'),
  types: await readWorkspaceFile('packages/types/src/astrology.ts'),
  web: await readWorkspaceFile('apps/web/components/WebSignatureAnalysisInputFlow.tsx'),
  css: await readWorkspaceFile('apps/web/app/globals.css'),
};

for (const phrase of [
  'SIGNATURE_PRIVACY_COPY',
  'SIGNATURE_SHORT_PRIVACY_COPY',
  'SIGNATURE_REPORT_PRIVACY_COPY',
  'SIGNATURE_CAN_AND_CANNOT_TELL_YOU',
  'SIGNATURE_SCAN_LABELS',
  'raw-image-not-stored',
  'confirmationState',
  "'clear' | 'partial' | 'uncertain'",
]) {
  assertIncludes(files.model + files.types, phrase, `shared Signature contract includes ${phrase}`);
}

for (const phrase of [
  'Predicta does not store your signature image. It stays only in this session so we can prepare your reading. If you close this tab or leave the session, you may need to re-upload or re-draw it.',
  'Not stored by Predicta. If you close this session, you may need to re-upload or re-draw.',
  'Your previous signature image was not stored. Please re-upload or re-draw it to continue.',
  'Re-upload signature',
  'Re-draw signature',
  'Signature scanned',
  'Scanning your signature expression...',
  'Signature traits ready. Please confirm what looks right.',
  'Looks right',
  'Adjust traits',
  'Baseline detected',
  'Slant measured',
  'Rhythm mapped',
  'Legibility checked',
  'Flourish noted',
  'clear',
  'partial',
  'uncertain',
]) {
  assertIncludes(files.web + files.mobile + files.model, phrase, `web/mobile Signature UX includes ${phrase}`);
}

for (const phrase of [
  'Signature ready · Not stored · Continue',
  'Upload signature',
  'Use this drawing',
  'Only confirmed traits will flow to chat or reports',
  'Raw signature images are not stored or passed to chat',
]) {
  assertIncludes(files.mobile, phrase, `mobile Signature parity includes ${phrase}`);
}

for (const phrase of [
  'signature-scan-beam',
  '@keyframes signature-scan-beam',
  'prefers-reduced-motion: reduce',
]) {
  assertIncludes(files.css, phrase, `web scanning/reduced-motion CSS includes ${phrase}`);
}

assert.ok(
  !/imageDataUrl\s*,/.test(files.web) &&
    !/imageDataUrl\s*:/.test(files.web) &&
    !/localStorage\.setItem\([^)]*imageDataUrl/s.test(files.web),
  'web draft does not persist raw signature image data',
);
assert.ok(
  !/signatureAudit/i.test(files.web),
  'web Signature flow does not auto-create scan or ready state from URL audit parameters',
);
assertIncludes(
  files.web,
  'detectSignatureTraitsFromPixels',
  'web Signature analysis uses real visible ink geometry detection',
);
assertIncludes(
  files.web,
  'observedTraits: canReviewTraits ? observedTraits : {}',
  'web Signature analysis is gated behind detected or corrected visible traits',
);
assertIncludes(
  files.web,
  'disabled={!canReviewTraits}',
  'web Signature trait controls are disabled until a real signature input exists',
);
assert.ok(
  !/buildTemporaryDetectedTraits/i.test(files.web),
  'web Signature flow does not use fixed upload or draw trait presets',
);
assert.ok(
  !/setDetectedTraits\(buildMobileDetectedTraits/i.test(files.mobile),
  'mobile Signature flow does not manufacture detected traits from placeholder buttons',
);
assertIncludes(
  files.mobile,
  'signature.mobile.captureUnavailable',
  'mobile Signature flow is honest when real capture is not available',
);
assertIncludes(
  files.mobile,
  'disabled={!hasSignature}',
  'mobile Signature confirmation is disabled until a real signature input exists',
);
assert.ok(
  !/AsyncStorage|Keychain|MMKV|SecureStore|localStorage|sessionStorage|IndexedDB/i.test(files.mobile),
  'mobile Signature screen does not use persistent storage for raw signatures',
);

for (const phrase of [
  'Predicta did not store your signature image. This section uses only confirmed visible traits from your current session.',
  'What this can and cannot tell you',
  'it cannot verify identity',
  'Signature Predicta premium synthesis',
]) {
  assertIncludes(files.pdf + files.model, phrase, `Signature PDF/report includes ${phrase}`);
}

for (const phrase of [
  'Signature Reports',
  'Needs a signature sample or confirmed manual-observation state',
]) {
  assertIncludes(files.reportPage, phrase, `report marketplace Signature lane includes ${phrase}`);
}

for (const banned of [
  '\\bproves\\b',
  '\\bguarantees\\b',
  '\\byou are definitely\\b',
  '\\byour destiny is\\b',
  '\\byour marriage will\\b',
  '\\byou are honest\\b',
  '\\byou are dishonest\\b',
  '\\byou will be rich\\b',
  '\\byou will fail\\b',
  '\\bthis diagnoses\\b',
  '\\bthis verifies identity\\b',
]) {
  const bannedPattern = new RegExp(banned, 'i');
  assert.ok(
    !bannedPattern.test(files.web) &&
      !bannedPattern.test(files.mobile) &&
      !bannedPattern.test(files.model),
    `Signature implementation avoids banned certainty phrase: ${banned}`,
  );
}

assertIncludes(
  files.phase,
  'Do not store raw signature images in `localStorage`.',
  'phase retains raw localStorage ban',
);

console.log('Signature Predicta ultra strict phase gate passed: privacy, ephemeral input, scan UX, confirmation gating, PDF copy, mobile parity, and safety language are locked.');

function assertIncludes(source, phrase, label) {
  assert.ok(source.toLowerCase().includes(phrase.toLowerCase()), label);
}
