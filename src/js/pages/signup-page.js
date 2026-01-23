// js/pages/signup-page.js - Sign Up Page Logic
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  doc,
  setDoc
} from '../firebase-config.js';
import { initAuthStateListener } from '../auth-service.js';

const DEFAULT_PROFILE_IMAGES = [
  'https://firebasestorage.googleapis.com/v0/b/ryntit-b503c.appspot.com/o/defaults%2FdefaultProfileIcon1.png?alt=media&token=2b3f84aa-5e9d-4cae-b5ec-8374d39a396b',
  'https://firebasestorage.googleapis.com/v0/b/ryntit-b503c.appspot.com/o/defaults%2FdefaultProfileIcon2.png?alt=media&token=254bacd2-b243-4c94-aeaa-024228449772',
  'https://firebasestorage.googleapis.com/v0/b/ryntit-b503c.appspot.com/o/defaults%2FdefaultProfileIcon3.png?alt=media&token=bfdd993a-8cac-4e27-95e5-d7afb6d66dbb',
  'https://firebasestorage.googleapis.com/v0/b/ryntit-b503c.appspot.com/o/defaults%2FdefaultProfileIcon.png?alt=media&token=8d2318cf-b7da-4ac7-a11a-88736a044414'
];

function getRandomProfileImage() {
  const randomIndex = Math.floor(Math.random() * DEFAULT_PROFILE_IMAGES.length);
  return DEFAULT_PROFILE_IMAGES[randomIndex];
}

function getReferralCookie() {
  const match = document.cookie.match(/(?:^|;) ?referral=([^;]*)/);
  return match ? match[1] : null;
}

function setReferralCookie() {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref) {
    document.cookie = `referral=${ref}; path=/; max-age=2592000`; // 30 days
  }
}

// Send email notification for new vendor signup
async function sendVendorSignupNotification(vendorData) {
  console.log('Sending vendor signup notification email...');

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: `New Vendor Signup: ${vendorData.businessName || vendorData.name}`,
        message: `
A new vendor has signed up and is pending approval.

=== VENDOR DETAILS ===

Name: ${vendorData.name}
Email: ${vendorData.email}
Phone: ${vendorData.phone || 'Not provided'}
Business Name: ${vendorData.businessName || 'Not provided'}

=== BUSINESS INFO ===

Inventory Size: ${vendorData.inventoryCount || 'Not specified'}
Estimated Annual Revenue: ${vendorData.annualRevenue || 'Not specified'}
Primary Rental Category: ${vendorData.rentalCategory || 'Not specified'}
How They Found Us: ${vendorData.hearAboutUs || 'Not specified'}

=== ADDITIONAL INFO ===

Referral: ${vendorData.ref || 'None'}
Signup Date: ${new Date().toLocaleString()}
Vendor UID: ${vendorData.uid}

---
Please review this vendor in the admin dashboard.
        `.trim()
      }),
    });

    if (response.ok) {
      console.log('Vendor notification email sent successfully!');
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to send vendor notification email:', response.status, errorData);
    }
  } catch (error) {
    console.error('Error sending vendor notification (this is expected on localhost):', error);
    // Don't block signup if email fails
  }
}

function initSignUpPage() {
  // Only run on signup page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage !== 'signup.html') return;

  // Set referral cookie if present in URL
  setReferralCookie();

  // Redirect if already signed in
  initAuthStateListener({
    redirectIfSignedIn: true,
    redirectIfSignedOut: false
  });

  const createAccountForm = document.getElementById('createAccountForm');

  if (createAccountForm) {
    createAccountForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Get form elements
      const submitBtn = document.getElementById('submitBtn');
      const submitText = document.getElementById('submitText');
      const submitLoading = document.getElementById('submitLoading');

      // Collect form data
      const email = document.getElementById('email')?.value;
      const password = document.getElementById('password')?.value;
      const name = document.getElementById('name')?.value;
      const businessName = document.getElementById('businessName')?.value;
      const phone = document.getElementById('phone')?.value;
      const inventoryCount = document.getElementById('inventoryCount')?.value;
      const annualRevenue = document.getElementById('annualRevenue')?.value;
      const rentalCategory = document.getElementById('rentalCategory')?.value;
      const hearAboutUs = document.getElementById('hearAboutUs')?.value;
      const agreeTerms = document.getElementById('agreeTerms')?.checked;

      if (!email || !password || !name) {
        alert('Please fill in all required fields');
        return;
      }

      if (!agreeTerms) {
        alert('Please agree to the Terms of Service and Privacy Policy');
        return;
      }

      // Show loading state
      if (submitBtn && submitText && submitLoading) {
        submitBtn.disabled = true;
        submitText.classList.add('hidden');
        submitLoading.classList.remove('hidden');
      }

      try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Prepare vendor data
        const vendorData = {
          uid: user.uid,
          name: name,
          phone: phone || '',
          email: email,
          businessName: businessName || '',
          image: getRandomProfileImage(),
          ref: getReferralCookie(),
          pending_deposits: 0,
          total_bookings: 0,
          total_sales: 0,
          // Qualifying data
          inventoryCount: inventoryCount || '',
          annualRevenue: annualRevenue || '',
          rentalCategory: rentalCategory || '',
          hearAboutUs: hearAboutUs || '',
          // Status for manual approval
          status: 'pending_approval',
          createdAt: new Date().toISOString(),
        };

        // Save vendor information in Firestore
        const userDocRef = doc(db, 'vendors', user.uid);
        await setDoc(userDocRef, vendorData);

        // Send email notification (don't await - let it happen in background)
        sendVendorSignupNotification(vendorData);

        createAccountForm.reset();
        // Redirect to pending approval page instead of dashboard
        window.location.href = 'pending-approval.html';
      } catch (error) {
        console.error('Error signing up:', error);
        alert(error.message);

        // Reset button state
        if (submitBtn && submitText && submitLoading) {
          submitBtn.disabled = false;
          submitText.classList.remove('hidden');
          submitLoading.classList.add('hidden');
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initSignUpPage);
