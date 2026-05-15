import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  Screen,
  useGlassAlert,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  deleteSavedKundli,
  listSavedKundlis,
  saveKundliToCloud,
} from '../services/kundli/kundliRepository';
import { useAppStore } from '../store/useAppStore';
import type { SavedKundliRecord } from '../types/astrology';

export function SavedKundlisScreen({
  navigation,
}: RootScreenProps<typeof routes.SavedKundlis>): React.JSX.Element {
  const auth = useAppStore(state => state.auth);
  const savedKundlis = useAppStore(state => state.savedKundlis);
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
    setPendingBirthDetailsDraft(undefined);
    clearPendingKundliEditId();
    navigation.navigate(routes.Kundli);
  }

  function askPredictaToCreate() {
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

  function askProfile(record: SavedKundliRecord) {
    setActiveKundli(record.kundliData);
    setActiveChartContext({
      kundliId: record.summary.id,
      purpose: 'family',
      selectedSection: `Use ${record.summary.name}'s saved Kundli and tell me the most useful next reading.`,
      sourceScreen: 'Saved Kundlis',
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
          <GlowButton label="Create New Kundli" onPress={createNewKundli} />
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
                      onPress={() => askProfile(record)}
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
    </Screen>
  );
}
