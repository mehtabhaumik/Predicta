'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebFamilyKarmaMap = dynamic(
  () =>
    import('./WebFamilyKarmaMap').then(module => ({
      default: module.WebFamilyKarmaMap,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebFamilyKarmaMapLoader({
  hasPremiumAccess = false,
}: {
  hasPremiumAccess?: boolean;
}): React.JSX.Element {
  return <WebFamilyKarmaMap hasPremiumAccess={hasPremiumAccess} />;
}
