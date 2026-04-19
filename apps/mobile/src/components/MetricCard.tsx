import React from 'react';
import { StyleSheet } from 'react-native';

import { formatPercent } from '../utils/format';
import { AppText } from './AppText';
import { Card } from './Card';

type MetricCardProps = {
  label: string;
  value: number;
};

export function MetricCard({
  label,
  value,
}: MetricCardProps): React.JSX.Element {
  return (
    <Card style={styles.card}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText style={styles.value} variant="title">
        {formatPercent(value)}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  value: {
    marginTop: 12,
  },
});
