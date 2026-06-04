import type {
  ChartType,
  DecisionArea,
  DecisionState,
  KundliData,
  KundliKarmaModule,
  PredictaSchool,
  ReportMemoryDepth,
  ReportSchoolLaneId,
  SupportedLanguage,
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
  reportAvailableSections?: string[];
  reportFocus?: string;
  reportGeneratedAt?: string;
  reportMode?: ReportMemoryDepth;
  reportSchoolLane?: ReportSchoolLaneId;
  reportSectionId?: string;
  reportSectionPrompt?: string;
  reportSectionTitle?: string;
  reportSelectedSections?: string[];
  reportSubjectName?: string;
  reportType?: string;
  school?: PredictaSchool;
  selectedDailyBriefingDate?: string;
  selectedFamilyKarmaMap?: boolean;
  selectedFamilyMemberCount?: number;
  selectedHouse?: number;
  selectedKundliKarmaEvidenceSummary?: string;
  selectedKundliKarmaItemId?: string;
  selectedKundliKarmaModule?: KundliKarmaModule;
  selectedKundliKarmaRuleId?: string;
  selectedLanguage?: SupportedLanguage;
  selectedPlanet?: string;
  selectedPredictaWrapped?: boolean;
  selectedPredictaWrappedYear?: number;
  selectedRelationshipMirror?: boolean;
  selectedRelationshipNames?: string;
  selectedSection?: string;
  selectedTimelineEventId?: string;
  selectedTimelineEventKind?: TimelineEvent['kind'];
  selectedTimelineEventTitle?: string;
  selectedTimelineEventWindow?: string;
  sourceScreen: string;
};

export function buildPredictaChatHref(context: PredictaChatCtaContext): string {
  const params = new URLSearchParams();
  const activeKundliId = context.kundliId ?? context.kundli?.id;

  setParam(params, 'sourceScreen', context.sourceScreen);
  setParam(params, 'prompt', context.prompt ?? context.selectedSection);
  setParam(params, 'kundliId', activeKundliId);
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
  setParam(params, 'reportFocus', context.reportFocus);
  setParam(params, 'reportGeneratedAt', context.reportGeneratedAt);
  setParam(params, 'reportMode', context.reportMode);
  setParam(params, 'reportSchoolLane', context.reportSchoolLane);
  setParam(params, 'reportSectionId', context.reportSectionId);
  setParam(params, 'reportSectionPrompt', context.reportSectionPrompt);
  setParam(params, 'reportSectionTitle', context.reportSectionTitle);
  setParam(params, 'reportSubjectName', context.reportSubjectName);
  setParam(params, 'reportType', context.reportType);
  setListParam(params, 'reportAvailableSections', context.reportAvailableSections);
  setListParam(params, 'reportSelectedSections', context.reportSelectedSections);
  setParam(params, 'birthTimeDetective', context.birthTimeDetective ? 'true' : undefined);
  setParam(
    params,
    'selectedRelationshipMirror',
    context.selectedRelationshipMirror ? 'true' : undefined,
  );
  setParam(params, 'selectedRelationshipNames', context.selectedRelationshipNames);
  setParam(
    params,
    'selectedFamilyKarmaMap',
    context.selectedFamilyKarmaMap ? 'true' : undefined,
  );
  setParam(params, 'selectedFamilyMemberCount', context.selectedFamilyMemberCount);
  setParam(params, 'selectedKundliKarmaEvidenceSummary', context.selectedKundliKarmaEvidenceSummary);
  setParam(params, 'selectedKundliKarmaItemId', context.selectedKundliKarmaItemId);
  setParam(params, 'selectedKundliKarmaModule', context.selectedKundliKarmaModule);
  setParam(params, 'selectedKundliKarmaRuleId', context.selectedKundliKarmaRuleId);
  setParam(params, 'selectedLanguage', context.selectedLanguage);
  setParam(
    params,
    'selectedPredictaWrapped',
    context.selectedPredictaWrapped ? 'true' : undefined,
  );
  setParam(params, 'selectedPredictaWrappedYear', context.selectedPredictaWrappedYear);

  return `${getPredictaChatPath(context.school)}?${params.toString()}`;
}

function getPredictaChatPath(school: PredictaSchool | undefined): string {
  if (school === 'PARASHARI') {
    return '/dashboard/vedic/chat';
  }

  if (school === 'KP') {
    return '/dashboard/kp/chat';
  }

  if (school === 'JAIMINI') {
    return '/dashboard/jaimini/chat';
  }

  if (school === 'NADI') {
    return '/dashboard/jaimini/chat';
  }

  if (school === 'NUMEROLOGY') {
    return '/dashboard/numerology/chat';
  }

  if (school === 'SIGNATURE') {
    return '/dashboard/signature/chat';
  }

  return '/dashboard/vedic/chat';
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

function setListParam(
  params: URLSearchParams,
  key: string,
  value: string[] | undefined,
): void {
  const cleanValue = value?.map(item => item.trim()).filter(Boolean);

  if (!cleanValue?.length) {
    return;
  }

  params.set(key, cleanValue.join('||'));
}
