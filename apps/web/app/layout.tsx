import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ClientServicesProvider } from '../components/ClientServicesProvider';

export const metadata: Metadata = {
  description: 'Predicta premium Vedic astrology guidance.',
  title: 'Predicta',
};

export const viewport: Viewport = {
  initialScale: 1,
  viewportFit: 'cover',
  width: 'device-width',
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
