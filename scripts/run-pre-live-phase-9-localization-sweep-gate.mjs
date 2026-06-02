import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const nativeCopyPath = 'packages/config/src/translations/nativeCopy.json';
const reportLabelsPath = 'packages/pdf/src/translations/reportLabels.json';

const auditedSourceFiles = [
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/pricing/page.tsx',
  'apps/web/app/dashboard/report/page.tsx',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/components/WebProfileSettings.tsx',
  'apps/web/components/WebSignatureAnalysisInputFlow.tsx',
  'apps/mobile/src/screens/ReportScreen.tsx',
  'apps/mobile/src/screens/SettingsScreen.tsx',
  'apps/mobile/src/screens/SignaturePredictaScreen.tsx',
  'packages/pdf/src/reportDocument.tsx',
];

const requiredNativeKeys = [
  'native.apps.web.app.checkout.page.tsx.41f657f05a',
  'native.apps.web.app.checkout.page.tsx.bde26162c6',
  'native.apps.web.app.checkout.page.tsx.e95c68286c',
  'native.apps.web.app.checkout.page.tsx.2c8ddf450a',
  'signature.mobile.captureUnavailable.hi',
  'signature.mobile.captureUnavailable.gu',
];

const forbiddenNativeLatinFragments = [
  /\bcheckout\b/i,
  /\bpayment\b/i,
  /\bsupport\b/i,
  /\bhandoff\b/i,
  /\bpaid\b/i,
  /\baccess\b/i,
  /\bactive\b/i,
  /\bupload\b/i,
  /\bdraw\b/i,
  /\bcapture\b/i,
  /\binput\b/i,
  /\bscan\b/i,
  /\btraits?\b/i,
  /\bprediction\b/i,
  /\bSignature room\b/i,
  /\bweb Signature\b/i,
];

const failures = [];
const nativeCopy = readJson(nativeCopyPath);
const nativeEntries = nativeCopy.entries ?? {};

try {
  execFileSync('node', ['scripts/run-global-translation-source-coverage-gate.mjs'], {
    stdio: 'pipe',
  });
} catch (error) {
  const output = [error.stdout, error.stderr]
    .filter(Boolean)
    .map(buffer => buffer.toString())
    .join('\n')
    .trim();
  failures.push(
    `global translation source coverage gate failed before Phase 9 could pass:\n${output}`,
  );
}

for (const file of auditedSourceFiles) {
  assertFileExists(file);
  if (!existsSync(file)) {
    continue;
  }

  const source = readFileSync(file, 'utf8');
  assertNoHardcodedIndicScript(file, source);
  assertNoDirectTranslationJsonImport(file, source);
  assertNativeCopyKeysExist(file, source);
}

for (const key of requiredNativeKeys) {
  const entry = nativeEntries[key];
  if (!entry) {
    failures.push(`${nativeCopyPath}:${key}: required native copy key is missing`);
    continue;
  }

  const value = entry.kind === 'text' ? entry.value : (entry.parts ?? []).join('');
  if (!value || !value.trim()) {
    failures.push(`${nativeCopyPath}:${key}: required native copy value is empty`);
  }
}

assertLocalizedNativeEntry('native.apps.web.app.checkout.page.tsx.41f657f05a', 'hi');
assertLocalizedNativeEntry('native.apps.web.app.checkout.page.tsx.bde26162c6', 'gu');
assertLocalizedNativeEntry('signature.mobile.captureUnavailable.hi', 'hi');
assertLocalizedNativeEntry('signature.mobile.captureUnavailable.gu', 'gu');
assertFileContains(
  'apps/web/app/checkout/page.tsx',
  'supportSubject: getNativeCopy',
  'checkout support subject must come from native JSON for Hindi/Gujarati',
);
assertFileContains(
  'apps/web/app/checkout/page.tsx',
  'gatewayDisabledBody: getNativeCopy',
  'checkout disabled gateway copy must come from native JSON for Hindi/Gujarati',
);
assertFileContains(
  'apps/web/app/pricing/page.tsx',
  'getNativeCopy',
  'pricing page must use native JSON-backed copy',
);
assertFileContains(
  'apps/web/components/WebDossierPreview.tsx',
  'getNativeCopy',
  'report download surface must use native JSON-backed copy',
);
assertFileContains(
  'packages/pdf/src/reportDocument.tsx',
  'getNativeCopy',
  'PDF-visible labels must use native JSON-backed copy',
);
assertFileContains(
  'packages/pdf/src/index.ts',
  "translations/reportLabels.json",
  'PDF report labels must be sourced from reportLabels JSON',
);

