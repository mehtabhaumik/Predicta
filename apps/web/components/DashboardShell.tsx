'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { canSeeAdminRoute } from '@pridicta/access';
import type { ResolvedAccess } from '@pridicta/types';
import { StatusPill } from './StatusPill';
import { SidebarNav, type SidebarItem } from './SidebarNav';
import { WebFooter } from './WebFooter';
import { WebLanguageSelector } from './WebLanguageSelector';

const links: SidebarItem[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/chat', label: 'Chat' },
  { href: '/dashboard/decision', label: 'Decision' },
  { href: '/dashboard/kundli', label: 'Kundli' },
  { href: '/dashboard/charts', label: 'Charts' },
  { href: '/dashboard/kp', label: 'KP Predicta' },
  { href: '/dashboard/nadi', label: 'Nadi' },
  { href: '/dashboard/timeline', label: 'Timeline' },
  { href: '/dashboard/remedies', label: 'Remedies' },
  { href: '/dashboard/birth-time', label: 'Birth Time' },
  { href: '/dashboard/relationship', label: 'Relationship' },
  { href: '/dashboard/family', label: 'Family' },
  { href: '/dashboard/wrapped', label: 'Wrapped' },
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
  const accessText = access.source === 'free' ? 'Free preview' : access.accessLevel;

  return (
    <div className="dashboard-shell">
      <SidebarNav items={links} showAdmin={canSeeAdminRoute(access)} />
      <main className="main-workspace">
        <div className="dashboard-topbar glass-panel">
          <div>
            <StatusPill
              label={access.hasPremiumAccess ? 'Premium depth available' : accessText}
              tone={access.hasPremiumAccess ? 'premium' : 'quiet'}
            />
            <p>Spacious guidance, reports, charts, and saved kundlis.</p>
          </div>
          <div className="dashboard-topbar-actions">
            <WebLanguageSelector compact />
            <Link className="button secondary" href="/dashboard/chat">
              Ask Predicta
            </Link>
          </div>
        </div>
        <motion.div
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
        <WebFooter className="dashboard-footer" />
      </main>
    </div>
  );
}
