const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const BASE_URL = `${API_BASE_URL}/api/customer`;

export const productsService = {
  // Fetching the list of products
  async fetchProducts() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      const response = await fetch(`${BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('Fetched products:', data);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Something went wrong while fetching products.');
    }
  },

  // Get vendors by item
  async getVendorsByItem(itemName) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      const response = await fetch(`${BASE_URL}/vendors/${encodeURIComponent(itemName)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`Failed to fetch vendors for ${itemName}`);
      }

      const vendors = await response.json();
      return vendors.filter(vendor => vendor.quantity > 0);
    } catch (error) {
      console.error('Error fetching vendor data:', error.message);
      throw error;
    }
  },

  // Add to cart
  async addToCart(itemId, vendorId, quantity) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      const response = await fetch(`${BASE_URL}/add-to-cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, vendorId, quantity }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to add item to cart');
      }

      const data = await response.json();
      console.log('Add to Cart Response:', data);
      return data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw new Error('Something went wrong while adding the item to the cart.');
    }
  },

  // Remove from cart
  async removeFromCart(itemId, vendorId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      const response = await fetch(`${BASE_URL}/delete-from-cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, vendorId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error('Failed to remove item from cart');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw new Error('Something went wrong while removing the item from the cart.');
    }
  },

  // Checkout
  async checkout(cartItems) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      const response = await fetch(`${BASE_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
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