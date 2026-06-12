'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebChartsExplorer = dynamic(
  () =>
    import('./WebChartsExplorer').then(module => ({
      default: module.WebChartsExplorer,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback room="charts" />,
  },
);

export function WebChartsExplorerLoader({
  hasPremiumAccess = false,
}: {
  hasPremiumAccess?: boolean;
}): React.JSX.Element {
  return <WebChartsExplorer hasPremiumAccess={hasPremiumAccess} />;
}
