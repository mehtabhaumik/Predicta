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
  'docs/audits/PREDICTA_JAIMINI_PHASE_2_DETERMINISTIC_CALCULATION_DATA_CONTRACT',
);
const { composeJaiminiPlan } = require('../packages/astrology/src/jaiminiPlan.ts');

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

const fixtures = [
  buildFixture({
    date: '1980-08-22',
    id: 'phase2-jaimini-leo',
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
    id: 'phase2-jaimini-scorpio',
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
    id: 'phase2-jaimini-gemini',
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

const results = fixtures.map(fixture => ({
  id: fixture.id,
  plan: composeJaiminiPlan(fixture, { asOfDate: '2026-06-01' }),
}));

for (const { id, plan } of results) {
  assert.equal(plan.contractVersion, 'jaimini-phase-2-v1', `${id}: contract version`);
  assert.equal(plan.calculationStatus, 'ready', `${id}: complete fixture should be ready`);
  assert.equal(plan.charaKarakas.length, 7, `${id}: seven Chara Karakas`);
  assert.deepEqual(
    plan.charaKarakas.map(item => item.role),
    [
      'Atmakaraka',
      'Amatyakaraka',
      'Bhratrikaraka',
      'Matrikaraka',
      'Putrakaraka',
      'Gnatikaraka',
      'Darakaraka',
    ],
    `${id}: karaka role order`,
  );
  assert.ok(plan.atmakaraka?.planet, `${id}: Atmakaraka present`);
  assert.ok(plan.amatyakaraka?.planet, `${id}: Amatyakaraka present`);
  assert.ok(plan.darakaraka?.planet, `${id}: Darakaraka present`);
  assert.equal(plan.swamsa.calculationStatus, 'ready', `${id}: Swamsa ready`);
  assert.equal(plan.karakamsha.calculationStatus, 'ready', `${id}: Karakamsha ready`);
  assert.equal(plan.arudhaLagna.calculationStatus, 'ready', `${id}: Arudha ready`);
  assert.equal(plan.upapadaLagna.calculationStatus, 'ready', `${id}: Upapada ready`);
  assert.equal(plan.jaiminiAspects.length, 12, `${id}: sign aspects for all signs`);
  assert.equal(plan.charaDashaTimeline.length, 12, `${id}: Chara Dasha timeline`);
  assert.ok(plan.currentCharaDasha?.sign, `${id}: current Chara Dasha`);
  assert.match(plan.freeInsight, /Atmakaraka|Jaimini/, `${id}: free insight uses calculated evidence`);
  assert.match(plan.premiumInsight, /Atmakaraka|Amatyakaraka|Darakaraka/, `${id}: premium insight uses calculated evidence`);
}

const distinctEvidenceKeys = new Set(
  results.map(({ plan }) => [
    plan.atmakaraka?.planet,
    plan.atmakaraka?.sign,
    plan.arudhaLagna.padaSign,
    plan.upapadaLagna.padaSign,
    plan.currentCharaDasha?.sign,
  ].join('|')),
);
assert.equal(distinctEvidenceKeys.size, results.length, 'three fixtures produce distinct Jaimini evidence keys');

const timelineSignatures = new Set(
  results.map(({ plan }) => plan.charaDashaTimeline.map(item => `${item.sign}:${item.years}`).join(',')),
);
assert.equal(timelineSignatures.size, results.length, 'three fixtures produce distinct Chara Dasha timelines');

const jaiminiSource = readFileSync(
  path.join(repoRoot, 'packages/astrology/src/jaiminiPlan.ts'),
  'utf8',
);
assert.ok(!jaiminiSource.includes('nadiJyotishPlan'), 'Jaimini plan must not import Nadi logic');
assert.ok(jaiminiSource.includes('composeJaiminiPlan'), 'shared Jaimini contract exported');
assert.ok(jaiminiSource.includes('buildCharaKarakas'), 'Chara Karaka builder exists');
assert.ok(jaiminiSource.includes('buildJaiminiSignAspects'), 'Jaimini sign aspect builder exists');
assert.ok(jaiminiSource.includes('buildCharaDashaTimeline'), 'Chara Dasha timeline builder exists');

mkdirSync(phaseRoot, { recursive: true });
writeFileSync(
  path.join(phaseRoot, 'fixture-results.json'),
  JSON.stringify(
    results.map(({ id, plan }) => ({
      arudhaLagna: plan.arudhaLagna.padaSign,
      atmakaraka: plan.atmakaraka,
      calculationStatus: plan.calculationStatus,
      currentCharaDasha: plan.currentCharaDasha,
      darakaraka: plan.darakaraka,
      id,
      karakamsha: plan.karakamsha.ascendantSign,
      swamsa: plan.swamsa.ascendantSign,
      timeline: plan.charaDashaTimeline.map(item => ({
        sign: item.sign,
        startAge: item.startAge,
        endAge: item.endAge,
        years: item.years,
      })),
      upapadaLagna: plan.upapadaLagna.padaSign,
      warnings: plan.evidenceWarnings,
    })),
    null,
    2,
  ),
);

console.log('Jaimini Phase 2 gate passed: deterministic contract, three distinct fixtures, no Nadi calculation reuse.');

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
    calculationMeta: { ayanamsa: 'Lahiri', calculatedAt: '2026-06-01T00:00:00Z', engineVersion: 'phase2-test' },
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
