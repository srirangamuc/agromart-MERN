const BASE_URL = 'http://localhost:5000/api/customer'; // Local development URL

export const cartServices = {
  // Fetch cart items for the user
  async fetchCart() {
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
  },

  // Delete an item from the cart
  async deleteFromCart(itemId) {
    try {
      const response = await fetch(`${BASE_URL}/delete-from-cart`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete item from cart: ${response.statusText}`);
      }

      const data = await response.json();
      return data; // Return the updated cart data after deletion
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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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
