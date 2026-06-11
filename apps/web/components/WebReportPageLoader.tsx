'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebReportPage = dynamic(
  () =>
    import('./WebReportPage').then(module => ({
      default: module.WebReportPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebReportPageLoader(): React.JSX.Element {
  return <WebReportPage />;
}
