import { useCallback, useMemo, useState } from 'react';
import { ApiError, request } from '../api/http.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { greeting, SOURCE_LABELS, STATUS_LABELS } from '../format.js';
import { useEmployees } from '../hooks/useEmployees.js';
import { useTaskEvents } from '../hooks/useTaskEvents.js';
import { useTasks } from '../hooks/useTasks.js';
import { ConfirmDelete } from './ConfirmDelete.jsx';
import { ErrorBanner } from './ErrorBanner.jsx';
import { FilterBar } from './FilterBar.jsx';
import { CheckIcon, CloseIcon, MenuIcon, PlusIcon, RefreshIcon, SearchIcon } from './Icons.jsx';
import { NeedsAttention } from './NeedsAttention.jsx';
import { Sidebar } from './Sidebar.jsx';
import { StatCards } from './StatCards.jsx';
import { TaskDetail } from './TaskDetail.jsx';
import { TaskForm } from './TaskForm.jsx';
import { TaskList } from './TaskList.jsx';
import { Toast } from './Toast.jsx';

// Short sentence for a live notice, or null if the viewer does not need one.
export function describeEvent(event, { isManager, userId }) {
  const { type, task = {}, actorName, previousStatus, previousEmployeeId } = event;
  const who = actorName ?? 'Someone';
  const title = `"${task.title ?? 'A task'}"`;
  if (isManager) {
    if (type === 'created') return `${who} assigned ${title} to ${task.employeeName ?? 'an employee'}`;
    if (type === 'deleted') return `${who} deleted ${title}`;
    if (task.status === 'done' && previousStatus !== 'done') return `${who} completed ${title}`;
    if (task.status !== previousStatus) return `${who} moved ${title} to "${STATUS_LABELS[task.status]}"`;
    return `${who} updated ${title}`;
  }
  if (type === 'created' || (type === 'updated' && task.employeeId === userId && previousEmployeeId != null)) {
    return `New task assigned to you: ${title}`;
  }
  if (type === 'updated' && previousEmployeeId === userId) return `${title} was reassigned to someone else`;
  if (type === 'deleted') return `${title} was removed by ${who}`;
  return `${title} was updated by ${who}`;
}

