import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { DestinyPassport } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type DestinyPassportCardProps = {
  onPrimaryAction?: () => void;
  passport: DestinyPassport;
};

export function DestinyPassportCard({
  onPrimaryAction,
  passport,
}: DestinyPassportCardProps): React.JSX.Element {
  const [showProof, setShowProof] = useState(false);
  const ready = passport.status === 'ready';

  async function sharePassport() {
    await Share.share({
      message: passport.shareSummary,
      title: `${passport.name} Destiny Passport`,
    });
  }

  return (
    <LinearGradient
      colors={colors.gradientMuted}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.shell}
    >
      <View style={styles.header}>
        <View>
          <AppText tone="secondary" variant="caption">
            DESTINY PASSPORT
          </AppText>
          <AppText className="mt-1" variant="title">
            {passport.name}
          </AppText>
        </View>
        <View style={styles.badge}>
          <AppText tone="secondary" variant="caption">
            Time
          </AppText>
          <AppText variant="caption">{passport.birthTimeConfidence.label}</AppText>
        </View>
      </View>

      <AppText className="mt-5" tone="secondary">
        {passport.lifeTheme}
      </AppText>

      <View style={styles.metricGrid}>
        <PassportMetric label="Rising sign (Lagna)" value={passport.lagna} />
        <PassportMetric label="Mind sign (Moon)" value={passport.moonSign} />
        <PassportMetric label="Birth star" value={passport.nakshatra} />
        <PassportMetric label="Life chapter" value={passport.currentDasha} />
      </View>

      <View style={styles.focusRow}>
        <View style={styles.focusPanel}>
          <AppText tone="secondary" variant="caption">
            Strong
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {passport.strongestHouses.length
              ? `Houses ${passport.strongestHouses.join(', ')}`
              : 'Pending'}
          </AppText>
        </View>
        <View style={styles.focusPanel}>
          <AppText tone="secondary" variant="caption">
            Care
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {passport.weakestHouses.length
              ? `Houses ${passport.weakestHouses.join(', ')}`
              : 'Pending'}
          </AppText>
        </View>
      </View>

      <View style={styles.actionPanel}>
        <AppText tone="secondary" variant="caption">
          Current caution
        </AppText>
        <AppText className="mt-1" tone="secondary">
          {passport.currentCaution}
        </AppText>
        <View style={styles.panelDivider} />
        <AppText tone="secondary" variant="caption">
          Do this now
        </AppText>
        <AppText className="mt-1">{passport.recommendedAction}</AppText>
      </View>

      <View style={styles.confidencePanel}>
        <AppText tone="secondary" variant="caption">
          Birth time confidence
        </AppText>
        <AppText className="mt-1" variant="caption">
          {passport.birthTimeConfidence.label} ·{' '}
          {passport.birthTimeConfidence.confidence}
        </AppText>
        <AppText className="mt-1" tone="secondary" variant="caption">
          {passport.birthTimeConfidence.reason}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={sharePassport}
        style={styles.shareButton}
      >
        <AppText className="font-bold text-white" variant="caption">
          Share Passport
        </AppText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowProof(value => !value)}
        style={styles.proofToggle}
      >
        <AppText className="font-bold text-[#4DAFFF]">
          {showProof ? 'Hide chart proof' : 'Why? Show chart proof'}
        </AppText>
      </Pressable>

      {showProof ? (
        <View style={styles.proofPanel}>
          {passport.evidence.slice(0, 3).map(item => (
            <AppText className="mt-2" key={item} tone="secondary" variant="caption">
              {item}
            </AppText>
          ))}
          <AppText className="mt-3" tone="secondary" variant="caption">
            Share-safe: {passport.shareSummary.replace(/\n/g, ' · ')}
          </AppText>
        </View>
      ) : null}

      {!ready && onPrimaryAction ? (
        <View className="mt-5">
          <GlowButton label="Create Kundli" onPress={onPrimaryAction} />
        </View>
      ) : null}
    </LinearGradient>
  );
}

function PassportMetric({
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
  actionPanel: {
    backgroundColor: 'rgba(10, 10, 15, 0.42)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  badge: {
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  focusPanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  focusRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  confidencePanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  metric: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 72,
    padding: 11,
    width: '48%',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  panelDivider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 12,
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
    marginTop: 14,
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: colors.gradient[0],
    borderRadius: 8,
    marginTop: 14,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shell: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
});
