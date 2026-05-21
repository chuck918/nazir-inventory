import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set. Database operations will fail.");
}

const sql = neon(process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@ep-placeholder.neon.tech/neondb');
export const db = drizzle(sql, { schema });
