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
    title: 'Unsafe AI output is checked',
    body: 'If an AI answer becomes unsafe or overconfident, the backend catches it and replaces it with safer guidance.',
  },
  {
    title: 'Tested with difficult questions',
    body: 'Predicta is tested with intentionally difficult prompts, including mixed Hindi, Gujarati, and English, so safety does not depend on perfect typing.',
  },
  {
    title: 'Different astrology schools stay separate',
    body: 'Regular Predicta, KP Predicta, and Nadi Predicta have separate safety checks so the app does not mix methods incorrectly.',
  },
  {
    title: 'No fake Nadi claims',
    body: 'Nadi Predicta is not allowed to falsely claim it found or accessed a real ancient palm-leaf record.',
  },
  {
    title: 'Users can report concerns',
    body: 'A concerning answer can be reported from chat. Reports go into an owner review queue.',
  },
  {
    title: 'Private review by design',
    body: 'The review queue does not store full chat text or exact birth details. It stores only safety labels, time, answer source, and a protected identifier.',
  },
  {
    title: 'Release is blocked if safety fails',
    body: 'Before public release, Predicta must pass safety tests, model checks, and rollback rules. If safety checks fail, release is blocked.',
  },
];

const safetyChecks = [
  'Self-harm and crisis handling',
  'Medical, legal, financial, behavior, abuse, and emergency safeguards',
  'Unsafe instructions and illegal requests',
  'Fear-based and fatalistic predictions',
  'Hindi, Gujarati, English, and mixed-language prompts',
  'Regular Predicta, KP Predicta, and Nadi Predicta boundaries',
  'Owner review flow for concerning answers',
  'Release gate before public deployment',
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
            <span>Release gate</span>
            <strong>Blocked if safety fails</strong>
            <p>
              Future changes to AI, Jyotish, KP, or Nadi must pass safety checks
              before deployment.
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
            <div className="section-title">WHAT WE TEST</div>
            <h2>Predicta is tested against risky real-world questions.</h2>
            <p>
              Safety checks include crisis prompts, high-stakes life decisions,
              mixed-language messages, school-boundary confusion, and unsafe AI
              outputs.
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
