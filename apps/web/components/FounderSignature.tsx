export function FounderSignature({
  className = '',
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <svg
      aria-labelledby="founder-signature-title"
      className={`founder-signature ${className}`.trim()}
      role="img"
      viewBox="0 0 520 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="founder-signature-title">Bhaumik Mehta signature</title>
      <text
        fill="currentColor"
        fontFamily="'Segoe Script', 'Bradley Hand', 'Snell Roundhand', cursive"
        fontSize="56"
        fontStyle="italic"
        x="18"
        y="86"
      >
        Bhaumik Mehta
      </text>
      <path
        d="M26 112C91 130 144 124 204 112C263 100 325 100 487 119"
        fill="none"
        opacity="0.42"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M328 96C358 87 380 85 405 90"
        fill="none"
        opacity="0.32"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}
