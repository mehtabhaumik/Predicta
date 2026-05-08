import Link from 'next/link';
import { FinalCTASection } from '../components/FinalCTASection';
import { HeroSection } from '../components/HeroSection';
import { LandingIntroOverlay } from '../components/LandingIntroOverlay';
import { PremiumSectionWrapper } from '../components/PremiumSectionWrapper';
import { PricingTeaser } from '../components/PricingTeaser';
import { WebFooter } from '../components/WebFooter';
import { WebHeader } from '../components/WebHeader';

const capabilities = [
  {
    body: 'Create Kundlis and choose when to save online.',
    title: 'Kundli creation',
  },
  {
    body: 'Move from D1 to D9, D10, dasha, yogas, and insight.',
    title: 'Chart interpretation',
  },
  {
    body: 'Ask from a chart, report, or saved profile.',
    title: 'Predicta chat',
  },
  {
    body: 'Create polished free previews and deeper premium reports.',
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
  return (
    <>
      <LandingIntroOverlay />
      <WebHeader />
      <main className="landing-main">
        <HeroSection />

        <PremiumSectionWrapper
          eyebrow="WHAT PREDICTA DOES"
          intro="Create, read, save, and discuss a Kundli without dashboard noise."
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
                Predicta reads dasha, placements, chart sections, and follow-up
                context without turning the reading into jargon.
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
          intro="Reports should feel personal, polished, and easy to read."
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
                Summaries, predictions, and guidance stay polished in both short
                and deeper reports.
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
      <WebFooter />
    </>
  );
}
