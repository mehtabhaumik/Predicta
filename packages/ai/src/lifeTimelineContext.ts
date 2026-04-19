import type { LifeTimelineInsight } from '@pridicta/types';

export type LifeTimelineAIContext = {
  kundliId: string;
  eventHash: string;
  mappedEventCount: number;
  recurringThemes: string[];
  mappedEvents: Array<{
    title: string;
    category: string;
    eventDate: string;
    mahadasha?: string;
    antardasha?: string;
    relevantHouses: number[];
    relevantCharts: string[];
    confidence: string;
  }>;
  instruction: string;
};

export function buildLifeTimelineAIContext(
  insight: LifeTimelineInsight,
): LifeTimelineAIContext {
  return {
    eventHash: insight.eventHash,
    instruction:
      'Write a calm, non-fear-based life pattern synthesis. Emphasize timing themes, not guaranteed destiny. Do not overstate accuracy.',
    kundliId: insight.kundliId,
    mappedEventCount: insight.mappedEvents.length,
    mappedEvents: insight.mappedEvents.map(item => ({
      antardasha: item.antardasha,
      category: item.event.category,
      confidence: item.confidence,
      eventDate: item.event.eventDate,
      mahadasha: item.mahadasha,
      relevantCharts: item.relevantCharts,
      relevantHouses: item.relevantHouses,
      title: item.event.title,
    })),
    recurringThemes: insight.recurringThemes,
  };
}
