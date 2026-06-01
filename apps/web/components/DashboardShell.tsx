'use client';

import { getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useRef, useState, type ReactNode } from 'react';
import { canSeeAdminRoute } from '@pridicta/access';
import {
  getAppShellLabels,
  type AppShellLabels,
} from '@pridicta/config/language';
import type {
  PredictaSchool,
  ResolvedAccess,
  SupportedLanguage,
} from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { isOwnerConsoleEnabled } from '../lib/owner-surface';
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

function buildDashboardNavModel(
  labels: AppShellLabels,
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
      href: '/dashboard/jaimini',
      id: 'jaimini',
      label: labels.nav.nadi,
      items: [
        { href: '/dashboard/jaimini', label: labels.nav.nadiPredicta },
        { href: '/dashboard/jaimini/chat', label: labels.nav.chat },
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
        { href: '/dashboard/matchmaking', label: labels.nav.relationship },
        { href: '/dashboard/wrapped', label: labels.nav.wrapped },
      ],
    },
    {
      href: '/dashboard/account',
      id: 'account',
      label: labels.nav.account,
      items: [
        { href: '/dashboard/account', label: labels.nav.account },
        { href: '/dashboard/settings', label: labels.nav.settings },
        { href: '/dashboard/redeem-pass', label: labels.nav.redeemPass },
      ],
    },
  ];

  return {
    commonGroups: [],
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

function getTopbarPredictaSchool(
  sectionId: SidebarSection['id'],
): PredictaSchool | undefined {
  if (sectionId === 'vedic') {
    return 'PARASHARI';
  }

  if (sectionId === 'kp') {
    return 'KP';
  }

  if (sectionId === 'jaimini') {
    return 'JAIMINI';
  }

  if (sectionId === 'numerology') {
    return 'NUMEROLOGY';
  }

  if (sectionId === 'signature') {
    return 'SIGNATURE';
  }

  return undefined;
}

function getTopbarPredictaSourceScreen(
  activeSection: SidebarSection,
): string {
  const school = getTopbarPredictaSchool(activeSection.id);

  if (school === 'PARASHARI') {
    return 'Vedic Predicta';
  }

  if (school === 'KP') {
    return 'KP Predicta';
  }

  if (school === 'JAIMINI') {
    return 'Jaimini Predicta';
  }

  if (school === 'NUMEROLOGY') {
    return 'Numerology Predicta';
  }

  if (school === 'SIGNATURE') {
    return 'Signature Predicta';
  }

  return 'Dashboard';
}

const TOPBAR_CONTEXT_COPY: Record<
  SupportedLanguage,
  Record<SidebarSection['id'], { eyebrow: string }>
> = {
  en: {
    overview: {
      eyebrow: 'Your home base',
    },
    vedic: {
      eyebrow: 'Vedic world',
    },
    kp: {
      eyebrow: 'KP world',
    },
    jaimini: {
      eyebrow: 'Jaimini world',
    },
    numerology: {
      eyebrow: 'Numerology world',
    },
    signature: {
      eyebrow: 'Signature world',
    },
    reports: {
      eyebrow: 'Reports',
    },
    library: {
      eyebrow: 'Saved Kundlis',
    },
    account: {
      eyebrow: 'Profile and access',
    },
  },
  hi: {
    overview: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.a58a16f75f"),
    },
    vedic: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.4433fb4239"),
    },
    kp: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.52b093a650"),
    },
    jaimini: {
      eyebrow: 'जैमिनी वर्ल्ड',
    },
    numerology: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.6266a5cb0b"),
    },
    signature: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.a334c40338"),
    },
    reports: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.89a0ae86a5"),
    },
    library: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.bc3580d452"),
    },
    account: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.fdf9aaead1"),
    },
  },
  gu: {
    overview: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.7c0d6dcdaa"),
    },
    vedic: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.ef488c5215"),
    },
    kp: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.147aaffa0e"),
    },
    jaimini: {
      eyebrow: 'જૈમિની વર્લ્ડ',
    },
    numerology: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.57d87b38a6"),
    },
    signature: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.a0be021643"),
    },
    reports: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.d6aa714c20"),
    },
    library: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.7d2df2a8a8"),
    },
    account: {
      eyebrow: getNativeCopy("native.apps.web.components.DashboardShell.tsx.b2de3ab000"),
    },
  },
};

function getTopbarContextCopy(
  language: SupportedLanguage,
  sectionId: SidebarSection['id'],
): { eyebrow: string } {
  return TOPBAR_CONTEXT_COPY[language]?.[sectionId] ?? TOPBAR_CONTEXT_COPY.en[sectionId];
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
  const { commonGroups, sections } = buildDashboardNavModel(shellLabels);
  const activeSection = getActiveDashboardSection(pathname, sections);
  const showAdmin = isOwnerConsoleEnabled() && canSeeAdminRoute(access);
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const mobileMenuCloseRef = useRef<HTMLButtonElement | null>(null);
  const { activeKundli } = useWebKundliLibrary();
  const topbarContext = getTopbarContextCopy(language, activeSection.id);
  const activeSectionMenuItems = activeSection.items.filter(
    (item, index) =>
      !(
        index === 0 &&
        item.href === activeSection.href &&
        pathname === activeSection.href
      ),
  );
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
        allSections={sections}
        brandSubtitle={shellLabels.topbarDescription}
        commonGroups={commonGroups}
        homeAriaLabel={shellLabels.nav.home}
        ownerLabel={shellLabels.groups.owner}
        showAdmin={showAdmin}
        worldsLabel={shellLabels.groups.sections}
      />
      <main className={`main-workspace ${isChatRoute ? 'chat-main-workspace' : ''}`}>
        <div className="dashboard-topbar glass-panel">
          <div className="dashboard-topbar-context">
            <span>{topbarContext.eyebrow}</span>
            <strong>{activeSection.label}</strong>
          </div>
          <div className="dashboard-topbar-actions">
            <WebLanguageSelector compact />
            <Link
              className="button secondary"
              href={buildPredictaChatHref({
                kundli: activeKundli,
                prompt: 'Help me from my selected Kundli.',
                school: getTopbarPredictaSchool(activeSection.id),
                sourceScreen: getTopbarPredictaSourceScreen(activeSection),
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

                {activeSectionMenuItems.length ? (
                  <div className="dashboard-mobile-nav-section">
                    <span>{activeSection.label}</span>
                    <div>
                      {activeSectionMenuItems.map(item => {
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
                ) : null}

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
            </aside>
          </div>
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
        {!isChatRoute ? (
          <WebFooter className="dashboard-footer" variant="dashboard" />
        ) : null}
      </main>
    </div>
  );
}
