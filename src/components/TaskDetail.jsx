import { dueLabel, PRIORITY_LABELS, SOURCE_LABELS, STATUS_LABELS, URGENCY_LABELS } from '../format.js';
import { Avatar } from './Avatar.jsx';
import { EditIcon, ExternalIcon, StatusIcon, TrashIcon } from './Icons.jsx';
import { Modal } from './Modal.jsx';

const SYSTEM_DESCRIPTION = {
  crm: 'Sales and customer work from the CRM',
  helpdesk: 'Support issue from the Helpdesk',
};

const fullDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/** Side panel with everything about one task, plus the actions the viewer is allowed to take. */
export function TaskDetail({ task, actions = {}, busy, onClose }) {
  const { onStatusChange, onEdit, onDelete } = actions;
  const due = dueLabel(task.deadline);
  const sourceName = SOURCE_LABELS[task.source];

  return (
    <Modal
      variant="drawer"
      onClose={onClose}
      headExtra={
        <div className="pills">
          <span className={`pill pill-source-${task.source}`}>{sourceName}</span>
          {task.status !== 'done' && <span className={`pill pill-${due.tone}`}>{due.text}</span>}
        </div>
      }
    >
      <div className="detail">
        <div className="detail-title">
          <StatusIcon status={task.status} size={26} />
          <h2 id="modal-title">{task.title}</h2>
        </div>
        <p className="detail-sub">{SYSTEM_DESCRIPTION[task.source]} · {task.sourceId}</p>

        <section className="detail-block" aria-labelledby="detail-status">
          <h3 id="detail-status" className="detail-label">Status</h3>
          {onStatusChange ? (
            <div className="status-steps" role="group" aria-label="Change status">
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={`status-step status-step-${value} ${task.status === value ? 'is-current' : ''}`}
                  aria-pressed={task.status === value}
                  disabled={busy}
                  onClick={() => onStatusChange(task, value)}
                >
                  <StatusIcon status={value} size={16} /> {label}
                </button>
              ))}
            </div>
          ) : (
            <p className={`status-text status-text-${task.status}`}>{STATUS_LABELS[task.status]}</p>
          )}
        </section>

        <dl className="detail-grid">
          <div>
            <dt>Assigned to</dt>
            <dd className="detail-person"><Avatar name={task.employeeName ?? 'Unassigned'} size={26} />{task.employeeName ?? 'Unassigned'}</dd>
          </div>
          <div>
            <dt>Deadline</dt>
            <dd>{fullDate(task.deadline)}</dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>
              <span className={`pill pill-priority pill-priority-${task.priorityLabel}`}>
                <span className="priority-dot" aria-hidden="true" />{PRIORITY_LABELS[task.priorityLabel]}
              </span>
              <span className="detail-muted"> score {task.priorityScore}</span>
            </dd>
          </div>
          {task.source === 'helpdesk' ? (
            <div><dt>Urgency</dt><dd>{URGENCY_LABELS[task.urgency]} ({task.urgency} of 4)</dd></div>
          ) : (
            <div><dt>Account</dt><dd>{task.context ?? '—'}</dd></div>
          )}
          <div><dt>System</dt><dd>{sourceName}</dd></div>
          <div><dt>Reference</dt><dd><code>{task.sourceId}</code></dd></div>
        </dl>

        <div className="detail-actions">
          <a className="btn btn-outline" href={task.url} target="_blank" rel="noopener noreferrer">
            Open in {sourceName} <ExternalIcon size={15} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          {onEdit && (
            <button type="button" className="btn btn-ghost" onClick={() => onEdit(task)}>
              <EditIcon size={16} /> Edit
            </button>
          )}
          {onDelete && (
            <button type="button" className="btn btn-ghost btn-ghost-danger" onClick={() => onDelete(task)}>
              <TrashIcon size={16} /> Delete
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
