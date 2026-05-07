import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { MahadashaIntelligence } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type MahadashaIntelligencePanelProps = {
  intelligence: MahadashaIntelligence;
  onAskPrompt?: (prompt: string) => void;
  onCreateKundli?: () => void;
};

export function MahadashaIntelligencePanel({
  intelligence,
  onAskPrompt,
  onCreateKundli,
}: MahadashaIntelligencePanelProps): React.JSX.Element {
  const current = intelligence.current;
  const windows = intelligence.timingWindows.slice(
    0,
    intelligence.depth === 'PREMIUM' ? 4 : 2,
  );

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
            MAHADASHA INTELLIGENCE
          </AppText>
          <AppText className="mt-1" variant="title">
            {intelligence.title}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {intelligence.subtitle}
          </AppText>
        </View>
        <View style={styles.depthBadge}>
          <AppText variant="caption">
            {intelligence.depth === 'PREMIUM' ? 'Premium depth' : 'Free insight'}
          </AppText>
        </View>
      </View>

      <View style={styles.currentCard}>
        <AppText tone="secondary" variant="caption">
          Current chapter
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {current.mahadasha}/{current.antardasha}
        </AppText>
        {current.startDate && current.endDate ? (
          <AppText className="mt-1" tone="secondary" variant="caption">
            {formatDate(current.startDate)} to {formatDate(current.endDate)}
          </AppText>
        ) : null}
        <AppText className="mt-3" tone="secondary">
          {current.freeInsight}
        </AppText>
      </View>

      {intelligence.status === 'pending' ? (
        <View className="mt-4">
          <GlowButton label="Create Kundli" onPress={onCreateKundli} />
        </View>
      ) : (
        <>
          <View style={styles.proofGrid}>
            {current.evidence.slice(0, 4).map(item => (
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
              Timing windows
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              What to watch now
            </AppText>
            {windows.map(window => (
              <View key={window.id} style={styles.windowCard}>
                <AppText variant="subtitle">{window.title}</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  {window.timing}
                </AppText>
                <AppText className="mt-2" tone="secondary">
                  {window.practicalGuidance}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.premiumNote}>
            <AppText tone="secondary" variant="caption">
              {current.premiumSynthesis ? 'Premium synthesis' : 'Premium unlock'}
            </AppText>
            <AppText className="mt-2" tone="secondary">
              {current.premiumSynthesis ?? intelligence.premiumUnlock}
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
    day: 'numeric',
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
  currentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  depthBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  premiumNote: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
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
  shell: {
    borderColor: 'rgba(77, 175, 255, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
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
