'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebProfileSettings = dynamic(
  () =>
    import('./WebProfileSettings').then(module => ({
      default: module.WebProfileSettings,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback room="library" />,
    ssr: false,
  },
);

export function WebProfileSettingsLoader(): React.JSX.Element {
  return <WebProfileSettings />;
}
