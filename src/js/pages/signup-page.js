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

      const email = document.getElementById('email')?.value;
      const password = document.getElementById('password')?.value;
      const name = document.getElementById('name')?.value;
      const businessName = document.getElementById('businessName')?.value;
      const phone = document.getElementById('phone')?.value;

      if (!email || !password || !name) {
        alert('Please fill in all required fields');
        return;
      }

      try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save vendor information in Firestore
        const userDocRef = doc(db, 'vendors', user.uid);
        await setDoc(userDocRef, {
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
        });

        createAccountForm.reset();
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Error signing up:', error);
        alert(error.message);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initSignUpPage);
