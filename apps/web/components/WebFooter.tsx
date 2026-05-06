import Link from 'next/link';

const footerSections = [
  {
    heading: 'Start',
    links: [
      { href: '/dashboard/kundli', label: 'Create Kundli' },
      { href: '/dashboard/charts', label: 'View Charts' },
      { href: '/dashboard/chat', label: 'Ask with Proof' },
      { href: '/dashboard/saved-kundlis', label: 'Family Vault' },
    ],
  },
  {
    heading: 'Premium',
    links: [
      { href: '/pricing', label: 'Plans and Passes' },
      { href: '/dashboard/timeline', label: 'Life Calendar' },
      { href: '/dashboard/report', label: 'PDF Reports' },
      { href: '/dashboard/relationship', label: 'Compatibility' },
    ],
  },
  {
    heading: 'Trust',
    links: [
      { href: '/legal#privacy', label: 'Privacy Policy' },
      { href: '/legal#terms', label: 'Terms of Use' },
      { href: '/legal#refund', label: 'Refund Policy' },
      { href: '/legal#disclaimer', label: 'Disclaimer' },
      { href: '/legal#age-guidance', label: 'Age Guidance' },
    ],
  },
];

export function WebFooter({
  className = '',
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <footer className={`web-footer ${className}`.trim()}>
      <div className="web-footer-inner">
        <div className="web-footer-brand">
          <Link aria-label="Pridicta home" className="web-footer-logo" href="/">
            PRIDICTA
          </Link>
          <p className="web-footer-tagline">
            Create your Kundli. Understand your life. Ask better questions. Get
            beautiful reports.
          </p>
          <p className="web-footer-trust">
            Vedic astrology guidance with chart proof, saved Kundlis, privacy
            controls, and clear safety boundaries.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="web-footer-grid">
          {footerSections.map(section => (
            <div className="web-footer-column" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.links.map(link => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="web-footer-bottom">
        <span>© 2026 Pridicta. All rights reserved.</span>
        <span>
          For reflection and self-understanding only. Not medical, legal,
          financial, emergency, or guaranteed prediction advice.
        </span>
      </div>
    </footer>
  );
}
