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
  groups,
  adminLabel = 'Admin',
  ownerLabel = 'Owner',
  privateSaveBody = 'This browser remembers your chart. Sign in to keep it across devices.',
  privateSaveTitle = 'PRIVATE SAVE',
  showAdmin,
}: {
  adminLabel?: string;
  groups: SidebarGroup[];
  ownerLabel?: string;
  privateSaveBody?: string;
  privateSaveTitle?: string;
  showAdmin: boolean;
}): React.JSX.Element {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const navGroups = showAdmin
    ? [
        ...groups,
        {
          label: ownerLabel,
          items: [{ href: '/dashboard/admin', label: adminLabel }],
        },
      ]
    : groups;

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
        {navGroups.map(group => (
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
