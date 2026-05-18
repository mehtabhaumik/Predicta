import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  buildChartRenderModel,
  type ChartRenderSchool,
} from '@pridicta/astrology';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  Screen,
  useGlassAlert,
} from '../components';
import { KundliChart } from '../components/charts/KundliChart';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  deleteSavedKundli,
  listSavedKundlis,
  saveKundliToCloud,
} from '../services/kundli/kundliRepository';
import { useAppStore } from '../store/useAppStore';
import type { SavedKundliRecord, SupportedLanguage } from '../types/astrology';

export function SavedKundlisScreen({
  navigation,
}: RootScreenProps<typeof routes.SavedKundlis>): React.JSX.Element {
  const auth = useAppStore(state => state.auth);
  const savedKundlis = useAppStore(state => state.savedKundlis);
  const languagePreference = useAppStore(state => state.languagePreference);
  const activeKundli = useAppStore(state => state.activeKundli);
  const clearActiveKundli = useAppStore(state => state.clearActiveKundli);
  const setPendingBirthDetailsDraft = useAppStore(
    state => state.setPendingBirthDetailsDraft,
  );
  const clearPendingKundliEditId = useAppStore(
    state => state.clearPendingKundliEditId,
  );
  const setPendingKundliEditId = useAppStore(
    state => state.setPendingKundliEditId,
  );
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const setSavedKundlis = useAppStore(state => state.setSavedKundlis);
  const { glassAlert, showGlassAlert } = useGlassAlert();
  const [chartDialog, setChartDialog] = useState<
    { record: SavedKundliRecord; school: ChartRenderSchool } | undefined
  >();
  const chartLanguage =
    languagePreference.chartLanguage ??
    languagePreference.appLanguage ??
    languagePreference.language ??
    'en';

  useEffect(() => {
    listSavedKundlis()
      .then(setSavedKundlis)
      .catch(() => undefined);
  }, [setSavedKundlis]);

  async function cloudSave(record: SavedKundliRecord) {
    if (!auth.isLoggedIn || !auth.userId) {
      showGlassAlert({
        actions: [
          { label: 'Not Now' },
          {
            label: 'Open Sign In',
            onPress: () => navigation.navigate(routes.Login),
          },
        ],
        message:
          'Cloud sync is optional. Sign in before saving this kundli online.',
        title: 'Sign-in required',
      });
      return;
    }

    try {
      const next = await saveKundliToCloud(auth.userId, record.kundliData);
      setSavedKundlis(next);
    } catch (error) {
      showGlassAlert({
        message:
          error instanceof Error
            ? error.message
            : 'Your Kundli is still safe on this device.',
        title: 'Cloud save failed',
      });
    }
  }

  function openRecord(record: SavedKundliRecord) {
    setActiveKundli(record.kundliData);
    navigation.navigate(routes.Kundli);
  }

  function setAsActive(record: SavedKundliRecord) {
    setActiveKundli(record.kundliData);
  }

  function createNewKundli() {
    if (!auth.isLoggedIn && savedKundlis.length >= 1) {
      showGlassAlert({
        actions: [
          { label: 'Not Now' },
          {
            label: 'Sign In',
            onPress: () => navigation.navigate(routes.Login),
          },
        ],
        message:
          'You can keep one Kundli without signing in. Sign in to add family profiles, save multiple Kundlis, and restore them later.',
        title: 'Sign in to save more Kundlis',
      });
      return;
    }

    setPendingBirthDetailsDraft(undefined);
    clearPendingKundliEditId();
    navigation.navigate(routes.Kundli);
  }

  function askPredictaToCreate() {
    if (!auth.isLoggedIn && savedKundlis.length >= 1) {
      showGlassAlert({
        actions: [
          { label: 'Not Now' },
          {
            label: 'Sign In',
            onPress: () => navigation.navigate(routes.Login),
          },
        ],
        message:
          'Predicta can help after sign-in. Guest use keeps one Kundli in this app, and your existing Kundli remains safe.',
        title: 'Sign in before adding another Kundli',
      });
      return;
    }

    setPendingBirthDetailsDraft(undefined);
    clearPendingKundliEditId();
    setActiveChartContext({
      selectedSection:
        'Create a new Kundli. Ask only for missing birth details and confirm before calculation.',
      sourceScreen: 'Kundli Library',
    });
    navigation.navigate(routes.Chat);
  }

  function editRecord(record: SavedKundliRecord) {
    const { birthDetails } = record.kundliData;
    setActiveKundli(record.kundliData);
    setPendingBirthDetailsDraft({
      city: birthDetails.resolvedBirthPlace?.city,
      country: birthDetails.resolvedBirthPlace?.country,
      date: birthDetails.date,
      isTimeApproximate: birthDetails.isTimeApproximate,
      name: birthDetails.name,
      placeText: birthDetails.place,
      state: birthDetails.resolvedBirthPlace?.state,
      time: birthDetails.time,
    });
    setPendingKundliEditId(record.summary.id);
    navigation.navigate(routes.Kundli);
  }

  function askProfile(
    record: SavedKundliRecord,
    school: ChartRenderSchool = 'PARASHARI',
  ) {
    const chartLabel = school === 'PARASHARI' ? 'D1' : school === 'KP' ? 'KP' : 'Nadi';
    const selectedSection =
      school === 'PARASHARI'
        ? `Use ${record.summary.name}'s saved Kundli and tell me the most useful next reading.`
        : `Use ${record.summary.name}'s ${chartLabel} preview from Kundli Library and keep the answer in ${chartLabel} context.`;

    setActiveKundli(record.kundliData);
    setActiveChartContext({
      chartName: 'D1',
      chartType: 'D1',
      handoffQuestion: selectedSection,
      kundliId: record.summary.id,
      predictaSchool: school,
      purpose: school === 'PARASHARI' ? 'family' : school.toLowerCase(),
      selectedSection,
      sourceScreen: 'Kundli Library',
    });
    navigation.navigate(routes.Chat);
  }

  function openFamilyMap(record: SavedKundliRecord) {
    setActiveKundli(record.kundliData);
    navigation.navigate(routes.FamilyKarmaMap);
  }

  function requestDelete(record: SavedKundliRecord) {
    showGlassAlert({
      actions: [
        { label: 'Keep Kundli' },
        {
          label: 'Delete',
          onPress: () => {
            void deleteRecord(record);
          },
        },
      ],
      message:
        'This removes this Kundli from your library. Old chats or reports may no longer have full chart context for this profile.',
      title: `Delete ${record.summary.name}'s Kundli?`,
    });
  }

  async function deleteRecord(record: SavedKundliRecord) {
    const next = await deleteSavedKundli(record.summary.id);
    setSavedKundlis(next);

    if (activeKundli?.id === record.summary.id) {
      const nextActive = next[0]?.kundliData;

      if (nextActive) {
        setActiveKundli(nextActive);
      } else {
        clearActiveKundli();
      }
    }
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="KUNDLI LIBRARY" title="Kundli Library" />
      <AppText className="mt-4" tone="secondary">
        This is your saved Kundli storage. Choose the active profile for
        Predicta. Family Vault uses these saved profiles for family patterns.
      </AppText>
      <GlowCard className="mt-6">
        <AppText tone="secondary" variant="caption">
          KUNDLI LIBRARY ACTIONS
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          Create, switch, edit, or delete from one place
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Start a new Kundli manually or ask Predicta to collect the birth
          details from chat.
        </AppText>
        <View className="mt-5 gap-3">
          <GlowButton
            label={
              !auth.isLoggedIn && savedKundlis.length >= 1
                ? 'Sign in to add another Kundli'
                : 'Create New Kundli'
            }
            onPress={createNewKundli}
          />
          <Pressable
            accessibilityRole="button"
            className="rounded-full border border-[#252533] bg-[#191923] px-4 py-3"
            onPress={askPredictaToCreate}
          >
            <AppText variant="caption">Ask Predicta to Create</AppText>
          </Pressable>
        </View>
      </GlowCard>
      <GlowCard className="mt-6">
        <AppText tone="secondary" variant="caption">
          FAMILY VAULT
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          Family layer for saved Kundlis
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Use your saved Kundlis as family profiles, compare patterns, and
          later invite family members when shared permissions are ready.
        </AppText>
      </GlowCard>

      <View className="mt-6 gap-4">
        {savedKundlis.length === 0 ? (
          <GlowCard>
            <AppText variant="subtitle">Your Kundli Library is empty</AppText>
            <AppText className="mt-2" tone="secondary">
              Generate a Kundli from the Kundli screen. It will appear here
              first, then Family Vault can use it as a family profile.
            </AppText>
          </GlowCard>
        ) : (
          savedKundlis.map(record => {
            const isCloud = record.summary.syncStatus === 'CLOUD_SYNCED';

            return (
              <GlowCard key={record.summary.id}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openRecord(record)}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <AppText variant="subtitle">
                        {record.summary.name}
                      </AppText>
                      <AppText className="mt-2" tone="secondary">
                        {record.summary.birthDate} at {record.summary.birthTime}
                      </AppText>
                      <AppText tone="secondary">
                        {record.summary.birthPlace}
                      </AppText>
                      <AppText
                        className="mt-3"
                        tone="secondary"
                        variant="caption"
                      >
                        Lagna {record.summary.lagna} • Moon{' '}
                        {record.summary.moonSign}
                      </AppText>
                      {record.kundliData.editHistory?.length ? (
                        <AppText
                          className="mt-2"
                          tone="secondary"
                          variant="caption"
                        >
                          Edited {record.kundliData.editHistory.length}{' '}
                          {record.kundliData.editHistory.length === 1
                            ? 'time'
                            : 'times'}{' '}
                          · Last change:{' '}
                          {record.kundliData.editHistory[0]?.fieldsChanged.join(
                            ', ',
                          ) || 'birth details'}
                        </AppText>
                      ) : null}
                      <MiniChartStrip
                        chartLanguage={chartLanguage}
                        kundli={record.kundliData}
                        onOpenPreview={school =>
                          setChartDialog({ record, school })
                        }
                      />
                    </View>
                    {isCloud ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() =>
                          showGlassAlert({
                            message:
                              'This Kundli is saved with your account, so you can restore it after reinstalling the app or signing in on another device. Kundlis without this icon are saved only on this device.',
                            title: 'Saved to cloud',
                          })
                        }
                      >
                        <AppText className="text-xl">☁</AppText>
                      </Pressable>
                    ) : null}
                  </View>
                </Pressable>

                <View className="mt-5">
                  <View className="mb-3 flex-row flex-wrap gap-3">
                    <Pressable
                      accessibilityRole="button"
                      className="rounded-full border border-[#252533] bg-[#191923] px-4 py-3"
                      onPress={() => openRecord(record)}
                    >
                      <AppText variant="caption">Open</AppText>
                    </Pressable>
                    {activeKundli?.id !== record.summary.id ? (
                      <Pressable
                        accessibilityRole="button"
                        className="rounded-full border border-[#252533] bg-[#191923] px-4 py-3"
                        onPress={() => setAsActive(record)}
                      >
                        <AppText variant="caption">Set Active</AppText>
                      </Pressable>
                    ) : null}
                    <Pressable
                      accessibilityRole="button"
                      className="rounded-full border border-[#252533] bg-[#191923] px-4 py-3"
                      onPress={() => editRecord(record)}
                    >
                      <AppText variant="caption">Edit</AppText>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      className="rounded-full border border-[#4DAFFF] bg-[#172233] px-4 py-3"
                      onPress={() => askProfile(record, 'PARASHARI')}
                    >
                      <AppText variant="caption">Ask Predicta</AppText>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      className="rounded-full border border-[#252533] bg-[#191923] px-4 py-3"
                      onPress={() => openFamilyMap(record)}
                    >
                      <AppText variant="caption">Family Map</AppText>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      className="rounded-full border border-[#61404a] bg-[#27171c] px-4 py-3"
                      onPress={() => requestDelete(record)}
                    >
                      <AppText variant="caption">Delete</AppText>
                    </Pressable>
                  </View>
                  <GlowButton
                    label={isCloud ? 'Saved to Cloud' : 'Save to Cloud'}
                    disabled={isCloud}
                    onPress={() => cloudSave(record)}
                  />
                </View>
              </GlowCard>
            );
          })
        )}
      </View>
      {chartDialog ? (
        <LibraryChartDialog
          onAskPredicta={(record, school) => askProfile(record, school)}
          onClose={() => setChartDialog(undefined)}
          onDelete={record => requestDelete(record)}
          onEdit={record => editRecord(record)}
          onOpenFull={record => {
            setActiveKundli(record.kundliData);
            setActiveChartContext({
              chartName: 'D1',
              chartType: 'D1',
              handoffQuestion:
                chartDialog.school === 'PARASHARI'
                  ? `Open ${record.summary.name}'s saved D1 Kundli from the library.`
                  : `Open ${record.summary.name}'s ${chartDialog.school} room from the library.`,
              kundliId: record.summary.id,
              predictaSchool: chartDialog.school,
              selectedSection:
                chartDialog.school === 'PARASHARI'
                  ? `${record.summary.name}'s saved D1 Kundli`
                  : `${record.summary.name}'s ${chartDialog.school} chart preview`,
              sourceScreen: 'Kundli Library',
            });
            setChartDialog(undefined);
            navigation.navigate(
              chartDialog.school === 'KP'
                ? routes.KpPredicta
                : chartDialog.school === 'NADI'
                  ? routes.NadiPredicta
                  : routes.Kundli,
            );
          }}
          onSetActive={record => setAsActive(record)}
          selection={chartDialog}
        />
      ) : null}
    </Screen>
  );
}

