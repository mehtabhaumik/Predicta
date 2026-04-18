import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}): React.JSX.Element {
  return <section className={`card airy-card ${className}`}>{children}</section>;
}

export function MetricCard({
  label,
  value,
  detail,
}: {
  detail: string;
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <Card className="glass-panel">
      <div className="metric-card-body">
        <div className="section-title">{label}</div>
        <h3>{value}</h3>
        <p>{detail}</p>
      </div>
    </Card>
  );
}
