import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { routes } from '../navigation/routes';
import { deleteSavedKundli } from '../services/kundli/kundliRepository';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { KundliData } from '../types/astrology';
import { AppText } from './AppText';
import { GlowCard } from './GlowCard';

type ActiveKundliActionsProps = {
  compact?: boolean;
  kundli?: KundliData;
  showDelete?: boolean;
  sourceScreen: string;
  title?: string;
};

export function ActiveKundliActions({
  compact = false,
  kundli,
  showDelete = false,
  sourceScreen,
  title = 'Reading this Kundli',
}: ActiveKundliActionsProps): React.JSX.Element | null {
  const navigation = useNavigation<any>();
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const setPendingBirthDetailsDraft = useAppStore(
    state => state.setPendingBirthDetailsDraft,
  );
  const setPendingKundliEditId = useAppStore(
    state => state.setPendingKundliEditId,
  );
  const clearPendingBirthDetailsDraft = useAppStore(
    state => state.clearPendingBirthDetailsDraft,
  );
  const clearPendingKundliEditId = useAppStore(
    state => state.clearPendingKundliEditId,
  );
  const clearActiveKundli = useAppStore(state => state.clearActiveKundli);
  const setSavedKundlis = useAppStore(state => state.setSavedKundlis);

  if (!kundli) {
    return null;
  }

  const activeKundli = kundli;

  function switchKundli() {
    navigation.navigate(routes.SavedKundlis);
  }

  function editKundli() {
    setActiveKundli(activeKundli);
    setPendingKundliEditId(activeKundli.id);
    setPendingBirthDetailsDraft({
      city: activeKundli.birthDetails.resolvedBirthPlace?.city,
      country: activeKundli.birthDetails.resolvedBirthPlace?.country,
      date: activeKundli.birthDetails.date,
      isTimeApproximate: activeKundli.birthDetails.isTimeApproximate,
      name: activeKundli.birthDetails.name,
      placeText: activeKundli.birthDetails.place,
      state: activeKundli.birthDetails.resolvedBirthPlace?.state,
      time: activeKundli.birthDetails.time,
    });
    navigation.navigate(routes.Kundli);
  }

  function createNew() {
    clearPendingBirthDetailsDraft();
    clearPendingKundliEditId();
    navigation.navigate(routes.Kundli);
  }

  function askPredicta() {
    setActiveKundli(activeKundli);
    setActiveChartContext({
      kundliId: activeKundli.id,
      selectedSection: `Use ${activeKundli.birthDetails.name}'s active Kundli and tell me the best next reading.`,
      sourceScreen,
    });
    navigation.navigate(routes.Chat);
  }

  function deleteKundli() {
    Alert.alert(
      `Delete ${activeKundli.birthDetails.name}'s Kundli?`,
      'This removes this Kundli from your library. Old chats or reports may no longer have full chart context for this profile.',
      [
        { style: 'cancel', text: 'Keep Kundli' },
        {
          onPress: () => {
            void deleteSavedKundli(activeKundli.id).then(next => {
              setSavedKundlis(next);
              const nextActive = next[0]?.kundliData;

              if (nextActive) {
                setActiveKundli(nextActive);
              } else {
                clearActiveKundli();
              }
              navigation.navigate(routes.SavedKundlis);
            });
          },
          style: 'destructive',
          text: 'Delete',
        },
      ],
    );
  }

  return (
    <GlowCard className={compact ? 'mt-4' : 'mt-6'} delay={60}>
      <View style={styles.header}>
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            {title}
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {kundli.birthDetails.name}
          </AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            {kundli.birthDetails.date} · {kundli.birthDetails.time} ·{' '}
            {kundli.birthDetails.place}
          </AppText>
        </View>
      </View>
      <View style={styles.actionRow}>
        <QuickAction label="Switch" onPress={switchKundli} />
        <QuickAction label="Edit" onPress={editKundli} />
        <QuickAction label="New" onPress={createNew} />
        <QuickAction label="Ask Predicta" primary onPress={askPredicta} />
        {showDelete ? (
          <QuickAction danger label="Delete" onPress={deleteKundli} />
        ) : null}
      </View>
    </GlowCard>
  );
}

function QuickAction({
  danger = false,
  label,
  onPress,
  primary = false,
}: {
  danger?: boolean;
  label: string;
  onPress: () => void;
  primary?: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.action,
        primary ? styles.primaryAction : undefined,
        danger ? styles.dangerAction : undefined,
      ]}
    >
      <AppText variant="caption">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  dangerAction: {
    borderColor: 'rgba(255, 92, 122, 0.44)',
  },
  header: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryAction: {
    backgroundColor: 'rgba(123, 97, 255, 0.22)',
    borderColor: 'rgba(123, 97, 255, 0.48)',
  },
});
