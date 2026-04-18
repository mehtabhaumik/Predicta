import type { ChartConfig, ChartType } from '@pridicta/types';

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
      'Wealth handling, nourishment, family resources, and financial temperament.',
    category: 'core',
  },
  {
    id: 'D3',
    name: 'Drekkana Chart',
    purpose: 'Courage, siblings, initiative, stamina, and practical effort.',
    category: 'core',
  },
  {
    id: 'D4',
    name: 'Chaturthamsha Chart',
    purpose:
      'Home, property, inner stability, emotional foundations, and fixed assets.',
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
      'Children, legacy, creativity, fertility themes, and generational blessings.',
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
      'Dharma, marriage, inner maturity, fortune, and the deeper strength of planets.',
    category: 'core',
  },
  {
    id: 'D10',
    name: 'Dashamsha Chart',
    purpose:
      'Career, public work, authority, professional rise, and contribution.',
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
      'Parents, lineage, inherited tendencies, and family karmic patterns.',
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
      'Vehicles, comforts, luxuries, conveyances, and emotional enjoyment.',
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
      'Spiritual practice, devotion, mantra, inner discipline, and blessings.',
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
    purpose: 'Education, learning, teachers, knowledge, and study discipline.',
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
    purpose: 'Misfortunes, stress patterns, protection needs, and shadow work.',
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
      'Maternal lineage, auspiciousness, inherited blessings, and emotional grace.',
    category: 'core',
  },
  {
    id: 'D45',
    name: 'Akshavedamsha Chart',
    purpose:
      'Paternal lineage, character, inherited honor, and deep family merit.',
    category: 'core',
  },
  {
    id: 'D60',
    name: 'Shashtyamsha Chart',
    purpose:
      'Deep karmic root, past-life momentum, destiny texture, and hidden causes.',
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
