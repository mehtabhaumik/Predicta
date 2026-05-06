import {
  composeBirthTimeDetective,
  composeDailyBriefing,
  composeDecisionMemo,
  composeFamilyKarmaMap,
  composePredictaWrapped,
  composeRemedyCoach,
  composeRelationshipMirror,
  canAccessChartType,
  getPremiumLockedChartTypes,
  PREMIUM_CONTEXT_CHART_TYPES,
  getChartConfig,
} from '@pridicta/astrology';
import type {
  AIContextPayload,
  ChartContext,
  ChartType,
  KundliData,
  SupportedLanguage,
  UserPlan,
} from '../../types/astrology';

export function buildAIContext(
  kundliData: KundliData,
  chartContext?: ChartContext,
  language: SupportedLanguage = 'en',
  userPlan: UserPlan = 'FREE',
): AIContextPayload {
  const hasPremiumAccess = userPlan === 'PREMIUM';
  const allowedContextCharts: ChartType[] = hasPremiumAccess
    ? PREMIUM_CONTEXT_CHART_TYPES
    : ['D1'];
  const selectedChart =
    chartContext?.chartType &&
    canAccessChartType(chartContext.chartType, hasPremiumAccess) &&
    kundliData.charts[chartContext.chartType]
      ? kundliData.charts[chartContext.chartType]
      : undefined;
  const chartConfig = chartContext?.chartType
    ? getChartConfig(chartContext.chartType)
    : undefined;

  const selectedHouseFocus =
    selectedChart && chartContext?.selectedHouse
      ? {
          chartType: selectedChart.chartType,
          house: chartContext.selectedHouse,
          houseLord: kundliData.houses.find(
            house => house.house === chartContext.selectedHouse,
          )?.lord,
          houseSign: kundliData.houses.find(
            house => house.house === chartContext.selectedHouse,
          )?.sign,
          planets: selectedChart.housePlacements[chartContext.selectedHouse] ?? [],
        }
      : undefined;
  const selectedPlanetFocus = chartContext?.selectedPlanet
    ? {
        d1: kundliData.planets.find(
          planet =>
            planet.name.toLowerCase() ===
            chartContext.selectedPlanet?.toLowerCase(),
        ),
        planet: chartContext.selectedPlanet,
        vargaPlacements: Object.fromEntries(
          Object.entries(kundliData.charts)
            .filter(([chartType, chart]) =>
              allowedContextCharts.includes(chartType as ChartType) &&
              chart.supported,
            )
            .map(([chartType, chart]) => [
              chartType,
              chart.planetDistribution.find(
                planet =>
                  planet.name.toLowerCase() ===
                  chartContext.selectedPlanet?.toLowerCase(),
              ),
            ]),
        ),
      }
    : undefined;
  const selectedTimelineEvent = chartContext?.selectedTimelineEventId
    ? kundliData.lifeTimeline?.find(
        event => event.id === chartContext.selectedTimelineEventId,
      )
    : undefined;
  const selectedDecision = chartContext?.selectedDecisionQuestion
    ? compactDecisionMemo(
        composeDecisionMemo({
          kundli: kundliData,
          question: chartContext.selectedDecisionQuestion,
        }),
      )
    : undefined;
  const selectedRemedy = chartContext?.selectedRemedyId
    ? composeRemedyCoach(kundliData).items.find(
        item => item.id === chartContext.selectedRemedyId,
      )
    : undefined;
  const birthTimeDetective = chartContext?.selectedBirthTimeDetective
    ? composeBirthTimeDetective(kundliData)
    : undefined;
  const selectedRelationshipMirror = chartContext?.selectedRelationshipMirror
    ? compactRelationshipMirror(composeRelationshipMirror(kundliData))
    : undefined;
  const selectedFamilyKarmaMap = chartContext?.selectedFamilyKarmaMap
    ? compactFamilyKarmaMap(
        composeFamilyKarmaMap([{ kundli: kundliData, relationship: 'self' }]),
        chartContext.selectedFamilyMemberCount,
      )
    : undefined;
  const selectedPredictaWrapped = chartContext?.selectedPredictaWrapped
    ? compactPredictaWrapped(
        composePredictaWrapped({
          kundli: kundliData,
          year: chartContext.selectedPredictaWrappedYear,
        }),
      )
    : undefined;
  const coreChartEntries = Object.entries(kundliData.charts).filter(
    ([chartType, chart]) =>
      allowedContextCharts.includes(chartType as ChartType) && chart.supported,
  );

  return {
    activeContext: chartContext,
    ashtakavarga: kundliData.ashtakavarga,
    birthSummary: {
      date: kundliData.birthDetails.date,
      isTimeApproximate: kundliData.birthDetails.isTimeApproximate,
      name: kundliData.birthDetails.name,
      place: kundliData.birthDetails.place,
      time: kundliData.birthDetails.time,
      timezone: kundliData.birthDetails.timezone,
    },
    birthTimeDetective,
    calculationMeta: {
      ayanamsa: kundliData.calculationMeta.ayanamsa,
      houseSystem: kundliData.calculationMeta.houseSystem,
      nodeType: kundliData.calculationMeta.nodeType,
      utcDateTime: kundliData.calculationMeta.utcDateTime,
      zodiac: kundliData.calculationMeta.zodiac,
    },
    chartAvailability: {
      supported: Object.entries(kundliData.charts)
        .filter(
          ([chartType, chart]) =>
            chart.supported && allowedContextCharts.includes(chartType as ChartType),
        )
        .map(([chartType]) => chartType as keyof KundliData['charts']),
      unsupported: Object.entries(kundliData.charts)
        .filter(([, chart]) => !chart.supported && hasPremiumAccess)
        .map(([chartType]) => chartType as keyof KundliData['charts']),
      premiumLockedSupported: Object.entries(kundliData.charts)
        .filter(
          ([chartType, chart]) =>
            chart.supported && !allowedContextCharts.includes(chartType as ChartType),
        )
        .map(([chartType]) => chartType as keyof KundliData['charts']),
    },
    chartAccess: {
      allowedChartTypes: [...allowedContextCharts],
      premiumLockedChartTypes: getPremiumLockedChartTypes(),
      rule: hasPremiumAccess
        ? 'Premium users may use supported divisional charts as proof.'
        : 'Free users may use D1 chart proof only. Mention premium charts as locked instead of using them as evidence.',
      userPlan,
    },
    coreIdentity: {
      lagna: kundliData.lagna,
      moonSign: kundliData.moonSign,
      nakshatra: kundliData.nakshatra,
    },
    coreCharts: Object.fromEntries(coreChartEntries),
    currentDasha: kundliData.dasha.current,
    dailyBriefing: composeDailyBriefing(kundliData, { language }),
    dashaTimeline: kundliData.dasha.timeline.slice(0, 4),
    houses: kundliData.houses,
    lifeTimeline: kundliData.lifeTimeline,
    planets: kundliData.planets,
    rectification: kundliData.rectification,
    requestedLanguage: language,
    remedies: kundliData.remedies,
    selectedChart:
      selectedChart && chartConfig
        ? {
            ascendantSign: selectedChart.ascendantSign,
            chartType: chartConfig.id,
            name: chartConfig.name,
            planetDistribution: selectedChart.planetDistribution,
            purpose: chartConfig.purpose,
            relevantPlacements: selectedChart.housePlacements,
            signPlacements: selectedChart.signPlacements,
          }
        : undefined,
    selectedHouseFocus,
    selectedPlanetFocus,
    selectedDecision,
    selectedRemedy,
    selectedFamilyKarmaMap,
    selectedPredictaWrapped,
    selectedRelationshipMirror,
    selectedTimelineEvent,
    transits: kundliData.transits,
    yogas: kundliData.yogas,
  };
}

