// js/dashboard.js - Dashboard functionality
import { db, collection, getDocs } from './firebase-config.js';
import { initAuthStateListener, getVendorData } from './auth-service.js';

async function getTotalProducts(uid) {
  try {
    const snap = await getDocs(collection(db, "vendors", uid, "products"));
    return snap.size;
  } catch (error) {
    console.error("Error fetching products:", error);
    return 0;
  }
}

async function displayUserInfo(userInfo, uid) {
  const totalSales = parseFloat(userInfo.total_sales || 0);
  const totalBookings = parseFloat(userInfo.total_bookings || 0);
  const avgSales = totalBookings === 0 ? 0 : totalSales / totalBookings;

  // Update DOM elements if they exist
  const viewsEl = document.getElementById('userTotalViews');
  const salesEl = document.getElementById('userTotalSales');
  const bookingsEl = document.getElementById('userTotalBookings');
  const productsEl = document.getElementById('userTotalProducts');

  if (viewsEl) viewsEl.textContent = `$${avgSales.toFixed(2)}`;
  if (salesEl) salesEl.textContent = `$${totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  if (bookingsEl) bookingsEl.textContent = totalBookings || '0';
  if (productsEl) {
    const count = await getTotalProducts(uid);
    productsEl.textContent = count;
  }
}

function initDashboard() {
  initAuthStateListener({
    redirectIfSignedOut: true,
    onSignedIn: async (user) => {
      const result = await getVendorData(user.uid);
      if (result.success) {
        displayUserInfo(result.data, user.uid);
      } else {
        console.log("No vendor profile found!");
      }
    }
  });
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
