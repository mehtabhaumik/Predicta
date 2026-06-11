'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebNumerologyPredictaPanel = dynamic(
  () =>
    import('./WebNumerologyPredictaPanel').then(module => ({
      default: module.WebNumerologyPredictaPanel,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebNumerologyPredictaLoader(): React.JSX.Element {
  return <WebNumerologyPredictaPanel />;
}
