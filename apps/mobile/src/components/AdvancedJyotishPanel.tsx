import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  composeAdvancedJyotishCoverage,
} from '@pridicta/astrology';
import type { KundliData } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type AdvancedJyotishPanelProps = {
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  onAskPrompt?: (prompt: string) => void;
  onCreateKundli?: () => void;
};

export function AdvancedJyotishPanel({
  hasPremiumAccess = false,
  kundli,
  onAskPrompt,
  onCreateKundli,
}: AdvancedJyotishPanelProps): React.JSX.Element {
  const coverage = composeAdvancedJyotishCoverage(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
  const pattern = coverage.yogaDoshaInsights[0];
  const ashtaka = coverage.ashtakavargaDetail.slice(0, 3);

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
            ADVANCED JYOTISH
          </AppText>
          <AppText className="mt-1" variant="title">
            {coverage.title}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {coverage.subtitle}
          </AppText>
        </View>
        <View style={styles.toneBadge}>
          <AppText variant="caption">
            {coverage.depth === 'PREMIUM' ? 'Premium' : 'Free'}
          </AppText>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <AppText tone="secondary" variant="caption">
          Coverage
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {coverage.moduleRegistry.length} modules
        </AppText>
        <AppText className="mt-3" tone="secondary">
          {coverage.freePolicy}
        </AppText>
      </View>

      {coverage.status === 'pending' ? (
        <View className="mt-4">
          <GlowButton label="Create Kundli" onPress={onCreateKundli} />
        </View>
      ) : (
        <>
          <View style={styles.signalStack}>
            <Signal
              eyebrow="Birth star"
              title={`${coverage.nakshatraInsight.moonNakshatra} pada ${
                coverage.nakshatraInsight.pada || '-'
              }`}
              body={coverage.nakshatraInsight.simpleInsight}
            />
            {pattern ? (
              <Signal
                eyebrow={pattern.kind === 'yoga' ? 'Yoga' : 'Care pattern'}
                title={pattern.name}
                body={pattern.summary}
              />
            ) : null}
            <Signal
              eyebrow="Panchang"
              title={coverage.panchangMuhurta.tithi}
              body={coverage.panchangMuhurta.simpleGuidance}
            />
          </View>

          <View style={styles.monthStack}>
            <AppText tone="secondary" variant="caption">
              Strength map
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              Ashtakavarga highlights
            </AppText>
            {ashtaka.map(item => (
              <View key={item.house} style={styles.monthCard}>
                <AppText variant="subtitle">House {item.house}</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  {item.score} bindus · {item.tone}
                </AppText>
                <AppText className="mt-2" tone="secondary">
                  {item.guidance}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.overlayNote}>
            <AppText tone="secondary" variant="caption">
              Premium depth
            </AppText>
            <AppText className="mt-2" tone="secondary">
              {coverage.premiumPolicy}
            </AppText>
          </View>

          {onAskPrompt ? (
            <View style={styles.ctaStack}>
              {coverage.ctas.slice(0, 3).map(cta => (
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

function Signal({
  body,
  eyebrow,
  title,
}: {
  body: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <View style={styles.signalCard}>
      <AppText tone="secondary" variant="caption">
        {eyebrow}
      </AppText>
      <AppText className="mt-1" variant="subtitle">
        {title}
      </AppText>
      <AppText className="mt-2" tone="secondary" variant="caption">
        {body}
      </AppText>
    </View>
  );
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
