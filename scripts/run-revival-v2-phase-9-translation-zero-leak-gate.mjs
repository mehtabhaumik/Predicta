import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_REVIVAL_V2_PHASE_9_TRANSLATION_ZERO_LEAK_SWEEP';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const translationRoot = path.join(repoRoot, 'packages/config/src/translations');

const delegatedGates = [
  ['global translation source coverage', 'node', ['scripts/run-global-translation-source-coverage-gate.mjs']],
  ['translation trust', 'node', ['scripts/run-translation-completion-trust-gate.mjs']],
  ['localization architecture', 'node', ['scripts/run-localization-architecture-gate.mjs']],
  ['native script chat', 'node', ['scripts/run-native-script-chat-language-rebuild.mjs']],
  ['pre-live localization sweep', 'node', ['scripts/run-pre-live-phase-9-localization-sweep-gate.mjs']],
  ['graha names localization', 'node', ['scripts/run-graha-name-localization-gate.mjs']],
  ['Jaimini localization', 'node', ['scripts/run-jaimini-phase-10-localization-gate.mjs']],
  ['Kundli Karma translation accessibility', 'node', ['scripts/run-kundli-karma-phase-13-translation-accessibility-gate.mjs']],
  ['monetization localization trust', 'node', ['scripts/run-monetization-phase-10-localization-ui-trust-gate.mjs']],
  ['Predicta native tone chat', 'node', ['scripts/run-predicta-intelligence-phase-8-native-tone-gate.mjs']],
];

const delegatedGeneratedArtifacts = [
  'docs/audits/PREDICTA_JAIMINI_PHASE_10_LOCALIZATION_AND_TRANSLATION_REBUILD/phase-10-localization-manifest.json',
  'docs/audits/PREDICTA_KUNDLI_KARMA_PHASE_13_TRANSLATION_ACCESSIBILITY_AND_NO_HARDCODED_COPY_SWEEP/phase-13-translation-accessibility-proof.json',
];

const routeSurfaces = [
  {
    id: 'ask-predicta',
    files: [
      'apps/web/components/WebPridictaChat.tsx',
      'apps/web/components/AskPredictaLightShell.tsx',
      'apps/web/components/AskPredictaLeanHeader.tsx',
    ],
    requiredAdapters: ['getPredictaWebChatCopy', 'translateUiText', 'getNativeCopy'],
  },
  {
    id: 'dashboard-shell',
    files: [
      'apps/web/app/dashboard/page.tsx',
      'apps/web/components/WebDashboardAstrologyCockpit.tsx',
    ],
    requiredAdapters: ['getLightweightCompetitorResponseCopy', 'getLightweightAppShellLabels'],
  },
  {
    id: 'vedic-kundli',
    files: [
      'apps/web/app/dashboard/vedic/page.tsx',
      'apps/web/app/dashboard/kundli/page.tsx',
      'apps/web/components/WebVedicWorldPage.tsx',
      'apps/web/components/WebKundliWizard.tsx',
      'apps/web/components/WebVedicIntelligencePanel.tsx',
      'apps/mobile/src/screens/KundliScreen.tsx',
    ],
    requiredAdapters: ['translateUiText', 'getNativeCopy'],
  },
  {
    id: 'kp',
    files: [
      'apps/web/app/dashboard/kp/page.tsx',
      'apps/web/components/WebKpPage.tsx',
      'apps/web/components/WebKpPredictaPanel.tsx',
      'apps/mobile/src/screens/KpPredictaScreen.tsx',
    ],
    requiredAdapters: ['translateUiText', 'getNativeCopy'],
  },
  {
    id: 'jaimini',
    files: [
      'apps/web/app/dashboard/jaimini/page.tsx',
      'apps/web/components/WebJaiminiPage.tsx',
      'apps/web/components/WebJaiminiPredictaPanel.tsx',
      'apps/mobile/src/screens/JaiminiPredictaScreen.tsx',
    ],
    requiredAdapters: ['getJaiminiLocalizationCopy', 'translateUiText'],
  },
  {
    id: 'numerology',
    files: [
      'apps/web/app/dashboard/numerology/page.tsx',
      'apps/web/components/WebNumerologyPage.tsx',
      'apps/web/components/WebNumerologyPredictaPanel.tsx',
      'apps/mobile/src/screens/NumerologyPredictaScreen.tsx',
    ],
    requiredAdapters: ['translateUiText', 'getNativeCopy'],
  },
  {
    id: 'signature',
    files: [
      'apps/web/app/dashboard/signature/page.tsx',
      'apps/web/components/WebSignaturePage.tsx',
      'apps/web/components/WebSignatureAnalysisInputFlow.tsx',
      'apps/mobile/src/screens/SignaturePredictaScreen.tsx',
    ],
    requiredAdapters: ['translateUiText', 'getNativeCopy'],
  },
  {
    id: 'reports',
    files: [
      'apps/web/app/dashboard/report/page.tsx',
      'apps/web/components/WebReportPage.tsx',
      'apps/web/components/WebDossierPreview.tsx',
      'apps/mobile/src/screens/ReportScreen.tsx',
      'packages/pdf/src/reportDocument.tsx',
      'packages/pdf/src/index.ts',
    ],
    requiredAdapters: ['translateUiText', 'getNativeCopy', 'translations/reportLabels.json'],
  },
  {
    id: 'pricing-checkout-redeem',
    files: [
      'apps/web/app/pricing/PricingPageRuntime.tsx',
      'apps/web/app/checkout/CheckoutPageRuntime.tsx',
      'apps/web/components/WebRedeemPassPage.tsx',
      'apps/web/components/WebRedeemPassForm.tsx',
      'apps/mobile/src/screens/RedeemPassCodeScreen.tsx',
    ],
    requiredAdapters: [
      'getPricingPageCopy',
      'getPricingPagePlanCopy',
      'getMonetizationProductCopy',
      'getMonetizationReportRequirementCopy',
      'getNativeCopy',
    ],
  },
  {
    id: 'account-family-settings',
    files: [
      'apps/web/app/dashboard/settings/page.tsx',
      'apps/web/app/dashboard/family/page.tsx',
      'apps/web/components/WebProfileSettings.tsx',
      'apps/web/components/WebFamilyVault.tsx',
      'apps/web/components/WebFamilyPairComparisonPage.tsx',
      'apps/mobile/src/screens/SettingsScreen.tsx',
      'apps/mobile/src/screens/SavedKundlisScreen.tsx',
      'apps/mobile/src/screens/FamilyKarmaMapScreen.tsx',
    ],
    requiredAdapters: ['getNativeCopy'],
  },
];

