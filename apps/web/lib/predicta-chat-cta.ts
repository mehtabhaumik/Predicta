import type {
  ChartType,
  DecisionArea,
  DecisionState,
  KundliData,
  PredictaSchool,
  TimelineEvent,
} from '@pridicta/types';

export type PredictaChatCtaContext = {
  birthTimeDetective?: boolean;
  chartName?: string;
  chartType?: ChartType;
  decisionArea?: DecisionArea | string;
  decisionQuestion?: string;
  decisionState?: DecisionState | string;
  from?: PredictaSchool;
  handoffQuestion?: string;
  kundli?: KundliData;
  kundliId?: string;
  prompt?: string;
  purpose?: string;
  remedyId?: string;
  remedyTitle?: string;
  school?: PredictaSchool;
  selectedDailyBriefingDate?: string;
  selectedFamilyKarmaMap?: boolean;
  selectedFamilyMemberCount?: number;
  selectedHouse?: number;
  selectedPlanet?: string;
  selectedPredictaWrapped?: boolean;
  selectedPredictaWrappedYear?: number;
  selectedRelationshipMirror?: boolean;
  selectedSection?: string;
  selectedTimelineEventId?: string;
  selectedTimelineEventKind?: TimelineEvent['kind'];
  selectedTimelineEventTitle?: string;
  selectedTimelineEventWindow?: string;
  sourceScreen: string;
};

export function buildPredictaChatHref(context: PredictaChatCtaContext): string {
  const params = new URLSearchParams();

  setParam(params, 'sourceScreen', context.sourceScreen);
  setParam(params, 'prompt', context.prompt ?? context.selectedSection);
  setParam(params, 'kundliId', context.kundliId ?? context.kundli?.id);
  setParam(params, 'chartName', context.chartName);
  setParam(params, 'chartType', context.chartType);
  setParam(params, 'purpose', context.purpose);
  setParam(params, 'selectedHouse', context.selectedHouse);
  setParam(params, 'selectedPlanet', context.selectedPlanet);
  setParam(params, 'school', context.school);
  setParam(params, 'from', context.from);
  setParam(params, 'handoffQuestion', context.handoffQuestion);
  setParam(params, 'selectedSection', context.selectedSection);
  setParam(params, 'selectedTimelineEventId', context.selectedTimelineEventId);
  setParam(params, 'selectedTimelineEventTitle', context.selectedTimelineEventTitle);
  setParam(params, 'selectedTimelineEventKind', context.selectedTimelineEventKind);
  setParam(params, 'selectedTimelineEventWindow', context.selectedTimelineEventWindow);
  setParam(params, 'selectedDailyBriefingDate', context.selectedDailyBriefingDate);
  setParam(params, 'decisionQuestion', context.decisionQuestion);
  setParam(params, 'decisionArea', context.decisionArea);
  setParam(params, 'decisionState', context.decisionState);
  setParam(params, 'remedyId', context.remedyId);
  setParam(params, 'remedyTitle', context.remedyTitle);
  setParam(params, 'birthTimeDetective', context.birthTimeDetective ? 'true' : undefined);
  setParam(
    params,
    'selectedRelationshipMirror',
    context.selectedRelationshipMirror ? 'true' : undefined,
  );
  setParam(
    params,
    'selectedFamilyKarmaMap',
    context.selectedFamilyKarmaMap ? 'true' : undefined,
  );
  setParam(params, 'selectedFamilyMemberCount', context.selectedFamilyMemberCount);
  setParam(
    params,
    'selectedPredictaWrapped',
    context.selectedPredictaWrapped ? 'true' : undefined,
  );
  setParam(params, 'selectedPredictaWrappedYear', context.selectedPredictaWrappedYear);

  return `/dashboard/chat?${params.toString()}`;
}

function setParam(
  params: URLSearchParams,
  key: string,
  value: boolean | number | string | undefined,
): void {
  if (value === undefined || value === '') {
    return;
  }

  params.set(key, String(value));
}
