import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type {
  BirthTimeDetectiveReport,
  BirthTimeQuestion,
} from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type BirthTimeDetectivePanelProps = {
  onAskDetective?: () => void;
  onCreateKundli?: () => void;
  onSaveAnswer?: (question: BirthTimeQuestion, answer: string) => void;
  report: BirthTimeDetectiveReport;
};

export function BirthTimeDetectivePanel({
  onAskDetective,
  onCreateKundli,
  onSaveAnswer,
  report,
}: BirthTimeDetectivePanelProps): React.JSX.Element {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [showEvidence, setShowEvidence] = useState(false);

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
            BIRTH TIME DETECTIVE
          </AppText>
          <AppText className="mt-1" variant="title">
            {report.title}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {report.subtitle}
          </AppText>
        </View>
        <View style={styles.scoreBadge}>
          <AppText tone="secondary" variant="caption">
            Score
          </AppText>
          <AppText variant="caption">{report.confidenceScore}/100</AppText>
        </View>
      </View>

      <View style={styles.summaryPanel}>
        <AppText tone="secondary" variant="caption">
          Confidence
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {report.confidenceLabel}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {report.summary}
        </AppText>
      </View>

      <View style={styles.impactGrid}>
        <ImpactBlock label="Safe" items={report.safeJudgments} />
        <ImpactBlock label="Cautious" items={report.cautiousJudgments} />
        <ImpactBlock label="Unsafe" items={report.unsafeJudgments} />
      </View>

      {report.status === 'pending' ? (
        <View className="mt-5">
          <GlowButton label="Create Kundli" onPress={onCreateKundli} />
        </View>
      ) : null}

      <View style={styles.questionStack}>
        {report.questions.map(question => {
          const draft = drafts[question.id] ?? question.answer?.answer ?? '';

          return (
            <View key={question.id} style={styles.questionCard}>
              <AppText variant="subtitle">{question.question}</AppText>
              <AppText className="mt-2" tone="secondary" variant="caption">
                {question.helper}
              </AppText>
              <TextInput
                multiline
                onChangeText={value =>
                  setDrafts(current => ({ ...current, [question.id]: value }))
                }
                placeholder="Write a simple answer with dates if possible."
                placeholderTextColor={colors.secondaryText}
                textAlignVertical="top"
                value={draft}
                className="mt-4 min-h-24 rounded-xl border border-[#252533] bg-[#0A0A0F] p-3 text-base text-text-primary"
              />
              <View className="mt-4">
                <GlowButton
                  disabled={!draft.trim()}
                  label={question.answer ? 'Update Answer' : 'Save Answer'}
                  onPress={() => onSaveAnswer?.(question, draft)}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.nextPanel}>
        <AppText tone="secondary" variant="caption">
          Next action
        </AppText>
        <AppText className="mt-1">{report.nextAction}</AppText>
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
          {report.evidence.map(item => (
            <AppText className="mt-2" key={item} tone="secondary" variant="caption">
              {item}
            </AppText>
          ))}
          {report.reasons.map(item => (
            <AppText className="mt-2" key={item} tone="secondary" variant="caption">
              {item}
            </AppText>
          ))}
        </View>
      ) : null}

      {onAskDetective ? (
        <View className="mt-5">
          <GlowButton label="Ask about birth time" onPress={onAskDetective} />
        </View>
      ) : null}
    </LinearGradient>
  );
}

function ImpactBlock({
  items,
  label,
}: {
  items: string[];
  label: string;
}): React.JSX.Element {
  return (
    <View style={styles.impactBlock}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      {items.slice(0, 2).map(item => (
        <AppText className="mt-2" key={item} tone="secondary" variant="caption">
          {item}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  evidencePanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  evidenceToggle: {
    marginTop: 14,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
  },
  impactBlock: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  impactGrid: {
    gap: 10,
    marginTop: 12,
  },
  nextPanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  questionCard: {
    backgroundColor: 'rgba(10, 10, 15, 0.42)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  questionStack: {
    gap: 12,
    marginTop: 16,
  },
  scoreBadge: {
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  shell: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
  summaryPanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
});
