import { loginSuccess, loginFailure } from '../redux/authSlice';
import getAuthHeaders from './helper'
// Base API URL
const API_URL = import.meta.env.VITE_BACKEND_URL;

// Login function
export const loginUser = async (email, password, dispatch) => {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: getAuthHeaders(), // Send cookies
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Invalid email or password');
        }

        dispatch(loginSuccess({ user: data.user, token: data.token }));
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };

    } catch (error) {
        dispatch(loginFailure({ error: error.message }));
        return { success: false, message: error.message };
    }
};

// Register function
export const registerUser = async (name, email, password, role, dispatch) => {
    try {
        const response = await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: getAuthHeaders(), // Send cookies
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {// Show Toast on Failure
            dispatch(loginFailure({ error: data.message || 'Failed to create account' }));
            return { success: false, message: data.message };
        }

        // Auto-login for customer or admin
        if (data.user.role === 'customer' || data.user.role === 'admin') {
            dispatch(loginSuccess({ user: data.user, token: data.token }));
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }

        return {
            success: true,
            user: data.user,
            role: data.user.role,
        };

    } catch (error) {
        dispatch(loginFailure({ error: error.message }));
        return { success: false, message: error.message };
    }
};
