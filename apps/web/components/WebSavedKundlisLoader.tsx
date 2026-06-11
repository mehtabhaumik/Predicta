'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebSavedKundlis = dynamic(
  () =>
    import('./WebSavedKundlis').then(module => ({
      default: module.WebSavedKundlis,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
  },
);

export function WebSavedKundlisLoader(): React.JSX.Element {
  return <WebSavedKundlis />;
}
