'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebFamilyKarmaMapPage = dynamic(
  () =>
    import('./WebFamilyKarmaMapPage').then(module => ({
      default: module.WebFamilyKarmaMapPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback room="family" />,
    ssr: false,
  },
);

export function WebFamilyKarmaMapPageLoader(): React.JSX.Element {
  return <WebFamilyKarmaMapPage />;
}
