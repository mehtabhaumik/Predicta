import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { FamilyKarmaMap } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { GlowButton } from './GlowButton';

type FamilyKarmaMapPanelProps = {
  map: FamilyKarmaMap;
  onAskMap?: () => void;
  onCreateKundli?: () => void;
};

export function FamilyKarmaMapPanel({
  map,
  onAskMap,
  onCreateKundli,
}: FamilyKarmaMapPanelProps): React.JSX.Element {
  const [showEvidence, setShowEvidence] = useState(false);

  async function shareMap() {
    await Share.share({
      message: map.shareSummary,
      title: 'Predicta Family Karma Map',
    });
  }

  return (
    <LinearGradient
      colors={colors.gradientMuted}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={styles.shell}
    >
      <View>
        <AppText tone="secondary" variant="caption">
          FAMILY KARMA MAP
        </AppText>
        <AppText className="mt-1" variant="title">
          {map.title}
        </AppText>
        <AppText className="mt-3" tone="secondary">
          {map.subtitle}
        </AppText>
      </View>

      <View style={styles.privacyPanel}>
        <AppText tone="secondary" variant="caption">
          Privacy note
        </AppText>
        <AppText className="mt-1" tone="secondary">
          {map.privacyNote}
        </AppText>
      </View>

      {map.members.length ? (
        <View style={styles.memberGrid}>
          {map.members.map(member => (
            <View key={member.id} style={styles.memberCard}>
              <AppText variant="subtitle">{member.name}</AppText>
              <AppText className="mt-1" tone="secondary" variant="caption">
                {formatLabel(member.relationship)} · {member.moonSign} Moon
              </AppText>
              <AppText className="mt-1" tone="secondary" variant="caption">
                {member.nakshatra} · {member.currentDasha}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.sectionStack}>
        {map.repeatedThemes.map(theme => (
          <View key={theme.id} style={styles.themeCard}>
            <AppText variant="subtitle">{theme.title}</AppText>
            <AppText className="mt-2" tone="secondary">
              {theme.summary}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {theme.guidance}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.sectionStack}>
        {map.relationshipCards.map(card => (
          <View key={card.id} style={styles.relationshipCard}>
            <AppText tone="secondary" variant="caption">
              {card.label}
            </AppText>
            <AppText className="mt-2">{card.emotionalPattern}</AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {card.supportPattern}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {card.practicalGuidance}
            </AppText>
          </View>
        ))}
      </View>

      {map.status === 'pending' ? (
        <View className="mt-5">
          <GlowButton label="Create or Save Kundlis" onPress={onCreateKundli} />
        </View>
      ) : (
        <View className="mt-5 gap-3">
          {onAskMap ? (
            <GlowButton label="Ask about family map" onPress={onAskMap} />
          ) : null}
          <GlowButton label="Share Safe Summary" onPress={shareMap} />
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
          {map.repeatedThemes.map(theme => (
            <View key={theme.id} style={styles.evidenceItem}>
              <AppText variant="caption">{theme.title}</AppText>
              {theme.evidence.map(line => (
                <AppText
                  className="mt-1"
                  key={line}
                  tone="secondary"
                  variant="caption"
                >
                  {line}
                </AppText>
              ))}
            </View>
          ))}
          {map.relationshipCards.map(card => (
            <View key={card.id} style={styles.evidenceItem}>
              <AppText variant="caption">{card.label}</AppText>
              {card.evidence.map(line => (
                <AppText
                  className="mt-1"
                  key={line}
                  tone="secondary"
                  variant="caption"
                >
                  {line}
                </AppText>
              ))}
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
  memberCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: '46%',
    padding: 12,
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  privacyPanel: {
    backgroundColor: 'rgba(77, 175, 255, 0.08)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  relationshipCard: {
    backgroundColor: 'rgba(10, 10, 15, 0.42)',
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
  themeCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
});

function formatLabel(label: string): string {
  return label
    .split('-')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
