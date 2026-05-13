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

export function SidebarNav({
  groups,
  showAdmin,
}: {
  groups: SidebarGroup[];
  showAdmin: boolean;
}): React.JSX.Element {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const navGroups = showAdmin
    ? [
        ...groups,
        {
          label: 'Owner',
          items: [{ href: '/dashboard/admin', label: 'Admin' }],
        },
      ]
    : groups;

  return (
    <aside className="sidebar">
      <Link aria-label="Predicta dashboard" className="dashboard-brand" href="/">
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
                const active =
                  item.href === '/dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                return (
                  <motion.div
                    key={item.href}
                    whileHover={reduceMotion ? undefined : { x: 3 }}
                  >
                    <Link
                      aria-current={active ? 'page' : undefined}
                      className={`nav-link ${active ? 'active' : ''}`}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="sidebar-note glass-panel">
        <span className="section-title">PRIVATE SAVE</span>
        <p>This browser remembers your chart. Sign in to keep it across devices.</p>
      </div>
    </aside>
  );
}
