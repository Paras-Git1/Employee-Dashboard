const DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// Short relative label for the due pill: Overdue, Today, Tomorrow, In 3 days, Nov 12.
export function dueLabel(deadline, now = new Date()) {
  const due = new Date(deadline);
  if (due < now) return { text: 'Overdue', tone: 'red' };
  const days = Math.round((startOfDay(due) - startOfDay(now)) / DAY);
  if (days === 0) return { text: 'Today', tone: 'blue' };
  if (days === 1) return { text: 'Tomorrow', tone: 'blue' };
  if (days < 7) return { text: `In ${days} days`, tone: 'gray' };
  return { text: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), tone: 'gray' };
}

export function formatDeadline(deadline) {
  return new Date(deadline).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export const STATUS_LABELS = { open: 'To do', in_progress: 'Working on it', done: 'Completed' };
export const SOURCE_LABELS = { crm: 'CRM', helpdesk: 'Helpdesk' };
export const PRIORITY_LABELS = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
export const URGENCY_LABELS = { 1: 'Low', 2: 'Normal', 3: 'High', 4: 'Urgent' };

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
