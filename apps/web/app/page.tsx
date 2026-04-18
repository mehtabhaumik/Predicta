import Link from 'next/link';
import type { Metadata } from 'next';
import { FinalCTASection } from '../components/FinalCTASection';
import { HeroSection } from '../components/HeroSection';
import { LandingIntroOverlay } from '../components/LandingIntroOverlay';
import { PremiumSectionWrapper } from '../components/PremiumSectionWrapper';
import { PricingTeaser } from '../components/PricingTeaser';
import { WebHeader } from '../components/WebHeader';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  description:
    'Predicta helps you create a kundli, understand Vedic chart patterns, ask chart-aware questions, and download polished astrology reports.',
  openGraph: {
    description:
      'A premium Vedic astrology workspace for kundli creation, chart-aware guidance, saved readings, and polished reports.',
    title: 'Predicta',
    url: '/',
  },
  title: 'Predicta',
};

const capabilities = [
  {
    body: 'Resolve birth details, create kundlis, and keep local/cloud records aligned without forcing cloud upload.',
    title: 'Kundli creation',
  },
  {
    body: 'Move from D1 into D9, D10, dasha, yogas, and divisional insights without overwhelm.',
    title: 'Chart interpretation',
  },
  {
    body: 'Ask from a chart, report, or saved profile and keep the conversation grounded in your reading.',
    title: 'Predicta chat',
  },
  {
    body: 'Generate premium-looking reports where free and paid users both receive a polished experience.',
    title: 'Report depth',
  },
];

const intelligence = [
  'Divisional chart awareness',
  'Vimshottari dasha timing',
  'Yoga and Ashtakavarga summaries',
  'Calm Predicta guidance',
];

export default function LandingPage(): React.JSX.Element {
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': 'https://predicta.rudraix.com/#organization',
        '@type': 'Organization',
        founder: {
          '@type': 'Person',
          name: 'Bhaumik Mehta',
        },
        logo: 'https://predicta.rudraix.com/predicta-logo.png',
        name: 'Predicta',
        url: 'https://predicta.rudraix.com',
      },
      {
        '@id': 'https://predicta.rudraix.com/#website',
        '@type': 'WebSite',
        description:
          'Premium Vedic astrology intelligence for kundli creation, chart-aware guidance, and polished astrology reports.',
        inLanguage: 'en-IN',
        name: 'Predicta',
        publisher: {
          '@id': 'https://predicta.rudraix.com/#organization',
        },
        url: 'https://predicta.rudraix.com',
      },
      {
        '@id': 'https://predicta.rudraix.com/#software',
        '@type': 'SoftwareApplication',
        applicationCategory: 'LifestyleApplication',
        description:
          'Create a kundli, explore Vedic chart patterns, ask chart-aware questions, and generate polished astrology reports.',
        name: 'Predicta',
        operatingSystem: 'Web, iOS, Android',
        url: 'https://predicta.rudraix.com',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <LandingIntroOverlay />
      <WebHeader />
      <main className="landing-main">
        <HeroSection />

        <PremiumSectionWrapper
          eyebrow="WHAT PREDICTA DOES"
          intro="A calm product flow for creating, reading, saving, and discussing a kundli without turning the experience into a technical dashboard."
          title="A complete astrology experience with room to breathe."
          variant="wide"
        >
          <div className="capability-grid">
            {capabilities.map(item => (
              <article className="soft-panel" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </PremiumSectionWrapper>

        <PremiumSectionWrapper
          eyebrow="CORE INTELLIGENCE"
          id="intelligence"
          intro="Predicta keeps advanced Vedic depth available while explaining only what helps."
          title="Depth without noise."
          variant="split"
        >
          <div className="intelligence-panel glass-panel">
            <div>
              <h3>Professional chart awareness, presented clearly.</h3>
              <p>
                Predicta understands current dasha, key placements, chart
                sections, and follow-up questions without turning the reading
                into jargon.
              </p>
            </div>
            <ul>
              {intelligence.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </PremiumSectionWrapper>

        <PremiumSectionWrapper
          eyebrow="PREMIUM REPORTS"
          id="reports"
          intro="The report experience should feel like a personal dossier, not a plain export."
          title="Share-worthy reports, even in free mode."
          variant="wide"
        >
          <div className="report-preview">
            <div className="report-cover glass-panel">
              <span>PREDICTA DOSSIER</span>
              <h3>Birth Details · D1 · D9 · D10 · Dasha · Guidance</h3>
              <p>
                Free and Premium reports share the same visual quality. Premium
                adds depth, not dignity.
              </p>
            </div>
            <div className="report-copy">
              <h3>Designed to feel personal and calm.</h3>
              <p>
                Watermark, footer, chart summaries, predictions, and guidance
                stay polished whether you read a short report or a deeper
                personal dossier.
              </p>
              <Link className="button secondary" href="/dashboard/report">
                Preview Report
              </Link>
            </div>
          </div>
        </PremiumSectionWrapper>

        <PremiumSectionWrapper
          eyebrow="PLANS"
          intro="Start free, try a Day Pass, or move into Premium when deeper report and guidance limits matter."
          title="Premium access without pressure."
        >
          <PricingTeaser />
        </PremiumSectionWrapper>

        <FinalCTASection />
      </main>
    </>
  );
}
