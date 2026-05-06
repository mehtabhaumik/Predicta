import Image from 'next/image';
import Link from 'next/link';
import { AuthDialog } from './AuthDialog';

export function WebHeader(): React.JSX.Element {
  return (
    <header className="web-header">
      <Link aria-label="Pridicta home" className="brand-lockup" href="/">
        <Image
          alt=""
          className="brand-logo"
          height={72}
          priority
          src="/predicta-logo.png"
          width={72}
        />
        <span>
          <strong>PRIDICTA</strong>
          <small>Vedic intelligence</small>
        </span>
      </Link>
      <nav aria-label="Primary navigation" className="header-nav">
        <Link href="#intelligence">Intelligence</Link>
        <Link href="#reports">Reports</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/legal">Legal</Link>
      </nav>
      <div className="header-actions">
        <AuthDialog />
        <Link className="button secondary header-cta" href="/dashboard">
          Open Dashboard
        </Link>
      </div>
    </header>
  );
}
