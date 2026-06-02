import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const languages = ['en', 'hi', 'gu'];
const failures = [];

const requiredFiles = [
  'docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md',
  'packages/config/src/translations/monetization.json',
  'packages/config/src/monetizationCopy.ts',
  'packages/config/src/index.ts',
  'packages/monetization/src/paywallService.ts',
  'packages/monetization/src/usageDisplayService.ts',
  'apps/mobile/src/services/paywall/paywallService.ts',
  'apps/mobile/src/services/usage/usageDisplayService.ts',
  'apps/mobile/src/components/LockedPremiumOverlay.tsx',
  'apps/mobile/src/screens/ReportScreen.tsx',
  'apps/mobile/src/screens/SettingsScreen.tsx',
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/pricing/page.tsx',
  'apps/web/app/dashboard/premium/page.tsx',
  'apps/web/components/PricingTeaser.tsx',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/web/components/WebProfileSettings.tsx',
  'packages/config/src/pricing.ts',
  'scripts/run-ui-text-overflow-audit.mjs',
  'scripts/run-ui-personal-space-audit.mjs',
  'scripts/run-end-to-end-buyer-rejection-test.mjs',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`missing required file: ${file}`);
  }
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
[
  'PREDICTA_MONETIZATION_PHASE_10_LOCALIZATION_UI_UX_AND_TRUST_COPY_AUDIT',
  'All monetization copy comes from JSON translation files.',
  'English/Hindi/Gujarati copy is complete and not mixed.',
  'No scary/fatalistic upsell language.',
  'No confusing unlimited claims.',
  'what uses AI credit',
  'what does not use AI credit',
  'what requires report credit',
  'what Family Bank shares',
  'what remains private',
].forEach(fragment => assertIncludes(roadmap, fragment, 'monetization roadmap'));

const monetizationJson = readJson('packages/config/src/translations/monetization.json');
assertEqual(monetizationJson.version, 1, 'monetization translation version');
[
  'paywall',
  'usage',
  'reportCredits',
  'products',
  'reportRequirement',
  'trust',
].forEach(section => {
  if (!monetizationJson[section] || typeof monetizationJson[section] !== 'object') {
    failures.push(`monetization.json is missing section ${section}`);
  }
});

validateLocalizedSection(monetizationJson.paywall, 'paywall');
validateLocalizedSection(monetizationJson.usage, 'usage');
validateLocalizedSection(monetizationJson.reportCredits, 'reportCredits');
validateLocalizedSection(monetizationJson.reportRequirement, 'reportRequirement');
validateLocalizedSection(monetizationJson.trust, 'trust');
validateProductSection(monetizationJson.products);
validateNoMixedNativeCopy(monetizationJson);
validateTrustSafety(monetizationJson);

const adapter = read('packages/config/src/monetizationCopy.ts');
[
  "import monetizationTranslations from './translations/monetization.json'",
  'getMonetizationPaywallContext',
  'getMonetizationUsageCopy',
  'getMonetizationReportRequirementCopy',
  'getMonetizationReportCreditLabel',
  'getMonetizationProductCopy',
  'getMonetizationTrustCopy',
].forEach(fragment => assertIncludes(adapter, fragment, 'monetization copy adapter'));

assertIncludes(
  read('packages/config/src/index.ts'),
  "export * from './monetizationCopy';",
  'config public exports',
);
assertIncludes(
  read('scripts/run-localization-architecture-gate.mjs'),
  'packages/config/src/monetizationCopy.ts',
  'localization architecture gate adapter allow-list',
);

[
  'packages/monetization/src/paywallService.ts',
  'apps/mobile/src/services/paywall/paywallService.ts',
].forEach(file => {
  const source = read(file);
  assertIncludes(source, 'getMonetizationPaywallContext', `${file} paywall`);
  assertNotIncludes(source, 'Your chart context is saved', `${file} hardcoded paywall`);
  assertNotIncludes(source, 'Available in Premium.', `${file} hardcoded paywall`);
});

[
  'packages/monetization/src/usageDisplayService.ts',
  'apps/mobile/src/services/usage/usageDisplayService.ts',
].forEach(file => {
  const source = read(file);
  assertIncludes(source, 'getMonetizationUsageCopy', `${file} usage display`);
  assertNotIncludes(source, 'guidance questions left today', `${file} hardcoded usage`);
  assertNotIncludes(source, 'paid questions available', `${file} hardcoded usage`);
});

[
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/components/WebProfileSettings.tsx',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/pricing/page.tsx',
  'apps/web/app/dashboard/premium/page.tsx',
  'apps/web/components/PricingTeaser.tsx',
  'apps/mobile/src/screens/ReportScreen.tsx',
  'apps/mobile/src/screens/SettingsScreen.tsx',
  'apps/mobile/src/components/LockedPremiumOverlay.tsx',
  'packages/config/src/pricing.ts',
].forEach(file => {
  const source = read(file);
  if (!/getMonetization(?:PaywallContext|UsageCopy|ReportRequirementCopy|ReportCreditLabel|ProductCopy|TrustCopy)/.test(source)) {
    failures.push(`${file}: monetization trust copy is not using the JSON-backed helper`);
  }
});

const forbiddenHardcodedFragments = [
  'Your chart context is saved',
  'Premium PDF depth',
  'non-expiring Predicta AI',
  'Available in Premium',
  'Deep readings unlock',
  'paid questions available',
  'guidance questions left today',
  'Premium requirement',
  'Ready: Premium',
  'Requires Premium',
  'Free deterministic report',
  'Checking your non-expiring',
  'Sign in to use question',
  'Owner opt-in sharing',
  'Lifetime starter AI',
  'Paid question and report credits',
  'Unlock Premium, use a Day Pass',
  'Sign in before downloading',
  'Product Bank:',
  'Adds one non-expiring',
  'Adds five non-expiring',
  'Day Pass is time-limited',
];

