import type { ChartType } from '@pridicta/types';

const D1_HOUSE_MEANINGS: Record<number, string> = {
  1: 'self, body, identity',
  2: 'money, speech, family values',
  3: 'effort, courage, siblings',
  4: 'home, mother, emotional base',
  5: 'children, learning, merit',
  6: 'work pressure, health discipline',
  7: 'marriage, partners, contracts',
  8: 'change, secrets, transformation',
  9: 'fortune, dharma, teachers',
  10: 'career, status, responsibility',
  11: 'gains, network, ambitions',
  12: 'sleep, expense, release',
};

const CHART_ROLES: Partial<Record<ChartType, string>> = {
  D1: 'main life chart',
  D2: 'money and nourishment lens',
  D3: 'effort and courage lens',
  D4: 'home and rootedness lens',
  D5: 'authority and merit lens',
  D6: 'obstacle and service lens',
  D7: 'children and legacy lens',
  D8: 'hidden pressure and transformation lens',
  D9: 'marriage and dharma lens',
  D10: 'career and public-work lens',
  D11: 'gains and fulfillment lens',
  D12: 'parents and lineage lens',
  D16: 'comfort and lifestyle lens',
  D20: 'spiritual practice lens',
  D24: 'education and learning lens',
  D27: 'strength and resilience lens',
  D30: 'stress and protection lens',
  D40: 'maternal lineage lens',
  D45: 'paternal lineage lens',
  D60: 'deep karmic texture lens',
};

const VARGA_READING_NOTES: Partial<Record<ChartType, string>> = {
  D2: 'D2 is Hora: a focused money, nourishment, and resource-handling chart. Use it to judge financial temperament and sustenance, not as a general life chart.',
  D3: 'D3 is Drekkana: a focused courage, effort, siblings, and stamina chart. Read it with D1 3rd-house context.',
  D4: 'D4 refines home, property, residence, and emotional anchoring. Read it with D1 4th-house context.',
  D5: 'D5 is a focused authority, merit, and recognition lens. Do not turn it into a full general-life chart.',
  D6: 'D6 refines obstacles, service, competition, and health discipline. It needs D1 and dasha support before prediction.',
  D7: 'D7 refines children, creativity, fertility themes, and legacy. Read it with D1 5th-house context.',
  D8: 'D8 is a narrow hidden-pressure and transformation lens. It needs careful, non-fearful reading.',
  D9: 'D9 is Navamsha: dharma, marriage maturity, fortune, and deeper planet strength. Read it with D1 and lived maturity, never alone.',
  D10: 'D10 is Dashamsha: career, public work, authority, and contribution. Read it with D1 10th-house context.',
  D11: 'D11 refines gains, networks, and fulfillment patterns. Read it as a focused result lens.',
  D12: 'D12 refines parents, ancestry, and lineage patterns. Read it with D1 4th/9th and family indicators.',
  D16: 'D16 refines comforts, vehicles, lifestyle ease, and enjoyment. It is not a full life chart.',
  D20: 'D20 refines sadhana, devotion, mantra, and inner discipline. Read it with D1 9th/12th and Jupiter/Ketu.',
  D24: 'D24 refines education, study discipline, knowledge, and teachers. Read it with D1 4th/5th/9th.',
  D27: 'D27 refines physical and mental strength, endurance, and resilience.',
  D30: 'D30 refines stress, pressure signatures, and protection needs. Keep the language careful, bounded, and non-fatalistic.',
  D40: 'D40 refines maternal lineage and inherited auspiciousness.',
  D45: 'D45 refines paternal lineage, character, honor, and family merit.',
  D60: 'D60 is a deep karmic texture chart and needs a very accurate birth time. Treat it as careful premium-level confirmation, not casual prediction.',
};

export function getChartRole(chartType: ChartType): string {
  return CHART_ROLES[chartType] ?? 'focused divisional lens';
}

export function getChartReadingNote(chartType: ChartType): string {
  if (chartType === 'D1') {
    return 'D1 is the root chart. Houses can be read with standard house meanings, then refined by dasha, gochar, strength, and divisional support.';
  }

  return (
    VARGA_READING_NOTES[chartType] ??
    'This varga is a focused divisional confirmation chart. Read it through its specific purpose and D1 anchor, not as a standalone general Kundli.'
  );
}

export function getChartFocusLabel(chartType: ChartType, house?: number): string {
  if (chartType === 'D1') {
    return house ? D1_HOUSE_MEANINGS[house] ?? 'selected life area' : 'selected life area';
  }

  return getChartReadingNote(chartType);
}

export function shouldUseStandardHouseMeaning(chartType: ChartType): boolean {
  return chartType === 'D1';
}
