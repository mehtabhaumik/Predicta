'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebMatchmakingPanel = dynamic(
  () =>
    import('./WebMatchmakingPanel').then(module => ({
      default: module.WebMatchmakingPanel,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebMatchmakingPanelLoader({
  hasPremiumAccess = false,
}: {
  hasPremiumAccess?: boolean;
}): React.JSX.Element {
  return <WebMatchmakingPanel hasPremiumAccess={hasPremiumAccess} />;
}
