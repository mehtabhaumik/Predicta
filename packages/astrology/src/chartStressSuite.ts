import { getNativeCopy } from '@pridicta/config';
import type { BirthDetails, ChartData, PlanetPosition } from '@pridicta/types';
import {
  buildChartRenderModel,
  findNorthIndianHouseAtPoint,
  NORTH_INDIAN_CHART_LINE_PATHS,
  NORTH_INDIAN_HOUSE_POSITIONS,
} from './chartLayout';

export type ChartStressSuiteResult = {
  cases: Array<{
    message?: string;
    name: string;
    passed: boolean;
  }>;
  passed: boolean;
};

const SIGNS = [
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
] as const;

const BASE_BIRTH_DETAILS: BirthDetails = {
  date: '1980-08-22',
  latitude: 22.47,
  longitude: 72.8,
  name: 'Bhaumik Mehta',
  place: 'Petlad, Gujarat, India',
  time: '06:30',
  timezone: 'Asia/Kolkata',
};

const BHAUMIK_D1_EXPECTED_HOUSES: Record<number, string[]> = {
  1: ['Sun', 'Jupiter', 'Mercury'],
  2: ['Saturn'],
  3: ['Mars'],
  4: [],
  5: ['Moon'],
  6: ['Ketu'],
  7: [],
  8: [],
  9: [],
  10: [],
  11: ['Venus'],
  12: ['Rahu'],
};

const BHAUMIK_CHALIT_EXPECTED_HOUSES: Record<number, string[]> = {
  1: ['Sun', 'Rahu', 'Mercury'],
  2: ['Saturn', 'Jupiter'],
  3: ['Mars'],
  4: [],
  5: ['Moon'],
  6: [],
  7: ['Ketu'],
  8: [],
  9: [],
  10: [],
  11: ['Venus'],
  12: [],
};

const BHAUMIK_D1_EXPECTED_SIGNS: Record<number, string> = {
  1: 'Leo',
  2: 'Virgo',
  3: 'Libra',
  4: 'Scorpio',
  5: 'Sagittarius',
  6: 'Capricorn',
  7: 'Aquarius',
  8: 'Pisces',
  9: 'Aries',
  10: 'Taurus',
  11: 'Gemini',
  12: 'Cancer',
};

export function runChartStressSuite(): ChartStressSuiteResult {
  const checks = [
    stressCase('north Indian line geometry has no center cross', assertLineGeometry),
    stressCase('house hit map resolves every house center', assertHouseHitMap),
    stressCase('Bhaumik D1 planets stay in expected houses', assertBhaumikD1),
    stressCase('Bhaumik D1 signs stay in expected houses', assertBhaumikD1Signs),
    stressCase(
      'major chart surfaces keep three-planet compact houses visible',
      assertMajorSurfacesKeepThreePlanetCompactHousesVisible,
    ),
    stressCase(
      'full chart surfaces preserve degree labels even in compact and stacked houses',
      assertFullSurfacePreservesDegreesOnCrowdedHouses,
    ),
    stressCase(
      'compact overflow prioritizes Rahu and Ketu when a surface must truncate',
      assertNodePriorityOnCompactOverflow,
    ),
    stressCase('default Vedic D1 hides outer and subtle supporting points', assertDefaultVedicD1HidesSupportingPoints),
    stressCase('full Vedic D1 can still expose supporting points when asked', assertFullVedicD1KeepsSupportingPoints),
    stressCase('Chalit renderer respects explicit house delivery', assertBhaumikChalit),
    ...[2, 6, 8, 11, 12].map(house =>
      stressCase(`7 planets stay bounded in tight house ${house}`, () =>
        assertSevenPlanetHouseStress(house),
      ),
    ),
  ];

  return {
    cases: checks,
    passed: checks.every(item => item.passed),
  };
}

function stressCase(name: string, assertion: () => void): ChartStressSuiteResult['cases'][number] {
  try {
    assertion();
    return {
      name,
      passed: true,
    };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : String(error),
      name,
      passed: false,
    };
  }
}

