export function TinyPanelSkeletonFallback(): React.JSX.Element {
  return (
    <section
      aria-busy="true"
      aria-hidden="true"
      className="glass-panel specialist-room-panel-fallback specialist-room-panel-fallback-tiny"
    >
      <div className="specialist-room-fallback-skeleton">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
