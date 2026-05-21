import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Send, CheckCircle } from 'lucide-react';

const ContactAdmin = () => {
  const { addMessage } = useInventory();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    addMessage(formData.name, formData.email, formData.message);
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="panel" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Contact Administrator</h2>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '24px' }}>
        Have questions about the inventory or need a special request? Send us a message.
      </p>
      
      {submitted ? (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 0' }}>
          <CheckCircle size={48} color="var(--success-color)" />
          <h3 className="text-gradient">Message Sent!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>We'll get back to you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="animate-fade-in">
          <div className="input-group">
            <label>Name</label>
            <input 
              type="text" 
              className="input" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Your Name"
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              className="input" 
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="your@email.com"
            />
          </div>
          <div className="input-group">
            <label>Message</label>
            <textarea 
              className="textarea" 
              rows="4"
              required
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              placeholder="How can we help?"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            <Send size={18} /> Send Message
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactAdmin;
