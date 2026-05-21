import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

// We need a Firebase Service Account Key JSON to initialize the admin SDK
// For now, we will gracefully handle its absence so the server can start
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();

    if ((raw.startsWith("'") && raw.endsWith("'")) ||
        (raw.startsWith('"') && raw.endsWith('"'))) {
      raw = raw.slice(1, -1);
    }

    const normalizeMultilineString = (json) => {
      let inString = false;
      let escaped = false;
      let result = '';

      for (let i = 0; i < json.length; i += 1) {
        const ch = json[i];

        if (escaped) {
          result += ch;
          escaped = false;
          continue;
        }

        if (ch === '\\') {
          escaped = true;
          result += ch;
          continue;
        }

        if (ch === '"') {
          inString = !inString;
          result += ch;
          continue;
        }

        if (inString && (ch === '\n' || ch === '\r')) {
          result += '\\n';
          continue;
        }

        result += ch;
      }

      return result;
    };

    const normalized = normalizeMultilineString(raw);
    const serviceAccount = JSON.parse(normalized);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    console.warn("WARNING: FIREBASE_SERVICE_ACCOUNT is not set. Auth middleware will block all requests.");
  }
} catch (error) {
  console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error);
}

export const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(403).json({ error: 'Unauthorized: Invalid token' });
  }
};
