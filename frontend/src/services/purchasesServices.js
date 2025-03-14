/*const API_BASE_URL = 'http://localhost:5000/api/distributor'; // Update this if needed

// This is updated even token is sent from frontend to backend
export const purchasesService = {
    rateDistributor: async (purchaseId, rating) => {
        try {
            const token = localStorage.getItem("token");  // Get token from storage

            const response = await fetch(`${API_BASE_URL}/rate-distributor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // ✅ Send token in header
                },
                body: JSON.stringify({ purchaseId, rating }),
                credentials: 'include'  // ✅ Ensure cookies are sent if needed
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


    // new Method regarding vendor
    rateVendor: async (purchaseId, vendorId, rating) => {
        try {
            const token = localStorage.getItem("token");  // Get token from localStorage

            const response = await fetch(`${API_BASE_URL}/rate-vendor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`  // ✅ Send token in header
                },
                body: JSON.stringify({ purchaseId, vendorId, rating }),
                credentials: 'include'  // ✅ Ensure cookies are sent if needed
            });

            if (!response.ok) {
                throw new Error('Failed to rate vendor');
            }

            return await response.json();
        } catch (error) {
            console.error('Error rating vendor:', error);
            throw error;
        }
    }

};*/

export const purchasesService = {
    rateDistributor: async (purchaseId, rating) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:5000/api/distributor/rate-distributor`, {  // ✅ Fixed URL
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

    // ✅ Fix: Use correct API Base URL for vendor rating
    rateVendor: async (purchaseId, vendorId, rating) => {
        try {
            const token = localStorage.getItem("token");
            console.log("Sending request to rate vendor:", purchaseId, vendorId, rating);

            const response = await fetch(`http://localhost:5000/api/vendor/rate-vendor`, {  // ✅ Fixed URL
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
    }
};