const auditedCopyFiles = [
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/components/WebProfileSettings.tsx',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/pricing/page.tsx',
  'apps/web/app/dashboard/premium/page.tsx',
  'apps/web/components/PricingTeaser.tsx',
  'apps/mobile/src/screens/ReportScreen.tsx',
  'apps/mobile/src/screens/SettingsScreen.tsx',
  'apps/mobile/src/components/LockedPremiumOverlay.tsx',
  'apps/mobile/src/services/paywall/paywallService.ts',
  'apps/mobile/src/services/usage/usageDisplayService.ts',
  'packages/monetization/src/paywallService.ts',
  'packages/monetization/src/usageDisplayService.ts',
  'packages/config/src/pricing.ts',
];

for (const file of auditedCopyFiles) {
  const source = read(file);
  for (const fragment of forbiddenHardcodedFragments) {
    assertNotIncludes(source, fragment, `${file} hardcoded monetization copy`);
  }
  assertNoHardcodedIndicScript(file, source);
}

assertNotIncludes(
  read('apps/web/app/dashboard/premium/page.tsx'),
  'ONE_TIME_COPY',
  'premium page must not keep a local product-copy table',
);

if (failures.length) {
  console.error('Monetization Phase 10 localization/trust gate failed:');
  failures.slice(0, 140).forEach(failure => console.error(`- ${failure}`));
  if (failures.length > 140) {
    console.error(`...and ${failures.length - 140} more failures.`);
  }
  process.exit(1);
}

console.log(
  'Monetization Phase 10 localization/trust gate passed: paid-flow copy is JSON-backed, English/Hindi/Gujarati entries are complete, hardcoded monetization phrases are absent from audited surfaces, and trust copy avoids fear/unlimited claims.',
);

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function assertIncludes(source, needle, label) {
  if (!source.includes(needle)) {
    failures.push(`${label} is missing ${needle}`);
  }
}

function assertNotIncludes(source, needle, label) {
  if (source.includes(needle)) {
    failures.push(`${label} still contains ${needle}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    failures.push(`${label}: expected ${expected}, got ${actual}`);
  }
}

function validateLocalizedSection(section, label) {
  if (!section || typeof section !== 'object') {
    return;
  }

  for (const [key, value] of Object.entries(section)) {
    if (isLocalizedString(value)) {
      validateLocalizedString(value, `${label}.${key}`);
      continue;
    }

    if (!value || typeof value !== 'object') {
      failures.push(`${label}.${key}: must be a localized object`);
      continue;
    }

    for (const [childKey, childValue] of Object.entries(value)) {
      if (childKey === 'suggestedProductId') {
        continue;
      }
      if (!isLocalizedString(childValue)) {
        failures.push(`${label}.${key}.${childKey}: must include en/hi/gu strings`);
        continue;
      }
      validateLocalizedString(childValue, `${label}.${key}.${childKey}`);
    }
  }
}

function validateProductSection(products) {
  if (!products || typeof products !== 'object') {
    return;
  }

  for (const [productType, copy] of Object.entries(products)) {
    for (const field of ['label', 'description']) {
      if (!isLocalizedString(copy?.[field])) {
        failures.push(`products.${productType}.${field}: must include en/hi/gu strings`);
        continue;
      }
      validateLocalizedString(copy[field], `products.${productType}.${field}`);
    }
  }
}

function isLocalizedString(value) {
  return (
    value &&
    typeof value === 'object' &&
    languages.every(language => typeof value[language] === 'string')
  );
}

function validateLocalizedString(entry, label) {
  for (const language of languages) {
    if (!entry[language]?.trim()) {
      failures.push(`${label}.${language}: missing copy`);
    }
  }
}

function validateNoMixedNativeCopy(parsed) {
  const latinTerms = /\b(?:checkout|payment|paid depth|Product Bank|Family Bank|Starter AI)\b/i;
  walkLocalizedStrings(parsed, (label, language, value) => {
    if (language !== 'en' && latinTerms.test(value)) {
      failures.push(`${label}.${language}: mixed English monetization term remains`);
    }
  });
}

function validateTrustSafety(parsed) {
  const serialized = JSON.stringify(parsed);
  for (const forbidden of ['guaranteed success', 'must buy', 'curse', 'doomed']) {
    if (serialized.toLowerCase().includes(forbidden)) {
      failures.push(`monetization copy contains unsafe/fear-based phrase: ${forbidden}`);
    }
  }

  assertIncludes(serialized, 'not guaranteed outcomes', 'Premium no-guarantee trust copy');
  assertIncludes(serialized, 'uncontrolled unlimited AI', 'Premium no-unlimited trust copy');
  assertIncludes(serialized, 'do not spend AI credit', 'zero-credit trust copy');
  assertIncludes(serialized, 'private chat', 'Family Bank privacy copy');
}

function walkLocalizedStrings(value, visit, pathParts = []) {
  if (isLocalizedString(value)) {
    for (const language of languages) {
      visit(pathParts.join('.'), language, value[language]);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    walkLocalizedStrings(child, visit, [...pathParts, key]);
  }
}

function assertNoHardcodedIndicScript(file, source) {
  const indicLines = source
    .split(/\r?\n/)
    .map((line, index) =>
      /[\u0900-\u097F\u0A80-\u0AFF]/.test(line) ? index + 1 : undefined,
    )
    .filter(Boolean);

  if (indicLines.length) {
    failures.push(`${file}: hardcoded Hindi/Gujarati script remains on lines ${indicLines.join(', ')}`);
  }
}
