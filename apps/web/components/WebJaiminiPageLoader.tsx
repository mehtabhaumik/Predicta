'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebJaiminiPage = dynamic(
  () =>
    import('./WebJaiminiPage').then(module => ({
      default: module.WebJaiminiPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebJaiminiPageLoader(): React.JSX.Element {
  return <WebJaiminiPage />;
}