function compactPredictaWrapped(
  wrapped: ReturnType<typeof composePredictaWrapped>,
): NonNullable<AIContextPayload['selectedPredictaWrapped']> {
  return {
    bestWindow: wrapped.bestWindow,
    cautionWindow: wrapped.cautionWindow,
    growthArea: wrapped.growthArea,
    hardLesson: wrapped.hardLesson,
    nextYearPreview: wrapped.nextYearPreview,
    shareText: wrapped.shareText,
    title: wrapped.title,
    year: wrapped.year,
    yearTheme: wrapped.yearTheme,
  };
}

function compactFamilyKarmaMap(
  map: ReturnType<typeof composeFamilyKarmaMap>,
  memberCount?: number,
): NonNullable<AIContextPayload['selectedFamilyKarmaMap']> {
  return {
    memberCount: memberCount ?? map.members.length,
    privacyNote: map.privacyNote,
    relationshipCardCount: map.relationshipCards.length,
    shareSummary: map.shareSummary,
    subtitle: map.subtitle,
    themeTitles: map.repeatedThemes.map(theme => theme.title),
    title: map.title,
  };
}

function compactRelationshipMirror(
  mirror: ReturnType<typeof composeRelationshipMirror>,
): NonNullable<AIContextPayload['selectedRelationshipMirror']> {
  return {
    firstName: mirror.firstName,
    headline: mirror.headline,
    howToTalkThisWeek: mirror.howToTalkThisWeek,
    overview: mirror.overview,
    secondName: mirror.secondName,
    timingOverlap: mirror.timingOverlap,
  };
}

function compactDecisionMemo(
  memo: ReturnType<typeof composeDecisionMemo>,
): NonNullable<AIContextPayload['selectedDecision']> {
  return {
    area: memo.area,
    headline: memo.headline,
    nextAction: memo.nextAction,
    question: memo.question,
    risk: memo.risk,
    shortAnswer: memo.shortAnswer,
    state: memo.state,
    timing: memo.timing,
  };
}
