import { useState } from 'react';
import { Modal } from './Modal.jsx';

export function ConfirmDelete({ task, onConfirm, onClose }) {
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <Modal title="Delete task?" onClose={onClose} size="sm">
      {error && <div className="banner banner-error" role="alert">{error}</div>}
      <p className="confirm-text">
        <strong>{task.title}</strong> ({task.sourceId}) will be permanently removed from the {task.source === 'crm' ? 'CRM' : 'Helpdesk'}.
      </p>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Delete task'}
        </button>
      </div>
    </Modal>
  );
}
