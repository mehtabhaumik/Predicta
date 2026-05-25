import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOTS = ['apps', 'packages'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
const INDIC_SCRIPT = /[\u0900-\u097F\u0A80-\u0AFF]/;
const LATIN_TERM = /[A-Za-z][A-Za-z0-9+.-]*/g;
const TRANSLATION_JSON_IMPORT = /from\s+['"][^'"]*translations\/[^'"]+\.json['"]/;
const allowedNativeCopyLatinTerms = new Set([
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
  'JPG',
  'JPEG',
  'KP',
  'PDF',
  'PNG',
  'URL',
  'WebP',
]);

const allowedTranslationAdapters = new Set([
  'packages/config/src/accuracyMethod.ts',
  'packages/config/src/language.ts',
  'packages/config/src/nativeCopy.ts',
  'packages/config/src/testimonialTrust.ts',
  'packages/config/src/uiTranslations.ts',
  'packages/config/src/webGrowthAdvantage.ts',
  'packages/pdf/src/index.ts',
]);

const nativeCopyPath = 'packages/config/src/translations/nativeCopy.json';
const failures = [];

for (const file of listSourceFiles(ROOTS)) {
  const source = readFileSync(file, 'utf8');

  if (INDIC_SCRIPT.test(source)) {
    const lineNumbers = source
      .split(/\r?\n/)
      .map((line, index) => (INDIC_SCRIPT.test(line) ? index + 1 : undefined))
      .filter(Boolean);
    failures.push(
      `${file}: contains hardcoded Hindi/Gujarati script at lines ${lineNumbers.join(', ')}. Move user-facing native copy into dedicated translation JSON.`,
    );
  }

  if (
    TRANSLATION_JSON_IMPORT.test(source) &&
    !allowedTranslationAdapters.has(file)
  ) {
    failures.push(
      `${file}: imports translation JSON directly. Components and business logic must use localization helpers/adapters instead.`,
    );
  }
}

if (!existsSync(nativeCopyPath)) {
  failures.push(`${nativeCopyPath}: missing JSON-backed native copy registry`);
} else {
  validateNativeCopyRegistry(nativeCopyPath);
}

if (failures.length) {
  console.error('Localization architecture gate failed:');
  failures.slice(0, 120).forEach(failure => console.error(`- ${failure}`));
  if (failures.length > 120) {
    console.error(`...and ${failures.length - 120} more failures.`);
  }
  process.exit(1);
}

console.log(
  'Localization architecture gate passed: production source has no hardcoded Hindi/Gujarati script, native copy is JSON-backed, and translation JSON imports stay behind dedicated adapters.',
);

function listSourceFiles(roots) {
  const files = [];

  for (const root of roots) {
    walk(root, files);
  }

  return files.sort();
}

function walk(directory, files) {
  if (shouldSkipPath(directory)) {
    return;
  }

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);

    if (shouldSkipPath(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    const extension = fullPath.endsWith('.tsx')
      ? '.tsx'
      : fullPath.endsWith('.ts')
        ? '.ts'
        : '';

    if (SOURCE_EXTENSIONS.has(extension) && !fullPath.endsWith('.d.ts')) {
      files.push(relative(process.cwd(), fullPath).split(sep).join('/'));
    }
  }
}

function shouldSkipPath(path) {
  return [
    `${sep}.next`,
    `${sep}.turbo`,
    `${sep}build`,
    `${sep}dist`,
    `${sep}node_modules`,
  ].some(segment => path.includes(segment));
}

function validateNativeCopyRegistry(path) {
  let parsed;

  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    failures.push(`${path}: invalid JSON (${error.message})`);
    return;
  }

  if (!parsed || typeof parsed !== 'object' || !parsed.entries) {
    failures.push(`${path}: must expose an entries object`);
    return;
  }

  for (const [key, entry] of Object.entries(parsed.entries)) {
    if (!entry || typeof entry !== 'object') {
      failures.push(`${path}:${key}: entry must be an object`);
      continue;
    }

    if (entry.kind === 'text') {
      if (typeof entry.value !== 'string' || !entry.value.trim()) {
        failures.push(`${path}:${key}: text entry must have a non-empty value`);
      }
      assertNoMixedNativeCopyLatinTerms(path, key, entry.value);
      continue;
    }

    if (entry.kind === 'template') {
      if (
        !Array.isArray(entry.parts) ||
        entry.parts.length === 0 ||
        entry.parts.some(part => typeof part !== 'string')
      ) {
        failures.push(`${path}:${key}: template entry must have string parts`);
      }
      entry.parts.forEach(part => assertNoMixedNativeCopyLatinTerms(path, key, part));
      continue;
    }

    failures.push(`${path}:${key}: unsupported entry kind ${String(entry.kind)}`);
  }
}

function assertNoMixedNativeCopyLatinTerms(path, key, value) {
  if (!INDIC_SCRIPT.test(value) || !/[A-Za-z]/.test(value)) {
    return;
  }

  const unexpectedTerms = (value.match(LATIN_TERM) ?? []).filter(
    term => !allowedNativeCopyLatinTerms.has(term) && !/^D\d+$/.test(term),
  );

  if (!unexpectedTerms.length) {
    return;
  }

  failures.push(
    `${path}:${key}: native copy mixes untranslated Latin terms (${[...new Set(unexpectedTerms)].join(', ')})`,
  );
}
