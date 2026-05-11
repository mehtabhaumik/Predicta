import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { composeHolisticReadingRooms } from '@pridicta/astrology';
import { AppText, GlowButton, GlowCard, GradientText, Screen } from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function HolisticReadingRoomsScreen({
  navigation,
}: RootScreenProps<typeof routes.HolisticReadingRooms>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const rooms = composeHolisticReadingRooms(kundli);

  function askRoom(roomTitle: string, prompt: string) {
    if (!kundli) {
      navigation.navigate(routes.Kundli);
      return;
    }

    setActiveChartContext({
      handoffQuestion: prompt,
      selectedSection: roomTitle,
      sourceScreen: 'Holistic Reading Rooms',
    });
    navigation.navigate(routes.Chat);
  }

  return (
    <Screen>
      <View>
        <AppText tone="secondary" variant="caption">
          HOLISTIC READING ROOMS
        </AppText>
        <GradientText className="mt-2" variant="title">
          Guided rooms for today, karma, balance, and timing.
        </GradientText>
        <AppText className="mt-3" tone="secondary">
          Each room keeps the reading simple while using chart proof underneath.
        </AppText>
      </View>

      <GlowCard className="mt-8" delay={80}>
        <AppText tone="secondary" variant="caption">
          START ROOM
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {rooms.featuredRoom.title}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {rooms.featuredRoom.primaryFocus}
        </AppText>
        <View style={styles.chipRow}>
          {rooms.featuredRoom.proofChips.map(chip => (
            <View key={chip} style={styles.chip}>
              <AppText variant="caption">{chip}</AppText>
            </View>
          ))}
        </View>
        <View style={styles.practiceBox}>
          <AppText tone="secondary" variant="caption">
            Practice
          </AppText>
          <AppText className="mt-1" variant="caption">
            {rooms.featuredRoom.practice}
          </AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            {rooms.featuredRoom.remedy}
          </AppText>
        </View>
        <View className="mt-4">
          <GlowButton
            label={kundli ? 'Ask This Room' : 'Create Kundli First'}
            onPress={() =>
              askRoom(rooms.featuredRoom.title, rooms.featuredRoom.bestQuestion)
            }
          />
        </View>
      </GlowCard>

      <View style={styles.roomGrid}>
        {rooms.rooms.map((room, index) => (
          <Pressable
            accessibilityRole="button"
            key={room.id}
            onPress={() => askRoom(room.title, room.bestQuestion)}
            style={styles.roomPressable}
          >
            <GlowCard contentClassName="min-h-[230px]" delay={120 + index * 45}>
              <AppText tone="secondary" variant="caption">
                {room.subtitle}
              </AppText>
              <AppText className="mt-2" variant="subtitle">
                {room.title}
              </AppText>
              <AppText className="mt-2" tone="secondary" variant="caption">
                {room.primaryFocus}
              </AppText>
              <View style={styles.chipRow}>
                {room.proofChips.slice(0, 3).map(chip => (
                  <View key={chip} style={styles.chip}>
                    <AppText variant="caption">{chip}</AppText>
                  </View>
                ))}
              </View>
              <AppText className="mt-3" variant="caption">
                {room.practice}
              </AppText>
            </GlowCard>
          </Pressable>
        ))}
      </View>

      <GlowCard className="mt-7" delay={440}>
        <AppText tone="secondary" variant="caption">
          BOUNDARIES
        </AppText>
        {rooms.guardrails.map(rule => (
          <AppText className="mt-2" key={rule} tone="secondary" variant="caption">
            {rule}
          </AppText>
        ))}
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  practiceBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 22,
  },
  roomPressable: {
    width: '100%',
  },
});
