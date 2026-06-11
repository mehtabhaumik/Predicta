import { existsSync, readFileSync, statSync } from 'node:fs';

const manifestPath = 'apps/web/.next/app-build-manifest.json';
const root = 'apps/web/.next';
const landingBudgetKb = 250;
const askBudgetKb = 400;
const dashboardBudgetKb = 180;
const specialistBudgets = [
  { budgetKb: 1800, route: '/dashboard/vedic/page' },
  { budgetKb: 600, route: '/dashboard/kp/page' },
  { budgetKb: 600, route: '/dashboard/jaimini/page' },
  { budgetKb: 600, route: '/dashboard/numerology/page' },
  { budgetKb: 600, route: '/dashboard/signature/page' },
  { budgetKb: 20, route: '/dashboard/kundli/page' },
];
const secondaryDashboardBudgets = [
  { budgetKb: 80, route: '/dashboard/birth-time/page' },
  { budgetKb: 80, route: '/dashboard/charts/page' },
  { budgetKb: 80, route: '/dashboard/decision/page' },
  { budgetKb: 80, route: '/dashboard/holistic/page' },
  { budgetKb: 80, route: '/dashboard/saved-kundlis/page' },
  { budgetKb: 80, route: '/dashboard/timeline/page' },
  { budgetKb: 80, route: '/dashboard/wrapped/page' },
  { budgetKb: 600, route: '/dashboard/remedies/page' },
];
const publicRouteBudgets = [
  { budgetKb: 140, route: '/accuracy-method/page' },
  { budgetKb: 140, route: '/checkout/page' },
  { budgetKb: 140, route: '/feedback/page' },
  { budgetKb: 140, route: '/founder/page' },
  { budgetKb: 140, route: '/legal/page' },
  { budgetKb: 140, route: '/pricing/page' },
  { budgetKb: 140, route: '/safety/page' },
];
const sourceFiles = [
  'apps/web/app/page.tsx',
  'apps/web/app/dashboard/page.tsx',
  'apps/web/components/DashboardShell.tsx',
  'apps/web/components/SidebarNav.tsx',
  'apps/web/components/LandingChatFirstContent.tsx',
  'apps/web/components/LandingLightFooter.tsx',
  'apps/web/components/LandingLightHeader.tsx',
  'apps/web/components/AskPredictaLeanHeader.tsx',
  'apps/web/components/AskPredictaLightShell.tsx',
  'apps/web/lib/lightweight-public-copy.ts',
  'apps/web/lib/use-lightweight-language-preference.ts',
  'apps/web/app/dashboard/vedic/page.tsx',
  'apps/web/app/dashboard/kp/page.tsx',
  'apps/web/app/dashboard/jaimini/page.tsx',
  'apps/web/app/dashboard/numerology/page.tsx',
  'apps/web/app/dashboard/signature/page.tsx',
  'apps/web/app/dashboard/kundli/page.tsx',
  'apps/web/app/dashboard/birth-time/page.tsx',
  'apps/web/app/dashboard/charts/page.tsx',
  'apps/web/app/dashboard/decision/page.tsx',
  'apps/web/app/dashboard/holistic/page.tsx',
  'apps/web/app/dashboard/remedies/page.tsx',
  'apps/web/app/dashboard/saved-kundlis/page.tsx',
  'apps/web/app/dashboard/timeline/page.tsx',
  'apps/web/app/dashboard/wrapped/page.tsx',
  'apps/web/components/WebBirthTimeDetectiveLoader.tsx',
  'apps/web/components/WebChartsExplorerLoader.tsx',
  'apps/web/components/WebDecisionOracleLoader.tsx',
  'apps/web/components/WebHolisticRoomsLoader.tsx',
  'apps/web/components/WebLifeTimelineLoader.tsx',
  'apps/web/components/WebPredictaWrappedLoader.tsx',
  'apps/web/components/WebRemedyCoachLoader.tsx',
  'apps/web/components/WebSavedKundlisLoader.tsx',
  'apps/web/components/WebKpPredictaLoader.tsx',
  'apps/web/components/WebJaiminiPredictaLoader.tsx',
  'apps/web/components/WebNumerologyPredictaLoader.tsx',
  'apps/web/components/WebSignatureAnalysisLoader.tsx',
  'apps/web/components/WebKundliWizardLoader.tsx',
  'apps/web/components/WebVedicIntelligencePanelLoader.tsx',
  'apps/web/app/accuracy-method/page.tsx',
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/checkout/CheckoutPageLoader.tsx',
  'apps/web/app/feedback/page.tsx',
  'apps/web/app/feedback/FeedbackPageLoader.tsx',
  'apps/web/app/founder/page.tsx',
  'apps/web/app/founder/FounderPageLoader.tsx',
  'apps/web/app/pricing/page.tsx',
  'apps/web/app/pricing/PricingPageLoader.tsx',
  'apps/web/app/safety/page.tsx',
  'apps/web/app/safety/SafetyPageLoader.tsx',
  'apps/web/components/PublicPageRuntimeFallback.tsx',
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
const dashboard = measureRoute('/dashboard/page');
const specialistRoutes = specialistBudgets.map(item => ({
  ...item,
  measurement: measureRoute(item.route),
}));
const secondaryDashboardRoutes = secondaryDashboardBudgets.map(item => ({
  ...item,
  measurement: measureRoute(item.route),
}));
const publicRoutes = publicRouteBudgets.map(item => ({
  ...item,
  measurement: measureRoute(item.route),
}));
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

if (dashboard.pageSpecificKb > dashboardBudgetKb) {
  failures.push(
    `/dashboard route page-specific JS is ${dashboard.pageSpecificKb} KB, above ${dashboardBudgetKb} KB.`,
  );
}

for (const specialistRoute of specialistRoutes) {
  if (specialistRoute.measurement.pageSpecificKb > specialistRoute.budgetKb) {
    failures.push(
      `${specialistRoute.route} page-specific JS is ${specialistRoute.measurement.pageSpecificKb} KB, above ${specialistRoute.budgetKb} KB.`,
    );
  }
}

for (const secondaryDashboardRoute of secondaryDashboardRoutes) {
  if (
    secondaryDashboardRoute.measurement.pageSpecificKb >
    secondaryDashboardRoute.budgetKb
  ) {
    failures.push(
      `${secondaryDashboardRoute.route} page-specific JS is ${secondaryDashboardRoute.measurement.pageSpecificKb} KB, above ${secondaryDashboardRoute.budgetKb} KB.`,
    );
  }
}

for (const publicRoute of publicRoutes) {
  if (publicRoute.measurement.pageSpecificKb > publicRoute.budgetKb) {
    failures.push(
      `${publicRoute.route} page-specific JS is ${publicRoute.measurement.pageSpecificKb} KB, above ${publicRoute.budgetKb} KB.`,
    );
  }
}

for (const sourceFile of sourceFiles) {
  const text = readFileSync(sourceFile, 'utf8');

  if (
    sourceFile.includes('Landing') ||
    sourceFile.includes('AskPredicta') ||
    sourceFile.includes('DashboardShell') ||
    sourceFile.includes('SidebarNav') ||
    sourceFile.endsWith('/dashboard/page.tsx') ||
    sourceFile.endsWith('/dashboard/vedic/page.tsx') ||
    sourceFile.endsWith('/dashboard/kp/page.tsx') ||
    sourceFile.endsWith('/dashboard/jaimini/page.tsx') ||
    sourceFile.endsWith('/dashboard/numerology/page.tsx') ||
    sourceFile.endsWith('/dashboard/signature/page.tsx') ||
    sourceFile.endsWith('/dashboard/kundli/page.tsx') ||
    sourceFile.endsWith('/dashboard/birth-time/page.tsx') ||
    sourceFile.endsWith('/dashboard/charts/page.tsx') ||
    sourceFile.endsWith('/dashboard/decision/page.tsx') ||
    sourceFile.endsWith('/dashboard/holistic/page.tsx') ||
    sourceFile.endsWith('/dashboard/remedies/page.tsx') ||
    sourceFile.endsWith('/dashboard/saved-kundlis/page.tsx') ||
    sourceFile.endsWith('/dashboard/timeline/page.tsx') ||
    sourceFile.endsWith('/dashboard/wrapped/page.tsx') ||
    sourceFile.endsWith('/accuracy-method/page.tsx') ||
    sourceFile.endsWith('/checkout/page.tsx') ||
    sourceFile.endsWith('/feedback/page.tsx') ||
    sourceFile.endsWith('/founder/page.tsx') ||
    sourceFile.endsWith('/legal/page.tsx') ||
    sourceFile.endsWith('/pricing/page.tsx') ||
    sourceFile.endsWith('/safety/page.tsx') ||
    sourceFile === 'apps/web/app/page.tsx'
  ) {
    for (const forbidden of [
      '@pridicta/config',
      './WebHeader',
      './WebFooter',
      './AuthDialog',
      './WebLanguageSelector',
      './WebPridictaChat',
      './WebFooter',
      'framer-motion',
      'useWebKundliLibrary',
      'WebPridictaChat',
      "from '../../../components/WebVedicIntelligencePanel'",
      "from '../../../components/WebKpPredictaPanel'",
      "from '../../../components/WebJaiminiPredictaPanel'",
      "from '../../../components/WebNumerologyPredictaPanel'",
      "from '../../../components/WebSignatureAnalysisInputFlow'",
      "from '../../../components/WebKundliWizard'",
      "from '../../../components/WebBirthTimeDetective'",
      "from '../../../components/WebChartsExplorer'",
      "from '../../../components/WebDecisionOracle'",
      "from '../../../components/WebRemedyCoach'",
      "from '../../../components/WebSavedKundlis'",
      'generateKundliFromWeb',
    ]) {
      if (text.includes(forbidden) && !text.includes('dynamic(')) {
        failures.push(`${sourceFile} eagerly imports ${forbidden}.`);
      }
    }
  }
}

const heavyLandingFiles = landing.files.filter(file => file.sizeKb > 250);
const heavyAskFiles = ask.files.filter(file => file.sizeKb > 400);
const heavyDashboardFiles = dashboard.files.filter(file => file.sizeKb > 400);

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

if (heavyDashboardFiles.length) {
  failures.push(
    `/dashboard still includes oversized files: ${heavyDashboardFiles
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
        dashboardBudgetKb,
        landingBudgetKb,
        publicRouteBudgets,
        secondaryDashboardBudgets,
        specialistBudgets,
      },
      dashboard,
      landing,
      publicRoutes: publicRoutes.map(item => item.measurement),
      secondaryDashboardRoutes: secondaryDashboardRoutes.map(item => item.measurement),
      specialistRoutes: specialistRoutes.map(item => item.measurement),
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
