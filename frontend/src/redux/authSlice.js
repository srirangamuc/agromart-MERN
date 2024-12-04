import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    user: null,
    token: null,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
            console.log("State after loginSuccess:", state.user);
            console.log("Authentication Status:", state.isAuthenticated);
            console.log("User Role:", state.user?.role);
        },
        loginFailure: (state, action) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = action.payload.error;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = null;
        },
    },
});

export const { loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
