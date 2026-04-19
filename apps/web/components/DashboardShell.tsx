'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { canSeeAdminRoute } from '@pridicta/access';
import type { ResolvedAccess } from '@pridicta/types';
import { SidebarNav, type SidebarItem } from './SidebarNav';

const links: SidebarItem[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/chat', label: 'Chat' },
  { href: '/dashboard/kundli', label: 'Kundli' },
  { href: '/dashboard/life-timeline', label: 'Life Timeline' },
  { href: '/dashboard/journal', label: 'Journal' },
  { href: '/dashboard/compatibility', label: 'Compatibility' },
  { href: '/dashboard/charts', label: 'Charts' },
  { href: '/dashboard/report', label: 'Report' },
  { href: '/dashboard/saved-kundlis', label: 'Saved Kundlis' },
  { href: '/dashboard/redeem-pass', label: 'Redeem Pass' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export function DashboardShell({
  access,
  children,
}: {
  access: ResolvedAccess;
  children: ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <div className="dashboard-shell">
      <SidebarNav items={links} showAdmin={canSeeAdminRoute(access)} />
      <main className="main-workspace">
        <motion.div
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
