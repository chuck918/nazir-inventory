import { pgTable, serial, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const items = pgTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  quantity: integer('quantity').default(0).notNull(),
  image: text('image'),
  category: text('category').default('Others').notNull(),
});

export const requests = pgTable('requests', {
  id: text('id').primaryKey(),
  itemId: text('item_id').references(() => items.id).notNull(),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  notes: text('notes'),
  requestedQuantity: integer('requested_quantity').default(1).notNull(),
  status: text('status').default('pending').notNull(), // pending, approved, rejected, returned
  date: timestamp('date').defaultNow().notNull(),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  returnedAt: timestamp('returned_at'),
  returnedNote: text('returned_note'),
});

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  clientName: text('client_name').notNull(),
  email: text('email').notNull(),
  content: text('content').notNull(),
  read: boolean('read').default(false).notNull(),
  date: timestamp('date').defaultNow().notNull(),
});
