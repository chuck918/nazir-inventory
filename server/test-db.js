import { db } from './db/index.js';
import { items } from './db/schema.js';

async function test() {
  try {
    const allItems = await db.select().from(items);
    console.log('Items:', allItems);
  } catch (e) {
    console.error('DB Error:', e.message);
  }
}
test();