function assertLineGeometry(): void {
  assertEqual(
    [...NORTH_INDIAN_CHART_LINE_PATHS],
    [
      'M0 0 H100 V100 H0 Z',
      'M0 0 L100 100',
      'M100 0 L0 100',
      'M50 0 L100 50 L50 100 L0 50 Z',
    ],
    'North Indian chart lines must be outer rectangle, X, and diamond only.',
  );

  assert(
    !(NORTH_INDIAN_CHART_LINE_PATHS as readonly string[]).some(
      path => path === 'M50 0 L50 100' || path === 'M0 50 L100 50',
    ),
    'North Indian chart must not include center vertical or horizontal cross lines.',
  );
}

function assertHouseHitMap(): void {
  for (const [houseText, position] of Object.entries(NORTH_INDIAN_HOUSE_POSITIONS)) {
    const house = Number(houseText);
    const found = findNorthIndianHouseAtPoint(position.x, position.y);
    assert(
      found === house,
      `House hit map expected ${house} at ${position.x},${position.y}, received ${found ?? 'none'}.`,
    );
  }
}

function assertBhaumikD1(): void {
  const chart = makeBhaumikD1Chart();
  const renderModel = buildChartRenderModel({
    birthDetails: BASE_BIRTH_DETAILS,
    chart,
  });

  assert(renderModel.geometry === 'north-indian', 'D1 chart must render as North Indian geometry.');
  assert(renderModel.theme === 'sunrise', '06:30 birth time must render with sunrise chart theme.');
  assertChartLabelsResolveInsideHouses(renderModel);

  for (const [houseText, expectedPlanets] of Object.entries(BHAUMIK_D1_EXPECTED_HOUSES)) {
    const house = Number(houseText);
    const cell = renderModel.cells.find(item => item.house === house);
    assert(cell !== undefined, `Missing chart cell for house ${house}.`);
    assertEqual(
      [...cell.renderPlanets.map(planet => planet.name)].sort(),
      [...expectedPlanets].sort(),
      `House ${house} planet placement is wrong.`,
    );
  }
}

function assertBhaumikD1Signs(): void {
  const chart = makeBhaumikD1Chart();
  const renderModel = buildChartRenderModel({
    birthDetails: BASE_BIRTH_DETAILS,
    chart,
  });

  for (const [houseText, expectedSign] of Object.entries(BHAUMIK_D1_EXPECTED_SIGNS)) {
    const house = Number(houseText);
    const cell = renderModel.cells.find(item => item.house === house);
    assert(cell !== undefined, `Missing chart cell for house ${house}.`);
    assert(cell.sign === expectedSign, `House ${house} sign expected ${expectedSign}, received ${cell.sign}.`);
  }
}

function assertMajorSurfacesKeepThreePlanetCompactHousesVisible(): void {
  const chart = makeChart({
    ascendantSign: 'Leo',
    chartType: 'D1',
    name: 'Compact three-planet visibility',
    planets: [
      makePlanet({ absoluteLongitude: 90.9, degree: 0.9, house: 12, name: 'Mercury', sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 95.5, degree: 5.5, house: 12, name: 'Sun', sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 116.6, degree: 26.6, house: 12, name: 'Rahu', retrograde: true, sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 296.6, degree: 26.6, house: 6, name: 'Ketu', retrograde: true, sign: 'Capricorn' }),
    ],
  });

  for (const presentation of ['main', 'charts', 'creation', 'full', 'report'] as const) {
    const renderModel = buildChartRenderModel({
      birthDetails: BASE_BIRTH_DETAILS,
      chart,
      presentation,
      school: 'KP',
    });
    const cell = renderModel.cells.find(item => item.house === 12);

    assert(cell !== undefined, `Missing compact-visibility cell for presentation ${presentation}.`);
    assertEqual(
      cell.renderPlanets.map(planet => planet.name),
      ['Mercury', 'Sun', 'Rahu'],
      `${presentation} should keep all three KP house planets visible in a compact house.`,
    );
    assert(
      cell.hiddenPlanetCount === 0,
      `${presentation} should not hide a third classical graha behind overflow in the compact house.`,
    );
  }
}

