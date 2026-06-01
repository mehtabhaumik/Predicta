import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
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
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const phaseRoot = path.join(
  repoRoot,
  'docs/audits/PREDICTA_JAIMINI_PHASE_3_INTERPRETATION_LANGUAGE_AND_PREDICTION_ENGINE',
);
const { composeJaiminiInterpretation } = require('../packages/astrology/src/jaiminiInterpretation.ts');

const SIGN_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const SIGN_LORDS = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

const REQUIRED_BLOCK_IDS = [
  'soul-planet-reading',
  'career-dharma-reading',
  'relationship-mirror-reading',
  'visible-identity-reading',
  'current-destiny-chapter',
  'what-to-focus-on-now',
  'premium-deepening',
  'technical-evidence',
];

const bannedStarts = /^(This means|This system|Jaimini is)\b/i;
const bannedDefinitions = /\bAtmakaraka means soul\b|\bAmatyakaraka means career\b|\bDarakaraka means spouse\b/i;
const hardClaims = /\bguarantee(?:d|s)?\b|\bdefinitely\b|\bfated to\b|\bdeath\b|\bwill happen\b/i;

const fixtures = [
  buildFixture({
    date: '1980-08-22',
    id: 'phase3-jaimini-leo',
    lagna: 'Leo',
    moonSign: 'Sagittarius',
    name: 'Jaimini Fixture Leo',
    planets: [
      ['Sun', 'Leo', 5.5, 125.5],
      ['Moon', 'Sagittarius', 11.8, 251.8],
      ['Mars', 'Libra', 1.8, 181.8],
      ['Mercury', 'Leo', 0.9, 120.9],
      ['Jupiter', 'Leo', 22.4, 142.4],
      ['Venus', 'Gemini', 19.8, 79.8],
      ['Saturn', 'Virgo', 2.7, 152.7],
    ],
  }),
  buildFixture({
    date: '1991-04-11',
    id: 'phase3-jaimini-scorpio',
    lagna: 'Scorpio',
    moonSign: 'Aquarius',
    name: 'Jaimini Fixture Scorpio',
    planets: [
      ['Sun', 'Pisces', 28.1, 358.1],
      ['Moon', 'Aquarius', 4.2, 304.2],
      ['Mars', 'Gemini', 17.6, 77.6],
      ['Mercury', 'Aries', 11.4, 11.4],
      ['Jupiter', 'Cancer', 2.5, 92.5],
      ['Venus', 'Taurus', 25.2, 55.2],
      ['Saturn', 'Capricorn', 19.9, 289.9],
    ],
  }),
  buildFixture({
    date: '2002-12-03',
    id: 'phase3-jaimini-gemini',
    lagna: 'Gemini',
    moonSign: 'Virgo',
    name: 'Jaimini Fixture Gemini',
    planets: [
      ['Sun', 'Scorpio', 17.1, 227.1],
      ['Moon', 'Virgo', 29.4, 179.4],
      ['Mars', 'Libra', 8.8, 188.8],
      ['Mercury', 'Sagittarius', 13.3, 253.3],
      ['Jupiter', 'Cancer', 21.9, 111.9],
      ['Venus', 'Capricorn', 2.1, 272.1],
      ['Saturn', 'Taurus', 27.7, 57.7],
    ],
  }),
];

const outputs = fixtures.map(fixture => ({
  id: fixture.id,
  interpretation: composeJaiminiInterpretation(fixture, { asOfDate: '2026-06-01' }),
}));

for (const { id, interpretation } of outputs) {
  assert.equal(interpretation.calculationStatus, 'ready', `${id}: complete fixture should be ready`);
  assert.ok(interpretation.summary.length > 80, `${id}: user-facing summary has substance`);
  assert.ok(interpretation.premiumSummary.length > 80, `${id}: premium summary has substance`);
  assert.ok(interpretation.freeBlocks.length >= 6, `${id}: free reading blocks present`);
  assert.ok(interpretation.premiumBlocks.length >= 7, `${id}: premium reading blocks present`);
  assert.ok(interpretation.technicalEvidence.length >= 7, `${id}: technical evidence preserved`);

  const ids = new Set(interpretation.blocks.map(block => block.id));
  for (const requiredId of REQUIRED_BLOCK_IDS) {
    assert.ok(ids.has(requiredId), `${id}: missing ${requiredId}`);
  }

  const technicalBlock = interpretation.blocks.find(block => block.id === 'technical-evidence');
  assert.ok(technicalBlock, `${id}: technical evidence block exists`);
  assert.ok(
    technicalBlock.technicalEvidence.some(line => /Atmakaraka|Amatyakaraka|Darakaraka/.test(line)),
    `${id}: technical evidence contains karaka proof`,
  );
  assert.ok(
    !interpretation.freeBlocks.some(block => block.id === 'technical-evidence'),
    `${id}: technical proof does not appear as a main free card`,
  );

  for (const block of interpretation.blocks) {
    const readableParts = [block.headline, block.prediction, block.guidance];
    for (const part of readableParts) {
      assert.doesNotMatch(part, bannedDefinitions, `${id}: no classroom definition in ${block.id}`);
      assert.doesNotMatch(part, hardClaims, `${id}: no hard guarantee/fatalism in ${block.id}`);
    }
  }

  for (const block of interpretation.blocks.filter(block => block.id !== 'technical-evidence')) {
    assert.doesNotMatch(block.headline, bannedStarts, `${id}: headline is not method-first for ${block.id}`);
    assert.doesNotMatch(block.prediction, bannedStarts, `${id}: prediction is not method-first for ${block.id}`);
    assert.ok(
      /Your|Relationships|People|Career|Focus|Premium/.test(block.headline),
      `${id}: ${block.id} starts with user-facing life meaning`,
    );
  }

  const premiumBlock = interpretation.blocks.find(block => block.id === 'premium-deepening');
  assert.equal(premiumBlock?.premiumOnly, true, `${id}: premium deepening is premium-only`);
}

