import Link from "next/link";

export function WingLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="wing" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5b9bff" />
          <stop offset="1" stopColor="#8a6bff" />
        </linearGradient>
      </defs>
      <path d="M2 13.5 L21 3 L13.5 12.5 L21.5 21 Z" fill="url(#wing)" />
      <path d="M2 13.5 L13.5 12.5 L8.5 20 Z" fill="url(#wing)" opacity="0.55" />
    </svg>
  );
}

/** Clickable logo + wordmark, links home. */
export function Brand() {
  return (
    <Link href="/" className="brand" style={{ marginBottom: 0, textDecoration: "none", color: "var(--text)" }}>
      <WingLogo size={24} />
      <span className="brand-name">Hiddenwing</span>
    </Link>
  );
}
