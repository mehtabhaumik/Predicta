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
  D13: 'subtle support lens',
  D15: 'character refinement lens',
  D16: 'comfort and lifestyle lens',
  D17: 'influence and success-strength lens',
  D18: 'inner-conflict correction lens',
  D19: 'fulfillment and subtle prosperity lens',
  D20: 'spiritual practice lens',
  D21: 'karmic-pressure lens',
  D22: 'protection and resilience lens',
  D23: 'mental steadiness lens',
  D24: 'education and learning lens',
  D25: 'inner endurance lens',
  D26: 'correction-point lens',
  D27: 'strength and resilience lens',
  D28: 'hidden adversity lens',
  D29: 'subtle gains lens',
  D30: 'stress and protection lens',
  D31: 'vulnerability and purification lens',
  D32: 'endurance under strain lens',
  D33: 'refined fortune lens',
  D34: 'nuanced karmic texture lens',
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
  D13: 'D13 refines subtle comforts, quiet supports, and finer material help. Keep it secondary to D4 and D16.',
  D15: 'D15 refines character texture, subtle fortune, and inward polish. Read it with D1 and D9 rather than as a standalone destiny chart.',
  D16: 'D16 refines comforts, vehicles, lifestyle ease, and enjoyment. It is not a full life chart.',
  D17: 'D17 refines influence and fine-grained success strength. Use it to support D10, not replace it.',
  D18: 'D18 refines hidden weakness and inner conflict. Keep the language gentle, corrective, and bounded.',
  D19: 'D19 refines fulfillment, subtle prosperity, and spiritual satisfaction. Read it with D9 and D20 context.',
  D20: 'D20 refines sadhana, devotion, mantra, and inner discipline. Read it with D1 9th/12th and Jupiter/Ketu.',
  D21: 'D21 is a narrow karmic-pressure lens. It needs careful restraint and should never be treated as a dramatic fate chart.',
  D22: 'D22 refines resilience, protection, and vulnerability. Keep the reading practical and non-fatalistic.',
  D23: 'D23 refines subtle support, steadiness, and judgement balance. It works quietly and should stay secondary to D1.',
  D24: 'D24 refines education, study discipline, knowledge, and teachers. Read it with D1 4th/5th/9th.',
  D25: 'D25 refines inner endurance, spiritual strength, and disciplined merit. Read it with D20 and D27 support.',
  D26: 'D26 refines discomfort and correction points. It should help adjustment, not trigger harsh over-reading.',
  D27: 'D27 refines physical and mental strength, endurance, and resilience.',
  D28: 'D28 refines hidden adversity and restraint. Keep the reading cautious, practical, and free of fear language.',
  D29: 'D29 refines subtle gains and unseen support. Use it as a quiet support lens rather than a headline chart.',
  D30: 'D30 refines stress, pressure signatures, and protection needs. Keep the language careful, bounded, and non-fatalistic.',
  D31: 'D31 refines vulnerability and purification themes. Read it as a subtle correction layer, not a dramatic outcome chart.',
  D32: 'D32 refines endurance under strain, hardship pacing, and effort distribution.',
  D33: 'D33 refines subtle fortune and outcome quality. It needs timing context to matter.',
  D34: 'D34 refines nuanced karmic texture and fine correction themes. Treat it as a cautious background layer.',
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
