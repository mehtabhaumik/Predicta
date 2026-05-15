import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { DailyBriefing, HolisticDailyGuidance } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type DailyBriefingCardProps = {
  briefing: DailyBriefing;
  holisticGuidance?: HolisticDailyGuidance;
  onAskGuidance?: () => void;
  onAskToday?: () => void;
  onCreateKundli?: () => void;
};

export function DailyBriefingCard({
  briefing,
  holisticGuidance,
  onAskGuidance,
  onAskToday,
  onCreateKundli,
}: DailyBriefingCardProps): React.JSX.Element {
  const [showProof, setShowProof] = useState(false);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const ready = briefing.status === 'ready';
  const habitStorageKey = `predicta.dailyHabit.${briefing.language}`;
  const completedToday = completedDates.includes(briefing.date);
  const streak = useMemo(
    () => countCurrentStreak(completedDates, briefing.date),
    [briefing.date, completedDates],
  );

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(habitStorageKey)
      .then(raw => {
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw) as { dates?: unknown };
        if (Array.isArray(parsed.dates)) {
          setCompletedDates(
            parsed.dates.filter(
              (item): item is string => typeof item === 'string',
            ),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCompletedDates([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [habitStorageKey]);

  function markHabitDone() {
    const nextDates = Array.from(new Set([...completedDates, briefing.date])).sort();
    setCompletedDates(nextDates);
    AsyncStorage.setItem(habitStorageKey, JSON.stringify({ dates: nextDates })).catch(
      () => undefined,
    );
  }

  return (
    <LinearGradient
      colors={colors.gradientMuted}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.shell}
    >
      <View style={styles.header}>
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            {briefing.labels.eyebrow}
          </AppText>
          <AppText className="mt-1" variant="title">
            {briefing.title}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {briefing.subtitle}
          </AppText>
        </View>
        <View style={styles.dateBadge}>
          <AppText tone="secondary" variant="caption">
            Today
          </AppText>
          <AppText variant="caption">{briefing.date}</AppText>
        </View>
      </View>

      <View style={styles.themePanel}>
        <AppText tone="secondary" variant="caption">
          {briefing.labels.theme}
        </AppText>
        <AppText className="mt-1">{briefing.todayTheme}</AppText>
      </View>

      <View style={[styles.habitPanel, completedToday ? styles.habitDone : undefined]}>
        <View style={styles.habitHeader}>
          <View className="flex-1">
            <AppText tone="secondary" variant="caption">
              DAILY HABIT
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {completedToday ? 'Done today' : "Today's one clean action"}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {ready
                ? briefing.bestAction
                : 'Create your Kundli to make this personal.'}
            </AppText>
          </View>
          <View style={styles.streakBadge}>
            <AppText tone="secondary" variant="caption">
              Day streak
            </AppText>
            <AppText variant="subtitle">{streak}</AppText>
          </View>
        </View>
        {holisticGuidance ? (
          <View style={styles.habitRhythm}>
            <GuidanceStep label="Morning" text={holisticGuidance.morningPractice} />
            <GuidanceStep label="Midday" text={holisticGuidance.middayCheck} />
            <GuidanceStep label="Evening" text={holisticGuidance.eveningReview} />
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={completedToday}
          onPress={markHabitDone}
          style={[styles.habitDoneButton, completedToday ? styles.habitDoneButtonOff : undefined]}
        >
          <AppText className="font-bold">
            {completedToday ? 'Completed today' : 'Mark done today'}
          </AppText>
        </Pressable>
      </View>

      {holisticGuidance ? (
        <View style={styles.guidancePanel}>
          <AppText tone="secondary" variant="caption">
            HOLISTIC DAILY GUIDANCE
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {holisticGuidance.headline}
          </AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            {holisticGuidance.dailyFocus}
          </AppText>
          <View style={styles.guidanceRhythm}>
            <GuidanceStep label="Morning" text={holisticGuidance.morningPractice} />
            <GuidanceStep label="Midday" text={holisticGuidance.middayCheck} />
            <GuidanceStep label="Evening" text={holisticGuidance.eveningReview} />
          </View>
        </View>
      ) : null}

      <View style={styles.actionGrid}>
        <BriefingBlock
          label={briefing.labels.bestAction}
          text={briefing.bestAction}
        />
        <BriefingBlock
          label={briefing.labels.avoidAction}
          text={briefing.avoidAction}
        />
      </View>

      <View style={styles.weatherPanel}>
        <AppText tone="secondary" variant="caption">
          {briefing.labels.emotionalWeather}
        </AppText>
        <AppText className="mt-1" tone="secondary">
          {briefing.emotionalWeather}
        </AppText>
      </View>

      <View style={styles.cueGrid}>
        {briefing.cues.map(cue => (
          <View key={cue.area} style={styles.cueCard}>
            <AppText tone="secondary" variant="caption">
              {cue.label} · {cue.weight}
            </AppText>
            <AppText className="mt-1" tone="secondary" variant="caption">
              {cue.text}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.remedyPanel}>
        <AppText tone="secondary" variant="caption">
          {briefing.labels.remedy}
        </AppText>
        <AppText className="mt-1">{briefing.remedyMicroAction}</AppText>
      </View>

      <View style={styles.buttonStack}>
        {ready && onAskToday ? (
          <GlowButton label="Ask about today" onPress={onAskToday} />
        ) : onCreateKundli ? (
          <GlowButton label="Create Kundli" onPress={onCreateKundli} />
        ) : null}
        {ready && holisticGuidance?.status === 'ready' && onAskGuidance ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAskGuidance}
            style={styles.secondaryCta}
          >
            <AppText className="font-bold text-[#E45CAE]">
              Daily guidance
            </AppText>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowProof(value => !value)}
          style={styles.proofToggle}
        >
          <AppText className="font-bold text-[#4DAFFF]">
            {showProof ? 'Hide chart proof' : 'Why? Show chart proof'}
          </AppText>
        </Pressable>
      </View>

      {showProof ? (
        <View style={styles.proofPanel}>
          <AppText tone="secondary" variant="caption">
            {briefing.labels.proof}
          </AppText>
          {briefing.evidence.slice(0, 4).map(item => (
            <AppText className="mt-2" key={item} tone="secondary" variant="caption">
              {item}
            </AppText>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

function GuidanceStep({
  label,
  text,
}: {
  label: string;
  text: string;
}): React.JSX.Element {
  return (
    <View style={styles.guidanceStep}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText className="mt-1" variant="caption">
        {text}
      </AppText>
    </View>
  );
}

function BriefingBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}): React.JSX.Element {
  return (
    <View style={styles.actionPanel}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText className="mt-1">{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actionGrid: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 12,
  },
  actionPanel: {
    backgroundColor: 'rgba(10, 10, 15, 0.42)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  buttonStack: {
    gap: 12,
    marginTop: 14,
  },
  cueCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 11,
    width: '100%',
  },
  cueGrid: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  guidancePanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  guidanceRhythm: {
    gap: 8,
    marginTop: 12,
  },
  guidanceStep: {
    backgroundColor: 'rgba(10, 10, 15, 0.34)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  dateBadge: {
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  habitDone: {
    borderColor: 'rgba(85,214,190,0.38)',
  },
  habitDoneButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(85,214,190,0.16)',
    borderColor: 'rgba(85,214,190,0.34)',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  habitDoneButtonOff: {
    opacity: 0.72,
  },
  habitHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  habitPanel: {
    backgroundColor: 'rgba(85,214,190,0.09)',
    borderColor: 'rgba(85,214,190,0.22)',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  habitRhythm: {
    gap: 10,
    marginTop: 12,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  proofPanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  proofToggle: {
    alignItems: 'center',
    minHeight: 34,
    justifyContent: 'center',
  },
  remedyPanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  secondaryCta: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  shell: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 76,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  themePanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  weatherPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
});

function countCurrentStreak(dates: string[], today: string): number {
  const completed = new Set(dates);
  let cursor = new Date(`${today}T00:00:00.000Z`);
  if (Number.isNaN(cursor.getTime())) {
    return completed.has(today) ? 1 : 0;
  }

  let count = 0;
  while (completed.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }

  return count;
}
