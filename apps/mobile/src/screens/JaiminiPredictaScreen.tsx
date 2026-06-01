import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { getJaiminiLocalizationCopy } from '@pridicta/config';
import { composeJaiminiInterpretation, composeJaiminiPlan } from '@pridicta/astrology';
import {
  ActiveKundliActions,
  AnimatedHeader,
  AppText,
  GlowCard,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function JaiminiPredictaScreen({
  navigation,
}: RootScreenProps<
  typeof routes.JaiminiPredicta | typeof routes.NadiPredicta
>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const languagePreference = useAppStore(state => state.languagePreference);
  const copy = getJaiminiLocalizationCopy(languagePreference.language);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const jaiminiPlan = composeJaiminiPlan(kundli);
  const jaiminiInterpretation = composeJaiminiInterpretation(kundli);
  const compassItems = [
    [copy.soulPlanet, jaiminiPlan.atmakaraka?.planet ?? copy.pending],
    [copy.careerDharma, jaiminiPlan.amatyakaraka?.planet ?? copy.pending],
    [copy.visiblePath, jaiminiPlan.arudhaLagna.padaSign ?? copy.pending],
    [copy.lifeChapter, jaiminiPlan.currentCharaDasha?.sign ?? copy.pending],
  ] as const;
  const readingBlocks = jaiminiInterpretation.freeBlocks.slice(0, 6);
  const charaTimeline = jaiminiPlan.charaDashaTimeline.slice(0, 6);
  const askJaimini = () => {
    setActiveChartContext({
      handoffFrom: 'PARASHARI',
      handoffQuestion: `${copy.chatPrompt} Start with this prediction: ${jaiminiInterpretation.summary} Calculated evidence: ${jaiminiInterpretation.technicalEvidence.slice(0, 4).join(' | ')}`,
      predictaSchool: 'JAIMINI',
      selectedSection: copy.soulRole,
      sourceScreen: copy.heroEyebrow,
    });
    navigation.navigate(routes.Chat);
  };

  return (
    <Screen>
      <AnimatedHeader
        eyebrow={copy.heroEyebrow.toUpperCase()}
        title={copy.charaDashaChapter}
      />
      <ActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen={copy.heroEyebrow}
        title={copy.readingKundliTitle}
      />
      <GlowCard delay={90}>
        <AppText tone="secondary" variant="caption">
          {copy.lensBadge.toUpperCase()}
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          {copy.destinyRoleTitle}
        </AppText>
        <AppText className="mt-3" tone="secondary" variant="body">
          {jaiminiInterpretation.summary}
        </AppText>
        <View style={styles.compassCard}>
          <AppText tone="secondary" variant="caption">
            {copy.compassTitle.toUpperCase()}
          </AppText>
          <View style={styles.compassGrid}>
            {compassItems.map(([label, value]) => (
              <View key={label} style={styles.compassItem}>
                <AppText tone="secondary" variant="caption">
                  {label}
                </AppText>
                <AppText variant="body">{value}</AppText>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.ctaRow}>
          <Pressable
            accessibilityRole="button"
            style={[styles.cta, styles.primaryCta]}
            onPress={askJaimini}
          >
            <AppText variant="body">{copy.askCta}</AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[styles.cta, styles.secondaryCta]}
            onPress={() => navigation.navigate(routes.Report)}
          >
            <AppText variant="body">{copy.downloadCta}</AppText>
          </Pressable>
        </View>
      </GlowCard>

      <GlowCard delay={105}>
        <AppText tone="secondary" variant="caption">
          {copy.karakaCouncilEyebrow.toUpperCase()}
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          {copy.karakaCouncilTitle}
        </AppText>
        <View style={styles.karakaList}>
          {jaiminiPlan.charaKarakas.length ? (
            jaiminiPlan.charaKarakas.slice(0, 7).map(karaka => (
              <View key={`${karaka.role}-${karaka.planet}`} style={styles.karakaChip}>
                <AppText tone="secondary" variant="caption">
                  {karaka.role}
                </AppText>
                <AppText variant="body">{karaka.planet}</AppText>
              </View>
            ))
          ) : (
            <View style={styles.karakaChip}>
              <AppText tone="secondary" variant="caption">
                {copy.karakaCouncilPending}
              </AppText>
              <AppText tone="secondary" variant="body">
                {copy.karakaCouncilEmpty}
              </AppText>
            </View>
          )}
        </View>
      </GlowCard>

      <GlowCard delay={115}>
        <AppText tone="secondary" variant="caption">
          {copy.charaDashaChapter.toUpperCase()}
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          {copy.timelineTitle}
        </AppText>
        <ScrollView
          horizontal
          contentContainerStyle={styles.timelineContent}
          showsHorizontalScrollIndicator={false}
        >
          {charaTimeline.length ? (
            charaTimeline.map(period => (
              <View key={`${period.order}-${period.sign}`} style={styles.timelineCard}>
                <AppText tone="secondary" variant="caption">
                  {period.startAge}-{period.endAge}
                </AppText>
                <AppText variant="body">{period.sign}</AppText>
                <AppText tone="secondary" variant="caption">
                  {period.signLord}
                </AppText>
              </View>
            ))
          ) : (
            <View style={styles.timelineCard}>
              <AppText variant="body">{copy.pending}</AppText>
              <AppText tone="secondary" variant="caption">
                {copy.timelineEmpty}
              </AppText>
            </View>
          )}
        </ScrollView>
      </GlowCard>

      <View style={styles.readingStack}>
        {readingBlocks.map((block, index) => (
          <GlowCard delay={125 + index * 8} key={block.id}>
            <View style={styles.readingCard}>
              <AppText tone="secondary" variant="caption">
                {block.title.toUpperCase()}
              </AppText>
              <AppText className="mt-2" variant="subtitle">
                {block.headline}
              </AppText>
              <AppText className="mt-2" tone="secondary" variant="body">
                {block.guidance}
              </AppText>
            </View>
          </GlowCard>
        ))}
      </View>

      <GlowCard delay={180}>
        <Pressable
          accessibilityRole="button"
          style={styles.drawerHeader}
          onPress={() => setTechnicalOpen(current => !current)}
        >
          <View>
            <AppText tone="secondary" variant="caption">
              {copy.evidenceTitle.toUpperCase()}
            </AppText>
            <AppText className="mt-1" variant="body">
              {copy.proofLine}
            </AppText>
          </View>
          <AppText variant="body">
            {technicalOpen ? copy.hideEvidence : copy.showEvidence}
          </AppText>
        </Pressable>
        {technicalOpen ? (
          <View style={styles.evidenceStack}>
            {jaiminiInterpretation.technicalEvidence.map(item => (
              <View key={item} style={styles.evidenceItem}>
                <AppText tone="secondary" variant="caption">
                  {item}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cta: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  ctaRow: {
    gap: 12,
    marginTop: 18,
  },
  compassCard: {
    backgroundColor: 'rgba(189, 163, 106, 0.08)',
    borderColor: 'rgba(189, 163, 106, 0.28)',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 18,
    padding: 14,
  },
  compassGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  compassItem: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 74,
    minWidth: 132,
    padding: 12,
  },
  drawerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 58,
  },
  evidenceItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  evidenceStack: {
    gap: 10,
    marginTop: 14,
  },
  karakaChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(189, 163, 106, 0.24)',
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 70,
    minWidth: 132,
    padding: 12,
  },
  karakaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  primaryCta: {
    backgroundColor: 'rgba(189, 163, 106, 0.18)',
    borderColor: 'rgba(189, 163, 106, 0.42)',
  },
  readingCard: {
    gap: 2,
  },
  readingStack: {
    gap: 14,
  },
  secondaryCta: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: colors.border,
  },
  timelineCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(189, 163, 106, 0.26)',
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 90,
    padding: 14,
    width: 150,
  },
  timelineContent: {
    gap: 12,
    marginTop: 18,
    paddingRight: 8,
  },
});
