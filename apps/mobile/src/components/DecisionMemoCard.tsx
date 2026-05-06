import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { buildTrustProfile } from '@pridicta/config/trust';
import type { DecisionMemo } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';
import { TrustProofPanel } from './TrustProofPanel';

type DecisionMemoCardProps = {
  memo: DecisionMemo;
  onAskMemo?: () => void;
};

const stateColors: Record<DecisionMemo['state'], string> = {
  green: colors.success,
  yellow: colors.warning,
  red: colors.danger,
  wait: colors.gradient[1],
  'needs-more-info': colors.secondaryText,
};

export function DecisionMemoCard({
  memo,
  onAskMemo,
}: DecisionMemoCardProps): React.JSX.Element {
  const [showEvidence, setShowEvidence] = useState(true);
  const trust = buildTrustProfile({
    evidence: memo.evidence.map(item => `${item.title}: ${item.observation}`),
    limitations: [
      memo.safetyNote ?? '',
      memo.state === 'needs-more-info'
        ? 'Clarifying information is required before trusting the memo.'
        : '',
    ].filter(Boolean),
    query: memo.question,
    surface: 'decision',
  });

  return (
    <LinearGradient
      colors={colors.gradientMuted}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.shell}
    >
      <View style={styles.header}>
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            DECISION ORACLE
          </AppText>
          <AppText className="mt-1" variant="title">
            {memo.headline}
          </AppText>
        </View>
        <View style={[styles.stateBadge, { borderColor: stateColors[memo.state] }]}>
          <AppText tone="secondary" variant="caption">
            State
          </AppText>
          <AppText variant="caption">{memo.state}</AppText>
        </View>
      </View>

      <View style={styles.questionPanel}>
        <AppText tone="secondary" variant="caption">
          Question
        </AppText>
        <AppText className="mt-1">{memo.question}</AppText>
      </View>

      <View style={styles.memoPanel}>
        <AppText tone="secondary" variant="caption">
          Short answer
        </AppText>
        <AppText className="mt-1">{memo.shortAnswer}</AppText>
      </View>

      <View style={styles.grid}>
        <MemoBlock label="Timing" text={memo.timing} />
        <MemoBlock label="Risk" text={memo.risk} />
      </View>

      <View style={styles.actionPanel}>
        <AppText tone="secondary" variant="caption">
          Next action
        </AppText>
        <AppText className="mt-1">{memo.nextAction}</AppText>
      </View>

      {memo.safetyNote ? (
        <View style={styles.safetyPanel}>
          <AppText tone="secondary" variant="caption">
            Safety boundary
          </AppText>
          <AppText className="mt-1" tone="secondary">
            {memo.safetyNote}
          </AppText>
        </View>
      ) : null}

      {memo.clarifyingQuestions.length ? (
        <View style={styles.clarifyPanel}>
          <AppText tone="secondary" variant="caption">
            Answer these first
          </AppText>
          {memo.clarifyingQuestions.map(question => (
            <AppText className="mt-2" key={question} tone="secondary" variant="caption">
              {question}
            </AppText>
          ))}
        </View>
      ) : null}

      <View className="mt-4">
        <TrustProofPanel trust={trust} />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setShowEvidence(value => !value)}
        style={styles.evidenceToggle}
      >
        <AppText className="font-bold text-[#4DAFFF]">
          {showEvidence ? 'Hide evidence' : 'Show evidence'}
        </AppText>
      </Pressable>

      {showEvidence ? (
        <View style={styles.evidencePanel}>
          {memo.evidence.map(item => (
            <View key={item.id} style={styles.evidenceItem}>
              <AppText variant="caption">{item.title} · {item.weight}</AppText>
              <AppText className="mt-1" tone="secondary" variant="caption">
                {item.observation}
              </AppText>
              <AppText className="mt-1" tone="secondary" variant="caption">
                {item.interpretation}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      {memo.remedies.length ? (
        <View style={styles.remedyPanel}>
          <AppText tone="secondary" variant="caption">
            Supportive remedies
          </AppText>
          {memo.remedies.map(remedy => (
            <AppText className="mt-2" key={remedy} tone="secondary" variant="caption">
              {remedy}
            </AppText>
          ))}
        </View>
      ) : null}

      {onAskMemo ? (
        <View className="mt-5">
          <GlowButton label="Ask Pridicta to explain" onPress={onAskMemo} />
        </View>
      ) : null}
    </LinearGradient>
  );
}

function MemoBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}): React.JSX.Element {
  return (
    <View style={styles.block}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText className="mt-1" tone="secondary" variant="caption">
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actionPanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  block: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  clarifyPanel: {
    backgroundColor: 'rgba(255, 184, 77, 0.08)',
    borderColor: 'rgba(255, 184, 77, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  evidenceItem: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  evidencePanel: {
    gap: 10,
    marginTop: 12,
  },
  evidenceToggle: {
    marginTop: 14,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  memoPanel: {
    backgroundColor: 'rgba(10, 10, 15, 0.42)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  questionPanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  remedyPanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  safetyPanel: {
    backgroundColor: 'rgba(255, 77, 166, 0.08)',
    borderColor: 'rgba(255, 77, 166, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  shell: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
  stateBadge: {
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});
