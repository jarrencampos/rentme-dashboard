// js/pages/pending-approval-page.js - Pending Approval Page Logic
import { auth, signOut, onAuthStateChanged } from '../firebase-config.js';

function initPendingApprovalPage() {
  // Only run on pending-approval page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (currentPage !== 'pending-approval.html') return;

  // Check if user is logged in
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = 'signin.html';
    }
  });

  // Sign out button
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        window.location.href = 'signin.html';
      } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
      }
    });
  }

  // Switch account button - sign out and redirect to sign in
  const switchAccountBtn = document.getElementById('switchAccountBtn');
  if (switchAccountBtn) {
    switchAccountBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = 'signin.html';
      } catch (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initPendingApprovalPage);
