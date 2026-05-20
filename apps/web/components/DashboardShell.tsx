'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState, type ReactNode } from 'react';
import { canSeeAdminRoute } from '@pridicta/access';
import {
  getAppShellLabels,
  type AppShellLabels,
} from '@pridicta/config/language';
import type { ResolvedAccess } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { useDialogFocusTrap } from '../lib/use-dialog-focus-trap';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import {
  SidebarNav,
  type SidebarGroup,
  type SidebarSection,
} from './SidebarNav';
import { WebFooter } from './WebFooter';
import { WebLanguageSelector } from './WebLanguageSelector';

type DashboardNavModel = {
  commonGroups: SidebarGroup[];
  sections: SidebarSection[];
};

const SECTIONS_WITH_LOCAL_NAV = new Set([
  'vedic',
  'kp',
  'nadi',
  'numerology',
  'signature',
  'reports',
  'library',
  'account',
]);

function buildDashboardNavModel(
  labels: AppShellLabels,
  feedbackLabel: string,
): DashboardNavModel {
  const sections: SidebarSection[] = [
    {
      href: '/dashboard',
      id: 'overview',
      label: labels.nav.dashboard,
      items: [
        { href: '/dashboard', label: labels.nav.overview },
      ],
    },
    {
      href: '/dashboard/vedic',
      id: 'vedic',
      label: labels.nav.vedic,
      items: [
        { href: '/dashboard/vedic', label: labels.nav.vedicPredicta },
        { href: '/dashboard/vedic/chat', label: labels.nav.chat },
        { href: '/dashboard/kundli', label: labels.nav.kundli },
        { href: '/dashboard/charts', label: labels.nav.allCharts },
        { href: '/dashboard/timeline', label: labels.nav.timeline },
        { href: '/dashboard/remedies', label: labels.nav.remedies },
        { href: '/dashboard/holistic', label: labels.nav.holisticAstrology },
        { href: '/dashboard/birth-time', label: labels.nav.birthTime },
        { href: '/dashboard/decision', label: labels.nav.decision },
      ],
    },
    {
      href: '/dashboard/kp',
      id: 'kp',
      label: labels.nav.kp,
      items: [
        { href: '/dashboard/kp', label: labels.nav.kpPredicta },
        { href: '/dashboard/kp/chat', label: labels.nav.chat },
      ],
    },
    {
      href: '/dashboard/nadi',
      id: 'nadi',
      label: labels.nav.nadi,
      items: [
        { href: '/dashboard/nadi', label: labels.nav.nadiPredicta },
        { href: '/dashboard/nadi/chat', label: labels.nav.chat },
      ],
    },
    {
      href: '/dashboard/numerology',
      id: 'numerology',
      label: labels.nav.numerology,
      items: [
        { href: '/dashboard/numerology', label: labels.nav.numerologyPredicta },
        { href: '/dashboard/numerology/chat', label: labels.nav.chat },
      ],
    },
    {
      href: '/dashboard/signature',
      id: 'signature',
      label: labels.nav.signature,
      items: [
        { href: '/dashboard/signature', label: labels.nav.signaturePredicta },
        { href: '/dashboard/signature/chat', label: labels.nav.chat },
      ],
    },
    {
      href: '/dashboard/report',
      id: 'reports',
      label: labels.nav.reports,
      items: [
        { href: '/dashboard/report', label: labels.nav.reports },
        { href: '/dashboard/premium', label: labels.nav.premium },
      ],
    },
    {
      href: '/dashboard/saved-kundlis',
      id: 'library',
      label: labels.nav.library,
      items: [
        { href: '/dashboard/saved-kundlis', label: labels.nav.savedKundlis },
        { href: '/dashboard/family', label: labels.nav.family },
        { href: '/dashboard/relationship', label: labels.nav.relationship },
        { href: '/dashboard/wrapped', label: labels.nav.wrapped },
      ],
    },
    {
      href: '/dashboard/settings',
      id: 'account',
      label: labels.nav.account,
      items: [
        { href: '/dashboard/settings', label: labels.nav.settings },
        { href: '/dashboard/redeem-pass', label: labels.nav.redeemPass },
      ],
    },
  ];

  return {
    commonGroups: [
      {
        label: labels.groups.trust,
        items: [
          { href: '/accuracy-method', label: labels.nav.accuracyMethod },
          { href: '/safety', label: labels.nav.safetyPromise },
          { href: '/founder', label: labels.nav.founderVision },
          { href: '/feedback', label: feedbackLabel },
          { href: '/legal', label: labels.nav.legal },
        ],
      },
    ],
    sections,
  };
}

function isDashboardNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  if (href === '/dashboard') {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

function getActiveDashboardSection(
  pathname: string,
  sections: SidebarSection[],
): SidebarSection {
  if (pathname === '/dashboard/chat') {
    return sections.find(section => section.id === 'vedic') ?? sections[0];
  }

  return (
    sections.find(section =>
      section.items.some(item => isDashboardNavItemActive(pathname, item.href)),
    ) ?? sections[0]
  );
}

function renderDashboardMasterLink({
  activeSection,
  exactPage,
  onClick,
  section,
}: {
  activeSection: SidebarSection;
  exactPage: boolean;
  onClick?: () => void;
  section: SidebarSection;
}): React.JSX.Element {
  const active = section.id === activeSection.id;

  if (exactPage) {
    return (
      <span
        aria-current="page"
        aria-disabled="true"
        className="active disabled"
        key={section.id}
      >
        {section.label}
      </span>
    );
  }

  return (
    <Link
      aria-current={active ? 'true' : undefined}
      className={active ? 'active' : undefined}
      href={section.href}
      key={section.id}
      onClick={onClick}
    >
      {section.label}
    </Link>
  );
}

export function DashboardShell({
  access,
  children,
}: {
  access: ResolvedAccess;
  children: ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const isChatRoute =
    pathname === '/dashboard/chat' ||
    (pathname.startsWith('/dashboard/') && pathname.endsWith('/chat'));
  const reduceMotion = useReducedMotion();
  const { language } = useLanguagePreference();
  const shellLabels = getAppShellLabels(language);
  const { commonGroups, sections } = buildDashboardNavModel(
    shellLabels,
    getFeedbackNavLabel(language),
  );
  const activeSection = getActiveDashboardSection(pathname, sections);
  const showAdmin = canSeeAdminRoute(access);
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const mobileMenuCloseRef = useRef<HTMLButtonElement | null>(null);
  const { activeKundli } = useWebKundliLibrary();
  const supportGroups = showAdmin
    ? [
        ...commonGroups,
        {
          label: shellLabels.groups.owner,
          items: [{ href: '/dashboard/admin', label: shellLabels.nav.admin }],
        },
      ]
    : commonGroups;

  useDialogFocusTrap(mobileMenuRef, {
    active: menuOpen,
    initialFocusRef: mobileMenuCloseRef,
    onClose: () => setMenuOpen(false),
  });

  return (
    <div className={`dashboard-shell ${isChatRoute ? 'chat-route' : ''}`}>
      <SidebarNav
        activeSection={activeSection}
        adminLabel={shellLabels.nav.admin}
        commonGroups={commonGroups}
        ownerLabel={shellLabels.groups.owner}
        privateSaveBody={shellLabels.privateSave.body}
        privateSaveTitle={shellLabels.privateSave.title}
        showAdmin={showAdmin}
        thisSectionLabel={shellLabels.groups.thisSection}
      />
      <main className={`main-workspace ${isChatRoute ? 'chat-main-workspace' : ''}`}>
        <div className="dashboard-topbar glass-panel">
          <nav
            aria-label={shellLabels.groups.sections}
            className="dashboard-master-nav"
          >
            {sections.map(section =>
              renderDashboardMasterLink({
                activeSection,
                exactPage: pathname === section.href,
                section,
              }),
            )}
          </nav>
          <button
            aria-expanded={menuOpen}
            className="dashboard-mobile-current-section"
            onClick={() => setMenuOpen(current => !current)}
            type="button"
          >
            <span>{shellLabels.groups.sections}</span>
            <strong>{activeSection.label}</strong>
          </button>
          <div className="dashboard-topbar-actions">
            <WebLanguageSelector compact />
            <Link
              className="button secondary"
              href={buildPredictaChatHref({
                kundli: activeKundli,
                prompt: 'Help me from my selected Kundli.',
                sourceScreen: 'Dashboard',
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
        <div aria-hidden="true" className="dashboard-topbar-spacer" />
        {menuOpen ? (
          <div
            className="dashboard-mobile-menu"
            onClick={() => setMenuOpen(false)}
            role="presentation"
          >
            <aside
              aria-label="Dashboard menu"
              aria-modal="true"
              className="dashboard-mobile-drawer"
              onClick={event => event.stopPropagation()}
              ref={mobileMenuRef}
              role="dialog"
              tabIndex={-1}
            >
              <div className="dashboard-mobile-drawer-head">
                <strong>Predicta</strong>
                <button
                  aria-label={shellLabels.actions.closeMenu}
                  className="dashboard-menu-close"
                  onClick={() => setMenuOpen(false)}
                  ref={mobileMenuCloseRef}
                  type="button"
                >
                  {shellLabels.actions.close}
                </button>
              </div>
              <div className="dashboard-mobile-language">
                <WebLanguageSelector compact />
              </div>
              <nav aria-label="Dashboard menu links">
                <div className="dashboard-mobile-nav-section">
                  <span>{shellLabels.groups.sections}</span>
                  <div className="dashboard-mobile-section-switcher">
                    {sections.map(section =>
                      renderDashboardMasterLink({
                        activeSection,
                        exactPage: pathname === section.href,
                        onClick: () => setMenuOpen(false),
                        section,
                      }),
                    )}
                  </div>
                </div>

                <div className="dashboard-mobile-nav-section">
                  <span>{shellLabels.groups.thisSection}</span>
                  <div>
                    {activeSection.items.map(item => {
                      const active = isDashboardNavItemActive(
                        pathname,
                        item.href,
                      );

                      return (
                        active ? (
                          <span
                            aria-current="page"
                            aria-disabled="true"
                            className="active disabled"
                            key={item.href}
                          >
                            {item.label}
                          </span>
                        ) : (
                          <Link
                            href={item.href}
                            key={item.href}
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        )
                      );
                    })}
                  </div>
                </div>

                {supportGroups.map(group => (
                  <div className="dashboard-mobile-nav-section" key={group.label}>
                    <span>{group.label}</span>
                    <div>
                      {group.items.map(item => {
                        const active = isDashboardNavItemActive(
                          pathname,
                          item.href,
                        );

                        return (
                          active ? (
                            <span
                              aria-current="page"
                              aria-disabled="true"
                              className="active disabled"
                              key={item.href}
                            >
                              {item.label}
                            </span>
                          ) : (
                            <Link
                              href={item.href}
                              key={item.href}
                              onClick={() => setMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                          )
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
        {!isChatRoute && SECTIONS_WITH_LOCAL_NAV.has(activeSection.id) ? (
          <nav
            aria-label={`${activeSection.label} section navigation`}
            className="dashboard-local-nav glass-panel"
          >
            <span>{shellLabels.groups.thisSection}</span>
            <div>
              {activeSection.items.map(item => {
                const active = isDashboardNavItemActive(pathname, item.href);

                return active ? (
                  <span
                    aria-current="page"
                    aria-disabled="true"
                    className="active disabled"
                    key={item.href}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        ) : null}
        <motion.div
          className={`dashboard-motion-frame ${
            isChatRoute ? 'chat-motion-frame' : ''
          }`}
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
        {!isChatRoute ? <WebFooter className="dashboard-footer" /> : null}
      </main>
    </div>
  );
}

function getFeedbackNavLabel(language: 'en' | 'hi' | 'gu'): string {
  if (language === 'hi') {
    return 'फीडबैक';
  }

  if (language === 'gu') {
    return 'ફીડબેક';
  }

  return 'Feedback';
}
