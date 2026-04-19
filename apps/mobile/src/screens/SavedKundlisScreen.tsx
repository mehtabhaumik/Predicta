import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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
      <AppText style={styles.introCopy} tone="secondary">
        Kundlis are saved locally first. Cloud sync happens only when you choose
        it.
      </AppText>

      <View style={styles.list}>
        {savedKundlis.length === 0 ? (
          <GlowCard>
            <AppText variant="subtitle">No saved kundlis yet</AppText>
            <AppText style={styles.cardCopy} tone="secondary">
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
                  <View style={styles.recordHeader}>
                    <View style={styles.recordCopy}>
                      <AppText variant="subtitle">
                        {record.summary.name}
                      </AppText>
                      <AppText style={styles.cardCopy} tone="secondary">
                        {record.summary.birthDate} at {record.summary.birthTime}
                      </AppText>
                      <AppText tone="secondary">
                        {record.summary.birthPlace}
                      </AppText>
                      <AppText
                        style={styles.metaText}
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
                        style={styles.cloudButton}
                        onPress={() =>
                          showGlassAlert({
                            message:
                              'This kundli is saved to your cloud account, so you can restore it after reinstalling the app or signing in on another device. Kundlis without this icon are saved only on this device.',
                            title: 'Saved to cloud',
                          })
                        }
                      >
                        <AppText style={styles.cloudIcon}>☁</AppText>
                      </Pressable>
                    ) : null}
                  </View>
                </Pressable>

                <View style={styles.actionBlock}>
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

const styles = StyleSheet.create({
  actionBlock: {
    marginTop: 22,
  },
  cardCopy: {
    marginTop: 8,
  },
  cloudButton: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cloudIcon: {
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  introCopy: {
    marginTop: 16,
  },
  list: {
    gap: 16,
    marginTop: 28,
  },
  metaText: {
    marginTop: 12,
  },
  recordCopy: {
    flex: 1,
    paddingRight: 12,
  },
  recordHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
});
