import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Monetization Phase 5 Kundli library gate failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

function assertBefore(source, first, second, label) {
  const firstIndex = source.indexOf(first);
  const secondIndex = source.indexOf(second);
  assert(firstIndex >= 0, `${label} is missing ${first}`);
  assert(secondIndex >= 0, `${label} is missing ${second}`);
  assert(firstIndex < secondIndex, `${label} must put ${first} before ${second}`);
}

const requiredFiles = [
  'docs/audits/PREDICTA_MONETIZATION_PHASE_5_KUNDLI_LIMITS_AND_LIBRARY_ENTITLEMENT/kundli-library-entitlement.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_5_KUNDLI_LIMITS_AND_LIBRARY_ENTITLEMENT/phase-5-kundli-library-manifest.json',
  'packages/monetization/src/kundliLibraryEntitlement.ts',
  'apps/web/lib/web-kundli-storage.ts',
  'apps/web/lib/web-kundli-entitlement-snapshot.ts',
  'apps/mobile/src/services/kundli/kundliRepository.ts',
  'apps/mobile/src/screens/KundliScreen.tsx',
  'apps/mobile/src/screens/ChatScreen.tsx',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
assertIncludes(
  roadmap,
  'PREDICTA_MONETIZATION_PHASE_5_KUNDLI_LIMITS_AND_LIBRARY_ENTITLEMENT',
  'monetization roadmap',
);
assertIncludes(roadmap, 'Free signed-in users can save up to `4` Kundlis total.', 'roadmap');
assertIncludes(roadmap, '`30 generated Kundlis/day` before cooldown/manual review.', 'roadmap');

const contract = read('packages/monetization/src/kundliLibraryEntitlement.ts');
[
  'FREE_SAVED_KUNDLI_LIMIT = 4',
  'PREMIUM_KUNDLI_DAILY_SOFT_LIMIT = 30',
  'evaluateKundliLibraryEntitlement',
  'FREE_KUNDLI_LIMIT_REACHED',
  'PREMIUM_KUNDLI_DAILY_SOFT_LIMIT_REACHED',
  'SIGN_IN_REQUIRED_FOR_MULTIPLE_KUNDLIS',
  "limit: 'unlimited'",
].forEach(fragment => assertIncludes(contract, fragment, 'shared Kundli entitlement contract'));
assertBefore(
  contract,
  'if (isUpdate || existingKundli)',
  'if (!signedIn)',
  'shared contract must allow updates/existing Kundlis before creation limits',
);
assertBefore(
  contract,
  'if (hasPremiumAccess)',
  'if (safeSavedCount >= FREE_SAVED_KUNDLI_LIMIT)',
  'shared contract must evaluate Premium before free limit',
);

const webStorage = read('apps/web/lib/web-kundli-storage.ts');
[
  'evaluateKundliLibraryEntitlement',
  'readWebKundliEntitlementSnapshot',
  'PREMIUM_KUNDLI_GENERATION_DAY_KEY',
  'readPremiumKundliGenerationDayCount',
  'incrementPremiumKundliGenerationDayCount',
  'decision.reason',
  'decision.remaining',
].forEach(fragment => assertIncludes(webStorage, fragment, 'web Kundli storage entitlement gate'));
assertBefore(webStorage, 'const gate = canSaveWebKundli', 'saveWebKundliStore({', 'web save must gate before persisting');

const webSnapshot = read('apps/web/lib/web-kundli-entitlement-snapshot.ts');
[
  'writeWebKundliEntitlementSnapshotFromLedger',
  'readWebKundliEntitlementSnapshot',
  'hasPremiumAccess(mapServerLedgerToMonetizationState(ledger))',
].forEach(fragment => assertIncludes(webSnapshot, fragment, 'web premium entitlement snapshot'));

const webAccess = read('apps/web/lib/web-access-state.ts');
assertIncludes(webAccess, 'writeWebKundliEntitlementSnapshotFromLedger(payload.ledger)', 'web access ledger hydration');

const webProvider = read('apps/web/components/ClientServicesProvider.tsx');
assertIncludes(webProvider, 'void loadWebServerLedgerState();', 'web auth-time ledger hydration');

const webWizard = read('apps/web/components/WebKundliWizard.tsx');
[
  'getKundliGateMessage',
  'FREE_KUNDLI_LIMIT_REACHED',
  'PREMIUM_KUNDLI_DAILY_SOFT_LIMIT_REACHED',
  'Upgrade to save another Kundli',
].forEach(fragment => assertIncludes(webWizard, fragment, 'web Kundli wizard limit UX'));

const webChat = read('apps/web/components/WebPridictaChat.tsx');
[
  'buildKundliLimitReply',
  'FREE_KUNDLI_LIMIT_REACHED',
  'I kept your birth details in this chat',
  'saveResult.reason',
  'creationGate.reason',
].forEach(fragment => assertIncludes(webChat, fragment, 'web chat fifth Kundli preservation'));

const webBirthTime = read('apps/web/components/WebBirthTimeDetective.tsx');
assertIncludes(webBirthTime, 'generateKundliFromWeb(finalDetails, { save: false })', 'web birth-time update must not create new save implicitly');
assertIncludes(webBirthTime, 'id: activeKundli.id', 'web birth-time update preserves active Kundli id');

const mobileRepo = read('apps/mobile/src/services/kundli/kundliRepository.ts');
[
  'evaluateKundliLibraryEntitlement',
  'KundliStorageLimitError',
  'FREE_KUNDLI_LIMIT_REACHED',
  'PREMIUM_KUNDLI_DAILY_SOFT_LIMIT_REACHED',
  'hasPremiumAccess',
].forEach(fragment => assertIncludes(mobileRepo, fragment, 'mobile Kundli repository entitlement gate'));
assertBefore(mobileRepo, 'const gate = evaluateKundliLibraryEntitlement', 'const record = buildSavedKundliRecord', 'mobile repository must gate before local save');

const mobileKundli = read('apps/mobile/src/screens/KundliScreen.tsx');
[
  'hasPremiumAccess: access.hasPremiumAccess',
  'FREE_KUNDLI_LIMIT_REACHED',
  'routes.Paywall',
  'Free Kundli limit reached',
].forEach(fragment => assertIncludes(mobileKundli, fragment, 'mobile Kundli form fifth-save UX'));

const mobileChat = read('apps/mobile/src/screens/ChatScreen.tsx');
assertIncludes(mobileChat, 'hasPremiumAccess: getResolvedAccess().hasPremiumAccess', 'mobile chat must pass premium access to Kundli repository');

const mobileBirthTime = read('apps/mobile/src/screens/BirthTimeDetectiveScreen.tsx');
assertIncludes(mobileBirthTime, 'id: kundli.id', 'mobile birth-time update preserves active Kundli id');
assertIncludes(mobileBirthTime, 'hasPremiumAccess: getResolvedAccess().hasPremiumAccess', 'mobile birth-time save uses premium access');

const kp = read('apps/mobile/src/screens/KpPredictaScreen.tsx');
const jaimini = read('apps/mobile/src/screens/JaiminiPredictaScreen.tsx');
assertIncludes(kp, 'hasPremiumAccess,', 'KP school save hook receives premium access');
assertIncludes(jaimini, 'ActiveKundliActions', 'Jaimini screen uses the active Kundli library surface');
assertIncludes(jaimini, 'composeJaiminiPlan(kundli)', 'Jaimini screen reads from the active Kundli instead of creating an ungated save path');

const manifest = JSON.parse(
  read(
    'docs/audits/PREDICTA_MONETIZATION_PHASE_5_KUNDLI_LIMITS_AND_LIBRARY_ENTITLEMENT/phase-5-kundli-library-manifest.json',
  ),
);
assert(
  manifest.phase === 'PREDICTA_MONETIZATION_PHASE_5_KUNDLI_LIMITS_AND_LIBRARY_ENTITLEMENT',
  'manifest phase mismatch',
);
assert(manifest.green === true, 'manifest must be green after strict audit');
assert(manifest.freeSavedKundliLimit === 4, 'manifest free limit mismatch');
assert(manifest.premiumDailySoftLimit === 30, 'manifest premium soft limit mismatch');

console.log('Monetization Phase 5 Kundli library entitlement gate passed.');
