'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebVedicWorldPage = dynamic(
  () =>
    import('./WebVedicWorldPage').then(module => ({
      default: module.WebVedicWorldPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback room="vedic" />,
    ssr: false,
  },
);

export function WebVedicWorldPageLoader(): React.JSX.Element {
  return <WebVedicWorldPage />;
}
