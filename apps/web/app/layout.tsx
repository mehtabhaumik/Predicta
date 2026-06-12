import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ClientServicesProvider } from '../components/ClientServicesProvider';

const LANGUAGE_BOOTSTRAP_SCRIPT = `
try {
  var value = window.localStorage.getItem('pridicta.languagePreference.v1');
  var parsed = value ? JSON.parse(value) : null;
  var rawLanguage = typeof parsed === 'string'
    ? parsed
    : parsed && (parsed.appLanguage || parsed.language);
  var language = rawLanguage === 'hi' || rawLanguage === 'gu' ? rawLanguage : 'en';
  document.documentElement.lang = language;
  document.documentElement.dir = 'ltr';
  document.documentElement.dataset.predictaLanguage = language;
} catch (error) {
  document.documentElement.lang = 'en';
  document.documentElement.dir = 'ltr';
  document.documentElement.dataset.predictaLanguage = 'en';
}
`;

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{ __html: LANGUAGE_BOOTSTRAP_SCRIPT }}
        />
        <ClientServicesProvider />
        <div className="page-shell">
          <div className="content-layer">{children}</div>
        </div>
      </body>
    </html>
  );
}
