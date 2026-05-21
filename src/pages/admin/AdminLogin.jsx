import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  // Sign‑up toggle removed; login only
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
      
      sessionStorage.setItem('admin_auth', 'true');
      // Firebase auth state observer in DashboardLayout will handle the session
      navigate('/admin/inventory');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
      <div className="panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ background: '#f3f4f6', padding: '16px', borderRadius: '50%' }}>
            <Lock size={32} color="var(--text-primary)" />
          </div>
        </div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Admin Portal</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>Enter your credentials to access the dashboard.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 12px' }}>
              <Mail size={18} color="var(--text-secondary)" style={{ marginRight: '8px' }} />
              <input 
                type="email" 
                className="input" 
                style={{ border: 'none', background: 'transparent', padding: '12px 0', width: '100%' }}
                autoFocus
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0 12px' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                style={{ border: 'none', background: 'transparent', padding: '12px 0', width: '100%' }}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
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
          
          {error && <p style={{ color: 'var(--danger-color)', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>}
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Processing...' : 'Login to Dashboard'}
          </button>
        </form>
        
        {/* <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>To add a new admin, use the <strong>Add Admin</strong> page after logging in.</p>
        </div> */}
      </div>
    </div>
  );
};

export default AdminLogin;
