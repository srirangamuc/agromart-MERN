// services/vendorService.js
const BASE_URL = "http://localhost:5000/api/vendor"; // Base URL for vendor endpoints

class vendorService {
    // Add a new product
    static async addProduct(productData) {
        try {
            const response = await fetch(`${BASE_URL}/add-product`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    // Get products for the vendor
    static async getProducts() {
        try {
            const response = await fetch(`${BASE_URL}/products`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            return data.products; // Assuming the response contains an array of products
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    // Get the vendor dashboard data
    static async getVendorDashboard() {
        try {
            const response = await fetch(`${BASE_URL}/dashboard`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch vendor dashboard data');
            }

            const data = await response.json();
            return data; // Assuming the response contains vendor profile and products
        } catch (error) {
            console.error('Error fetching vendor dashboard:', error);
            throw error;
        }
    }

    // Update the vendor profile
    static async updateProfile(profileData) {
        try {
            console.log(profileData)
            const response = await fetch(`${BASE_URL}/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
    static async fetchProfile() {
        try {
          const response = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            credentials: 'include',
          });
          console.log(response)
    
          if (!response.ok) {
            throw new Error('Failed to fetch user profile');
          }
    
          return await response.json(); // Return profile data
        } catch (error) {
          console.error('Error fetching profile:', error.message);
          throw new Error('Failed to fetch profile. Please try again.');
        }
    }
    // Fetch profit data for the vendor
    static async getProfitData() {
        try {
            const response = await fetch(`${BASE_URL}/profit-data`, {
                method: 'GET',   
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profit data');
            }

            const data = await response.json();
            return data; // Assuming the response contains product names and profits
        } catch (error) {
            console.error('Error fetching profit data:', error);
            throw error;
        }
    }
    static async getVendorRating() {
        try {
            const response = await fetch(`${BASE_URL}/rating`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch vendor rating');
            }

            return await response.json(); // Returning average rating & count
        } catch (error) {
            console.error('Error fetching vendor rating:', error.message);
            throw new Error('Failed to fetch vendor rating. Please try again.');
        }
    }
}

export default vendorService;
