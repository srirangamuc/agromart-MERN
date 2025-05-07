// src/services/userService.js
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
const BASE_URL = `${API_BASE_URL}/api/customer`; 
import getAuthHeaders from "./helper";

export const userService = {
  // Fetch user profile data
  async fetchProfile() {
    try {
        const response = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: getAuthHeaders(),
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
        console.log("Profile data is",profileData)
        const response = await fetch(`${BASE_URL}/update-profile`, {
            method: "POST",
            headers:getAuthHeaders(),
            body: JSON.stringify(profileData) // FormData object
        });

        console.log(response)

        if (!response.ok) {
            throw new Error(`Failed to update profile: ${await response.text()}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Error updating profile:", error);
        throw new Error("Failed to update profile");
    }
},

async updateProfilePicture(formData) {
  try {
    const response = await fetch(`${BASE_URL}/update-profile-picture`, {
      method: 'POST',
      // ❗ Don't manually set 'Content-Type' for FormData
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server error:', errorData);
      throw new Error('Failed to update profile picture');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating profile picture:', error);
    throw error;
  }
},

  // Handle other actions like purchasing subscriptions, etc.
  async purchaseSubscription(plan) {
    try {
      const response = await fetch(`${BASE_URL}/subscribe`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
