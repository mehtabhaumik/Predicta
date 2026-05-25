'use client';

import { getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { FinalCTASection } from '../components/FinalCTASection';
import { HeroSection } from '../components/HeroSection';
import { LandingIntroOverlay } from '../components/LandingIntroOverlay';
import { PremiumSectionWrapper } from '../components/PremiumSectionWrapper';
import { PricingTeaser } from '../components/PricingTeaser';
import { TestimonialTrustLoop } from '../components/TestimonialTrustLoop';
import { WebGrowthAdvantage } from '../components/WebGrowthAdvantage';
import { WebFooter } from '../components/WebFooter';
import { WebHeader } from '../components/WebHeader';
import { useLanguagePreference } from '../lib/language-preference';

export default function LandingPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = landingCopy[language] ?? landingCopy.en;

  return (
    <>
      <LandingIntroOverlay />
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

const landingCopy: Record<
  SupportedLanguage,
  {
    capabilities: Array<{ body: string; title: string }>;
    capabilityEyebrow: string;
    capabilityIntro: string;
    capabilityTitle: string;
    intelligenceEyebrow: string;
    intelligenceIntro: string;
    intelligenceItems: string[];
    intelligencePanelBody: string;
    intelligencePanelTitle: string;
    intelligenceTitle: string;
    plansEyebrow: string;
    plansIntro: string;
    plansTitle: string;
    previewReport: string;
    reportCopyBody: string;
    reportCopyTitle: string;
    reportCoverBody: string;
    reportCoverTitle: string;
    reportsEyebrow: string;
    reportsIntro: string;
    reportsTitle: string;
  }
> = {
  en: {
    capabilities: [
      {
        body: 'Create Kundlis and keep the reading anchored to real chart proof.',
        title: 'Kundli creation',
      },
      {
        body: 'Move from D1 to D9, D10, dasha, yogas, karma, and remedies.',
        title: 'Holistic interpretation',
      },
      {
        body: 'Ask from a chart, report, or saved profile.',
        title: 'Predicta chat',
      },
      {
        body: 'Create polished free previews and deeper premium reports.',
        title: 'Report depth',
      },
    ],
    capabilityEyebrow: 'What Predicta does',
    capabilityIntro: 'Create, read, save, and discuss a Kundli through a holistic astrology lens.',
    capabilityTitle: 'A complete astrology experience with room to breathe.',
    intelligenceEyebrow: 'Core intelligence',
    intelligenceIntro: 'Predicta keeps advanced Vedic depth available while explaining only what helps.',
    intelligenceItems: [
      'Holistic astrology synthesis',
      'Divisional chart awareness',
      'Vimshottari dasha timing',
      'Karma-based remedy paths',
      'Yoga and Ashtakavarga summaries',
    ],
    intelligencePanelBody:
      'Predicta reads dasha, placements, chart areas, Panchang, Purushartha, and remedy context without making the reading heavy.',
    intelligencePanelTitle: 'Professional chart awareness, presented clearly.',
    intelligenceTitle: 'Depth without noise.',
    plansEyebrow: 'Plans',
    plansIntro: 'Start free, try a Day Pass, or move into Premium when deeper report and guidance limits matter.',
    plansTitle: 'Premium access without pressure.',
    previewReport: 'Preview Report',
    reportCopyBody:
      'Summaries, predictions, and guidance stay polished in both short and deeper reports.',
    reportCopyTitle: 'Designed to feel personal and calm.',
    reportCoverBody:
      'Free and Premium reports share the same visual quality. Premium adds depth, not dignity.',
    reportCoverTitle: 'Birth Details · D1 · D9 · D10 · Dasha · Guidance',
    reportsEyebrow: 'Premium reports',
    reportsIntro: 'Reports should feel personal, polished, and easy to read.',
    reportsTitle: 'Share-worthy reports, even in free mode.',
  },
  hi: {
    capabilities: [
      {
        body: getNativeCopy("native.apps.web.app.page.tsx.402cfef8ae"),
        title: getNativeCopy("native.apps.web.app.page.tsx.d0737a9b84"),
      },
      {
        body: getNativeCopy("native.apps.web.app.page.tsx.282e09decf"),
        title: getNativeCopy("native.apps.web.app.page.tsx.fc55144501"),
      },
      {
        body: getNativeCopy("native.apps.web.app.page.tsx.81919652bb"),
        title: getNativeCopy("native.apps.web.app.page.tsx.e367373d6b"),
      },
      {
        body: getNativeCopy("native.apps.web.app.page.tsx.2ed9cda2b7"),
        title: getNativeCopy("native.apps.web.app.page.tsx.c06f26c65c"),
      },
    ],
    capabilityEyebrow: getNativeCopy("native.apps.web.app.page.tsx.dc979135a0"),
    capabilityIntro: getNativeCopy("native.apps.web.app.page.tsx.c86d8cc88e"),
    capabilityTitle: getNativeCopy("native.apps.web.app.page.tsx.d6d8134bbd"),
    intelligenceEyebrow: getNativeCopy("native.apps.web.app.page.tsx.5428553cfe"),
    intelligenceIntro: getNativeCopy("native.apps.web.app.page.tsx.3448da2c95"),
    intelligenceItems: [
      getNativeCopy("native.apps.web.app.page.tsx.a69ca54340"),
      getNativeCopy("native.apps.web.app.page.tsx.aa30fa84ad"),
      getNativeCopy("native.apps.web.app.page.tsx.a0406f4277"),
      getNativeCopy("native.apps.web.app.page.tsx.05fe022be0"),
      getNativeCopy("native.apps.web.app.page.tsx.fc646dedde"),
    ],
    intelligencePanelBody:
      getNativeCopy("native.apps.web.app.page.tsx.8dd6e6c176"),
    intelligencePanelTitle: getNativeCopy("native.apps.web.app.page.tsx.f3d984a4f4"),
    intelligenceTitle: getNativeCopy("native.apps.web.app.page.tsx.f9c59f8675"),
    plansEyebrow: getNativeCopy("native.apps.web.app.page.tsx.4d953f86da"),
    plansIntro: getNativeCopy("native.apps.web.app.page.tsx.e632faac5e"),
    plansTitle: getNativeCopy("native.apps.web.app.page.tsx.08d628cd34"),
    previewReport: getNativeCopy("native.apps.web.app.page.tsx.30cd3ddf6a"),
    reportCopyBody:
      getNativeCopy("native.apps.web.app.page.tsx.56b8ecc7a1"),
    reportCopyTitle: getNativeCopy("native.apps.web.app.page.tsx.3cf14d75ed"),
    reportCoverBody:
      getNativeCopy("native.apps.web.app.page.tsx.1e16d79079"),
    reportCoverTitle: getNativeCopy("native.apps.web.app.page.tsx.7ab68766d6"),
    reportsEyebrow: getNativeCopy("native.apps.web.app.page.tsx.5d2cb4ee10"),
    reportsIntro: getNativeCopy("native.apps.web.app.page.tsx.eca334685e"),
    reportsTitle: getNativeCopy("native.apps.web.app.page.tsx.196f191c8a"),
  },
  gu: {
    capabilities: [
      {
        body: getNativeCopy("native.apps.web.app.page.tsx.156ff312cd"),
        title: getNativeCopy("native.apps.web.app.page.tsx.7a9b4ec6e8"),
      },
      {
        body: getNativeCopy("native.apps.web.app.page.tsx.a7205b6332"),
        title: getNativeCopy("native.apps.web.app.page.tsx.e2d6c03c82"),
      },
      {
        body: getNativeCopy("native.apps.web.app.page.tsx.e30cbfcbe0"),
        title: getNativeCopy("native.apps.web.app.page.tsx.7f08bdcc0a"),
      },
      {
        body: getNativeCopy("native.apps.web.app.page.tsx.ffee6d4d14"),
        title: getNativeCopy("native.apps.web.app.page.tsx.3ab1447317"),
      },
    ],
    capabilityEyebrow: getNativeCopy("native.apps.web.app.page.tsx.136ebf6447"),
    capabilityIntro: getNativeCopy("native.apps.web.app.page.tsx.a10ce761c0"),
    capabilityTitle: getNativeCopy("native.apps.web.app.page.tsx.77cc291b9f"),
    intelligenceEyebrow: getNativeCopy("native.apps.web.app.page.tsx.249f9ad09c"),
    intelligenceIntro: getNativeCopy("native.apps.web.app.page.tsx.286f77ca14"),
    intelligenceItems: [
      getNativeCopy("native.apps.web.app.page.tsx.2b62493b5c"),
      getNativeCopy("native.apps.web.app.page.tsx.2b0d750f5e"),
      getNativeCopy("native.apps.web.app.page.tsx.588fe43013"),
      getNativeCopy("native.apps.web.app.page.tsx.3d3b75e4e3"),
      getNativeCopy("native.apps.web.app.page.tsx.111c24c45d"),
    ],
    intelligencePanelBody:
      getNativeCopy("native.apps.web.app.page.tsx.150f21eb02"),
    intelligencePanelTitle: getNativeCopy("native.apps.web.app.page.tsx.4c98a93d0b"),
    intelligenceTitle: getNativeCopy("native.apps.web.app.page.tsx.aa4713d072"),
    plansEyebrow: getNativeCopy("native.apps.web.app.page.tsx.dafbabd3e7"),
    plansIntro: getNativeCopy("native.apps.web.app.page.tsx.4fc8b1fc06"),
    plansTitle: getNativeCopy("native.apps.web.app.page.tsx.55894819f4"),
    previewReport: getNativeCopy("native.apps.web.app.page.tsx.3227033f83"),
    reportCopyBody:
      getNativeCopy("native.apps.web.app.page.tsx.56f1e15eaa"),
    reportCopyTitle: getNativeCopy("native.apps.web.app.page.tsx.8517230b23"),
    reportCoverBody:
      getNativeCopy("native.apps.web.app.page.tsx.fb3826c456"),
    reportCoverTitle: getNativeCopy("native.apps.web.app.page.tsx.6f879eeefe"),
    reportsEyebrow: getNativeCopy("native.apps.web.app.page.tsx.61d7a926dd"),
    reportsIntro: getNativeCopy("native.apps.web.app.page.tsx.c8cb4568db"),
    reportsTitle: getNativeCopy("native.apps.web.app.page.tsx.583ce3ab13"),
  },
};