function assertNodePriorityOnCompactOverflow(): void {
  const chart = makeChart({
    ascendantSign: 'Leo',
    chartType: 'D1',
    name: 'Compact overflow priority',
    planets: [
      makePlanet({ absoluteLongitude: 90.9, degree: 0.9, house: 12, name: 'Mercury', sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 95.5, degree: 5.5, house: 12, name: 'Sun', sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 102.4, degree: 12.4, house: 12, name: 'Jupiter', sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 116.6, degree: 26.6, house: 12, name: 'Rahu', retrograde: true, sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 296.6, degree: 26.6, house: 6, name: 'Ketu', retrograde: true, sign: 'Capricorn' }),
    ],
  });

  const renderModel = buildChartRenderModel({
    birthDetails: BASE_BIRTH_DETAILS,
    chart,
    presentation: 'report',
    school: 'KP',
  });
  const cell = renderModel.cells.find(item => item.house === 12);

  assert(cell !== undefined, 'Missing overflow-priority cell for report presentation.');
  assertEqual(
    cell.renderPlanets.slice(0, cell.maxVisiblePlanets).map(planet => planet.name),
    ['Rahu', 'Sun'],
    'When report must truncate a crowded KP house, Rahu should stay visible ahead of repeated classical planets.',
  );
  assert(
    cell.hiddenPlanetCount === 2,
    'Crowded KP report houses should still disclose the remaining hidden planet count accurately.',
  );
}

function assertFullSurfacePreservesDegreesOnCrowdedHouses(): void {
  const chart = makeChart({
    ascendantSign: 'Leo',
    chartType: 'D1',
    name: 'Full dialog detail check',
    planets: [
      makePlanet({ absoluteLongitude: 90.9, degree: 0.9, house: 12, name: 'Mercury', sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 95.5, degree: 5.5, house: 12, name: 'Sun', sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 102.4, degree: 12.4, house: 12, name: 'Jupiter', sign: 'Cancer' }),
      makePlanet({ absoluteLongitude: 116.6, degree: 26.6, house: 12, name: 'Rahu', retrograde: true, sign: 'Cancer' }),
    ],
  });

  const renderModel = buildChartRenderModel({
    birthDetails: BASE_BIRTH_DETAILS,
    chart,
    presentation: 'full',
    school: 'KP',
  });
  const cell = renderModel.cells.find(item => item.house === 12);

  assert(cell !== undefined, 'Missing full-surface crowded house cell.');
  assert(cell.showPlanetDegrees, 'Full chart surface must keep degree labels visible in crowded houses.');
  assert(cell.showPlanetStatusMarks, 'Full chart surface must keep status marks visible in crowded houses.');
  assertEqual(
    cell.renderPlanets.map(planet => planet.degreeLabel),
    ['0.9°', '5.5°', '12.4°', '26.6°'],
    'Full chart surface should keep degree labels for every visible planet in crowded houses.',
  );
  assert(
    cell.hiddenPlanetCount === 0,
    'Full chart surface should not hide crowded-house planets behind overflow chips.',
  );
}

function assertDefaultVedicD1HidesSupportingPoints(): void {
  const chart = makeChart({
    ascendantSign: 'Leo',
    chartType: 'D1',
    name: 'Rashi Chart',
    planets: [
      makePlanet({ absoluteLongitude: 125.5, degree: 5.5, house: 1, name: 'Sun', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 126.5, degree: 6.5, house: 1, kind: 'modern', name: 'Uranus', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 127.5, degree: 7.5, house: 1, kind: 'sensitive', name: 'Dhuma', sign: 'Leo' }),
    ],
  });
  const renderModel = buildChartRenderModel({
    birthDetails: BASE_BIRTH_DETAILS,
    chart,
  });
  const cell = renderModel.cells.find(item => item.house === 1);

  assert(cell !== undefined, 'Missing D1 test cell for house 1.');
  assertEqual(
    cell.renderPlanets.map(planet => planet.name),
    ['Sun'],
    'Default Vedic D1 should keep only core grahas in the primary layer.',
  );
  assertEqual(
    cell.supportingPoints.map(planet => planet.name),
    ['Uranus', 'Dhuma'],
    'Supporting points must move into the secondary layer instead of disappearing.',
  );
  assert(
    !renderModel.legend.some(item => /outer|upagraha/i.test(item.description)),
    'Default Vedic D1 legend must not advertise hidden supporting layers.',
  );
}

