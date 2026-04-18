import React from 'react';

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
    <Card className="flex-1">
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText className="mt-3" variant="title">
        {formatPercent(value)}
      </AppText>
    </Card>
  );
}
