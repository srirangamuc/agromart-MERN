const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = `${API_BASE_URL}/api/admin`; // Base route for admin endpoints
import getAuthHeaders from "./helper"; // assumes this returns headers with Bearer token

export const adminService = {
  async getDashboardData() {
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch admin dashboard data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
      throw error;
    }
  },

  async fetchTopVendorEachYear() {
    try {
      const response = await fetch(`${BASE_URL}/top-vendor-each-year`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch top-vendor-each-year');
      return await response.json();
    } catch (error) {
      console.error('Error fetching top-vendor-each-year data:', error.message);
      throw error;
    }
  },

  async fetchTopItemEachYear() {
    try {
      const response = await fetch(`${BASE_URL}/top-item-each-year`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch top-item-each-year');
      return await response.json();
    } catch (error) {
      console.error('Error fetching top-item-each-year data:', error.message);
      throw error;
    }
  },

  async fetchUserCountsByCity() {
    try {
      const response = await fetch(`${BASE_URL}/users/city-counts`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch user counts by city');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user counts by city:', error.message);
      throw error;
    }
  },

  async fetchRatingsData() {
    try {
      const response = await fetch(`${BASE_URL}/ratings`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch ratings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching ratings:', error.message);
      throw error;
    }
  },

  async getRatedAndUnratedVendors() {
    try {
      const response = await fetch(`${BASE_URL}/rated-unrated`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch rated and unrated vendors');
      return await response.json();
    } catch (error) {
      console.error('Error fetching rated/unrated vendors:', error.message);
      throw error;
    }
  },

  async getVendorDetails(vendorId) {
    try {
      const response = await fetch(`${BASE_URL}/vendor-details`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorId }),
      });
      if (!response.ok) throw new Error('Failed to fetch vendor details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching vendor details:', error.message);
      throw error;
    }
  },

  async getCustomerAnalysis() {
    try {
      const response = await fetch(`${BASE_URL}/customer-analysis`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch customer analysis');
      return await response.json();
    } catch (error) {
      console.error('Error fetching customer analysis:', error.message);
      throw error;
    }
  },

  async getPurchasesAnalysis() {
    try {
      const response = await fetch(`${BASE_URL}/purchases-analysis`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch purchases analysis');
      return await response.json();
    } catch (error) {
      console.error('Error fetching purchases analysis:', error.message);
      throw error;
    }
  },

  async updatePurchaseStatus(purchaseId, status) {
    try {
      const response = await fetch(`${BASE_URL}/update-purchase-status`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purchaseId, status }),
      });
      if (!response.ok) throw new Error('Failed to update purchase status');
      return await response.json();
    } catch (error) {
      console.error('Error updating purchase status:', error.message);
      throw error;
    }
  },
};
