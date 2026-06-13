import type { Metadata } from 'next';
import { AccuracyMethodPageLoader } from './AccuracyMethodPageLoader';

export const metadata: Metadata = {
  alternates: {
    canonical: '/accuracy-method',
  },
  description:
    'Learn how Predicta calculates Kundlis, keeps Parashari, KP, and Jaimini separate, and explains the boundaries of Vedic astrology guidance.',
  openGraph: {
    description:
      'Predicta explains its chart method, astrology schools, free and premium depth, and accuracy boundaries.',
    title: 'Accuracy & Method | Predicta',
    url: '/accuracy-method',
  },
  title: 'Accuracy & Method',
  twitter: {
    card: 'summary_large_image',
    description:
      'The transparent Jyotish method behind Predicta readings.',
    title: 'Accuracy & Method | Predicta',
  },
};

export default function AccuracyMethodPage(): React.JSX.Element {
  return <AccuracyMethodPageLoader />;
}
