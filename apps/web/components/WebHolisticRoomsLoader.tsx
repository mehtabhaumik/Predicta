'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebHolisticRoomsRuntime = dynamic(
  () =>
    import('./WebHolisticRoomsRuntime').then(module => ({
      default: module.WebHolisticRoomsRuntime,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebHolisticRoomsLoader(): React.JSX.Element {
  return <WebHolisticRoomsRuntime />;
}
