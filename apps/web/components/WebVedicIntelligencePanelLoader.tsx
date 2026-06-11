'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebVedicIntelligencePanelRuntime = dynamic(
  () =>
    import('./WebVedicIntelligencePanelRuntime').then(module => ({
      default: module.WebVedicIntelligencePanelRuntime,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebVedicIntelligencePanelLoader(): React.JSX.Element {
  return <WebVedicIntelligencePanelRuntime />;
}
