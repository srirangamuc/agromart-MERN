const BASE_URL = 'http://localhost:5000/admin'; // Base route for admin endpoints

export const adminService = {
  async getDashboardData() {
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: 'GET',
        credentials: 'include',
      });
      console.log("Over here")
      if (!response.ok) throw new Error('Failed to fetch admin dashboard data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
      throw error;
    }
  },

  async getCustomerAnalysis() {
    try {
      const response = await fetch(`${BASE_URL}/customer-analysis`, {
        method: 'GET',
        credentials: 'include',
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
        credentials: 'include',
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
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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
