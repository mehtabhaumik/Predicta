import {
  composeAdvancedJyotishCoverage,
  composeBirthTimeDetective,
  composeChalitBhavKpFoundation,
  composeDailyBriefing,
  composeDecisionMemo,
  composeFamilyKarmaMap,
  composeHolisticDailyGuidance,
  composeHolisticDecisionTimingSynthesis,
  composeHolisticFoundationModel,
  composeHolisticReadingRooms,
  composeMahadashaIntelligence,
  composeNadiJyotishPlan,
  composePersonalPanchangLayer,
  composePredictaWrapped,
  composePurusharthaLifeBalance,
  composeRemedyCoach,
  composeRelationshipMirror,
  composeSadhanaRemedyPath,
  composeSadeSatiIntelligence,
  composeTransitGocharIntelligence,
  composeYearlyHoroscopeVarshaphal,
  canAccessChartType,
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
  const selectedChartType = chartContext?.chartType;
  const allowedContextCharts: ChartType[] = hasPremiumAccess
    ? PREMIUM_CONTEXT_CHART_TYPES
    : Array.from(new Set(['D1', selectedChartType].filter(Boolean))) as ChartType[];
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
  const selectedDecisionSynthesis = chartContext?.selectedDecisionQuestion
    ? compactHolisticDecisionTimingSynthesis(
        composeHolisticDecisionTimingSynthesis({
          kundli: kundliData,
          language,
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
        .filter(([, chart]) => chart.supported)
        .map(([chartType]) => chartType as keyof KundliData['charts']),
      unsupported: Object.entries(kundliData.charts)
        .filter(([, chart]) => !chart.supported)
        .map(([chartType]) => chartType as keyof KundliData['charts']),
      premiumLockedSupported: [],
    },
    chartAccess: {
      allowedChartTypes: [...allowedContextCharts],
      premiumLockedChartTypes: [],
      rule: hasPremiumAccess
        ? 'Premium users receive detailed chart synthesis with D1 anchoring, dasha timing, confidence, remedies, and report-grade depth.'
        : 'Free users may open every chart and receive useful insight. Keep the reading concise and avoid premium-level synthesis.',
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
    personalPanchang: compactPersonalPanchang(
      composePersonalPanchangLayer(kundliData),
    ),
    dashaTimeline: kundliData.dasha.timeline.slice(0, 4),
    mahadashaIntelligence: compactMahadashaIntelligence(
      composeMahadashaIntelligence(kundliData, {
        depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
      }),
    ),
    sadeSatiIntelligence: compactSadeSatiIntelligence(
      composeSadeSatiIntelligence(kundliData, {
        depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
      }),
    ),
    transitGocharIntelligence: compactTransitGocharIntelligence(
      composeTransitGocharIntelligence(kundliData, {
        depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
      }),
    ),
    yearlyHoroscopeVarshaphal: compactYearlyHoroscopeVarshaphal(
      composeYearlyHoroscopeVarshaphal(kundliData, {
        depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
      }),
    ),
    advancedJyotishCoverage: compactAdvancedJyotishCoverage(
      composeAdvancedJyotishCoverage(kundliData, {
        depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
      }),
    ),
    nadiJyotishPlan: compactNadiJyotishPlan(
      composeNadiJyotishPlan(kundliData, {
        depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
        handoffQuestion: chartContext?.handoffQuestion,
      }),
    ),
    chalitBhavKpFoundation: compactChalitBhavKpFoundation(
      composeChalitBhavKpFoundation(kundliData, {
        depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
      }),
    ),
    holisticFoundation: compactHolisticFoundation(
      composeHolisticFoundationModel(kundliData),
    ),
    holisticReadingRooms: compactHolisticReadingRooms(
      composeHolisticReadingRooms(kundliData),
    ),
    sadhanaRemedyPath: compactSadhanaRemedyPath(
      composeSadhanaRemedyPath(kundliData),
    ),
    holisticDailyGuidance: compactHolisticDailyGuidance(
      composeHolisticDailyGuidance(kundliData, { language }),
    ),
    purusharthaLifeBalance: compactPurusharthaLifeBalance(
      composePurusharthaLifeBalance(kundliData),
    ),
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
    selectedDecisionSynthesis,
    selectedRemedy,
    selectedFamilyKarmaMap,
    selectedPredictaWrapped,
    selectedRelationshipMirror,
    selectedTimelineEvent,
    transits: kundliData.transits,
    yogas: kundliData.yogas,
  };
}

function compactMahadashaIntelligence(
  intelligence: ReturnType<typeof composeMahadashaIntelligence>,
): NonNullable<AIContextPayload['mahadashaIntelligence']> {
  return {
    current: intelligence.current,
    depth: intelligence.depth,
    limitations: intelligence.limitations,
    premiumUnlock: intelligence.premiumUnlock,
    remedies: intelligence.remedies.slice(0, 3),
    subtitle: intelligence.subtitle,
    timingWindows: intelligence.timingWindows.slice(0, 4),
    title: intelligence.title,
  };
}

function compactSadeSatiIntelligence(
  intelligence: ReturnType<typeof composeSadeSatiIntelligence>,
): NonNullable<AIContextPayload['sadeSatiIntelligence']> {
  return {
    active: intelligence.active,
    confidence: intelligence.confidence,
    depth: intelligence.depth,
    evidence: intelligence.evidence,
    freeInsight: intelligence.freeInsight,
    houseFromMoon: intelligence.houseFromMoon,
    limitations: intelligence.limitations,
    moonSign: intelligence.moonSign,
    phase: intelligence.phase,
    phaseLabel: intelligence.phaseLabel,
    premiumSynthesis: intelligence.premiumSynthesis,
    premiumUnlock: intelligence.premiumUnlock,
    remedies: intelligence.remedies.slice(0, 3),
    saturnSign: intelligence.saturnSign,
    subtitle: intelligence.subtitle,
    summary: intelligence.summary,
    title: intelligence.title,
    windows: intelligence.windows.slice(0, 3),
  };
}

function compactTransitGocharIntelligence(
  intelligence: ReturnType<typeof composeTransitGocharIntelligence>,
): NonNullable<AIContextPayload['transitGocharIntelligence']> {
  return {
    calculatedAt: intelligence.calculatedAt,
    cautionSignals: intelligence.cautionSignals.slice(0, 4),
    dashaOverlay: intelligence.dashaOverlay,
    depth: intelligence.depth,
    dominantWeight: intelligence.dominantWeight,
    evidence: intelligence.evidence,
    limitations: intelligence.limitations,
    monthlyCards: intelligence.monthlyCards.slice(0, 4),
    planetInsights: intelligence.planetInsights.slice(0, 8),
    premiumUnlock: intelligence.premiumUnlock,
    snapshotSummary: intelligence.snapshotSummary,
    subtitle: intelligence.subtitle,
    title: intelligence.title,
    topOpportunities: intelligence.topOpportunities.slice(0, 4),
  };
}

function compactYearlyHoroscopeVarshaphal(
  intelligence: ReturnType<typeof composeYearlyHoroscopeVarshaphal>,
): NonNullable<AIContextPayload['yearlyHoroscopeVarshaphal']> {
  return {
    cautionSignals: intelligence.cautionSignals.slice(0, 4),
    dashaOverlay: intelligence.dashaOverlay,
    depth: intelligence.depth,
    evidence: intelligence.evidence,
    focusAreas: intelligence.focusAreas,
    freeInsight: intelligence.freeInsight,
    gocharOverlay: intelligence.gocharOverlay,
    limitations: intelligence.limitations,
    monthlyCards: intelligence.monthlyCards.slice(0, 6),
    munthaHouse: intelligence.munthaHouse,
    munthaLord: intelligence.munthaLord,
    munthaSign: intelligence.munthaSign,
    premiumSynthesis: intelligence.premiumSynthesis,
    premiumUnlock: intelligence.premiumUnlock,
    solarReturnUtc: intelligence.solarReturnUtc,
    solarYearEnd: intelligence.solarYearEnd,
    solarYearStart: intelligence.solarYearStart,
    subtitle: intelligence.subtitle,
    supportSignals: intelligence.supportSignals.slice(0, 4),
    title: intelligence.title,
    varshaLagna: intelligence.varshaLagna,
    yearLabel: intelligence.yearLabel,
    yearTheme: intelligence.yearTheme,
  };
}

function compactAdvancedJyotishCoverage(
  coverage: ReturnType<typeof composeAdvancedJyotishCoverage>,
): NonNullable<AIContextPayload['advancedJyotishCoverage']> {
  return {
    ashtakavargaDetail: coverage.ashtakavargaDetail.slice(0, 12),
    compatibility: coverage.compatibility,
    depth: coverage.depth,
    freePolicy: coverage.freePolicy,
    limitations: coverage.limitations,
    moduleRegistry: coverage.moduleRegistry,
    nakshatraInsight: coverage.nakshatraInsight,
    panchangMuhurta: coverage.panchangMuhurta,
    prashna: coverage.prashna,
    premiumPolicy: coverage.premiumPolicy,
    premiumUnlock: coverage.premiumUnlock,
    safeRemedies: coverage.safeRemedies,
    subtitle: coverage.subtitle,
    title: coverage.title,
    yogaDoshaInsights: coverage.yogaDoshaInsights.slice(0, 8),
  };
}

function compactNadiJyotishPlan(
  plan: ReturnType<typeof composeNadiJyotishPlan>,
): NonNullable<AIContextPayload['nadiJyotishPlan']> {
  return {
    activations: plan.activations.slice(0, 4),
    depth: plan.depth,
    freePreview: plan.freePreview,
    guardrails: plan.guardrails,
    handoffQuestion: plan.handoffQuestion,
    limitations: plan.limitations,
    methodSummary: plan.methodSummary,
    patterns: plan.patterns.slice(0, 6),
    premiumOnly: plan.premiumOnly,
    premiumSynthesis: plan.premiumSynthesis,
    premiumUnlock: plan.premiumUnlock,
    schoolBoundary: plan.schoolBoundary,
    status: plan.status,
    subtitle: plan.subtitle,
    title: plan.title,
    validationQuestions: plan.validationQuestions.slice(0, 4),
  };
}

function compactChalitBhavKpFoundation(
  foundation: ReturnType<typeof composeChalitBhavKpFoundation>,
): NonNullable<AIContextPayload['chalitBhavKpFoundation']> {
  return {
    askPrompt: foundation.askPrompt,
    bhavChalit: {
      ...foundation.bhavChalit,
      cusps: foundation.bhavChalit.cusps.slice(0, 12),
      shifts: foundation.bhavChalit.shifts.slice(0, 9),
    },
    ctas: foundation.ctas,
    depth: foundation.depth,
    kp: {
      ...foundation.kp,
      cusps: foundation.kp.cusps.slice(0, 12),
      planets: foundation.kp.planets.slice(0, 9),
      significators: foundation.kp.significators.slice(0, 9),
    },
    premiumUnlock: foundation.premiumUnlock,
    status: foundation.status,
  };
}

function compactHolisticFoundation(
  foundation: ReturnType<typeof composeHolisticFoundationModel>,
): NonNullable<AIContextPayload['holisticFoundation']> {
  return {
    activePlanetFocus: foundation.activePlanetFocus.slice(0, 4),
    answerParts: foundation.answerParts,
    planetRemedyMap: foundation.planetRemedyMap,
    remedyPriority: foundation.remedyPriority,
    safetyRules: foundation.safetyRules,
    subtitle: foundation.subtitle,
    title: foundation.title,
  };
}

function compactHolisticReadingRooms(
  rooms: ReturnType<typeof composeHolisticReadingRooms>,
): NonNullable<AIContextPayload['holisticReadingRooms']> {
  return {
    featuredRoom: rooms.featuredRoom,
    guardrails: rooms.guardrails,
    rooms: rooms.rooms,
    subtitle: rooms.subtitle,
    title: rooms.title,
  };
}

function compactSadhanaRemedyPath(
  path: ReturnType<typeof composeSadhanaRemedyPath>,
): NonNullable<AIContextPayload['sadhanaRemedyPath']> {
  return {
    guardrails: path.guardrails,
    karmicTheme: path.karmicTheme,
    planet: path.planet,
    planetReason: path.planetReason,
    progressSummary: path.progressSummary,
    reviewQuestions: path.reviewQuestions,
    stages: path.stages,
    subtitle: path.subtitle,
    title: path.title,
    weeklyIntention: path.weeklyIntention,
  };
}

function compactHolisticDailyGuidance(
  guidance: ReturnType<typeof composeHolisticDailyGuidance>,
): NonNullable<AIContextPayload['holisticDailyGuidance']> {
  return {
    avoidAction: guidance.avoidAction,
    bestAction: guidance.bestAction,
    blocks: guidance.blocks,
    dailyFocus: guidance.dailyFocus,
    date: guidance.date,
    eveningReview: guidance.eveningReview,
    evidence: guidance.evidence,
    guardrails: guidance.guardrails,
    headline: guidance.headline,
    middayCheck: guidance.middayCheck,
    morningPractice: guidance.morningPractice,
    purusharthaFocus: guidance.purusharthaFocus,
    remedy: guidance.remedy,
    sadhanaStep: guidance.sadhanaStep,
    subtitle: guidance.subtitle,
    timingNote: guidance.timingNote,
    title: guidance.title,
  };
}

function compactPurusharthaLifeBalance(
  balance: ReturnType<typeof composePurusharthaLifeBalance>,
): NonNullable<AIContextPayload['purusharthaLifeBalance']> {
  return {
    axes: balance.axes,
    dominant: balance.dominant,
    limitations: balance.limitations,
    needsCare: balance.needsCare,
    subtitle: balance.subtitle,
    summary: balance.summary,
    title: balance.title,
  };
}

function compactPersonalPanchang(
  panchang: ReturnType<typeof composePersonalPanchangLayer>,
): NonNullable<AIContextPayload['personalPanchang']> {
  return {
    avoidFor: panchang.avoidFor,
    bestFor: panchang.bestFor,
    date: panchang.date,
    evidence: panchang.evidence,
    limitations: panchang.limitations,
    moonNakshatra: panchang.moonNakshatra,
    moonSign: panchang.moonSign,
    natalNakshatra: panchang.natalNakshatra,
    paksha: panchang.paksha,
    personalRemedy: panchang.personalRemedy,
    signals: panchang.signals,
    subtitle: panchang.subtitle,
    tithi: panchang.tithi,
    title: panchang.title,
    todayFocus: panchang.todayFocus,
    weekday: panchang.weekday,
    weekdayLord: panchang.weekdayLord,
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

function compactHolisticDecisionTimingSynthesis(
  synthesis: ReturnType<typeof composeHolisticDecisionTimingSynthesis>,
): NonNullable<AIContextPayload['selectedDecisionSynthesis']> {
  return {
    area: synthesis.area,
    dailyAnchor: synthesis.dailyAnchor,
    decisionGuidance: synthesis.decisionGuidance,
    evidence: synthesis.evidence.slice(0, 6),
    guardrails: synthesis.guardrails,
    headline: synthesis.headline,
    practicalStep: synthesis.practicalStep,
    purusharthaLens: synthesis.purusharthaLens,
    question: synthesis.question,
    riskBoundary: synthesis.riskBoundary,
    sadhanaSupport: synthesis.sadhanaSupport,
    signals: synthesis.signals.slice(0, 6),
    state: synthesis.state,
    subtitle: synthesis.subtitle,
    timingWindow: synthesis.timingWindow,
    title: synthesis.title,
  };
}
