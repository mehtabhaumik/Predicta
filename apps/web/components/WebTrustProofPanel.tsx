import type { TrustProfile } from '@pridicta/types';

export function WebTrustProofPanel({
  compact = false,
  trust,
}: {
  compact?: boolean;
  trust: TrustProfile;
}): React.JSX.Element {
  return (
    <section className={compact ? 'trust-proof-panel compact' : 'trust-proof-panel glass-panel'}>
      <div className="trust-proof-header">
        <div>
          <div className="section-title">TRUST LAYER</div>
          <h2>{trust.confidenceLabel}</h2>
        </div>
        <span>{trust.highStakes ? 'Safety boundary active' : 'Evidence checked'}</span>
      </div>
      <p>{trust.summary}</p>
      <div className="trust-proof-grid">
        <TrustList title="Evidence used" items={trust.evidence.slice(0, compact ? 3 : 6)} />
        <TrustList title="Limits" items={trust.limitations.slice(0, compact ? 2 : 5)} />
        <TrustList title="Safety" items={trust.safetyNotes.slice(0, compact ? 2 : 4)} />
      </div>
      {!compact ? (
        <div className="trust-audit-trace">
          <span>Audit trace</span>
          <code>{trust.auditTrace.join(' | ')}</code>
        </div>
      ) : null}
    </section>
  );
}

function TrustList({
  items,
  title,
}: {
  items: string[];
  title: string;
}): React.JSX.Element {
  return (
    <div>
      <span>{title}</span>
      <ul>
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
