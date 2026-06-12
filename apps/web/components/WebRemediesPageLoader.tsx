'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebRemediesPage = dynamic(
  () =>
    import('./WebRemediesPage').then(module => ({
      default: module.WebRemediesPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback room="remedies" />,
    ssr: false,
  },
);

export function WebRemediesPageLoader(): React.JSX.Element {
  return <WebRemediesPage />;
}
