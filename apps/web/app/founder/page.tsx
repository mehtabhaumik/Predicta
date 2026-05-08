import Link from 'next/link';
import type { Metadata } from 'next';
import Image from 'next/image';
import { Card } from '../../components/Card';
import { FounderSignature } from '../../components/FounderSignature';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';

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

const founderPrinciples = [
  {
    copy:
      'Birth details, saved Kundlis, and personal guidance must be handled with restraint, clarity, and respect.',
    title: 'Privacy by temperament',
  },
  {
    copy:
      'Predicta should explain chart patterns calmly. It should not sell fear, certainty, or dependency.',
    title: 'Guidance without pressure',
  },
  {
    copy:
      'Regular Predicta, KP Predicta, and Nadi Predicta should stay clear in method, purpose, and safety boundaries.',
    title: 'Clear astrology schools',
  },
  {
    copy:
      'The product must be easy enough for a new user while keeping serious Jyotish depth in the background.',
    title: 'Depth without confusion',
  },
];

const visionPoints = [
  'Respect Vedic tradition while using modern engineering to make it easier to understand.',
  'Build a calmer alternative to noisy astrology apps, with premium design and clear user control.',
  'Keep public safety visible and protected before Predicta reaches more people.',
  'Grow across mobile and web without losing the same personal, careful product signature.',
];

export default function FounderPage(): React.JSX.Element {
  return (
    <>
      <WebHeader />
      <main className="founder-page">
        <section className="founder-hero" aria-labelledby="founder-title">
          <div className="founder-copy">
            <StatusPill label="Founder vision" tone="premium" />
            <h1 id="founder-title" className="gradient-text">
              Building Predicta for people who want clarity without noise.
            </h1>
            <p className="founder-lede">
              I built Predicta to make Vedic astrology precise, private, calm,
              and useful.
            </p>
            <div className="founder-actions">
              <Link className="button" href="/dashboard">
                Enter Predicta
              </Link>
              <Link className="button secondary" href="/safety">
                Read Safety Promise
              </Link>
            </div>
          </div>

          <div className="founder-portrait-card glass-panel">
            <div className="founder-portrait-frame">
              <Image
                alt="Bhaumik Mehta"
                fill
                priority
                sizes="(max-width: 820px) 78vw, 420px"
                src="/founder-bhaumik-mehta.png"
              />
            </div>
            <div className="founder-portrait-copy">
              <p>
                Predicta should feel intelligent, polished, private, and human.
                That standard applies everywhere.
              </p>
            </div>
          </div>
        </section>

        <section className="founder-section founder-letter glass-panel">
          <div className="founder-letter-grid">
            <div className="founder-letter-heading">
              <span className="section-title">Why Predicta exists</span>
              <h2>
                Astrology should feel grounded enough to trust and simple
                enough to use.
              </h2>
            </div>
            <div className="founder-letter-copy">
              <p>
                Deep chart wisdom should not feel confusing, intimidating, or
                cheaply packaged. A Kundli carries personal context and deserves
                a thoughtful experience.
              </p>
              <p>
                The goal is to honor tradition with a calmer voice, clearer
                structure, and confident chart exploration.
              </p>
              <p>
                Predicta is chart-backed, safety-aware, mobile-first, and
                careful with every answer.
              </p>
            </div>
          </div>
        </section>

        <section className="founder-section founder-principles">
          <div className="founder-section-heading">
            <span className="section-title">Product principles</span>
            <h2>Calm technology for a deeply personal subject.</h2>
          </div>
          <div className="founder-principle-grid">
            {founderPrinciples.map(principle => (
              <Card className="founder-principle" key={principle.title}>
                <div className="card-content">
                  <h3>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="founder-section founder-vision glass-panel">
          <div>
            <span className="section-title">The vision</span>
            <h2>A trusted astrology companion across mobile and web.</h2>
          </div>
          <div className="founder-vision-list">
            {visionPoints.map(point => (
              <div className="founder-vision-item" key={point}>
                <span aria-hidden="true" />
                <p>{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="founder-final">
          <p>
            Predicta is for people who want spiritual guidance to feel useful,
            safe, premium, and respectful.
          </p>
          <FounderSignature />
          <Link className="button" href="/dashboard">
            Begin with Predicta
          </Link>
        </section>
      </main>
      <WebFooter />
    </>
  );
}
