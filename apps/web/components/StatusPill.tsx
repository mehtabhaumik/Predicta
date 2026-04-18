export function StatusPill({
  label,
  tone = 'default',
}: {
  label: string;
  tone?: 'default' | 'premium' | 'quiet';
}): React.JSX.Element {
  return <span className={`status-pill ${tone}`}>{label}</span>;
}
