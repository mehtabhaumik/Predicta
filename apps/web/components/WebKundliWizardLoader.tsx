'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebKundliWizard = dynamic(
  () =>
    import('./WebKundliWizard').then(module => ({
      default: module.WebKundliWizard,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebKundliWizardLoader(): React.JSX.Element {
  return <WebKundliWizard />;
}
