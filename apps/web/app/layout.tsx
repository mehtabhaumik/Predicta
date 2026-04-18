import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ClientServicesProvider } from '../components/ClientServicesProvider';

export const metadata: Metadata = {
  description: 'Pridicta premium Vedic astrology intelligence dashboard.',
  title: 'Pridicta',
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
