import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  KundliChart,
  type KundliChartFocus,
  Screen,
} from '../components';
import {
  CHART_REGISTRY,
  canAccessChartType,
  getChartTypesForAccess,
  getPremiumChartPreviewLabel,
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

  if (!kundli) {
    return (
      <Screen>
        <AnimatedHeader
          eyebrow="NORTH INDIAN CHART"
          title="Create Kundli first"
        />
        <GlowCard className="mt-7" delay={100}>
          <AppText variant="subtitle">No confusing sample chart here.</AppText>
          <AppText className="mt-2" tone="secondary">
            Create your Kundli first. Then this screen will show your North
            Indian D1 chart. Premium unlocks deeper varga charts with simple
            house and planet taps.
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

  const safeSelectedChart = canAccessChartType(
    selectedChart,
    access.hasPremiumAccess,
  )
    ? selectedChart
    : 'D1';
  const selectedConfig = getChartConfig(safeSelectedChart);
  const chart = kundli.charts[safeSelectedChart];

  function askFromChart() {
    setActiveChartContext({
      chartName: selectedConfig.name,
      chartType: safeSelectedChart,
      purpose: selectedConfig.purpose,
      selectedHouse: focus.house,
      selectedPlanet: focus.planet,
      sourceScreen: 'Charts',
    });
    navigation.navigate(routes.Chat);
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="NORTH INDIAN CHART" title="Charts" />

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
        {!access.hasPremiumAccess ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate(routes.Paywall)}
          >
            <GlowCard delay={180}>
              <AppText tone="secondary" variant="caption">
                PREMIUM CHARTS LOCKED
              </AppText>
              <AppText className="mt-1" variant="subtitle">
                Go deeper after D1
              </AppText>
              <AppText className="mt-2" tone="secondary" variant="caption">
                Free users see the Rashi chart only. Premium unlocks{' '}
                {getPremiumChartPreviewLabel()} without showing unverified
                formulas as real proof.
              </AppText>
            </GlowCard>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-7">
        <KundliChart
          chart={chart}
          onFocusChange={setFocus}
          selectedHouse={focus.house}
          selectedPlanet={focus.planet}
        />
      </View>

      <View className="mt-5">
        <GlowButton
          label={
            focus.planet
              ? `Ask about ${focus.planet} in ${safeSelectedChart}`
              : focus.house
                ? `Ask about House ${focus.house} in ${safeSelectedChart}`
                : `Ask Pridicta about ${safeSelectedChart}`
          }
          onPress={askFromChart}
        />
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
