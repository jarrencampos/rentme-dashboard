// js/auth-service.js - Centralized Authentication Service
import {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  doc,
  getDoc,
  setDoc
} from './firebase-config.js';

// Pages that don't require authentication
const PUBLIC_PAGES = ['signin.html', 'signup.html', 'login.html', 'terms.html', 'privacy.html'];

// Get current page name
function getCurrentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

// Check if current page is public
function isPublicPage() {
  return PUBLIC_PAGES.includes(getCurrentPage());
}

// Redirect to sign in
function redirectToSignIn() {
  if (!isPublicPage()) {
    window.location.href = 'signin.html';
  }
}

// Redirect to dashboard
function redirectToDashboard() {
  const currentPage = getCurrentPage();
  if (PUBLIC_PAGES.includes(currentPage) && currentPage !== 'terms.html' && currentPage !== 'privacy.html') {
    window.location.href = 'index.html';
  }
}

// Initialize auth state listener
export function initAuthStateListener(options = {}) {
  const { onSignedIn, onSignedOut, redirectIfSignedOut = true, redirectIfSignedIn = false } = options;

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("User signed in:", user.uid);
      if (onSignedIn) await onSignedIn(user);
      if (redirectIfSignedIn) redirectToDashboard();
    } else {
      console.log("No user signed in");
      if (onSignedOut) onSignedOut();
      if (redirectIfSignedOut && !isPublicPage()) redirectToSignIn();
    }
  });
}

// Sign in with email and password
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: error.message };
  }
}

// Sign up with email and password
export async function signUp(email, password, vendorData = {}) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create vendor document
    await setDoc(doc(db, "vendors", user.uid), {
      email: user.email,
      created_at: new Date(),
      total_sales: 0,
      total_bookings: 0,
      ...vendorData
    });

    return { success: true, user };
  } catch (error) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message };
  }
}

// Sign out
export async function logOut() {
  try {
    await signOut(auth);
    window.location.href = 'signin.html';
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return { success: false, error: error.message };
  }
}

// Send password reset email
export async function resetPassword(email) {
  try {
    const actionCodeSettings = {
      url: window.location.origin + '/signin.html',
      handleCodeInApp: false
    };
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: error.message };
  }
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Get vendor data for current user
export async function getVendorData(uid) {
  try {
    const docSnap = await getDoc(doc(db, "vendors", uid));
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "No vendor profile found" };
  } catch (error) {
    console.error("Error getting vendor data:", error);
    return { success: false, error: error.message };
  }
}

// Export auth instance for direct access if needed
export { auth };
