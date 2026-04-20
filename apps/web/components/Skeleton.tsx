export function SkeletonLine({
  className = '',
  width,
}: {
  className?: string;
  width?: string;
}): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={`skeleton-line ${className}`}
      style={width ? { width } : undefined}
    />
  );
}

export function SkeletonCard({
  className = '',
  lines = 4,
}: {
  className?: string;
  lines?: number;
}): React.JSX.Element {
  return (
    <section aria-hidden="true" className={`card glass-panel skeleton-card ${className}`}>
      <div className="skeleton-card-content">
        <SkeletonLine className="skeleton-kicker" width="32%" />
        <SkeletonLine className="skeleton-title" width="74%" />
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonLine
            key={index}
            width={`${Math.max(38, 92 - index * 12)}%`}
          />
        ))}
      </div>
    </section>
  );
}

export function DashboardSkeleton(): React.JSX.Element {
  return (
    <section aria-label="Loading Predicta workspace" className="dashboard-page">
      <div className="page-heading compact">
        <SkeletonLine className="skeleton-kicker" width="148px" />
        <SkeletonLine className="skeleton-hero-title" width="72%" />
        <SkeletonLine width="62%" />
      </div>
      <div className="metric-row">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={2} />
      </div>
      <div className="dashboard-feature-grid">
        <SkeletonCard className="feature-card-large" lines={5} />
        <SkeletonCard lines={4} />
        <SkeletonCard className="feature-card-large" lines={4} />
        <SkeletonCard lines={3} />
      </div>
    </section>
  );
}

export function AuthButtonSkeleton(): React.JSX.Element {
  return (
    <button className="button skeleton-button" disabled type="button">
      <span aria-hidden="true" className="skeleton-line skeleton-button-line" />
      <span className="sr-only">Loading sign in</span>
    </button>
  );
}
