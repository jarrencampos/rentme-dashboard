import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Format private key - handle different formats from Vercel
function formatPrivateKey(key) {
  if (!key) return key;
  let formatted = key.replace(/\\n/g, '\n');
  if (!formatted.includes('\n')) {
    formatted = formatted.replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n');
    formatted = formatted.replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
  }
  return formatted;
}

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  });
}

/**
 * Verifies the Firebase Auth token from the Authorization header.
 * Optionally checks that the token's uid matches a vendorId.
 *
 * @param {object} req - The request object
 * @param {string} [vendorId] - If provided, verifies uid === vendorId
 * @returns {object} The decoded token
 * @throws {object} { status, message } on failure
 */
export async function verifyAuth(req, vendorId) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw { status: 401, message: 'Missing or invalid Authorization header' };
  }

  const token = authHeader.split('Bearer ')[1];

  let decoded;
  try {
    decoded = await getAuth().verifyIdToken(token);
  } catch (error) {
    throw { status: 401, message: 'Invalid or expired token' };
  }

  if (vendorId && decoded.uid !== vendorId) {
    throw { status: 403, message: 'Token UID does not match vendorId' };
  }

  return decoded;
}