function assertFullVedicD1KeepsSupportingPoints(): void {
  const chart = makeChart({
    ascendantSign: 'Leo',
    chartType: 'D1',
    name: 'Rashi Chart',
    planets: [
      makePlanet({ absoluteLongitude: 125.5, degree: 5.5, house: 1, name: 'Sun', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 126.5, degree: 6.5, house: 1, kind: 'modern', name: 'Uranus', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 127.5, degree: 7.5, house: 1, kind: 'sensitive', name: 'Dhuma', sign: 'Leo' }),
    ],
  });
  const renderModel = buildChartRenderModel({
    birthDetails: BASE_BIRTH_DETAILS,
    chart,
    presentation: 'full',
  });
  const cell = renderModel.cells.find(item => item.house === 1);

  assert(cell !== undefined, 'Missing full-presentation D1 test cell for house 1.');
  assertEqual(
    cell.renderPlanets.map(planet => planet.name),
    ['Sun', 'Uranus', 'Dhuma'],
    'Full D1 presentation should retain supporting points when an advanced surface asks for them.',
  );
  assert(
    renderModel.legend.some(item =>
      [
        'outer',
        getNativeCopy('native.packages.astrology.src.chartStressSuite.outer.hi'),
        getNativeCopy('native.packages.astrology.src.chartStressSuite.outer.gu'),
      ].some(term => item.code.toLowerCase().includes(term.toLowerCase())),
    ),
    'Full D1 presentation should restore the outer-planet legend when modern points are visible.',
  );
}

function assertBhaumikChalit(): void {
  const chart = makeBhaumikChalitChart();
  const renderModel = buildChartRenderModel({
    birthDetails: BASE_BIRTH_DETAILS,
    chart,
  });

  assert(renderModel.geometry === 'north-indian', 'Chalit chart must render as North Indian geometry.');
  assertChartLabelsResolveInsideHouses(renderModel);

  for (const [houseText, expectedPlanets] of Object.entries(BHAUMIK_CHALIT_EXPECTED_HOUSES)) {
    const house = Number(houseText);
    const cell = renderModel.cells.find(item => item.house === house);
    assert(cell !== undefined, `Missing Chalit chart cell for house ${house}.`);
    assertEqual(
      [...cell.renderPlanets.map(planet => planet.name)].sort(),
      [...expectedPlanets].sort(),
      `Chalit house ${house} planet placement is wrong.`,
    );
  }
}

function assertSevenPlanetHouseStress(house: number): void {
  const ascendantIndex = 4; // Leo
  const sign = SIGNS[(ascendantIndex + house - 1) % 12];
  const planets = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ].map((name, index) =>
    makePlanet({
      absoluteLongitude: SIGNS.indexOf(sign) * 30 + index * 3.25 + 0.5,
      degree: index * 3.25 + 0.5,
      house,
      name,
      retrograde: index % 3 === 0,
      sign,
    }),
  );
  const chart = makeChart({
    ascendantSign: 'Leo',
    chartType: 'D1',
    name: `Stress house ${house}`,
    planets,
  });
  const renderModel = buildChartRenderModel({
    birthDetails: BASE_BIRTH_DETAILS,
    chart,
  });
  assertChartLabelsResolveInsideHouses(renderModel);
  const stressedCell = renderModel.cells.find(item => item.house === house);

  assert(stressedCell !== undefined, `Missing stress cell for house ${house}.`);
  assert(stressedCell.renderPlanets.length === 7, `House ${house} must keep all 7 stress planets.`);
  assert(stressedCell.labelDensity === 'stacked', `House ${house} must switch to stacked label density.`);
  assert(stressedCell.hasManyPlanets, `House ${house} must be marked as many-planets.`);
  assert(
    stressedCell.renderPlanets.every(planet => planet.sign === sign),
    `House ${house} stress planets must keep the ${sign} sign.`,
  );
  assertEqual(
    stressedCell.renderPlanets.map(planet => planet.degreeLabel),
    ['0.5°', '3.8°', '7.0°', '10.3°', '13.5°', '16.8°', '20.0°'],
    `House ${house} stress planets must be sorted by degree.`,
  );
}

function assertChartLabelsResolveInsideHouses(
  renderModel: ReturnType<typeof buildChartRenderModel>,
): void {
  for (const cell of renderModel.cells) {
    const resolvedHouse = findNorthIndianHouseAtPoint(cell.x, cell.y);
    assert(
      resolvedHouse === cell.house,
      `House ${cell.house} label anchor ${cell.x},${cell.y} resolves to ${resolvedHouse ?? 'none'}.`,
    );
  }
}

