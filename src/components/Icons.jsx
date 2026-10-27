// Minimal stroke icons (24px grid), inheriting currentColor.
const Svg = ({ children, size = 20, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
    {children}
  </svg>
);

export const DashboardIcon = (p) => <Svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 3v18M9 11h12" /></Svg>;
export const SearchIcon = (p) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
export const ExternalIcon = (p) => <Svg {...p}><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></Svg>;
export const BriefcaseIcon = (p) => <Svg {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></Svg>;
export const HeadsetIcon = (p) => <Svg {...p}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></Svg>;
export const LogoutIcon = (p) => <Svg {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" /></Svg>;
export const MenuIcon = (p) => <Svg {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Svg>;
export const CloseIcon = (p) => <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>;
export const RefreshIcon = (p) => <Svg {...p}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></Svg>;
export const AlertIcon = (p) => <Svg {...p}><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17h.01" /></Svg>;
export const CalendarIcon = (p) => <Svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></Svg>;
export const EyeIcon = (p) => <Svg {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Svg>;
export const EyeOffIcon = (p) => <Svg {...p}><path d="M3 3l18 18M10.6 5.1A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" /></Svg>;
export const InboxIcon = (p) => <Svg {...p}><path d="M3 13h5l2 3h4l2-3h5" /><path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2-8z" /></Svg>;

// Status circle like a Notion checkbox: empty = open, half = in progress, check = done.
export function StatusIcon({ status, size = 22 }) {
  if (status === 'done') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="var(--green-600)" />
        <path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke={status === 'in_progress' ? 'var(--amber-600)' : 'var(--ink-400)'} strokeWidth="2" />
      {status === 'in_progress' && <path d="M12 5.5a6.5 6.5 0 0 1 0 13z" fill="var(--amber-600)" />}
    </svg>
  );
}
export const PlusIcon = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const EditIcon = (p) => <Svg {...p}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="m13.5 6.5 4 4" /></Svg>;
export const TrashIcon = (p) => <Svg {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></Svg>;
export const CheckIcon = (p) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>;
