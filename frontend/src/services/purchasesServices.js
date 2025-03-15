const API_DISTRIBUTOR_URL = 'http://localhost:5000/api/distributor'; 
const API_VENDOR_URL = 'http://localhost:5000/api/vendor';  // ✅ Define vendor API URL

export const purchasesService = {
    rateDistributor: async (purchaseId, rating) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_DISTRIBUTOR_URL}/rate-distributor`, {  
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ purchaseId, rating }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to rate distributor');
            }

            return await response.json();
        } catch (error) {
            console.error('Error rating distributor:', error);
            throw error;
        }
    },

    // ✅ Fixed: Use API_VENDOR_URL instead of undefined API_URL
    rateVendor: async (purchaseId, vendorId, rating) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API_VENDOR_URL}/rate-vendor`, {  // ✅ Correct API URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ purchaseId, vendorId, rating }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to rate vendor');
            }

            return await response.json();
        } catch (error) {
            console.error('Error rating vendor:', error);
            throw error;
        }
    },

    getVendorRating: async (vendorId) => {
        try {
            const response = await fetch(`${API_VENDOR_URL}/rating/${vendorId}`, {  // ✅ Correct API URL
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch vendor rating');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching vendor rating:', error);
            throw error;
        }
    }
};
