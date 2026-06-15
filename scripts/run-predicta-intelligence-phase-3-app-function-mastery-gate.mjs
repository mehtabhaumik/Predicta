import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import Module from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_INTELLIGENCE_PHASE_3_APP_FUNCTION_MASTERY';
const failures = [];

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveWorkspaceAlias(
  request,
  parent,
  isMain,
  options,
) {
  const aliases = {
    '@pridicta/ai': 'packages/ai/src/index.ts',
    '@pridicta/astrology': 'packages/astrology/src/index.ts',
    '@pridicta/config': 'packages/config/src/index.ts',
    '@pridicta/config/uiTranslations': 'packages/config/src/uiTranslations.ts',
    '@pridicta/types': 'packages/types/src/index.ts',
  };
  if (aliases[request]) {
    return path.join(repoRoot, aliases[request]);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

[
  'docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md',
  'docs/audits/PREDICTA_INTELLIGENCE_PHASE_2_LOCAL_MEMORY_AND_DETERMINISTIC_ROUTER/verification.txt',
  'packages/astrology/src/predictaChatActions.ts',
  'packages/astrology/src/chatFollowUps.ts',
  'packages/astrology/src/index.ts',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/mobile/src/screens/ChatScreen.tsx',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_INTELLIGENCE_AND_CHAT_EXPERIENCE_ROADMAP.md');
[
  phaseName,
  'Make Predicta operate the app, not just talk about it.',
  'create Kundli',
  'edit/switch saved Kundli',
  'open report composer',
  'guide signature upload/draw readiness',
  'explain pass limits and redemption',
  'open account/settings/help',
  'Family Vault assignment and 2-to-4 comparison rules',
  'Preserve draft user intent',
  'Golden app-action transcripts pass.',
  'Links/handoffs carry correct context.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'intelligence roadmap phase 3'));

const {
  buildChatFollowUps,
  buildPredictaActionReply,
  classifyPredictaRouterDecision,
  normalizePredictaIntentText,
} = require('../packages/astrology/src/index.ts');

function expectAction({
  expectedAction,
  expectedHrefPrefix,
  expectedTargetScreen,
  label,
  text,
}) {
  const reply = buildPredictaActionReply({
    language: 'en',
    savedKundlis: [],
    text,
  });

  assert.equal(reply.handled, true, `${label}: handled`);
  assert.equal(reply.action, expectedAction, `${label}: action`);
  assert.equal(
    reply.providerDecision,
    'deterministic_action',
    `${label}: deterministic provider decision`,
  );
  assert.equal(reply.handoff?.preserveDraftIntent, true, `${label}: preserves intent`);
  assert.equal(
    reply.handoff?.context.originalQuestion,
    text,
    `${label}: original question preserved`,
  );
  assert.equal(reply.handoff?.targetScreen, expectedTargetScreen, `${label}: target screen`);
  assert.match(
    reply.handoff?.href ?? '',
    new RegExp(`^${expectedHrefPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?`),
    `${label}: href prefix`,
  );
  assert.match(reply.handoff?.href ?? '', /intent=/, `${label}: href keeps intent`);
  assert.equal(reply.handoff?.context.requiresSignIn, true, `${label}: sign-in recommended`);
  assert.equal(
    classifyPredictaRouterDecision({
      action: expectedAction,
      normalizedText: normalizePredictaIntentText(text),
    }).shouldCallProvider,
    false,
    `${label}: router must not call provider`,
  );
}

[
  {
    expectedAction: 'create-kundli',
    expectedHrefPrefix: '/dashboard/kundli',
    expectedTargetScreen: 'Kundli',
    label: 'create Kundli from chat',
    text: 'Create my Kundli from birth details',
  },
  {
    expectedAction: 'saved-kundlis',
    expectedHrefPrefix: '/dashboard/saved-kundlis',
    expectedTargetScreen: 'SavedKundlis',
    label: 'edit and switch saved Kundli',
    text: 'Open saved Kundlis so I can switch kundli',
  },
  {
    expectedAction: 'report',
    expectedHrefPrefix: '/dashboard/report',
    expectedTargetScreen: 'Report',
    label: 'open report composer',
    text: 'Open report composer for Vedic report',
  },
  {
    expectedAction: 'signature-handoff',
    expectedHrefPrefix: '/dashboard/signature',
    expectedTargetScreen: 'SignaturePredicta',
    label: 'signature upload readiness',
    text: 'Guide me to upload signature for analysis',
  },
  {
    expectedAction: 'pass-redemption',
    expectedHrefPrefix: '/dashboard/redeem-pass',
    expectedTargetScreen: 'RedeemPassCode',
    label: 'pass limits and redemption',
    text: 'Redeem pass code and tell me AI credits left',
  },
  {
    expectedAction: 'account-settings',
    expectedHrefPrefix: '/dashboard/account',
    expectedTargetScreen: 'Settings',
    label: 'account settings',
    text: 'Open my account settings and Google sign in',
  },
  {
    expectedAction: 'support-help',
    expectedHrefPrefix: '/feedback',
    expectedTargetScreen: 'SafetyPromise',
    label: 'support help',
    text: 'Contact support team about a report bug',
  },
  {
    expectedAction: 'family-map',
    expectedHrefPrefix: '/dashboard/family',
    expectedTargetScreen: 'FamilyKarmaMap',
    label: 'Family Vault assignment',
    text: 'Open Family Vault and compare family kundlis',
  },
].forEach(expectAction);

const familyReply = buildPredictaActionReply({
  language: 'en',
  savedKundlis: [],
  text: 'Open Family Vault and compare family kundlis',
});
assert.match(familyReply.text ?? '', /minimum 2|at least 2/i, 'family reply includes minimum 2');
assert.match(familyReply.text ?? '', /maximum 4|at most 4/i, 'family reply includes maximum 4');

const passReply = buildPredictaActionReply({
  language: 'en',
  text: 'Redeem pass code and tell me AI credits left',
});
assert.match(passReply.text ?? '', /AI credit/i, 'pass reply explains AI credits');
assert.match(passReply.text ?? '', /does not spend AI credits/i, 'pass reply names zero-credit actions');

const signatureReply = buildPredictaActionReply({
  language: 'en',
  text: 'Guide me to upload signature for analysis',
});
assert.match(signatureReply.text ?? '', /upload|drawing|confirmed traits/i, 'signature reply guides readiness');

const ctaCases = [
  ['Open report composer for Vedic report', '/dashboard/report', 'Report'],
  ['Guide me to upload signature for analysis', '/dashboard/signature', 'SignaturePredicta'],
  ['Open saved Kundlis so I can switch kundli', '/dashboard/saved-kundlis', 'SavedKundlis'],
  ['Open Family Vault and compare family kundlis', '/dashboard/family', 'FamilyKarmaMap'],
  ['Redeem pass code and tell me AI credits left', '/dashboard/redeem-pass', 'RedeemPassCode'],
  ['Open my account settings and Google sign in', '/dashboard/account', 'Settings'],
  ['Contact support team about a report bug', '/feedback', 'SafetyPromise'],
  ['Create my Kundli from birth details', '/dashboard/kundli', 'Kundli'],
];

for (const [text, hrefPrefix, targetScreen] of ctaCases) {
  const suggestions = buildChatFollowUps({
    hasKundli: false,
    language: 'en',
    lastText: text,
  });
  assert.equal(suggestions.length > 0, true, `${text}: suggestions available`);
  assert.match(suggestions[0].href ?? '', new RegExp(`^${hrefPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\?`), `${text}: suggestion href`);
  assert.equal(suggestions[0].targetScreen, targetScreen, `${text}: suggestion target screen`);
  assert.equal(suggestions[0].context?.handoffQuestion, text, `${text}: suggestion preserves question`);
}

const source = read('packages/astrology/src/predictaChatActions.ts');
[
  'export type PredictaAppFunctionHandoff',
  'preserveDraftIntent: true',
  'buildPredictaAppFunctionHandoff',
  "'create-kundli'",
  "'pass-redemption'",
  "'account-settings'",
  "'support-help'",
  '/dashboard/report',
  '/dashboard/redeem-pass',
  '/dashboard/saved-kundlis',
  '/dashboard/family',
  '/dashboard/signature',
  '/feedback',
].forEach(fragment => assertIncludes(source, fragment, 'app function source'));

const followUpSource = read('packages/astrology/src/chatFollowUps.ts');
[
  'appActionFollowUps',
  'Open report composer',
  'Redeem pass',
  'Open Family Vault',
  'Open saved Kundlis',
  'Create Kundli',
].forEach(fragment => assertIncludes(followUpSource, fragment, 'follow-up source'));

if (failures.length) {
  console.error(`${phaseName}: FAILED`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName}: passed`);
