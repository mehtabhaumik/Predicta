import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Monetization Phase 7 Family Vault gate failed: ${message}`);
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

async function importTsModule(relativePath) {
  const sourcePath = path.join(root, relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
    fileName: sourcePath,
  }).outputText;
  const tmpPath = path.join(os.tmpdir(), `predicta-phase-7-${Date.now()}.mjs`);
  fs.writeFileSync(tmpPath, compiled);
  return import(pathToFileURL(tmpPath).href);
}

const requiredFiles = [
  'docs/audits/PREDICTA_MONETIZATION_PHASE_7_FAMILY_VAULT_ASSIGNMENT_AND_COMPARISON_LIMITS/family-vault-assignment-comparison-audit.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_7_FAMILY_VAULT_ASSIGNMENT_AND_COMPARISON_LIMITS/phase-7-family-vault-manifest.json',
  'packages/astrology/src/familyVaultComparisonLimits.ts',
  'packages/astrology/src/familyKarmaMap.ts',
  'packages/astrology/src/predictaChatActions.ts',
  'apps/web/app/dashboard/family/page.tsx',
  'apps/web/components/WebFamilyKarmaMap.tsx',
  'apps/mobile/src/screens/FamilyKarmaMapScreen.tsx',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
[
  'PREDICTA_MONETIZATION_PHASE_7_FAMILY_VAULT_ASSIGNMENT_AND_COMPARISON_LIMITS',
  'Family Vault can assign any saved Kundli to a family member role.',
  'Family comparison accepts minimum `2` and maximum `4` selected Kundlis.',
  '`0-1` selected Kundlis cannot run comparison.',
  '`2-4` selected Kundlis can run comparison.',
  '`5+` selected Kundlis cannot run comparison.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'monetization roadmap'));

const limits = read('packages/astrology/src/familyVaultComparisonLimits.ts');
[
  'FAMILY_COMPARISON_MIN_KUNDLIS = 2',
  'FAMILY_COMPARISON_MAX_KUNDLIS = 4',
  'evaluateFamilyComparisonEligibility',
  "reason: 'needs_at_least_two'",
  "reason: 'too_many'",
  'getFamilyComparisonEligibilityMessage',
].forEach(fragment => assertIncludes(limits, fragment, 'shared family comparison limit contract'));

const limitModule = await importTsModule('packages/astrology/src/familyVaultComparisonLimits.ts');
for (const count of [0, 1]) {
  const result = limitModule.evaluateFamilyComparisonEligibility(count);
  assert(result.allowed === false, `${count} selected Kundlis must be blocked`);
  assert(result.reason === 'needs_at_least_two', `${count} selected Kundlis must ask for one more`);
}
for (const count of [2, 3, 4]) {
  const result = limitModule.evaluateFamilyComparisonEligibility(count);
  assert(result.allowed === true, `${count} selected Kundlis must be allowed`);
}
for (const count of [5, 6]) {
  const result = limitModule.evaluateFamilyComparisonEligibility(count);
  assert(result.allowed === false, `${count} selected Kundlis must be blocked`);
  assert(result.reason === 'too_many', `${count} selected Kundlis must explain the four-chart focus limit`);
}

const familyEngine = read('packages/astrology/src/familyKarmaMap.ts');
[
  'evaluateFamilyComparisonEligibility(members.length)',
  'if (!eligibility.allowed)',
  'Too many Kundlis are selected for one Family Vault comparison.',
  'Your selected Kundlis are preserved.',
  'Predicta blocks 5+ chart comparisons',
].forEach(fragment => assertIncludes(familyEngine, fragment, 'family karma map engine eligibility'));

const deterministicChat = read('packages/astrology/src/predictaChatActions.ts');
[
  'evaluateFamilyComparisonEligibility(familyKundlis.length)',
  'getFamilyComparisonEligibilityMessage(familyEligibility)',
  "action === 'family-map'",
].forEach(fragment => assertIncludes(deterministicChat, fragment, 'deterministic chat family eligibility'));

const webFamily = read('apps/web/app/dashboard/family/page.tsx');
[
  'updateWebKundliFamilyRelationship',
  'FAMILY_RELATIONSHIP_ORDER',
  'getFamilyRelationshipLabel',
  'Assign saved Kundlis',
  'disabled={profile.isOwnerProfile}',
  'Family Vault uses these labels for comparison context',
].forEach(fragment => assertIncludes(webFamily, fragment, 'web Family Vault assignment'));

const webMap = read('apps/web/components/WebFamilyKarmaMap.tsx');
[
  'FAMILY_COMPARISON_MIN_KUNDLIS',
  'FAMILY_COMPARISON_MAX_KUNDLIS',
  'evaluateFamilyComparisonEligibility',
  'getFamilyComparisonEligibilityMessage',
  'disabled={!selected && selectedIds.length >= FAMILY_COMPARISON_MAX_KUNDLIS}',
  'comparisonEligibility.allowed && map.status ===',
  'return current.filter(id => id !== profile.id);',
].forEach(fragment => assertIncludes(webMap, fragment, 'web Family Karma Map 2-4 selection'));

const mobileFamily = read('apps/mobile/src/screens/FamilyKarmaMapScreen.tsx');
[
  'FAMILY_COMPARISON_MIN_KUNDLIS',
  'FAMILY_COMPARISON_MAX_KUNDLIS',
  'evaluateFamilyComparisonEligibility',
  'getFamilyComparisonEligibilityMessage',
  'selectedIds.length >= FAMILY_COMPARISON_MAX_KUNDLIS',
  'familyEligibility.allowed && familyMap.status ===',
  'Included in comparison',
  'Limit is 4 Kundlis',
].forEach(fragment => assertIncludes(mobileFamily, fragment, 'mobile Family Vault 2-4 selection parity'));

console.log(
  'Monetization Phase 7 Family Vault gate passed: saved Kundli assignment and 2-4 comparison limits are locked across web, mobile, engine, and deterministic chat.',
);
