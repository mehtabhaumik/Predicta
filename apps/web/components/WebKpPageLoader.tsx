'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebKpPage = dynamic(
  () =>
    import('./WebKpPage').then(module => ({
      default: module.WebKpPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebKpPageLoader(): React.JSX.Element {
  return <WebKpPage />;
}
