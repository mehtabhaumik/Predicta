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
            : 'Your local kundli is still safe on this device.',
        title: 'Cloud save failed',
      });
    }
  }

  function openRecord(record: SavedKundliRecord) {
    setActiveKundli(record.kundliData);
    navigation.navigate(routes.Kundli);
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="LOCAL + CLOUD" title="Saved kundlis" />
      <AppText className="mt-4" tone="secondary">
        Kundlis are saved locally first. Cloud sync happens only when you choose
        it.
      </AppText>
      <GlowCard className="mt-6">
        <AppText tone="secondary" variant="caption">
          FAMILY VAULT
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          Multiple Kundlis, one household library
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Premium Family Vault should let the account owner invite family
          members and decide who can chat with each saved profile.
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
                              'This kundli is saved to your cloud account, so you can restore it after reinstalling the app or signing in on another device. Kundlis without this icon are saved only on this device.',
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
