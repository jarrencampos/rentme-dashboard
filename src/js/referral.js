// referral.js
export function setReferralCookie() {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref) {
    document.cookie = `referral=${ref}; path=/; max-age=2592000`; // 30 days
  }
}

export function getReferralCookie() {
  const match = document.cookie.match(/(?:^|;) ?referral=([^;]*)/);
  return match ? match[1] : null;
}