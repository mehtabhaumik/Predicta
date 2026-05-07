import Link from 'next/link';
import { Card } from '../../components/Card';
import { FounderSignature } from '../../components/FounderSignature';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';

const safetyCommitments = [
  {
    title: 'Guidance, not replacement',
    body: 'Predicta can answer astrology questions about health, money, law, behavior, conflict, and emotional pressure. It is still Jyotish guidance, not a replacement for doctors, lawyers, financial advisors, emergency help, or real-world judgment.',
  },
  {
    title: 'Crisis comes first',
    body: 'If someone talks about self-harm or immediate danger, Predicta responds with care first, encourages immediate human support, and keeps any astrology reflection gentle, protective, and non-fatalistic.',
  },
  {
    title: 'Serious topics are allowed with safeguards',
    body: 'Finance astrology, medical astrology, legal astrology, share-market astrology, behavior questions, and family concerns are allowed. Predicta adds a clear safety note and avoids final decisions or guarantees.',
  },
  {
    title: 'Unsafe requests are blocked',
    body: 'Predicta blocks harmful instructions, illegal actions, sexual content involving minors, violent guidance, and other unsafe requests.',
  },
  {
    title: 'No fear-based predictions',
    body: 'Predicta is designed to avoid scary and fatalistic claims like guaranteed death, divorce, illness, bankruptcy, or disaster.',
  },
  {
    title: 'Unsafe answers are softened',
    body: 'If an answer sounds scary, overconfident, or careless, Predicta is designed to turn it into calmer and safer guidance.',
  },
  {
    title: 'Prepared for difficult questions',
    body: 'Predicta is prepared for difficult questions, mixed Hindi, Gujarati, and English, and imperfect typing, because real people do not always ask neatly.',
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
    body: 'If an answer feels concerning, the user can report it from chat so it can be looked at carefully.',
  },
  {
    title: 'Privacy stays protected',
    body: 'When a concern is reported, Predicta avoids keeping the full conversation or exact birth details. It keeps only the minimum information needed to look into the concern.',
  },
  {
    title: 'Safety comes before public sharing',
    body: 'If a change makes Predicta less safe, it should not be shared with users until the concern is fixed.',
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
            Astrology can feel personal and emotional. Predicta is designed to
            answer real Jyotish questions while keeping guidance calm,
            reflective, and clearly separated from urgent professional
            decisions.
          </p>
        </div>

        <section className="safety-hero glass-panel">
          <div>
            <div className="section-title">OUR STANDARD</div>
            <h2>Safety is part of the product, not a footnote.</h2>
            <p>
              Predicta can still give Jyotish guidance, but it should not scare
              people, make dangerous guarantees, replace qualified
              professionals, or handle crisis situations irresponsibly. The goal
              is safeguards, not unnecessary denial.
            </p>
          </div>
          <div className="safety-proof-card">
            <span>Public promise</span>
            <strong>Safety comes first</strong>
            <p>
              New Predicta guidance should stay calm, responsible, and useful
              before it reaches users.
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
              Predicta is prepared for crisis language, serious life decisions,
              mixed-language messages, confusion between astrology schools, and
              answers that need a calmer tone.
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
            I want Predicta to be useful, beautiful, and deeply respectful of
            people using it during uncertain moments. We will keep improving the
            product, but we will not treat safety as optional.
          </p>
          <FounderSignature />
        </section>

        <div className="legal-footer-note">
          <p>
            Predicta is reflective astrology guidance. For medical, legal,
            financial, emergency, or safety decisions, use it as a spiritual
            and timing lens alongside qualified professional or emergency
            support.
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
