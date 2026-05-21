import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { X } from 'lucide-react';

const RequestModal = ({ item, onClose }) => {
  const { addRequest } = useInventory();
  const [formData, setFormData] = useState({ clientName: '', clientEmail: '', notes: '', quantity: 1 });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.quantity < 1 || formData.quantity > item.quantity) {
      return;
    }
    addRequest(item.id, formData.clientName, formData.clientEmail, formData.notes, formData.quantity);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-panel modal-content" style={{ padding: '32px', position: 'relative' }}>
        <button className="btn-icon" style={{ position: 'absolute', top: '16px', right: '16px' }} onClick={onClose}>
          <X size={20} />
        </button>
        
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <h2 className="text-gradient" style={{ marginBottom: '16px' }}>Request Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>We'll review your request for <strong>{item.name}</strong> and get back to you soon.</p>
          </div>
        ) : (
          <>
            <h2 style={{ marginBottom: '8px' }}>Request Item</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              You are requesting: <strong style={{ color: 'var(--text-primary)' }}>{item.name}</strong>
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  className="input" 
                  required 
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input" 
                  required 
                  value={formData.clientEmail}
                  onChange={e => setFormData({...formData, clientEmail: e.target.value})}
                  placeholder="john@example.com"
                />
              </div>
              <div className="input-group">
                <label>Quantity Requested</label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  max={item.quantity}
                  required
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: Math.max(1, Math.min(item.quantity, parseInt(e.target.value, 10) || 1)) })}
                />
                <small style={{ color: 'var(--text-secondary)' }}>Available: {item.quantity}</small>
              </div>
              <div className="input-group">
                <label>Additional Notes (Optional)</label>
                <textarea 
                  className="textarea" 
                  rows="3"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Why do you need this item?"
                ></textarea>
              </div>
              
              <div className="flex justify-between" style={{ marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={item.quantity === 0}>
                  {item.quantity === 0 ? 'Out of Stock' : 'Submit Request'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestModal;
