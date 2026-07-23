import AppHeader from "./app-header";

export default function ComingSoon({
  badge,
  title,
  blurb,
  icon,
  bullets,
}: {
  badge: string;
  title: string;
  blurb: string;
  icon: string;
  bullets: string[];
}) {
  return (
    <main className="wrap">
      <AppHeader />
      <span className="badge" style={{ marginTop: 24 }}>
        {badge}
      </span>
      <h1>{title}</h1>
      <p className="lede">{blurb}</p>

      <div className="soon-hero">
        <span className="soon-icon" aria-hidden="true">
          {icon}
        </span>
        <div>
          <div className="soon-tag">Coming soon</div>
          <ul className="soon-list">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="status" style={{ marginTop: 20 }}>
        <span className="dot" style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
        Not built yet — part of the Hiddenwing roadmap. Flights are live today.
      </div>
    </main>
  );
}
