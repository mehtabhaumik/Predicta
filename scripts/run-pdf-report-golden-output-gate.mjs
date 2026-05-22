import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];
const checks = [];

function readWorkspaceFile(file) {
  return readFileSync(join(root, file), 'utf8');
}

function pass(label) {
  checks.push(label);
}

function fail(label, detail) {
  failures.push(`${label}: ${detail}`);
}

function expectIncludes(file, label, fragments) {
  const source = readWorkspaceFile(file);

  for (const fragment of fragments) {
    const text = Array.isArray(fragment) ? fragment[0] : fragment;
    const description = Array.isArray(fragment) ? fragment[1] : fragment;

    if (!source.includes(text)) {
      fail(`${file} / ${label}`, `missing ${description}`);
    } else {
      pass(`${file} includes ${description}`);
    }
  }
}

function expectRegex(file, label, pattern) {
  const source = readWorkspaceFile(file);

  if (!pattern.test(source)) {
    fail(file, `missing ${label}`);
  } else {
    pass(`${file} matches ${label}`);
  }
}

function expectNoBannedUserFacingCopy() {
  const banned = [
    'fake chart',
    'fake manuscript',
    'not yet calculated',
    'Designed & Engineered',
    'backend catches',
    'frontend',
    'debug mode',
    'TODO',
  ];
  const files = [
    'packages/pdf/src/index.ts',
    'packages/pdf/src/reportDocument.tsx',
    'apps/web/app/api/report/pdf/route.ts',
    'apps/web/components/WebDossierPreview.tsx',
  ];

  for (const file of files) {
    const lower = readWorkspaceFile(file).toLowerCase();

    for (const phrase of banned) {
      if (lower.includes(phrase.toLowerCase())) {
        fail(file, `contains trust-killing or technical phrase "${phrase}"`);
      } else {
        pass(`${file} avoids "${phrase}"`);
      }
    }
  }
}

function expectLocalizedReportLabels() {
  const file = 'packages/pdf/src/translations/reportLabels.json';
  const json = JSON.parse(readWorkspaceFile(file));
  const requiredTitles = [
    'Executive summary',
    'Birth and calculation foundation',
    'Current dasha and timing emphasis',
    'Current transit weather and Sade Sati',
    'Holistic report synthesis',
    'Practical guidance and remedies',
    'Limits and confidence',
  ];
  const requiredEyebrows = [
    'SYNTHESIS',
    'FOUNDATION',
    'TIMING',
    'TRANSITS',
    'REMEDIES',
    'TRUST',
  ];

  if (!json.version) {
    fail(file, 'missing version');
  } else {
    pass(`${file} has version`);
  }

  for (const [mapName, requiredKeys] of [
    ['titleMap', requiredTitles],
    ['eyebrowMap', requiredEyebrows],
  ]) {
    const labelMap = json[mapName];

    if (!labelMap || typeof labelMap !== 'object') {
      fail(file, `missing ${mapName}`);
      continue;
    }

    pass(`${file} has ${mapName}`);

    for (const key of requiredKeys) {
      const item = labelMap[key];

      if (!item) {
        fail(file, `${mapName} missing ${key}`);
        continue;
      }

      for (const language of ['hi', 'gu']) {
        const value = item[language];
        const nativePattern = language === 'hi' ? /[\u0900-\u097F]/ : /[\u0A80-\u0AFF]/;

        if (!value || !value.trim()) {
          fail(file, `${mapName}.${key}.${language} is empty`);
          continue;
        }

        if (value.trim().toLowerCase() === key.trim().toLowerCase()) {
          fail(file, `${mapName}.${key}.${language} copies English`);
          continue;
        }

        if (!nativePattern.test(value)) {
          fail(file, `${mapName}.${key}.${language} does not use native script`);
          continue;
        }

        pass(`${file} localizes ${mapName}.${key}.${language}`);
      }
    }
  }
}

expectIncludes('packages/pdf/src/index.ts', 'composition source of truth', [
  'chartSnapshots: PdfChartSnapshot[]',
  'const chartSnapshots = buildPdfChartSnapshots(kundli, chartTypes, language);',
  'function buildPdfChartSnapshots(',
  'buildChartRenderModel({',
  'birthDetails: kundli.birthDetails',
  'language,',
  'legend: model.legend',
  'moonNakshatraPada',
  'moonPhase: model.moonPhase',
  'school: model.school',
  'theme: model.theme',
  'degreeLabel: planet.degreeLabel',
  'status: planet.status',
  'displayName: planet.displayName',
  'displaySign: cell.displaySign',
  'signNumber: cell.signNumber',
]);

expectIncludes('packages/pdf/src/reportDocument.tsx', 'premium document renderer', [
  "backgroundColor: '#ECEFF4'",
  "backgroundColor: '#F3F6FB'",
  "logoSrc?: string",
  '<Image src={options.logoSrc} style={styles.coverLogo} />',
  "'Premium' : 'Free insight report'",
  'These charts use the same house structure, signs, planets, degrees,',
  'A polished astrology report built like a keepsake dossier',
  'describeTheme(snapshot.theme, birthTime)',
]);

expectIncludes('apps/web/app/api/report/pdf/route.ts', 'logo-backed PDF route', [
  "renderToBuffer(",
  "logoSrc: await loadPredictaLogoDataUri()",
  "data:image/png;base64,",
  "attachment; filename=",
]);

expectIncludes('packages/pdf/src/index.ts', 'rectified birth time disclosure', [
  "timeConfidence === 'rectified'",
  'Rectified time used; original entered time:',
  'originalTime',
]);

expectIncludes('packages/pdf/src/index.ts', 'free and premium depth boundaries', [
  "if (mode === 'PREMIUM')",
  'return prioritizeChartTypes(chartTypes, reportFocus);',
  'function getFreeChartTypesForFocus(',
  "return ['D1', 'D9', 'D10'];",
  'buildBhavChalitSection',
  'buildKpFoundationSection',
  'buildNadiJyotishPlanSection',
  'buildAshtakavargaSection',
  'buildAdvancedJyotishCoverageSection',
  'buildFullJyotishCoverageSection',
]);

expectIncludes('packages/pdf/src/index.ts', 'safety and trust boundaries', [
  'buildTrustProfile',
  'Predictions are evidence-weighted guidance, not guaranteed outcomes.',
  'Limitations',
  'A Predicta promise by Bhaumik Mehta',
  'clear safety boundaries',
]);

expectIncludes('apps/web/components/WebDossierPreview.tsx', 'web report builder sync', [
  'reportLanguage',
  'setReportLanguage',
  'composeReportSections({',
  'language: reportLanguage',
  "mode: 'FREE'",
  "mode: 'PREMIUM'",
  'visibleSections',
  'selectedSectionKeys',
  'downloadReportPdf()',
  "/api/report/pdf",
  'isPdfDownloading',
  'saveWebAutoSaveMemory({',
  'report: {',
]);

expectLocalizedReportLabels();
expectNoBannedUserFacingCopy();

if (failures.length) {
  console.error('PDF report golden output gate failed.');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`PDF report golden output gate passed: ${checks.length} checks.`);
