import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { RelationshipMirror } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type RelationshipMirrorPanelProps = {
  mirror: RelationshipMirror;
  onAskMirror?: () => void;
  onCreateKundli?: () => void;
};

export function RelationshipMirrorPanel({
  mirror,
  onAskMirror,
  onCreateKundli,
}: RelationshipMirrorPanelProps): React.JSX.Element {
  const [showEvidence, setShowEvidence] = useState(false);

  async function shareMirror() {
    await Share.share({
      message: mirror.shareSummary,
      title: 'Predicta Relationship Mirror',
    });
  }

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
            RELATIONSHIP MIRROR
          </AppText>
          <AppText className="mt-1" variant="title">
            {mirror.headline}
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {mirror.overview}
          </AppText>
        </View>
      </View>

      <View style={styles.talkPanel}>
        <AppText tone="secondary" variant="caption">
          How to talk this week
        </AppText>
        <AppText className="mt-1">{mirror.howToTalkThisWeek}</AppText>
      </View>

      <View style={styles.timingPanel}>
        <AppText tone="secondary" variant="caption">
          Timing overlap
        </AppText>
        <AppText className="mt-1" tone="secondary">
          {mirror.timingOverlap}
        </AppText>
      </View>

      <View style={styles.sectionStack}>
        {mirror.sections.map(section => (
          <View key={section.area} style={styles.sectionCard}>
            <AppText variant="subtitle">{section.title}</AppText>
            <AppText className="mt-2" tone="secondary">
              {section.summary}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {section.advice}
            </AppText>
          </View>
        ))}
      </View>

      {mirror.status === 'pending' ? (
        <View className="mt-5">
          <GlowButton label="Create or Save Kundlis" onPress={onCreateKundli} />
        </View>
      ) : (
        <View className="mt-5 gap-3">
          {onAskMirror ? (
            <GlowButton label="Ask about this mirror" onPress={onAskMirror} />
          ) : null}
          <GlowButton label="Share Safe Summary" onPress={shareMirror} />
        </View>
      )}

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
          {mirror.evidence.map(item => (
            <View key={item.id} style={styles.evidenceItem}>
              <AppText variant="caption">
                {item.title} · {item.weight}
              </AppText>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: 'row',
    gap: 14,
  },
  sectionCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  sectionStack: {
    gap: 12,
    marginTop: 12,
  },
  shell: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
  talkPanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  timingPanel: {
    backgroundColor: 'rgba(10, 10, 15, 0.42)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
});
