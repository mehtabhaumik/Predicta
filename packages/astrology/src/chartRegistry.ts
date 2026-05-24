import type {
  ChartConfig,
  ChartType,
  ChartViewHierarchyItem,
  ChartViewMode,
} from '@pridicta/types';

export const CHART_VIEW_HIERARCHY: ChartViewHierarchyItem[] = [
  {
    id: 'insight',
    label: 'Insight View',
    description:
      'Meaning first: what the chart governs, what it is saying, strengths, challenges, affected life areas, current guidance, and free/premium interpretation.',
    default: true,
  },
  {
    id: 'technical',
    label: 'Technical View',
    description:
      'Evidence layer: houses, planets, D1 anchor rule, chart-specific notes, selected house details, and condition proof.',
  },
];

export const CHART_REGISTRY: ChartConfig[] = [
  {
    id: 'D1',
    name: 'Rashi Chart',
    purpose:
      'Primary life blueprint, temperament, body, direction, and visible life themes.',
    category: 'core',
  },
  {
    id: 'D2',
    name: 'Hora Chart',
    purpose:
      'Money temperament, nourishment, family resources, and the way you handle what you earn.',
    category: 'core',
  },
  {
    id: 'D3',
    name: 'Drekkana Chart',
    purpose: 'Courage, initiative, siblings, stamina, and the way effort turns into action.',
    category: 'core',
  },
  {
    id: 'D4',
    name: 'Chaturthamsha Chart',
    purpose:
      'Home, property, rootedness, emotional foundations, and the private base that supports life.',
    category: 'core',
  },
  {
    id: 'D5',
    name: 'Panchamsha Chart',
    purpose:
      'Authority, recognition, creative merit, and leadership expression.',
    category: 'advanced',
  },
  {
    id: 'D6',
    name: 'Shashthamsha Chart',
    purpose:
      'Obstacles, health patterns, service, competition, and resilience.',
    category: 'advanced',
  },
  {
    id: 'D7',
    name: 'Saptamsha Chart',
    purpose:
      'Children, creativity, legacy, fertility themes, and the blessings or duties of what you nurture.',
    category: 'core',
  },
  {
    id: 'D8',
    name: 'Ashtamsha Chart',
    purpose:
      'Sudden changes, longevity themes, hidden pressure, and transformation.',
    category: 'advanced',
  },
  {
    id: 'D9',
    name: 'Navamsha Chart',
    purpose:
      'Marriage, dharma, inner maturity, fortune, and the deeper strength behind planetary promise.',
    category: 'core',
  },
  {
    id: 'D10',
    name: 'Dashamsha Chart',
    purpose:
      'Career, public work, authority, contribution, and the role you are meant to deliver.',
    category: 'core',
  },
  {
    id: 'D11',
    name: 'Rudramsha Chart',
    purpose: 'Gains, networks, ambitions, and the force behind fulfillment.',
    category: 'advanced',
  },
  {
    id: 'D12',
    name: 'Dwadashamsha Chart',
    purpose:
      'Parents, lineage, inherited tendencies, and the family patterns you carry forward.',
    category: 'core',
  },
  {
    id: 'D13',
    name: 'Trayodashamsha Chart',
    purpose: 'Subtle comforts, refinements, and specific material supports.',
    category: 'advanced',
  },
  {
    id: 'D15',
    name: 'Panchadashamsha Chart',
    purpose:
      'Character refinements, auspiciousness, and subtle personal fortune.',
    category: 'advanced',
  },
  {
    id: 'D16',
    name: 'Shodashamsha Chart',
    purpose:
      'Comfort, vehicles, lifestyle ease, emotional enjoyment, and how supported life feels.',
    category: 'core',
  },
  {
    id: 'D17',
    name: 'Saptadashamsha Chart',
    purpose: 'Influence, authority, and fine-grained strength behind success.',
    category: 'advanced',
  },
  {
    id: 'D18',
    name: 'Ashtadashamsha Chart',
    purpose: 'Inner conflicts, hidden weaknesses, and karmic vulnerabilities.',
    category: 'advanced',
  },
  {
    id: 'D19',
    name: 'Ekonavimshamsha Chart',
    purpose:
      'Fulfillment, spiritual tendencies, and subtle prosperity factors.',
    category: 'advanced',
  },
  {
    id: 'D20',
    name: 'Vimshamsha Chart',
    purpose:
      'Spiritual practice, devotion, mantra, inner discipline, and the blessings that support sincere effort.',
    category: 'core',
  },
  {
    id: 'D21',
    name: 'Ekavimshamsha Chart',
    purpose: 'Karmic extremes, deeper fortune, and hidden dharmic pressures.',
    category: 'advanced',
  },
  {
    id: 'D22',
    name: 'Bhamsha Chart',
    purpose: 'Strength, vulnerability, accidents, and protection patterns.',
    category: 'advanced',
  },
  {
    id: 'D23',
    name: 'Akshavedamsha Chart',
    purpose: 'Subtle support, mental steadiness, and refined fortune.',
    category: 'advanced',
  },
  {
    id: 'D24',
    name: 'Chaturvimshamsha Chart',
    purpose: 'Education, learning, teachers, knowledge, and the discipline that turns study into mastery.',
    category: 'core',
  },
  {
    id: 'D25',
    name: 'Panchavimshamsha Chart',
    purpose: 'Spiritual strength, inner endurance, and subtle karmic merit.',
    category: 'advanced',
  },
  {
    id: 'D26',
    name: 'Shadvimshamsha Chart',
    purpose: 'Refined discomforts, emotional friction, and correction points.',
    category: 'advanced',
  },
  {
    id: 'D27',
    name: 'Saptavimshamsha Chart',
    purpose: 'Physical and mental strength, vitality, courage, and stamina.',
    category: 'advanced',
  },
  {
    id: 'D28',
    name: 'Ashtavimshamsha Chart',
    purpose: 'Hidden adversity, restraint, and deep karmic tests.',
    category: 'advanced',
  },
  {
    id: 'D29',
    name: 'Ekonavimshamsha Chart',
    purpose: 'Fine karmic outcomes, subtle gains, and unseen support.',
    category: 'advanced',
  },
  {
    id: 'D30',
    name: 'Trimsamsha Chart',
    purpose: 'Stress patterns, protection needs, vulnerability, and the places where caution matters most.',
    category: 'core',
  },
  {
    id: 'D31',
    name: 'Ekatrimshamsha Chart',
    purpose: 'Fine-grained vulnerabilities, restraint, and inner purification.',
    category: 'advanced',
  },
  {
    id: 'D32',
    name: 'Dvatrimshamsha Chart',
    purpose:
      'Strength distribution, hardship signatures, and endurance patterns.',
    category: 'advanced',
  },
  {
    id: 'D33',
    name: 'Trayatrimshamsha Chart',
    purpose: 'Subtle fortune, refined outcomes, and micro-patterns in timing.',
    category: 'advanced',
  },
  {
    id: 'D34',
    name: 'Chaturtrimshamsha Chart',
    purpose:
      'Specific karmic texture, correction points, and nuanced destiny factors.',
    category: 'advanced',
  },
  {
    id: 'D40',
    name: 'Khavedamsha Chart',
    purpose:
      'Maternal lineage, inherited blessings, auspiciousness, and the emotional grace that comes through the mother line.',
    category: 'core',
  },
  {
    id: 'D45',
    name: 'Akshavedamsha Chart',
    purpose:
      'Paternal lineage, character, inherited honor, and the standards or merit carried through the father line.',
    category: 'core',
  },
  {
    id: 'D60',
    name: 'Shashtyamsha Chart',
    purpose:
      'Deep karmic root, destiny texture, hidden causes, and the background pattern beneath visible life.',
    category: 'core',
  },
];

export const CORE_CHARTS = CHART_REGISTRY.filter(
  chart => chart.category === 'core',
);

export const ADVANCED_CHARTS = CHART_REGISTRY.filter(
  chart => chart.category === 'advanced',
);

export function getChartConfig(chartType: ChartType): ChartConfig {
  const chart = CHART_REGISTRY.find(item => item.id === chartType);

  if (!chart) {
    throw new Error(`Unknown chart type: ${chartType}`);
  }

  return chart;
}

export function getDefaultChartViewMode(): ChartViewMode {
  return CHART_VIEW_HIERARCHY.find(item => item.default)?.id ?? 'insight';
}
