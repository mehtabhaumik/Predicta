import type {
  AstrologyMemory,
  AstrologyReasoningContext,
  ChartContext,
  ChartType,
  IntentDetectionResult,
  PredictaUserIntent,
} from '@pridicta/types';

type ReasoningBlueprint = {
  primaryCharts: ChartType[];
  secondaryCharts: ChartType[];
  relevantFactors: string[];
  shouldUseDasha: boolean;
  shouldUseTransit: boolean;
  shouldSuggestRemedy: boolean;
};

const BLUEPRINTS: Record<PredictaUserIntent, ReasoningBlueprint> = {
  career: {
    primaryCharts: ['D1', 'D10'],
    secondaryCharts: ['D9'],
    relevantFactors: ['10th house', '10th lord', 'Saturn', 'Sun', 'career yogas'],
    shouldUseDasha: true,
    shouldUseTransit: true,
    shouldSuggestRemedy: true,
  },
  marriage: {
    primaryCharts: ['D1', 'D9'],
    secondaryCharts: ['D7'],
    relevantFactors: ['7th house', '7th lord', 'Venus', 'Jupiter', 'marriage yogas'],
    shouldUseDasha: true,
    shouldUseTransit: true,
    shouldSuggestRemedy: true,
  },
  relationship: {
    primaryCharts: ['D1', 'D9'],
    secondaryCharts: ['D7'],
    relevantFactors: ['7th house', 'Venus', 'Moon', 'Rahu/Ketu axis', 'relationship patterns'],
    shouldUseDasha: true,
    shouldUseTransit: false,
    shouldSuggestRemedy: true,
  },
  finance: {
    primaryCharts: ['D1', 'D2'],
    secondaryCharts: ['D10'],
    relevantFactors: ['2nd house', '11th house', 'Jupiter', 'Venus', 'wealth yogas'],
    shouldUseDasha: true,
    shouldUseTransit: true,
    shouldSuggestRemedy: true,
  },
  health: {
    primaryCharts: ['D1', 'D30'],
    secondaryCharts: ['D6'],
    relevantFactors: ['6th house', '8th house', 'Moon', 'Saturn', 'vitality patterns'],
    shouldUseDasha: true,
    shouldUseTransit: false,
    shouldSuggestRemedy: true,
  },
  family: {
    primaryCharts: ['D1', 'D12'],
    secondaryCharts: ['D9'],
    relevantFactors: ['4th house', '2nd house', 'Moon', 'Sun', 'family karma'],
    shouldUseDasha: true,
    shouldUseTransit: false,
    shouldSuggestRemedy: true,
  },
  children: {
    primaryCharts: ['D1', 'D7'],
    secondaryCharts: ['D9'],
    relevantFactors: ['5th house', 'Jupiter', 'Putra karaka', '5th lord'],
    shouldUseDasha: true,
    shouldUseTransit: true,
    shouldSuggestRemedy: true,
  },
  education: {
    primaryCharts: ['D1', 'D24'],
    secondaryCharts: ['D10'],
    relevantFactors: ['4th house', '5th house', 'Mercury', 'Jupiter', 'study discipline'],
    shouldUseDasha: true,
    shouldUseTransit: false,
    shouldSuggestRemedy: false,
  },
  spirituality: {
    primaryCharts: ['D1', 'D20'],
    secondaryCharts: ['D9'],
    relevantFactors: ['9th house', '12th house', 'Jupiter', 'Ketu', 'dharma patterns'],
    shouldUseDasha: true,
    shouldUseTransit: false,
    shouldSuggestRemedy: true,
  },
  dasha: {
    primaryCharts: ['D1'],
    secondaryCharts: ['D9', 'D10'],
    relevantFactors: ['mahadasha', 'antardasha', 'dasha lord dignity', 'timing windows'],
    shouldUseDasha: true,
    shouldUseTransit: false,
    shouldSuggestRemedy: false,
  },
  transit: {
    primaryCharts: ['D1'],
    secondaryCharts: ['D9', 'D10'],
    relevantFactors: ['gochar', 'Saturn transit', 'Jupiter transit', 'transit triggers'],
    shouldUseDasha: true,
    shouldUseTransit: true,
    shouldSuggestRemedy: false,
  },
  remedy: {
    primaryCharts: ['D1'],
    secondaryCharts: ['D9', 'D10'],
    relevantFactors: ['afflicted houses', 'current dasha', 'Moon', 'Saturn', 'healing discipline'],
    shouldUseDasha: true,
    shouldUseTransit: false,
    shouldSuggestRemedy: true,
  },
  chart_explanation: {
    primaryCharts: ['D1'],
    secondaryCharts: ['D9', 'D10'],
    relevantFactors: ['selected chart', 'selected house', 'selected planet', 'chart meaning'],
    shouldUseDasha: false,
    shouldUseTransit: false,
    shouldSuggestRemedy: false,
  },
  emotional_support: {
    primaryCharts: ['D1'],
    secondaryCharts: ['D9'],
    relevantFactors: ['Moon', '4th house', 'Saturn', 'Rahu/Ketu axis', 'current emotional pressure'],
    shouldUseDasha: true,
    shouldUseTransit: false,
    shouldSuggestRemedy: true,
  },
  prediction_timing: {
    primaryCharts: ['D1'],
    secondaryCharts: ['D9', 'D10'],
    relevantFactors: ['dasha', 'transit windows', 'lord activation', 'supportive timing'],
    shouldUseDasha: true,
    shouldUseTransit: true,
    shouldSuggestRemedy: false,
  },
  follow_up: {
    primaryCharts: ['D1'],
    secondaryCharts: ['D9', 'D10'],
    relevantFactors: ['conversation continuity', 'previous answer', 'refined context'],
    shouldUseDasha: false,
    shouldUseTransit: false,
    shouldSuggestRemedy: false,
  },
  general_question: {
    primaryCharts: ['D1'],
    secondaryCharts: ['D9', 'D10'],
    relevantFactors: ['broad birth chart', 'current pattern', 'relevant varga if needed'],
    shouldUseDasha: false,
    shouldUseTransit: false,
    shouldSuggestRemedy: false,
  },
};

