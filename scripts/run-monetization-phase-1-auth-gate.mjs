import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Monetization Phase 1 auth gate failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

const requiredFiles = [
  'docs/audits/PREDICTA_MONETIZATION_PHASE_1_GOOGLE_SIGN_IN_HARD_GATE_AND_AUTH_QA/auth-hard-gate-ledger.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_1_GOOGLE_SIGN_IN_HARD_GATE_AND_AUTH_QA/phase-1-auth-manifest.json',
  'apps/web/lib/firebase/server-auth.ts',
  'apps/web/lib/firebase/auth-token.ts',
  'apps/web/components/WebAuthRequired.tsx',
  'apps/mobile/src/components/SignInRequiredPanel.tsx',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
assertIncludes(
  roadmap,
  'PREDICTA_MONETIZATION_PHASE_1_GOOGLE_SIGN_IN_HARD_GATE_AND_AUTH_QA',
  'monetization roadmap',
);

const ledger = read(
  'docs/audits/PREDICTA_MONETIZATION_PHASE_1_GOOGLE_SIGN_IN_HARD_GATE_AND_AUTH_QA/auth-hard-gate-ledger.md',
);
[
  'Web AI chat',
  'Web report API',
  'Mobile Kundli creation',
  'Mobile Family Vault',
  'Google Sign-In QA',
  'Known Deferred Work',
].forEach(section => assertIncludes(ledger, section, 'Phase 1 ledger'));

const serverAuth = read('apps/web/lib/firebase/server-auth.ts');
[
  'requireFirebaseUser',
  'verifyFirebaseIdToken',
  'createVerify',
  'securetoken@system.gserviceaccount.com',
  'AUTH_REQUIRED',
  'AUTH_SESSION_INVALID',
].forEach(fragment => assertIncludes(serverAuth, fragment, 'server auth verifier'));

[
  'apps/web/app/api/ask-pridicta/route.ts',
  'apps/web/app/api/extract-birth-details/route.ts',
  'apps/web/app/api/generate-kundli/route.ts',
  'apps/web/app/api/report/pdf/route.ts',
].forEach(file => {
  const source = read(file);
  assertIncludes(source, 'requireFirebaseUser', file);
  assertIncludes(source, 'if (!auth.ok)', file);
});

const authToken = read('apps/web/lib/firebase/auth-token.ts');
assertIncludes(authToken, 'getCurrentWebAuthToken', 'web auth token helper');
assertIncludes(authToken, 'getWebAuthHeaders', 'web auth token helper');

const webPridictaAi = read('apps/web/lib/pridicta-ai.ts');
assertIncludes(webPridictaAi, 'getWebAuthHeaders', 'web Predicta AI client');
assertIncludes(webPridictaAi, '...authHeaders', 'web Predicta AI client');

const webKundliStorage = read('apps/web/lib/web-kundli-storage.ts');
assertIncludes(webKundliStorage, 'getWebAuthHeaders', 'web Kundli generation client');
assertIncludes(webKundliStorage, 'evaluateKundliLibraryEntitlement', 'web Kundli save gate');
assertIncludes(webKundliStorage, 'isUpdate: options.isUpdate', 'web Kundli save gate');
assertIncludes(webKundliStorage, 'decision.reason', 'web Kundli save gate');
const kundliEntitlement = read('packages/monetization/src/kundliLibraryEntitlement.ts');
assertIncludes(kundliEntitlement, 'SIGN_IN_REQUIRED_FOR_MULTIPLE_KUNDLIS', 'shared Kundli save gate');

const webDossier = read('apps/web/components/WebDossierPreview.tsx');
assertIncludes(webDossier, 'Please sign in before downloading a Predicta report.', 'web report download gate');
assertIncludes(webDossier, 'getWebAuthHeaders', 'web report download gate');

const authDialog = read('apps/web/components/AuthDialog.tsx');
assertIncludes(authDialog, 'signInWithRedirect', 'web Google redirect fallback');
assertIncludes(authDialog, 'getRedirectResult', 'web Google redirect fallback');
assertIncludes(authDialog, 'isPopupBlockedAuthError', 'web Google redirect fallback');

const webChat = read('apps/web/components/WebPridictaChat.tsx');
assertIncludes(webChat, 'chatAuthReady', 'web chat sign-in gate');
assertIncludes(webChat, 'Sign in before chatting with Predicta.', 'web chat sign-in gate');

[
  'apps/web/app/dashboard/family/page.tsx',
  'apps/web/app/dashboard/family/karma-map/page.tsx',
  'apps/web/app/dashboard/family/compare/page.tsx',
].forEach(file => {
  assertIncludes(read(file), 'WebAuthRequired', `${file} auth wrapper`);
});

const mobilePanel = read('apps/mobile/src/components/SignInRequiredPanel.tsx');
assertIncludes(mobilePanel, 'Continue with Google', 'mobile sign-in required panel');
assertIncludes(mobilePanel, 'routes.Login', 'mobile sign-in required panel');

[
  'apps/mobile/src/screens/KundliScreen.tsx',
  'apps/mobile/src/screens/SavedKundlisScreen.tsx',
  'apps/mobile/src/screens/FamilyKarmaMapScreen.tsx',
].forEach(file => {
  assertIncludes(read(file), 'SignInRequiredPanel', `${file} mobile auth gate`);
});

const mobileChat = read('apps/mobile/src/screens/ChatScreen.tsx');
assertIncludes(mobileChat, 'Please sign in with Google before using Predicta chat.', 'mobile chat auth gate');
assertIncludes(mobileChat, 'navigation.navigate(routes.Login)', 'mobile chat auth gate');

const mobileReport = read('apps/mobile/src/screens/ReportScreen.tsx');
assertIncludes(mobileReport, 'Sign in before downloading a Predicta report', 'mobile report auth gate');

const mobileFamily = read('apps/mobile/src/screens/FamilyKarmaMapScreen.tsx');
assertIncludes(mobileFamily, 'records.slice(0, 4)', 'mobile family max four gate');

console.log('Monetization Phase 1 auth gate passed.');
