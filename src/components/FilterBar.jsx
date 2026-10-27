import { STATUS_LABELS } from '../format.js';

export function FilterBar({ employees, filters, onChange, canPickEmployee }) {
  return (
    <div className="filters" role="group" aria-label="Filter tasks">
      <label className="field">
        <span className="field-label">Employee</span>
        <select
          value={filters.employee}
          onChange={(e) => onChange({ ...filters, employee: e.target.value })}
          disabled={!canPickEmployee}
        >
          {canPickEmployee && <option value="">All employees</option>}
          {employees.map((e) => <option key={e.id} value={String(e.id)}>{e.name}</option>)}
        </select>
      </label>
      <label className="field">
        <span className="field-label">Status</span>
        <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
  );
}
