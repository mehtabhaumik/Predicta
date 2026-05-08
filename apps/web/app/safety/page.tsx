import Link from 'next/link';
import { Card } from '../../components/Card';
import { FounderSignature } from '../../components/FounderSignature';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';

const safetyCommitments = [
  {
    title: 'Guidance, not replacement',
    body: 'Predicta answers serious astrology questions as reflection, not a replacement for qualified help or real-world judgment.',
  },
  {
    title: 'Crisis comes first',
    body: 'If danger appears, care comes first. Any astrology reflection stays gentle, protective, and non-fatalistic.',
  },
  {
    title: 'Serious topics are allowed with safeguards',
    body: 'Finance, medical, legal, behavior, and family questions are allowed with clear limits.',
  },
  {
    title: 'Unsafe requests are blocked',
    body: 'Predicta blocks harmful instructions, illegal actions, sexual content involving minors, violent guidance, and other unsafe requests.',
  },
  {
    title: 'No fear-based predictions',
    body: 'No guaranteed death, divorce, illness, bankruptcy, or disaster predictions.',
  },
  {
    title: 'Unsafe answers are softened',
    body: 'Scary or overconfident answers are softened into calmer guidance.',
  },
  {
    title: 'Prepared for difficult questions',
    body: 'Predicta is prepared for messy language, mixed languages, and difficult real-life questions.',
  },
  {
    title: 'Different astrology schools stay separate',
    body: 'Regular Predicta, KP Predicta, and Nadi Predicta are kept separate so each school speaks from its own tradition.',
  },
  {
    title: 'No fake Nadi claims',
    body: 'Nadi Predicta is not allowed to falsely claim it found or accessed a real ancient palm-leaf record.',
  },
  {
    title: 'Users can report concerns',
    body: 'Users can report a concerning answer from chat.',
  },
  {
    title: 'Privacy stays protected',
    body: 'Reports avoid full chat text and exact birth details.',
  },
  {
    title: 'Safety comes before public sharing',
    body: 'Unsafe changes should not reach users.',
  },
];

const safetyChecks = [
  'Self-harm and crisis handling',
  'Medical, legal, financial, behavior, abuse, and emergency safeguards',
  'Unsafe instructions and illegal requests',
  'Fear-based and fatalistic predictions',
  'Hindi, Gujarati, English, and mixed-language questions',
  'Clear separation between Regular, KP, and Nadi Predicta',
  'Easy reporting when an answer feels concerning',
  'A clear stop before unsafe changes reach users',
];

export default function SafetyPage(): React.JSX.Element {
  return (
    <>
      <WebHeader />
      <main className="safety-page">
        <div className="page-heading compact safety-heading">
          <StatusPill label="Public safety promise" tone="premium" />
          <h1 className="gradient-text">Predicta is built to guide, not scare.</h1>
          <p>
            Ask serious Jyotish questions with calm guidance, chart proof, and
            clear limits.
          </p>
        </div>

        <section className="safety-hero glass-panel">
          <div>
            <div className="section-title">OUR STANDARD</div>
            <h2>Safety is part of the product, not a footnote.</h2>
            <p>
              Predicta gives guidance without fear, guarantees, or crisis
              overreach. The goal is care, not unnecessary denial.
            </p>
          </div>
          <div className="safety-proof-card">
            <span>Public promise</span>
            <strong>Safety comes first</strong>
            <p>
              Guidance should stay calm, responsible, and useful before users
              see it.
            </p>
          </div>
        </section>

        <section className="safety-commitments">
          {safetyCommitments.map((item, index) => (
            <Card className="safety-commitment-card" key={item.title}>
              <div className="card-content">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="safety-checks glass-panel">
          <div>
            <div className="section-title">WHAT WE PREPARE FOR</div>
            <h2>Predicta is prepared for risky real-world questions.</h2>
            <p>
              Predicta is prepared for crisis language, serious decisions,
              mixed languages, school confusion, and answers that need a calmer
              tone.
            </p>
          </div>
          <ul>
            {safetyChecks.map(check => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </section>

        <section className="founder-promise">
          <div className="section-title">FOUNDER PROMISE</div>
          <p>
            Predicta should stay useful, beautiful, and respectful during
            uncertain moments. Safety stays non-negotiable.
          </p>
          <FounderSignature />
        </section>

        <div className="legal-footer-note">
          <p>
            Use Predicta as a spiritual timing lens alongside qualified support
            for serious decisions.
          </p>
          <Link className="button secondary" href="/legal">
            Read Policies
          </Link>
        </div>
      </main>
      <WebFooter />
    </>
  );
}
