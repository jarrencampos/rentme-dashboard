// js/pages/header.js - Header functionality (user display, logout)
import { db, doc, getDoc, onAuthStateChanged, auth } from '../firebase-config.js';
import { logOut } from '../auth-service.js';

function truncateText(text, maxLength = 30) {
  if (!text) return '';
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

function displayUserInfo(userInfo) {
  const nameDisplay = document.getElementById('fullName');
  const businessNameDisplay = document.getElementById('businessName');
  const profileImage = document.getElementById('profileImage');

  if (nameDisplay) nameDisplay.innerText = truncateText(userInfo.name);
  if (businessNameDisplay) businessNameDisplay.innerText = truncateText(userInfo.businessName);
  if (profileImage && userInfo.image) profileImage.src = userInfo.image;
}

async function getUserInfo(userId) {
  try {
    const userDoc = doc(db, 'vendors', userId);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      const userInfo = docSnap.data();
      displayUserInfo(userInfo);
    } else {
      console.log('No vendor document found');
    }
  } catch (error) {
    console.error('Error getting vendor document:', error);
  }
}

function initHeader() {
  // Setup logout button
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', async function() {
      this.disabled = true;
      await logOut();
      this.disabled = false;
    });
  }

  // Listen for auth state and load user info
  onAuthStateChanged(auth, (user) => {
    if (user) {
      getUserInfo(user.uid);
    }
  });
}

document.addEventListener('DOMContentLoaded', initHeader);
