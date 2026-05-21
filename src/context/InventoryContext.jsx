import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { auth } from '../config/firebase';
import { API_URL } from '../config/api';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);

  // Admin routes need the token
  const getAuthToken = async () => {
    if (auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  };

  const getHeaders = async () => {
    const token = await getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API_URL}/items`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch items');

      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([]); // Fallback to empty array to prevent crashes
    }
  };

  const fetchAdminData = async () => {
    try {
      const headers = await getHeaders();
      const [reqsRes, msgsRes] = await Promise.all([
        fetch(`${API_URL}/admin/requests`, { headers }),
        fetch(`${API_URL}/admin/messages`, { headers })
      ]);
      const reqsData = await reqsRes.json();
      const msgsData = await msgsRes.json();

      if (!reqsData.error) setRequests(reqsData);
      if (!msgsData.error) setMessages(msgsData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchItems();
  }, []);

  // Observers for admin data: When user logs in as admin, fetch admin data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAdminData();
      } else {
        setRequests([]);
        setMessages([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Actions
  const addItem = async (itemData) => {
    try {
      const newItem = { ...itemData, id: uuidv4() };
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/admin/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newItem)
      });
      if (!res.ok) throw new Error('Failed to add item');
      setItems((prev) => [...prev, newItem]);
      toast.success('Item added to inventory');
    } catch (error) {
      toast.error('Error adding item');
    }
  };

  const updateItem = async (id, updatedData) => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/admin/items/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update item');
      setItems((prev) => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
      toast.success('Item updated successfully');
    } catch (error) {
      toast.error('Error updating item');
    }
  };

  const deleteItem = async (id) => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/admin/items/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete item');
      setItems((prev) => prev.filter(item => item.id !== id));
      toast.success('Item deleted from inventory');
    } catch (error) {
      toast.error('Error deleting item');
    }
  };

  const addRequest = async (itemId, clientName, clientEmail, notes, requestedQuantity = 1) => {
    try {
      const newRequest = {
        id: uuidv4(),
        itemId,
        clientName,
        clientEmail,
        notes,
        requestedQuantity,
        status: 'pending',
        date: new Date().toISOString()
      };
      const res = await fetch(`${API_URL}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      if (!res.ok) throw new Error('Failed to submit request');

      // Update local state optimistically
      setItems((prevItems) => prevItems.map(item => {
        if (item.id === itemId && item.quantity >= requestedQuantity) {
          return { ...item, quantity: item.quantity - requestedQuantity };
        }
        return item;
      }));
      toast.success('Item requested and reserved');
    } catch (error) {
      toast.error('Error submitting request');
    }
  };

  const updateRequestStatus = async (id, status, returnComment = null) => {
    try {
      const timestampKey = status + 'At'; // e.g. approvedAt, returnedAt, rejectedAt
      const timestampValue = new Date().toISOString();
      const headers = await getHeaders();

      const res = await fetch(`${API_URL}/admin/requests/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status, timestampKey, timestampValue, returnComment })
      });
      if (!res.ok) throw new Error('Failed to update request');

      const req = requests.find(r => r.id === id);
      if (req && req.status !== status && (status === 'rejected' || status === 'returned')) {
        const returnedQuantity = req.requestedQuantity || 1;
        setItems(currentItems => currentItems.map(item => {
          if (item.id === req.itemId) {
            return { ...item, quantity: item.quantity + returnedQuantity };
          }
          return item;
        }));
      }

      setRequests((prev) => prev.map(r => {
        if (r.id !== id) return r;
        const updatedRequest = { ...r, status, [timestampKey]: timestampValue };
        if (status === 'returned' && returnComment) {
          updatedRequest.returnedNote = returnComment;
          updatedRequest.returned_note = returnComment;
        }
        return updatedRequest;
      }));
      toast.success(`Request marked as ${status}`);
    } catch (error) {
      toast.error('Error updating request');
    }
  };

  const addMessage = async (clientName, email, content) => {
    try {
      const newMessage = { id: uuidv4(), clientName, email, content, date: new Date().toISOString() };
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      if (!res.ok) throw new Error('Failed to send message');
      toast.success('Message sent successfully');
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const markMessageRead = async (id) => {
    try {
      const headers = await getHeaders();
      const res = await fetch(`${API_URL}/admin/messages/${id}/read`, {
        method: 'PUT',
        headers
      });
      if (!res.ok) throw new Error('Failed to mark message read');
      setMessages((prev) => prev.map(msg => msg.id === id ? { ...msg, read: true } : msg));
    } catch (error) {
      console.error('Error updating message', error);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        items,
        requests,
        messages,
        addItem,
        updateItem,
        deleteItem,
        addRequest,
        updateRequestStatus,
        addMessage,
        markMessageRead
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
