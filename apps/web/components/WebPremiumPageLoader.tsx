'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebPremiumPage = dynamic(
  () =>
    import('./WebPremiumPage').then(module => ({
      default: module.WebPremiumPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebPremiumPageLoader(): React.JSX.Element {
  return <WebPremiumPage />;
}
