import React from 'react';
import { StyleSheet, View } from 'react-native';
import { composeNumerologyFoundationModel } from '@pridicta/astrology';

import {
  ActiveKundliActions,
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  IntelligenceRhythmCard,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function NumerologyPredictaScreen({
  navigation,
}: RootScreenProps<typeof routes.NumerologyPredicta>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const profile = composeNumerologyFoundationModel(kundli?.birthDetails);
  const hasProfile = profile.status === 'ready';

  return (
    <Screen>
      <AnimatedHeader
        eyebrow="NUMEROLOGY PREDICTA"
        title="Number reading room"
      />
      <ActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Numerology Predicta"
        title="Numerology reading profile"
      />
      <View className="gap-5">
        <GlowCard delay={100}>
          <AppText tone="secondary" variant="caption">
            NUMEROLOGY PREDICTA
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            {hasProfile ? profile.name : 'Create a Kundli first'}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {hasProfile
              ? profile.summary
              : 'Numerology needs a saved name and birth date. Create or select a Kundli, then this room can read name rhythm and personal timing.'}
          </AppText>
          {hasProfile ? (
            <>
              <AppText className="mt-3" tone="secondary" variant="caption">
                Life Theme Sentence
              </AppText>
              <AppText className="mt-1" tone="secondary">
                {profile.identityDashboard.lifeThemeSentence}
              </AppText>
            </>
          ) : null}
        </GlowCard>

        <IntelligenceRhythmCard delay={112} school="NUMEROLOGY" />

        <GlowCard delay={120}>
          <AppText tone="secondary" variant="caption">
            PERSONAL NUMBER MANDALA
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Your Number Signature
          </AppText>
          <View style={styles.grid}>
            {profile.identityDashboard.mandalaNodes.map(node => (
              <View
                accessibilityLabel={node.accessibleLabel}
                key={node.id}
                style={[styles.metricCard, { borderColor: node.colorToken }]}
              >
                <AppText tone="secondary" variant="caption">
                  {node.label}
                </AppText>
                <AppText className="mt-1" variant="subtitle">
                  {hasProfile ? String(node.number) : 'Pending'}
                </AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  {hasProfile ? node.keyword : 'Waiting for saved details'}
                </AppText>
              </View>
            ))}
          </View>
        </GlowCard>

        <GlowCard delay={135}>
          <AppText tone="secondary" variant="caption">
            NAME ENERGY SCANNER
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Name Energy Scanner
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            Name Rhythm
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {hasProfile
              ? profile.identityDashboard.nameScanner.reducedExpression
              : 'Name scanner is pending until a saved name is available.'}
          </AppText>
          <View style={styles.chipRow}>
            {profile.identityDashboard.nameScanner.steps
              .slice(0, 18)
              .map((step, index) => (
                <View key={`${step.letter}-${index}`} style={styles.chip}>
                  <AppText variant="caption">
                    {step.letter} {step.value}
                  </AppText>
                </View>
              ))}
          </View>
          <AppText className="mt-3" tone="secondary">
            {profile.identityDashboard.firstLetterInfluence}
          </AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            Reduced-motion friendly: scanner states are also shown as readable
            steps.
          </AppText>
        </GlowCard>

        <View style={styles.grid}>
          <GlowCard delay={145} style={styles.metricCard}>
            <AppText tone="secondary" variant="caption">
              BIRTH CODE
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {hasProfile
                ? `${profile.birthNumber.root} / ${profile.destinyNumber.root}`
                : 'Pending'}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {profile.identityDashboard.maturityDirection}
            </AppText>
          </GlowCard>
          <GlowCard delay={150} style={styles.metricCard}>
            <AppText tone="secondary" variant="caption">
              CURRENT CYCLE
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {hasProfile
                ? `Y${profile.personalYear.root} · M${profile.personalMonth.root} · D${profile.personalDay.root}`
                : 'Pending'}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {profile.identityDashboard.bestUseOfCurrentCycle}
            </AppText>
          </GlowCard>
        </View>

        <GlowCard delay={160}>
          <AppText tone="secondary" variant="caption">
            PERSONAL YEAR TIMELINE
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Best Use Of This Cycle
          </AppText>
          <View style={styles.grid}>
            {profile.identityDashboard.personalYearTimeline.map(month => (
              <View key={month.monthLabel} style={styles.timelineCard}>
                <AppText tone="secondary" variant="caption">
                  {month.monthLabel}
                </AppText>
                <AppText variant="caption">
                  {month.cycleNumber} · {month.keyword}
                </AppText>
              </View>
            ))}
          </View>
        </GlowCard>

        <GlowCard delay={170}>
          <AppText tone="secondary" variant="caption">
            STRENGTHS & CAUTIONS
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Practical number guidance
          </AppText>
          <AppText className="mt-3" tone="secondary">
            Strengths: {profile.strengths.slice(0, 4).join(', ') || 'Pending'}
          </AppText>
          <AppText className="mt-2" tone="secondary">
            Cautions: {profile.cautions.slice(0, 3).join(', ') || 'Pending'}
          </AppText>
          <AppText className="mt-2" tone="secondary">
            {profile.identityDashboard.freeInsight}
          </AppText>
        </GlowCard>

        <GlowCard delay={175}>
          <AppText tone="secondary" variant="caption">
            MISSING / REPEATED NUMBER PATTERN
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Missing/Repeated Number Grid
          </AppText>
          <View style={styles.grid}>
            {profile.identityDashboard.frequencyMap.map(cell => (
              <View key={cell.number} style={styles.timelineCard}>
                <AppText tone="secondary" variant="caption">
                  {cell.tone}
                </AppText>
                <AppText variant="subtitle">{cell.number}</AppText>
                <AppText tone="secondary" variant="caption">
                  {cell.count} · {cell.keyword}
                </AppText>
              </View>
            ))}
          </View>
        </GlowCard>

        <GlowCard delay={178}>
          <AppText tone="secondary" variant="caption">
            NAME REFINEMENT
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Name Fit Score
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {profile.identityDashboard.nameRefinement.currentNameFit.summary}
          </AppText>
          <AppText className="mt-2" tone="secondary">
            {profile.identityDashboard.nameRefinement.comparisonNote}
          </AppText>
        </GlowCard>

        <GlowCard delay={179}>
          <AppText tone="secondary" variant="caption">
            COMPATIBILITY
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Numerology Compatibility Lens
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {profile.identityDashboard.compatibilityLens.howToWorkBetter}
          </AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            Status: {profile.identityDashboard.compatibilityLens.status} ·
            Confidence: {profile.identityDashboard.compatibilityLens.confidence}
          </AppText>
        </GlowCard>

        <GlowCard delay={180}>
          <AppText tone="secondary" variant="caption">
            SUPPORTIVE TOOLKIT
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Lucky/Supportive Toolkit
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {profile.identityDashboard.supportiveToolkit.framing}
          </AppText>
          <AppText className="mt-2" tone="secondary">
            Colors:{' '}
            {profile.identityDashboard.supportiveToolkit.colors.join(', ') ||
              'Pending'}
          </AppText>
          <AppText className="mt-2" tone="secondary">
            Affirmation:{' '}
            {profile.identityDashboard.supportiveToolkit.affirmation}
          </AppText>
        </GlowCard>

        <GlowCard delay={185}>
          <AppText tone="secondary" variant="caption">
            ASK NUMEROLOGY PREDICTA
          </AppText>
          <View className="mt-5">
            <GlowButton
              label="Explain my name number"
              onPress={() => {
                setActiveChartContext({
                  handoffFrom: 'PARASHARI',
                  handoffQuestion: 'Explain my name number.',
                  predictaSchool: 'NUMEROLOGY',
                  selectedSection: 'Explain my name number.',
                  sourceScreen: 'Numerology Predicta',
                });
                navigation.navigate(routes.Chat);
              }}
            />
          </View>
        </GlowCard>

        <GlowCard delay={190}>
          <AppText tone="secondary" variant="caption">
            ROOM BOUNDARY
          </AppText>
          <AppText className="mt-2" tone="secondary">
            Numerology Predicta answers with number logic first. If the question
            needs Vedic, KP, Nadi, or Signature analysis, Predicta should hand
            you to that room instead of mixing methods casually.
          </AppText>
          <View className="mt-5">
            <GlowButton
              label="Chat with Numerology Predicta"
              onPress={() => {
                setActiveChartContext({
                  handoffFrom: 'PARASHARI',
                  handoffQuestion:
                    'Read my numerology profile from name number, birth number, destiny number, and current personal timing.',
                  predictaSchool: 'NUMEROLOGY',
                  selectedSection:
                    'Read my numerology profile from name number, birth number, destiny number, and current personal timing.',
                  sourceScreen: 'Numerology Predicta',
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
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    padding: 12,
  },
  timelineCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    padding: 10,
  },
});
