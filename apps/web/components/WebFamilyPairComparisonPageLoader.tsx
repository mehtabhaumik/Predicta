'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebFamilyPairComparisonPage = dynamic(
  () =>
    import('./WebFamilyPairComparisonPage').then(module => ({
      default: module.WebFamilyPairComparisonPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback />,
    ssr: false,
  },
);

export function WebFamilyPairComparisonPageLoader(): React.JSX.Element {
  return <WebFamilyPairComparisonPage />;
}
