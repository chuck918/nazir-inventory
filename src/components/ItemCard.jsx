import React from 'react';
import { motion } from 'framer-motion';

const ItemCard = ({ item, onRequest }) => {
  const isAvailable = item.quantity > 0;

  return (
    <motion.div 
      className="panel item-card" 
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'default', height: '420px' }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', background: '#f3f4f6' }}>
        {item.image ? (
          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            No Image
          </div>
        )}
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <span className={`badge ${isAvailable ? 'available' : 'unavailable'}`}>
            {isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{item.name}</h3>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Qty: {item.quantity}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Category:</span>
        <span className="badge available" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
          {item.category || 'Others'}
        </span>
      </div>
      
      <p style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '0.95rem', 
        flexGrow: 1,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        margin: 0
      }}>
        {item.description}
      </p>
      
      <button 
        className="btn btn-secondary" 
        style={{ width: '100%', marginTop: 'auto', opacity: isAvailable ? 1 : 0.5, cursor: isAvailable ? 'pointer' : 'not-allowed' }}
        onClick={() => isAvailable && onRequest(item)}
        disabled={!isAvailable}
      >
        Request Item
      </button>
    </motion.div>
  );
};

export default ItemCard;
