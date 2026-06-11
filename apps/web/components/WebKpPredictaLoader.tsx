'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebKpPredictaRuntime = dynamic(
  () =>
    import('./WebKpPredictaRuntime').then(module => ({
      default: module.WebKpPredictaRuntime,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebKpPredictaLoader(): React.JSX.Element {
  return <WebKpPredictaRuntime />;
}
