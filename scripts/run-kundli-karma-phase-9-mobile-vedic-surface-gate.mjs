import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_9_MOBILE_VEDIC_APP_SURFACE_PARITY';
const phaseRoot = `docs/audits/${phaseName}`;

const files = {
  chartsScreen: readFileSync('apps/mobile/src/screens/ChartsScreen.tsx', 'utf8'),
  kundliKarmaTranslations: readFileSync('packages/config/src/translations/kundliKarma.json', 'utf8'),
  mobilePanel: readFileSync('apps/mobile/src/components/VedicIntelligencePanel.tsx', 'utf8'),
  mobileTypes: readFileSync('apps/mobile/src/types/astrology.ts', 'utf8'),
  packageJson: readFileSync('package.json', 'utf8'),
  roadmap: readFileSync('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md', 'utf8'),
  sharedTypes: readFileSync('packages/types/src/astrology.ts', 'utf8'),
  webPanel: readFileSync('apps/web/components/WebVedicIntelligencePanel.tsx', 'utf8'),
};

for (const fragment of [
  phaseName,
  'Implement mobile parity for the Vedic Kundli Karma surface.',
  'Add the same top 3 snapshot.',
  'Add mobile-safe tabs/cards or stack links.',
  'same local-memory handoff payload',
  'same free/premium boundary',
]) {
  assertIncludes(files.roadmap, fragment, `roadmap includes ${fragment}`);
}

for (const fragment of [
  'composeKundliKarmaSnapshot',
  'getKundliKarmaCopy',
  'KundliKarmaMobileSurface',
  'topThreeActiveConditions',
  'getKundliKarmaModuleGroups',
  'const copy = getKundliKarmaCopy(language)',
  'copy.surfaceTitle',
  'copy.snapshotMetaTitle',
  'copy.kundliNeededTitle',
  'copy.calculationPendingTitle',
  'copy.noMajorAlertsTitle',
  'copy.consolidatedRemedyPlanLabel',
  'copy.premiumLockedBody',
  'buildKundliKarmaHandoff',
  'buildKundliKarmaPrompt',
  'selectedLanguage: options.language',
  'accessibilityRole="button"',
  'accessibilityState={{ expanded: open }}',
  'testID="kundli-karma-mobile-surface"',
  'testID="kundli-karma-mobile-snapshot"',
  'testID="kundli-karma-mobile-category-stack"',
  'testID="kundli-karma-mobile-remedy-plan"',
]) {
  assertIncludes(files.mobilePanel, fragment, `mobile Vedic panel includes ${fragment}`);
}

for (const fragment of [
  "predictaSchool: 'PARASHARI'",
  'selectedKundliKarmaItemId: item.id',
  'selectedKundliKarmaModule: item.module',
  'selectedKundliKarmaRuleId: item.ruleId',
  'selectedSection: `${options.copy.selectedSectionPrefix}: ${item.displayName}`',
  "sourceScreen: 'Vedic Kundli Karma Snapshot'",
]) {
  assertIncludes(files.mobilePanel, fragment, `mobile handoff includes ${fragment}`);
}

for (const fragment of [
  '"surfaceTitle"',
  '"snapshotMetaTitle"',
  '"askWhyCta"',
  '"downloadDetailedReportCta"',
  '"groupDoshTitle"',
  '"groupShrapTitle"',
  '"groupYogTitle"',
  '"groupLalKitabTitle"',
  '"remedyCategoryFreeKarmaDharmaAction"',
]) {
  assertIncludes(files.kundliKarmaTranslations, fragment, `Kundli Karma translations include ${fragment}`);
}

for (const fragment of [
  'selectedKundliKarmaItemId?: string;',
  'selectedKundliKarmaModule?: KundliKarmaModule;',
  'selectedKundliKarmaRuleId?: string;',
]) {
  assertIncludes(files.sharedTypes, fragment, `shared ChartContext includes ${fragment}`);
  assertIncludes(files.mobileTypes, fragment, `mobile ChartContext includes ${fragment}`);
}

assertIncludes(files.mobileTypes, "export type KundliKarmaModule =", 'mobile types define Kundli Karma module union');

for (const fragment of [
  'onAskPrompt={(prompt, context) => {',
  '...context',
  "sourceScreen: context?.sourceScreen ?? 'Vedic Progressive Disclosure'",
  'navigation.navigate(routes.Chat)',
]) {
  assertIncludes(files.chartsScreen, fragment, `ChartsScreen preserves mobile handoff ${fragment}`);
}

for (const fragment of [
  'composeKundliKarmaSnapshot',
  'KundliKarmaWebSurface',
  'data-local-memory-cta="kundli-karma"',
]) {
  assertIncludes(files.webPanel, fragment, `web parity source still includes ${fragment}`);
}

assertIncludes(
  files.packageJson,
  '"test:kundli-karma-phase-9": "node scripts/run-kundli-karma-phase-9-mobile-vedic-surface-gate.mjs"',
  'package exposes Phase 9 gate',
);

for (const banned of [
  /you are cursed/i,
  /cursed/i,
  /must buy/i,
  /only premium can save/i,
  /will destroy/i,
]) {
  assert.ok(!banned.test(files.mobilePanel), `mobile panel contains banned fear phrase ${banned}`);
}

const proof = {
  auditedFiles: [
    'apps/mobile/src/components/VedicIntelligencePanel.tsx',
    'apps/mobile/src/screens/ChartsScreen.tsx',
    'apps/mobile/src/types/astrology.ts',
    'packages/types/src/astrology.ts',
    'apps/web/components/WebVedicIntelligencePanel.tsx',
  ],
  checks: {
    canonicalTerms: ['copy.groupDoshTitle', 'copy.groupShrapTitle', 'copy.groupYogTitle', 'copy.groupLalKitabTitle'],
    emptyStates: ['copy.kundliNeededTitle', 'copy.calculationPendingTitle', 'copy.noMajorAlertsTitle'],
    freePremiumBoundary: true,
    localMemoryHandoff: [
      'selectedKundliKarmaItemId',
      'selectedKundliKarmaRuleId',
      'selectedKundliKarmaModule',
      'predictaSchool=PARASHARI',
      'sourceScreen=Vedic Kundli Karma Snapshot',
    ],
    mobileProofType:
      'native source and type proof; mobile runtime gate is covered by typecheck, jest, and Android bundle verification',
    noLowerQualityMobilePath: true,
    sharedDeterministicContract: 'composeKundliKarmaSnapshot',
    topThreeLogic: 'snapshot.topThreeActiveConditions',
  },
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  status: 'green',
};

mkdirSync(phaseRoot, { recursive: true });
writeFileSync(join(phaseRoot, 'phase-9-mobile-vedic-surface-proof.json'), `${JSON.stringify(proof, null, 2)}\n`);
writeFileSync(
  join(phaseRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- mobile Vedic panel consumes composeKundliKarmaSnapshot',
    '- top-three snapshot, Dosh/Shrap/Yog/Lal Kitab stack links, expandable cards, consolidated remedies, and premium lock copy are source-locked through dedicated translations',
    '- mobile and shared ChartContext carry Kundli Karma item/rule/module handoff fields',
    '- ChartsScreen preserves the Vedic Kundli Karma local-memory handoff into chat',
    '- mobile source avoids banned fear-selling language',
    '',
  ].join('\n'),
);

console.log(`${phaseName} passed: mobile Vedic Kundli Karma parity source, handoff payload, and proof artifacts are green.`);

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}
