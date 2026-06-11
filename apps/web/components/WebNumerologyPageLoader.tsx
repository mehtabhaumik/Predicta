'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebNumerologyPage = dynamic(
  () =>
    import('./WebNumerologyPage').then(module => ({
      default: module.WebNumerologyPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebNumerologyPageLoader(): React.JSX.Element {
  return <WebNumerologyPage />;
}
