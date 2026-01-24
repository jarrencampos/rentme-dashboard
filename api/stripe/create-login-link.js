import Stripe from 'stripe';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({ error: 'Missing required field: vendorId' });
    }

    // Get vendor document
    const vendorDoc = await db.collection('vendors').doc(vendorId).get();

    if (!vendorDoc.exists) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendorData = vendorDoc.data();
    const stripeAccountId = vendorData.stripeAccountId;

    if (!stripeAccountId) {
      return res.status(400).json({ error: 'Vendor does not have a Stripe Connect account' });
    }

    // Create a login link for the Express dashboard
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

    return res.status(200).json({
      success: true,
      url: loginLink.url,
    });

  } catch (error) {
    console.error('Stripe login link error:', error);
    return res.status(500).json({
      error: 'Failed to create Stripe dashboard link',
      details: error.message
    });
  }
}
