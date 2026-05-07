import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { SadeSatiIntelligence } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type SadeSatiPanelProps = {
  intelligence: SadeSatiIntelligence;
  onAskPrompt?: (prompt: string) => void;
  onCreateKundli?: () => void;
};

export function SadeSatiPanel({
  intelligence,
  onAskPrompt,
  onCreateKundli,
}: SadeSatiPanelProps): React.JSX.Element {
  const windows = intelligence.windows
    .filter(item => item.status === 'current' || item.status === 'upcoming')
    .slice(0, intelligence.depth === 'PREMIUM' ? 3 : 1);

  return (
    <LinearGradient
      colors={colors.gradientMuted}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.shell}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText tone="secondary" variant="caption">
            SADE SATI + SATURN
          </AppText>
          <AppText className="mt-1" variant="title">
            {intelligence.title}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {intelligence.subtitle}
          </AppText>
        </View>
        <View style={[styles.phaseBadge, intelligence.active ? styles.phaseBadgeActive : null]}>
          <AppText variant="caption">{intelligence.phaseLabel}</AppText>
        </View>
      </View>

      <View style={styles.statusCard}>
        <AppText tone="secondary" variant="caption">
          Saturn from Moon
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {intelligence.houseFromMoon ? `House ${intelligence.houseFromMoon}` : 'Pending'}
        </AppText>
        <AppText className="mt-1" tone="secondary" variant="caption">
          {intelligence.saturnSign} Saturn · {intelligence.moonSign} Moon
        </AppText>
        <AppText className="mt-3" tone="secondary">
          {intelligence.freeInsight}
        </AppText>
      </View>

      {intelligence.status === 'pending' ? (
        <View className="mt-4">
          <GlowButton label="Create Kundli" onPress={onCreateKundli} />
        </View>
      ) : (
        <>
          <View style={styles.proofGrid}>
            {intelligence.evidence.slice(0, 4).map(item => (
              <View key={item.id} style={styles.proofCard}>
                <AppText tone="secondary" variant="caption">
                  {item.weight}
                </AppText>
                <AppText className="mt-1" variant="subtitle">
                  {item.title}
                </AppText>
                <AppText className="mt-2" tone="secondary" variant="caption">
                  {item.observation}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.windowStack}>
            <AppText tone="secondary" variant="caption">
              Saturn windows
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {intelligence.active ? 'Current pressure map' : 'Next Saturn planning map'}
            </AppText>
            {windows.map(window => (
              <View key={window.id} style={styles.windowCard}>
                <AppText variant="subtitle">{window.title}</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  {formatDate(window.startDate)} to {formatDate(window.endDate)}
                </AppText>
                <AppText className="mt-2" tone="secondary">
                  {window.guidance}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.remedyNote}>
            <AppText tone="secondary" variant="caption">
              {intelligence.premiumSynthesis ? 'Premium synthesis' : 'Remedy tone'}
            </AppText>
            <AppText className="mt-2" tone="secondary">
              {intelligence.premiumSynthesis ?? intelligence.remedies[0]}
            </AppText>
          </View>

          {onAskPrompt ? (
            <View style={styles.ctaStack}>
              {intelligence.ctas.slice(0, 3).map(cta => (
                <Pressable
                  accessibilityRole="button"
                  key={cta.id}
                  onPress={() => onAskPrompt(cta.prompt)}
                  style={styles.ctaButton}
                >
                  <AppText variant="caption">{cta.label}</AppText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      )}
    </LinearGradient>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ctaStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  phaseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  phaseBadgeActive: {
    borderColor: 'rgba(255, 77, 166, 0.42)',
  },
  proofCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  proofGrid: {
    gap: 10,
    marginTop: 14,
  },
  remedyNote: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  shell: {
    borderColor: 'rgba(77, 175, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  windowCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  windowStack: {
    marginTop: 16,
  },
});
