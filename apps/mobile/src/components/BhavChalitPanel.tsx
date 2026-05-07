import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ChalitBhavKpFoundation } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowCard } from './GlowCard';

type BhavChalitPanelProps = {
  foundation: ChalitBhavKpFoundation;
  onAskChalit?: () => void;
  onOpenKp?: () => void;
};

export function BhavChalitPanel({
  foundation,
  onAskChalit,
  onOpenKp,
}: BhavChalitPanelProps): React.JSX.Element {
  const bhav = foundation.bhavChalit;

  return (
    <GlowCard className="mt-7" delay={180}>
      <View style={styles.header}>
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            PARASHARI HOUSE REFINEMENT
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {bhav.title}
          </AppText>
        </View>
        <View style={styles.badge}>
          <AppText variant="caption">Not KP</AppText>
        </View>
      </View>
      <AppText className="mt-3" tone="secondary">
        {bhav.subtitle}
      </AppText>
      <View style={styles.explainBox}>
        <AppText variant="caption">Simple meaning</AppText>
        <AppText className="mt-2" tone="secondary">
          {foundation.depth === 'PREMIUM'
            ? bhav.premiumSynthesis ?? bhav.freeInsight
            : bhav.freeInsight}
        </AppText>
      </View>
      <View style={styles.metricGrid}>
        <Metric label="House shifts" value={String(bhav.shifts.length)} />
        <Metric label="Cusps" value={String(bhav.cusps.length)} />
      </View>
      <View className="mt-4 gap-2">
        {bhav.shifts.slice(0, 4).map(item => (
          <View key={item.planet} style={styles.shiftRow}>
            <AppText variant="caption">{item.planet}</AppText>
            <AppText tone="secondary" variant="caption">
              H{item.rashiHouse} to H{item.bhavHouse} · {item.shiftDirection}
            </AppText>
          </View>
        ))}
      </View>
      <View className="mt-4 flex-row flex-wrap gap-3">
        {onAskChalit ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAskChalit}
            style={styles.cta}
          >
            <AppText variant="caption">Ask Regular Predicta</AppText>
          </Pressable>
        ) : null}
        {onOpenKp ? (
          <Pressable
            accessibilityRole="button"
            onPress={onOpenKp}
            style={styles.cta}
          >
            <AppText variant="caption">Open KP Predicta</AppText>
          </Pressable>
        ) : null}
      </View>
    </GlowCard>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.metric}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText className="mt-1" variant="subtitle">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cta: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  explainBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metric: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 130,
    padding: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  shiftRow: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
});
