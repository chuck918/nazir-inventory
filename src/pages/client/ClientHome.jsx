import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { motion } from 'framer-motion';
import ItemCard from '../../components/ItemCard';
import RequestModal from '../../components/RequestModal';
import { Search, Package, X } from 'lucide-react';

const ClientHome = () => {
  const { items } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Get unique categories from items
  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category || 'Others').filter(Boolean));
    return Array.from(cats).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || (item.category || 'Others') === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <div className="animate-fade-in">
      <div className="client-home-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Available Items</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Browse and request inventory items</p>
        </div>
        
        <div className="search-container">
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: 'var(--text-secondary)' }}>
            <Search size={16} />
          </div>
          <input 
            type="text" 
            className="input" 
            placeholder="Search..." 
            style={{ width: '100%', paddingLeft: '36px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Filter by:</span>
          <button
            className={`badge ${!selectedCategory ? 'available' : 'unavailable'}`}
            onClick={() => setSelectedCategory(null)}
            style={{ cursor: 'pointer' }}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`badge ${selectedCategory === category ? 'available' : 'unavailable'}`}
              onClick={() => setSelectedCategory(category)}
              style={{ cursor: 'pointer' }}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Package size={48} color="var(--text-secondary)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Inventory is Empty</h4>
          <p style={{ color: 'var(--text-secondary)' }}>No items have been added to the inventory yet.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="panel" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No matches found</h4>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search query.</p>
        </div>
      ) : (
        <motion.div 
          className="bento-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredItems.map(item => (
            <motion.div key={item.id} variants={itemVariants}>
              <ItemCard item={item} onRequest={setSelectedItem} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Modals */}
      {selectedItem && (
        <RequestModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
};

export default ClientHome;
