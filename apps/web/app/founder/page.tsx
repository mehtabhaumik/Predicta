import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { WebHeader } from '../../components/WebHeader';

export const metadata: Metadata = {
  description:
    'Meet Bhaumik Mehta, founder of Predicta, and read the vision behind a calm, premium Vedic intelligence experience for modern life.',
  openGraph: {
    description:
      'Predicta was built to make Vedic astrology feel precise, private, calm, and beautifully useful for modern life.',
    title: 'Founder | Predicta',
  },
  title: 'Founder',
  twitter: {
    card: 'summary_large_image',
    description:
      'The founder vision behind Predicta, a premium Vedic intelligence system.',
    title: 'Founder | Predicta',
  },
};

const founderPrinciples = [
  {
    copy:
      'Birth details, saved kundlis, and personal guidance should be handled with restraint, clarity, and respect.',
    title: 'Privacy by temperament',
  },
  {
    copy:
      'Predicta is designed to explain patterns calmly, never to overwhelm people with fear or certainty.',
    title: 'Guidance without pressure',
  },
  {
    copy:
      'The product brings chart context, dasha timing, reports, and AI guidance into one coherent experience.',
    title: 'One intelligent system',
  },
];

const visionPoints = [
  'A product that respects Vedic tradition while using modern engineering to make it easier to understand.',
  'A calmer alternative to noisy astrology apps, built with premium design, thoughtful limits, and clear user control.',
  'A platform that can grow across mobile and web without losing the same quiet, personal signature.',
];

export default function FounderPage(): React.JSX.Element {
  return (
    <>
      <WebHeader />
      <main className="founder-page">
        <section className="founder-hero" aria-labelledby="founder-title">
          <div className="founder-copy">
            <span className="section-title">Founder</span>
            <h1 id="founder-title">
              Building Predicta for people who want clarity without noise.
            </h1>
            <p className="founder-lede">
              I built Predicta to make Vedic astrology feel precise, private,
              emotionally calm, and genuinely useful in modern life.
            </p>
            <div className="founder-actions">
              <Link className="button" href="/dashboard">
                Enter Predicta
              </Link>
              <Link className="button secondary" href="/pricing">
                View plans
              </Link>
            </div>
          </div>

          <div className="founder-portrait-card glass-panel">
            <Image
              alt="Bhaumik Mehta, founder of Predicta"
              className="founder-portrait"
              height={1024}
              priority
              src="/founder-bhaumik-mehta.png"
              width={1024}
            />
            <div className="founder-nameplate">
              <span>Bhaumik Mehta</span>
              <small>Founder, Predicta</small>
            </div>
          </div>
        </section>

        <section className="founder-section founder-letter glass-panel">
          <span className="section-title">Why Predicta exists</span>
          <div className="founder-letter-grid">
            <h2>
              Astrology should feel grounded enough to trust and beautiful
              enough to return to.
            </h2>
            <div className="founder-letter-copy">
              <p>
                Predicta began from a simple belief: deep chart wisdom should
                not feel confusing, intimidating, or cheaply packaged. A kundli
                carries sensitive personal context. The product around it should
                feel equally thoughtful.
              </p>
              <p>
                The goal is not to replace tradition. The goal is to give it a
                respectful interface, a calmer voice, and a smarter structure so
                people can explore their chart, timing, reports, and questions
                with confidence.
              </p>
              <p>
                Predicta is being built as a premium Vedic intelligence system:
                local-first where it matters, cloud-ready when users choose it,
                and careful about how much data is used for every answer.
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
              <article className="founder-principle card" key={principle.title}>
                <div className="card-content">
                  <h3>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </div>
              </article>
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
            Predicta is for people who want their spiritual technology to feel
            intelligent, polished, private, and human.
          </p>
          <Link className="button" href="/dashboard">
            Begin with Predicta
          </Link>
        </section>
      </main>
    </>
  );
}
