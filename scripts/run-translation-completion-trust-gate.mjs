import { readFileSync } from 'node:fs';

const DEVANAGARI = /[\u0900-\u097F]/;
const GUJARATI = /[\u0A80-\u0AFF]/;
const LATIN = /[A-Za-z]/;

const translationFiles = [
  'packages/config/src/translations/ui.json',
  'packages/config/src/translations/language.json',
  'packages/config/src/translations/accuracyMethod.json',
  'packages/config/src/translations/webGrowthAdvantage.json',
  'packages/config/src/translations/testimonialTrust.json',
  'packages/pdf/src/translations/reportLabels.json',
];

const sourceFiles = [
  'apps/web/components/WebSignatureAnalysisInputFlow.tsx',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/components/AuthDialog.tsx',
  'apps/web/app/page.tsx',
  'apps/web/app/pricing/page.tsx',
];

const allowedLatinTerms = new Set([
  'AI',
  'API',
  'D1',
  'D2',
  'D3',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
  'D20',
  'D30',
  'D60',
  'Google',
  'JPG',
  'JPEG',
  'KP',
  'PNG',
  'PDF',
  'URL',
  'WebP',
]);

const bannedLocalizedFragments = [
  /\bRoman Hinglish\b/i,
  /\bRoman Gujlish\b/i,
  /\bHinglish\b/i,
  /\bGujlish\b/i,
  /\bDo not use Devanagari\b/i,
  /\bDo not use Gujarati script\b/i,
  /\bGuest pass\b/i,
  /\bGuest Pass\b/i,
  /\bredeem\b/i,
  /\bpreview\b/i,
  /\bbrowser\b/i,
  /\bBrowser\b/i,
  /\blegal\b/i,
  /\bbanking\b/i,
  /\bgovernment\b/i,
  /\bsignature\b/i,
  /\breflection\b/i,
  /\bsynthesis\b/i,
  /\btraits?\b/i,
  /\bconfirm\b/i,
  /\bupload\b/i,
  /\bdraw\b/i,
  /\bimage\b/i,
  /\breading\b/i,
  /\bself-expression\b/i,
  /\bidentity\b/i,
  /\bmedical\b/i,
  /\bproof\b/i,
  /\bguaranteed\b/i,
  /\bPremium\b/i,
  /\bFree\b/i,
  /\bReport\b/i,
  /\bKundli\b/i,
  /\bPredicta\b/i,
];

const failures = [];

for (const file of translationFiles) {
  const parsed = JSON.parse(readFileSync(file, 'utf8'));
  walkJson(parsed, [], (value, path) => {
    const language = languageFromPath(path);
    const location = `${file}:${path.join('.') || '<root>'}`;

    if (!value.trim()) {
      failures.push(`${location}: empty localized string`);
      return;
    }

    if (path.at(-1) === 'en') {
      if (DEVANAGARI.test(value) || GUJARATI.test(value)) {
        failures.push(`${location}: English value contains Indic script`);
      }
      return;
    }

    if (language === 'hi') {
      assertNativeLocalizedString({ location, pattern: DEVANAGARI, value });
    }

    if (language === 'gu') {
      assertNativeLocalizedString({ location, pattern: GUJARATI, value });
    }
  });

  checkTriplets(parsed, file);
}

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8');
  source.split(/\r?\n/).forEach((line, index) => {
    const valuePart = line.replace(/^\s*['"]?[\w-]+['"]?\s*:\s*/, '');
    if (!DEVANAGARI.test(valuePart) && !GUJARATI.test(valuePart)) {
      return;
    }

    for (const pattern of bannedLocalizedFragments) {
      if (pattern.test(valuePart)) {
        failures.push(
          `${file}:${index + 1}: localized UI string still contains mixed English fragment ${pattern}`,
        );
      }
    }
  });
}

const languageConfig = JSON.parse(
  readFileSync('packages/config/src/translations/language.json', 'utf8'),
);
const hindiInstruction = languageConfig.languageOptions.find(
  option => option.code === 'hi',
)?.aiInstruction;
const gujaratiInstruction = languageConfig.languageOptions.find(
  option => option.code === 'gu',
)?.aiInstruction;

if (!DEVANAGARI.test(hindiInstruction ?? '')) {
  failures.push('language.json: Hindi AI instruction must use Devanagari');
}
if (!GUJARATI.test(gujaratiInstruction ?? '')) {
  failures.push('language.json: Gujarati AI instruction must use Gujarati script');
}

if (failures.length) {
  console.error('Translation completion trust gate failed:');
  failures.slice(0, 80).forEach(failure => console.error(`- ${failure}`));
  if (failures.length > 80) {
    console.error(`...and ${failures.length - 80} more failures.`);
  }
  process.exit(1);
}

console.log(
  'Translation completion trust gate passed: prominent Hindi/Gujarati UI copy uses native script, has no empty values, and avoids known mixed-language trust leaks.',
);

function walkJson(value, path, visitString) {
  if (typeof value === 'string') {
    visitString(value, path);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => walkJson(item, path.concat(String(index)), visitString));
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) =>
      walkJson(child, path.concat(key), visitString),
    );
  }
}

function checkTriplets(value, file, path = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => checkTriplets(item, file, path.concat(String(index))));
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  if (
    typeof value.en === 'string' &&
    typeof value.hi === 'string' &&
    typeof value.gu === 'string'
  ) {
    const location = `${file}:${path.join('.') || '<root>'}`;
    if (value.hi === value.en && !isAllowedExactLocalizedValue(value.hi)) {
      failures.push(`${location}: Hindi duplicates English`);
    }
    if (value.gu === value.en && !isAllowedExactLocalizedValue(value.gu)) {
      failures.push(`${location}: Gujarati duplicates English`);
    }
  }

  Object.entries(value).forEach(([key, child]) =>
    checkTriplets(child, file, path.concat(key)),
  );
}

function languageFromPath(path) {
  for (let index = path.length - 1; index >= 0; index -= 1) {
    if (path[index] === 'hi' || path[index] === 'gu') {
      return path[index];
    }
  }
  return undefined;
}

function assertNativeLocalizedString({ location, pattern, value }) {
  if (isAllowedExactLocalizedValue(value)) {
    return;
  }

  if (!LATIN.test(value)) {
    return;
  }

  const latinTerms = value.match(/[A-Za-z][A-Za-z0-9+.-]*/g) ?? [];
  const unexpectedTerms = latinTerms.filter(
    term => !allowedLatinTerms.has(term) && !/^D\d+$/.test(term),
  );

  if (unexpectedTerms.length > 0 || !pattern.test(value)) {
    failures.push(
      `${location}: localized value has untranslated Latin terms: ${unexpectedTerms.join(', ') || value}`,
    );
  }
}

function isAllowedExactLocalizedValue(value) {
  return allowedLatinTerms.has(value) || /^D\d+$/.test(value);
}
