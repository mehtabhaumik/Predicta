'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { canSeeAdminRoute } from '@pridicta/access';
import {
  getAppShellLabels,
  type AppShellLabels,
} from '@pridicta/config/language';
import type { ResolvedAccess } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { StatusPill } from './StatusPill';
import { SidebarNav, type SidebarGroup } from './SidebarNav';
import { WebFooter } from './WebFooter';
import { WebLanguageSelector } from './WebLanguageSelector';

function buildDashboardNavGroups(labels: AppShellLabels): SidebarGroup[] {
  return [
  {
    label: labels.groups.start,
    items: [
      { href: '/dashboard', label: labels.nav.overview },
      { href: '/dashboard/chat', label: labels.nav.chat },
      { href: '/dashboard/decision', label: labels.nav.decision },
    ],
  },
  {
    label: labels.groups.charts,
    items: [
      { href: '/dashboard/kundli', label: labels.nav.kundli },
      { href: '/dashboard/charts', label: labels.nav.allCharts },
      { href: '/dashboard/kp', label: labels.nav.kpPredicta },
      { href: '/dashboard/nadi', label: labels.nav.nadiPredicta },
    ],
  },
  {
    label: labels.groups.guidance,
    items: [
      { href: '/dashboard/timeline', label: labels.nav.timeline },
      { href: '/dashboard/holistic', label: labels.nav.holisticAstrology },
      { href: '/dashboard/remedies', label: labels.nav.remedies },
      { href: '/dashboard/birth-time', label: labels.nav.birthTime },
      { href: '/dashboard/relationship', label: labels.nav.relationship },
      { href: '/dashboard/family', label: labels.nav.family },
    ],
  },
  {
    label: labels.groups.savedWork,
    items: [
      { href: '/dashboard/wrapped', label: labels.nav.wrapped },
      { href: '/dashboard/report', label: labels.nav.reports },
      { href: '/dashboard/saved-kundlis', label: labels.nav.savedKundlis },
    ],
  },
  {
    label: labels.groups.account,
    items: [
      { href: '/dashboard/premium', label: labels.nav.premium },
      { href: '/dashboard/redeem-pass', label: labels.nav.redeemPass },
      { href: '/dashboard/settings', label: labels.nav.settings },
      { href: '/safety', label: labels.nav.safetyPromise },
      { href: '/founder', label: labels.nav.founderVision },
      { href: '/legal', label: labels.nav.legal },
    ],
  },
  ];
}

export function DashboardShell({
  access,
  children,
}: {
  access: ResolvedAccess;
  children: ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { language } = useLanguagePreference();
  const shellLabels = getAppShellLabels(language);
  const navGroups = buildDashboardNavGroups(shellLabels);
  const accessText =
    access.source === 'free' ? shellLabels.access.freePreview : access.accessLevel;
  const showAdmin = canSeeAdminRoute(access);
  const [menuOpen, setMenuOpen] = useState(false);
  const { activeKundli } = useWebKundliLibrary();
  const visibleGroups = showAdmin
    ? [
        ...navGroups,
        {
          label: shellLabels.groups.owner,
          items: [{ href: '/dashboard/admin', label: shellLabels.nav.admin }],
        },
      ]
    : navGroups;

  return (
    <div className="dashboard-shell">
      <SidebarNav
        adminLabel={shellLabels.nav.admin}
        groups={navGroups}
        ownerLabel={shellLabels.groups.owner}
        privateSaveBody={shellLabels.privateSave.body}
        privateSaveTitle={shellLabels.privateSave.title}
        showAdmin={showAdmin}
      />
      <main className="main-workspace">
        <div className="dashboard-topbar glass-panel">
          <div>
            <StatusPill
              label={
                access.hasPremiumAccess
                  ? shellLabels.access.premiumDepthAvailable
                  : accessText
              }
              tone={access.hasPremiumAccess ? 'premium' : 'quiet'}
            />
            <p>{shellLabels.topbarDescription}</p>
          </div>
          <div className="dashboard-topbar-actions">
            <WebLanguageSelector compact />
            <Link
              className="button secondary"
              href={buildPredictaChatHref({
                kundli: activeKundli,
                prompt: 'Help me from my selected Kundli.',
                sourceScreen: 'Dashboard Header',
              })}
            >
              {shellLabels.actions.askPredicta}
            </Link>
            <button
              aria-expanded={menuOpen}
              aria-label={
                menuOpen
                  ? shellLabels.actions.closeMenu
                  : shellLabels.actions.openMenu
              }
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
                  aria-label={shellLabels.actions.closeMenu}
                  className="dashboard-menu-close"
                  onClick={() => setMenuOpen(false)}
                  type="button"
                >
                  {shellLabels.actions.close}
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
                <span>{shellLabels.privateSave.title}</span>
                <p>{shellLabels.privateSave.body}</p>
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
