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
    const { vendorId, email, businessName } = req.body;

    if (!vendorId || !email) {
      return res.status(400).json({ error: 'Missing required fields: vendorId, email' });
    }

    // Check if vendor already has a Stripe Connect account
    const vendorDoc = await db.collection('vendors').doc(vendorId).get();

    if (!vendorDoc.exists) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendorData = vendorDoc.data();
    let stripeAccountId = vendorData.stripeAccountId;

    // If no Stripe account exists, create one
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: email,
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: businessName || vendorData.businessName,
          mcc: '7394', // Equipment Rental
        },
        metadata: {
          vendorId: vendorId,
        },
      });

      stripeAccountId = account.id;

      // Save Stripe account ID to vendor document
      await db.collection('vendors').doc(vendorId).update({
        stripeAccountId: stripeAccountId,
        stripeOnboardingComplete: false,
      });
    }

    // Create an account link for onboarding
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BASE_URL || 'http://localhost:3000';

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/payments.html?stripe_refresh=true`,
      return_url: `${baseUrl}/payments.html?stripe_onboarding=complete`,
      type: 'account_onboarding',
    });

    return res.status(200).json({
      success: true,
      url: accountLink.url,
      accountId: stripeAccountId,
    });

  } catch (error) {
    console.error('Stripe Connect account creation error:', error);
    return res.status(500).json({
      error: 'Failed to create Stripe Connect account',
      details: error.message
    });
  }
}
