'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebPredictaWrappedRuntime = dynamic(
  () =>
    import('./WebPredictaWrappedRuntime').then(module => ({
      default: module.WebPredictaWrappedRuntime,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebPredictaWrappedLoader(): React.JSX.Element {
  return <WebPredictaWrappedRuntime />;
}
