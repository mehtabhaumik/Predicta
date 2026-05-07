import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { TransitGocharIntelligence } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type TransitGocharPanelProps = {
  intelligence: TransitGocharIntelligence;
  onAskPrompt?: (prompt: string) => void;
  onCreateKundli?: () => void;
};

export function TransitGocharPanel({
  intelligence,
  onAskPrompt,
  onCreateKundli,
}: TransitGocharPanelProps): React.JSX.Element {
  const signals = [
    ...intelligence.topOpportunities.slice(0, 2),
    ...intelligence.cautionSignals.slice(0, 2),
  ];

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
            TRANSIT + GOCHAR
          </AppText>
          <AppText className="mt-1" variant="title">
            {intelligence.title}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {intelligence.subtitle}
          </AppText>
        </View>
        <View style={styles.toneBadge}>
          <AppText variant="caption">{intelligence.dominantWeight}</AppText>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <AppText tone="secondary" variant="caption">
          Calculated
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {formatDate(intelligence.calculatedAt)}
        </AppText>
        <AppText className="mt-3" tone="secondary">
          {intelligence.snapshotSummary}
        </AppText>
      </View>

      {intelligence.status === 'pending' ? (
        <View className="mt-4">
          <GlowButton label="Create Kundli" onPress={onCreateKundli} />
        </View>
      ) : (
        <>
          <View style={styles.signalStack}>
            {signals.map(signal => (
              <View key={signal.id} style={styles.signalCard}>
                <AppText tone="secondary" variant="caption">
                  {signal.weight}
                </AppText>
                <AppText className="mt-1" variant="subtitle">
                  {signal.headline}
                </AppText>
                <AppText className="mt-2" tone="secondary" variant="caption">
                  {signal.practicalGuidance}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.monthStack}>
            <AppText tone="secondary" variant="caption">
              Planning cards
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              Next transit moves
            </AppText>
            {intelligence.monthlyCards.slice(0, 3).map(card => (
              <View key={card.id} style={styles.monthCard}>
                <AppText variant="subtitle">{card.monthLabel}</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  {card.planets.join(', ') || 'Gochar'}
                </AppText>
                <AppText className="mt-2" tone="secondary">
                  {card.guidance}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.overlayNote}>
            <AppText tone="secondary" variant="caption">
              Dasha overlay
            </AppText>
            <AppText className="mt-2" tone="secondary">
              {intelligence.dashaOverlay}
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
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  monthCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  monthStack: {
    marginTop: 16,
  },
  overlayNote: {
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
  signalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  signalStack: {
    gap: 10,
    marginTop: 14,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  toneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
