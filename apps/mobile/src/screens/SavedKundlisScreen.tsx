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

  function useForChat(record: SavedKundliRecord) {
    setActiveKundli(record.kundliData);
    navigation.navigate(routes.Chat);
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

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="DEVICE + ACCOUNT" title="Saved kundlis" />
      <AppText className="mt-4" tone="secondary">
        Kundlis are saved on this device first. Account save happens only when
        you choose it.
      </AppText>
      <GlowCard className="mt-6">
        <AppText tone="secondary" variant="caption">
          FAMILY VAULT
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          Multiple Kundlis, one household library
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Create one profile for each person, choose who Predicta should read,
          and compare family patterns without mixing charts.
        </AppText>
      </GlowCard>

      <View className="mt-6 gap-4">
        {savedKundlis.length === 0 ? (
          <GlowCard>
            <AppText variant="subtitle">No saved kundlis yet</AppText>
            <AppText className="mt-2" tone="secondary">
              Generate a kundli from the Kundli screen and it will appear here.
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
                      onPress={() => useForChat(record)}
                    >
                      <AppText variant="caption">Use for Chat</AppText>
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
