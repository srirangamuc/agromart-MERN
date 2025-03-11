const BASE_URL = 'http://localhost:5000/api/customer'; // Update with your API URL

export const productsService = {
  // Fetching the list of products
  async fetchProducts() {
    try {
      const response = await fetch(`${BASE_URL}/products`, {
        method: 'GET',
        credentials: 'include', // This ensures that cookies are sent with the request
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
  async addToCart(itemId, quantity) {
    try {
      const response = await fetch(`${BASE_URL}/add-to-cart`, {
        method: 'POST',
        credentials: 'include', // Ensure the session is maintained
        headers: {
          'Content-Type': 'application/json', // Specify that we are sending JSON data
        },
        body: JSON.stringify({ itemId, quantity }), // Send item data in the request body
      });
      console.log("sent quantity",quantity)
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        console.error('Failed to add item to cart:', response.status, response.statusText);
        throw new Error('Failed to add item to cart');
      }

      // Parse the response JSON and return the result
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw new Error('Something went wrong while adding the item to the cart.');
    }
  },

  // Removing an item from the cart
  async removeFromCart(itemId) {
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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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
