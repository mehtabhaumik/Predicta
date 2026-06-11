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
  ownerLabel?: string;
  showAdmin: boolean;
  startLabel?: string;
  worldsLabel?: string;
}): React.JSX.Element {
  const pathname = usePathname();
  const primarySections = allSections.filter(section =>
    PRIMARY_SECTION_IDS.has(section.id),
  );
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
      <nav aria-label="Dashboard navigation" className="nav-list">
        <div className="nav-section">
          <span className="nav-section-title">{startLabel}</span>
          <div className="nav-section-links">
            {primarySections.map(section =>
              renderSidebarSectionLink({ activeSection, section }),
            )}
          </div>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">{worldsLabel}</span>
          <div className="nav-section-links nav-section-links--compact">
            {worldSections.map(section =>
              renderSidebarSectionLink({ activeSection, compact: true, section }),
            )}
          </div>
        </div>

        {activeSection.items.length > 1 ? (
          <div className="nav-section">
            <span className="nav-section-title">{activeSection.label}</span>
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
          </div>
        ) : null}

        {supportGroups.length ? (
          <div className="nav-section nav-section-utility">
            <span className="nav-section-title">{ownerLabel}</span>
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
          </div>
        ) : null}
      </nav>
    </aside>
  );
}

function renderSidebarSectionLink({
  activeSection,
  compact = false,
  section,
}: {
  activeSection: SidebarSection;
  compact?: boolean;
  section: SidebarSection;
}): React.JSX.Element {
  const active = section.id === activeSection.id;

  return (
    <div className="nav-link-frame" key={section.href}>
      <Link
        aria-current={active ? 'page' : undefined}
        className={`nav-link${compact ? ' nav-link-compact' : ''}${
          active ? ' active' : ''
        }`}
        href={section.href}
      >
        {section.label}
      </Link>
    </div>
  );
}
