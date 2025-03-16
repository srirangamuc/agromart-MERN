// src/services/userService.js
const BASE_URL = 'http://localhost:5000/api/customer'; // Update with your API URL

export const userService = {
  // Fetch user profile data
  async fetchProfile() {
    try {
        const response = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error.message);
        throw new Error('Failed to fetch profile. Please try again.');
    }
},

async updateProfile(profileData) {
    try {
        const response = await fetch(`${BASE_URL}/update-profile`, {
            method: "POST",
            credentials: "include",
            body: profileData, // FormData object
        });

        if (!response.ok) {
            throw new Error(`Failed to update profile: ${await response.text()}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error updating profile:", error);
        throw new Error("Failed to update profile");
    }
},




  // Handle other actions like purchasing subscriptions, etc.
  async purchaseSubscription(plan) {
    try {
      const response = await fetch(`${BASE_URL}/subscribe`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        throw new Error('Failed to purchase subscription');
      }

      return await response.json();
      
    } catch (error) {
      console.error('Error purchasing subscription:', error.message);
      throw new Error('Failed to purchase subscription. Please try again.');
    }
  },

  async logout() {
    try {
      const response = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error logging out:', error.message);
      throw new Error('Logout failed. Please try again.');
    }
  },

  async getPurchases() {
    try {
      const response = await fetch(`${BASE_URL}/purchases`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchases');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching purchases:', error.message);
      throw new Error('Failed to fetch purchases. Please try again.');
    }
  }
};
