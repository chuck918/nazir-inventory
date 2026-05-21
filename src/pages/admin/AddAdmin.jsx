import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { auth } from '../../config/firebase';

const CredentialModal = ({ email, password, onClose }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
      alert('Credentials copied to clipboard');
    } catch (err) {
      alert('Copy failed. Please copy manually.');
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="glass-panel" style={{ padding: '28px', maxWidth: '480px', width: '100%', position: 'relative' }}>
        <button
          className="btn-icon"
          style={{ position: 'absolute', top: '16px', right: '16px' }}
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
        <h2 style={{ marginBottom: '16px' }}>Admin Created</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Share these credentials with the new admin. They will need them to log in.
        </p>
        <div style={{ border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '16px', marginBottom: '20px', background: '#ffffff' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Email</p>
          <p style={{ margin: 0, wordBreak: 'break-all' }}>{email}</p>
          <p style={{ margin: '16px 0 8px', fontWeight: 600 }}>Password</p>
          <p style={{ margin: 0, wordBreak: 'break-all' }}>{password}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handleCopy} style={{ flex: 1 }}>
            Copy Credentials
          </button>
        </div>
      </div>
    </div>
  );
};

const AddAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdAdmin, setCreatedAdmin] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Get Firebase ID token for auth
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create admin');
      setSuccess('Admin account created successfully');
      setCreatedAdmin({ email, password });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>Add New Admin</h2>
      {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
      {success && <p style={{ color: 'var(--success-color)' }}>{success}</p>}
      {createdAdmin && (
        <CredentialModal
          email={createdAdmin.email}
          password={createdAdmin.password}
          onClose={() => setCreatedAdmin(null)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group" style={{ marginTop: '12px' }}>
          <label>Password</label>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 12px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              style={{ border: 'none', background: 'transparent', padding: '12px 0', width: '100%' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>
          Create Admin
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;
