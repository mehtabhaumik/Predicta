import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ClientServicesProvider } from '../components/ClientServicesProvider';
import { RuntimeMetadataSync } from '../components/RuntimeMetadataSync';

export const metadata: Metadata = {
  applicationName: 'Predicta',
  authors: [{ name: 'Bhaumik Mehta' }],
  category: 'Vedic astrology',
  creator: 'Bhaumik Mehta',
  description:
    'Predicta is a premium Vedic astrology intelligence system for kundli creation, chart-aware guidance, saved readings, and polished astrology reports.',
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    apple: [{ sizes: '180x180', url: '/apple-touch-icon.png' }],
    icon: [
      { type: 'image/svg+xml', url: '/favicon.svg' },
      { sizes: '192x192', type: 'image/png', url: '/icon-192.png' },
      { sizes: '512x512', type: 'image/png', url: '/icon-512.png' },
    ],
    shortcut: ['/favicon.svg'],
  },
  keywords: [
    'Predicta',
    'Vedic astrology app',
    'kundli',
    'kundli report',
    'birth chart',
    'Vimshottari dasha',
    'Navamsha',
    'Dashamsha',
    'AI astrology guidance',
    'premium astrology report',
  ],
  openGraph: {
    description:
      'Create a kundli, explore Vedic chart patterns, ask chart-aware questions, and generate polished astrology reports with Predicta.',
    locale: 'en_IN',
    siteName: 'Predicta',
    title: 'Predicta',
    type: 'website',
  },
  publisher: 'Bhaumik Mehta',
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    index: true,
  },
  title: {
    default: 'Predicta',
    template: '%s | Predicta',
  },
  twitter: {
    card: 'summary_large_image',
    description:
      'Premium Vedic astrology intelligence for kundli creation, chart-aware guidance, and polished reports.',
    title: 'Predicta',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <ClientServicesProvider />
        <RuntimeMetadataSync />
        <div className="beta-release-strip" role="status" aria-live="polite">
          Beta release for public testing. This is not the full application yet.
        </div>
        <div className="page-shell">
          <div className="content-layer">{children}</div>
        </div>
      </body>
    </html>
  );
}
