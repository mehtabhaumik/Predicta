'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebFamilyVault = dynamic(
  () =>
    import('./WebFamilyVault').then(module => ({
      default: module.WebFamilyVault,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebFamilyVaultLoader(): React.JSX.Element {
  return <WebFamilyVault />;
}
