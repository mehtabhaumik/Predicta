import type { ReactNode } from 'react';
import { DashboardShell } from '../../components/DashboardShell';
import { demoAccess } from '../../lib/demo-state';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return <DashboardShell access={demoAccess}>{children}</DashboardShell>;
}
