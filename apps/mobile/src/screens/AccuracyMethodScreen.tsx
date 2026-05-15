import React from 'react';
import { View } from 'react-native';

import { getAccuracyMethodCopy } from '@pridicta/config/accuracyMethod';
import { getLanguageLabels } from '@pridicta/config/language';
import { AnimatedHeader, AppText, GlowCard, Screen } from '../components';
import { useAppStore } from '../store/useAppStore';

export function AccuracyMethodScreen(): React.JSX.Element {
  const language = useAppStore(state => state.languagePreference.language);
  const copy = getAccuracyMethodCopy(language);
  const labels = getLanguageLabels(language);

  return (
    <Screen>
      <AnimatedHeader eyebrow={copy.hero.eyebrow} title={copy.hero.title} />

      <GlowCard className="mt-8" delay={90}>
        <AppText tone="secondary">{copy.hero.body}</AppText>
      </GlowCard>

      <View className="mt-6 gap-4">
        {copy.pillars.map((pillar, index) => (
          <GlowCard delay={120 + index * 40} key={pillar.title}>
            <AppText variant="subtitle">{pillar.title}</AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {pillar.body}
            </AppText>
          </GlowCard>
        ))}
      </View>

      <GlowCard className="mt-7" delay={260}>
        <AppText tone="secondary" variant="caption">
          {copy.calculation.eyebrow}
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {copy.calculation.title}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {copy.calculation.body}
        </AppText>
        <View className="mt-4 gap-3">
          {copy.calculation.items.map(item => (
            <View key={`${item.label}-${item.value}`}>
              <AppText tone="secondary" variant="caption">
                {item.label}
              </AppText>
              <AppText className="mt-1" variant="subtitle">
                {item.value}
              </AppText>
              <AppText className="mt-1" tone="secondary" variant="caption">
                {item.detail}
              </AppText>
            </View>
          ))}
        </View>
      </GlowCard>

      <GlowCard className="mt-7" delay={320}>
        <AppText tone="secondary" variant="caption">
          {copy.schools.eyebrow}
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {copy.schools.title}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {copy.schools.body}
        </AppText>
        <View className="mt-4 gap-4">
          {copy.schools.items.map(school => (
            <View key={school.name}>
              <AppText variant="subtitle">{school.name}</AppText>
              <AppText className="mt-2" tone="secondary" variant="caption">
                {school.summary}
              </AppText>
              <View className="mt-2 gap-1">
                {school.proof.map(proof => (
                  <AppText key={proof} tone="secondary" variant="caption">
                    • {proof}
                  </AppText>
                ))}
              </View>
              <AppText className="mt-2" tone="secondary" variant="caption">
                {school.caution}
              </AppText>
            </View>
          ))}
        </View>
      </GlowCard>

      <GlowCard className="mt-7" delay={380}>
        <AppText tone="secondary" variant="caption">
          {copy.depth.eyebrow}
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {copy.depth.title}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {copy.depth.body}
        </AppText>
        <View className="mt-4 gap-4">
          <View>
            <AppText variant="subtitle">{labels.free}</AppText>
            {copy.depth.free.map(item => (
              <AppText
                className="mt-1"
                key={item}
                tone="secondary"
                variant="caption"
              >
                • {item}
              </AppText>
            ))}
          </View>
          <View>
            <AppText variant="subtitle">{labels.premium}</AppText>
            {copy.depth.premium.map(item => (
              <AppText
                className="mt-1"
                key={item}
                tone="secondary"
                variant="caption"
              >
                • {item}
              </AppText>
            ))}
          </View>
        </View>
      </GlowCard>

      <GlowCard className="mt-7" delay={440}>
        <AppText tone="secondary" variant="caption">
          {copy.boundaries.eyebrow}
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {copy.boundaries.title}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {copy.boundaries.body}
        </AppText>
        <View className="mt-4 gap-2">
          {copy.boundaries.items.map(item => (
            <AppText key={item} tone="secondary" variant="caption">
              • {item}
            </AppText>
          ))}
        </View>
      </GlowCard>

      <GlowCard className="mt-7" delay={500}>
        <AppText tone="secondary">{copy.cta.note}</AppText>
      </GlowCard>
    </Screen>
  );
}