const reportLabels = readJson(reportLabelsPath);
for (const [label, translations] of Object.entries(reportLabels.labels ?? {})) {
  if (!translations || typeof translations !== 'object') {
    failures.push(`${reportLabelsPath}:${label}: label translation must be an object`);
    continue;
  }

  for (const language of ['en', 'hi', 'gu']) {
    if (typeof translations[language] !== 'string' || !translations[language].trim()) {
      failures.push(`${reportLabelsPath}:${label}.${language}: missing PDF label translation`);
    }
  }
}

if (failures.length) {
  console.error('Pre-live Phase 9 localization sweep gate failed:');
  failures.slice(0, 120).forEach(failure => console.error(`- ${failure}`));
  if (failures.length > 120) {
    console.error(`...and ${failures.length - 120} more failures.`);
  }
  process.exit(1);
}

console.log(
  'Pre-live Phase 9 localization sweep gate passed: audited user-facing surfaces use translation JSON/adapters, native copy has no mixed-language leaks, checkout/pricing/report/PDF labels are JSON-backed, and source has no hardcoded Indic UI strings.',
);

function readJson(file) {
  assertFileExists(file);
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    failures.push(`${file}: invalid JSON (${error.message})`);
    return {};
  }
}

function assertFileExists(file) {
  if (!existsSync(file)) {
    failures.push(`${file}: file is missing`);
  }
}

function assertNoHardcodedIndicScript(file, source) {
  const indicLines = source
    .split(/\r?\n/)
    .map((line, index) =>
      /[\u0900-\u097F\u0A80-\u0AFF]/.test(line) ? index + 1 : undefined,
    )
    .filter(Boolean);

  if (indicLines.length) {
    failures.push(
      `${file}: hardcoded Hindi/Gujarati script remains on lines ${indicLines.join(', ')}`,
    );
  }
}

function assertNoDirectTranslationJsonImport(file, source) {
  if (
    /from\s+['"][^'"]*translations\/[^'"]+\.json['"]/.test(source) &&
    !file.startsWith('packages/pdf/src/')
  ) {
    failures.push(
      `${file}: imports translation JSON directly instead of using a localization adapter`,
    );
  }
}

function assertNativeCopyKeysExist(file, source) {
  const keyPattern = /\b(?:getNativeCopy|formatNativeCopy)\(\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = keyPattern.exec(source)) !== null) {
    const key = match[1];
    const entry = nativeEntries[key];
    if (!entry) {
      failures.push(`${file}: native copy key ${key} is missing from ${nativeCopyPath}`);
      continue;
    }

    if (match[0].startsWith('formatNativeCopy') && entry.kind !== 'template') {
      failures.push(`${file}: native copy key ${key} must be a template entry`);
    }
    if (match[0].startsWith('getNativeCopy') && entry.kind !== 'text') {
      failures.push(`${file}: native copy key ${key} must be a text entry`);
    }
  }
}

function assertLocalizedNativeEntry(key, language) {
  const entry = nativeEntries[key];
  if (!entry) {
    return;
  }

  const value = entry.kind === 'text' ? entry.value : (entry.parts ?? []).join('');
  const expectedScript = language === 'hi' ? /[\u0900-\u097F]/ : /[\u0A80-\u0AFF]/;

  if (!expectedScript.test(value)) {
    failures.push(`${nativeCopyPath}:${key}: expected ${language} native script`);
  }

  for (const pattern of forbiddenNativeLatinFragments) {
    if (pattern.test(value)) {
      failures.push(`${nativeCopyPath}:${key}: contains untranslated fragment ${pattern}`);
    }
  }
}

function assertFileContains(file, fragment, message) {
  assertFileExists(file);
  if (!existsSync(file)) {
    return;
  }

  const source = readFileSync(file, 'utf8');
  if (!source.includes(fragment)) {
    failures.push(`${file}: ${message}`);
  }
}
