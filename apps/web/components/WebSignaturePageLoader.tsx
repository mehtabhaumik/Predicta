'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebSignaturePage = dynamic(
  () =>
    import('./WebSignaturePage').then(module => ({
      default: module.WebSignaturePage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebSignaturePageLoader(): React.JSX.Element {
  return <WebSignaturePage />;
}
