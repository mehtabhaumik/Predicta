'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebBirthTimeDetective = dynamic(
  () =>
    import('./WebBirthTimeDetective').then(module => ({
      default: module.WebBirthTimeDetective,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback room="kundli" />,
  },
);

export function WebBirthTimeDetectiveLoader(): React.JSX.Element {
  return <WebBirthTimeDetective />;
}
