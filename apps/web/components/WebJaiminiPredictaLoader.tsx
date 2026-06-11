'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebJaiminiPredictaPanel = dynamic(
  () =>
    import('./WebJaiminiPredictaPanel').then(module => ({
      default: module.WebJaiminiPredictaPanel,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebJaiminiPredictaLoader(): React.JSX.Element {
  return <WebJaiminiPredictaPanel />;
}
