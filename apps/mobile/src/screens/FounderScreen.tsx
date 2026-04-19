import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  GradientText,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';

const founderPortrait = require('../assets/founder-bhaumik-mehta.png');

const principles = [
  {
    copy:
      'Birth details and chart guidance deserve calm handling, clear consent, and thoughtful product choices.',
    title: 'Private by nature',
  },
  {
    copy:
      'Predicta explains patterns without fear, pressure, or exaggerated promises.',
    title: 'Guidance without noise',
  },
  {
    copy:
      'Kundli, dasha, chart context, reports, and chat are being shaped into one premium intelligence system.',
    title: 'One coherent experience',
  },
];

export function FounderScreen({
  navigation,
}: RootScreenProps<typeof routes.Founder>): React.JSX.Element {
  return (
    <Screen>
      <AnimatedHeader eyebrow="FOUNDER" title="Bhaumik Mehta" />

      <GlowCard contentStyle={styles.heroCard} style={styles.heroSpacing} delay={120}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Bhaumik Mehta, founder of Predicta"
          source={founderPortrait}
          style={styles.portrait}
        />
        <View style={styles.nameplate}>
          <AppText variant="subtitle">Bhaumik Mehta</AppText>
          <AppText tone="secondary" variant="caption">
            Founder, Predicta
          </AppText>
        </View>
      </GlowCard>

      <GlowCard style={styles.sectionSpacing} delay={200}>
        <AppText tone="secondary" variant="caption">
          WHY PREDICTA EXISTS
        </AppText>
        <GradientText style={styles.statementTitle} variant="title">
          Clarity without noise.
        </GradientText>
        <AppText style={styles.copy} tone="secondary">
          I built Predicta to make Vedic astrology feel precise, private,
          emotionally calm, and genuinely useful in modern life.
        </AppText>
        <AppText style={styles.copy} tone="secondary">
          A kundli carries sensitive personal context. The product around it
          should feel equally thoughtful, beautiful, and respectful.
        </AppText>
      </GlowCard>

      <GlowCard style={styles.sectionSpacing} delay={280}>
        <AppText tone="secondary" variant="caption">
          THE VISION
        </AppText>
        <AppText style={styles.visionTitle} variant="subtitle">
          A trusted Vedic intelligence companion across mobile and web.
        </AppText>
        <AppText style={styles.copy} tone="secondary">
          The goal is not to replace tradition. It is to give it a respectful
          interface, a calmer voice, and a smarter structure so people can
          explore their chart, timing, reports, and questions with confidence.
        </AppText>
      </GlowCard>

      <View style={styles.principleStack}>
        {principles.map((principle, index) => (
          <GlowCard key={principle.title} delay={340 + index * 70}>
            <View style={styles.principleHeader}>
              <View style={styles.principleDot} />
              <AppText variant="subtitle">{principle.title}</AppText>
            </View>
            <AppText style={styles.principleCopy} tone="secondary">
              {principle.copy}
            </AppText>
          </GlowCard>
        ))}
      </View>

      <GlowCard style={styles.sectionSpacing} delay={560}>
        <AppText style={styles.finalStatement} variant="subtitle">
          Predicta is for people who want their spiritual technology to feel
          intelligent, polished, private, and human.
        </AppText>
        <View style={styles.actionBlock}>
          <GlowButton
            label="Begin with Predicta"
            onPress={() => navigation.navigate(routes.Home)}
          />
        </View>
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionBlock: {
    marginTop: 22,
  },
  copy: {
    marginTop: 14,
  },
  finalStatement: {
    lineHeight: 28,
  },
  heroCard: {
    padding: 10,
  },
  heroSpacing: {
    marginTop: 32,
  },
  nameplate: {
    backgroundColor: 'rgba(10,10,15,0.76)',
    borderColor: colors.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    bottom: 24,
    left: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: 'absolute',
    right: 24,
  },
  portrait: {
    aspectRatio: 1,
    borderRadius: 18,
    height: undefined,
    width: '100%',
  },
  principleCopy: {
    marginTop: 10,
  },
  principleDot: {
    backgroundColor: colors.success,
    borderRadius: 999,
    height: 10,
    shadowColor: colors.gradient[1],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    width: 10,
  },
  principleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  principleStack: {
    gap: 16,
    marginTop: 24,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  statementTitle: {
    marginTop: 10,
  },
  visionTitle: {
    marginTop: 10,
  },
});
