import { useEffect } from 'react';
import { CheckIcon, AlertIcon } from './Icons.jsx';

export function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onDone, 3500);
    return () => clearTimeout(id);
  }, [toast, onDone]);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className={`toast toast-${toast.tone}`}>
          {toast.tone === 'error' ? <AlertIcon size={18} /> : <CheckIcon size={18} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