const failures = [];
const gateResults = [];

assertRoadmapContract();
assertTranslationFiles();
const routeAudit = assertRouteSurfaces();
const preservedGeneratedArtifacts = preserveGeneratedArtifacts();
runDelegatedGates();
restoreGeneratedArtifacts(preservedGeneratedArtifacts);

if (failures.length) {
  throw new assert.AssertionError({
    message: `${phaseName} failed:\n- ${failures.join('\n- ')}`,
  });
}

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'translation-route-surface-audit.json'),
  `${JSON.stringify(routeAudit, null, 2)}\n`,
);
writeFileSync(
  path.join(auditRoot, 'delegated-gate-results.json'),
  `${JSON.stringify(gateResults, null, 2)}\n`,
);
writeFileSync(
  path.join(auditRoot, 'phase-9-manifest.json'),
  `${JSON.stringify(
    {
      phase: phaseName,
      status: 'GREEN',
      strictAudit: true,
      checks: [
        'roadmap Phase 9 contract is present',
        'package.json exposes test:revival-v2-phase-9',
        'dedicated translation JSON files are present and parseable',
        'high-risk web, mobile, chat, report, pricing, checkout, redeem, family, and account surfaces avoid hardcoded Hindi/Gujarati script',
        'high-risk route surfaces use dedicated translation adapters or report label JSON',
        'global translation source coverage, translation trust, localization architecture, native script chat, pre-live localization, graha names, Jaimini, Kundli Karma, monetization, and Predicta native-tone gates pass',
      ],
      auditedRoutes: routeAudit.map(route => route.id),
      delegatedGates: gateResults.map(result => result.name),
    },
    null,
  )}\n`,
);
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: GREEN`,
    '',
    'Verified by scripts/run-revival-v2-phase-9-translation-zero-leak-gate.mjs.',
    'This gate delegates to the global AST translation sweep, translation trust, localization architecture, native-script chat, pre-live Phase 9, graha name, Jaimini, Kundli Karma, monetization, and Predicta native-tone gates.',
    'Route surface audit covers Ask Predicta, dashboard, Vedic/Kundli, KP, Jaimini, Numerology, Signature, Reports/PDF, Pricing/Checkout/Redeem, Account/Family/Settings, and mobile parity screens.',
    '',
  ].join('\n'),
);

console.log(
  `${phaseName} passed: translation zero-leak sweep, route surface audit, and delegated localization gates are green.`,
);

function assertRoadmapContract() {
  const roadmap = read('docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md');
  const packageJson = JSON.parse(read('package.json'));

  [
    phaseName,
    'Eliminate missing, mixed, and hardcoded translations.',
    'Audit visible and hidden surfaces in English, Hindi, and Gujarati.',
    'Move hardcoded user-facing copy into dedicated translation JSON/config files.',
    'Include drawers, modals, forms, errors, empty states, reports, and chat.',
    'Global translation coverage and translation trust gates pass.',
    'Manual route dumps show no major language leaks.',
  ].forEach(fragment =>
    assertGate(roadmap.includes(fragment), `roadmap missing ${fragment}`),
  );

  assertGate(
    packageJson.scripts?.['test:revival-v2-phase-9'] ===
      'node scripts/run-revival-v2-phase-9-translation-zero-leak-gate.mjs',
    'package.json must expose test:revival-v2-phase-9',
  );
}

function assertTranslationFiles() {
  const files = readdirSync(translationRoot)
    .filter(file => file.endsWith('.json'))
    .sort();
  const required = [
    'competitorResponse.json',
    'eventOracle.json',
    'jaimini.json',
    'kundliKarma.json',
    'language.json',
    'monetization.json',
    'nativeCopy.json',
    'predictaUx.json',
    'predictaWebChat.json',
    'pricingPage.json',
    'reportPreviewAlignment.json',
    'specialistRoomFallback.json',
    'ui.json',
  ];

  for (const file of required) {
    assertGate(files.includes(file), `translation file missing packages/config/src/translations/${file}`);
  }

  for (const file of files) {
    const translation = readJson(`packages/config/src/translations/${file}`);
    assertLanguageBranches(file, translation, []);
  }
}

function assertRouteSurfaces() {
  return routeSurfaces.map(surface => {
    const files = surface.files.map(file => {
      assertGate(existsSync(path.join(repoRoot, file)), `${surface.id}: missing audited file ${file}`);
      const source = existsSync(path.join(repoRoot, file)) ? read(file) : '';
      const nativeScriptLines = source
        .split(/\r?\n/)
        .map((line, index) => (/[\u0900-\u097F\u0A80-\u0AFF]/.test(line) ? index + 1 : undefined))
        .filter(Boolean);
      if (nativeScriptLines.length) {
        failures.push(
          `${file}: hardcoded Hindi/Gujarati script remains on lines ${nativeScriptLines.join(', ')}`,
        );
      }

      const adapters = [
        'getNativeCopy',
        'formatNativeCopy',
        'translateUiText',
        'getPredictaWebChatCopy',
        'getPricingPageCopy',
        'getPricingPagePlanCopy',
        'getPricingPagePremiumFeatureStory',
        'getMonetizationProductCopy',
        'getMonetizationReportRequirementCopy',
        'getJaiminiCopy',
        'getLanguageLabels',
        'getLightweightAppShellLabels',
        'getLightweightCompetitorResponseCopy',
        'getPublicPageFallbackCopy',
        'translations/reportLabels.json',
      ].filter(fragment => source.includes(fragment));

      return {
        file,
        translationAdapters: adapters,
        hardcodedNativeScriptLines: nativeScriptLines,
      };
    });

    const combinedSource = surface.files.map(file =>
      existsSync(path.join(repoRoot, file)) ? read(file) : '',
    ).join('\n');
    for (const adapter of surface.requiredAdapters) {
      assertGate(
        combinedSource.includes(adapter),
        `${surface.id}: expected translation adapter/source ${adapter}`,
      );
    }

    return {
      id: surface.id,
      files,
      requiredAdapters: surface.requiredAdapters,
    };
  });
}

function runDelegatedGates() {
  for (const [name, command, args] of delegatedGates) {
    try {
      const output = execFileSync(command, args, {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: 'pipe',
      }).trim();
      gateResults.push({
        name,
        status: 'passed',
        summary: lastOutputLine(output),
      });
    } catch (error) {
      const output = [error.stdout, error.stderr]
        .filter(Boolean)
        .map(value => value.toString())
        .join('\n')
        .trim();
      failures.push(`${name} gate failed:\n${output}`);
      gateResults.push({
        name,
        status: 'failed',
        summary: lastOutputLine(output),
      });
    }
  }
}

function preserveGeneratedArtifacts() {
  return delegatedGeneratedArtifacts.map(file => ({
    content: existsSync(path.join(repoRoot, file)) ? read(file) : undefined,
    file,
  }));
}

function restoreGeneratedArtifacts(artifacts) {
  for (const artifact of artifacts) {
    if (artifact.content === undefined) {
      continue;
    }
    writeFileSync(path.join(repoRoot, artifact.file), artifact.content);
  }
}

function lastOutputLine(output) {
  return output.split(/\r?\n/).filter(Boolean).at(-1) ?? '';
}

function assertLanguageBranches(file, value, pathParts) {
  if (!value || typeof value !== 'object') {
    return;
  }

  if (
    Object.prototype.hasOwnProperty.call(value, 'en') ||
    Object.prototype.hasOwnProperty.call(value, 'hi') ||
    Object.prototype.hasOwnProperty.call(value, 'gu')
  ) {
    for (const language of ['en', 'hi', 'gu']) {
      const branch = value[language];
      if (branch === undefined || branch === null) {
        failures.push(`${file}:${pathParts.join('.') || '<root>'}: missing ${language} translation branch`);
        continue;
      }
      if (typeof branch === 'string' && !branch.trim()) {
        failures.push(`${file}:${[...pathParts, language].join('.')}: empty translation string`);
      }
    }
  }

  for (const [key, child] of Object.entries(value)) {
    if (child && typeof child === 'object') {
      assertLanguageBranches(file, child, [...pathParts, key]);
    }
  }
}

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function readJson(file) {
  try {
    return JSON.parse(read(file));
  } catch (error) {
    failures.push(`${file}: invalid JSON (${error.message})`);
    return {};
  }
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}