function MiniChartStrip({
  chartLanguage,
  kundli,
  onOpenPreview,
}: {
  chartLanguage: SupportedLanguage;
  kundli: SavedKundliRecord['kundliData'];
  onOpenPreview: (school: ChartRenderSchool) => void;
}): React.JSX.Element | null {
  const chart = kundli.charts.D1;

  if (!chart?.supported) {
    return null;
  }

  return (
    <View style={styles.miniStrip}>
      {(['PARASHARI', 'KP', 'NADI'] as ChartRenderSchool[]).map(school => (
        <MiniChartPreview
          chartLanguage={chartLanguage}
          key={`${kundli.id}-${school}`}
          kundli={kundli}
          label={school === 'PARASHARI' ? 'D1' : school === 'KP' ? 'KP' : 'Nadi'}
          onOpen={() => onOpenPreview(school)}
          school={school}
        />
      ))}
    </View>
  );
}

function MiniChartPreview({
  chartLanguage,
  kundli,
  label,
  onOpen,
  school,
}: {
  chartLanguage: SupportedLanguage;
  kundli: SavedKundliRecord['kundliData'];
  label: string;
  onOpen: () => void;
  school: ChartRenderSchool;
}): React.JSX.Element | null {
  const chart = kundli.charts.D1;

  if (!chart?.supported) {
    return null;
  }

  const model = buildChartRenderModel({
    birthDetails: kundli.birthDetails,
    chart,
    language: chartLanguage,
    school,
  });

  return (
    <Pressable
      accessibilityLabel={`${label} chart preview`}
      accessibilityRole="button"
      onPress={onOpen}
      style={styles.miniChart}
    >
      <View style={styles.miniLineDown} />
      <View style={styles.miniLineUp} />
      <View style={styles.miniDiamondTopLeft} />
      <View style={styles.miniDiamondTopRight} />
      <View style={styles.miniDiamondBottomLeft} />
      <View style={styles.miniDiamondBottomRight} />
      <View style={styles.miniChartTitle}>
        <AppText variant="caption">{label}</AppText>
      </View>
      {model.cells.map(cell => (
        <View
          key={`${school}-${cell.key}`}
          style={[
            styles.miniCell,
            {
              left: `${cell.x}%`,
              top: `${cell.y}%`,
            },
          ]}
        >
          <AppText variant="caption">{cell.signNumber}</AppText>
          {cell.renderPlanets.length ? (
            <View
              style={[
                styles.miniPlanetCount,
                school === 'KP'
                  ? styles.miniPlanetCountKp
                  : school === 'NADI'
                    ? styles.miniPlanetCountNadi
                    : undefined,
              ]}
            >
              <AppText variant="caption">{cell.renderPlanets.length}</AppText>
            </View>
          ) : null}
        </View>
      ))}
    </Pressable>
  );
}

