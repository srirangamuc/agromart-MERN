import getAuthHeaders from "./helper";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
const BASE_URL = `${API_BASE_URL}/api/customer`; // Update with your API URL

export const productsService = {
  // Fetching the list of products
  async fetchProducts() {
    try {
      const response = await fetch(`${BASE_URL}/products`, {
        method: 'GET',
        headers:getAuthHeaders(), 
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      // Parse the response JSON and return the result
      const data = await response.json();
      console.log('Fetched products:', data);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Something went wrong while fetching products.');
    }
  },
  // new method to get vendors by item

  async getVendorsByItem(itemName) {
    try {
        const response = await fetch(`${BASE_URL}/vendors/${encodeURIComponent(itemName)}`, {
            method: 'GET', // If using cookies/session authentication
            headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error(`Failed to fetch vendors for ${itemName}`);

        const vendors = await response.json();

        // Filter out vendors where quantity is 0
        return vendors.filter(vendor => vendor.quantity > 0);

    } catch (error) {
        console.error('Error fetching vendor data:', error.message);
        throw error;
    }
},
  
// new method for add to cart 

async addToCart(itemId, vendorId, quantity) {
  try {
      const response = await fetch(`${BASE_URL}/add-to-cart`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ itemId, vendorId, quantity }),
      });

      const data = await response.json();
      console.log("Add to Cart Response:", data); // Log the response
      return data;
  } catch (error) {
      console.error('Error adding item to cart:', error);
      throw new Error('Something went wrong while adding the item to the cart.');
  }
},

  // Removing an item from the cart
  async removeFromCart(itemId, vendorId) {
    try {
        const response = await fetch(`${BASE_URL}/delete-from-cart`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ itemId, vendorId }), // Include vendorId for specific removal
        });

        if (!response.ok) {
            throw new Error('Failed to remove item from cart');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error removing item from cart:', error);
        throw new Error('Something went wrong while removing the item from the cart.');
    }
},

  // Checking out the cart
  async checkout(cartItems) {
    try {
      const response = await fetch(`${BASE_URL}/checkout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cartItems }),
      });

      if (!response.ok) {
        throw new Error('Failed to checkout');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw new Error('Something went wrong during checkout.');
    }
  },
};
