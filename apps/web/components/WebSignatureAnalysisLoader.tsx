'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebSignatureAnalysisInputFlow = dynamic(
  () =>
    import('./WebSignatureAnalysisInputFlow').then(module => ({
      default: module.WebSignatureAnalysisInputFlow,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebSignatureAnalysisLoader(): React.JSX.Element {
  return <WebSignatureAnalysisInputFlow />;
}
