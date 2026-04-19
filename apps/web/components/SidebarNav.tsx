'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const allItems = showAdmin
    ? [...items, { href: '/dashboard/admin', label: 'Admin' }]
    : items;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
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
            <small>Vedic intelligence</small>
          </span>
        </Link>
        <button
          aria-controls="dashboard-navigation"
          aria-expanded={menuOpen}
          aria-label="Toggle dashboard navigation"
          className={`mobile-nav-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(open => !open)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <nav
        aria-label="Dashboard navigation"
        className={`nav-list dashboard-nav-list ${menuOpen ? 'open' : ''}`}
        id="dashboard-navigation"
      >
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
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>
      <div className="sidebar-note glass-panel">
        <span className="section-title">CLOUD SAVE</span>
        <p>Save online only when you choose. Your saved work stays in your control.</p>
      </div>
    </aside>
  );
}
