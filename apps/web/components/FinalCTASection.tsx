import Link from 'next/link';

export function FinalCTASection(): React.JSX.Element {
  return (
    <section className="final-cta glass-panel">
      <div>
        <div className="section-title">BEGIN WITH CLARITY</div>
        <h2>Bring your chart into a calmer workspace.</h2>
        <p>
          Predicta is built for people who want depth without overwhelm,
          technology without noise, and guidance that stays grounded.
        </p>
      </div>
      <Link className="button" href="/dashboard">
        Start Your Journey
      </Link>
    </section>
  );
}
