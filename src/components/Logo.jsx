// Aulten brand assets live in /public: the full wordmark and the square icon.
export function Logo({ size = 44 }) {
  return <img src="/aulten-icon.png" width={size} height={size} alt="" aria-hidden="true" />;
}

export function Brand() {
  return (
    <div className="brand">
      <div>
        <img className="brand-logo" src="/aulten-logo.png" alt="Aulten" width="161" height="30" />
        <div className="brand-sub">Task Dashboard</div>
      </div>
    </div>
  );
}