function LibraryChartDialog({
  onAskPredicta,
  onClose,
  onDelete,
  onEdit,
  onOpenFull,
  onSetActive,
  selection,
}: {
  onAskPredicta: (record: SavedKundliRecord, school: ChartRenderSchool) => void;
  onClose: () => void;
  onDelete: (record: SavedKundliRecord) => void;
  onEdit: (record: SavedKundliRecord) => void;
  onOpenFull: (record: SavedKundliRecord) => void;
  onSetActive: (record: SavedKundliRecord) => void;
  selection: { record: SavedKundliRecord; school: ChartRenderSchool };
}): React.JSX.Element {
  const { record, school } = selection;
  const chart = record.kundliData.charts.D1;
  const chartLabel = school === 'PARASHARI' ? 'D1' : school === 'KP' ? 'KP' : 'Nadi';

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible
    >
      <View style={styles.dialogBackdrop}>
        <View style={styles.dialogPanel}>
          <View style={styles.dialogHeader}>
            <View style={styles.dialogHeaderText}>
              <AppText tone="secondary" variant="caption">
                SAVED CHART PREVIEW
              </AppText>
              <AppText className="mt-1" variant="subtitle">
                {record.summary.name}'s {chartLabel} chart
              </AppText>
              <AppText className="mt-2" tone="secondary">
                {record.summary.birthDate} at {record.summary.birthTime} ·{' '}
                {record.summary.birthPlace}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.dialogClose}
            >
              <AppText variant="caption">Close</AppText>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.dialogScroll}>
            {chart?.supported ? (
              <KundliChart chart={chart} />
            ) : (
              <GlowCard>
                <AppText variant="subtitle">Chart not ready</AppText>
                <AppText className="mt-2" tone="secondary">
                  Open the Kundli to recalculate this chart.
                </AppText>
              </GlowCard>
            )}
            <View style={styles.dialogActions}>
              <GlowButton
                label={
                  school === 'PARASHARI'
                    ? 'Open Full Kundli'
                    : school === 'KP'
                      ? 'Open KP Room'
                      : 'Open Nadi Room'
                }
                onPress={() => onOpenFull(record)}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onClose();
                  onAskPredicta(record, school);
                }}
                style={styles.dialogActionButton}
              >
                <AppText variant="caption">Ask Predicta</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onSetActive(record);
                  onClose();
                }}
                style={styles.dialogActionButton}
              >
                <AppText variant="caption">Set Active</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onClose();
                  onEdit(record);
                }}
                style={styles.dialogActionButton}
              >
                <AppText variant="caption">Edit</AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onClose();
                  onDelete(record);
                }}
                style={[styles.dialogActionButton, styles.dialogDangerButton]}
              >
                <AppText variant="caption">Delete</AppText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  miniCell: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 2,
    justifyContent: 'center',
    minHeight: 16,
    minWidth: 16,
    paddingHorizontal: 3,
    position: 'absolute',
    transform: [{ translateX: -8 }, { translateY: -8 }],
    zIndex: 2,
  },
  miniChart: {
    aspectRatio: 1.62,
    backgroundColor: 'rgba(12, 12, 20, 0.92)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    minHeight: 72,
    overflow: 'hidden',
    position: 'relative',
  },
  miniChartTitle: {
    backgroundColor: 'rgba(10, 10, 15, 0.78)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 999,
    borderWidth: 1,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    position: 'absolute',
    top: 6,
    zIndex: 3,
  },
  miniDiamondBottomLeft: {
    backgroundColor: 'rgba(244, 241, 255, 0.36)',
    height: 1,
    left: '25%',
    position: 'absolute',
    top: '75%',
    transform: [{ rotate: '-34deg' }],
    width: '36%',
  },
  miniDiamondBottomRight: {
    backgroundColor: 'rgba(244, 241, 255, 0.36)',
    height: 1,
    position: 'absolute',
    right: '25%',
    top: '75%',
    transform: [{ rotate: '34deg' }],
    width: '36%',
  },
  miniDiamondTopLeft: {
    backgroundColor: 'rgba(244, 241, 255, 0.36)',
    height: 1,
    left: '25%',
    position: 'absolute',
    top: '25%',
    transform: [{ rotate: '34deg' }],
    width: '36%',
  },
  miniDiamondTopRight: {
    backgroundColor: 'rgba(244, 241, 255, 0.36)',
    height: 1,
    position: 'absolute',
    right: '25%',
    top: '25%',
    transform: [{ rotate: '-34deg' }],
    width: '36%',
  },
  miniLineDown: {
    backgroundColor: 'rgba(244, 241, 255, 0.34)',
    height: 1,
    left: '-18%',
    position: 'absolute',
    top: '50%',
    transform: [{ rotate: '32deg' }],
    width: '136%',
  },
  miniLineUp: {
    backgroundColor: 'rgba(244, 241, 255, 0.34)',
    height: 1,
    left: '-18%',
    position: 'absolute',
    top: '50%',
    transform: [{ rotate: '-32deg' }],
    width: '136%',
  },
  miniPlanetCount: {
    alignItems: 'center',
    backgroundColor: 'rgba(77, 175, 255, 0.18)',
    borderColor: 'rgba(77, 175, 255, 0.32)',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 14,
    minWidth: 14,
    justifyContent: 'center',
  },
  miniPlanetCountKp: {
    backgroundColor: 'rgba(255, 195, 77, 0.16)',
    borderColor: 'rgba(255, 195, 77, 0.32)',
  },
  miniPlanetCountNadi: {
    backgroundColor: 'rgba(255, 93, 184, 0.16)',
    borderColor: 'rgba(255, 93, 184, 0.32)',
  },
  miniStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  dialogActionButton: {
    alignItems: 'center',
    backgroundColor: '#191923',
    borderColor: '#252533',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dialogActions: {
    gap: 10,
    marginTop: 14,
  },
  dialogBackdrop: {
    backgroundColor: 'rgba(4, 4, 9, 0.82)',
    flex: 1,
    justifyContent: 'center',
    padding: 14,
  },
  dialogClose: {
    backgroundColor: '#191923',
    borderColor: '#252533',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dialogDangerButton: {
    backgroundColor: '#27171c',
    borderColor: '#61404a',
  },
  dialogHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dialogHeaderText: {
    flex: 1,
  },
  dialogPanel: {
    backgroundColor: '#101018',
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 18,
    borderWidth: 1,
    maxHeight: '92%',
    padding: 14,
  },
  dialogScroll: {
    paddingBottom: 6,
  },
});
