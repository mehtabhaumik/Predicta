import type { Metadata } from 'next';
import { FounderPageClient } from './FounderPageClient';

export const metadata: Metadata = {
  alternates: {
    canonical: '/founder',
  },
  description:
    'Read Bhaumik Mehta’s founder vision for Predicta, a calm, safe, premium Vedic intelligence experience.',
  openGraph: {
    description:
      'Predicta is built to make Vedic astrology precise, private, calm, safe, and useful for modern life.',
    title: 'Founder Vision | Predicta',
    url: '/founder',
  },
  title: 'Founder Vision',
  twitter: {
    card: 'summary_large_image',
    description:
      'The founder vision behind Predicta, a premium Vedic astrology companion.',
    title: 'Founder Vision | Predicta',
  },
};

export default function FounderPage(): React.JSX.Element {
  return <FounderPageClient />;
}
