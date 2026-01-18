// js/pages/signin-page.js - Sign In Page Logic
import { signIn, resetPassword, initAuthStateListener } from '../auth-service.js';

function initSignInPage() {
  // Only run on signin page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage !== 'signin.html') return;

  // Redirect if already signed in
  initAuthStateListener({
    redirectIfSignedIn: true,
    redirectIfSignedOut: false
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
        window.location.href = 'index.html';
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
