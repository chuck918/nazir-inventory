import React, { useState, useRef, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, ArrowLeft } from 'lucide-react';

const ItemForm = () => {
  const { items, addItem, updateItem } = useInventory();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const categoryOptions = ['Beverages', 'Electronics', 'Props', 'Furniture', 'Tissues', 'Others'];
  const [formData, setFormData] = useState({ name: '', description: '', quantity: 1, image: '', category: 'Beverages', customCategory: '' });
  const [imageChanged, setImageChanged] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      const itemToEdit = items.find(i => i.id === id);
      if (itemToEdit) {
        const isKnownCategory = categoryOptions.includes(itemToEdit.category);
        setFormData({
          name: itemToEdit.name,
          description: itemToEdit.description,
          quantity: itemToEdit.quantity,
          image: itemToEdit.image || '',
          category: isKnownCategory ? itemToEdit.category : 'Others',
          customCategory: isKnownCategory ? '' : itemToEdit.category || ''
        });
        setImageChanged(false);
      } else {
        // Item not found, redirect back
        navigate('/admin/inventory');
      }
    }
  }, [id, items, isEditing, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedPayload = {
      ...formData,
      category: formData.category === 'Others' ? formData.customCategory.trim() || 'Others' : formData.category
    };

    if (isEditing) {
      // Editing an existing item – send a PUT request. If the image hasn't changed, omit it.
      if (!imageChanged) {
        const { image, ...payloadWithoutImage } = normalizedPayload;
        updateItem(id, payloadWithoutImage);
      } else {
        updateItem(id, normalizedPayload);
      }
    } else {
      // Adding a new item – send a POST request via addItem.
      addItem(normalizedPayload);
    }
    navigate('/admin/inventory');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8 MB

    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image is too large. Please upload images under 8 MB.');
      setFormData(prev => ({ ...prev, image: '' }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImageChanged(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
      setImageChanged(true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button 
        className="btn-icon" 
        style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}
        onClick={() => navigate('/admin/inventory')}
      >
        <ArrowLeft size={16} /> Back to Inventory
      </button>

      <div className="panel" style={{ padding: '32px' }}>
        <h2 style={{ marginBottom: '24px' }}>{isEditing ? 'Edit Item' : 'Add New Item'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Item Name</label>
            <input 
              type="text" 
              className="input" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <label>Category</label>
            <select
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {categoryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {formData.category === 'Others' && (
            <div className="input-group">
              <label>Custom Category</label>
              <input
                type="text"
                className="input"
                required
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                placeholder="Enter custom category"
              />
            </div>
          )}

          <div className="input-group">
            <label>Quantity in Stock</label>
            <input 
              type="number" 
              className="input" 
              min="0"
              required 
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: parseInt(e.target.value, 10) || 0})}
            />
          </div>
          
          <div className="input-group">
            <label>Description</label>
            <textarea 
              className="textarea" 
              rows="4"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          
          <div className="input-group">
            <label>Image</label>
            <input 
              type="file" 
              accept="image/*"
              className="input" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              style={{ padding: '8px' }}
            />
            {formData.image && (
              <div style={{ marginTop: '12px', position: 'relative', width: '200px', height: '200px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  className="btn-icon" 
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white' }}
                  onClick={() => {
                    setFormData(prev => ({...prev, image: ''}));
                    if(fileInputRef.current) fileInputRef.current.value = '';
                    setImageChanged(true);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>
            {isEditing ? 'Save Changes' : 'Add Item to Inventory'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
