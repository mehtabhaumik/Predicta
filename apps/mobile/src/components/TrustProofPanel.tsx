import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { TrustProfile } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';

export function TrustProofPanel({
  trust,
}: {
  trust: TrustProfile;
}): React.JSX.Element {
  return (
    <View style={styles.shell}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            TRUST LAYER
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {trust.confidenceLabel}
          </AppText>
        </View>
        <View style={styles.badge}>
          <AppText variant="caption">
            {trust.highStakes ? 'Safety' : 'Proof'}
          </AppText>
        </View>
      </View>
      <AppText className="mt-3" tone="secondary">
        {trust.summary}
      </AppText>
      <TrustList items={trust.evidence.slice(0, 4)} title="Evidence used" />
      <TrustList items={trust.limitations.slice(0, 3)} title="Limits" />
      <TrustList items={trust.safetyNotes.slice(0, 3)} title="Safety" />
      <View style={styles.trace}>
        <AppText tone="secondary" variant="caption">
          Audit: {trust.auditTrace.join(' | ')}
        </AppText>
      </View>
    </View>
  );
}

function TrustList({
  items,
  title,
}: {
  items: string[];
  title: string;
}): React.JSX.Element {
  return (
    <View style={styles.list}>
      <AppText variant="caption">{title}</AppText>
      {items.map(item => (
        <AppText className="mt-2" key={item} tone="secondary" variant="caption">
          • {item}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(255, 195, 77, 0.14)',
    borderColor: 'rgba(255, 195, 77, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  list: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  shell: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: 'rgba(255, 195, 77, 0.24)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  trace: {
    marginTop: 12,
  },
});
