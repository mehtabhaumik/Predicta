'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { PredictaMediaAsset } from './ui/DesignSystemPrimitives';

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
  worldsLabel?: string;
}): React.JSX.Element {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
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
        <PredictaMediaAsset
          alt=""
          className="dashboard-logo"
          height={74}
          kind="logo"
          priority
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
          <span className="nav-section-title">{worldsLabel}</span>
          <div className="nav-section-links">
            {allSections.map(section => {
              const active = section.id === activeSection.id;

              return (
                <motion.div
                  key={section.href}
                  whileHover={reduceMotion ? undefined : { x: 3 }}
                >
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`nav-link${active ? ' active' : ''}`}
                    href={section.href}
                  >
                    {section.label}
                  </Link>
                </motion.div>
              );
            })}
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
                    <motion.div
                      key={item.href}
                      whileHover={reduceMotion ? undefined : { x: 3 }}
                    >
                      <Link
                        aria-current={active ? 'page' : undefined}
                        className={`nav-link${active ? ' active' : ''}`}
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
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
                  <motion.div
                    key={item.href}
                    whileHover={reduceMotion ? undefined : { x: 3 }}
                  >
                    <Link
                      aria-current={active ? 'page' : undefined}
                      className={`nav-link${active ? ' active' : ''}`}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
