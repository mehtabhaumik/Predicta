import React from 'react';
import { View } from 'react-native';

import { AnimatedHeader, AppText, GlowButton, GlowCard, Screen } from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';

const principles = [
  {
    body: 'Birth details, saved Kundlis, and personal guidance must be handled with restraint, clarity, and respect.',
    title: 'Privacy by temperament',
  },
  {
    body: 'Predicta should explain chart patterns calmly. It should not sell fear, certainty, or dependency.',
    title: 'Guidance without pressure',
  },
  {
    body: 'Regular Predicta, KP Predicta, and Nadi Predicta should stay clear in method, purpose, and safety boundaries.',
    title: 'Clear astrology schools',
  },
  {
    body: 'The product must be easy enough for a new user while keeping serious Jyotish depth in the background.',
    title: 'Depth without confusion',
  },
];

export function FounderVisionScreen({
  navigation,
}: RootScreenProps<typeof routes.FounderVision>): React.JSX.Element {
  return (
    <Screen>
      <AnimatedHeader
        eyebrow="FOUNDER VISION"
        title="Clarity without noise."
      />

      <GlowCard className="mt-8" delay={100}>
        <AppText variant="subtitle">
          Predicta is built to make holistic Vedic astrology precise, private,
          calm, and useful.
        </AppText>
        <AppText className="mt-3" tone="secondary">
          Deep chart wisdom should not feel confusing, intimidating, or cheaply
          packaged. A Kundli carries personal context and deserves a thoughtful
          experience.
        </AppText>
      </GlowCard>

      <View className="mt-6 gap-4">
        {principles.map((principle, index) => (
          <GlowCard delay={150 + index * 45} key={principle.title}>
            <AppText variant="subtitle">{principle.title}</AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {principle.body}
            </AppText>
          </GlowCard>
        ))}
      </View>

      <GlowCard className="mt-7" delay={420}>
        <AppText tone="secondary" variant="caption">
          THE VISION
        </AppText>
        <AppText className="mt-2" tone="secondary">
          A trusted astrology companion across mobile and web, with chart proof,
          safety, privacy, and calm design.
        </AppText>
        <AppText className="mt-4" variant="subtitle">
          Bhaumik Mehta
        </AppText>
      </GlowCard>

      <View className="mt-7">
        <GlowButton
          label="Read Safety Promise"
          onPress={() => navigation.navigate(routes.SafetyPromise)}
        />
      </View>
    </Screen>
  );
}
