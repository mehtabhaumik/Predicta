import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  BirthDetailsForm,
  DestinyPassportCard,
  GlassPanel,
  GlowButton,
  GlowCard,
  GradientOutlineCard,
  KundliChart,
  type KundliChartFocus,
  Screen,
  useGlassAlert,
} from '../components';
import {
  buildChartSelectionPrompt,
  composeChartInsight,
  composeDestinyPassport,
  getChartTypesForAccess,
  getChartConfig,
  getFeaturedChartTypesForAccess,
} from '@pridicta/astrology';
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

export function KundliScreen({
  navigation,
}: RootScreenProps<typeof routes.Kundli>): React.JSX.Element {
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [chartFocusByType, setChartFocusByType] = useState<
    Partial<Record<ChartType, KundliChartFocus>>
  >({});
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
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const access = getResolvedAccess();
  const { glassAlert, showGlassAlert } = useGlassAlert();
  const chartList = useMemo(
    () =>
      showAllCharts
        ? getChartTypesForAccess(true)
        : getFeaturedChartTypesForAccess(access.hasPremiumAccess),
    [access.hasPremiumAccess, showAllCharts],
  );
  const destinyPassport = composeDestinyPassport(kundli);

  const handleBirthDetailsChange = useCallback(
    (value: BirthDetails | null) => setBirthDetails(value),
    [],
  );

  function askFromChart(chartType: ChartType, focus?: KundliChartFocus) {
    const chartConfig = getChartConfig(chartType);

    setActiveChartContext({
      chartName: chartConfig.name,
      chartType,
      purpose: chartConfig.purpose,
      selectedHouse: focus?.house,
      selectedPlanet: focus?.planet,
      selectedSection: buildChartSelectionPrompt({
        chartName: chartConfig.name,
        chartType,
        purpose: chartConfig.purpose,
        selectedHouse: focus?.house,
        selectedPlanet: focus?.planet,
        sourceScreen: 'Kundli',
      }),
      sourceScreen: 'Kundli',
    });
    navigation.navigate(routes.Chat);
  }

  function updateChartFocus(chartType: ChartType, focus: KundliChartFocus) {
    setChartFocusByType(current => ({
      ...current,
      [chartType]: focus,
    }));
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
                  'This Kundli was calculated and saved on this device.',
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
      <AnimatedHeader eyebrow="STEP 1" title="Create your Kundli" />

      <GlassPanel className="mt-7" delay={100}>
        <AppText variant="subtitle">Enter birth details in order</AppText>
        <AppText className="mt-2" tone="secondary">
          Fill date, time, and place. Predicta handles the calculation details
          quietly after you confirm.
        </AppText>
        {pendingBirthDetailsDraft ? (
          <AppText className="mt-3" tone="secondary">
            I prefilled what Predicta understood from chat. Please verify it
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
          <View className="mt-7">
            <DestinyPassportCard passport={destinyPassport} />
          </View>

          <View className="mt-5">
            <GlowButton
              label="Open Life Timeline"
              onPress={() => navigation.navigate(routes.LifeTimeline)}
            />
          </View>

          <GlassPanel className="mt-7" delay={160}>
            <AppText tone="secondary" variant="caption">
              STEP 2 · SIMPLE SUMMARY
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {kundli.birthDetails.name}'s kundli is ready
            </AppText>
            <AppText className="mt-2" tone="secondary">
              Rising sign means starting style. Moon sign means emotional
              pattern. Dasha means current life chapter.
            </AppText>
            <View className="mt-5 flex-row gap-3">
              <View className="flex-1">
                <AppText tone="secondary" variant="caption">
                  Rising sign
                </AppText>
                <AppText className="mt-1" variant="subtitle">
                  {kundli.lagna}
                </AppText>
              </View>
              <View className="flex-1">
                <AppText tone="secondary" variant="caption">
                  Birth star
                </AppText>
                <AppText className="mt-1" variant="subtitle">
                  {kundli.nakshatra}
                </AppText>
              </View>
            </View>
            <AppText className="mt-4" tone="secondary" variant="caption">
              {kundli.birthDetails.date} at {kundli.birthDetails.time} ·{' '}
              {kundli.birthDetails.place}
            </AppText>
          </GlassPanel>

          <View className="mt-7 gap-4">
            {chartList.map((chartType, index) => {
              const chartConfig = getChartConfig(chartType);
              const chart = kundli.charts[chartType];
              const focus = chartFocusByType[chartType];
              const insight = composeChartInsight({
                chart,
                hasPremiumAccess: access.hasPremiumAccess,
              });

              return (
                <GlowCard key={chartType} delay={220 + index * 50}>
                  <AppText tone="secondary" variant="caption">
                    {chartType} • {chartConfig.name}
                  </AppText>
                  <AppText className="mt-2" variant="subtitle">
                    {chartConfig.purpose}
                  </AppText>
                  <View className="mt-4">
                    <AppText tone="secondary" variant="caption">
                      {insight.eyebrow}
                    </AppText>
                    <AppText className="mt-1" tone="secondary" variant="caption">
                      {insight.summary}
                    </AppText>
                  </View>
                  <View className="mt-4">
                    <KundliChart
                      chart={chart}
                      onFocusChange={nextFocus =>
                        updateChartFocus(chartType, nextFocus)
                      }
                      selectedHouse={focus?.house}
                      selectedPlanet={focus?.planet}
                    />
                  </View>
                  <View className="mt-5">
                    <GlowButton
                      label={
                        focus?.planet
                          ? `Ask about ${focus.planet} in ${chartType}`
                          : focus?.house
                            ? `Ask about House ${focus.house} in ${chartType}`
                            : `Ask Predicta about ${chartType}`
                      }
                      onPress={() => askFromChart(chartType, focus)}
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
                {showAllCharts ? 'Show Featured Charts' : 'View All Charts'}
              </AppText>
              <AppText className="mt-2" tone="secondary">
                Every chart is visible in free. Premium changes the depth:
                detailed analysis, D1 anchoring, timing, and report-ready
                synthesis.
              </AppText>
            </GradientOutlineCard>
          </Pressable>
        </>
      ) : null}
    </Screen>
  );
}
