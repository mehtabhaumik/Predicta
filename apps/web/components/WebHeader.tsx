import Image from 'next/image';
import Link from 'next/link';
import { AuthDialog } from './AuthDialog';

const primaryLinks = [
  { href: '/#intelligence', label: 'Intelligence' },
  { href: '/#reports', label: 'Reports' },
  { href: '/safety', label: 'Safety' },
  { href: '/founder', label: 'Founder' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/legal', label: 'Legal' },
];

export function WebHeader(): React.JSX.Element {
  return (
    <header className="web-header">
      <Link aria-label="Predicta home" className="brand-lockup" href="/">
        <Image
          alt=""
          className="brand-logo"
          height={72}
          priority
          src="/predicta-logo.png"
          width={72}
        />
        <span>
          <strong>PREDICTA</strong>
          <small>Holistic astrology</small>
        </span>
      </Link>
      <nav aria-label="Primary navigation" className="header-nav">
        {primaryLinks.map(link => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <AuthDialog />
        <Link className="button secondary header-cta" href="/dashboard">
          Open Dashboard
        </Link>
      </div>
      <details className="mobile-menu">
        <summary aria-label="Open navigation menu">
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </summary>
        <div className="mobile-menu-panel">
          <nav aria-label="Mobile navigation">
            {primaryLinks.map(link => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mobile-menu-actions">
            <AuthDialog />
            <Link className="button secondary" href="/dashboard">
              Open Dashboard
            </Link>
          </div>
        </div>
      </details>
    </header>
  );
}
