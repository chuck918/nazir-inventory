import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();
console.log('parsing start');
try {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log('parsed successfully', sa.project_id);
} catch (e) {
  console.error('Parse error:', e.message);
}
