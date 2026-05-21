import React, { useState, useEffect } from 'react';
import { auth } from '../../config/firebase';
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const Profile = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setEmail(user.email || '');
        setDisplayName(user.displayName || '');
      }
    });
    return () => unsubscribe();
  }, []);

  const clearStatus = () => {
    setStatusMessage('');
    setStatusType('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    clearStatus();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setStatusMessage('Profile updated successfully.');
      setStatusType('success');
    } catch (error) {
      setStatusMessage(error.message || 'Unable to update profile.');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    clearStatus();
    if (!auth.currentUser) return;

    if (!currentPassword) {
      setStatusMessage('Enter your current password to change it.');
      setStatusType('error');
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage('New password must be at least 6 characters.');
      setStatusType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage('New password and confirmation do not match.');
      setStatusType('error');
      return;
    }

    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setStatusMessage('Password changed successfully.');
      setStatusType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatusMessage(error.message || 'Failed to change password.');
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '24px' }}>My Profile</h2>
      {statusMessage && (
        <div style={{
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          background: statusType === 'success' ? '#d1fae5' : '#fee2e2',
          color: statusType === 'success' ? '#166534' : '#991b1b'
        }}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} style={{ marginBottom: '32px' }}>
        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            className="input"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            className="input"
            value={email}
            readOnly
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '16px' }}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      <div style={{ marginTop: '16px' }}>
        <h3 style={{ marginBottom: '16px' }}>Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="input-group">
            <label>Current Password</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="Enter current password"
            />
          </div>
          <div className="input-group">
            <label>New Password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter new password"
              minLength={6}
            />
          </div>
          <div className="input-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-secondary" disabled={loading} style={{ width: '100%', marginTop: '16px' }}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
