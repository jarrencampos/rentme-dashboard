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

  // Set Visit Shop and Share Shop URLs
  const vendorUrl = userInfo.url;
  if (!vendorUrl) return;
  const shopUrl = `https://rentme.co/${vendorUrl}`;
  const shopName = userInfo.businessName || userInfo.name || 'my shop';
  const shareText = `Check out ${shopName} on RentMe!`;

  const visitShopLink = document.getElementById('visitShopLink');
  if (visitShopLink) visitShopLink.href = shopUrl;

  const shareFacebook = document.getElementById('shareFacebook');
  if (shareFacebook) shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shopUrl)}`;

  const shareTwitter = document.getElementById('shareTwitter');
  if (shareTwitter) shareTwitter.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shopUrl)}&text=${encodeURIComponent(shareText)}`;

  const shareInstagram = document.getElementById('shareInstagram');
  if (shareInstagram) shareInstagram.href = `https://www.instagram.com/`;

  const shareCopyLink = document.getElementById('shareCopyLink');
  if (shareCopyLink) {
    shareCopyLink.addEventListener('click', () => {
      navigator.clipboard.writeText(shopUrl).then(() => {
        const copyText = document.getElementById('copyLinkText');
        if (copyText) {
          copyText.textContent = 'Copied!';
          setTimeout(() => { copyText.textContent = 'Copy Link'; }, 2000);
        }
      });
    });
  }
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
