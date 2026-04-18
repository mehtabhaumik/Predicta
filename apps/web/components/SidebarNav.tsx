'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

export type SidebarItem = {
  href: string;
  label: string;
};

export function SidebarNav({
  items,
  showAdmin,
}: {
  items: SidebarItem[];
  showAdmin: boolean;
}): React.JSX.Element {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const allItems = showAdmin
    ? [...items, { href: '/dashboard/admin', label: 'Admin' }]
    : items;

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
          <small>Web intelligence</small>
        </span>
      </Link>
      <nav aria-label="Dashboard navigation" className="nav-list">
        {allItems.map(item => {
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
      </nav>
      <div className="sidebar-note glass-panel">
        <span className="section-title">CLOUD SAVE</span>
        <p>Save online only when you choose. Local work stays private.</p>
      </div>
    </aside>
  );
}
