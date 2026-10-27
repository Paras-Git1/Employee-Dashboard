import { dueLabel, formatDeadline, PRIORITY_LABELS, SOURCE_LABELS, STATUS_LABELS, URGENCY_LABELS } from '../format.js';
import { CalendarIcon, EditIcon, ExternalIcon, StatusIcon, TrashIcon } from './Icons.jsx';

/**
 * actions (all optional):
 *  - onStatusChange(task, status): shown when the viewer may change this task's status
 *  - onEdit(task), onDelete(task): admin only
 */
export function TaskCard({ task, showAssignee, now, actions = {}, busy = false, onOpen }) {
  const due = dueLabel(task.deadline, now);
  const done = task.status === 'done';
  const sourceName = SOURCE_LABELS[task.source] ?? task.source;
  const { onStatusChange, onEdit, onDelete } = actions;

  return (
    <article className={`task-card ${done ? 'is-done' : ''} ${busy ? 'is-busy' : ''}`} aria-labelledby={`title-${task.taskKey}`} aria-busy={busy}>
      <div className="pills">
        <span className={`pill pill-source-${task.source}`}>{sourceName}</span>
        {!done && <span className={`pill pill-${due.tone}`}>{due.text}</span>}
        <span className={`pill pill-priority pill-priority-${task.priorityLabel}`} title={`Priority score ${task.priorityScore}`}>
          <span className="priority-dot" aria-hidden="true" />
          {PRIORITY_LABELS[task.priorityLabel]}
        </span>
      </div>

      <div className="task-head">
        {onStatusChange ? (
          <button
            type="button"
            className="status-toggle"
            onClick={() => onStatusChange(task, done ? 'open' : 'done')}
            disabled={busy}
            aria-label={done ? `Mark "${task.title}" as not completed` : `Mark "${task.title}" as completed`}
            title={done ? 'Mark as not completed' : 'Mark as completed'}
          >
            <StatusIcon status={task.status} />
          </button>
        ) : (
          <StatusIcon status={task.status} />
        )}
        <h3 id={`title-${task.taskKey}`} className="task-title">
          {onOpen ? (
            <button type="button" className="task-title-btn" onClick={() => onOpen(task)} aria-haspopup="dialog">{task.title}</button>
          ) : task.title}
        </h3>
        {(onEdit || onDelete) && (
          <div className="card-tools">
            {onEdit && (
              <button type="button" className="icon-btn icon-btn-sm" onClick={() => onEdit(task)} aria-label={`Edit "${task.title}"`} title="Edit">
                <EditIcon size={17} />
              </button>
            )}
            {onDelete && (
              <button type="button" className="icon-btn icon-btn-sm icon-btn-danger" onClick={() => onDelete(task)} aria-label={`Delete "${task.title}"`} title="Delete">
                <TrashIcon size={17} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="task-date">
        <CalendarIcon size={15} />
        <time dateTime={task.deadline}>{formatDeadline(task.deadline)}</time>
      </div>

      <dl className="task-meta">
        <div><dt>{task.source === 'crm' ? 'Account' : 'Urgency'}</dt>
          <dd>{task.source === 'crm' ? task.context ?? '—' : `${URGENCY_LABELS[task.urgency]} (${task.urgency}/4)`}</dd></div>
        {showAssignee && <div><dt>Assignee</dt><dd>{task.employeeName ?? 'Unassigned'}</dd></div>}
        <div><dt>Reference</dt><dd>{task.sourceId}</dd></div>
      </dl>

      <div className="task-foot">
        {onStatusChange ? (
          <label className={`status-select status-text-${task.status}`}>
            <span className="sr-only">Status of "{task.title}"</span>
            <select value={task.status} onChange={(e) => onStatusChange(task, e.target.value)} disabled={busy}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        ) : (
          <span className={`status-text status-text-${task.status}`}>{STATUS_LABELS[task.status]}</span>
        )}
        <a className="btn btn-outline" href={task.url} target="_blank" rel="noopener noreferrer">
          Open in {sourceName} <ExternalIcon size={15} />
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </article>
  );
}
