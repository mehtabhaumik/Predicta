import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName =
  'PREDICTA_KUNDLI_KARMA_PHASE_1_CANONICAL_TERMINOLOGY_LOCALIZATION_AND_SAFETY_CONTRACT';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
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
  'Add canonical user-facing terms:',
  'Add translation keys for English, Hindi, and Gujarati.',
  'Add blocked/fear-selling phrase list.',
  'Add approved calm-language phrase list.',
  'Add canonical term gate that rejects user-facing `Dosha` and `Shrapa`.',
  'Add room-boundary copy',
  'Add `Gemini Jyotish` alias copy',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 1 roadmap'));

const translationPath = 'packages/config/src/translations/kundliKarma.json';
assert.ok(existsSync(path.join(repoRoot, translationPath)), 'Kundli Karma translation JSON exists');
const translations = readJson(translationPath);

const languages = ['en', 'hi', 'gu'];
const requiredCanonicalKeys = [
  'dosh',
  'shrap',
  'yog',
  'lalKitab',
  'karmicDebtShrapIndicators',
];

for (const key of requiredCanonicalKeys) {
  assert.ok(translations.canonicalTerms[key], `canonical term exists: ${key}`);
  for (const language of languages) {
    assert.ok(
      translations.canonicalTerms[key][language]?.trim(),
      `${key} has ${language} translation`,
    );
  }
}

assert.equal(translations.canonicalTerms.dosh.en, 'Dosh');
assert.equal(translations.canonicalTerms.shrap.en, 'Shrap');
assert.equal(translations.canonicalTerms.yog.en, 'Yog');
assert.equal(translations.canonicalTerms.lalKitab.en, 'Lal Kitab');
assert.equal(
  translations.canonicalTerms.karmicDebtShrapIndicators.en,
  'Karmic Debt & Shrap Indicators',
);

const copyKeys = Object.keys(translations.copy.en).sort();
for (const language of languages) {
  assert.deepEqual(
    Object.keys(translations.copy[language]).sort(),
    copyKeys,
    `${language} copy key parity`,
  );
  for (const [key, value] of Object.entries(translations.copy[language])) {
    assert.equal(typeof value, 'string', `${language}.${key} is string`);
    assert.ok(value.trim().length > 4, `${language}.${key} is populated`);
  }
}

[
  'you are cursed',
  'guaranteed failure',
  'must buy this remedy',
  'expensive puja is required',
  'this dosh will ruin',
  'this shrap will destroy',
].forEach(phrase =>
  assert.ok(translations.blockedPhrases.includes(phrase), `blocked phrase exists: ${phrase}`),
);

[
  'karmic pressure indicator',
  'calculated evidence suggests',
  'simple dharma-based remedy',
  'one safe remedy at a time',
].forEach(phrase =>
  assert.ok(translations.approvedPhrases.includes(phrase), `approved phrase exists: ${phrase}`),
);

for (const boundary of ['vedic', 'kp', 'jaimini', 'numerology', 'signature', 'lifeAtlas']) {
  assert.ok(translations.roomBoundaries[boundary]?.trim(), `room boundary exists: ${boundary}`);
}

assertIncludes(
  translations.roomBoundaries.kp,
  'must not claim Dosh, Shrap, Yog, or Lal Kitab',
  'KP room boundary',
);
assertIncludes(
  translations.roomBoundaries.jaimini,
  'must not claim Dosh, Shrap, Yog, or Lal Kitab',
  'Jaimini room boundary',
);
assertIncludes(
  translations.aliasRules.geminiJyotish,
  'Jaimini Jyotish',
  'Gemini Jyotish alias',
);
assertIncludes(
  translations.aliasRules.geminiJyotish,
  'AI provider',
  'Gemini provider separation',
);

const helperSource = read('packages/config/src/kundliKarmaLocalization.ts');
[
  'getKundliKarmaCopy',
  'getKundliKarmaTerm',
  'KUNDLI_KARMA_CANONICAL_TERMS',
  'KUNDLI_KARMA_BLOCKED_PHRASES',
  'KUNDLI_KARMA_APPROVED_PHRASES',
  'KUNDLI_KARMA_ROOM_BOUNDARIES',
  'KUNDLI_KARMA_ALIAS_RULES',
  './translations/kundliKarma.json',
].forEach(fragment => assertIncludes(helperSource, fragment, 'Kundli Karma localization helper'));

assertIncludes(
  read('packages/config/src/index.ts'),
  "export * from './kundliKarmaLocalization'",
  'config index exports Kundli Karma localization helper',
);

const localizedUserFacingFiles = [
  translationPath,
  'packages/config/src/kundliKarmaLocalization.ts',
  'docs/audits/PREDICTA_KUNDLI_KARMA_PHASE_0_BASELINE_RESEARCH_AND_SCOPE_LOCK/phase-0-baseline-audit.md',
  'docs/audits/PREDICTA_KUNDLI_KARMA_PHASE_0_BASELINE_RESEARCH_AND_SCOPE_LOCK/redline-ledger.md',
  'docs/audits/PREDICTA_KUNDLI_KARMA_PHASE_0_BASELINE_RESEARCH_AND_SCOPE_LOCK/predicta-intelligence-gap-ledger.md',
];

for (const file of localizedUserFacingFiles) {
  const source = read(file);
  if (file === translationPath) {
    assertIncludes(source, '"Dosh"', 'translation canonical Dosh');
    assertIncludes(source, '"Shrap"', 'translation canonical Shrap');
    assertIncludes(source, '"Yog"', 'translation canonical Yog');
    continue;
  }
  assertNotIncludes(source, 'Dosh Section', `${file} should not invent hardcoded section text`);
}

const forbiddenActiveUserFacing = [
  'Dosha in your Kundli',
  'Shrapa',
  'Yoga in your Kundli',
  'You are cursed',
  'only Premium can save you',
  'Gemini AI Jyotish',
];

const activeFiles = [
  'packages/config/src/translations/kundliKarma.json',
  'packages/config/src/kundliKarmaLocalization.ts',
  'packages/config/src/index.ts',
];

for (const file of activeFiles) {
  const source = read(file);
  for (const fragment of forbiddenActiveUserFacing) {
    assertNotIncludes(source, fragment, `${file} active user-facing copy gate`);
  }
}

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: PASS`,
    '- dedicated Kundli Karma translation JSON exists',
    '- English/Hindi/Gujarati canonical terms and copy are populated',
    '- blocked fear-selling phrase list exists',
    '- approved calm-language phrase list exists',
    '- room-boundary copy exists for Vedic, KP, Jaimini, Numerology, Signature, Life Atlas',
    '- Gemini Jyotish alias resolves to Jaimini Jyotish and separates Gemini AI provider wording',
    '- config helper exports the contract for future app/report/chat phases',
    '',
  ].join('\n'),
);

console.log(
  'Kundli Karma Phase 1 gate passed: canonical terminology, localization, safety, room-boundary, and Gemini/Jaimini alias contract are locked.',
);
