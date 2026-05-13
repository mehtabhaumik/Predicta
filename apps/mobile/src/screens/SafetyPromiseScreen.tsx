import React from 'react';
import { View } from 'react-native';

import { AnimatedHeader, AppText, GlowCard, Screen } from '../components';

const commitments = [
  {
    body: 'Predicta answers serious astrology questions as reflection, not as a replacement for qualified help or real-world judgment.',
    title: 'Guidance, not replacement',
  },
  {
    body: 'If danger appears, care comes first. Astrology reflection stays gentle, protective, and non-fatalistic.',
    title: 'Crisis comes first',
  },
  {
    body: 'Finance, medical, legal, behavior, and family questions are allowed with clear limits.',
    title: 'Serious topics are allowed',
  },
  {
    body: 'Predicta blocks harmful instructions, illegal actions, sexual content involving minors, violent guidance, and other unsafe requests.',
    title: 'Unsafe requests are blocked',
  },
  {
    body: 'Regular Predicta, KP Predicta, and Nadi Predicta stay separate so each school speaks from its own tradition.',
    title: 'Astrology schools stay separate',
  },
  {
    body: 'Nadi Predicta never claims it found or accessed a real ancient palm-leaf record.',
    title: 'No fake Nadi claims',
  },
];

const checks = [
  'Self-harm and crisis handling',
  'Medical, legal, financial, behavior, abuse, and emergency safeguards',
  'Fear-based and fatalistic predictions',
  'Hindi, Gujarati, English, and mixed-language questions',
  'Regular, KP, and Nadi Predicta separation',
  'Easy reporting when an answer feels concerning',
];

export function SafetyPromiseScreen(): React.JSX.Element {
  return (
    <Screen>
      <AnimatedHeader
        eyebrow="PUBLIC SAFETY PROMISE"
        title="Predicta is built to guide, not scare."
      />

      <GlowCard className="mt-8" delay={100}>
        <AppText variant="subtitle">Safety is part of the product.</AppText>
        <AppText className="mt-3" tone="secondary">
          Predicta gives holistic astrology guidance without fear, guarantees,
          or crisis overreach. The goal is care, not unnecessary denial.
        </AppText>
      </GlowCard>

      <View className="mt-6 gap-4">
        {commitments.map((item, index) => (
          <GlowCard delay={150 + index * 35} key={item.title}>
            <AppText tone="secondary" variant="caption">
              {String(index + 1).padStart(2, '0')}
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {item.title}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {item.body}
            </AppText>
          </GlowCard>
        ))}
      </View>

      <GlowCard className="mt-7" delay={420}>
        <AppText tone="secondary" variant="caption">
          WHAT WE PREPARE FOR
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          Risky real-world questions need calm handling.
        </AppText>
        <View className="mt-4 gap-2">
          {checks.map(check => (
            <AppText key={check} tone="secondary" variant="caption">
              • {check}
            </AppText>
          ))}
        </View>
      </GlowCard>

      <GlowCard className="mt-7" delay={520}>
        <AppText tone="secondary" variant="caption">
          FOUNDER PROMISE
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Predicta should stay useful, beautiful, and respectful during
          uncertain moments. Safety stays non-negotiable.
        </AppText>
        <AppText className="mt-4" variant="subtitle">
          Bhaumik Mehta
        </AppText>
      </GlowCard>
    </Screen>
  );
}
