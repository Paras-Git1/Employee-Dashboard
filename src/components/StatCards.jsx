export function StatCards({ tasks }) {
  const now = Date.now();
  const active = tasks.filter((t) => t.status !== 'done');
  const stats = [
    { label: 'To do', value: tasks.filter((t) => t.status === 'open').length, tone: 'blue' },
    { label: 'Working on it', value: tasks.filter((t) => t.status === 'in_progress').length, tone: 'amber' },
    { label: 'Overdue', value: active.filter((t) => new Date(t.deadline).getTime() < now).length, tone: 'red' },
    { label: 'Completed', value: tasks.filter((t) => t.status === 'done').length, tone: 'green' },
  ];
  return (
    <ul className="stats" aria-label="Task summary">
      {stats.map((s) => (
        <li className={`stat stat-${s.tone}`} key={s.label}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </li>
      ))}
    </ul>
  );
}
