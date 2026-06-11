'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebRemedyCoach = dynamic(
  () =>
    import('./WebRemedyCoach').then(module => ({
      default: module.WebRemedyCoach,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebRemedyCoachLoader(): React.JSX.Element {
  return <WebRemedyCoach />;
}