const summarySignatures = new Set(outputs.map(({ interpretation }) => interpretation.summary));
assert.equal(summarySignatures.size, outputs.length, 'fixtures produce distinct Jaimini summaries');

const source = readFileSync(
  path.join(repoRoot, 'packages/astrology/src/jaiminiInterpretation.ts'),
  'utf8',
);
assert.ok(source.includes('composeJaiminiInterpretation'), 'shared interpretation engine exported');
assert.ok(!source.includes('nadiJyotishPlan'), 'interpretation engine must not import Nadi logic');
assert.ok(source.includes('technical-evidence'), 'technical evidence remains explicit and separate');

mkdirSync(phaseRoot, { recursive: true });
writeFileSync(
  path.join(phaseRoot, 'sample-outputs.json'),
  JSON.stringify(
    outputs.map(({ id, interpretation }) => ({
      calculationStatus: interpretation.calculationStatus,
      freeBlocks: interpretation.freeBlocks.map(block => ({
        confidence: block.confidence,
        headline: block.headline,
        id: block.id,
        prediction: block.prediction,
        title: block.title,
      })),
      guardrails: interpretation.guardrails,
      id,
      premiumBlocks: interpretation.premiumBlocks.map(block => ({
        confidence: block.confidence,
        headline: block.headline,
        id: block.id,
        premiumOnly: block.premiumOnly ?? false,
        prediction: block.prediction,
        title: block.title,
      })),
      premiumSummary: interpretation.premiumSummary,
      summary: interpretation.summary,
      technicalEvidence: interpretation.technicalEvidence,
    })),
    null,
    2,
  ),
);

console.log('Jaimini Phase 3 gate passed: prediction-first interpretation, premium depth, and separated technical evidence.');

function buildFixture({ date, id, lagna, moonSign, name, planets }) {
  const houses = buildHouses(lagna);
  const planetPositions = planets.map(([planetName, sign, degree, longitude]) =>
    makePlanet({
      absoluteLongitude: longitude,
      house: houseForSign(lagna, sign),
      name: planetName,
      sign,
      degree,
    }),
  );
  const d9Planets = planetPositions.map((planet, index) => ({
    ...planet,
    house: ((index + 2) % 12) + 1,
    sign: SIGN_ORDER[(SIGN_ORDER.indexOf(planet.sign) + index + 1) % 12],
  }));

  return {
    id,
    birthDetails: {
      date,
      latitude: 23.0225,
      longitude: 72.5714,
      name,
      place: 'Ahmedabad, Gujarat, India',
      time: '06:30',
      timezone: 'Asia/Kolkata',
    },
    lagna,
    moonSign,
    nakshatra: 'Mula',
    planets: planetPositions,
    houses,
    charts: {
      D9: {
        ascendantSign: SIGN_ORDER[(SIGN_ORDER.indexOf(lagna) + 8) % 12],
        chartType: 'D9',
        housePlacements: buildHousePlacements(d9Planets),
        name: 'Navamsa Chart',
        planetDistribution: d9Planets,
        signPlacements: buildSignPlacements(d9Planets),
        supported: true,
      },
    },
    dasha: { current: { mahadasha: 'Venus', antardasha: 'Saturn', pratyantardasha: 'Mercury' } },
    ashtakavarga: {},
    yogas: [],
    calculationMeta: { ayanamsa: 'Lahiri', calculatedAt: '2026-06-01T00:00:00Z', engineVersion: 'phase3-test' },
  };
}

function buildHouses(lagna) {
  const lagnaIndex = SIGN_ORDER.indexOf(lagna);
  return Array.from({ length: 12 }, (_, index) => {
    const sign = SIGN_ORDER[(lagnaIndex + index) % 12];
    return {
      house: index + 1,
      sign,
      lord: SIGN_LORDS[sign],
      planets: [],
    };
  });
}

function houseForSign(lagna, sign) {
  return ((SIGN_ORDER.indexOf(sign) - SIGN_ORDER.indexOf(lagna) + 12) % 12) + 1;
}

function makePlanet({ absoluteLongitude, degree, house, name, sign }) {
  return {
    absoluteLongitude,
    degree,
    house,
    name,
    nakshatra: 'Test Nakshatra',
    pada: Math.max(1, Math.min(4, Math.ceil(degree / 7.5))),
    retrograde: name === 'Saturn',
    sign,
  };
}

function buildHousePlacements(planets) {
  const houses = Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, []]));
  for (const planet of planets) {
    houses[planet.house].push(planet.name);
  }
  return houses;
}

function buildSignPlacements(planets) {
  const signs = Object.fromEntries(SIGN_ORDER.map(sign => [sign, []]));
  for (const planet of planets) {
    signs[planet.sign].push(planet.name);
  }
  return signs;
}
