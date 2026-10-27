import { dueLabel, SOURCE_LABELS } from '../format.js';
import { Avatar } from './Avatar.jsx';

// The most pressing open work: critical or overdue, highest score first (list is already sorted).
export function NeedsAttention({ tasks, showAssignee, onOpen }) {
  const now = new Date();
  const urgent = tasks
    .filter((t) => t.status !== 'done' && (t.priorityLabel === 'critical' || new Date(t.deadline) < now))
    .slice(0, 5);

  return (
    <section className="panel" aria-labelledby="attention-title">
      <div className="panel-head">
        <h2 id="attention-title">Needs attention</h2>
        <span className="count-chip">{urgent.length}</span>
      </div>
      {urgent.length === 0 ? (
        <p className="panel-empty">Nothing urgent right now.</p>
      ) : (
        <ul className="attention-list">
          {urgent.map((t) => {
            const due = dueLabel(t.deadline, now);
            return (
              <li className="attention-item" key={t.taskKey}>
                <Avatar name={showAssignee ? t.employeeName ?? 'Unassigned' : SOURCE_LABELS[t.source]} size={40} />
                <div className="attention-body">
                  <p className="attention-title">{t.title}</p>
                  <p className="attention-meta">
                    {showAssignee && <>{t.employeeName ?? 'Unassigned'} · </>}
                    <span className={due.tone === 'red' ? 'text-red' : ''}>{due.text}</span> · {SOURCE_LABELS[t.source]}
                  </p>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onOpen(t)} aria-haspopup="dialog">
                    View details
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
