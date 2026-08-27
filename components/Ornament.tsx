/**
 * The house mark — a lozenge. Drawn rather than typed, because the ❦ character
 * falls back to a colour emoji font on macOS/iOS.
 */
export function Ornament({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.6 22.4 12 12 22.4 1.6 12Z" />
    </svg>
  );
}
