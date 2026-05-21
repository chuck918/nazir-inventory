import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { db } from './db/index.js';
import { items, requests, messages } from './db/schema.js';
import { verifyAdmin } from './middleware/auth.js';
import { eq } from 'drizzle-orm';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// --- PUBLIC ROUTES ---

// Get all inventory items
app.get('/api/items', async (req, res) => {
  try {
    const allItems = await db.select().from(items);
    res.json(allItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Submit a new request
app.post('/api/requests', async (req, res) => {
  try {
    const { id, itemId, clientName, clientEmail, notes, requestedQuantity = 1, date } = req.body;
    
    // Insert request
    await db.insert(requests).values({
      id,
      itemId,
      clientName,
      clientEmail,
      notes,
      requestedQuantity,
      date: new Date(date)
    });

    // Auto-decrement item quantity
    const item = await db.select().from(items).where(eq(items.id, itemId));
    if (item.length > 0 && item[0].quantity >= requestedQuantity) {
      await db.update(items)
        .set({ quantity: item[0].quantity - requestedQuantity })
        .where(eq(items.id, itemId));
    }

    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});

// Submit a contact message
app.post('/api/messages', async (req, res) => {
  try {
    const { id, clientName, email, content, date } = req.body;
    await db.insert(messages).values({
      id,
      clientName,
      email,
      content,
      date: new Date(date)
    });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// --- PROTECTED ADMIN ROUTES ---
// All routes below require Firebase Auth Token

app.use('/api/admin', verifyAdmin);

// Add Admin endpoint - creates a new admin user via Firebase Admin SDK
app.post('/api/admin/create-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    // Create user with admin SDK; does not sign them in automatically
    const userRecord = await admin.auth().createUser({ email, password });
    // Optionally set custom claim to mark as admin (if you use claims)
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    res.status(201).json({ success: true, uid: userRecord.uid });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Add item
app.post('/api/admin/items', async (req, res) => {
  try {
    const { id, name, description, quantity, image, category } = req.body;
    await db.insert(items).values({ id, name, description, quantity, image, category: category || 'Others' });
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update item
app.put('/api/admin/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, quantity, image, category } = req.body;

    const existingItem = await db.select().from(items).where(eq(items.id, id));
    if (existingItem.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const updatedImage = req.body.hasOwnProperty('image') ? image : existingItem[0].image;

    await db.update(items)
      .set({ name, description, quantity, image: updatedImage, category: category || 'Others' })
      .where(eq(items.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
app.delete('/api/admin/items/:id', async (req, res) => {
  try {
    await db.delete(items).where(eq(items.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Get all requests
app.get('/api/admin/requests', async (req, res) => {
  try {
    const allRequests = await db.select().from(requests);
    res.json(allRequests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Update request status
app.put('/api/admin/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, timestampKey, timestampValue } = req.body;
    const { returnComment } = req.body;
    
    // Fetch request to check if item quantity needs reverting
    const reqData = await db.select().from(requests).where(eq(requests.id, id));
    if (reqData.length === 0) return res.status(404).json({ error: 'Request not found' });
    
    const request = reqData[0];

    // If changing to rejected or returned, put item back into stock by the requested quantity
    if (request.status !== status && (status === 'rejected' || status === 'returned')) {
      const item = await db.select().from(items).where(eq(items.id, request.itemId));
      if (item.length > 0) {
        const returnedQuantity = request.requestedQuantity || request.requested_quantity || 1;
        await db.update(items)
          .set({ quantity: item[0].quantity + returnedQuantity })
          .where(eq(items.id, request.itemId));
      }
    }

    const updateData = { status };
    if (timestampKey && timestampValue) {
      updateData[timestampKey] = new Date(timestampValue);
    }
    if (status === 'returned' && returnComment) {
      updateData.returned_note = returnComment;
    }

    await db.update(requests).set(updateData).where(eq(requests.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Get all messages
app.get('/api/admin/messages', async (req, res) => {
  try {
    const allMessages = await db.select().from(messages);
    res.json(allMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Mark message as read
app.put('/api/admin/messages/:id/read', async (req, res) => {
  try {
    await db.update(messages).set({ read: true }).where(eq(messages.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
