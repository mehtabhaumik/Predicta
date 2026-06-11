'use client';

export function SpecialistRoomPanelFallback(): React.JSX.Element {
  return (
    <section
      aria-busy="true"
      aria-hidden="true"
      className="glass-panel specialist-room-panel-fallback"
    >
      <span />
      <span />
      <span />
    </section>
  );
}
