import { existsSync, readFileSync, statSync } from 'node:fs';

const manifestPath = 'apps/web/.next/app-build-manifest.json';
const root = 'apps/web/.next';
const landingBudgetKb = 250;
const askBudgetKb = 400;
const sourceFiles = [
  'apps/web/app/page.tsx',
  'apps/web/components/LandingChatFirstContent.tsx',
  'apps/web/components/LandingLightFooter.tsx',
  'apps/web/components/LandingLightHeader.tsx',
  'apps/web/components/AskPredictaLeanHeader.tsx',
  'apps/web/components/AskPredictaLightShell.tsx',
  'apps/web/lib/lightweight-public-copy.ts',
  'apps/web/lib/use-lightweight-language-preference.ts',
];

if (!existsSync(manifestPath)) {
  console.error('Missing web build manifest. Run `corepack pnpm build:web` first.');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const pages = manifest.pages ?? {};
let baselineFiles = new Set();
const baseline = measureRoute('/_not-found/page');
baselineFiles = new Set(baseline.files.map(file => file.file));
baseline.files = baseline.files.map(file => ({
  ...file,
  isBaseline: true,
}));
baseline.pageSpecificKb = 0;
const landing = measureRoute('/page');
const ask = measureRoute('/ask/page');
const failures = [];

if (landing.pageSpecificKb > landingBudgetKb) {
  failures.push(
    `Landing route page-specific JS is ${landing.pageSpecificKb} KB, above ${landingBudgetKb} KB.`,
  );
}

if (ask.pageSpecificKb > askBudgetKb) {
  failures.push(
    `/ask route page-specific JS is ${ask.pageSpecificKb} KB, above ${askBudgetKb} KB.`,
  );
}

for (const sourceFile of sourceFiles) {
  const text = readFileSync(sourceFile, 'utf8');

  if (
    sourceFile.includes('Landing') ||
    sourceFile.includes('AskPredicta') ||
    sourceFile.endsWith('/page.tsx')
  ) {
    for (const forbidden of [
      '@pridicta/config',
      './WebHeader',
      './WebFooter',
      './AuthDialog',
      './WebLanguageSelector',
      './WebPridictaChat',
      'WebPridictaChat',
    ]) {
      if (text.includes(forbidden) && !text.includes('dynamic(')) {
        failures.push(`${sourceFile} eagerly imports ${forbidden}.`);
      }
    }
  }
}

const heavyLandingFiles = landing.files.filter(file => file.sizeKb > 250);
const heavyAskFiles = ask.files.filter(file => file.sizeKb > 400);

if (heavyLandingFiles.length) {
  failures.push(
    `Landing still includes oversized files: ${heavyLandingFiles
      .map(file => `${file.file} (${file.sizeKb} KB)`)
      .join(', ')}`,
  );
}

if (heavyAskFiles.length) {
  failures.push(
    `/ask still includes oversized files: ${heavyAskFiles
      .map(file => `${file.file} (${file.sizeKb} KB)`)
      .join(', ')}`,
  );
}

console.log(
  JSON.stringify(
    {
      ask,
      baseline,
      budgets: {
        askBudgetKb,
        landingBudgetKb,
      },
      landing,
      sourceFilesChecked: sourceFiles.length,
    },
    null,
    2,
  ),
);

if (failures.length) {
  console.error('Phase 6 route bundle gate failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('PREDICTA_APP_REVIVAL_PHASE_6 route bundle gate passed.');

function measureRoute(route) {
  const files = pages[route] ?? [];
  let totalBytes = 0;
  const measuredFiles = files.map(file => {
    let bytes = 0;

    try {
      bytes = statSync(`${root}/${file}`).size;
    } catch {
      bytes = 0;
    }

    totalBytes += bytes;

    return {
      file,
      isBaseline: baselineFiles?.has(file) ?? false,
      sizeKb: Math.round(bytes / 1024),
    };
  });
  const pageSpecificBytes = measuredFiles
    .filter(file => !file.isBaseline)
    .reduce((sum, file) => sum + file.sizeKb * 1024, 0);

  return {
    fileCount: files.length,
    files: measuredFiles.sort((first, second) => second.sizeKb - first.sizeKb),
    pageSpecificKb: Math.round(pageSpecificBytes / 1024),
    route,
    totalKb: Math.round(totalBytes / 1024),
  };
}
