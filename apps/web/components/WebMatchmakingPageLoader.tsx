'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebMatchmakingPage = dynamic(
  () =>
    import('./WebMatchmakingPage').then(module => ({
      default: module.WebMatchmakingPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebMatchmakingPageLoader(): React.JSX.Element {
  return <WebMatchmakingPage />;
}