export function Dashboard() {
  const { user, sessionExpired } = useAuth();
  const isManager = user.access === 'manager';
  const defaultFilters = useMemo(() => ({ employee: isManager ? '' : String(user.id), status: '', source: '' }), [isManager, user.id]);

  const [filters, setFilters] = useState(defaultFilters);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const resetFilters = useCallback(() => setFilters(defaultFilters), [defaultFilters]);
  const employees = useEmployees(true);
  const { status, tasks, errors, sources, error, updatedAt, retry, refresh } = useTasks(filters, {
    onUnauthorized: sessionExpired,
    onInvalidFilters: resetFilters,
  });

  // Live updates pushed by the API: refresh the list and tell the user about changes made by someone else.
  const [notices, setNotices] = useState([]);
  const live = useTaskEvents((event) => {
    refresh();
    if (event.actorId === user.id) return;
    const message = describeEvent(event, { isManager, userId: user.id });
    if (message) setNotices((n) => [{ id: `${event.at}-${event.task?.taskKey}-${n.length}`, message }, ...n].slice(0, 5));
  });
  const dismissNotice = (id) => setNotices((n) => n.filter((x) => x.id !== id));

  const [dialog, setDialog] = useState(null); // { type: 'create' | 'edit' | 'delete', task? }
  // Task shown in the detail panel. Looked up from the live list so it updates when the task changes.
  const [openKey, setOpenKey] = useState(null);
  const openTask = openKey ? tasks.find((t) => t.taskKey === openKey) : null;
  const closeDetail = useCallback(() => setOpenKey(null), []);
  const [busyKeys, setBusyKeys] = useState(() => new Set());
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);
  const closeDialog = useCallback(() => setDialog(null), []);

  // Runs a write against the API. Session expiry signs the user out; other errors are re-thrown with a readable message.
  async function mutate(path, options) {
    try {
      return await request(path, options);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) sessionExpired();
      throw err;
    }
  }

  async function createTask(payload) {
    const { task } = await mutate('/api/tasks', { method: 'POST', body: payload });
    setDialog(null);
    setToast({ tone: 'success', message: `Task created and assigned to ${task.employeeName}.` });
    refresh();
  }

  async function saveTask(task, payload) {
    await mutate(`/api/tasks/${encodeURIComponent(task.taskKey)}`, { method: 'PATCH', body: payload });
    setDialog(null);
    setToast({ tone: 'success', message: 'Task updated.' });
    refresh();
  }

  async function deleteTask(task) {
    await mutate(`/api/tasks/${encodeURIComponent(task.taskKey)}`, { method: 'DELETE' });
    setDialog(null);
    setToast({ tone: 'success', message: 'Task deleted.' });
    refresh();
  }

  async function changeStatus(task, status) {
    if (status === task.status) return;
    setBusyKeys((keys) => new Set(keys).add(task.taskKey));
    try {
      await mutate(`/api/tasks/${encodeURIComponent(task.taskKey)}`, { method: 'PATCH', body: { status } });
      setToast({ tone: 'success', message: `Marked as "${STATUS_LABELS[status]}".` });
        refresh();
    } catch (err) {
      setToast({ tone: 'error', message: err.message });
    } finally {
      setBusyKeys((keys) => {
        const next = new Set(keys);
        next.delete(task.taskKey);
        return next;
      });
    }
  }

  // Admins can do everything; employees can change the status of their own tasks.
  const actionsFor = (task) => {
    if (isManager) {
      return {
        onStatusChange: changeStatus,
        onEdit: (t) => { setOpenKey(null); setDialog({ type: 'edit', task: t }); },
        onDelete: (t) => { setOpenKey(null); setDialog({ type: 'delete', task: t }); },
      };
    }
    return task.employeeId === user.id ? { onStatusChange: changeStatus } : {};
  };

  const term = search.trim().toLowerCase();
  const visibleTasks = term
    ? tasks.filter((t) => [t.title, t.sourceId, t.context, t.employeeName].some((v) => v?.toLowerCase().includes(term)))
    : tasks;
  const filtered = Boolean(term) || filters.status !== '' || filters.source !== '' || (isManager && filters.employee !== '');
  const firstName = user.name.split(' ')[0];

  return (
    <div className="layout">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sources={sources}
        activeSource={filters.source}
        onSelectSource={(source) => setFilters((f) => ({ ...f, source }))}
      />

      <main className="main" id="top">
        <header className="topbar">
          <button type="button" className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <MenuIcon />
          </button>
          <div className="welcome">
            <h1>Welcome back, {firstName}</h1>
            <p>
              {greeting()} · {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="topbar-actions">
            <label className="search">
              <SearchIcon size={18} />
              <span className="sr-only">Search tasks</span>
              <input type="search" placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <button type="button" className="btn btn-ghost" onClick={retry} disabled={status === 'loading'} aria-label="Refresh tasks">
              <RefreshIcon size={16} className={status === 'loading' ? 'spin' : ''} />
              <span className="hide-sm">Refresh</span>
            </button>
          </div>
        </header>

        {notices.length > 0 && (
          <ul className="notices" aria-live="polite">
            {notices.map((n) => (
              <li className="banner banner-success" key={n.id}>
                <CheckIcon size={18} />
                <span>{n.message}</span>
                <button type="button" className="icon-btn icon-btn-sm notice-close" onClick={() => dismissNotice(n.id)} aria-label="Dismiss">
                  <CloseIcon size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <ErrorBanner errors={status === 'ready' ? errors : []} />
        <StatCards tasks={tasks} />

        <div className="content-grid">
          <section className="panel panel-tasks" aria-labelledby="tasks-title">
            <div className="panel-head panel-head-wrap">
              <div>
                <h2 id="tasks-title">
                  {isManager ? 'Team tasks' : 'My tasks'}
                  {filters.source && (
                    <button type="button" className={`source-chip source-chip-${filters.source}`} onClick={() => setFilters((f) => ({ ...f, source: '' }))}>
                      {SOURCE_LABELS[filters.source]} only <CloseIcon size={13} />
                      <span className="sr-only">, show all systems</span>
                    </button>
                  )}
                </h2>
                <p className="panel-sub">
                  <span className={`live-dot ${live ? 'is-live' : ''}`} aria-hidden="true" />
                  {live ? 'Live' : 'Reconnecting…'} · Sorted by priority
                  {updatedAt && <> · updated {new Date(updatedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</>}
                </p>
              </div>
              <div className="panel-tools">
                <FilterBar employees={employees} filters={filters} onChange={setFilters} canPickEmployee={isManager} />
                {isManager && (
                  <button type="button" className="btn btn-primary" onClick={() => setDialog({ type: 'create' })}>
                    <PlusIcon size={17} /> New task
                  </button>
                )}
              </div>
            </div>
            <TaskList
              status={status}
              tasks={visibleTasks}
              error={error}
              onRetry={retry}
              showAssignee={isManager}
              filtered={filtered}
              actionsFor={actionsFor}
              busyKeys={busyKeys}
              onOpen={(t) => setOpenKey(t.taskKey)}
            />
          </section>

          <aside className="rail">
            <NeedsAttention tasks={tasks} showAssignee={isManager} onOpen={(t) => setOpenKey(t.taskKey)} />
          </aside>
        </div>
      </main>

      {openTask && (
        <TaskDetail task={openTask} actions={actionsFor(openTask)} busy={busyKeys.has(openTask.taskKey)} onClose={closeDetail} />
      )}
      {dialog?.type === 'create' && <TaskForm employees={employees} onSubmit={createTask} onClose={closeDialog} />}
      {dialog?.type === 'edit' && (
        <TaskForm task={dialog.task} employees={employees} onSubmit={(payload) => saveTask(dialog.task, payload)} onClose={closeDialog} />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDelete task={dialog.task} onConfirm={() => deleteTask(dialog.task)} onClose={closeDialog} />
      )}
      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
