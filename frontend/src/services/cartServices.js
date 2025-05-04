const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
const BASE_URL = `${API_BASE_URL}/api/customer`; // Local development URL
import getAuthHeaders from "./helper";

export const cartServices = {

  // Fetch cart items for the user
  // Add an item to the cart
  // Ensure this is correct

  async addToCart(itemName, vendorId, quantity) {
    try {
        const response = await fetch(`${BASE_URL}/add-to-cart`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ itemName, vendorId, quantity }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(`Failed to add item to cart: ${errorResponse.error || response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding item to cart:', error.message);
        throw new Error('Failed to add item to cart. Please try again.');
    }
},
  // Fetch cart items for the user
  /*async fetchCart() {
    try {
      const response = await fetch(`${BASE_URL}/get-cart`, {
        method: 'GET',
        credentials: 'include', // Ensure cookies are sent with request
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      const data = await response.json();
      return data; // Return the cart data from the response
    } catch (error) {
      console.error('Error fetching cart:', error.message);
      throw new Error('Failed to fetch cart. Please try again.');
    }
  },*/
  async fetchCart() {
    try {
        const response = await fetch(`${BASE_URL}/get-cart`, {
            method: 'GET',
            headers:getAuthHeaders()
        });

        const data = await response.json();
        console.log("Fetched Cart Data:", data); // Log the cart data
        return data;
    } catch (error) {
        console.error('Error fetching cart:', error.message);
        throw new Error('Failed to fetch cart. Please try again.');
    }
},

  // Delete an item from the cart
  async deleteFromCart(itemId, vendorId) {
    if (!itemId || !vendorId) {
        console.error("Invalid itemId or vendorId:", itemId, vendorId);
        throw new Error("Invalid request: itemId or vendorId is missing.");
    }
  
    try {
        const response = await fetch(`${BASE_URL}/delete-from-cart/${itemId}/${vendorId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
  
        if (!response.ok) {
            throw new Error(`Failed to delete item from cart: ${response.statusText}`);
        }
  
        return await response.json();
    } catch (error) {
        console.error('Error deleting from cart:', error.message);
        throw new Error('Failed to delete item from cart. Please try again.');
    }
  },

  // Checkout process with selected payment method
  async checkout(paymentMethod) {
    try {
      console.log("Calling checkout API with:", paymentMethod);
      const response = await fetch(`${BASE_URL}/checkout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentMethod }),
      });
  
      const responseBody = await response.text(); // Read response body
      console.log("Checkout Response:", response.status, responseBody);
  
      if (!response.ok) {
        throw new Error(`Checkout failed: ${response.statusText}, Response: ${responseBody}`);
      }
  
      return JSON.parse(responseBody);
    } catch (error) {
      console.error("Checkout Error:", error);
      throw new Error('Checkout failed. Please try again.');
    }
  }  
};
