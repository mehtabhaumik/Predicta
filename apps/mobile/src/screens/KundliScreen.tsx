import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
  SkeletonCard,
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
import { colors } from '../theme/colors';
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

      <GlassPanel style={styles.firstPanel} delay={100}>
        <AppText variant="subtitle">Generate real kundli</AppText>
        <AppText style={styles.copyText} tone="secondary">
          Predicta calculates only after your birth date, birth time, birth
          place, and timezone are verified.
        </AppText>
        {pendingBirthDetailsDraft ? (
          <AppText style={styles.prefillText} tone="secondary">
            I prefilled what Predicta understood from chat. Please verify it
            before generating.
          </AppText>
        ) : null}
        <View style={styles.formBlock}>
          <BirthDetailsForm
            initialDraft={pendingBirthDetailsDraft}
            onChange={handleBirthDetailsChange}
          />
        </View>
        <View style={styles.actionBlock}>
          <GlowButton
            label={generating ? 'Calculating...' : 'Generate Real Kundli'}
            loading={generating}
            onPress={calculate}
          />
        </View>
        {generating ? (
          <View style={styles.loadingBlock}>
            <AppText tone="secondary" variant="caption">
              PREPARING KUNDLI
            </AppText>
            <SkeletonCard rows={3} style={styles.loadingSkeleton} />
          </View>
        ) : null}
      </GlassPanel>

      {kundli ? (
        <>
          <GlassPanel delay={160} style={styles.generatedPanel}>
            <AppText variant="subtitle">{kundli.birthDetails.name}</AppText>
            <AppText style={styles.copyText} tone="secondary">
              {kundli.birthDetails.date} at {kundli.birthDetails.time}
            </AppText>
            <AppText tone="secondary">{kundli.birthDetails.place}</AppText>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <AppText tone="secondary" variant="caption">
                  Lagna
                </AppText>
                <AppText style={styles.metricValue} variant="subtitle">
                  {kundli.lagna}
                </AppText>
              </View>
              <View style={styles.metricItem}>
                <AppText tone="secondary" variant="caption">
                  Nakshatra
                </AppText>
                <AppText style={styles.metricValue} variant="subtitle">
                  {kundli.nakshatra}
                </AppText>
              </View>
            </View>
          </GlassPanel>

          <View style={styles.chartList}>
            {chartList.map((chartType, index) => {
              const chartConfig = getChartConfig(chartType);
              const chart = kundli.charts[chartType];

              return (
                <GlowCard key={chartType} delay={220 + index * 50}>
                  <AppText tone="secondary" variant="caption">
                    {chartType} • {chartConfig.name}
                  </AppText>
                  <AppText style={styles.copyText} variant="subtitle">
                    {chartConfig.purpose}
                  </AppText>
                  <View style={styles.chartBlock}>
                    <KundliChart chart={chart} />
                  </View>
                  <View style={styles.actionBlock}>
                    <GlowButton
                      label={`Ask Predicta about ${chartType}`}
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
            <GradientOutlineCard delay={460} style={styles.viewAllCard}>
              <AppText variant="subtitle">
                {showAllCharts ? 'Show Core Charts' : 'View All Charts'}
              </AppText>
              <AppText style={styles.copyText} tone="secondary">
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

const styles = StyleSheet.create({
  actionBlock: {
    marginTop: 22,
  },
  chartBlock: {
    marginTop: 18,
  },
  chartList: {
    gap: 18,
    marginTop: 28,
  },
  copyText: {
    marginTop: 8,
  },
  firstPanel: {
    marginTop: 28,
  },
  formBlock: {
    marginTop: 22,
  },
  generatedPanel: {
    marginTop: 28,
  },
  loadingBlock: {
    gap: 12,
    marginTop: 22,
  },
  loadingSkeleton: {
    backgroundColor: colors.glassWash,
  },
  metricItem: {
    flex: 1,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 22,
  },
  metricValue: {
    marginTop: 4,
  },
  prefillText: {
    marginTop: 12,
  },
  viewAllCard: {
    marginTop: 28,
  },
});
