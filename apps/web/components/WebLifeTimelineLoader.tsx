'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebLifeTimelineRuntime = dynamic(
  () =>
    import('./WebLifeTimelineRuntime').then(module => ({
      default: module.WebLifeTimelineRuntime,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback room="vedic" />,
  },
);

export function WebLifeTimelineLoader(): React.JSX.Element {
  return <WebLifeTimelineRuntime />;
}
