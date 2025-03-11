const API_BASE_URL = 'http://localhost:5000/api/distributor'; // Update this if needed

export const purchasesService = {
    rateDistributor: async (purchaseId, rating) => {
        try {
            const response = await fetch(`${API_BASE_URL}/rate-distributor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ purchaseId, rating }),
            });

            if (!response.ok) {
                throw new Error('Failed to rate distributor');
            }

            return await response.json();
        } catch (error) {
            console.error('Error rating distributor:', error);
            throw error;
        }
    }
};
