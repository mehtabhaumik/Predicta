import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { DailyBriefing } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type DailyBriefingCardProps = {
  briefing: DailyBriefing;
  onAskToday?: () => void;
  onCreateKundli?: () => void;
};

export function DailyBriefingCard({
  briefing,
  onAskToday,
  onCreateKundli,
}: DailyBriefingCardProps): React.JSX.Element {
  const [showProof, setShowProof] = useState(false);
  const ready = briefing.status === 'ready';

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
    flexDirection: 'row',
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
    width: '31%',
  },
  cueGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
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
  shell: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
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
