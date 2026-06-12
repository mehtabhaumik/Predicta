'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type SidebarItem = {
  href: string;
  label: string;
};

export type SidebarGroup = {
  label: string;
  items: SidebarItem[];
};

export type SidebarSection = SidebarGroup & {
  href: string;
  id: string;
};

const PRIMARY_SECTION_IDS = new Set(['predicta', 'library', 'reports', 'account']);
const WORLD_SECTION_IDS = new Set([
  'vedic',
  'kp',
  'jaimini',
  'numerology',
  'signature',
]);

function isSidebarNavItemActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  if (href === '/dashboard') {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function SidebarNav({
  adminLabel = 'Admin',
  allSections,
  commonGroups,
  activeSection,
  brandSubtitle = 'Holistic astrology guide',
  homeAriaLabel = 'Predicta home',
  navAriaLabel = 'My Astrology navigation',
  onPredictaIntent,
  ownerLabel = 'Owner',
  showAdmin,
  startLabel = 'Start',
  worldsLabel = 'Predicta Worlds',
}: {
  adminLabel?: string;
  activeSection: SidebarSection;
  allSections: SidebarSection[];
  brandSubtitle?: string;
  commonGroups: SidebarGroup[];
  homeAriaLabel?: string;
  navAriaLabel?: string;
  onPredictaIntent?: () => void;
  ownerLabel?: string;
  showAdmin: boolean;
  startLabel?: string;
  worldsLabel?: string;
}): React.JSX.Element {
  const pathname = usePathname();
  const primarySections = allSections.filter(section =>
    PRIMARY_SECTION_IDS.has(section.id),
  );
  const predictaSection = primarySections.find(section => section.id === 'predicta');
  const utilitySections = primarySections.filter(section => section.id !== 'predicta');
  const worldSections = allSections.filter(section =>
    WORLD_SECTION_IDS.has(section.id),
  );
  const supportGroups = showAdmin
    ? [
        ...commonGroups,
        {
          label: ownerLabel,
          items: [{ href: '/dashboard/admin', label: adminLabel }],
        },
      ]
    : commonGroups;

  return (
    <aside className="sidebar">
      <Link aria-label={homeAriaLabel} className="dashboard-brand" href="/">
        <img
          alt=""
          className="dashboard-logo"
          height={74}
          src="/predicta-logo.png"
          width={74}
        />
        <span>
          <strong>PREDICTA</strong>
          <small>{brandSubtitle}</small>
        </span>
      </Link>
      <nav aria-label={navAriaLabel} className="nav-list nav-list-revival">
        {predictaSection ? (
          <div className="nav-section nav-section-predicta-first">
            {renderSidebarSectionLink({
              activeSection,
              onIntent: onPredictaIntent,
              primary: true,
              section: predictaSection,
            })}
          </div>
        ) : null}

        {worldSections.length ? (
          <details
            className="sidebar-nav-drawer"
            data-active={WORLD_SECTION_IDS.has(activeSection.id) ? 'true' : 'false'}
          >
            <summary>
              <span>{worldsLabel}</span>
              <strong>
                {WORLD_SECTION_IDS.has(activeSection.id)
                  ? activeSection.label
                  : worldsLabel}
              </strong>
            </summary>
            <div className="nav-section-links nav-section-links--compact">
              {worldSections.map(section =>
                renderSidebarSectionLink({ activeSection, compact: true, section }),
              )}
            </div>
          </details>
        ) : null}

        {utilitySections.length ? (
          <details
            className="sidebar-nav-drawer"
            data-active={
              utilitySections.some(section => section.id === activeSection.id)
                ? 'true'
                : 'false'
            }
          >
            <summary>
              <span>{startLabel}</span>
              <strong>
                {utilitySections.some(section => section.id === activeSection.id)
                  ? activeSection.label
                  : utilitySections.map(section => section.label).join(' · ')}
              </strong>
            </summary>
            <div className="nav-section-links">
              {utilitySections.map(section =>
                renderSidebarSectionLink({ activeSection, section }),
              )}
            </div>
          </details>
        ) : null}

        {activeSection.items.length > 1 ? (
          <details
            className="sidebar-nav-drawer sidebar-nav-drawer-subtools"
            data-active="true"
          >
            <summary>
              <span>{activeSection.label}</span>
              <strong>{activeSection.label}</strong>
            </summary>
            <div className="nav-section-links">
              {activeSection.items
                .filter(
                  (item, index) =>
                    !(
                      index === 0 &&
                      item.href === activeSection.href &&
                      pathname === activeSection.href
                    ),
                )
                .map(item => {
                  const active = isSidebarNavItemActive(pathname, item.href);

                  return (
                    <div
                      className="nav-link-frame"
                      key={item.href}
                    >
                      <Link
                        aria-current={active ? 'page' : undefined}
                        className={`nav-link${active ? ' active' : ''}`}
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </div>
                  );
                })}
            </div>
          </details>
        ) : null}

        {supportGroups.length ? (
          <details className="sidebar-nav-drawer nav-section-utility">
            <summary>
              <span>{ownerLabel}</span>
              <strong>{ownerLabel}</strong>
            </summary>
            <div className="nav-section-links">
              {supportGroups.flatMap(group => group.items).map(item => {
                const active = isSidebarNavItemActive(pathname, item.href);

                return (
                  <div
                    className="nav-link-frame"
                    key={item.href}
                  >
                    <Link
                      aria-current={active ? 'page' : undefined}
                      className={`nav-link${active ? ' active' : ''}`}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              })}
            </div>
          </details>
        ) : null}
      </nav>
    </aside>
  );
}

function renderSidebarSectionLink({
  activeSection,
  compact = false,
  onIntent,
  primary = false,
  section,
}: {
  activeSection: SidebarSection;
  compact?: boolean;
  onIntent?: () => void;
  primary?: boolean;
  section: SidebarSection;
}): React.JSX.Element {
  const active = section.id === activeSection.id;

  return (
    <div className="nav-link-frame" key={section.href}>
      <Link
        aria-current={active ? 'page' : undefined}
        className={`nav-link${compact ? ' nav-link-compact' : ''}${
          primary ? ' nav-link-primary-predicta' : ''
        }${
          active ? ' active' : ''
        }`}
        href={section.href}
        onFocus={onIntent}
        onPointerEnter={onIntent}
        onTouchStart={onIntent}
      >
        {section.label}
      </Link>
    </div>
  );
}
