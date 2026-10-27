import { InboxIcon, RefreshIcon } from './Icons.jsx';
import { TaskCard } from './TaskCard.jsx';

function Skeletons() {
  return (
    <div className="task-grid" aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div className="task-card skeleton" key={i}>
          <div className="sk sk-pills" /><div className="sk sk-title" /><div className="sk sk-line" /><div className="sk sk-box" />
        </div>
      ))}
    </div>
  );
}

export function TaskList({ status, tasks, error, onRetry, showAssignee, filtered, actionsFor = () => undefined, busyKeys = new Set(), onOpen }) {
  if (status === 'loading' && tasks.length === 0) {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading tasks…</span>
        <Skeletons />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="state state-error" role="alert">
        <h3>We couldn't load your tasks</h3>
        <p>{error}</p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          <RefreshIcon size={16} /> Try again
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="state state-empty">
        <InboxIcon size={28} />
        <h3>{filtered ? 'No tasks match these filters' : 'You are all caught up'}</h3>
        <p>{filtered ? 'Try another employee, status or search term.' : 'There are no tasks assigned right now.'}</p>
      </div>
    );
  }

  const now = new Date();
  return (
    <div className={`task-grid ${status === 'loading' ? 'is-refreshing' : ''}`} aria-busy={status === 'loading'}>
      {tasks.map((task) => (
        <TaskCard key={task.taskKey} task={task} showAssignee={showAssignee} now={now} actions={actionsFor(task)} busy={busyKeys.has(task.taskKey)} onOpen={onOpen} />
      ))}
    </div>
  );
}
