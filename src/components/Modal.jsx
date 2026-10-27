import { useEffect, useRef } from 'react';
import { CloseIcon } from './Icons.jsx';

// Accessible dialog: Escape and the backdrop close it, focus moves inside and returns afterwards.
// variant="drawer" slides in from the right (used for task details), otherwise a centred dialog.
export function Modal({ title, onClose, children, size = 'md', variant = 'center', headExtra = null }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const first = variant === 'drawer' ? null : dialogRef.current?.querySelector('input, select, textarea, button:not(.modal-close)');
    (first ?? dialogRef.current)?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll('button, input, select, textarea, a[href]')].filter((el) => !el.disabled);
        if (!focusable.length) return;
        const [firstEl, lastEl] = [focusable[0], focusable[focusable.length - 1]];
        if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [onClose, variant]);

  return (
    <div className={`modal-backdrop modal-backdrop-${variant}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal modal-${size} modal-${variant}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef} tabIndex={-1}>
        <div className="modal-head">
          {headExtra ?? <h2 id="modal-title">{title}</h2>}
          <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
