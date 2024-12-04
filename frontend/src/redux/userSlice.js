// src/redux/userSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { userService } from '../services/userServices';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    purchases: [],
    loading: false,
    error: null,
    subscription: 'normal'
  },
  reducers: {
    setUser: (state, action) => {
      state.profile = action.payload;
      state.subscription = action.payload.subscription || 'normal';
      state.loading = false;
      state.error = null;
    },
    setPurchases: (state, action) => {
      state.purchases = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.profile = null;
      state.subscription = 'normal';
      state.purchases = [];
    }
  }
});

export const { setUser, setPurchases, setLoading, setError, logout } = userSlice.actions;
export default userSlice.reducer;

// Async action creators
export const fetchUserProfile = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const data = await userService.fetchProfile();
    dispatch(setUser(data));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const updateUserProfile = (profileData) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const updatedUser = await userService.updateProfile(profileData);
    dispatch(setUser(updatedUser));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const purchaseSubscription = (plan) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const updatedUser = await userService.purchaseSubscription(plan);
    dispatch(setUser(updatedUser));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const fetchPurchases = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const purchases = await userService.getPurchases();
    dispatch(setPurchases(purchases));
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await userService.logout();
    dispatch(logout());
  } catch (error) {
    dispatch(setError(error.message));
  }
};