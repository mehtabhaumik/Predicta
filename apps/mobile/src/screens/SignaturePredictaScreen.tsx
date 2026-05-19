import React from 'react';
import { StyleSheet, View } from 'react-native';
import { composeSignatureAnalysisModel } from '@pridicta/astrology';

import {
  ActiveKundliActions,
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function SignaturePredictaScreen({
  navigation,
}: RootScreenProps<typeof routes.SignaturePredicta>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const model = composeSignatureAnalysisModel();

  return (
    <Screen>
      <AnimatedHeader
        eyebrow="SIGNATURE PREDICTA"
        title="Signature reading room"
      />
      <ActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Signature Predicta"
        title="Signature reading profile"
      />
      <View className="gap-5">
        <GlowCard delay={100}>
          <AppText tone="secondary" variant="caption">
            SIGNATURE PREDICTA
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Self-expression from signature traits.
          </AppText>
          <AppText className="mt-3" tone="secondary">
            Signature Predicta reads visible signature traits as reflection,
            not identity proof, medical diagnosis, legal proof, or hiring
            advice.
          </AppText>
        </GlowCard>

        <GlowCard delay={140}>
          <AppText tone="secondary" variant="caption">
            WHAT THIS ROOM NEEDS
          </AppText>
          <View className="mt-4 gap-3">
            {model.practicePrompts.slice(0, 4).map(step => (
              <View key={step} style={styles.row}>
                <AppText tone="secondary" variant="caption">
                  {step}
                </AppText>
              </View>
            ))}
          </View>
        </GlowCard>

        <GlowCard delay={180}>
          <AppText tone="secondary" variant="caption">
            ROOM BOUNDARY
          </AppText>
          <AppText className="mt-2" tone="secondary">
            Signature Predicta stays focused on signature traits and optional
            name rhythm. It should only combine Numerology or Kundli context
            when you explicitly ask for synthesis.
          </AppText>
          <View className="mt-5">
            <GlowButton
              label="Chat with Signature Predicta"
              onPress={() => {
                setActiveChartContext({
                  handoffFrom: 'PARASHARI',
                  handoffQuestion:
                    'Read my signature traits safely and suggest practical improvements.',
                  predictaSchool: 'SIGNATURE',
                  selectedSection:
                    'Read my signature traits safely and suggest practical improvements. If you need a signature sample or visible traits, ask me clearly first.',
                  sourceScreen: 'Signature Predicta',
                });
                navigation.navigate(routes.Chat);
              }}
            />
          </View>
        </GlowCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
});
