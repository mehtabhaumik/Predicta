import Link from 'next/link';

export function FinalCTASection(): React.JSX.Element {
  return (
    <section className="final-cta glass-panel">
      <div>
        <div className="section-title">BEGIN WITH CLARITY</div>
        <h2>Bring your chart into a calmer workspace.</h2>
        <p>
          Depth without overwhelm. Guidance that stays grounded.
        </p>
      </div>
      <Link className="button" href="/dashboard">
        Start Your Journey
      </Link>
    </section>
  );
}
