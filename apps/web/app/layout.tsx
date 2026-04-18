import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ClientServicesProvider } from '../components/ClientServicesProvider';

const siteUrl = 'https://predicta.rudraix.com';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
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
  metadataBase: new URL(siteUrl),
  openGraph: {
    description:
      'Create a kundli, explore Vedic chart patterns, ask chart-aware questions, and generate polished astrology reports with Predicta.',
    images: [
      {
        alt: 'Predicta premium Vedic astrology dashboard',
        height: 1024,
        url: '/predicta-logo.png',
        width: 1024,
      },
    ],
    locale: 'en_IN',
    siteName: 'Predicta',
    title: 'Predicta',
    type: 'website',
    url: siteUrl,
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
    images: ['/predicta-logo.png'],
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
        <div className="page-shell">
          <div className="content-layer">{children}</div>
        </div>
      </body>
    </html>
  );
}
