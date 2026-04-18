import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  BirthDetailsForm,
  GlassPanel,
  GlowButton,
  GlowCard,
  GradientOutlineCard,
  KundliChart,
  Screen,
  useGlassAlert,
} from '../components';
import { CHART_REGISTRY, getChartConfig } from '../data/chartRegistry';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { generateKundli } from '../services/astrology/astroEngine';
import {
  listSavedKundlis,
  saveGeneratedKundliLocally,
} from '../services/kundli/kundliRepository';
import { useAppStore } from '../store/useAppStore';
import type { BirthDetails, ChartType } from '../types/astrology';
import { validateBirthDetails } from '../utils/validateBirthDetails';

const visibleCharts: ChartType[] = ['D1', 'D9', 'D10'];

export function KundliScreen({
  navigation,
}: RootScreenProps<typeof routes.Kundli>): React.JSX.Element {
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showAllCharts, setShowAllCharts] = useState(false);
  const kundli = useAppStore(state => state.activeKundli);
  const pendingBirthDetailsDraft = useAppStore(
    state => state.pendingBirthDetailsDraft,
  );
  const clearPendingBirthDetailsDraft = useAppStore(
    state => state.clearPendingBirthDetailsDraft,
  );
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const setSavedKundlis = useAppStore(state => state.setSavedKundlis);
  const { glassAlert, showGlassAlert } = useGlassAlert();
  const chartList = useMemo(
    () =>
      showAllCharts ? CHART_REGISTRY.map(chart => chart.id) : visibleCharts,
    [showAllCharts],
  );

  const handleBirthDetailsChange = useCallback(
    (value: BirthDetails | null) => setBirthDetails(value),
    [],
  );

  function askFromChart(chartType: ChartType) {
    const chartConfig = getChartConfig(chartType);

    setActiveChartContext({
      chartName: chartConfig.name,
      chartType,
      purpose: chartConfig.purpose,
      sourceScreen: 'Kundli',
    });
    navigation.navigate(routes.Chat);
  }

  async function calculate() {
    if (!birthDetails) {
      showGlassAlert({
        message:
          'Please choose the birth country, state or province, and city before generating the kundli.',
        title: 'Complete birth details',
      });
      return;
    }

    const validation = validateBirthDetails(birthDetails);

    if (!validation.valid) {
      showGlassAlert({
        message: validation.errors.join('\n'),
        title: 'Check birth details',
      });
      return;
    }

    showGlassAlert({
      actions: [
        { label: 'Cancel' },
        {
          label: 'Generate',
          onPress: async () => {
            try {
              setGenerating(true);
              const nextKundli = await generateKundli(birthDetails);
              setActiveKundli(nextKundli);
              clearPendingBirthDetailsDraft();
              const saved = await saveGeneratedKundliLocally(nextKundli);
              setSavedKundlis(saved);
              showGlassAlert({
                message:
                  'This kundli was calculated and saved locally on this device.',
                title: 'Kundli generated',
              });
            } catch (error) {
              showGlassAlert({
                message:
                  error instanceof Error
                    ? error.message
                    : 'Please verify birth details and try again.',
                title: 'Calculation failed',
              });
            } finally {
              setGenerating(false);
              listSavedKundlis()
                .then(setSavedKundlis)
                .catch(() => undefined);
            }
          },
        },
      ],
      message: [
        birthDetails.name,
        `${birthDetails.date} at ${birthDetails.time}`,
        birthDetails.place,
        `Timezone: ${birthDetails.timezone}`,
        birthDetails.isTimeApproximate ? 'Birth time marked approximate' : '',
      ].join('\n'),
      title: 'Confirm birth details',
    });
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="REAL VEDIC ENGINE" title="Kundli profile" />

      <GlassPanel className="mt-7" delay={100}>
        <AppText variant="subtitle">Generate real kundli</AppText>
        <AppText className="mt-2" tone="secondary">
          Pridicta calculates only after your birth date, birth time, birth
          place, and timezone are verified.
        </AppText>
        {pendingBirthDetailsDraft ? (
          <AppText className="mt-3" tone="secondary">
            I prefilled what Pridicta understood from chat. Please verify it
            before generating.
          </AppText>
        ) : null}
        <View className="mt-5">
          <BirthDetailsForm
            initialDraft={pendingBirthDetailsDraft}
            onChange={handleBirthDetailsChange}
          />
        </View>
        <View className="mt-5">
          <GlowButton
            label={generating ? 'Calculating...' : 'Generate Real Kundli'}
            loading={generating}
            onPress={calculate}
          />
        </View>
      </GlassPanel>

      {kundli ? (
        <>
          <GlassPanel className="mt-7" delay={160}>
            <AppText variant="subtitle">{kundli.birthDetails.name}</AppText>
            <AppText className="mt-2" tone="secondary">
              {kundli.birthDetails.date} at {kundli.birthDetails.time}
            </AppText>
            <AppText tone="secondary">{kundli.birthDetails.place}</AppText>
            <View className="mt-5 flex-row gap-3">
              <View className="flex-1">
                <AppText tone="secondary" variant="caption">
                  Lagna
                </AppText>
                <AppText className="mt-1" variant="subtitle">
                  {kundli.lagna}
                </AppText>
              </View>
              <View className="flex-1">
                <AppText tone="secondary" variant="caption">
                  Nakshatra
                </AppText>
                <AppText className="mt-1" variant="subtitle">
                  {kundli.nakshatra}
                </AppText>
              </View>
            </View>
          </GlassPanel>

          <View className="mt-7 gap-4">
            {chartList.map((chartType, index) => {
              const chartConfig = getChartConfig(chartType);
              const chart = kundli.charts[chartType];

              return (
                <GlowCard key={chartType} delay={220 + index * 50}>
                  <AppText tone="secondary" variant="caption">
                    {chartType} • {chartConfig.name}
                  </AppText>
                  <AppText className="mt-2" variant="subtitle">
                    {chartConfig.purpose}
                  </AppText>
                  <View className="mt-4">
                    <KundliChart chart={chart} />
                  </View>
                  <View className="mt-5">
                    <GlowButton
                      label={`Ask Pridicta about ${chartType}`}
                      onPress={() => askFromChart(chartType)}
                    />
                  </View>
                </GlowCard>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowAllCharts(value => !value)}
          >
            <GradientOutlineCard className="mt-7" delay={460}>
              <AppText variant="subtitle">
                {showAllCharts ? 'Show Core Charts' : 'View All Charts'}
              </AppText>
              <AppText className="mt-2" tone="secondary">
                Advanced charts are listed from the registry. Unverified
                formulas are marked as not enabled instead of showing fake data.
              </AppText>
            </GradientOutlineCard>
          </Pressable>
        </>
      ) : null}
    </Screen>
  );
}
