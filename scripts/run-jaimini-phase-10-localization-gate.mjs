import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_JAIMINI_PHASE_10_LOCALIZATION_AND_TRANSLATION_REBUILD';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const staleValuePattern = /Nadi|NADI|nadi|नाड़ी|નાડી/;
const staleActivePattern =
  /Ask Nadi|Build Nadi|Nadi Predicta|NADI METHOD|Nadi report|Nadi reading|Nadi world|Nadi story|Nadi pattern|नाड़ी|નાડી|palm-leaf/i;

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

function assertNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), label);
}

function collectMatchingJsonValues(value, file, pointer = []) {
  const matches = [];
  if (typeof value === 'string') {
    if (staleValuePattern.test(value)) {
      matches.push(`${file}:${pointer.join('.') || '<root>'} => ${value}`);
    }
    return matches;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      matches.push(...collectMatchingJsonValues(item, file, [...pointer, index]));
    });
    return matches;
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      matches.push(...collectMatchingJsonValues(child, file, [...pointer, key]));
    }
  }

  return matches;
}

function collectPatternHits(file, pattern) {
  const source = read(file);
  return source
    .split('\n')
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .filter(({ line }) => pattern.test(line))
    .map(({ line, lineNumber }) => `${file}:${lineNumber}: ${line.trim()}`);
}

const roadmap = read('docs/PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md');
for (const fragment of [
  phaseName,
  'Add Jaimini translation coverage',
  'remove stale Nadi copy from English, Hindi',
  'Gujarati, and native-copy stores.',
  'no hardcoded Jaimini/Nadi strings in components',
  'site-wide grep confirms no stale user-facing Nadi strings',
]) {
  assertIncludes(roadmap, fragment, `roadmap locks Phase 10 requirement ${fragment}`);
}

const jaiminiJsonPath = 'packages/config/src/translations/jaimini.json';
assert.ok(existsSync(path.join(repoRoot, jaiminiJsonPath)), 'dedicated Jaimini translation JSON exists');
const jaiminiJson = readJson(jaiminiJsonPath);
const canonicalTerms = [
  'Jaimini',
  'Atmakaraka',
  'Amatyakaraka',
  'Darakaraka',
  'Karakamsha',
  'Swamsa',
  'Arudha Lagna',
  'Upapada Lagna',
  'Chara Dasha',
];

for (const term of canonicalTerms) {
  assert.ok(jaiminiJson.canonicalTerms.includes(term), `canonical term is present: ${term}`);
}

const languages = ['en', 'hi', 'gu'];
const baseKeys = Object.keys(jaiminiJson.copy.en).sort();
for (const language of languages) {
  assert.deepEqual(
    Object.keys(jaiminiJson.copy[language]).sort(),
    baseKeys,
    `${language} Jaimini copy has the same keys as English`,
  );
  for (const value of Object.values(jaiminiJson.copy[language])) {
    assert.equal(typeof value, 'string', `${language} Jaimini copy values are strings`);
    assert.ok(value.trim().length > 1, `${language} Jaimini copy values are populated`);
  }
}

const localizationSource = read('packages/config/src/jaiminiLocalization.ts');
for (const fragment of [
  'JaiminiLocalizationCopy',
  'JAIMINI_CANONICAL_TERMS',
  'getJaiminiLocalizationCopy',
  'jaiminiTranslations.copy',
]) {
  assertIncludes(localizationSource, fragment, `localization helper exports ${fragment}`);
}

assertIncludes(
  read('packages/config/src/index.ts'),
  "export * from './jaiminiLocalization'",
  'config package exports Jaimini localization helper',
);

const translationFiles = [
  'packages/config/src/translations/accuracyMethod.json',
  'packages/config/src/translations/language.json',
  'packages/config/src/translations/nativeCopy.json',
  'packages/config/src/translations/report.json',
  'packages/config/src/translations/ui.json',
  'packages/pdf/src/translations/reportLabels.json',
  jaiminiJsonPath,
].filter(file => existsSync(path.join(repoRoot, file)));

const staleTranslationValues = translationFiles.flatMap(file =>
  collectMatchingJsonValues(readJson(file), file),
);
assert.deepEqual(
  staleTranslationValues,
  [],
  `translation values must not contain stale Nadi copy:\n${staleTranslationValues.join('\n')}`,
);

const componentLocalizationChecks = [
  {
    file: 'apps/web/components/WebJaiminiPredictaPanel.tsx',
    required: [
      'getJaiminiLocalizationCopy',
      'const copy = getJaiminiLocalizationCopy',
      'copy.askCta',
      'copy.downloadCta',
      'copy.destinyRoleTitle',
      'copy.karakaCouncilEyebrow',
      'copy.evidenceTitle',
    ],
    forbidden: [
      'Ask Jaimini Predicta',
      'Download Jaimini Report',
      'Your destiny role is being prepared from your chart',
      'KARAKA COUNCIL PREVIEW',
      'Technical Evidence',
    ],
  },
  {
    file: 'apps/mobile/src/screens/JaiminiPredictaScreen.tsx',
    required: [
      'getJaiminiLocalizationCopy',
      'const copy = getJaiminiLocalizationCopy',
      'copy.askCta',
      'copy.downloadCta',
      'copy.destinyRoleTitle',
      'copy.karakaCouncilEyebrow',
      'copy.evidenceTitle',
    ],
    forbidden: [
      'Ask Jaimini Predicta',
      'Download Jaimini Report',
      'Your destiny role is being prepared from your chart',
      'KARAKA COUNCIL PREVIEW',
      'TECHNICAL EVIDENCE',
    ],
  },
  {
    file: 'apps/web/app/dashboard/jaimini/chat/page.tsx',
    required: ['redirectLegacyChatToAsk', "school: 'JAIMINI'", "sourceScreen: 'Jaimini Predicta'"],
    forbidden: [
      'Chat with Jaimini Predicta.',
      'Jaimini Predicta keeps the reading',
      'Read my current Jaimini destiny chapter',
      'prompt:',
    ],
  },
];

