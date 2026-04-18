import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DashboardShell } from '../../components/DashboardShell';
import { demoAccess } from '../../lib/demo-state';

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: 'Predicta Dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <DashboardShell access={demoAccess}>{children}</DashboardShell>;
}