function makeBhaumikD1Chart(): ChartData {
  return makeChart({
    ascendantSign: 'Leo',
    chartType: 'D1',
    name: 'Rashi Chart',
    planets: [
      makePlanet({ absoluteLongitude: 125.5, degree: 5.5, house: 1, name: 'Sun', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 142.4, degree: 22.4, house: 1, name: 'Jupiter', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 120.9, degree: 0.9, house: 1, name: 'Mercury', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 150.8, degree: 0.8, house: 2, name: 'Saturn', sign: 'Virgo' }),
      makePlanet({ absoluteLongitude: 181.8, degree: 1.8, house: 3, name: 'Mars', sign: 'Libra' }),
      makePlanet({ absoluteLongitude: 251.8, degree: 11.8, house: 5, name: 'Moon', sign: 'Sagittarius' }),
      makePlanet({ absoluteLongitude: 296.6, degree: 26.6, house: 6, name: 'Ketu', sign: 'Capricorn', retrograde: true }),
      makePlanet({ absoluteLongitude: 79.8, degree: 19.8, house: 11, name: 'Venus', sign: 'Gemini' }),
      makePlanet({ absoluteLongitude: 116.6, degree: 26.6, house: 12, name: 'Rahu', sign: 'Cancer', retrograde: true }),
    ],
  });
}

function makeBhaumikChalitChart(): ChartData {
  return makeChart({
    ascendantSign: 'Leo',
    chartType: 'D1',
    name: 'Parashari Chalit Chart',
    planets: [
      makePlanet({ absoluteLongitude: 125.5, degree: 5.5, house: 1, name: 'Sun', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 142.4, degree: 22.4, house: 2, name: 'Jupiter', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 120.9, degree: 0.9, house: 1, name: 'Mercury', sign: 'Leo' }),
      makePlanet({ absoluteLongitude: 150.8, degree: 0.8, house: 2, name: 'Saturn', sign: 'Virgo' }),
      makePlanet({ absoluteLongitude: 181.8, degree: 1.8, house: 3, name: 'Mars', sign: 'Libra' }),
      makePlanet({ absoluteLongitude: 251.8, degree: 11.8, house: 5, name: 'Moon', sign: 'Sagittarius' }),
      makePlanet({ absoluteLongitude: 296.6, degree: 26.6, house: 7, name: 'Ketu', sign: 'Capricorn', retrograde: true }),
      makePlanet({ absoluteLongitude: 79.8, degree: 19.8, house: 11, name: 'Venus', sign: 'Gemini' }),
      makePlanet({ absoluteLongitude: 116.6, degree: 26.6, house: 1, name: 'Rahu', sign: 'Cancer', retrograde: true }),
    ],
  });
}

function makeChart({
  ascendantSign,
  chartType,
  name,
  planets,
}: {
  ascendantSign: string;
  chartType: ChartData['chartType'];
  name: string;
  planets: PlanetPosition[];
}): ChartData {
  const signPlacements = Object.fromEntries(SIGNS.map(sign => [sign, [] as string[]]));
  const housePlacements = Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => [index + 1, [] as string[]]),
  ) as Record<number, string[]>;

  for (const planet of planets) {
    signPlacements[planet.sign]?.push(planet.name);
    housePlacements[planet.house]?.push(planet.name);
  }

  return {
    ascendantSign,
    chartType,
    housePlacements,
    name,
    planetDistribution: planets,
    signPlacements,
    supported: true,
  };
}

function makePlanet({
  absoluteLongitude,
  degree,
  house,
  kind = 'classical',
  name,
  retrograde = false,
  sign,
}: {
  absoluteLongitude: number;
  degree: number;
  house: number;
  kind?: PlanetPosition['kind'];
  name: string;
  retrograde?: boolean;
  sign: string;
}): PlanetPosition {
  return {
    absoluteLongitude,
    degree,
    house,
    kind,
    nakshatra: 'Test Nakshatra',
    name,
    pada: 1,
    retrograde,
    sign,
  };
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${message}\nExpected: ${expectedJson}\nReceived: ${actualJson}`);
  }
}
