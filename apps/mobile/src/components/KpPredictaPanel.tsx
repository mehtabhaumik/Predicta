import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ChalitBhavKpFoundation } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowCard } from './GlowCard';
import { GradientText } from './GradientText';

type KpPredictaPanelProps = {
  foundation: ChalitBhavKpFoundation;
  handoffQuestion?: string;
  hasPremiumAccess?: boolean;
  onAskKp?: () => void;
  onPremium?: () => void;
  schoolCalculationStatus?: 'idle' | 'calculating' | 'error';
};

export function KpPredictaPanel({
  foundation,
  handoffQuestion,
  hasPremiumAccess = false,
  onAskKp,
  onPremium,
  schoolCalculationStatus = 'idle',
}: KpPredictaPanelProps): React.JSX.Element {
  const kp = foundation.kp;
  const ruling = kp.rulingPlanets;

  return (
    <View className="gap-5">
      <GlowCard delay={100}>
        <View style={styles.header}>
          <View className="flex-1">
            <AppText tone="secondary" variant="caption">
              KP PREDICTA
            </AppText>
            <GradientText className="mt-1" variant="subtitle">
              A separate precision school
            </GradientText>
          </View>
          <View style={styles.badge}>
            <AppText variant="caption">KP world</AppText>
          </View>
        </View>
        <AppText className="mt-3" tone="secondary">
          KP Predicta stays inside Krishnamurti Paddhati: cusps, star lords,
          sub lords, significators, ruling planets, dasha support, and
          event-focused judgement.
        </AppText>
        <View style={styles.explainBox}>
          <AppText variant="caption">{kp.title}</AppText>
          <AppText className="mt-2" tone="secondary">
            {hasPremiumAccess
              ? kp.premiumSynthesis ?? kp.freeInsight
              : kp.freeInsight}
          </AppText>
        </View>
        {handoffQuestion ? (
          <View style={styles.handoffBox}>
            <AppText variant="caption">QUESTION RECEIVED</AppText>
            <AppText className="mt-2" tone="secondary">
              {handoffQuestion}
            </AppText>
          </View>
        ) : null}
      </GlowCard>

      {ruling ? (
        <GlowCard delay={140}>
          <AppText tone="secondary" variant="caption">
            RULING PLANETS
          </AppText>
          <View style={styles.metricGrid}>
            <Metric label="Day" value={ruling.dayLord} />
            <Metric label="Moon star" value={ruling.moonStarLord} />
            <Metric label="Moon sub" value={ruling.moonSubLord} />
            <Metric label="Lagna sub" value={ruling.lagnaSubLord} />
          </View>
        </GlowCard>
      ) : null}

      <GlowCard delay={180}>
        <AppText tone="secondary" variant="caption">
          KP CUSPS
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          12 cusps with star and sub lords
        </AppText>
        <View className="mt-4 gap-2">
          {kp.cusps.slice(0, 12).map(cusp => (
            <View key={cusp.house} style={styles.row}>
              <AppText variant="caption">Cusp {cusp.house}</AppText>
              <AppText tone="secondary" variant="caption">
                {cusp.sign} {cusp.degree.toFixed(2)}° · Star{' '}
                {cusp.lordChain.starLord} · Sub {cusp.lordChain.subLord}
              </AppText>
            </View>
          ))}
          {!kp.cusps.length ? (
            <AppText tone="secondary">
              {getKpCalculationMessage(schoolCalculationStatus)}
            </AppText>
          ) : null}
        </View>
      </GlowCard>

      <GlowCard delay={220}>
        <AppText tone="secondary" variant="caption">
          KP SIGNIFICATORS
        </AppText>
        <View className="mt-4 gap-2">
          {kp.significators.slice(0, hasPremiumAccess ? 9 : 5).map(item => (
            <View key={item.planet} style={styles.row}>
              <AppText variant="caption">
                {item.planet} · {item.strength}
              </AppText>
              <AppText tone="secondary" variant="caption">
                Houses {item.signifiesHouses.join(', ') || 'Not clear yet'}
              </AppText>
            </View>
          ))}
        </View>
        <View className="mt-4 flex-row flex-wrap gap-3">
          {onAskKp ? (
            <Pressable
              accessibilityRole="button"
              onPress={onAskKp}
              style={styles.cta}
            >
              <AppText variant="caption">Ask KP Predicta</AppText>
            </Pressable>
          ) : null}
          {onPremium ? (
            <Pressable
              accessibilityRole="button"
              onPress={onPremium}
              style={styles.cta}
            >
              <AppText variant="caption">KP Premium Depth</AppText>
            </Pressable>
          ) : null}
        </View>
      </GlowCard>
    </View>
  );
}

function getKpCalculationMessage(
  status: 'idle' | 'calculating' | 'error',
): string {
  if (status === 'calculating') {
    return 'Calculating KP cusps, star lords, and sub lords from your saved birth details...';
  }

  if (status === 'error') {
    return 'Predicta has your birth details, but KP calculation could not complete right now. Please try again shortly.';
  }

  return 'KP Predicta is preparing this layer from the saved birth profile.';
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
      <AppText className="mt-1" variant="caption">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(255,195,77,0.12)',
    borderColor: 'rgba(255,195,77,0.34)',
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
  handoffBox: {
    backgroundColor: 'rgba(116,125,255,0.12)',
    borderColor: 'rgba(116,125,255,0.34)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  metric: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 132,
    padding: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  row: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
});
