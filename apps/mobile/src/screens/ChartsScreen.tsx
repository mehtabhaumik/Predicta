import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  ActiveKundliActions,
  AnimatedHeader,
  AdvancedJyotishPanel,
  AppText,
  BhavChalitPanel,
  GlowButton,
  GlowCard,
  KundliChart,
  type KundliChartFocus,
  Screen,
  VedicIntelligencePanel,
} from '../components';
import {
  buildChartSelectionPrompt,
  CHART_REGISTRY,
  composeChalitBhavKpFoundation,
  composeChartInsight,
  getChartTypesForAccess,
  getVedicFocusChartLabel,
  getVedicFocusChartShortLabel,
  isSelectableVargaFocusRole,
  VEDIC_FOCUS_CHART_ORDER,
} from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import type { ChartConfig, ChartData, ChartType, KundliData } from '../types/astrology';

export function ChartsScreen({
  navigation,
}: RootScreenProps<typeof routes.Charts>): React.JSX.Element {
  const [selectedChart, setSelectedChart] = useState<ChartType>('D1');
  const [focus, setFocus] = useState<KundliChartFocus>({});
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const access = getResolvedAccess();
  const chartTypes = getChartTypesForAccess(access.hasPremiumAccess);
  const chalitKpFoundation = composeChalitBhavKpFoundation(kundli, {
    depth: access.hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });

  if (!kundli) {
    return (
      <Screen>
        <AnimatedHeader
          eyebrow="NORTH INDIAN CHART"
          title="Create Kundli first"
        />
        <GlowCard className="mt-7" delay={100}>
          <AppText variant="subtitle">No confusing fake chart here.</AppText>
          <AppText className="mt-2" tone="secondary">
            Create your Kundli first. Then this screen will show your North
            Indian charts. Free gives useful insight for each chart; Premium
            adds detailed analysis and timing.
          </AppText>
          <View className="mt-5">
            <GlowButton
              label="Create Kundli"
              onPress={() => navigation.navigate(routes.Kundli)}
            />
          </View>
        </GlowCard>
      </Screen>
    );
  }

  const safeSelectedChart = selectedChart;
  const selectedConfig = getChartConfig(safeSelectedChart);
  const chart =
    kundli.charts[safeSelectedChart] ??
    buildMissingChartPlaceholder(safeSelectedChart, selectedConfig, kundli);
  const insight = composeChartInsight({
    chart,
    hasPremiumAccess: access.hasPremiumAccess,
    kundli,
  });
  const insightBullets = [
    `Strength: ${insight.mainStrength}`,
    `Challenge: ${insight.mainChallenge}`,
    `Guidance: ${insight.currentGuidance}`,
    ...insight.freeInsights,
  ].slice(0, 5);
  const focusOrderItems = VEDIC_FOCUS_CHART_ORDER.map((role, index) => ({
    active: isSelectableVargaFocusRole(role) && safeSelectedChart === role,
    available: getFocusChartAvailability(kundli, role),
    index,
    label: getVedicFocusChartLabel(role, 'en'),
    role,
    shortLabel: getVedicFocusChartShortLabel(role),
  }));

  function askFromChart() {
    setActiveChartContext({
      chartName: selectedConfig.name,
      chartType: safeSelectedChart,
      purpose: selectedConfig.purpose,
      selectedHouse: focus.house,
      selectedPlanet: focus.planet,
      selectedSection: buildChartSelectionPrompt({
        chartName: selectedConfig.name,
        chartType: safeSelectedChart,
        purpose: selectedConfig.purpose,
        selectedHouse: focus.house,
        selectedPlanet: focus.planet,
        sourceScreen: 'Charts',
      }),
      sourceScreen: 'Charts',
    });
    navigation.navigate(routes.Chat);
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="NORTH INDIAN CHART" title="Charts" />

      <ActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Charts"
        title="Chart Kundli"
      />

      <GlowCard className="mt-7" delay={60}>
        <AppText tone="secondary" variant="caption">
          REQUIRED VEDIC FOCUS ORDER
        </AppText>
        <View className="mt-4 flex-row flex-wrap gap-2">
          {focusOrderItems.map(item =>
            isSelectableVargaFocusRole(item.role) ? (
              <Pressable
                accessibilityRole="button"
                className={`min-w-[96px] flex-1 rounded-3xl border px-3 py-3 ${
                  item.active
                    ? 'border-[#4DAFFF] bg-[#4DAFFF22]'
                    : 'border-[#FFFFFF18] bg-[#FFFFFF0A]'
                }`}
                key={item.role}
                onPress={() => {
                  setSelectedChart(item.role as ChartType);
                  setFocus({});
                }}
              >
                <AppText className="text-[#FFD27A]" variant="caption">
                  {item.index + 1}
                </AppText>
                <AppText variant="subtitle">{item.shortLabel}</AppText>
                <AppText tone="secondary" variant="caption">
                  {item.label}
                </AppText>
              </Pressable>
            ) : (
              <View
                className={`min-w-[96px] flex-1 rounded-3xl border px-3 py-3 ${
                  item.available
                    ? 'border-[#FFFFFF18] bg-[#FFFFFF0A]'
                    : 'border-[#FFFFFF12] bg-[#FFFFFF06]'
                }`}
                key={item.role}
              >
                <AppText className="text-[#FFD27A]" variant="caption">
                  {item.index + 1}
                </AppText>
                <AppText variant="subtitle">{item.shortLabel}</AppText>
                <AppText tone="secondary" variant="caption">
                  {item.label}
                </AppText>
              </View>
            ),
          )}
        </View>
        <AppText className="mt-3" tone="secondary" variant="caption">
          These are focus charts only. The full Varga library remains available below.
        </AppText>
      </GlowCard>

      <GlowCard className="mt-7" delay={80}>
        <AppText tone="secondary" variant="caption">
          SELECT CHART
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {selectedConfig.name}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {selectedConfig.purpose}
        </AppText>
        <View className="mt-5 flex-row flex-wrap gap-2">
          {chartTypes.map(chartType => {
            const active = safeSelectedChart === chartType;

            return (
              <Pressable
                accessibilityRole="button"
                key={chartType}
                onPress={() => {
                  setSelectedChart(chartType);
                  setFocus({});
                }}
                className={`rounded-full border px-4 py-3 ${
                  active
                    ? 'border-[#4DAFFF] bg-[#4DAFFF22]'
                    : 'border-[#252533] bg-[#FFFFFF0A]'
                }`}
              >
                <AppText
                  className={active ? 'text-[#4DAFFF]' : ''}
                  tone={active ? 'primary' : 'secondary'}
                  variant="caption"
                >
                  {chartType}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </GlowCard>

      <View className="mt-7">
        <KundliChart
          chart={chart}
          onFocusChange={setFocus}
          selectedHouse={focus.house}
          selectedPlanet={focus.planet}
        />
      </View>

      <VedicIntelligencePanel
        hasPremiumAccess={access.hasPremiumAccess}
        kundli={kundli}
      />

      <GlowCard className="mt-5" delay={140}>
        <AppText tone="secondary" variant="caption">
          What This Chart Is Saying
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {insight.title}
        </AppText>
        <AppText className="mt-1" tone="secondary" variant="caption">
          {insight.eyebrow}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {insight.whatItSays}
        </AppText>
        <View className="mt-4 gap-2">
          {insightBullets.map(item => (
            <AppText key={item} tone="secondary" variant="caption">
              - {item}
            </AppText>
          ))}
        </View>
        {access.hasPremiumAccess && insight.premiumInsight ? (
          <View className="mt-5 gap-3 rounded-3xl border border-[#FFD27A33] bg-[#FFD27A12] p-4">
            <AppText className="text-[#FFD27A]" variant="caption">
              PREMIUM DEEP DIVE
            </AppText>
            <AppText variant="subtitle">{insight.premiumInsight.headline}</AppText>
            <PremiumMiniList
              items={insight.premiumInsight.layeredInterpretation}
              title="Layered interpretation"
            />
            <PremiumMiniList
              items={insight.premiumInsight.crossChartSynthesis}
              title="Cross-chart synthesis"
            />
            <PremiumMiniList
              items={insight.premiumInsight.contradictionSignals}
              title="Strength vs contradiction"
            />
            <AppText tone="secondary" variant="caption">
              Confidence: {insight.premiumInsight.confidenceFraming}
            </AppText>
          </View>
        ) : insight.premiumNudge ? (
          <View className="mt-5">
            <AppText tone="secondary" variant="caption">
              {insight.premiumNudge}
            </AppText>
            <View className="mt-3">
              <GlowButton
                label="See Premium"
                onPress={() => navigation.navigate(routes.Paywall)}
              />
            </View>
          </View>
        ) : null}
      </GlowCard>

      <BhavChalitPanel
        foundation={chalitKpFoundation}
        onAskChalit={() => {
          setActiveChartContext({
            selectedSection:
              'Explain my Parashari Chalit chart and house shifts. Do not mix it with KP or Nadi.',
            sourceScreen: 'Charts',
          });
          navigation.navigate(routes.Chat);
        }}
        onOpenKp={() => navigation.navigate(routes.KpPredicta)}
      />

      <View className="mt-5">
        <AdvancedJyotishPanel
          hasPremiumAccess={access.hasPremiumAccess}
          kundli={kundli}
          onAskPrompt={prompt => {
            setActiveChartContext({
              selectedSection: prompt,
              sourceScreen: 'Advanced Jyotish',
            });
            navigation.navigate(routes.Chat);
          }}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>

      <View className="mt-5">
        <GlowButton
          label={
            focus.planet
              ? `Ask about ${focus.planet} in ${safeSelectedChart}`
              : focus.house
                ? `Ask about House ${focus.house} in ${safeSelectedChart}`
                : `Ask Predicta about ${safeSelectedChart}`
          }
          onPress={askFromChart}
        />
      </View>

      <View className="mt-7 gap-4">
        {chartTypes.map(chartType => {
          const config = getChartConfig(chartType);
          const active = safeSelectedChart === chartType;

          return (
            <Pressable
              accessibilityRole="button"
              key={chartType}
              onPress={() => {
                setSelectedChart(chartType);
                setFocus({});
              }}
            >
              <GlowCard delay={100}>
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <AppText tone="secondary" variant="caption">
                      {chartType}
                    </AppText>
                    <AppText className="mt-1" variant="subtitle">
                      {config.name}
                    </AppText>
                    <AppText className="mt-2" tone="secondary" variant="caption">
                      {config.purpose}
                    </AppText>
                  </View>
                  <AppText
                    className={active ? 'text-[#4DAFFF]' : ''}
                    tone={active ? 'primary' : 'secondary'}
                    variant="caption"
                  >
                    {active ? 'Open' : 'Tap'}
                  </AppText>
                </View>
              </GlowCard>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function getFocusChartAvailability(
  kundli: KundliData,
  role: (typeof VEDIC_FOCUS_CHART_ORDER)[number],
): boolean {
  if (role === 'MOON') {
    return Boolean(kundli.moonSign);
  }

  if (role === 'CHALIT') {
    return Boolean(kundli.chalit?.status === 'ready' || kundli.bhavChalit?.status === 'ready');
  }

  return Boolean(kundli.charts[role]?.supported);
}

function PremiumMiniList({
  items,
  title,
}: {
  items: string[];
  title: string;
}): React.JSX.Element {
  return (
    <View className="gap-1">
      <AppText tone="secondary" variant="caption">
        {title}
      </AppText>
      {items.slice(0, 3).map(item => (
        <AppText key={item} tone="secondary" variant="caption">
          - {item}
        </AppText>
      ))}
    </View>
  );
}

function getChartConfig(chartType: ChartType): ChartConfig {
  const config = CHART_REGISTRY.find(item => item.id === chartType);

  if (!config) {
    throw new Error(`Unknown chart type: ${chartType}`);
  }

  return config;
}

function buildMissingChartPlaceholder(
  chartType: ChartType,
  config: ChartConfig,
  kundli: KundliData,
): ChartData {
  const d1 = kundli.charts.D1;

  return {
    ascendantSign: d1?.ascendantSign ?? kundli.lagna ?? 'Aries',
    chartType,
    housePlacements: {},
    name: config.name,
    planetDistribution: [],
    signPlacements: {},
    supported: false,
    unsupportedReason:
      `${config.name} is selected, but this Kundli does not include calculated placements for it yet. ` +
      'Predicta will not fall back to D1 or show a repeated chart as if it were calculated.',
  };
}
