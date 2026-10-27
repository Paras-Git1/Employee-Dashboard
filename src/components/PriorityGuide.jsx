const LEVELS = [
  { label: 'critical', name: 'Critical', range: '70+' },
  { label: 'high', name: 'High', range: '45–69' },
  { label: 'medium', name: 'Medium', range: '25–44' },
  { label: 'low', name: 'Low', range: 'below 25' },
];

export function PriorityGuide() {
  return (
    <section className="panel" aria-labelledby="guide-title">
      <div className="panel-head">
        <h2 id="guide-title">How priority works</h2>
      </div>
      <p className="guide-text">
        Each task scores points for how close its deadline is (overdue +50, within 24 h +40, 3 days +25, 7 days +10)
        plus its urgency (Helpdesk 1–4 gives +10 to +40, CRM tasks +15).
      </p>
      <ul className="guide-list">
        {LEVELS.map((l) => (
          <li key={l.label}>
            <span className={`pill pill-priority pill-priority-${l.label}`}><span className="priority-dot" aria-hidden="true" />{l.name}</span>
            <span className="guide-range">{l.range} points</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
