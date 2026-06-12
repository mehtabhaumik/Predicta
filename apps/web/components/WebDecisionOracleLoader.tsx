'use client';

import dynamic from 'next/dynamic';
import { SpecialistRoomPanelFallback } from './SpecialistRoomPanelFallback';

const WebDecisionOracle = dynamic(
  () =>
    import('./WebDecisionOracle').then(module => ({
      default: module.WebDecisionOracle,
    })),
  {
    loading: () => <SpecialistRoomPanelFallback room="generic" />,
  },
);

export function WebDecisionOracleLoader(): React.JSX.Element {
  return <WebDecisionOracle />;
}
