import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_13_TRANSLATION_ACCESSIBILITY_AND_NO_HARDCODED_COPY_SWEEP';
const auditRoot = `docs/audits/${phaseName}`;

const files = {
  chartsScreen: readFileSync('apps/mobile/src/screens/ChartsScreen.tsx', 'utf8'),
  kundliKarmaJson: readFileSync('packages/config/src/translations/kundliKarma.json', 'utf8'),
  mobilePanel: readFileSync('apps/mobile/src/components/VedicIntelligencePanel.tsx', 'utf8'),
  packageJson: readFileSync('package.json', 'utf8'),
  reportLabelsJson: readFileSync('packages/pdf/src/translations/reportLabels.json', 'utf8'),
  roadmap: readFileSync('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md', 'utf8'),
  webPage: readFileSync('apps/web/app/dashboard/vedic/page.tsx', 'utf8'),
  webPanel: readFileSync('apps/web/components/WebVedicIntelligencePanel.tsx', 'utf8'),
};

const translations = JSON.parse(files.kundliKarmaJson);
const reportLabels = JSON.parse(files.reportLabelsJson);
const allowedNativeCopyLatinTerms = new Set([
  'AI',
  'D1',
  'D9',
  'D10',
  'Gemini',
  'Jaimini',
  'Jyotish',
  'KP',
  'PDF',
  'groupTitle',
  'itemName',
]);

for (const fragment of [
  phaseName,
  'English/Hindi/Gujarati translations for all new labels',
  'No hardcoded user-facing copy in components/functions.',
  'Accessibility audit for tabs/cards, expanders, CTAs, and report download',
  'Include hidden drawers, premium gates, chat handoff payload labels, PDF',
  'No mixed-language or fallback-English leakage remains in the new layer.',
]) {
  assertIncludes(files.roadmap, fragment, `roadmap includes ${fragment}`);
}

assertIncludes(
  files.packageJson,
  '"test:kundli-karma-phase-13": "node scripts/run-kundli-karma-phase-13-translation-accessibility-gate.mjs"',
  'package exposes Phase 13 gate',
);

for (const term of ['dosh', 'shrap', 'yog', 'lalKitab', 'karmicDebtShrapIndicators']) {
  const value = translations.canonicalTerms[term];
  assert.ok(value, `canonical term exists: ${term}`);
  assert.equal(typeof value.en, 'string', `${term} has English`);
  assert.match(value.hi, /[\u0900-\u097F]/, `${term} has Hindi script`);
  assert.match(value.gu, /[\u0A80-\u0AFF]/, `${term} has Gujarati script`);
}

const copyKeys = Object.keys(translations.copy.en);
for (const language of ['hi', 'gu']) {
  assert.deepEqual(
    Object.keys(translations.copy[language]).sort(),
    copyKeys.sort(),
    `${language} Kundli Karma copy key parity`,
  );
}

for (const language of ['hi', 'gu']) {
  for (const key of [
    'surfaceTitle',
    'surfaceBody',
    'snapshotMetaTitle',
    'kundliNeededBody',
    'calculationPendingFallback',
    'noMajorAlertsBody',
    'askWhyCta',
    'downloadDetailedReportCta',
    'quickDoshPrompt',
    'quickShrapPrompt',
    'quickLalKitabPrompt',
    'premiumLockedBody',
    'premiumReportBody',
    'remedyCategoryFreeKarmaDharmaAction',
  ]) {
    const value = translations.copy[language][key];
    assert.equal(typeof value, 'string', `${language}.${key} is a string`);
    assert.ok(value.length > 0, `${language}.${key} is not empty`);
    assert.match(
      value,
      language === 'hi' ? /[\u0900-\u097F]/ : /[\u0A80-\u0AFF]/,
      `${language}.${key} uses native script`,
    );
  }

  for (const [key, value] of Object.entries(translations.copy[language])) {
    const unexpectedTerms = (value.match(/[A-Za-z][A-Za-z0-9+.-]*/g) ?? []).filter(
      term => !allowedNativeCopyLatinTerms.has(term),
    );
    assert.equal(
      unexpectedTerms.length,
      0,
      `${language}.${key} mixes untranslated Latin terms: ${[...new Set(unexpectedTerms)].join(', ')}`,
    );
  }
}

for (const source of [files.kundliKarmaJson, files.webPanel, files.mobilePanel, files.reportLabelsJson]) {
  assert.doesNotMatch(source, /\bDosha\b/i, 'user-facing Kundli Karma source must not use Dosha');
  assert.doesNotMatch(source, /\bShrapa\b/i, 'user-facing Kundli Karma source must not use Shrapa');
}

for (const source of [files.webPanel, files.mobilePanel, files.reportLabelsJson]) {
  assert.doesNotMatch(source, /you are cursed/i, 'visible surfaces must not tell user they are cursed');
  assert.doesNotMatch(source, /only premium can save/i, 'visible surfaces must not fear-sell premium');
}

