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
import { CHART_REGISTRY } from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import type { ChartConfig, ChartType } from '../types/astrology';

const primaryCharts: ChartType[] = ['D1', 'D9', 'D10'];

export function ChartsScreen({
  navigation,
}: RootScreenProps<typeof routes.Charts>): React.JSX.Element {
  const [selectedChart, setSelectedChart] = useState<ChartType>('D1');
  const [focus, setFocus] = useState<KundliChartFocus>({});
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );

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
            Indian D1, D9, and D10 charts with simple house and planet taps.
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

  const selectedConfig = getChartConfig(selectedChart);
  const chart = kundli.charts[selectedChart];

  function askFromChart() {
    setActiveChartContext({
      chartName: selectedConfig.name,
      chartType: selectedChart,
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
        {primaryCharts.map(chartType => {
          const config = getChartConfig(chartType);
          const active = selectedChart === chartType;

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
              ? `Ask about ${focus.planet} in ${selectedChart}`
              : focus.house
                ? `Ask about House ${focus.house} in ${selectedChart}`
                : `Ask Pridicta about ${selectedChart}`
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
