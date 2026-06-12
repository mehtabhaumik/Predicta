'use client';

import dynamic from 'next/dynamic';
import { TinyPanelSkeletonFallback } from './TinyPanelSkeletonFallback';

const WebKundliWizard = dynamic(
  () =>
    import('./WebKundliWizard').then(module => ({
      default: module.WebKundliWizard,
    })),
  {
    loading: () => <TinyPanelSkeletonFallback />,
  },
);

export function WebKundliWizardLoader(): React.JSX.Element {
  return <WebKundliWizard />;
}
