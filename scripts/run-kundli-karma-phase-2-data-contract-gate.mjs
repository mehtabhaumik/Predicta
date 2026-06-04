import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName =
  'PREDICTA_KUNDLI_KARMA_PHASE_2_DETERMINISTIC_DATA_CONTRACT_AND_EVIDENCE_SCHEMA';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), `${label}: forbidden ${fragment}`);
}

const roadmap = read('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md');
[
  phaseName,
  'Add shared TypeScript types for Kundli Karma Intelligence.',
  'Add the rule provenance registry source.',
  'Add deterministic evidence schema.',
  'Add free/paid depth schema.',
  'Add item status, strength, confidence, activation, reduction, remedy, and',
  'Add a no-AI fixture proving local-memory classification can answer from the',
  '`needs_data` output is honest and does not fake a reading.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 2 roadmap'));

const typeSource = read('packages/types/src/astrology.ts');
[
  'export type KundliKarmaModule',
  'export type KundliKarmaItemStatus',
  'export type KundliKarmaStrength',
  'export type KundliKarmaConfidence',
  'export type KundliKarmaEvidence',
  'export type KundliKarmaActivation',
  'export type KundliKarmaReduction',
  'export type KundliKarmaRemedy',
  'export type KundliKarmaCrossReference',
  'export type KundliKarmaItem',
  'export type KundliKarmaRuleProvenance',
  'export type KundliKarmaDepthContract',
  'export type KundliKarmaIntelligence',
  'export type KundliKarmaFixture',
  "generatedBy: 'deterministic_contract'",
  "needs_data",
  "blocked_context",
].forEach(fragment => assertIncludes(typeSource, fragment, 'shared Kundli Karma types'));

const contractPath = 'packages/astrology/src/kundliKarmaContract.ts';
assert.ok(existsSync(path.join(repoRoot, contractPath)), 'Kundli Karma contract source exists');
const contractSource = read(contractPath);
[
  'KUNDLI_KARMA_CONTRACT_VERSION',
  'KUNDLI_KARMA_DEPTH_CONTRACT',
  'KUNDLI_KARMA_SOURCE_REFERENCES',
  'KUNDLI_KARMA_RULE_PROVENANCE',
  'KUNDLI_KARMA_FIXTURES',
  'getKundliKarmaRuleProvenance',
  'getKundliKarmaFixture',
  "generatedBy: 'deterministic_contract'",
  "'contract_fixture'",
  "'pending_engine'",
  "'blocked_context'",
  "'needs_data'",
].forEach(fragment => assertIncludes(contractSource, fragment, 'Kundli Karma contract'));

for (const sourceId of [
  'source-sanatan-jyoti-dosh-report',
  'source-omastrology-yog-analysis',
  'source-shreekundli-yog-guide',
  'source-ishvaram-lal-kitab',
  'source-astrosage-lal-kitab-report',
  'source-astrosage-lal-kitab-pdf',
  'source-onekundli-sample-report',
  'source-lal-kitab-overview',
]) {
  assertIncludes(contractSource, sourceId, `source reference ${sourceId}`);
}

for (const fixture of [
  'fixture-clean-no-alert',
  'fixture-strong-dosh-manglik',
  'fixture-strong-shrap-indicator',
  'fixture-supportive-yog-dhana',
  'fixture-challenging-yog-kemadruma',
  'fixture-lal-kitab-rin-upay',
  'fixture-overlap-shrapit-dedupe',
  'fixture-needs-data-preta-shrap',
  'fixture-no-ai-local-memory',
]) {
  assertIncludes(contractSource, fixture, `fixture exists ${fixture}`);
}

for (const purpose of [
  'clean_no_alert',
  'strong_dosh',
  'strong_shrap_indicator',
  'supportive_yog',
  'challenging_yog',
  'lal_kitab_rin_upay',
  'overlap_dedupe',
  'needs_data',
  'no_ai_local_memory',
]) {
  assertIncludes(contractSource, purpose, `fixture purpose ${purpose}`);
}

[
  'rule-dosh-manglik-kuja',
  'rule-dosh-shrapit',
  'rule-dosh-nadi-compatibility-only',
  'rule-shrap-matru',
  'rule-shrap-preta',
  'rule-yog-dhana',
  'rule-yog-challenging-kemadruma',
  'rule-yog-challenging-shrapit',
  'rule-lal-kitab-rin',
  'rule-lal-kitab-upay',
].forEach(ruleId => assertIncludes(contractSource, ruleId, `rule provenance ${ruleId}`));

assertIncludes(contractSource, 'Nadi Dosh', 'Nadi Dosh rule label');
assertIncludes(
  contractSource,
  'Single-person Kundli Karma must not activate Nadi Dosh.',
  'Nadi Dosh context block',
);
assertIncludes(
  contractSource,
  'Predicta does not give a reading until the missing evidence is available.',
  'needs_data honest output',
);
assertIncludes(
  contractSource,
  'No AI is required when the deterministic Kundli Karma packet is already available.',
  'no AI local memory fixture',
);
assertNotIncludes(contractSource, "generatedBy: 'ai'", 'contract must not be AI-generated');
assertNotIncludes(contractSource, 'You are cursed', 'contract must not use curse language');
assertNotIncludes(contractSource, 'only Premium can save you', 'contract must not fear-sell');

assertIncludes(
  read('packages/astrology/src/index.ts'),
  "export * from './kundliKarmaContract'",
  'astrology package root export',
);

const sharedContext = read('packages/types/src/astrology.ts');
const mobileContext = read('apps/mobile/src/types/astrology.ts');
for (const source of [sharedContext, mobileContext]) {
  assertIncludes(source, 'kundliKarmaIntelligence?: Pick<', 'AI context has Kundli Karma slot');
  assertIncludes(source, 'noAiRequiredFor', 'AI context exposes no-AI deterministic routing hints');
  assertIncludes(source, 'missingData', 'AI context exposes honest missing data');
}

const importChecks = [
  ['packages/pdf/src/index.ts', 'type KundliKarmaIntelligence'],
  ['apps/mobile/src/services/ai/contextBuilder.ts', 'type KundliKarmaIntelligence'],
  ['apps/web/components/WebPridictaChat.tsx', 'type KundliKarmaIntelligence'],
  ['apps/mobile/src/types/astrology.ts', "import type { KundliKarmaIntelligence } from '@pridicta/astrology'"],
];
for (const [file, fragment] of importChecks) {
  assertIncludes(read(file), fragment, `${file} imports same contract`);
}

assertNotIncludes(contractPath, 'packages/pdf', 'contract must not live under PDF');
assertNotIncludes(contractSource, 'PdfSection', 'contract must not be report-only');

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- shared Kundli Karma TypeScript types exist in @pridicta/types',
    '- rule provenance registry exists in @pridicta/astrology',
    '- deterministic evidence, activation, reduction, remedy, cross-reference, free/premium depth, and fixture schemas exist',
    '- all required fixture purposes exist, including needs_data and no_ai_local_memory',
    '- web, mobile, PDF, and Predicta context surfaces can import the same contract',
    '- contract is not report-only and does not claim AI-generated astrology output',
    '',
  ].join('\n'),
);

console.log(
  'Kundli Karma Phase 2 gate passed: deterministic data contract, evidence schema, registry, fixtures, and cross-surface importability are locked.',
);
