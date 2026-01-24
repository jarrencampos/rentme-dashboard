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

    // If no Stripe account exists
    if (!stripeAccountId) {
      return res.status(200).json({
        hasStripeAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        balance: null,
      });
    }

    // Get Stripe account details
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // Get account balance
    let balance = null;
    if (account.charges_enabled) {
      try {
        const balanceData = await stripe.balance.retrieve({
          stripeAccount: stripeAccountId,
        });
        balance = {
          available: balanceData.available.reduce((sum, b) => sum + b.amount, 0) / 100,
          pending: balanceData.pending.reduce((sum, b) => sum + b.amount, 0) / 100,
          currency: balanceData.available[0]?.currency || 'usd',
        };
      } catch (balanceError) {
        console.error('Error fetching balance:', balanceError);
      }
    }

    // Update vendor document if onboarding is complete
    const onboardingComplete = account.charges_enabled && account.payouts_enabled;
    if (onboardingComplete && !vendorData.stripeOnboardingComplete) {
      await db.collection('vendors').doc(vendorId).update({
        stripeOnboardingComplete: true,
      });
    }

    return res.status(200).json({
      hasStripeAccount: true,
      accountId: stripeAccountId,
      onboardingComplete: onboardingComplete,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements,
      balance: balance,
      defaultCurrency: account.default_currency,
    });

  } catch (error) {
    console.error('Stripe account status error:', error);
    return res.status(500).json({
      error: 'Failed to get Stripe account status',
      details: error.message
    });
  }
}
