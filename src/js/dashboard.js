// js/dashboard.js - Dashboard functionality
import { db, collection, getDocs, doc, getDoc } from './firebase-config.js';
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

async function getOrdersData(uid) {
  try {
    // Get order IDs from vendor's orders subcollection
    const vendorOrdersSnap = await getDocs(collection(db, "vendors", uid, "orders"));
    const orderIds = vendorOrdersSnap.docs.map(doc => doc.id);

    // Fetch actual order data from orders collection
    const orderPromises = orderIds.map(async (orderId) => {
      const orderDoc = await getDoc(doc(db, "orders", orderId));
      if (orderDoc.exists()) {
        return orderDoc.data();
      }
      return null;
    });

    const orders = (await Promise.all(orderPromises)).filter(o => o !== null);

    // Calculate total sales from amountTotal
    const totalSales = orders.reduce((sum, order) => {
      return sum + parseFloat(order.amountTotal || 0);
    }, 0);

    return { totalSales, totalOrders: orders.length };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { totalSales: 0, totalOrders: 0 };
  }
}

async function displayUserInfo(userInfo, uid) {
  const { totalSales, totalOrders } = await getOrdersData(uid);
  const avgSales = totalOrders === 0 ? 0 : totalSales / totalOrders;

  // Update DOM elements if they exist
  const viewsEl = document.getElementById('userTotalViews');
  const salesEl = document.getElementById('userTotalSales');
  const bookingsEl = document.getElementById('userTotalBookings');
  const productsEl = document.getElementById('userTotalProducts');

  if (viewsEl) viewsEl.textContent = `$${avgSales.toFixed(2)}`;
  if (salesEl) salesEl.textContent = `$${totalSales.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  if (bookingsEl) bookingsEl.textContent = totalOrders || '0';
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
