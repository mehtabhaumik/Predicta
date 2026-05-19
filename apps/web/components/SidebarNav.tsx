'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

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
  commonGroups,
  sectionLabel = 'Main Sections',
  activeSection,
  ownerLabel = 'Owner',
  privateSaveBody = 'Your Kundli stays safe here. Sign in to keep it with you on every device.',
  privateSaveTitle = 'SAVED SAFELY',
  sections,
  showAdmin,
  thisSectionLabel = 'This Section',
}: {
  adminLabel?: string;
  activeSection: SidebarSection;
  commonGroups: SidebarGroup[];
  ownerLabel?: string;
  privateSaveBody?: string;
  privateSaveTitle?: string;
  sectionLabel?: string;
  sections: SidebarSection[];
  showAdmin: boolean;
  thisSectionLabel?: string;
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
      <Link aria-label="Predicta home" className="dashboard-brand" href="/">
        <Image
          alt=""
          className="dashboard-logo"
          height={74}
          priority
          src="/predicta-logo.png"
          width={74}
        />
        <span>
          <strong>PREDICTA</strong>
          <small>Holistic astrology guide</small>
        </span>
      </Link>
      <nav aria-label="Dashboard navigation" className="nav-list">
        <div className="nav-section">
          <span className="nav-section-title">{sectionLabel}</span>
          <div className="nav-section-links nav-section-switcher">
            {sections.map(section => {
              const active = section.id === activeSection.id;
              const exactPage = pathname === section.href;

              return (
                <motion.div
                  key={section.id}
                  whileHover={reduceMotion || exactPage ? undefined : { x: 3 }}
                >
                  {exactPage ? (
                    <span
                      aria-current="page"
                      aria-disabled="true"
                      className="nav-link nav-section-link active disabled"
                    >
                      {section.label}
                    </span>
                  ) : (
                    <Link
                      aria-current={active ? 'true' : undefined}
                      className={`nav-link nav-section-link${active ? ' active' : ''}`}
                      href={section.href}
                    >
                      {section.label}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="nav-section">
          <span className="nav-section-title">{thisSectionLabel}</span>
          <div className="nav-section-links">
            {activeSection.items.map(item => {
              const active = isSidebarNavItemActive(pathname, item.href);

              return (
                <motion.div
                  key={item.href}
                  whileHover={reduceMotion ? undefined : { x: 3 }}
                >
                  {active ? (
                    <span
                      aria-current="page"
                      aria-disabled="true"
                      className="nav-link active disabled"
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link className="nav-link" href={item.href}>
                      {item.label}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {supportGroups.map(group => (
          <div className="nav-section" key={group.label}>
            <span className="nav-section-title">{group.label}</span>
            <div className="nav-section-links">
              {group.items.map(item => {
                const active = isSidebarNavItemActive(pathname, item.href);

                return (
                  <motion.div
                    key={item.href}
                    whileHover={reduceMotion ? undefined : { x: 3 }}
                  >
                    {active ? (
                      <span
                        aria-current="page"
                        aria-disabled="true"
                        className="nav-link active disabled"
                      >
                        {item.label}
                      </span>
                    ) : (
                      <Link className="nav-link" href={item.href}>
                        {item.label}
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="sidebar-note glass-panel">
        <span className="section-title">{privateSaveTitle}</span>
        <p>{privateSaveBody}</p>
      </div>
    </aside>
  );
}
