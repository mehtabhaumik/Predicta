'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebRedeemPassPage = dynamic(
  () =>
    import('./WebRedeemPassPage').then(module => ({
      default: module.WebRedeemPassPage,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback room="redeem" />,
    ssr: false,
  },
);

export function WebRedeemPassPageLoader(): React.JSX.Element {
  return <WebRedeemPassPage />;
}
