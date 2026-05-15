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
} from '../components';
import {
  buildChartSelectionPrompt,
  CHART_REGISTRY,
  composeChalitBhavKpFoundation,
  composeChartInsight,
  getChartTypesForAccess,
} from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import type { ChartConfig, ChartType } from '../types/astrology';

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
  const chart = kundli.charts[safeSelectedChart];
  const insight = composeChartInsight({
    chart,
    hasPremiumAccess: access.hasPremiumAccess,
  });

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

      <GlowCard className="mt-5" delay={140}>
        <AppText tone="secondary" variant="caption">
          {insight.eyebrow}
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {insight.title}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {insight.summary}
        </AppText>
        <View className="mt-4 gap-2">
          {insight.bullets.map(item => (
            <AppText key={item} tone="secondary" variant="caption">
              - {item}
            </AppText>
          ))}
        </View>
        {insight.premiumNudge ? (
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
              'Explain Bhav Chalit house shifts as a Parashari house refinement. Do not mix KP or Nadi.',
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

function getChartConfig(chartType: ChartType): ChartConfig {
  const config = CHART_REGISTRY.find(item => item.id === chartType);

  if (!config) {
    throw new Error(`Unknown chart type: ${chartType}`);
  }

  return config;
}
