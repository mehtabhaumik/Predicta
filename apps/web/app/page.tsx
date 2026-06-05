'use client';

import { getCompetitorResponseCopy } from '@pridicta/config';
import Link from 'next/link';
import { FinalCTASection } from '../components/FinalCTASection';
import { HeroSection } from '../components/HeroSection';
import { PremiumSectionWrapper } from '../components/PremiumSectionWrapper';
import { PricingTeaser } from '../components/PricingTeaser';
import { TestimonialTrustLoop } from '../components/TestimonialTrustLoop';
import { WebGrowthAdvantage } from '../components/WebGrowthAdvantage';
import { WebFooter } from '../components/WebFooter';
import { WebHeader } from '../components/WebHeader';
import { useLanguagePreference } from '../lib/language-preference';

export default function LandingPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = getCompetitorResponseCopy(language).landing;

  return (
    <>
      <WebHeader />
      <main className="landing-main">
        <HeroSection />

        <PremiumSectionWrapper
          eyebrow={copy.capabilityEyebrow}
          intro={copy.capabilityIntro}
          title={copy.capabilityTitle}
          variant="wide"
        >
          <div className="capability-grid">
            {copy.capabilities.map(item => (
              <article className="soft-panel" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </PremiumSectionWrapper>

        <PremiumSectionWrapper
          eyebrow={copy.intelligenceEyebrow}
          id="intelligence"
          intro={copy.intelligenceIntro}
          title={copy.intelligenceTitle}
          variant="split"
        >
          <div className="intelligence-panel glass-panel">
            <div>
              <h3>{copy.intelligencePanelTitle}</h3>
              <p>{copy.intelligencePanelBody}</p>
            </div>
            <ul>
              {copy.intelligenceItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </PremiumSectionWrapper>

        <PremiumSectionWrapper
          eyebrow={copy.reportsEyebrow}
          id="reports"
          intro={copy.reportsIntro}
          title={copy.reportsTitle}
          variant="wide"
        >
          <div className="report-preview">
            <div className="report-cover glass-panel">
              <span>PREDICTA DOSSIER</span>
              <h3>{copy.reportCoverTitle}</h3>
              <p>{copy.reportCoverBody}</p>
            </div>
            <div className="report-copy">
              <h3>{copy.reportCopyTitle}</h3>
              <p>{copy.reportCopyBody}</p>
              <Link className="button secondary" href="/dashboard/report">
                {copy.previewReport}
              </Link>
            </div>
          </div>
        </PremiumSectionWrapper>

        <TestimonialTrustLoop />

        <WebGrowthAdvantage />

        <PremiumSectionWrapper
          eyebrow={copy.plansEyebrow}
          intro={copy.plansIntro}
          title={copy.plansTitle}
        >
          <PricingTeaser />
        </PremiumSectionWrapper>

        <FinalCTASection />
      </main>
      <WebFooter />
    </>
  );
}
