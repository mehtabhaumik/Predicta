import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

async function readWorkspaceFile(file) {
  return readFile(path.join(repoRoot, file), 'utf8');
}

const chartLayout = await readWorkspaceFile('packages/astrology/src/chartLayout.ts');
const webKundliChart = await readWorkspaceFile('apps/web/components/WebKundliChart.tsx');
const nativeCopyTranslations = JSON.parse(
  await readWorkspaceFile('packages/config/src/translations/nativeCopy.json'),
);
const uiTranslations = await readWorkspaceFile('packages/config/src/translations/ui.json');

const grahaContract = {
  Sun: { en: 'Sun', hi: 'सूर्य', gu: 'સૂર્ય' },
  Moon: { en: 'Moon', hi: 'चंद्र', gu: 'ચંદ્ર' },
  Mars: { en: 'Mars', hi: 'मंगल', gu: 'મંગળ' },
  Jupiter: { en: 'Jupiter', hi: 'बृहस्पति', gu: 'ગુરુ' },
  Venus: { en: 'Venus', hi: 'शुक्र', gu: 'શુક્ર' },
  Saturn: { en: 'Saturn', hi: 'शनि', gu: 'શનિ' },
  Mercury: { en: 'Mercury', hi: 'बुध', gu: 'બુધ' },
  Rahu: { en: 'Rahu', hi: 'राहु', gu: 'રાહુ' },
  Ketu: { en: 'Ketu', hi: 'केतु', gu: 'કેતુ' },
};

for (const [planet, names] of Object.entries(grahaContract)) {
  const sharedEntry = extractObjectEntry(chartLayout, planet);
  assert.match(
    sharedEntry,
    new RegExp(`en: \\{ abbreviation: '[^']+', name: '${escapeRegExp(names.en)}' \\}`),
    `${planet} has English shared chart name`,
  );
  assert.equal(
    resolveSharedPlanetName(sharedEntry, 'hi'),
    names.hi,
    `${planet} has Hindi shared chart name`,
  );
  assert.equal(
    resolveSharedPlanetName(sharedEntry, 'gu'),
    names.gu,
    `${planet} has Gujarati shared chart name`,
  );

  const webEntry = extractObjectEntry(webKundliChart, planet);
  assert.equal(resolveWebPlanetName(webEntry, 'hi'), names.hi, `${planet} has Hindi web prose name`);
  assert.equal(resolveWebPlanetName(webEntry, 'gu'), names.gu, `${planet} has Gujarati web prose name`);
}

const ui = JSON.parse(uiTranslations);
assert.equal(
  ui.entries?.['ui.jupiter.6tcdml']?.hi,
  grahaContract.Jupiter.hi,
  'UI translation uses Hindi बृहस्पति for Jupiter',
);
assert.equal(
  ui.entries?.['ui.jupiter.6tcdml']?.gu,
  grahaContract.Jupiter.gu,
  'UI translation uses Gujarati ગુરુ for Jupiter',
);

assert.doesNotMatch(
  chartLayout,
  /Jupiter:\s*\{[\s\S]*?hi:\s*\{ abbreviation: 'गु', name: 'गुरु' \}/,
  'Shared chart Jupiter Hindi must not fall back to Guru',
);
assert.doesNotMatch(
  webKundliChart,
  /Jupiter:\s*\{[^}]*hi:\s*'गुरु'/,
  'Web Jupiter Hindi must not fall back to Guru',
);

console.log('Graha name localization gate passed: English, Hindi, and Gujarati planet display names are locked.');

function extractObjectEntry(source, key) {
  const start = source.indexOf(`${key}: {`);
  assert.ok(start >= 0, `${key} entry exists`);

  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    }
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`Could not parse ${key} entry`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function resolveSharedPlanetName(entry, language) {
  const languageEntry = entry.match(
    new RegExp(`${language}: \\{ abbreviation: [^,]+, name: ([^}]+) \\}`),
  )?.[1];
  assert.ok(languageEntry, `${language} shared planet entry exists`);
  return resolveStringExpression(languageEntry.trim());
}

function resolveWebPlanetName(entry, language) {
  const languageEntry = entry.match(new RegExp(`${language}: ([^,}]+)`))?.[1];
  assert.ok(languageEntry, `${language} web planet entry exists`);
  return resolveStringExpression(languageEntry.trim());
}

function resolveStringExpression(expression) {
  const stringLiteral = expression.match(/^'([^']*)'$/)?.[1];
  if (stringLiteral !== undefined) {
    return stringLiteral;
  }

  const nativeCopyKey = expression.match(/^getNativeCopy\("([^"]+)"\)$/)?.[1];
  assert.ok(nativeCopyKey, `Unsupported localized string expression: ${expression}`);

  const entry = nativeCopyTranslations.entries?.[nativeCopyKey];
  assert.equal(entry?.kind, 'text', `${nativeCopyKey} resolves to a text native-copy entry`);
  return entry.value;
}