function uniqueCharts(values: ChartType[]): ChartType[] {
  return [...new Set(values)];
}

export function buildAstrologyReasoningContext(input: {
  intentProfile: IntentDetectionResult;
  chartContext?: ChartContext;
  memory?: AstrologyMemory;
}): AstrologyReasoningContext {
  const base = BLUEPRINTS[input.intentProfile.primaryIntent] ?? BLUEPRINTS.general_question;
  const chartType = input.chartContext?.chartType ?? input.memory?.lastChartContext?.chartType;

  const primaryCharts = uniqueCharts(
    chartType ? [chartType, ...base.primaryCharts] : base.primaryCharts,
  );
  const secondaryCharts = uniqueCharts(
    base.secondaryCharts.filter(chart => !primaryCharts.includes(chart)),
  );

  const relevantFactors = [...base.relevantFactors];
  if (input.chartContext?.selectedPlanet) {
    relevantFactors.unshift(`${input.chartContext.selectedPlanet} emphasis`);
  }
  if (typeof input.chartContext?.selectedHouse === 'number') {
    relevantFactors.unshift(`House ${input.chartContext.selectedHouse} focus`);
  }

  return {
    userIntent: input.intentProfile.primaryIntent,
    emotionalTone: input.intentProfile.emotionalTone,
    primaryCharts,
    secondaryCharts,
    relevantFactors: [...new Set(relevantFactors)],
    chartContext: input.chartContext ?? input.memory?.lastChartContext,
    shouldUseDasha: base.shouldUseDasha,
    shouldUseTransit: base.shouldUseTransit,
    shouldSuggestRemedy:
      base.shouldSuggestRemedy ||
      input.intentProfile.primaryIntent === 'remedy' ||
      input.intentProfile.emotionalTone === 'anxious' ||
      input.intentProfile.emotionalTone === 'sad',
  };
}
