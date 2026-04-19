import type { DailyIntelligence, WeeklyIntelligence } from '@pridicta/types';

export type DailyWeeklyAIContext = {
  daily: {
    dateKey: string;
    emotionalTone: string;
    workFocus: string;
    relationshipTone: string;
    practicalAction: string;
    avoid: string;
    chartBasisSummary: string;
  };
  weekly?: {
    weekKey: string;
    weeklyTheme: string;
    careerFocus: string;
    relationshipFocus: string;
    spiritualSuggestion: string;
    importantDateWindows: WeeklyIntelligence['importantDateWindows'];
    chartBasisSummary: string;
  };
  instruction: string;
};

export function buildDailyWeeklyAIContext({
  daily,
  weekly,
}: {
  daily: DailyIntelligence;
  weekly?: WeeklyIntelligence;
}): DailyWeeklyAIContext {
  return {
    daily: {
      avoid: daily.avoid,
      chartBasisSummary: daily.chartBasisSummary,
      dateKey: daily.dateKey,
      emotionalTone: daily.emotionalTone,
      practicalAction: daily.practicalAction,
      relationshipTone: daily.relationshipTone,
      workFocus: daily.workFocus,
    },
    instruction:
      'Write calm Today and Weekly guidance. Avoid fear, guarantees, urgency, and deterministic claims. Keep the response practical and emotionally grounded.',
    weekly: weekly
      ? {
          careerFocus: weekly.careerFocus,
          chartBasisSummary: weekly.chartBasisSummary,
          importantDateWindows: weekly.importantDateWindows,
          relationshipFocus: weekly.relationshipFocus,
          spiritualSuggestion: weekly.spiritualSuggestion,
          weeklyTheme: weekly.weeklyTheme,
          weekKey: weekly.weekKey,
        }
      : undefined,
  };
}
