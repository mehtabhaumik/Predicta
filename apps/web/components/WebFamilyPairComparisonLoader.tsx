'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebFamilyPairComparison = dynamic(
  () =>
    import('./WebFamilyPairComparison').then(module => ({
      default: module.WebFamilyPairComparison,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebFamilyPairComparisonLoader({
  hasPremiumAccess = false,
}: {
  hasPremiumAccess?: boolean;
}): React.JSX.Element {
  return <WebFamilyPairComparison hasPremiumAccess={hasPremiumAccess} />;
}
