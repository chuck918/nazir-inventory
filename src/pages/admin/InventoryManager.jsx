import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Edit2, Trash2, PlusCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InventoryManager = () => {
  const { items, deleteItem } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Inventory Manager</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your catalog and stock levels.</p>
        </div>
        
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/admin/add-item')}>
          <PlusCircle size={18} />
          Add New Item
        </button>
      </div>

      <div style={{ marginBottom: '24px', position: 'relative', maxWidth: '400px' }}>
        <input 
          type="text" 
          className="input" 
          placeholder="Search items..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '40px' }}
        />
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
      </div>

      <div className="panel table-container">
        {items.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No items in inventory. Add one to get started.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Item Details</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Stock</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '10px', color: '#64748b' }}>No img</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{item.name}</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span className="badge" style={{ background: '#e2e8f0', color: '#334155' }}>{item.category || 'Other'}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '250px', marginTop: '6px' }}>
                      {item.description || 'No description'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.quantity > 0 ? 'available' : 'unavailable'}`}>
                      {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '500' }}>
                    {item.quantity}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        className="btn-icon" 
                        title="Edit Item"
                        onClick={() => navigate(`/admin/edit-item/${item.id}`)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-icon" 
                        title="Delete Item"
                        style={{ color: 'var(--danger-color)' }}
                        onClick={() => {
                          if(window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                            deleteItem(item.id);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;
