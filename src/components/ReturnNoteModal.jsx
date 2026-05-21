import React, { useEffect, useState } from 'react';

const ReturnNoteModal = ({ isOpen, onClose, onSubmit, initialValue = '', loading = false }) => {
  const [note, setNote] = useState(initialValue);

  useEffect(() => {
    if (isOpen) setNote(initialValue || '');
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="glass-panel" style={{ padding: '24px', maxWidth: '540px', width: '100%', position: 'relative' }}>
        <button
          className="btn-icon"
          style={{ position: 'absolute', top: '12px', right: '12px' }}
          onClick={onClose}
          type="button"
        >
          ✕
        </button>

        <h2 style={{ marginBottom: '8px' }}>Return Note</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Add an optional comment about this returned item.</p>

        <textarea
          className="textarea"
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter return note (optional)"
          style={{ width: '100%', marginBottom: '16px' }}
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => onSubmit(note)} style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Saving...' : 'Mark Returned'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnNoteModal;
