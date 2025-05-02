import { loginSuccess, loginFailure } from '../redux/authSlice';

// Base API URL
const API_URL = "http://localhost:5000";

// Login function
export const loginUser = async (email, password, dispatch) => {
    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include', // Ensure this is set to send cookies
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Invalid email or password");
        }

        const data = await response.json();
        dispatch(loginSuccess({ user: data.user, token: data.token }));
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
    } catch (error) {
        dispatch(loginFailure({ error: error.message }));
    }
};

// Register function
/*export const registerUser = async (name, email, password, role, dispatch) => {
    try {
        const response = await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role }),
        });

        // Check if the response is successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create account');
        }

        // Parse the response and dispatch success
        const data = await response.json();
        dispatch(loginSuccess({ user: data.user, token: data.token }));
        return data;
    } catch (error) {
        // Dispatch registration failure with the error message
        dispatch(loginFailure({ error: error.message }));
    }
};*/

export const registerUser = async (name, email, password, role, dispatch) => {
    try {
        const response = await fetch(`${API_URL}/api/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role }),
        });

        const data = await response.json();

        if (!response.ok) {
            dispatch(loginFailure({ error: data.message || 'Failed to create account' }));
            return { success: false, message: data.message };
        }

        // 🔑 Only login automatically if customer or admin
        if (data.user.role === 'customer' || data.user.role === 'admin') {
            dispatch(loginSuccess({ user: data.user, token: data.token }));
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

