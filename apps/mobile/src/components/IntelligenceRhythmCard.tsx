import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  PREDICTA_INTELLIGENCE_UI_RHYTHM,
  getPredictaSchoolIntelligencePattern,
  type PredictaIntelligenceSchool,
} from '@pridicta/astrology';

import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowCard } from './GlowCard';

type IntelligenceRhythmCardProps = {
  delay?: number;
  embedded?: boolean;
  school: PredictaIntelligenceSchool;
};

export function IntelligenceRhythmCard({
  delay = 110,
  embedded = false,
  school,
}: IntelligenceRhythmCardProps): React.JSX.Element {
  const pattern = getPredictaSchoolIntelligencePattern(school);
  const stepCopy = {
    action: pattern.action,
    evidence: pattern.evidence,
    prediction: pattern.prediction,
    safety: pattern.safety,
  };

  const content = (
    <>
      <AppText tone="secondary" variant="caption">
        PREDICTA READING FLOW
      </AppText>
      <AppText className="mt-2" variant="subtitle">
        {pattern.label}
      </AppText>
      <View style={styles.grid}>
        {PREDICTA_INTELLIGENCE_UI_RHYTHM.map(step => (
          <View key={step.id} style={styles.step}>
            <AppText tone="secondary" variant="caption">
              {step.label}
            </AppText>
            <AppText className="mt-1" variant="caption">
              {stepCopy[step.id]}
            </AppText>
          </View>
        ))}
      </View>
    </>
  );

  if (embedded) {
    return (
      <View
        style={styles.embedded}
        testID={`audit1-phase7f-${school.toLowerCase()}-rhythm`}
      >
        {content}
      </View>
    );
  }

  return (
    <GlowCard delay={delay} testID={`audit1-phase7f-${school.toLowerCase()}-rhythm`}>
      {content}
    </GlowCard>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 10,
    marginTop: 14,
  },
  embedded: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  step: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
});
