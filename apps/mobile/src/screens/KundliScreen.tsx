import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  ActiveKundliActions,
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
  applyManualBirthTimeEstimate,
  attachKundliEditHistory,
  buildChartSelectionPrompt,
  composeChartInsight,
  composeDestinyPassport,
  estimateManualBirthTimeRectification,
  getChartTypesForAccess,
  getChartConfig,
  getFeaturedChartTypesForAccess,
  MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS,
  type ManualBirthTimeRectificationAnswer,
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
  const [rectificationAnswers, setRectificationAnswers] = useState<
    Record<string, ManualBirthTimeRectificationAnswer | undefined>
  >({});
  const [chartFocusByType, setChartFocusByType] = useState<
    Partial<Record<ChartType, KundliChartFocus>>
  >({});
  const [generating, setGenerating] = useState(false);
  const [activeCreationDetails, setActiveCreationDetails] =
    useState<BirthDetails | null>(null);
  const [showAllCharts, setShowAllCharts] = useState(false);
  const kundli = useAppStore(state => state.activeKundli);
  const pendingBirthDetailsDraft = useAppStore(
    state => state.pendingBirthDetailsDraft,
  );
  const pendingKundliEditId = useAppStore(state => state.pendingKundliEditId);
  const clearPendingBirthDetailsDraft = useAppStore(
    state => state.clearPendingBirthDetailsDraft,
  );
  const clearPendingKundliEditId = useAppStore(
    state => state.clearPendingKundliEditId,
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
  const rectificationEstimate = useMemo(
    () =>
      birthDetails
        ? estimateManualBirthTimeRectification({
            answers: rectificationAnswers,
            birthDetails,
          })
        : undefined,
    [birthDetails, rectificationAnswers],
  );

  const handleBirthDetailsChange = useCallback(
    (value: BirthDetails | null) => {
      setBirthDetails(value);
      setRectificationAnswers({});
    },
    [],
  );

  async function generateConfirmedKundli(
    finalDetails: BirthDetails,
    mode: 'new' | 'update' = 'new',
  ) {
    try {
      setActiveCreationDetails(finalDetails);
      setGenerating(true);
      const generated = await generateKundli(finalDetails);
      const existingKundli =
        mode === 'update' && pendingKundliEditId ? kundli : undefined;
      const nextKundli = {
        ...generated,
        id:
          mode === 'update' && pendingKundliEditId
            ? pendingKundliEditId
            : generated.id,
        birthDetails: {
          ...generated.birthDetails,
          ...finalDetails,
        },
      };
      const finalKundli = existingKundli
        ? attachKundliEditHistory({
            after: nextKundli,
            before: existingKundli,
            mode: 'update-existing',
            source: 'manual',
          })
        : mode === 'new' && pendingKundliEditId && kundli
          ? attachKundliEditHistory({
              after: nextKundli,
              before: kundli,
              mode: 'save-as-new',
              source: 'manual',
            })
          : nextKundli;
      setActiveKundli(finalKundli);
      clearPendingBirthDetailsDraft();
      clearPendingKundliEditId();
      const saved = await saveGeneratedKundliLocally(finalKundli);
      setSavedKundlis(saved);
      showGlassAlert({
        message:
          finalDetails.timeConfidence === 'rectified'
            ? `This Kundli was created with probable rectified time ${finalDetails.time}. Original entered time: ${finalDetails.originalTime ?? 'not recorded'}.`
            : mode === 'update'
              ? 'This saved Kundli was recalculated and updated.'
              : 'This Kundli was calculated and saved on this device.',
        title: mode === 'update' ? 'Kundli updated' : 'Kundli generated',
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
      setActiveCreationDetails(null);
      listSavedKundlis()
        .then(setSavedKundlis)
        .catch(() => undefined);
    }
  }

  function confirmBirthDetails(finalDetails: BirthDetails) {
    const isEditing = Boolean(pendingKundliEditId);

    showGlassAlert({
      actions: isEditing
        ? [
            { label: 'Edit' },
            {
              label: 'Save as New',
              onPress: () => {
                void generateConfirmedKundli(finalDetails, 'new');
              },
            },
            {
              label: 'Update Existing',
              onPress: () => {
                void generateConfirmedKundli(finalDetails, 'update');
              },
            },
          ]
        : [
            { label: 'Edit' },
            {
              label: 'Create Kundli',
              onPress: () => {
                void generateConfirmedKundli(finalDetails);
              },
            },
          ],
      message: [
        finalDetails.name,
        `${finalDetails.date} at ${finalDetails.time}`,
        finalDetails.place,
        `Timezone: ${finalDetails.timezone}`,
        isEditing
          ? 'Changing birth details recalculates the chart. Choose whether to update this saved Kundli or keep the old one and save a new Kundli.'
          : undefined,
        finalDetails.timeConfidence === 'rectified'
          ? `Rectified time. Original entered time: ${finalDetails.originalTime ?? 'not recorded'}`
          : 'Entered time confirmed.',
      ]
        .filter(Boolean)
        .join('\n'),
      title: isEditing ? 'Confirm updated birth details' : 'Confirm birth details',
    });
  }

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

    if (birthDetails.isTimeApproximate) {
      showGlassAlert({
        actions: [
          { label: 'Edit' },
          {
            label: 'Use entered time',
            onPress: () =>
              confirmBirthDetails({
                ...birthDetails,
                isTimeApproximate: false,
                timeConfidence: 'entered',
              }),
          },
        ],
        message:
          'You marked birth time as approximate. You can use the entered time, or answer the yes/no questions on this screen so Predicta can estimate a probable corrected time.',
        title: 'Birth time is approximate',
      });
      return;
    }

    confirmBirthDetails({
      ...birthDetails,
      timeConfidence: 'entered',
    });
  }

  function chooseRectificationAnswer(
    questionId: string,
    answer: ManualBirthTimeRectificationAnswer,
  ) {
    setRectificationAnswers(current => ({
      ...current,
      [questionId]: answer,
    }));
  }

  function useProbableRectifiedTime() {
    if (!birthDetails || !rectificationEstimate) {
      return;
    }

    confirmBirthDetails(
      applyManualBirthTimeEstimate(birthDetails, rectificationEstimate),
    );
  }

  return (
    <Screen>
      {glassAlert}
      {generating && activeCreationDetails ? (
        <KundliCreationOverlay birthDetails={activeCreationDetails} />
      ) : null}
      <AnimatedHeader
        eyebrow={pendingKundliEditId ? 'EDIT KUNDLI' : 'STEP 1'}
        title={pendingKundliEditId ? 'Edit saved Kundli' : 'Create your Kundli'}
      />

      <ActiveKundliActions
        compact
        kundli={kundli}
        showDelete
        sourceScreen="Kundli"
        title="Active Kundli"
      />

      <GlassPanel className="mt-7" delay={100}>
        <AppText variant="subtitle">Enter birth details in order</AppText>
        <AppText className="mt-2" tone="secondary">
          {pendingKundliEditId
            ? 'Change only what is wrong. Predicta will confirm before recalculating.'
            : 'Fill date, time, and place. Predicta handles the calculation details quietly after you confirm.'}
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
            label={generating ? 'Calculating...' : 'Continue'}
            loading={generating}
            onPress={calculate}
          />
        </View>
      </GlassPanel>

      {birthDetails?.isTimeApproximate ? (
        <GlassPanel className="mt-7" delay={130}>
          <AppText tone="secondary" variant="caption">
            BIRTH TIME CHECK
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            Re-check approximate time
          </AppText>
          <AppText className="mt-2" tone="secondary">
            Answer yes or no. If you prefer your entered time, tap Continue and
            choose “Use entered time”.
          </AppText>
          <View className="mt-5 gap-4">
            {MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.map(question => (
              <View key={question.id}>
                <AppText>{question.question}</AppText>
                <View className="mt-3 flex-row gap-3">
                  {(['yes', 'no'] as const).map(answer => (
                    <Pressable
                      accessibilityRole="button"
                      className={`rounded-full border px-4 py-3 ${
                        rectificationAnswers[question.id] === answer
                          ? 'bg-[#252533]'
                          : 'bg-transparent'
                      }`}
                      key={answer}
                      onPress={() =>
                        chooseRectificationAnswer(question.id, answer)
                      }
                    >
                      <AppText variant="caption">
                        {answer === 'yes' ? 'Yes' : 'No'}
                      </AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
          {rectificationEstimate?.answeredCount ===
          MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.length ? (
            <View className="mt-5">
              <AppText variant="subtitle">
                Probable time: {rectificationEstimate.probableTime}
              </AppText>
              <AppText className="mt-2" tone="secondary">
                {rectificationEstimate.summary}
              </AppText>
              <View className="mt-4">
                <GlowButton
                  label="Use probable time"
                  onPress={useProbableRectifiedTime}
                />
              </View>
            </View>
          ) : null}
        </GlassPanel>
      ) : null}

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
            {kundli.birthDetails.timeConfidence === 'rectified' ? (
              <AppText className="mt-2" tone="secondary" variant="caption">
                Rectified time. Original entered time:{' '}
                {kundli.birthDetails.originalTime ?? 'not recorded'}.
              </AppText>
            ) : null}
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

function KundliCreationOverlay({
  birthDetails,
}: {
  birthDetails: BirthDetails;
}): React.JSX.Element {
  const corrected = birthDetails.timeConfidence === 'rectified';

  return (
    <View style={styles.creationOverlay}>
      <View style={styles.creationCard}>
        <View style={styles.creationBoard}>
          {Array.from({ length: 12 }, (_, index) => (
            <View key={index} style={styles.creationHouse} />
          ))}
        </View>
        <AppText variant="subtitle">Drawing your Kundli</AppText>
        <AppText className="mt-2 text-center" tone="secondary" variant="caption">
          Lines are forming, signs are settling, and planets will take their
          houses after calculation.
        </AppText>
        <AppText className="mt-3 text-center" tone="secondary" variant="caption">
          {corrected
            ? `Using probable rectified time ${birthDetails.time}. Original entered time: ${birthDetails.originalTime ?? 'not recorded'}.`
            : `Using confirmed entered time ${birthDetails.time}.`}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  creationBoard: {
    aspectRatio: 1,
    backgroundColor: 'rgba(10, 10, 15, 0.72)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    padding: 10,
    width: 180,
  },
  creationCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 18, 28, 0.98)',
    borderColor: 'rgba(77, 175, 255, 0.3)',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    width: '88%',
  },
  creationHouse: {
    backgroundColor: 'rgba(77, 175, 255, 0.12)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    width: 48,
  },
  creationOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(5, 5, 10, 0.76)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 18,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 40,
  },
});