for (const fragment of [
  'getKundliKarmaCopy',
  'const copy = getKundliKarmaCopy(language)',
  'copy.surfaceTitle',
  'copy.snapshotMetaTitle',
  'copy.askWhyCta',
  'copy.downloadDetailedReportCta',
  'copy.quickPromptsTitle',
  'copy.quickDoshPrompt',
  'copy.quickShrapPrompt',
  'copy.quickLalKitabPrompt',
  'copy.premiumLockedBody',
  'copy.remedyCategoryFreeKarmaDharmaAction',
  'aria-label={copy.topThreeAriaLabel}',
  'aria-label={copy.categoryAriaLabel}',
  'selectedLanguage: options.language',
]) {
  assertIncludes(files.webPanel, fragment, `web Kundli Karma source uses localized ${fragment}`);
}

for (const fragment of [
  'language={language}',
  'getKundliKarmaCopy',
  'const copy = getKundliKarmaCopy(language)',
  'copy.surfaceTitle',
  'copy.snapshotMetaTitle',
  'copy.askWhyCta',
  'copy.downloadDetailedReportCta',
  'copy.quickPromptsTitle',
  'copy.quickDoshPrompt',
  'copy.quickShrapPrompt',
  'copy.quickLalKitabPrompt',
  'copy.premiumLockedBody',
  'copy.remedyCategoryFreeKarmaDharmaAction',
  'accessibilityRole="button"',
  'accessibilityState={{ expanded: open }}',
  'accessibilityLabel={label}',
  'selectedLanguage: options.language',
]) {
  assertIncludes(files.mobilePanel, fragment, `mobile Kundli Karma source uses localized/accessibility ${fragment}`);
}

for (const fragment of [
  'const language = languagePreference.chartLanguage ?? languagePreference.language ??',
  'language={language}',
]) {
  assertIncludes(files.chartsScreen, fragment, `mobile ChartsScreen passes language ${fragment}`);
}

assertIncludes(files.webPage, 'language={language}', 'web Vedic page passes language into Kundli Karma panel');

const bannedComponentLiterals = [
  'Dosh, Shrap, Yog and Lal Kitab without fear',
  'Kundli Karma Snapshot',
  'Kundli needed',
  'Calculation pending',
  'No major Kundli Karma alerts',
  'Ask Predicta why this appears',
  'Download detailed report',
  'Explain my strongest Dosh',
  'Explain my Shrap indicator',
  'My Lal Kitab remedy',
  'Premium opens fuller evidence',
  'Zero-credit quick prompts',
  'Consolidated Remedy Plan',
];
for (const literal of bannedComponentLiterals) {
  assertNoVisibleLiteral(files.webPanel, literal, `web panel must not hardcode visible copy: ${literal}`);
  assertNoVisibleLiteral(files.mobilePanel, literal, `mobile panel must not hardcode visible copy: ${literal}`);
}

for (const label of [
  'Kundli Karma Snapshot',
  'Dosh In Your Kundli',
  'Karmic Debt & Shrap Indicators',
  'Positive Yog',
  'Challenging Yog',
  'Lal Kitab Reading',
]) {
  const entry = reportLabels.titleMap[label];
  assert.ok(entry, `report label exists: ${label}`);
  assert.equal(typeof label, 'string', `${label} uses English report key`);
  assert.match(entry.hi, /[\u0900-\u097F]/, `${label} has Hindi report label`);
  assert.match(entry.gu, /[\u0A80-\u0AFF]/, `${label} has Gujarati report label`);
}

const proof = {
  auditedFiles: [
    'packages/config/src/translations/kundliKarma.json',
    'apps/web/components/WebVedicIntelligencePanel.tsx',
    'apps/web/app/dashboard/vedic/page.tsx',
    'apps/mobile/src/components/VedicIntelligencePanel.tsx',
    'apps/mobile/src/screens/ChartsScreen.tsx',
    'packages/pdf/src/translations/reportLabels.json',
  ],
  checks: {
    accessibilityMarkers: true,
    canonicalTerms: translations.canonicalTerms,
    componentHardcodedCopyBlocked: bannedComponentLiterals,
    languageAwareChatHandoff: true,
    translationKeyCount: copyKeys.length,
  },
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  status: 'green',
};

mkdirSync(auditRoot, { recursive: true });
writeFileSync(join(auditRoot, 'phase-13-translation-accessibility-proof.json'), `${JSON.stringify(proof, null, 2)}\n`);
writeFileSync(
  join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- Kundli Karma canonical terms and UI copy have English, Hindi, and Gujarati coverage in dedicated JSON.',
    '- Web and mobile Kundli Karma surfaces consume getKundliKarmaCopy instead of hardcoded visible copy.',
    '- Web and mobile chat handoffs preserve selected language instead of forcing English.',
    '- Mobile expanders and CTAs expose accessibility roles, labels, and expanded state.',
    '- PDF Kundli Karma headings have report label translations for English, Hindi, and Gujarati.',
    '',
  ].join('\n'),
);

console.log(`${phaseName} passed: Kundli Karma translations, accessibility markers, chat language handoff, and no-hardcoded-copy sweep are green.`);

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertNoVisibleLiteral(source, literal, label) {
  const offenders = source
    .split('\n')
    .filter(line => line.includes(literal))
    .filter(line => !line.includes('sourceScreen:'));
  assert.equal(offenders.length, 0, `${label}: found ${offenders.join(' | ')}`);
}