for (const { file, forbidden, required } of componentLocalizationChecks) {
  const source = read(file);
  for (const fragment of required) {
    assertIncludes(source, fragment, `${file} uses localized fragment ${fragment}`);
  }
  for (const fragment of forbidden) {
    assertNotIncludes(source, fragment, `${file} must not hardcode translated copy ${fragment}`);
  }
}

const activeSurfaceFiles = [
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/components/WebJaiminiPredictaPanel.tsx',
  'apps/web/components/WebKpPredictaPanel.tsx',
  'apps/web/components/WebKundliChart.tsx',
  'apps/web/components/WebSavedKundlis.tsx',
  'apps/web/app/dashboard/jaimini/chat/page.tsx',
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/pricing/page.tsx',
  'apps/web/app/dashboard/premium/page.tsx',
  'apps/mobile/src/screens/JaiminiPredictaScreen.tsx',
  'apps/mobile/src/screens/PaywallScreen.tsx',
  'apps/mobile/src/screens/ReportScreen.tsx',
  'packages/config/src/predictaMemory.ts',
  'packages/astrology/src/predictaChatActions.ts',
  'backend/astro_api/ai.py',
].filter(file => existsSync(path.join(repoRoot, file)));

const staleActiveHits = activeSurfaceFiles.flatMap(file =>
  collectPatternHits(file, staleActivePattern),
);
assert.deepEqual(
  staleActiveHits,
  [],
  `active surfaces must not contain stale user-facing Nadi/palm-leaf copy:\n${staleActiveHits.join('\n')}`,
);

const dossierPreview = read('apps/web/components/WebDossierPreview.tsx');
for (const fragment of [
  'Jaimini Reports',
  "productIds: ['JAIMINI']",
  "getOneTimeProduct('JAIMINI_REPORT')",
  'getMonetizationReportRequirementCopy',
]) {
  assertIncludes(dossierPreview, fragment, `report marketplace has active Jaimini copy ${fragment}`);
}
assertIncludes(
  read('packages/config/src/translations/monetization.json'),
  'Jaimini report is ready',
  'report marketplace has JSON-backed Jaimini readiness copy',
);
for (const forbidden of [
  'Jaimini pending',
  'report download unlocks after the deterministic Jaimini data contract',
  'report engine are audited',
]) {
  assertNotIncludes(dossierPreview, forbidden, `report marketplace avoids stale Jaimini pending copy ${forbidden}`);
}

for (const legacyRoute of [
  ['apps/web/app/dashboard/nadi/page.tsx', "redirect('/dashboard/jaimini')"],
  ['apps/web/app/dashboard/nadi/chat/page.tsx', 'redirectLegacyChatToAsk'],
  ['apps/web/app/dashboard/nadi/chat/page.tsx', "school: 'JAIMINI'"],
]) {
  assertIncludes(read(legacyRoute[0]), legacyRoute[1], `${legacyRoute[0]} redirects to Jaimini`);
}

for (const file of [
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/pricing/page.tsx',
  'apps/web/app/dashboard/premium/page.tsx',
]) {
  assertNotIncludes(read(file), 'Nadi', `${file} does not mention Nadi`);
  assertNotIncludes(read(file), 'NADI', `${file} does not mention NADI`);
}

assertIncludes(
  read('apps/web/app/pricing/PricingPageRuntime.tsx'),
  'getMonetizationProductCopy',
  'apps/web/app/pricing/PricingPageRuntime.tsx exposes Jaimini report product through shared product copy',
);
assertIncludes(
  read('apps/web/components/WebPremiumPage.tsx'),
  'JAIMINI_REPORT',
  'apps/web/components/WebPremiumPage.tsx exposes Jaimini report product',
);
assertIncludes(
  read('packages/config/src/translations/monetization.json'),
  'Jaimini Report Credit',
  'monetization translations expose Jaimini report product label',
);

mkdirSync(auditRoot, { recursive: true });
const manifest = {
  activeSurfaceFiles,
  canonicalTerms,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  status: 'green-source-gate',
  translationFiles,
};
writeFileSync(
  path.join(auditRoot, 'phase-10-localization-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName} verification`,
    '',
    'Status: green-source-gate',
    '',
    'Verified:',
    '- Jaimini has a dedicated English/Hindi/Gujarati translation JSON.',
    '- Jaimini canonical terms are locked for localization and report consistency.',
    '- Web, mobile, and Jaimini chat consume the localization helper instead of hardcoded translated strings.',
    '- Translation values in UI, native copy, report labels, language, and accuracy-method stores contain no stale Nadi copy.',
    '- Active web, mobile, chat, report, pricing, checkout, memory, and backend prompt surfaces contain no stale user-facing Nadi or palm-leaf copy.',
    '- Legacy /dashboard/nadi routes redirect to the Jaimini surfaces.',
  ].join('\n') + '\n',
);

console.log(JSON.stringify(manifest, null, 2));
console.log(`${phaseName} passed: Jaimini localization, stale Nadi copy removal, and hardcoded-copy guards are green.`);
