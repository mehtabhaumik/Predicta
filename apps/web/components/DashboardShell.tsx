'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { canSeeAdminRoute } from '@pridicta/access';
import type { ResolvedAccess } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { StatusPill } from './StatusPill';
import { SidebarNav, type SidebarGroup } from './SidebarNav';
import { WebFooter } from './WebFooter';
import { WebLanguageSelector } from './WebLanguageSelector';

const navGroups: SidebarGroup[] = [
  {
    label: 'Start',
    items: [
      { href: '/dashboard', label: 'Overview' },
      { href: '/dashboard/chat', label: 'Chat' },
      { href: '/dashboard/decision', label: 'Decision' },
    ],
  },
  {
    label: 'Charts',
    items: [
      { href: '/dashboard/kundli', label: 'Kundli' },
      { href: '/dashboard/charts', label: 'All Charts' },
      { href: '/dashboard/kp', label: 'KP Predicta' },
      { href: '/dashboard/nadi', label: 'Nadi Predicta' },
    ],
  },
  {
    label: 'Guidance',
    items: [
      { href: '/dashboard/timeline', label: 'Timeline' },
      { href: '/dashboard/holistic', label: 'Holistic Astrology' },
      { href: '/dashboard/remedies', label: 'Remedies' },
      { href: '/dashboard/birth-time', label: 'Birth Time' },
      { href: '/dashboard/relationship', label: 'Relationship' },
      { href: '/dashboard/family', label: 'Family' },
    ],
  },
  {
    label: 'Saved Work',
    items: [
      { href: '/dashboard/wrapped', label: 'Wrapped' },
      { href: '/dashboard/report', label: 'Reports' },
      { href: '/dashboard/saved-kundlis', label: 'Saved Kundlis' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/dashboard/premium', label: 'Premium' },
      { href: '/dashboard/redeem-pass', label: 'Redeem Pass' },
      { href: '/dashboard/settings', label: 'Settings' },
      { href: '/safety', label: 'Safety Promise' },
      { href: '/founder', label: 'Founder Vision' },
      { href: '/legal', label: 'Legal' },
    ],
  },
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
  const showAdmin = canSeeAdminRoute(access);
  const [menuOpen, setMenuOpen] = useState(false);
  const { activeKundli } = useWebKundliLibrary();
  const visibleGroups = showAdmin
    ? [
        ...navGroups,
        { label: 'Owner', items: [{ href: '/dashboard/admin', label: 'Admin' }] },
      ]
    : navGroups;

  return (
    <div className="dashboard-shell">
      <SidebarNav groups={navGroups} showAdmin={showAdmin} />
      <main className="main-workspace">
        <div className="dashboard-topbar glass-panel">
          <div>
            <StatusPill
              label={access.hasPremiumAccess ? 'Premium depth available' : accessText}
              tone={access.hasPremiumAccess ? 'premium' : 'quiet'}
            />
            <p>Holistic astrology guidance, reports, charts, and saved kundlis.</p>
          </div>
          <div className="dashboard-topbar-actions">
            <WebLanguageSelector compact />
            <Link
              className="button secondary"
              href={buildPredictaChatHref({
                kundli: activeKundli,
                prompt: 'Help me from my active Kundli.',
                sourceScreen: 'Dashboard Header',
              })}
            >
              Ask Predicta
            </Link>
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
              className="dashboard-menu-toggle"
              onClick={() => setMenuOpen(current => !current)}
              type="button"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        {menuOpen ? (
          <div
            className="dashboard-mobile-menu"
            onClick={() => setMenuOpen(false)}
            role="presentation"
          >
            <aside
              aria-label="Dashboard menu"
              className="dashboard-mobile-drawer"
              onClick={event => event.stopPropagation()}
            >
              <div className="dashboard-mobile-drawer-head">
                <strong>Predicta</strong>
                <button
                  aria-label="Close dashboard menu"
                  className="dashboard-menu-close"
                  onClick={() => setMenuOpen(false)}
                  type="button"
                >
                  Close
                </button>
              </div>
              <nav aria-label="Dashboard menu links">
                {visibleGroups.map(group => (
                  <div className="dashboard-mobile-nav-section" key={group.label}>
                    <span>{group.label}</span>
                    <div>
                      {group.items.map(item => {
                        const active =
                          item.href === '/dashboard'
                            ? pathname === item.href
                            : pathname.startsWith(item.href);

                        return (
                          <Link
                            aria-current={active ? 'page' : undefined}
                            className={active ? 'active' : ''}
                            href={item.href}
                            key={item.href}
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
              <div className="dashboard-mobile-drawer-note">
                <span>Private save</span>
                <p>This browser remembers your chart. Sign in to keep it across devices.</p>
              </div>
            </aside>
          </div>
        ) : null}
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
