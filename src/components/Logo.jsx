export function Logo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="var(--brand)" />
      <g stroke="#fff" strokeWidth="3.2" strokeLinecap="round">
        <path d="M24 9v8M24 31v8M9 24h8M31 24h8M13.4 13.4l5.7 5.7M28.9 28.9l5.7 5.7M13.4 34.6l5.7-5.7M28.9 19.1l5.7-5.7" />
      </g>
      <circle cx="24" cy="24" r="4.5" fill="#fff" />
    </svg>
  );
}

export function Brand() {
  return (
    <div className="brand">
      <Logo />
      <div>
        <div className="brand-name">Employee Hub</div>
        <div className="brand-sub">Task Dashboard</div>
      </div>
    </div>
  );
}
