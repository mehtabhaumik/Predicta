import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const auditDir =
  'docs/audits/PREDICTA_PRE_LIVE_PHASE_9_LOCALIZATION_ZERO_HARDCODED_COPY_SWEEP';
const nativeCopyPath = 'packages/config/src/translations/nativeCopy.json';
const nativeCopy = JSON.parse(readFileSync(nativeCopyPath, 'utf8')).entries;

const routes = [
  {
    name: 'checkout',
    files: ['apps/web/app/checkout/page.tsx'],
  },
  {
    name: 'pricing',
    files: ['apps/web/app/pricing/page.tsx'],
  },
  {
    name: 'report',
    files: ['apps/web/app/dashboard/report/page.tsx', 'apps/web/components/WebDossierPreview.tsx'],
  },
  {
    name: 'signature',
    files: [
      'apps/web/components/WebSignatureAnalysisInputFlow.tsx',
      'apps/mobile/src/screens/SignaturePredictaScreen.tsx',
    ],
  },
  {
    name: 'settings',
    files: ['apps/web/components/WebProfileSettings.tsx', 'apps/mobile/src/screens/SettingsScreen.tsx'],
  },
];

const languageScripts = {
  en: /[A-Za-z]/,
  gu: /[\u0A80-\u0AFF]/,
  hi: /[\u0900-\u097F]/,
};

mkdirSync(auditDir, { recursive: true });

const summary = [];

for (const route of routes) {
  const entries = [];

  for (const file of route.files) {
    const source = readFileSync(file, 'utf8');
    const keyPattern = /\b(?:getNativeCopy|formatNativeCopy)\(\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = keyPattern.exec(source)) !== null) {
      const key = match[1];
      const entry = nativeCopy[key];
      if (!entry) {
        continue;
      }

      const value = entry.kind === 'template' ? entry.parts.join('{value}') : entry.value;
      entries.push({
        file,
        key,
        value,
      });
    }
  }

  for (const language of ['en', 'hi', 'gu']) {
    const routeEntries =
      language === 'en'
        ? entries
        : entries.filter(entry => languageScripts[language].test(entry.value));
    const body = [
      `route: ${route.name}`,
      `language: ${language}`,
      `source: JSON-backed native copy keys used by audited route/component files`,
      '',
      ...routeEntries.map(entry =>
        [
          `file: ${entry.file}`,
          `key: ${entry.key}`,
          `text: ${entry.value}`,
          '',
        ].join('\n'),
      ),
    ].join('\n');

    const fileName = `${language}-${route.name}.txt`;
    writeFileSync(join(auditDir, fileName), body);
    summary.push({
      entries: routeEntries.length,
      file: fileName,
      language,
      route: route.name,
    });
  }
}

writeFileSync(
  join(auditDir, 'route-dump-summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log(
  `Phase 9 localization route dumps written to ${auditDir} for ${summary.length} route/language combinations.`,
);
