'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebChartsExplorer = dynamic(
  () =>
    import('./WebChartsExplorer').then(module => ({
      default: module.WebChartsExplorer,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebChartsExplorerLoader({
  hasPremiumAccess = false,
}: {
  hasPremiumAccess?: boolean;
}): React.JSX.Element {
  return <WebChartsExplorer hasPremiumAccess={hasPremiumAccess} />;
}
