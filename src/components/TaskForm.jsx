import { useState } from 'react';
import { STATUS_LABELS, URGENCY_LABELS } from '../format.js';
import { Modal } from './Modal.jsx';

// ISO string <-> value for <input type="datetime-local"> (local time, minute precision).
function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultDeadline() {
  const d = new Date(Date.now() + 2 * 24 * 3600_000);
  d.setHours(17, 0, 0, 0);
  return d.toISOString();
}

/**
 * Create or edit a task. On create, the admin picks the system (CRM or Helpdesk).
 * onSubmit receives the API payload; it should throw an Error with a readable message on failure.
 */
export function TaskForm({ task, employees, onSubmit, onClose }) {
  const editing = Boolean(task);
  const [form, setForm] = useState(() => ({
    source: task?.source ?? 'helpdesk',
    title: task?.title ?? '',
    employeeId: task?.employeeId ? String(task.employeeId) : '',
    deadline: toLocalInput(task?.deadline ?? defaultDeadline()),
    status: task?.status ?? 'open',
    urgency: String(task?.urgency ?? 2),
    context: task?.context ?? '',
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function buildPayload() {
    const payload = {
      title: form.title.trim(),
      employeeId: Number(form.employeeId),
      deadline: new Date(form.deadline).toISOString(),
      status: form.status,
    };
    if (!editing) payload.source = form.source;
    if (form.source === 'helpdesk') payload.urgency = Number(form.urgency);
    else payload.context = form.context.trim() || null;
    if (!editing) return payload;

    // When editing, send only what changed, so a stale form cannot overwrite a newer change
    // made meanwhile by someone else (for example an employee marking the task completed).
    const original = { title: task.title, employeeId: task.employeeId, deadline: new Date(task.deadline).toISOString(),
      status: task.status, urgency: task.urgency, context: task.context ?? null };
    const sameMinute = (a, b) => Math.abs(new Date(a) - new Date(b)) < 60_000;
    return Object.fromEntries(Object.entries(payload).filter(([key, value]) =>
      key === 'deadline' ? !sameMinute(value, original.deadline) : value !== original[key]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError('Enter a title.');
    if (!form.employeeId) return setError('Choose who the task is assigned to.');
    if (!form.deadline || Number.isNaN(new Date(form.deadline).getTime())) return setError('Choose a valid deadline.');
    const payload = buildPayload();
    if (editing && Object.keys(payload).length === 0) return onClose();
    setError('');
    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal title={editing ? 'Edit task' : 'New task'} onClose={onClose}>
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="banner banner-error" role="alert">{error}</div>}

        <fieldset className="segmented" disabled={editing}>
          <legend className="field-label">System</legend>
          {[['helpdesk', 'Helpdesk ticket'], ['crm', 'CRM task']].map(([value, label]) => (
            <label key={value} className={form.source === value ? 'is-selected' : ''}>
              <input type="radio" name="source" value={value} checked={form.source === value} onChange={set('source')} />
              {label}
            </label>
          ))}
        </fieldset>

        <label className="field field-block">
          <span className="field-label">Title</span>
          <input value={form.title} onChange={set('title')} maxLength={200} placeholder="What needs to be done?" required />
        </label>

        <div className="form-row">
          <label className="field field-block">
            <span className="field-label">Assign to</span>
            <select value={form.employeeId} onChange={set('employeeId')} required>
              <option value="" disabled>Choose an employee</option>
              {employees.map((emp) => <option key={emp.id} value={String(emp.id)}>{emp.name} · {emp.role}</option>)}
            </select>
          </label>
          <label className="field field-block">
            <span className="field-label">Deadline</span>
            <input type="datetime-local" value={form.deadline} onChange={set('deadline')} required />
          </label>
        </div>

        <div className="form-row">
          {form.source === 'helpdesk' ? (
            <label className="field field-block">
              <span className="field-label">Urgency</span>
              <select value={form.urgency} onChange={set('urgency')}>
                {[4, 3, 2, 1].map((u) => <option key={u} value={String(u)}>{URGENCY_LABELS[u]} ({u})</option>)}
              </select>
            </label>
          ) : (
            <label className="field field-block">
              <span className="field-label">Account (optional)</span>
              <input value={form.context} onChange={set('context')} maxLength={120} placeholder="Customer account" />
            </label>
          )}
          <label className="field field-block">
            <span className="field-label">Status</span>
            <select value={form.status} onChange={set('status')}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
