// js/pages/signin-page.js - Sign In Page Logic
import { signIn, resetPassword, initAuthStateListener, getVendorData } from '../auth-service.js';

function initSignInPage() {
  // Only run on signin page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage !== 'signin.html') return;

  // Redirect if already signed in - check approval status first
  initAuthStateListener({
    redirectIfSignedIn: false,
    redirectIfSignedOut: false,
    onSignedIn: async (user) => {
      // User is already signed in, check their status and redirect
      const vendorResult = await getVendorData(user.uid);
      if (vendorResult.success && vendorResult.data.status === 'pending_approval') {
        window.location.href = 'pending-approval.html';
      } else {
        window.location.href = 'index.html';
      }
    }
  });

  const loginButton = document.getElementById('loginButton');
  const forgotPasswordButton = document.getElementById('forgotPasswordButton');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const messageEl = document.getElementById('message');

  if (loginButton) {
    loginButton.addEventListener('click', async (event) => {
      event.preventDefault();

      const email = document.getElementById('loginEmail')?.value;
      const password = document.getElementById('signInPassword')?.value;

      if (!email || !password) {
        if (messageEl) messageEl.textContent = 'Please enter email and password';
        return;
      }

      if (loadingIndicator) loadingIndicator.style.display = 'block';
      loginButton.disabled = true;

      const result = await signIn(email, password);

      if (result.success) {
        if (messageEl) messageEl.textContent = 'Login successful!';

        // Check vendor approval status before redirecting
        const vendorResult = await getVendorData(result.user.uid);
        console.log('Vendor status check:', vendorResult);

        if (vendorResult.success && vendorResult.data.status === 'pending_approval') {
          console.log('Redirecting to pending approval page');
          window.location.href = 'pending-approval.html';
          return; // Prevent any further execution
        } else {
          console.log('Redirecting to dashboard');
          window.location.href = 'index.html';
          return;
        }
      } else {
        if (messageEl) messageEl.textContent = 'Error: ' + result.error;
      }

      if (loadingIndicator) loadingIndicator.style.display = 'none';
      loginButton.disabled = false;
    });
  }

  if (forgotPasswordButton) {
    forgotPasswordButton.addEventListener('click', async (event) => {
      event.preventDefault();

      const email = prompt('Please enter your email address:');
      if (!email) {
        if (window.Swal) {
          Swal.fire({
            title: 'Oops!',
            text: 'Email address is required.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        }
        return;
      }

      const result = await resetPassword(email);

      if (window.Swal) {
        if (result.success) {
          Swal.fire({
            title: 'Success!',
            text: 'Password reset email sent! Check your inbox.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: result.error,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initSignInPage);
