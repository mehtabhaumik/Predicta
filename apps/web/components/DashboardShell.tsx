'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { canSeeAdminRoute } from '@pridicta/access';
import { translateUiText } from '@pridicta/config/uiTranslations';
import type {
  PredictaSchool,
  ResolvedAccess,
} from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { preloadAskPredictaRuntime } from '../lib/predicta-chat-runtime-preload';
import {
  getLightweightAppShellLabels,
  type LightweightAppShellLabels,
} from '../lib/lightweight-public-copy';
import { isOwnerConsoleEnabled } from '../lib/owner-surface';
import { useDialogFocusTrap } from '../lib/use-dialog-focus-trap';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';
import {
  SidebarNav,
  type SidebarGroup,
  type SidebarSection,
} from './SidebarNav';
import { LightweightLanguageSelector } from './LightweightLanguageSelector';

const DashboardPassBanner = dynamic(
  () =>
    import('./DashboardPassBanner').then(module => ({
      default: module.DashboardPassBanner,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);

type DashboardNavModel = {
  commonGroups: SidebarGroup[];
  sections: SidebarSection[];
};

const DASHBOARD_PRIMARY_SECTION_IDS = new Set([
  'predicta',
  'library',
  'reports',
  'account',
]);
const DASHBOARD_WORLD_SECTION_IDS = new Set([
  'vedic',
  'kp',
  'jaimini',
  'numerology',
  'signature',
]);
const DASHBOARD_WORLD_HOME_PATHS = new Set([
  '/dashboard/vedic',
  '/dashboard/kp',
  '/dashboard/jaimini',
  '/dashboard/numerology',
  '/dashboard/signature',
]);
function buildDashboardNavModel(
  labels: LightweightAppShellLabels,
): DashboardNavModel {
  const sections: SidebarSection[] = [
    {
      href: '/ask',
      id: 'predicta',
      label: labels.actions.askPredicta,
      items: [
        { href: '/ask', label: labels.actions.askPredicta },
      ],
    },
    {
      href: '/dashboard/vedic',
      id: 'vedic',
      label: labels.nav.vedicEvidence,
      items: [
        { href: '/dashboard/vedic', label: labels.nav.vedicPredicta },
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
      label: labels.nav.kpEvidence,
      items: [
        { href: '/dashboard/kp', label: labels.nav.kpPredicta },
      ],
    },
    {
      href: '/dashboard/jaimini',
      id: 'jaimini',
      label: labels.nav.jaiminiEvidence,
      items: [
        { href: '/dashboard/jaimini', label: labels.nav.jaiminiPredicta },
      ],
    },
    {
      href: '/dashboard/numerology',
      id: 'numerology',
      label: labels.nav.numerologyEvidence,
      items: [
        { href: '/dashboard/numerology', label: labels.nav.numerologyPredicta },
      ],
    },
    {
      href: '/dashboard/signature',
      id: 'signature',
      label: labels.nav.signatureEvidence,
      items: [
        { href: '/dashboard/signature', label: labels.nav.signaturePredicta },
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
      href: '/dashboard',
      id: 'library',
      label: labels.nav.library,
      items: [
        { href: '/dashboard', label: labels.nav.dashboard },
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
  if (pathname === '/dashboard') {
    return sections.find(section => section.id === 'library') ?? sections[0];
  }

  if (pathname === '/dashboard/chat') {
    return sections.find(section => section.id === 'predicta') ?? sections[0];
  }

  return (
    sections.find(section =>
      section.items.some(item => isDashboardNavItemActive(pathname, item.href)),
    ) ?? sections[0]
  );
}

function renderDashboardMasterLink({
  activeSection,
  onClick,
  section,
}: {
  activeSection: SidebarSection;
  onClick?: () => void;
  section: SidebarSection;
}): React.JSX.Element {
  const active = section.id === activeSection.id;

  return (
    <Link
      aria-current={active ? 'page' : undefined}
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

  return 'My Kundlis';
}

export function DashboardShell({
  access,
  children,
}: {
  access: ResolvedAccess;
  children: ReactNode;
}): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const isDashboardHomeRoute = pathname === '/dashboard';
  const isChatRoute =
    pathname === '/dashboard/chat' ||
    (pathname.startsWith('/dashboard/') && pathname.endsWith('/chat'));
  const { language } = useLightweightLanguagePreference();
  const shellLabels = getLightweightAppShellLabels(language);
  const { commonGroups, sections } = buildDashboardNavModel(shellLabels);
  const activeSection = getActiveDashboardSection(pathname, sections);
  const isWorldHomeRoute = DASHBOARD_WORLD_HOME_PATHS.has(pathname);
  const showAskDock =
    !isChatRoute &&
    !isWorldHomeRoute &&
    pathname !== '/dashboard' &&
    pathname !== '/dashboard/report' &&
    !pathname.startsWith('/dashboard/admin');
  const primarySections = sections.filter(section =>
    DASHBOARD_PRIMARY_SECTION_IDS.has(section.id),
  );
  const utilitySections = primarySections.filter(section => section.id !== 'predicta');
  const visibleUtilitySections = utilitySections.filter(
    section => section.id !== activeSection.id,
  );
  const worldSections = sections.filter(section =>
    DASHBOARD_WORLD_SECTION_IDS.has(section.id),
  );
  const showAdmin = isOwnerConsoleEnabled() && canSeeAdminRoute(access);
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const mobileMenuCloseRef = useRef<HTMLButtonElement | null>(null);
  const activeKundliId = useLightweightActiveKundliId();
  const topbarContext = getTopbarContextCopy(shellLabels, activeSection);
  const askPredictaHref = buildPredictaChatHref({
    kundliId: activeKundliId,
    prompt: 'Help me from my selected Kundli.',
    school: getTopbarPredictaSchool(activeSection.id),
    sourceScreen: getTopbarPredictaSourceScreen(activeSection),
  });
  const askFromPageHref = buildPredictaChatHref({
    kundliId: activeKundliId,
    prompt: buildAskDockPrompt({
      section: activeSection.label,
      template: shellLabels.actions.askDockPrompt,
    }),
    school: getTopbarPredictaSchool(activeSection.id),
    sourceScreen: getTopbarPredictaSourceScreen(activeSection),
  });

  function prewarmAskPredicta(href: string): void {
    preloadAskPredictaRuntime();
    router.prefetch(href);
  }

  useEffect(() => {
    router.prefetch('/ask');
    router.prefetch(askPredictaHref);

    if (showAskDock) {
      router.prefetch(askFromPageHref);
    }
  }, [askFromPageHref, askPredictaHref, router, showAskDock]);
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

  const shellClassName = [
    'dashboard-shell',
    isChatRoute ? 'chat-route' : undefined,
    !isChatRoute && showAskDock ? 'has-ask-dock' : undefined,
    !isChatRoute && isDashboardHomeRoute ? 'dashboard-home-route' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClassName}>
      <SidebarNav
        activeSection={activeSection}
        adminLabel={shellLabels.nav.admin}
        allSections={sections}
        brandSubtitle={shellLabels.topbarDescription}
        commonGroups={commonGroups}
        homeAriaLabel={shellLabels.nav.home}
        navAriaLabel={translateUiText('My Astrology navigation', language)}
        onPredictaIntent={() => prewarmAskPredicta(askPredictaHref)}
        ownerLabel={shellLabels.groups.owner}
        sectionLabel={shellLabels.groups.thisSection}
        showAdmin={showAdmin}
        startLabel={shellLabels.groups.start}
        worldsSummaryLabel={shellLabels.groups.schools}
        worldsLabel={shellLabels.groups.worlds}
      />
      <main className={`main-workspace ${isChatRoute ? 'chat-main-workspace' : ''}`}>
        <div className="dashboard-topbar glass-panel">
          <div className="dashboard-topbar-context">
            <span>{topbarContext.eyebrow}</span>
            <strong>{activeSection.label}</strong>
          </div>
          <div className="dashboard-topbar-actions">
            <LightweightLanguageSelector compact hideCompactLabel />
            <Link
              className="button"
              href={askPredictaHref}
              onFocus={() => prewarmAskPredicta(askPredictaHref)}
              onPointerEnter={() => prewarmAskPredicta(askPredictaHref)}
              onTouchStart={() => prewarmAskPredicta(askPredictaHref)}
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
        <DashboardPassBanner initialPass={access.activeGuestPass} />
        {menuOpen ? (
          <div
            className="dashboard-mobile-menu"
            onClick={() => setMenuOpen(false)}
            role="presentation"
          >
            <aside
              aria-label={translateUiText('My Astrology menu', language)}
              aria-modal="true"
              className="dashboard-mobile-drawer"
              onClick={event => event.stopPropagation()}
              ref={mobileMenuRef}
              role="dialog"
              tabIndex={-1}
            >
              <div className="dashboard-mobile-drawer-head">
                <strong>{shellLabels.groups.predicta}</strong>
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
                <LightweightLanguageSelector compact />
              </div>
              <nav
                aria-label={translateUiText('My Astrology menu links', language)}
                className="dashboard-mobile-revival-nav"
              >
                <Link
                  className="dashboard-mobile-primary-ask"
                  href={askPredictaHref}
                  onFocus={() => prewarmAskPredicta(askPredictaHref)}
                  onPointerEnter={() => prewarmAskPredicta(askPredictaHref)}
                  onTouchStart={() => prewarmAskPredicta(askPredictaHref)}
                  onClick={() => setMenuOpen(false)}
                >
                  {shellLabels.actions.askPredicta}
                </Link>

                {worldSections.length ? (
                  <details
                    className="dashboard-mobile-nav-drawer"
                    data-active={
                      DASHBOARD_WORLD_SECTION_IDS.has(activeSection.id)
                        ? 'true'
                        : 'false'
                    }
                  >
                    <summary>
                      <span>{shellLabels.groups.worlds}</span>
                      <strong>
                        {DASHBOARD_WORLD_SECTION_IDS.has(activeSection.id)
                          ? activeSection.label
                          : shellLabels.groups.schools}
                      </strong>
                    </summary>
                    <div className="dashboard-mobile-section-switcher">
                      {worldSections.map(section =>
                        renderDashboardMasterLink({
                          activeSection,
                          onClick: () => setMenuOpen(false),
                          section,
                        }),
                      )}
                    </div>
                  </details>
                ) : null}

                {utilitySections.length ? (
                  <details
                    className="dashboard-mobile-nav-drawer"
                    data-active={
                      utilitySections.some(section => section.id === activeSection.id)
                        ? 'true'
                        : 'false'
                    }
                  >
                    <summary>
                      <span>{shellLabels.groups.start}</span>
                      <strong>
                        {utilitySections.some(section => section.id === activeSection.id)
                          ? activeSection.label
                          : utilitySections.map(section => section.label).join(' · ')}
                      </strong>
                    </summary>
                    <div className="dashboard-mobile-section-switcher">
                      {visibleUtilitySections.map(section =>
                        renderDashboardMasterLink({
                          activeSection,
                          onClick: () => setMenuOpen(false),
                          section,
                        }),
                      )}
                    </div>
                  </details>
                ) : null}

                {activeSectionMenuItems.length ? (
                  <details
                    className="dashboard-mobile-nav-drawer"
                    data-active="true"
                  >
                    <summary>
                      <span>{shellLabels.groups.thisSection}</span>
                      <strong>{activeSection.label}</strong>
                    </summary>
                    <div>
                      {activeSectionMenuItems.map(item => {
                        const active = isDashboardNavItemActive(
                          pathname,
                          item.href,
                        );

                        return (
                          <Link
                            aria-current={active ? 'page' : undefined}
                            className={active ? 'active' : undefined}
                            href={item.href}
                            key={item.href}
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </details>
                ) : null}

                {supportGroups.map(group => (
                  <details
                    className="dashboard-mobile-nav-drawer"
                    key={group.label}
                  >
                    <summary>
                      <span>{group.label}</span>
                      <strong>{group.label}</strong>
                    </summary>
                    <div>
                      {group.items.map(item => {
                        const active = isDashboardNavItemActive(
                          pathname,
                          item.href,
                        );

                        return (
                          <Link
                            aria-current={active ? 'page' : undefined}
                            className={active ? 'active' : undefined}
                            href={item.href}
                            key={item.href}
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </nav>
            </aside>
          </div>
        ) : null}
        <div
          className={`dashboard-motion-frame ${
            isChatRoute ? 'chat-motion-frame' : ''
          }`}
        >
          {children}
        </div>
        {showAskDock ? (
          <aside
            aria-label={shellLabels.actions.askDockTitle}
            className="dashboard-ask-dock glass-panel"
          >
            <div>
              <span>{shellLabels.actions.askDockEyebrow}</span>
              <strong>{shellLabels.actions.askDockTitle}</strong>
              <small>{shellLabels.actions.askDockBody}</small>
            </div>
            <Link
              className="button"
              href={askFromPageHref}
              onFocus={() => prewarmAskPredicta(askFromPageHref)}
              onPointerEnter={() => prewarmAskPredicta(askFromPageHref)}
              onTouchStart={() => prewarmAskPredicta(askFromPageHref)}
            >
              {shellLabels.actions.askDockCta}
            </Link>
          </aside>
        ) : null}
        {!isChatRoute ? (
          <DashboardLightFooter labels={shellLabels} />
        ) : null}
      </main>
    </div>
  );
}

function buildAskDockPrompt({
  section,
  template,
}: {
  section: string;
  template: string;
}): string {
  return template.replace('{section}', section);
}

function getTopbarContextCopy(
  labels: LightweightAppShellLabels,
  activeSection: SidebarSection,
): { eyebrow: string } {
  if (activeSection.id === 'predicta') {
    return { eyebrow: labels.groups.predicta };
  }

  if (activeSection.id === 'library') {
    return { eyebrow: labels.nav.savedKundlis };
  }

  if (activeSection.id === 'account') {
    return { eyebrow: labels.nav.account };
  }

  return { eyebrow: activeSection.label };
}

function useLightweightActiveKundliId(): string | undefined {
  const [activeKundliId, setActiveKundliId] = useState<string | undefined>();

  useEffect(() => {
    function refresh() {
      setActiveKundliId(readLightweightActiveKundliId());
    }

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('pridicta:web-kundli-updated', refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('pridicta:web-kundli-updated', refresh);
    };
  }, []);

  return activeKundliId;
}

function readLightweightActiveKundliId(): string | undefined {
  try {
    const storeRaw = window.localStorage.getItem('pridicta.webKundliStore.v1');

    if (storeRaw) {
      const store = JSON.parse(storeRaw) as {
        activeKundli?: { id?: string };
        activeKundliId?: string;
      };

      if (store.activeKundliId || store.activeKundli?.id) {
        return store.activeKundliId ?? store.activeKundli?.id;
      }
    }

    const activeRaw = window.localStorage.getItem('pridicta.activeKundli.v1');

    if (activeRaw) {
      const active = JSON.parse(activeRaw) as { id?: string };

      return active.id;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function DashboardLightFooter({
  labels,
}: {
  labels: LightweightAppShellLabels;
}): React.JSX.Element {
  return (
    <footer className="web-footer web-footer-compact dashboard-footer">
      <div className="web-footer-compact-row">
        <div className="web-footer-compact-brand">
          <Link aria-label={labels.nav.home} className="web-footer-logo" href="/">
            {labels.groups.predicta}
          </Link>
          <span>{labels.topbarDescription}</span>
        </div>
        <nav
          aria-label={labels.groups.sections}
          className="web-footer-compact-links"
        >
          <Link href="/accuracy-method">{labels.nav.accuracyMethod}</Link>
          <Link href="/safety">{labels.nav.safetyPromise}</Link>
          <Link href="/legal">{labels.nav.legal}</Link>
          <Link href="/feedback">{labels.nav.feedback}</Link>
        </nav>
      </div>
      <div className="web-footer-bottom compact">
        <span>{labels.groups.predicta} @2026</span>
        <span>{labels.publicDisclaimer}</span>
      </div>
    </footer>
  );
}
