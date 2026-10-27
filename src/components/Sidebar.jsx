import { useAuth } from '../auth/AuthContext.jsx';
import { Avatar } from './Avatar.jsx';
import { BriefcaseIcon, CloseIcon, DashboardIcon, HeadsetIcon, LogoutIcon } from './Icons.jsx';
import { Brand } from './Logo.jsx';

const SOURCE_LINKS = [
  { source: 'crm', label: 'CRM', hint: 'Sales & accounts', icon: BriefcaseIcon },
  { source: 'helpdesk', label: 'Helpdesk', hint: 'Support tickets', icon: HeadsetIcon },
];

/**
 * activeSource: '' for all tasks, or 'crm' / 'helpdesk'. Clicking a system shows only its work.
 * sources: per-system status from the API ({ source, ok, openCount }).
 */
export function Sidebar({ open, onClose, sources, activeSource, onSelectSource }) {
  const { user, logout } = useAuth();
  const statusOf = (name) => sources.find((s) => s.source === name);
  const totalOpen = sources.reduce((sum, s) => sum + (s.openCount ?? 0), 0);

  const select = (source) => {
    onSelectSource(source);
    onClose();
  };

  return (
    <>
      <div className={`sidebar-scrim ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-head">
          <Brand />
          <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <nav className="nav" aria-label="Task views">
          <button type="button" className={`nav-item ${activeSource === '' ? 'is-active' : ''}`} aria-pressed={activeSource === ''} onClick={() => select('')}>
            <DashboardIcon /> <span className="nav-label">All tasks</span>
            {sources.length > 0 && <span className="nav-count">{totalOpen}</span>}
          </button>

          <div className="nav-section-title">Systems</div>
          {SOURCE_LINKS.map(({ source, label, hint, icon: Icon }) => {
            const s = statusOf(source);
            const state = s ? (s.ok ? 'ok' : 'down') : 'unknown';
            const active = activeSource === source;
            return (
              <button
                type="button"
                key={source}
                className={`nav-item nav-source nav-source-${source} ${active ? 'is-active' : ''}`}
                aria-pressed={active}
                onClick={() => select(active ? '' : source)}
                title={active ? 'Show all tasks' : `Show only ${label} tasks`}
              >
                <Icon />
                <span className="nav-label">
                  {label}
                  <span className="nav-hint">{hint}</span>
                </span>
                {s?.ok && <span className="nav-count">{s.openCount}</span>}
                <span className={`status-dot status-${state}`} title={state === 'ok' ? 'Connected' : state === 'down' ? 'Unavailable' : 'Checking'}>
                  <span className="sr-only">{state === 'ok' ? 'connected' : state === 'down' ? 'unavailable' : 'checking'}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <div className="me">
            <Avatar name={user?.name} size={38} />
            <div className="me-text">
              <div className="me-name">{user?.name}</div>
              <div className="me-role">{user?.access === 'manager' ? 'Admin' : 'Employee'}</div>
            </div>
          </div>
          <button type="button" className="nav-item signout" onClick={logout}>
            <LogoutIcon /> Sign out
          </button>
          <p className="sidebar-note">
            Counts show unfinished tasks
          </p>
        </div>
      </aside>
    </>
  );
}
