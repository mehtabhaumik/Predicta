import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { buildTrustProfile } from '@pridicta/config/trust';
import type { RemedyCoachItem, RemedyCoachPlan } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';
import { TrustProofPanel } from './TrustProofPanel';

type RemedyCoachPanelProps = {
  onAskRemedy?: (item: RemedyCoachItem) => void;
  onCreateKundli?: () => void;
  onMarkDone?: (item: RemedyCoachItem) => void;
  plan: RemedyCoachPlan;
};

export function RemedyCoachPanel({
  onAskRemedy,
  onCreateKundli,
  onMarkDone,
  plan,
}: RemedyCoachPanelProps): React.JSX.Element {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    plan.items[0]?.id,
  );
  const selected = plan.items.find(item => item.id === selectedId) ?? plan.items[0];

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
            REMEDY COACH
          </AppText>
          <AppText className="mt-1" variant="title">
            {plan.title}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {plan.subtitle}
          </AppText>
        </View>
      </View>

      <View style={styles.guardrailPanel}>
        {plan.guardrails.slice(0, 3).map(item => (
          <AppText className="mt-1" key={item} tone="secondary" variant="caption">
            {item}
          </AppText>
        ))}
      </View>

      {plan.status === 'pending' ? (
        <View className="mt-5">
          <GlowButton label="Create Kundli" onPress={onCreateKundli} />
        </View>
      ) : null}

      <View style={styles.itemStack}>
        {plan.items.map(item => (
          <Pressable
            accessibilityRole="button"
            key={item.id}
            onPress={() => setSelectedId(item.id)}
            style={[
              styles.remedyCard,
              selected?.id === item.id ? styles.remedyCardActive : null,
            ]}
          >
            <View style={styles.remedyHeader}>
              <AppText variant="subtitle">{item.title}</AppText>
              <View style={styles.statusBadge}>
                <AppText variant="caption">{item.tracking.status}</AppText>
              </View>
            </View>
            <AppText className="mt-1" tone="secondary" variant="caption">
              {item.priority} priority · {item.cadence}
            </AppText>
            <AppText className="mt-2" tone="secondary">
              {item.practice}
            </AppText>
          </Pressable>
        ))}
      </View>

      {selected ? (
        <View style={styles.detailPanel}>
          <AppText tone="secondary" variant="caption">
            Why this remedy?
          </AppText>
          <AppText className="mt-1">{selected.rationale}</AppText>
          <View style={styles.detailGrid}>
            <DetailBlock
              label="Expected inner shift"
              text={selected.expectedInnerShift}
            />
            <DetailBlock label="When to review" text={selected.tracking.reviewAfter} />
          </View>
          <View style={styles.cautionPanel}>
            <AppText tone="secondary" variant="caption">
              When to stop or simplify
            </AppText>
            <AppText className="mt-1" tone="secondary">
              {selected.caution} {selected.tracking.nextReviewPrompt}
            </AppText>
          </View>
          <View style={styles.trackingPanel}>
            <AppText tone="secondary" variant="caption">
              Tracking
            </AppText>
            <AppText className="mt-1">
              {selected.tracking.completions} done · streak{' '}
              {selected.tracking.currentStreak}
            </AppText>
            {selected.tracking.lastCompletedAt ? (
              <AppText className="mt-1" tone="secondary" variant="caption">
                Last done: {selected.tracking.lastCompletedAt.slice(0, 10)}
              </AppText>
            ) : null}
          </View>
          <View style={styles.evidencePanel}>
            <AppText tone="secondary" variant="caption">
              Chart evidence
            </AppText>
            {selected.evidence.map(item => (
              <AppText className="mt-2" key={item} tone="secondary" variant="caption">
                {item}
              </AppText>
            ))}
          </View>
          <View className="mt-4">
            <TrustProofPanel
              trust={buildTrustProfile({
                evidence: selected.evidence,
                limitations: [selected.caution],
                query: selected.practice,
                surface: 'remedy',
              })}
            />
          </View>
          <View className="mt-5 gap-3">
            <GlowButton
              label="Mark Practice Done"
              onPress={() => onMarkDone?.(selected)}
            />
            {onAskRemedy ? (
              <GlowButton
                label="Ask why this remedy"
                onPress={() => onAskRemedy(selected)}
              />
            ) : null}
          </View>
        </View>
      ) : null}
    </LinearGradient>
  );
}

function DetailBlock({
  label,
  text,
}: {
  label: string;
  text: string;
}): React.JSX.Element {
  return (
    <View style={styles.detailBlock}>
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
  cautionPanel: {
    backgroundColor: 'rgba(255, 184, 77, 0.08)',
    borderColor: 'rgba(255, 184, 77, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  detailBlock: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  detailPanel: {
    backgroundColor: 'rgba(10, 10, 15, 0.42)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  evidencePanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  guardrailPanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    gap: 14,
  },
  itemStack: {
    gap: 12,
    marginTop: 16,
  },
  remedyCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  remedyCardActive: {
    borderColor: colors.gradient[1],
  },
  remedyHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  shell: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
  statusBadge: {
    backgroundColor: 'rgba(77, 175, 255, 0.14)',
    borderColor: 'rgba(77, 175, 255, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  trackingPanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
});
